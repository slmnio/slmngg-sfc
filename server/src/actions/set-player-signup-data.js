const { isEventStaffOrHasRole } = require("../action-utils/action-permissions");
const { dirtyID,
    deAirtable,
} = require("../action-utils/action-utils");
const working = new Map();
module.exports = {
    key: "set-player-signup-data",
    requiredParams: ["eventID", "playerData", "useSignupData", "createPlayers"],
    auth: ["user"],
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

                const playerUpdateData = {};

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
                ];

                alwaysAllowedPlayerUpdate.forEach(({ signupDataKey, airtableKey, data }) => {
                    data = data || playerData?.[signupDataKey];

                    // console.log(airtableKey, data, playerData?.[signupDataKey]);

                    if (player[signupDataKey] === data) return;
                    if (!data && !player?.[signupDataKey]) return; // both nullish

                    playerUpdateData[airtableKey] = data;
                });

                if (Object.keys(playerUpdateData)?.length) {
                    await this.helpers.updateRecord("Players", player, playerUpdateData);
                }
            }

            if (!player && createPlayers) {
                const airtablePlayerData = {
                    "Event Signups": [dirtyID(eventID)]
                };

                if (!useSignupData) {
                    if (playerData?.eligible_roles) airtablePlayerData["Eligible Roles"] = playerData.eligible_roles.split(", ");
                    if (playerData?.role) airtablePlayerData["Role"] = playerData.role;
                    if (playerData?.sr) airtablePlayerData["Manual SR"] = playerData.sr;
                    if (playerData?.tank_sr) airtablePlayerData["Composition Tank SR"] = playerData.tank_sr;
                    if (playerData?.dps_sr) airtablePlayerData["Composition DPS SR"] = playerData.dps_sr;
                    if (playerData?.support_sr) airtablePlayerData["Composition Support SR"] = playerData.support_sr;
                    if (playerData?.info_for_captains) airtablePlayerData["Draft Data"] = playerData.info_for_captains;
                }

                if (playerData?.name) airtablePlayerData["Name"] = playerData.name;
                if (playerData?.discord_tag) airtablePlayerData["Discord Tag"] = playerData.discord_tag.replace("@", "").trim();
                // if (playerData?.discord_id) airtablePlayerData["Discord ID"] = playerData.discord_id;
                if (playerData?.battletag) airtablePlayerData["Battletag"] = playerData.battletag;

                if (playerData.team_id) airtablePlayerData["Member Of"] = [dirtyID(playerData.team_id)];

                if (playerData?.name) {
                    const playerRecords = await this.helpers.createRecord("Players", airtablePlayerData);
                    if (playerRecords?.error) {
                        actionResponse.errors.push(playerRecords.error.errorMessage);
                    } else {
                        player = deAirtable(playerRecords?.[0]);
                    }
                } else {
                    actionResponse.errors.push("No name for this player, won't create a new record");
                }
            }

            if (player) {
                actionResponse.playerID = player.id;
            }

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
                        data: playerData?.eligible_roles?.split(", "),
                    },
                    {
                        signupDataKey: "role",
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
                ].forEach(({ signupDataKey, airtableKey, data }) => {
                    data = data || playerData?.[signupDataKey];
                    console.log(airtableKey, data, signupRecord?.[signupDataKey]);
                    // if (!data) return;

                    if (signupRecord) {
                        // check if it matches existing data or not
                        console.log(signupRecord);
                        if (signupRecord[signupDataKey] === data) return;
                        if (airtableKey === "Eligible Roles") {
                            if (JSON.stringify(signupRecord[signupDataKey]) === JSON.stringify(data)) return;
                        }
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
                        const newSignupRecords = await this.helpers.createRecord("Signup Data", {
                            Player: [dirtyID(player.id)],
                            Event: [dirtyID(eventID)],
                            ...airtableSignupData
                        });
                        if (newSignupRecords?.error) {
                            actionResponse.errors.push(newSignupRecords.error.errorMessage);
                        }
                        signupRecord = deAirtable(newSignupRecords?.[0]);
                    }
                } else {
                    console.log("No updates for signup data");
                }

            } else {
                actionResponse.errors.push("Can't edit player profiles directly yet");
            }

            actionResponses.push(actionResponse);
        }
        return actionResponses;
    }
};