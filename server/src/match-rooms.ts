import {
    AuthUserData,
    Event,
    HeroResolvableID,
    Match,
    MatchMapResolvableID,
    MatchResolvableID,
    Player,
    PlayerResolvableID,
    Team,
    TeamResolvableID
} from "./types.js";

import { Server, Socket } from "socket.io";
import { Express, Request, Router } from "express";
import { get } from "./action-utils/action-cache.js";
import * as Cache from "./cache.js";
import { cleanID, createRecord, dirtyID, updateRecord } from "./action-utils/action-utils.js";
import { isEventStaffOrHasRole } from "./action-utils/action-permissions.js";
import { processPickBanOrder } from "./action-utils/ts-action-utils.js";

const ActiveRooms = new Map<MatchResolvableID, MatchRoom>();
let socketServer: Server;

type MatchRoomStates = null | "offline" | "started" | "collect-match-ready" | "collect-choice" | "prematch" | "premap" | "ingame" | "postmap" | "postmatch" | "complete" | "errored";
type MatchRoomCommand = "ready_up" | "unready" | "flip-pick-ban-order-choice" | "hero_draft:lock_hero" | "hero_draft:hover_hero" | "map_complete" | "staff:freeze" | "staff:unfreeze" | "staff:reset" | "staff:advance" | "staff:set_pick_ban_index" ;
type MatchRoomCommandData<C extends MatchRoomCommand> =
    C extends "ready_up" ? { teamID: TeamResolvableID } :
    C extends "unready" ? { teamID: TeamResolvableID } :
    C extends "flip-pick-ban-order-choice" ? { teamID: TeamResolvableID, flip: boolean } :
    C extends "hero_draft:lock_hero" ? { teamID: TeamResolvableID, heroID: HeroResolvableID } :
    C extends "hero_draft:hover_hero" ? { teamID: TeamResolvableID, heroID: HeroResolvableID } :
    C extends "staff:set_pick_ban_index" ? { index: number | string } :
    any;


type MatchRoomBaseStep = {
    type: string;
    [key: string]: any;
}
interface MatchRoomStepAction {
    by: (`${"recent" | "first"}_${"loser" | "winner" | "picker" | "banner"}` | "left" | "right" | "coinflip" | "team_1" | "team_2")[],
    for: "pick" | "choice"
}

type MatchRoomStep = MatchRoomBaseStep & (
    {
        type: "map-pick",
        action?: MatchRoomStepAction
    } |
    {
        type: "flip-pick-ban-order",
        action?: MatchRoomStepAction
    } |
    {
        type: "collect-ready"
    } |
    {
        type: "hero-draft",
        settings?: {
            pickAgnostic?: boolean,
            fearlessBans?: "team_previous_picks" | (string & unknown),
            protectFrom?: "team_previous_picks" | (string & unknown),
            mapSpecificOrder?: string[]
        }
    }
);
const MatchRoomStepOrder = [
    "prematch",
    "premap",
    "postmap",
    "postmatch",
] as const;
type MatchRoomConfig = {
    [K in typeof MatchRoomStepOrder[number]]?: MatchRoomStep[];
}
type MatchRoomSection = keyof MatchRoomConfig;

function addToMapArray<K extends string, D>(map: Map<K, D[]>, key: K, data: D, test?: (existingItem: D, newItem: D) => boolean) {
    if (map.has(key)) {
        if (!(map.get(key) || []).some(x => test ? test(x, data) : x === data)) {
            // not adding duplicates
            map.set(key, [...(map.get(key) || []), data]);
        }
    } else {
        map.set(key, [data]);
    }
}
function removeFromMapArray<K extends string, D>(map: Map<K, D[]>, key: K, data: D, test?: (existingItem: D, newItem: D) => boolean) {
    const existingData = map.get(key);
    if (!existingData) return;
    const adjusted = existingData.filter(x => test ? test(x, data) : x === data);

    if (adjusted.length === 0) {
        map.delete(key);
    } else {
        map.set(key, adjusted);
    }
}


