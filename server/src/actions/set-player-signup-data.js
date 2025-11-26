import { isEventStaffOrHasRole } from "../action-utils/action-permissions.js";
import { deAirtableRecord } from "../action-utils/action-utils.js";
import { dirtyID } from "shared";
import { log } from "../discord/slmngg-log.js";

const working = new Map();

function norm(text) {
    if (!text) return null;
    return text.toLowerCase().trim();
}

export default {
    key: "set-player-signup-data",
    requiredParams: ["eventID", "playerData", "useSignupData", "createPlayers"],
    auth: ["user"],
    /**
     * @param {AnyAirtableID} eventID
     * @param {object[]} allPlayerData
     * @param {boolean} useSignupData
     * @param {boolean} createPlayers
     * @param {ActionAuth["user"]} user
     * @returns {Promise<*[]>}
     */
    async handler({ eventID, playerData: allPlayerData, useSignupData, createPlayers }, { user }) {
        if (working.get(eventID)) throw { errorCode: 423, errorMessage: "Currently working on that event, try again later." };

        const event = await this.helpers.get(eventID);
        if (!event?.id) {
            throw {
                errorCode: 400,
                errorMessage: "Cannot find that event"
            };
        }
        if (!(await isEventStaffOrHasRole(user, event, null, ["Can edit any event"]))) {
            throw {
                errorCode: 403,
                errorMessage: "You don't have permission to get data for this event"
            };
        }

        if (!allPlayerData?.length) throw "No player data submitted";

        /** @type {DirtyAirtableID[]} */
        const eventTeamIDs = (event?.teams || []).map(id => dirtyID(id));

        const { players: limitedPlayers } = await this.helpers.get("internal:lookup-players");

        /*
        * Player signups processing
        * If useSignupData, use the new Signup Data table, linking event + player with this data
        *    Create or edit as needed
        * Otherwise, edit the player object itself
        *    Create the player objects if needed
        *
        * */

        let actionResponses = [];
        for (const playerData of allPlayerData) {
            /**
             * @type {Player}
             */
            let player;
            let actionResponse = {
                playerData,
                playerID: null,
                errors: [],
                fixes: []
            };
            if (playerData?.id) {
                player = await this.helpers.get(playerData?.id);
                console.log(player?.name, player?.id);
            }

            if (!player) {
                // lookup player here
                console.log("Looking up a player", {
                    discord_tag: playerData?.discord_tag,
                    battletag: playerData?.battletag,
                    discord_id: playerData?.discord_id,
                });
                // THESE PLAYERS ARE
                let tempPlayer = limitedPlayers.find(p => {
                    if (playerData?.discord_tag && norm(p.discord_tag) === norm(playerData?.discord_tag)) return true;
                    if (playerData?.battletag && norm(p.battletag) === norm(playerData?.battletag)) return true;
                    if (playerData?.discord_id && norm(p.discord_id) === norm(playerData?.discord_id)) return true;
                    return false;
                });
                console.log("Player after lookup", tempPlayer?.name, tempPlayer?.id);

                if (tempPlayer?.id) {
                    player = await this.helpers.get(tempPlayer.id);
                }

            }


            if (!player && createPlayers) {
                const airtablePlayerData = {
                    "Event Signups": [dirtyID(eventID)]
                };

                if (!useSignupData) {
                    if (playerData?.eligible_roles) airtablePlayerData["Eligible Roles"] = playerData.eligible_roles.split(", ").filter(Boolean);
                    if (playerData?.role) airtablePlayerData["Role"] = playerData.role;
                    if (playerData?.sr) airtablePlayerData["Manual SR"] = playerData.sr;
                    if (playerData?.tank_sr) airtablePlayerData["Composition Tank SR"] = playerData.tank_sr;
                    if (playerData?.dps_sr) airtablePlayerData["Composition DPS SR"] = playerData.dps_sr;
                    if (playerData?.support_sr) airtablePlayerData["Composition Support SR"] = playerData.support_sr;
                    if (playerData?.info_for_captains) airtablePlayerData["Draft Data"] = playerData.info_for_captains;
                }

                if (playerData?.name) {
                    airtablePlayerData["Name"] = playerData.name;
                } else {
                    // create a name
                    airtablePlayerData["Name"] = (playerData?.battletag?.split("#")?.[0] || playerData?.discord_tag?.replace(/[._]/g, "") || "").trim();
                }
                if (playerData?.discord_tag) airtablePlayerData["Discord Tag"] = playerData.discord_tag.replace("@", "").trim();
                // if (playerData?.discord_id) airtablePlayerData["Discord ID"] = playerData.discord_id;
                if (playerData?.battletag) airtablePlayerData["Battletag"] = playerData.battletag;
                if (playerData?.pronouns) airtablePlayerData["Pronouns"] = playerData.pronouns.toLowerCase().trim();
                if (playerData?.pronunciation) airtablePlayerData["Pronunciation"] = playerData.pronunciation;

                if (playerData.team_id) airtablePlayerData["Member Of"] = [dirtyID(playerData.team_id)];

                if (airtablePlayerData["Name"] && airtablePlayerData["Name"] !== "") {
                    console.log("Creating new player", airtablePlayerData);
                    const playerRecords = await this.helpers.createRecord("Players", airtablePlayerData);
                    if (playerRecords?.error) {
                        console.error(playerRecords.error.errorMessage);
                        actionResponse.errors.push(playerRecords.error.errorMessage);
                    } else {
                        player = deAirtableRecord(playerRecords?.[0]);
                        console.log("new player", player);
                        await log(`New player created by ${user.airtable.name}: ${player.name} ([SLMN.GG](<https://slmn.gg/player/${cleanID(player.id)}>)) • ([Airtable](<https://airtable.com/apppzANPbAht3LmAQ/tblO3W5VfEglaLwWC/viwQx4cbXGCoCAvzq/${player.id}>)) \n\`\`\`json\n${JSON.stringify(airtablePlayerData, null, 2)}\`\`\``);
                    }
                } else {
                    actionResponse.errors.push("No name for this player, won't create a new record");
                }
            }

            if (player) {
                actionResponse.playerID = player.id;
            }

            const playerUpdateData = {};

            if (useSignupData && player?.id) {
                let signupRecord;
                if (player?.signup_data) {
                    const records = await Promise.all(player.signup_data.map(d => this.helpers.get(d)));
                    signupRecord = records.find(r => dirtyID(r.event?.[0]) === dirtyID(eventID));
                }

                const airtableSignupData = {};

                [
                    {
                        signupDataKey: "eligible_roles",
                        airtableKey: "Eligible Roles",
                        data: playerData?.eligible_roles?.split(", ")?.filter(Boolean),
                    },
                    {
                        playerDataKey: "role",
                        signupDataKey: "main_role",
                        airtableKey: "Main Role",
                    },
                    {
                        signupDataKey: "sr",
                        airtableKey: "SR",
                    },
                    {
                        signupDataKey: "tank_sr",
                        airtableKey: "Tank SR",
                    },
                    {
                        signupDataKey: "support_sr",
                        airtableKey: "Support SR",
                    },
                    {
                        signupDataKey: "dps_sr",
                        airtableKey: "DPS SR",
                    },
                    {
                        signupDataKey: "info_for_captains",
                        airtableKey: "Info For Captains",
                    }
                ].forEach(({ signupDataKey, playerDataKey, airtableKey, data }) => {
                    data = data || playerData?.[playerDataKey || signupDataKey];
                    // if (!data) return;

                    if (signupRecord) {
                        // check if it matches existing data or not
                        // console.log(signupRecord);
                        if (signupRecord[signupDataKey] === data) return;
                        if (airtableKey === "Eligible Roles") {
                            if (JSON.stringify(signupRecord[signupDataKey]) === JSON.stringify(data)) return;
                        }
                    }

                    // custom override for single selects
                    if (["Main Role"].includes(airtableKey)) {
                        if (data === "") data = null;
                    }

                    airtableSignupData[airtableKey] = data;
                });
                console.log(player?.name, airtableSignupData);

                if (Object.keys(airtableSignupData)?.length) {
                    // data to update/create
                    if (signupRecord) {
                        // update
                        await this.helpers.updateRecord("Signup Data",  signupRecord,{
                            ...airtableSignupData
                        });
                    }
                    if (!signupRecord) {
                        // create
                        console.log("Creating signup data", airtableSignupData);
                        const newSignupRecords = await this.helpers.createRecord("Signup Data", {
                            Player: [dirtyID(player.id)],
                            Event: [dirtyID(eventID)],
                            ...airtableSignupData
                        });
                        if (newSignupRecords?.error) {
                            actionResponse.errors.push(newSignupRecords.error.errorMessage);
                        } else {
                            signupRecord = deAirtableRecord(newSignupRecords?.[0]);
                            console.log("signupRecord", signupRecord);
                            playerUpdateData["Signup Data"] = [
                                ...(player.signup_data || []),
                                dirtyID(signupRecord.id)
                            ];
                        }

                    }
                } else {
                    console.log("No updates for signup data");
                }

            } else {
                actionResponse.errors.push("Can't edit player profiles directly yet");
            }

            if (player) {
                if (!player.event_signups?.find(id => id === dirtyID(eventID))) {
                    playerUpdateData["Event Signups"] = [...(player.event_signups || []).map(id => dirtyID(id)), dirtyID(eventID)];
                }

                /*
                *  Players on team
                *   This system assumes a player is only on one team per event
                *
                *
                * - if team submitted, add player to team
                * - if on other teams, remove other teams
                * - if there is no change, don't add it to the update object
                *
                * */

                const dirtyRequestPlayerTeamID = dirtyID(playerData.team_id);

                let playerTeamIDs = [...(player.member_of || [])];


                if (dirtyRequestPlayerTeamID) {
                    if (!playerTeamIDs.includes(dirtyRequestPlayerTeamID)) {
                        console.log("adding requested team id", dirtyRequestPlayerTeamID);
                        playerTeamIDs.push(dirtyRequestPlayerTeamID);
                        console.log(playerTeamIDs);
                    }
                }

                const playerEventTeamIDs = playerTeamIDs.filter(id => eventTeamIDs.includes(id));
                if (dirtyRequestPlayerTeamID) {
                    // team set
                    if (playerEventTeamIDs.length > 1) {
                        // on too many teams
                        // remove others and set this one
                        console.log("on too many teams from this event", playerEventTeamIDs);
                        playerTeamIDs = [
                            ...playerTeamIDs.filter(id => !eventTeamIDs.includes(id)),
                            dirtyRequestPlayerTeamID
                        ];
                    } else {
                        // console.log("no processing (+) needed", playerEventTeamIDs);
                    }
                } else {
                    // team not set (removed)
                    if (playerEventTeamIDs.length > 0) {
                        // on an event team
                        // remove all
                        console.log("on teams from this event, removing", playerEventTeamIDs);
                        playerTeamIDs = playerTeamIDs.filter(id => !eventTeamIDs.includes(id));
                    } else {
                        // console.log("no processing (-) needed", playerEventTeamIDs);
                    }
                }
                // console.log("pre-processing", player.member_of);
                // console.log("post-processing", playerTeamIDs);

                if ((playerTeamIDs.length !== (player.member_of || []).length) || playerTeamIDs.some(id => !(player.member_of || []).includes(id))) {
                    console.log("post-processing", playerTeamIDs);
                    playerUpdateData["Member Of"] = playerTeamIDs.map(id => dirtyID(id));
                }

                const alwaysAllowedPlayerUpdate = [
                    { signupDataKey: "discord_tag", airtableKey: "Discord Tag", },
                    // { signupDataKey: "discord_id", airtableKey: "Discord ID", },
                    { signupDataKey: "battletag", airtableKey: "Battletag", },
                    { signupDataKey: "pronouns", airtableKey: "Pronouns", validation: (str) => str?.toLowerCase()?.trim() },
                    { signupDataKey: "pronunciation", airtableKey: "Pronunciation", },
                ];

                alwaysAllowedPlayerUpdate.forEach(({ signupDataKey, airtableKey, data, validation }) => {
                    data = data || playerData?.[signupDataKey];

                    if (validation) {
                        data = validation(data);
                    }
                    // console.log(airtableKey, data, playerData?.[signupDataKey]);

                    if (player[signupDataKey] === data) return;
                    if (!player?.[signupDataKey]) return; // both nullish

                    playerUpdateData[airtableKey] = data;
                });

                if (Object.keys(playerUpdateData)?.length) {
                    console.log(playerUpdateData);
                    await this.helpers.updateRecord("Players", player, playerUpdateData);
                }
            }
            actionResponses.push(actionResponse);
        }
        return actionResponses;
    }
};
