<template>
    <div class="settings-signup" :class="{'team-signups': team, 'event-signups': event}">
        <b-alert variant="warning" :model-value="true" dismissible>
            <p class="m-0"><b>This page is in beta.</b> Please be careful, as it gives you access to edit a lot of data at one time.</p>
            <p v-if="team" class="m-0">This page lists all players on the team. If they get removed, you can attach them from the event signups page.</p>
            <p v-if="event" class="m-0">This page lists all players who are signed up to the event. You can add or remove them from teams by changing their set team on the right.</p>
            <!--            To-do list:-->
            <!--            <ul>-->
            <!--                <li>Filtering by division/team category</li>-->
            <!--                <li>Keeping pasted data when loading player data</li>-->
            <!--                <li>Make it easier to see what data is saved or not, and what currently exists</li>-->
            <!--                <li>Work out a process for incoming data changes while you're working on it</li>-->
            <!--                <li>Add this table on individual team pages</li>-->
            <!--                <li>Reduce the chances of overwriting player names with feedback & logic</li>-->
            <!--            </ul>-->
            <!--            Current known issues:-->
            <!--            <ul>-->
            <!--                <li>It's not possible to change a player's name after they've been created</li>-->
            <!--                <li>Rows with unsaved data will be overwritten when hitting the <b>Find player data</b> button.<br>For batch processing, paste data > find player data & generate names > re-paste data</li>-->
            <!--            </ul>-->
        </b-alert>
        <div class="mb-2 d-flex flex-column gap-2">
            <b-form-checkbox v-model="usePlayerSignupData" disabled>Use extra signup data fields instead of editing players</b-form-checkbox>
        </div>
        <div class="editor">
            <div class="mb-2 d-flex flex-column">
                <b-form-checkbox v-model="customisation.useSplitSR" switch>Split SR by role</b-form-checkbox>
                <b-form-checkbox v-model="customisation.showAllSR" switch>Show all SR inputs</b-form-checkbox>
                <b-form-checkbox v-model="customisation.showNonCompetitive" switch>Show non-competitive information</b-form-checkbox>
            </div>
            <div class="mb-2 d-flex gap-2 justify-content-between">
                <div class="d-flex gap-2">
                    <b-button :variant="changed ? 'primary' : 'secondary'" @click="findPlayerData">
                        Find player data
                    </b-button>
                    <b-button @click="useBattletagNames">Generate names</b-button>
                </div>
                <div class="d-flex gap-2 align-items-center">
                    <div class="px-2">
                        {{ changeCount }} change{{ changeCount === 1 ? '' : 's' }}
                    </div>
                    <b-button variant="success" :disabled="processing.signupData" @click="setPlayerSignupData">
                        Save
                        player signup data
                    </b-button>
                </div>
            </div>
            <div class="hot-wrapper">
                <hot-table
                    ref="table"
                    class="hot-table w-100"
                    :data="data"
                    :col-headers="columnHeaders"
                    license-key="non-commercial-and-evaluation"
                    :columns="signupColumns"
                    :settings="tableOptions"
                    :before-change="beforeChange"
                    :read-only="processing.signupData"
                />
            </div>
            <div class="mt-2 d-flex gap-2 justify-content-end">
                <b-button variant="success" size="sm" @click="addRow"><i class="fas fa-fw fa-plus"></i> Add row to bottom</b-button>
            </div>
        </div>
    </div>
</template>

<script>
import { HotTable } from "@handsontable/vue3";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.css";
import Handsontable from "handsontable";
import { KeyValueSelectEditor, MultiSelectEditor } from "@/views/sub-views/event-settings/editor/multiSelectEditor";
import { sortAlphaRaw } from "@/utils/sorts";
import { authenticatedRequest } from "@/utils/dashboard";
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";
import { cleanID } from "@/utils/content-utils";
registerAllModules();
function empty(element) {
    let child;

    /* eslint-disable no-cond-assign */
    while (child = element.lastChild) {
        element.removeChild(child);
    }
}
function fastInnerText(element, content) {
    const child = element.firstChild;
    if (child && child.nodeType === 3 && child.nextSibling === null) {
        // fast lane - replace existing text node
        child.textContent = content;
    } else {
        // slow lane - empty element and insert a text node
        empty(element);
        element.appendChild(element.ownerDocument.createTextNode(content));
    }
}