class MatchRoom {
    private match: Match;
    // @ts-expect-error filled in try catch
    private config: MatchRoomConfig;
    // @ts-expect-error filled in try catch
    private event: Event;
    #state: MatchRoomStates;
    #frozen: boolean = false;
    private lastState: MatchRoomStates | null = null;
    private currentStep: MatchRoomBaseStep | null = null;
    private currentStepData: any;
    private currentSectionData: any;
    private ready: Set<TeamResolvableID> = new Set();


    private viewers: Map<PlayerResolvableID, Socket[]> = new Map();

    private currentStepAddress: { section: MatchRoomSection | null, index: number } = { section: null, index: 0 };

    constructor (event: Event, match: Match) {
        this.match = match;
        try {
            if (!match.match_room_config) throw new Error("No config for this match room");
            console.log(match.match_room_config);
            this.config = JSON.parse(match.match_room_config);

            this.event = event;
            this.#state = "started";

            console.log(`[match-room] ${this.id} started`);
            console.log("started", this.socketRoomID, !!socketServer);
            this.startupCatchup().then(() => {
                socketServer.to(this.socketRoomID).emit("match_room:started", this.id, 27);
                this.state = "collect-match-ready";
            });
        } catch (e) {
            console.error(e);
            this.#state = "errored";
            this.roomBroadcast("match_room:errored", { error: true, errorMessage: "JSON Match room failure" });
        }
    }

    get id() {
        return cleanID(this.match.id) as MatchResolvableID;
    }
    get socketRoomID() {
        return `match_room:${this.id}`;
    }
    set frozen(isFrozen: boolean) {
        this.#frozen = isFrozen;
        console.log("[match-room] frozen", this.id, isFrozen);
        this.roomBroadcast("match_room:frozen", isFrozen);
    }
    get frozen() {
        return this.#frozen;
    }
    set state(state: MatchRoomStates) {
        this.#state = state;
        console.log("[match-room] state", this.id, state);
        this.roomBroadcast("match_room:state", state);
    }
    get state() {
        return this.#state;
    }
    getCurrentStep() {
        if (!this.currentStepAddress.section) return null;
        return this.config[this.currentStepAddress.section]?.[this.currentStepAddress.index] || null;
    }
    async setCurrentStep(section: MatchRoomSection | null, index: number, forceEntryPoint: boolean) {
        if (section !== this.currentStepAddress.section ||  forceEntryPoint) await this.sectionEntryPoint(section);
        this.currentStepAddress.section = section;
        this.currentStepAddress.index = index;

        if (!this.currentStepAddress.section) {
            this.currentStep = null;
        } else {
            this.currentStep = this.config[this.currentStepAddress.section]?.[this.currentStepAddress.index] || null;
        }

        // @ts-expect-error strange string error it's fine
        this.currentStepData = await this.stepEntryPoint(this.currentStep);
        console.log(this.currentStepData);
        if (this.currentStepData?.skip) {
            await this.advanceToNextStep();
            return;
        }

        this.state = this.currentStepAddress.section;
        this.roomBroadcast("match_room:step_update", {
            address: this.currentStepAddress,
            step: this.currentStep,
            stepData: this.currentStepData,
            sectionData: this.currentSectionData
        });
        this.lastState = this.state;
    }

    async updateMatch() {
        this.match = await get(this.id);
        try {
            this.config = JSON.parse(this.match.match_room_config as string);
        } catch(e) {
            console.error(e);
        }
    }

