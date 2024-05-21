const { isEventStaffOrHasRole } = require("../action-utils/action-permissions");
const { MapObject } = require("../discord/managers");
const { getAll } = require("../action-utils/action-utils");
const client = require("../discord/client");
const { getDiscordIcon } = require("../discord/role-icon");
const { GuildFeature,
    ChannelType,
    PermissionFlagsBits
} = require("discord-api-types/v10");
const { PermissionsBitField,
} = require("discord.js");

function multiple(num, singular, plural) {
    if (num === 1) return num + " " + singular;
    return num + " " + plural;
}

const working = new Map();

module.exports = {
    key: "create-event-discord-items",
    requiredParams: ["guildID", "eventID", "teamSettings"],
    optionalParams: ["runSettings", "settings"],
    auth: ["user"],
    /***
     * @param {AnyAirtableID} eventID
     * @param {Snowflake} guildID
     * @param {string[]} teamSettings
     * @param {string[]} runSettings
     *
     * @param {{}} settings
     * @param {string[]} settings.textChannelRoles
     * @param {string[]} settings.voiceChannelRoles
     * @param {UserData} user
     * @returns {Promise<void>}
     */
    async handler({ eventID, guildID, teamSettings, runSettings, settings: {textChannelRoles, voiceChannelRoles} }, { user }) {
        if (working.get(eventID)) throw { errorCode: 423, errorMessage: "Currently working on that event, try again later." };

        console.log({ teamSettings, runSettings });

        try {
            const event = await this.helpers.get(eventID);
            if (!event) {
                throw {
                    errorCode: 400,
                    errorMessage: "Cannot find that event"
                };
            }
            working.set(eventID, true);

            if (!(await isEventStaffOrHasRole(user, event, null, ["Can edit any event"]))) {
                throw {
                    errorCode: 403,
                    errorMessage: "You don't have permission to edit this event"
                };
            }

            const guilds = ((await this.helpers.get("discord-guilds"))?.guilds) || [];
            if (!guildID && !guilds.find(guild => guild.id === guildID)) {
                throw {
                    errorCode: 400,
                    errorMessage: "Cannot find that guild"
                };
            }

            if (!teamSettings?.length) {
                throw {
                    errorCode: 501,
                    errorMessage: "Deleting items is not yet implemented"
                };
            }

            const eventControl = new MapObject(event?.discord_control);

            if (teamSettings.includes("create_roles")) eventControl.push("make_roles", true);
            // TODO: make_team_category_roles
            // TODO: category category
            if (teamSettings.includes("create_text_channels")) eventControl.push("make_channels", true);
            if (teamSettings.includes("create_voice_channels")) eventControl.push("make_voice_channels", true);

            /*
                set discord_control for settings here
                 */
            // Start discord stuff here

            const guild = client.guilds.resolve(guildID);
            if (!guild?.available) {
                throw {
                    errorCode: 400,
                    errorMessage: "Guild not found or unavailable"
                };
            }

            const responseCounts = {
                teamsProcessed: 0,
                rolesCreated: 0,
                teamsUpdated: 0,
                rolesEdited: 0
            };

            const fixes = [];


            let textCategory;
            if (eventControl.get("make_roles") && eventControl.get("make_channels")) {
                if (eventControl.get("team_category_id")) {
                    try {
                        textCategory = await guild.channels.fetch(eventControl.get("team_category_id"));
                    } catch (e) {
                        console.error(e);
                    }
                }
                if (!textCategory) {
                    try {
                        textCategory = await guild.channels.create({
                            type: ChannelType.GuildCategory,
                            name: `${event.name}`,
                            reason: `Creating text category for ${event.name}`
                        });
                        eventControl.push("team_category_id", textCategory.id);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            let voiceCategory;
            if (eventControl.get("make_roles") && eventControl.get("make_voice_channels")) {
                if (eventControl.get("team_voice_category_id")) {
                    try {
                        voiceCategory = await guild.channels.fetch(eventControl.get("team_voice_category_id"));
                    } catch (e) {
                        console.error(e);
                    }
                }
                if (!voiceCategory) {
                    try {
                        voiceCategory = await guild.channels.create({
                            type: ChannelType.GuildCategory,
                            name: `${event.name} VC`,
                            reason: `Creating voice category for ${event.name}`
                        });
                        eventControl.push("team_voice_category_id", voiceCategory.id);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            const teams = await getAll(event.teams);
            await Promise.all(teams.map(async (team, i) => {
                const theme = await this.helpers.get(team?.theme?.[0]);
                console.log(`[Discord-Automation] team ${i + 1}/${teams.length}`);
                const teamControl = new MapObject(team.discord_control);
                const starting = teamControl.textMap;

                if (eventControl.get("make_roles")) {
                    const role = {
                        name: team.name,
                        color: theme?.color_theme,
                        permissions: new PermissionsBitField()
                    };

                    let roleJustCreated = false;

                    if (theme && guild.features.includes(GuildFeature.RoleIcons)) {
                        role.icon = await getDiscordIcon(theme);
                    }
                    if (teamControl.get("role_id") && runSettings?.includes("delete_recreate_roles")) {
                        console.log("[Discord-Automation] deleting role", role);
                        try {
                            await guild.roles.delete(teamControl.get("role_id"), `Deleting and recreating roles for ${event.name}`);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    if (!teamControl.get("role_id") || runSettings?.includes("delete_recreate_roles")) {
                        console.log("[Discord-Automation] creating role", role);
                        try {
                            teamControl.push("role_id", (await guild.roles.create(role))?.id);
                            roleJustCreated = true;
                        } catch (e) {
                            console.error(e);
                        }
                        responseCounts.rolesCreated++;
                    }
                    if (runSettings?.includes("update_roles")) {
                        console.log("[Discord-Automation] updating role", role);
                        // update
                        try {
                            await guild.roles.edit(teamControl.get("role_id"), role);
                        } catch (e) {
                            console.error(e);
                        }
                        responseCounts.rolesEdited++;
                    }

                    // add to role

                    if (roleJustCreated || runSettings?.includes("update_roles")) {
                        const playersToAdd = await getAll([...new Set([
                            ...(team.players || []),
                            ...(team.captains || []),
                            ...(team.staff || [])
                        ])]);

                        await Promise.all(playersToAdd.map(async (player) => {
                            let member;

                            if (player.discord_id) {
                                try {
                                    member = await guild.members.fetch(player.discord_id);
                                    if (!member) {
                                        fixes.push({
                                            type: "discord_id_not_found",
                                            playerID: player.id,
                                            discordID: player.discord_id,
                                            teamID: team.id
                                        });
                                        console.warn(fixes[fixes.length - 1]);
                                    }
                                } catch (e) {
                                    console.error(e);
                                    fixes.push({
                                        type: "discord_id_not_found",
                                        playerID: player.id,
                                        discordID: player.discord_id,
                                        teamID: team.id
                                    });
                                    console.warn(fixes[fixes.length - 1]);
                                }
                            }

                            const tag = player.discord_tag.replace("@", "").trim();
                            if (!member && player.discord_tag) {
                                [member] = (await guild.members.fetch({
                                    query: tag,
                                    limit: 1,
                                })).values();

                                console.log({
                                    type: "player_search_results",
                                    discordID: member?.id,
                                    discordTag: member?.user?.username,
                                    tag: player.discord_tag
                                });
                            }

                            if (!member) {
                                fixes.push({
                                    type: "player_discord_not_found",
                                    playerID: player.id,
                                    discordID: player.discord_id,
                                    discordTag: player.discord_tag,
                                    teamID: team.id
                                });
                                console.warn(fixes[fixes.length - 1]);
                            }

                            if (member) {
                                // add role
                                try {
                                    await member.roles.add(teamControl.get("role_id"), `Team role for ${event.name}`);
                                    console.log("Role success", team.name, teamControl.get("role_id"), member.id, member.user.username, player.name);
                                } catch (e) {
                                    console.error(e);
                                    fixes.push({
                                        type: "player_role_error",
                                        playerID: player.id,
                                        discordID: player.discord_id,
                                        discordTag: player.discord_tag,
                                        teamID: team.id
                                    });
                                    console.warn(fixes[fixes.length - 1]);
                                }

                                if (member.id !== player.discord_id || member.user.username !== player.discord_tag) {
                                    await this.helpers.updateRecord("Players", player, {
                                        "Discord ID": member.id,
                                        "Discord Tag": member.user.username
                                    });

                                    fixes.push({
                                        type: "player_details_updated",
                                        playerID: player.id,
                                        discordID: player.discord_id,
                                        discordTag: player.discord_tag,
                                        teamID: team.id
                                    });
                                    console.warn(fixes[fixes.length - 1]);
                                }
                            }
                        }));
                    }
                }

                if (eventControl.get("make_roles") && eventControl.get("make_channels")) {
                    if (teamControl.get("text_channel_id") && runSettings.includes("delete_recreate_text_channels")) {
                        try {
                            await guild.channels.delete(teamControl.get("text_channel_id"));
                        } catch (e) {
                            console.error(e);
                        }
                        teamControl.push("text_channel_id", null);
                    }

                    if (!teamControl.get("text_channel_id") && textCategory) {
                        try {
                            const permissions = [
                                { id: teamControl.get("role_id"), allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]},
                                { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]}
                            ];
                            if (textChannelRoles?.length) {
                                textChannelRoles.split(/[, \n]/).forEach(id => {
                                    permissions.push({
                                        id: id.trim(),
                                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                                    });
                                });
                            }
                            const channel = await guild.channels.create({
                                parent: textCategory,
                                name: team.name,
                                type: ChannelType.GuildText,
                                permissionOverwrites: permissions
                            });
                            teamControl.push("text_channel_id", channel.id);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }

                if (eventControl.get("make_roles") && eventControl.get("make_voice_channels")) {
                    if (teamControl.get("voice_channel_id") && runSettings.includes("delete_recreate_voice_channels")) {
                        try {
                            await guild.channels.delete(teamControl.get("voice_channel_id"));
                        } catch (e) {
                            console.error(e);
                        }
                        teamControl.push("voice_channel_id", null);
                    }

                    if (!teamControl.get("voice_channel_id") && voiceCategory) {
                        try {
                            const permissions = [
                                { id: teamControl.get("role_id"), allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]},
                                { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]}
                            ];
                            if (voiceChannelRoles?.length) {
                                voiceChannelRoles.split(/[, \n]/).forEach(id => {
                                    permissions.push({
                                        id: id.trim(),
                                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                                    });
                                });
                            }
                            const channel = await guild.channels.create({
                                parent: voiceCategory,
                                name: team.name,
                                type: ChannelType.GuildVoice,
                                permissionOverwrites: permissions
                            });
                            teamControl.push("voice_channel_id", channel.id);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }


                if (starting !== teamControl.textMap) {
                    await this.helpers.updateRecord("Teams", team, {
                        "Discord Control": teamControl.textMap
                    });
                    responseCounts.teamsUpdated++;
                }
                responseCounts.teamsProcessed++;
            }));


            await this.helpers.updateRecord("Events", event, {
                "Discord Control": eventControl.textMap
            });

            return {
                status: [
                    multiple(responseCounts.teamsProcessed, "team processed", "teams processed"),
                    multiple(responseCounts.teamsUpdated, "team updated", "teams updated"),
                    multiple(responseCounts.rolesCreated, "role created", "roles created"),
                    multiple(responseCounts.rolesEdited, "role edited", "roles edited"),
                    multiple(fixes.length, "fix", "fixes"),
                ].join("\n"),
                fixes
            };
            // eslint-disable-next-line no-useless-catch
        } catch (e) {
            throw e;
        } finally {
            working.set(eventID, false);
        }
    },

};