Handsontable.cellTypes.registerCellType("multiselect", {
    editor: MultiSelectEditor,
    renderer: (instance, td, row, column, prop, value, cellProperties) => {
        // console.log("renderer", { instance, td, row, column, prop, value, cellProperties });

        const items = value?.split(/,\w*/g)?.map(t => t.trim());

        td.innerHTML = null;
        if (!items?.length) return;

        const container = document.createElement("div");
        container.className = "multiselect-container";

        items.sort(sortAlphaRaw).forEach(item => {
            const div = document.createElement("div");
            div.classList.add("multiselect-option");
            fastInnerText(div, item);
            div.dataset.item = item;
            container.appendChild(div);
        });
        // console.log(items);
        td.appendChild(container);
    },
    validator: (query, callback) => {
        try {
            const items = query?.split(/,\w*/g)?.map(t => t.trim());

            callback(true);
        } catch {
            callback(false);
        }
    },
    className: "multiselect-cell",
    allowInvalid: false,
});

Handsontable.cellTypes.registerCellType("keyvalueselect", {
    editor: KeyValueSelectEditor,
    renderer: (instance, td, row, column, prop, value, cellProperties) => {
        console.log("renderer", { instance, td, row, column, prop, value, cellProperties });
        fastInnerText(td, cellProperties.selectOptions.find(opt => opt.value === value)?.text || "");
    },
    className: "keyvalueselect-cell",
});