    async advanceToNextStep() {
        let nextSection: MatchRoomSection = MatchRoomStepOrder[0];

        console.log("[match-room] advance to next", `current=${this.currentStepAddress.section}#${this.currentStepAddress.index}`);

        // TODO: deal with "if" conditions {{step.if}}

        if (this.currentStepAddress.section) {
            const currentSection = this.config[this.currentStepAddress.section];
            if (currentSection?.length) {
                // see if we have another one in this section
                const nextInSection = currentSection?.[this.currentStepAddress.index + 1];
                if (nextInSection != undefined) {
                    // yay we have it
                    const newIndex = this.currentStepAddress.index + 1;
                    console.log("[match-room] advance found", `next index=${newIndex}`);

                    return this.setCurrentStep(this.currentStepAddress.section, newIndex, false);

                }
                // need to go to next section
                if (MatchRoomStepOrder[MatchRoomStepOrder.length - 1] === this.currentStepAddress.section) {
                    // We're at the end --> go to finale
                    console.log("[match-room]", "complete (finished final section)");
                    return this.state = "complete";
                }
                const sectionIndex = MatchRoomStepOrder.indexOf(this.currentStepAddress.section);
                nextSection = MatchRoomStepOrder[sectionIndex + 1];


                // TODO: Deal with postmap/postmatch looping back to start again, only postmatch on 3-x
                if (nextSection) {
                    // check to see if we should be going here
                    console.log("checking if we should go back to the start or not next=", nextSection);
                    if (nextSection === "postmap") {
                        // should we be going here?
                        await this.updateMatch();

                        if ([this.match?.score_1 || 0, this.match?.score_2 || 0].some(x => x >= (this.match?.first_to || 2))) {
                            // match is complete! go to postmatch if we need to
                            nextSection = "postmatch";
                        } else {
                            // not yet complete, go back to premap if necessary
                            nextSection = "premap";
                        }
                    }
                    console.log("decision=", nextSection);
                }

            }
        }
        // not in a section (starting from 0) OR
        // moving on to another section

        // need to go to the next step or move on to the next section

        console.log("[match-room] looking for next section", `current=${this.currentStepAddress.section} next=${nextSection}`);
        let approve = false;
        for (const sectionKey of MatchRoomStepOrder) {
            if (sectionKey === nextSection) approve = true;
            if (!approve) {
                console.log("[match-room] skipping", sectionKey);
                continue;
            }
            const section = this.config[sectionKey];
            if (section?.length) {
                // found a section
                console.log("[match-room] found section", sectionKey);
                return this.setCurrentStep(sectionKey, 0, true);
            }
        }

        console.log("[match-room] fallthrough");
        return this.state = "complete";
    }

    async sectionEntryPoint(section: MatchRoomSection | null) {
        if (!section) return;
        this.currentSectionData = {};

        if (section === "premap") {
            console.log("Making a new map");

            const existingMap = this.currentSectionData.mapID ? await get(this.currentSectionData.mapID as MatchMapResolvableID) : null;
            console.log("checking existing map:", existingMap);

            if (!existingMap || existingMap?.map) {
                // TODO: Check if we need to create a new map - potentially can fill from pre-set map

                this.roomBroadcast("match_room:info", "Creating a new map...");
                const map = await createRecord(Cache, "Maps", [{
                    "Match": [dirtyID(this.id)]
                }], `match-rooms/${section}-entry-point`);
                if ("error" in map) {
                    throw "Airtable Error";
                }

                this.currentSectionData.mapID = map[0].id;
                console.log("new map created", map[0]);
                this.roomBroadcast("match_room:info", null);
            }
        }
    }

    async stepEntryPoint(step: MatchRoomStep | null) {
        if (!step) return null;

        const stepData = {
            actor: null as null | { teamID: TeamResolvableID, reason: MatchRoomStepAction["by"] | string },
            collect: null as string | null,
            rawPickBanOrder: null,
            pickBanOrder: null as any[] | null,
            pickBanIndex: 0,
        };

        if (step.type === "flip-pick-ban-order") {
            //
        }
        if (step.type === "collect-ready") {
            console.log("collect ready last=", this.lastState);
            if (this.lastState === "collect-match-ready" || !this.lastState) {
                // just got readies - move on
                return { skip: true };
            } else {
                this.ready.clear();
                this.roomBroadcast("match_room:ready", [...this.ready.keys()]);
            }
        }
        if (step.action) {
            // need to work out who has first action,
            stepData.actor = await this.getFirstActor(step);
            if (step.action.for === "choice") {
                stepData.collect = "choice";
            }
        }
        if (step.type === "hero-draft") {
            const map = await get(this.currentSectionData.mapID as MatchMapResolvableID);
            let order = step.order || this.match.pick_ban_order;
            if (step.settings?.mapSpecificOrder?.length) {
                const mapData = await Promise.all((this.match.maps || []).map(get));
                let number = 1;
                mapData.forEach(map => {
                    if (map.winner || map.draw) number++;
                });
                if (step.settings?.mapSpecificOrder?.[number - 1]) {
                    order = step.settings?.mapSpecificOrder?.[number - 1];
                }
            }
            stepData.rawPickBanOrder = order;
            stepData.pickBanOrder = processPickBanOrder(order, map.flip_pick_ban_order);
            stepData.pickBanIndex = 0;
        }

        return stepData;
    }

    setPickBanIndex(index: number) {
        this.currentStepData.pickBanIndex = index;
        this.roomBroadcast("match_room:pickBanIndex", index);
    }
    get currentPickBanStep() { return this.currentStepData?.pickBanOrder?.[this.currentStepData?.pickBanIndex]; }

    async getFirstActor(step: MatchRoomStep): Promise<{ teamID: TeamResolvableID, reason: MatchRoomStepAction["by"] | string } | null> {
        if (!step.action?.by?.length) return null;
        const mapData = await Promise.all((this.match.maps || []).map(get));

        for (const byElement of step.action.by) {

            if (byElement.startsWith("first_")) {
                for (const map of mapData) {
                    if (byElement === "first_winner" && map.winner) return { teamID: map.winner[0], reason: byElement };
                    if (byElement === "first_loser" && map.winner) {
                        const teamID = (this.match?.teams || []).find(teamID => map.winner && cleanID(teamID) !== cleanID(map.winner[0]));
                        if (teamID) return { teamID, reason: byElement };
                    }
                    if (byElement === "first_banner" && map.banner) return { teamID: map.banner[0], reason: byElement };
                    if (byElement === "first_picker" && map.picker) return { teamID: map.picker[0], reason: byElement };
                }
            }
            if (byElement.startsWith("recent_")) {
                for (const map of mapData.reverse()) {
                    if (byElement === "recent_winner" && map.winner) return { teamID: map.winner[0], reason: byElement};
                    if (byElement === "recent_loser" && map.winner) {
                        const teamID = (this.match?.teams || []).find(teamID => map.winner && cleanID(teamID) !== cleanID(map.winner[0]));
                        if (teamID) return { teamID, reason: byElement };
                    }
                    if (byElement === "recent_banner" && map.banner) return { teamID: map.banner[0], reason: byElement};
                    if (byElement === "recent_picker" && map.picker) return { teamID: map.picker[0], reason: byElement};
                }
            }
            if (byElement === "left" || byElement === "team_1") return { teamID: (this.match?.teams || [])[0], reason: byElement };
            if (byElement === "right" || byElement === "team_2") return { teamID: (this.match?.teams || [])[1], reason: byElement };
        }
        return null;
    }

    roomBroadcast(event: string, ...rest: any[]) {
        console.log("broadcasting", event);
        socketServer.to(this.socketRoomID).emit(event, this.id, ...rest, 45);
    }

    addViewer(id: PlayerResolvableID, socket: Socket) {
        addToMapArray(this.viewers, id, socket);
        // if (this.viewers.has(id)) {
        //     this.viewers.set(id, [...(this.viewers.get(id) || []), socket]);
        // } else {
        //     this.viewers.set(id, [socket]);
        // }
        this.updateSocketViewers();
    }