export default {
    name: "EventSettingsSignups",
    components: { HotTable },
    props: ["event", "team"],
    data: () => ({
        customisation: {
            useSplitSR: false,
            showAllSR: false,
            showNonCompetitive: false
        },


        usePlayerSignupData: true,
        createPlayers: true,
        changed: false,

        settings: {},
        processing: {},
        data: [],

        tableOptions: {
            fillHandle: {
                direction: "vertical",
                autoInsertRow: true
            },
            autoWrapRow: true,
            autoWrapCol: true,
            manualColumnMove: true,
            manualColumnResize: true,
            columnSorting: {
                sortEmptyCells: false,
                indicator: true,
                headerAction: true,
            },
            stretchH: "all",
            fixedColumnsStart: 2,
            renderAllRows: true
        }
    }),
    computed: {
        columnHeaders() {
            return this.signupColumns.map(col => col.header);
        },
        teamOptions() {
            if (this.team) {
                return [
                    "",
                    this.team?.name
                ];
            }
            return [
                "",
                (this._event?.teams || []).map(t => (t.name))
            ];
        },
        eventID() {
            return (this.event?._original_data_id || this.event?.id) || this.team?.event?.id;
        },
        _event() {
            return ReactiveRoot((this.event || this.team?.event)?.id, {
                "teams": ReactiveArray("teams", {
                    "players": ReactiveArray("players", {
                        "signup_data": ReactiveArray("signup_data")
                    })
                })
            });
        },
        eventSignups() {
            if (this.event) {
                if (!this.event?.draftable_players?.length) return [];
                return ((ReactiveArray("draftable_players", {
                    "member_of": ReactiveArray("member_of"),
                    "signup_data": ReactiveArray("signup_data")
                })(this.event)) || []).map(player => ({
                    ...player,
                    this_event_signup_data: (player.signup_data || []).find(data => cleanID(data?.event?.[0]) === cleanID(this.eventID)),
                    this_event_teams: (player.member_of || []).filter(team => cleanID(team?.event?.[0]) === cleanID(this.eventID)),
                }));
            } else if (this.team) {
                if (!this.team?.players?.length) return [];

                return ((ReactiveArray("players", {
                    "member_of": ReactiveArray("member_of"),
                    "signup_data": ReactiveArray("signup_data")
                })(this.team)) || []).map(player => ({
                    ...player,
                    this_event_signup_data: (player.signup_data || []).find(data => cleanID(data?.event?.[0]) === cleanID(this.eventID)),
                    this_event_teams: (player.member_of || []).filter(team => cleanID(team?.event?.[0]) === cleanID(this.eventID)),
                }));
            }
            return [];
        },
        signupColumns() {
            const cols = [];

            cols.push({
                header: "Actions",
                data: "status",
                readOnly: true
            });
            cols.push({ header: "Player", data: "player", readOnly: true });
            cols.push({ header: "Player ID", data: "id", renderer: "diffchecker" });
            cols.push({ header: "Name", data: "name", renderer: "diffchecker" });
            cols.push({ header: "Discord Tag", data: "discord_tag", renderer: "diffchecker" });
            cols.push({ header: "Battletag", data: "battletag", renderer: "diffchecker" });
            cols.push({ type: "select", selectOptions: ["Tank", "DPS", "Support", "Flex"], header: "Main Role", data: "role" });
            if (this.customisation.showNonCompetitive) {
                cols.push({ header: "Pronouns", data: "pronouns", renderer: "diffchecker" });
                cols.push({ header: "Pronunciation", data: "pronunciation", renderer: "diffchecker" });
            }
            cols.push({ header: "Info For Captains", data: "info_for_captains", renderer: "diffchecker" });

            if (this.customisation.useSplitSR || this.customisation.showAllSR) {
                cols.push({ header: "Tank SR", data: "tank_sr", renderer: "diffchecker" });
                cols.push({ header: "DPS SR", data: "dps_sr", renderer: "diffchecker" });
                cols.push({ header: "Support SR", data: "support_sr", renderer: "diffchecker" });
            }

            if (!this.customisation.useSplitSR || this.customisation.showAllSR) {
                cols.push({ header: "SR", data: "sr", renderer: "diffchecker" });
            }

            cols.push({ type: "multiselect", selectOptions: ["Tank", "DPS", "Support"], header: "Eligible Roles", data: "eligible_roles" });
            cols.push({ type: "select", renderer: "select-diff", header: "Team", data: "team_name", selectOptions: this.teamOptions });
            cols.push({ header: "Team ID", data: "team_id", readOnly: true, renderer: "diffchecker" });
            return cols;
        },
        tablePlayers() {
            return (ReactiveArray("players")({
                players: (this.data || []).map(row => row?.id).filter(Boolean)
            }));
        },
        dataPlayers() {
            return (this.data || []).map(row => this.tablePlayers.find(p => cleanID(p.id) === cleanID(row.id)));
        },
        rowStatus() {
            return this.data.map((row, i) => {
                const player = this.eventSignups?.[i];
                let teamMembership = "";
                let playerStatus = "";

                // console.log(row);
                if (!(row.id || row.name)) {
                    return "Need name or player";
                }

                if (this.isDifferent("team_name", row.team_name, { row: i })) {
                    if (player?.this_event_teams?.[0]?.name && !row.team_name) {
                        teamMembership = "Will remove from team";
                    } else if (!player?.this_event_teams?.[0]?.name && row.team_name) {
                        teamMembership  = "Will add to team";
                    }
                }
                if (this.team && !row.team_name && !teamMembership) {
                    teamMembership = "Will not add to team";
                }
                if (this.isDifferent("player_id", row.id, { row: i })) {
                    const oldID = cleanID(player?.id);
                    const newID = cleanID(row?.id);
                    console.log("player id", { oldID, newID });
                    if (!oldID && newID) {
                        // ID added
                        playerStatus = "Link existing player";
                    } else if (oldID && !newID) {
                        // ID removed
                        // playerStatus  = "added";
                    }
                }
                if (this.isDifferent("name", row.name, { row: i })) {
                    const oldName = player?.name;
                    const newName = row?.name;
                    console.log("player name", { oldName, newName });
                    if (!oldName && newName) {
                        // name added
                        if (row?.id) {

                        } else {
                            playerStatus = "Create new player";
                        }
                    } else if (oldName && !newName) {
                        // name removed
                        // playerStatus  = "added";
                    }
                }


                return [teamMembership, playerStatus].filter(Boolean).join(" / ");

                // for (const rowKey in row) {
                //     if (["player", "status"].includes(rowKey)) continue;
                //     const value = row[rowKey];
                //     if (this.isDifferent(rowKey, value, { row: i })) {
                //         return `Change: ${rowKey}`;
                //     }
                // }
            });
        },
        changeCount() {
            return this.rowStatus.filter(Boolean).length;
        }
    },
    methods: {
        beforeChange(changes, source) {
            this.changed = true;
            console.log("changes", changes, source);
            for (let i = 0; i < changes.length; i++){
                // console.log(changes[i]);

                //             3 -> new val
                if (changes[i][3]?.includes("Damage")) changes[i][3] = changes[i][3].replace("Damage", "DPS");

                //             1 -> prop that changed
                if (changes[i][1] === "team_name") {
                    const teamID = (this._event?.teams || []).find(t => t.name === changes[i][3])?.id;
                    if (teamID) {
                        changes.push([changes[i][0], "team_id", null, teamID]);
                    } else {
                        changes.push([changes[i][0], "team_id", null, ""]);
                    }
                }
            }
        },
        async findPlayerData() {
            // send discord tag, battletag, name
            // get player ID back

            try {
                const {
                    data,
                    error
                } = await authenticatedRequest("actions/find-player-data", {
                    eventID: this.eventID,
                    playerData: this.data.map(p => ({
                        id: cleanID(p.id),
                        name: p.name,
                        battletag: p.battletag,
                        discord_tag: p.discord_tag,
                        discord_id: p.discord_id,
                    }))
                });

                (data || []).forEach((player, i) => {
                    if (!player) return;
                    this.data[i].id = cleanID(player.id);
                });

                console.log({
                    data,
                    error
                });
            } finally {
                this.changed = false;
            }
        },
        useBattletagNames() {
            this.data.forEach((row, i) => {
                if (row.name) return;

                row.name = row.player || (row.battletag?.split("#")?.[0] || row.discord_tag?.replace(/[._]/g, "") || "").trim();
            });
        },
        async setPlayerSignupData() {
            try {
                this.processing.signupData = true;
                const {
                    data,
                    error
                } = await authenticatedRequest("actions/set-player-signup-data", {
                    eventID: this.eventID,
                    playerData: this.data,
                    useSignupData: this.usePlayerSignupData,
                    createPlayers: this.createPlayers
                });
                console.log({
                    data,
                    error
                });

                data.forEach((p, i) => {
                    if (p.playerID) {
                        this.data[i].id = cleanID(p.playerID);
                    }
                });

            } finally {
                this.processing.signupData = false;
            }
        },
        loadFromDraftablePlayers(players) {
            players.forEach((player, i) => {
                // console.log(player, player.this_event_signup_data);

                if (!this.data[i]) this.data[i] = {};

                this.data[i].id = cleanID(player.id);
                this.data[i].name = player.name;
                this.data[i].discord_tag = player.discord_tag;
                this.data[i].battletag = player.battletag;
                this.data[i].pronouns = player.pronouns;
                this.data[i].pronunciation = player.pronunciation;

                if (player.this_event_teams?.length) {
                    this.data[i].team_id = player.this_event_teams?.[0]?.id;
                    this.data[i].team_name = player.this_event_teams?.[0]?.name;
                }

                if (this.usePlayerSignupData) {
                    // use player.signup_data that matches this event
                    if (player.this_event_signup_data) {
                        this.data[i].eligible_roles = player.this_event_signup_data.eligible_roles?.join(", ");
                        this.data[i].role = player.this_event_signup_data.main_role;
                        this.data[i].sr = player.this_event_signup_data.sr;
                        this.data[i].tank_sr = player.this_event_signup_data.tank_sr;
                        this.data[i].dps_sr = player.this_event_signup_data.dps_sr;
                        this.data[i].support_sr = player.this_event_signup_data.support_sr;
                        this.data[i].info_for_captains = player.this_event_signup_data.info_for_captains;
                    }
                } else {
                    // use player data
                    this.data[i].sr = player.manual_sr;

                    this.data[i].eligible_roles = player.eligible_roles?.join(", ");
                    this.data[i].role = player.role;
                    this.data[i].sr = player.sr;
                    this.data[i].tank_sr = player.composition_tank_sr;
                    this.data[i].dps_sr = player.composition_dps_sr;
                    this.data[i].support_sr = player.composition_support_sr;
                    this.data[i].info_for_captains = player.draft_data;
                }
            });
        },
        addRow() {
            this.$refs.table?.hotInstance?.alter("insert_row_below");
            this.$refs.table.$el?.querySelector(".wtHolder")?.scroll({
                top: 100000000,
                behavior: "instant"
            });
            if (this.team) {
                this.data[this.data.length - 1].team_id = cleanID(this.team.id);
                this.data[this.data.length - 1].team_name = cleanID(this.team.name);
            }
        },
        isDifferent(prop, value, cellProperties) {
            const index = cellProperties?.row;
            const player = this.eventSignups?.[index];

            const dataOverrides = {
                "sr": this.usePlayerSignupData ? player?.this_event_signup_data?.sr : player?.manual_sr,
                "support_sr": this.usePlayerSignupData ? player?.this_event_signup_data?.support_sr : player?.composition_support_sr,
                "tank_sr": this.usePlayerSignupData ? player?.this_event_signup_data?.tank_sr : player?.composition_tank_sr,
                "dps_sr": this.usePlayerSignupData ? player?.this_event_signup_data?.dps_sr : player?.composition_dps_sr,
                "eligible_roles": this.usePlayerSignupData ? player?.this_event_signup_data?.eligible_roles?.join(", ") : player?.eligible_roles?.join(", "),
                "role": this.usePlayerSignupData ? player?.this_event_signup_data?.main_role : player?.role,
                "info_for_captains": this.usePlayerSignupData ? player?.this_event_signup_data?.info_for_captains : player?.draft_data,
                "team_id": player?.this_event_teams?.[0]?.id,
                "team_name": player?.this_event_teams?.[0]?.name
            };

            const oldVal = (Object.keys(dataOverrides).includes(prop) ? dataOverrides?.[prop] : player?.[prop]);
            return (oldVal !== value && !(!oldVal && !value));
        }
    },
    watch: {
        dataPlayers: {
            immediate: true,
            deep: true,
            handler(players) {
                players.forEach((player, i) => {
                    if (player && cleanID(this.data[i]?.id) === cleanID(player?.id)) {
                        // console.log("set player", i, player.name);
                        this.data[i].player = player.name;
                        // check for manually entered data
                        let oldTeamID = this.data[i]?.team_id;
                        let newTeamID = cleanID((player.member_of || []).find(teamID => (this._event?.teams || []).find(team => cleanID(team?.id) === cleanID(teamID))));

                        if (!(oldTeamID && !newTeamID)) {
                            this.data[i].team_id = newTeamID;
                            this.data[i].team_name = (this._event?.teams || []).find(team => cleanID(team?.id) === cleanID(this.data[i].team_id))?.name;
                        }
                    } else {
                        this.data[i].player = null;
                    }
                });
            }
        },
        eventSignups: {
            immediate: true,
            deep: true,
            handler(signupPlayers) {
                console.log("signups players", signupPlayers, this._event);
                this.loadFromDraftablePlayers(signupPlayers);
            }
        },
        usePlayerSignupData: {
            immediate: true,
            handler() {
                this.loadFromDraftablePlayers(this.eventSignups);
            }
        },
        rowStatus: {
            deep: true,
            immediate: true,
            handler(statuses) {
                statuses.forEach((status, i) => {
                    if (this.data[i]?.status !== status) {
                        this.data[i].status = status;
                    }
                });
            }
        }
    },
    beforeMount() {
        Handsontable.renderers.registerRenderer("diffchecker", (instance, td, row, column, prop, value, cellProperties) => {
            if (this.isDifferent(prop, value, cellProperties)) {
                td.classList.add("diff");
            }
            fastInnerText(td, value ?? "");
        });
        Handsontable.renderers.registerRenderer("select-diff", (instance, td, row, column, prop, value, cellProperties) => {
            if (this.isDifferent(prop, value, cellProperties)) {
                td.classList.add("diff");
            }
            return Handsontable.renderers.SelectRenderer(instance, td, row, column, prop, value, cellProperties);
        });
    },
    mounted() {
        const ctx = this.$refs.table?.hotInstance?.getShortcutManager().getContext("grid");
        ctx.removeShortcutsByKeys(["shift", "enter"]);
        ctx?.addShortcut({
            group: "slmngg",
            keys: [["shift", "enter"]],
            stopPropagation: true,
            preventDefault: true,
            callback: () => {
                console.log(...arguments);
                this.addRow();
            }
        });
    },
};
</script>