    removeViewer(id: PlayerResolvableID, socket: Socket) {
        removeFromMapArray(this.viewers, id, socket, (a, b) => a.id !== b.id);
        // const viewer = this.viewers.get(id);
        // if (!viewer) return;
        // const adjusted = viewer.filter(s => s.id !== socket.id);
        //
        // if (adjusted.length === 0) {
        //     this.viewers.delete(id);
        // } else {
        //     this.viewers.set(id, adjusted);
        // }
        this.updateSocketViewers();
    }

    private sempahores = new Set<MatchRoomCommand>();

    async handleRoomCommand<C extends MatchRoomCommand>(socket: Socket, player: Player, command: C, data: MatchRoomCommandData<C>) {
        const playerAuthStatus = await this.getAuthStatus(player);

        if (playerAuthStatus.staff && command === "staff:freeze") {
            this.frozen = true;
            return;
        } else if (playerAuthStatus.staff && command === "staff:unfreeze") {
            this.frozen = false;
            return;
        } else if (command === "staff:reset" && playerAuthStatus.staff) {
            this.state = "started";
            this.currentStepAddress = { section: null, index: 0 };
            this.currentStep = null;
            this.currentStepData = null;
            this.currentSectionData = null;
            this.lastState = null;
            this.ready.clear();
            this.roomBroadcast("match_room:step_update", {
                address: this.currentStepAddress,
                step: this.currentStep,
                stepData: this.currentStepData,
                sectionData: this.currentSectionData
            });
            this.roomBroadcast("match_room:ready", [...this.ready.keys()]);
            this.roomBroadcast("match_room:pickBanIndex", 0);

            this.state = "collect-match-ready";
            return;
        } else if (command === "staff:advance" && playerAuthStatus.staff) {
            await this.advanceToNextStep();
            return;
        } else if (command === "staff:set_pick_ban_index" && playerAuthStatus.staff) {
            this.setPickBanIndex(parseInt(data.index));
            return;
        }

        if (this.frozen) {
            return { error: true, errorMessage: "Match room is frozen" };
        }

        if ((this.state === "collect-match-ready" || this.currentStep?.type === "collect-ready") && command === "ready_up") {
            const teamID = data.teamID;
            if (!teamID) return { error: true, errorMessage: "No team ID" };
            if (!playerAuthStatus.teams.includes(cleanID(teamID))) return { error: true, errorMessage: "No permission" };

            this.ready.add(teamID);
            this.roomBroadcast("match_room:ready", [...this.ready.keys()]);
            await this.checkReadyStatus();

        } else if ((this.state === "collect-match-ready" || this.currentStep?.type === "collect-ready") && command === "unready") {
            const teamID = data.teamID;
            if (!teamID) return {error: true, errorMessage: "No team ID"};
            if (!playerAuthStatus.teams.includes(cleanID(teamID))) return {error: true, errorMessage: "No permission"};

            this.ready.delete(teamID);
            this.roomBroadcast("match_room:ready", [...this.ready.keys()]);
            await this.checkReadyStatus();
        } else if (command === "flip-pick-ban-order-choice") {
            const teamID = data.teamID;
            if (!teamID) return {error: true, errorMessage: "No team ID"};
            if (!playerAuthStatus.teams.includes(cleanID(teamID))) return {error: true, errorMessage: "No permission"};

            // set map on airtable

            if (this.currentSectionData.mapID) {
                const map = await get(this.currentSectionData.mapID as MatchMapResolvableID);
                if (map.flip_pick_ban_order !== data.flip) {
                    await updateRecord(Cache, "Maps", map, {
                        "Flip Pick Ban Order": !!data.flip
                    }, "match-rooms/flip-pick-ban-order-choice");
                }
                await this.advanceToNextStep();
            } else {
                console.error("No map has been created in this section");
            }
        } else if (command === "hero_draft:lock_hero" && this.currentStep?.type === "hero-draft") {
            if (this.sempahores.has(command)) return ({ error: true, errorMessage: "Handling hero lock, try again later" });

            this.sempahores.add(command);

            const hero = await get(data.heroID as HeroResolvableID);
            if (!hero || hero.__tableName !== "Heroes") {
                this.sempahores.delete(command);
                return {error: true, errorMessage: "Invalid hero"};
            }

            const teamID = data.teamID;
            if (!teamID) {
                this.sempahores.delete(command);
                return {error: true, errorMessage: "No team ID"};
            }
            // team permission
            if (!playerAuthStatus.teams.includes(cleanID(teamID))) return {error: true, errorMessage: "No permission"};
            // check if can act in order
            const pickBanTeamNum = this.currentPickBanStep?.team;
            console.log("[match-room]", this.currentPickBanStep);
            if (!pickBanTeamNum) {
                this.sempahores.delete(command);
                return {error: true, errorMessage: "Cannot pick ban as this team right now" };
            }
            if (
                (pickBanTeamNum === 1 && cleanID(this.match.teams?.[0]) === cleanID(teamID)) ||
                (pickBanTeamNum === 2 && cleanID(this.match.teams?.[1]) === cleanID(teamID))
            ) {
                // team 1 or 2, working
                const map = await get(this.currentSectionData.mapID as MatchMapResolvableID);

                const pb = this.currentPickBanStep.type === "pick" ? "Picks" : (this.currentPickBanStep.type === "protect" ? "Protects" : "Bans");
                const pbKey  = pb.toLowerCase() as "picks" | "protects" | "bans";

                const key: keyof typeof map = `team_${pickBanTeamNum as 1 | 2}_${pbKey}`;
                const airtableKey = `Team ${pickBanTeamNum} ${pb}`;
                const existing = map[key] || [];

                if (existing.some(id => dirtyID(id) === dirtyID(data.heroID))) {
                    this.sempahores.delete(command);
                    console.warn("duplicate hero", data.heroID);
                    return {error: true, errorMessage: "Duplicate hero ID"};
                }

                console.log("updating", airtableKey)

                await updateRecord(Cache, "Maps", map, {
                    [airtableKey]: [...existing, dirtyID(data.heroID)]
                }, "match-rooms/hero-draft:lock-hero");
            } else {
                console.warn("pick ban team number error", { pickBanTeamNum, teamID })
            }
            this.sempahores.delete(command);
            const nextIndex = this.currentStepData.pickBanIndex + 1;
            console.log("[match-room] index", this.currentStepData.pickBanIndex, "->", nextIndex);
            if (nextIndex >= this.currentStepData.pickBanOrder.length) {
                await this.advanceToNextStep();
            } else {
                this.setPickBanIndex(nextIndex);
            }
        } else if (command === "hero_draft:hover_hero") {
            const teamID = data.teamID;
            if (!teamID) return {error: true, errorMessage: "No team ID"};
            if (!playerAuthStatus.teams.includes(cleanID(teamID))) return {error: true, errorMessage: "No permission"};

            this.roomBroadcast("hero_draft:hero_hover", { teamID: data.teamID, heroID: data.heroID });
        } else if (this.state === "premap" && this.currentStep?.type === "go-to-game" && command === "map_complete") {
            if (!playerAuthStatus.team) return {error: true, errorMessage: "No permission"};
            await this.advanceToNextStep();
        } else {
            console.log("[match-room] handle room command", command, player?.name, playerAuthStatus, this.currentStep?.type, this.state);
            return { error: true, errorMessage: "Unknown command" };
        }

    }

    async checkReadyStatus() {
        if (!(this.state === "collect-match-ready" || this.currentStep?.type === "collect-ready")) return;
        const teams = await this.getTeams();

        const ready = teams.every(team => this.ready.has(cleanID(team.id)));
        if (ready) {
            await this.advanceToNextStep();
        }
    }

    updateSocketViewers() {
        console.log("[match-room] viewers", [...this.viewers.keys()]);
        this.roomBroadcast("match_room:viewers", [...this.viewers.keys()]);
    }

    async startupCatchup() {
        console.log("[match-room]", "startup catchup", this.id);
        const sockets = await socketServer.in(this.socketRoomID).fetchSockets();
        console.log("[match-room]", `contacting ${sockets.length} sockets`);
        // @ts-expect-error socket type mismatch (it's fine)
        await Promise.all(sockets.map(socket => this.handleSocketJoin(socket)));
    }

    async getTeams() {
        return await Promise.all((this.match.teams || []).map(t => get(t)));
    }


    async getControllableTeams(user: Player | PlayerResolvableID | AuthUserData) {
        const teams = await this.getTeams();
        return (teams || []).filter(team => [
            ...team.players || [],
            ...team.captains || [],
            ...team.staff || [],
            ...team.owners || [],
        ].some(personID => {
            let id;
            if (typeof user === "string") {
                id = user;
            } else if (typeof user === "object") {
                if ("id" in user) {
                    id = user.id;
                } else if ("airtableID" in user) {
                    id = user.airtableID;
                }
            }
            return cleanID(id) === cleanID(personID);
        }));
    }
    async getAuthStatus(user: Player | PlayerResolvableID | AuthUserData) {
        const status = {
            team: false,
            teams: [] as Team[],
            staff: false
        };
        const teams = await this.getControllableTeams(user);
        if (teams.length) {
            status.team = true;
            status.teams = teams.map(t => cleanID(t.id));
        }

        const editorPerm = await isEventStaffOrHasRole(user, this.event, null, ["Can edit any match", "Can edit any event"]);
        if (editorPerm) status.staff = true;
        return status;
    }