<style scoped>

.hot-table:deep(.multiselect-option) {
    display: inline-block;
    background-color: rgba(0,0,0,0.5);
    color: white;
    padding: 0 .5em;
    border-radius: .75em;
    line-height: 1.25em;
}
.hot-table:deep(.multiselect-container) {
    display: flex;
    gap: .2em;
    align-items: center;
    height: 100%;
}

.hot-table:deep(.multiselect-option[data-item="Support"]) {
    background-color: #ffeab6;
    color: black;
}
.hot-table:deep(.multiselect-option[data-item="Tank"]) {
    background-color: #c4ecff;
    color: black;
}
.hot-table:deep(.multiselect-option[data-item="DPS"]) {
    background-color: #ffd4e0;
    color: black;
}
.hot-table:deep(.ht_master) {
    background: white;
}
.hot-table:deep(.diff) {
    background-color: #66D9FF80;
}

/*.editor {*/
/*    position: sticky !important;*/
/*    top: 200px;*/
/*    max-height: 100vh;*/
/*}*/
/*.hot-wrapper {*/
/*    overflow: hidden;*/
/*    height: calc(100% - 200px);*/
/*}*/
/*.settings-signup {*/
/*    position: relative;*/
/*}*/
.event-signups .hot-wrapper {
    overflow: hidden;
    height: max(800px, 75vh);
    resize: vertical;
}
.team-signups .hot-wrapper {
    overflow: hidden;
    min-height: 300px;
    resize: vertical;
}
.hot-table:deep(.ht_clone_left),
.hot-table:deep(.ht_clone_bottom_left_corner),
.hot-table:deep(.ht_clone_top_left_corner) {
    border-right: 2px solid rgba(0,0,0,0.4);
}
</style>