    async handleSocketJoin(socket: Socket) {
        // @ts-expect-error allowed under socket.io but a pain to type
        console.log("[match-room]", "socket join", socket.id, socket._token);
        socket.emit("match_room:join_ack", this.id);
        socket.emit("match_room:state", this.id, this.state);
        socket.emit("match_room:frozen", this.id, this.frozen);
        socket.emit("match_room:ready", this.id, [...this.ready.keys()]);
        socket.emit("match_room:step_update", this.id, {
            address: this.currentStepAddress,
            step: this.currentStep,
            stepData: this.currentStepData,
            sectionData: this.currentSectionData
        });

        // @ts-expect-error allowed under socket.io but a pain to type
        if (socket._token) {
            // @ts-expect-error allowed under socket.io but a pain to type
            const data: AuthUserData = await Cache.auth.getData(socket._token);
            const player = data?.user?.airtable;
            if (player?.id && player?.__tableName === "Players") {
                console.log("[match-room]", socket.id, player?.id, player?.name);
                // @ts-expect-error allowed under socket.io but a pain to type
                socket._player_id = player.id;
                this.addViewer(cleanID(player.id), socket);

                socket.on("match_room:room_command", async (id, roomCommand, data, callback) => {
                    if (!id || cleanID(id) !== this.id) return console.warn("[match-room] ignoring command", id, this.id, roomCommand); // not a command for this room to deal with
                    try {
                        const output = await this.handleRoomCommand(socket, player, roomCommand, data);
                        if (output) callback(output);
                    } catch (e) {
                        console.error(e);
                        // @ts-expect-error it might you never know
                        callback({ error: true, errorMessage: e?.errorMessage });
                    }
                });

                socket.on("disconnect", () => {
                    this.removeViewer(cleanID(player.id), socket);
                });
            }
        }
    }
}

function getToken(req: Request) {
    let header = req.headers.authentication;
    if (typeof header === "object") header = header[0];
    if (!header || !header.startsWith("Bearer ")) return null;

    const token = header.slice(("Bearer ").length);
    if (!token || token === "") return null;

    return token;
}

async function canInteractWithMatch(match: Match, player: Player) {
    if (!match?.id || !player?.id) return false;

    // admin access
    if ((player.website_settings || []).some(setting => ["Can edit any match", "Can edit any event"].includes(setting))) return true;

    const teams = await Promise.all((match.teams || []).map(m => get(m)));
    if (!teams.every(t => t?.id && t?.__tableName === "Teams")) {
        console.warn("Couldn't verify teams", teams);
        return false;
    }
    const controllableTeams = (teams || []).filter(team => [
        ...team.players || [],
        ...team.captains || [],
        ...team.staff || [],
        ...team.owners || [],
    ].some(personID => cleanID(player?.id) === cleanID(personID)));

    if (controllableTeams.length > 0) return true;

    // check event staff
    if (match.event?.[0]) {
        const event = await get(match.event?.[0]);
        if (!event?.id || event.__tableName !== "Events") return false;

        return (event.staff || []).some(personID => cleanID(player?.id) === cleanID(personID));
    }
    return false;
}


export default async ({ io, app, cors }: { io: Server, app: Express, cors: any }) => {
    try {
        socketServer = io;
        const router = Router();
        router.all("/*", cors());

        router.get("/active/:id", async (req, res) => {
            const id = req.params?.id as MatchResolvableID;
            if (!id) {
                res.status(400).json({error: true, errorMessage: "Match ID not found"});
                return;
            }

            const room = ActiveRooms.get(id);
            if (!room) {
                res.json({error: false, active: false, errorMessage: "No room matching that ID"});
                return;
            }

            res.json({error: false, active: true});
        });

        // @ts-expect-error it doesn't like returning things and not re-typing req,res but it's fine really
        router.post("/wake/:id", async (req, res) => {
            const token = getToken(req);
            if (!token) return res.status(401).send({error: true, errorMessage: "Unauthenticated"});

            const id = req.params?.id as MatchResolvableID;
            if (!id) return res.status(400).json({error: true, errorMessage: "Match ID not found"});

            const room = ActiveRooms.get(id);
            if (room) return res.status(400).json({error: true, errorMessage: "Room already awake"});

            const match = await get(id);
            if (!match?.id || match.__tableName !== "Matches") return res.status(400).json({
                error: true,
                errorMessage: "Invalid match ID"
            });

            if (!match.event?.[0]) return res.status(400).json({error: true, errorMessage: "Invalid event ID"});
            const event = await get(match.event?.[0]);
            if (!event?.id || event.__tableName !== "Events") return res.status(400).json({
                error: true,
                errorMessage: "Invalid event ID"
            });

            // check auth
            const user = (await Cache.auth.getData(token))?.user as (AuthUserData["user"] | null);
            if (!user?.airtable) return res.status(401).send({error: true, errorMessage: "Unauthenticated"});
            const player = user.airtable;

            if (!(await canInteractWithMatch(match, player))) return res.status(403).send({
                error: true,
                errorMessage: "You don't have permission to start this match room"
            });

            console.log(`[match-room] ${player?.name} waking ${match.id}`);
            ActiveRooms.set(id, new MatchRoom(event, match));
            return res.status(201).send({error: false});
        });

        io.on("connect", (socket) => {
            socket.on("match-room:join", (id) => {
                console.log(`[match-room] ${socket.id} attempting join ${id}`);
                id = cleanID(id);
                socket.join(`match_room:${id}`);

                const room = ActiveRooms.get(id);
                if (room) {
                    console.log(`[match-room] ${socket.id} joining ${id}`);
                    room.handleSocketJoin(socket);
                } else {
                    socket.emit("match_room:inactive", id);
                }
            });
        });


        app.use("/match-rooms", router);
    } catch (e) {
        console.error(e);
    }
};
