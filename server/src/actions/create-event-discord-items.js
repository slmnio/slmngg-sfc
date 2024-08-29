const { isEventStaffOrHasRole } = require("../action-utils/action-permissions");
const { MapObject } = require("../discord/managers");
const { getAll,
    findMember
} = require("../action-utils/action-utils");
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
/**
 *
 * @typedef { "edit_roles" | "assign_roles" | "unassign_roles" | "create_roles" | "delete_roles" | "delete_text_channels" | "create_text_channels" | "edit_text_channels" | "update_text_channels_permissions" | "delete_voice_channels" | "create_voice_channels" | "edit_voice_channels" | "update_voice_channels_permissions" } ActionKey
 * */
module.exports = {
    key: "create-event-discord-items",
    requiredParams: ["guildID", "actions", "eventID"],
    optionalParams: ["settings"],
    auth: ["user"],
    /***
     * @param {AnyAirtableID} eventID
     * @param {Snowflake} guildID
     *
     *
     * @param {ActionKey[]} actions
     * @param {{}} settings
     * @param {{}} settings.textChannels
     * @param {Snowflake[]} settings.textChannels.accessRoleIDs
     * @param {Snowflake[]} settings.voiceChannels.viewRoleIDs
     * @param {Snowflake[]} settings.voiceChannels.connectRoleIDs
     * @param {UserData} user
     * @returns {Promise<void>}
     */
    async handler({ eventID, guildID, actions, settings }, { user }) {
        if (working.get(eventID)) throw { errorCode: 423, errorMessage: "Currently working on that event, try again later." };

        if (!client?.guilds) {
            throw {
                errorCode: 500,
                errorMessage: "Discord service is not available"
            };
        }

        console.log({ actions, settings });

        try {
            const event = await this.helpers.get(eventID);
            if (!event?.id) {
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

            const eventControl = new MapObject(event?.discord_control);
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

            let fixes = [];


            let textCategory;
            if (actions.includes("create_text_channels") || actions.includes("update_text_channels_permissions")) {
                // Get or create category

                if (eventControl.get("team_category_id")) {
                    try {
                        textCategory = await guild.channels.fetch(eventControl.get("team_category_id"));
                    } catch (e) {
                        console.error(e?.rawError ?? e);
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
                        console.error(e?.rawError ?? e);
                    }
                }
            }

            let voiceCategory;
            if (actions.includes("create_voice_channels") || actions.includes("update_voice_channels_permissions"))  {
                if (eventControl.get("team_voice_category_id")) {
                    try {
                        voiceCategory = await guild.channels.fetch(eventControl.get("team_voice_category_id"));
                    } catch (e) {
                        console.error(e?.rawError ?? e);
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
                        console.error(e?.rawError ?? e);
                    }
                }
            }

            const teams = await getAll(event.teams);
            await Promise.all(teams.map(async (team, i) => {
                const theme = await this.helpers.get(team?.theme?.[0]);
                console.log(`[Discord-Automation] team ${i + 1}/${teams.length}`);
                const teamControl = new MapObject(team.discord_control);
                const starting = teamControl.textMap;

                if (actions.includes("delete_roles") && teamControl.get("role_id")) {
                    console.log(`[Discord-Automation] deleting role ${teamControl.get("role_id")}`);
                    try {
                        // ACTION: delete_roles
                        await guild.roles.delete(teamControl.get("role_id"), `Deleting and recreating roles for ${event.name}`);
                    } catch (e) {
                        console.error(e?.rawError ?? e);
                    }
                    teamControl.push("role_id", null);
                }
                if (actions.includes("edit_roles") || actions.includes("create_roles")) {
                    const role = {
                        name: team.name,
                        color: theme?.color_theme,
                        permissions: new PermissionsBitField()
                    };
                    if (theme && guild.features.includes(GuildFeature.RoleIcons)) {
                        role.icon = await getDiscordIcon(theme);
                    }


                    if (actions.includes("create_roles") && !teamControl.get("role_id")) {
                        console.log("[Discord-Automation] creating role", role);
                        try {
                            // ACTION: create_roles
                            teamControl.push("role_id", (await guild.roles.create(role))?.id);
                        } catch (e) {
                            console.error(e?.rawError ?? e);
                        }
                        responseCounts.rolesCreated++;
                    }

                    if (actions.includes("edit_roles") && teamControl.get("role_id")) {
                        console.log("[Discord-Automation] updating role", role);
                        // update
                        try {
                            // ACTION: edit_roles
                            await guild.roles.edit(teamControl.get("role_id"), role);
                        } catch (e) {
                            console.error(e?.rawError ?? e);
                        }
                        responseCounts.rolesEdited++;
                    }
                }

                // add to role
                const playersForRole = await getAll([...new Set([
                    ...(team.players || []),
                    ...(team.captains || []),
                    ...(team.staff || [])
                ])]);

                let membersForRole = [];
                if (actions.includes("assign_roles") || actions.includes("unassign_roles")) {
                    await Promise.all(playersForRole.map(async (player) => {
                        let { member, fixes: newFixes } = await findMember(player, team, guild);
                        fixes = [...fixes, newFixes];
                        if (member) {
                            membersForRole.push({ member, player });
                        }
                    }));
                }
                if (actions.includes("assign_roles") && teamControl.get("role_id")) {
                    await Promise.all(membersForRole.map(async ({ member, player }) => {
                        try {
                            // ACTION: assign_roles
                            await member.roles.add(teamControl.get("role_id"), `Team role for ${event.name}`);
                            console.log("Role success", team.name, teamControl.get("role_id"), member.id, member.user.username, player.name);
                        } catch (e) {
                            console.error(e?.rawError ?? e);
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
                    }));
                }
                if (actions.includes("unassign_roles") && teamControl.get("role_id")) {
                    // check all members of role and remove any that are not in playersForRole
                    try {
                        console.log("- Unassign", team.name);
                        const role = await guild.roles.fetch(teamControl.get("role_id"));
                        console.log("members", membersForRole.length, [...membersForRole].map(({ member }) => member.id));
                        for (const roleMember of role.members.values()) {
                            console.log(roleMember.id, roleMember.user.username);
                            if (!membersForRole.find(({member}) => roleMember.id === member.id)) {
                                // not in list
                                console.log("[Discord-Automation]", `found member ${roleMember.id} ${roleMember.user.username} who is not a recognised member of ${team.name}`);
                                // ACTION: unassign_roles
                                await roleMember.roles.remove(role.id);
                            }
                        }
                    } catch (e) {
                        console.error(e?.rawError ?? e);
                    }
                }


                /* Text channels */

                if (teamControl.get("text_channel_id") && actions.includes("delete_text_channels")) {
                    try {
                        // ACTION: delete_text_channels
                        await guild.channels.delete(teamControl.get("text_channel_id"));
                    } catch (e) {
                        console.error(e?.rawError ?? e);
                    }
                    teamControl.push("text_channel_id", null);
                }


                let textChannelPermissions = [];
                if ((actions.includes("create_text_channels") || actions.includes("update_text_channels_permissions")) && teamControl.get("role_id")) {
                    // set up permissions
                    try {
                        textChannelPermissions.push({ id: teamControl.get("role_id"), allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]});
                        textChannelPermissions.push({ id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel]});

                        (settings?.textChannels.accessRoleIDs || []).forEach(roleID => {
                            textChannelPermissions.push({ id: roleID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]});
                        });
                    } catch (e) {
                        console.error(e?.rawError ?? e);
                    }
                }
                if (actions.includes("create_text_channels") && !teamControl.get("text_channel_id") && textCategory) {
                    // ACTION: create_text_channels
                    const channel = await guild.channels.create({
                        parent: textCategory,
                        name: team.name,
                        type: ChannelType.GuildText,
                        permissionOverwrites: textChannelPermissions
                    });
                    teamControl.push("text_channel_id", channel.id);
                } else if ((actions.includes("update_text_channels_permissions") || actions.includes("edit_text_channels")) && teamControl.get("text_channel_id")) {
                    const channel = await guild.channels.fetch(teamControl.get("text_channel_id"));
                    if (channel) {
                        let edit = {};

                        if (actions.includes("update_text_channels_permissions")) {
                            // ACTION: update_text_channels_permissions
                            edit.permissionOverwrites = textChannelPermissions;
                        }

                        if (actions.includes("edit_text_channels")) {
                            // ACTION: edit_text_channels
                            edit.name = team.name;
                            if (textCategory) {
                                edit.parent = textCategory;
                            }
                        }

                        if (edit) {
                            await channel.edit(edit);
                        }
                    }
                }


                if (teamControl.get("voice_channel_id") && actions.includes("delete_voice_channels")) {
                    try {
                        // ACTION: delete_voice_channels
                        await guild.channels.delete(teamControl.get("voice_channel_id"));
                    } catch (e) {
                        console.error(e?.rawError ?? e);
                    }
                    teamControl.push("voice_channel_id", null);
                }
                let voiceChannelPermissions = [];
                if ((actions.includes("create_voice_channels") || actions.includes("update_voice_channels_permissions")) && teamControl.get("role_id")) {
                    // set up permissions
                    try {
                        voiceChannelPermissions.push({ id: teamControl.get("role_id"), allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]});
                        voiceChannelPermissions.push({ id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel]});

                        (settings?.voiceChannels.viewRoleIDs || []).forEach(roleID => {
                            voiceChannelPermissions.push({ id: roleID, allow: [PermissionFlagsBits.ViewChannel]});
                        });
                        (settings?.voiceChannels.connectRoleIDs || []).forEach(roleID => {
                            let existing = voiceChannelPermissions.find(perm => perm.id === roleID);
                            if (existing) {
                                existing.allow.push(PermissionFlagsBits.Connect);
                            } else {
                                voiceChannelPermissions.push({ id: roleID, allow: [PermissionFlagsBits.ViewChannel,PermissionFlagsBits.Connect]});
                            }
                        });
                    } catch (e) {
                        console.error(e?.rawError ?? e);
                    }
                }
                if (actions.includes("create_voice_channels") && !teamControl.get("voice_channel_id") && voiceCategory) {
                    // ACTION: create_voice_channels
                    const channel = await guild.channels.create({
                        parent: voiceCategory,
                        name: team.name,
                        type: ChannelType.GuildVoice,
                        permissionOverwrites: voiceChannelPermissions
                    });
                    teamControl.push("voice_channel_id", channel.id);
                } else if ((actions.includes("update_voice_channels_permissions") || actions.includes("edit_voice_channels")) && teamControl.get("voice_channel_id")) {
                    const channel = await guild.channels.fetch(teamControl.get("voice_channel_id"));
                    if (channel) {
                        let edit = {};

                        if (actions.includes("update_voice_channels_permissions")) {
                            // ACTION: update_voice_channels_permissions
                            edit.permissionOverwrites = voiceChannelPermissions;
                        }

                        if (actions.includes("edit_voice_channels")) {
                            // ACTION: edit_voice_channels
                            edit.name = team.name;
                            if (voiceCategory) {
                                edit.parent = voiceCategory;
                            }
                        }

                        if (edit) {
                            await channel.edit(edit);
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

            if (actions.includes("delete_text_channels") && !actions.includes("create_text_channels") && eventControl.get("team_category_id")) {
                // delete text category
                try {
                    const channel = await guild.channels.fetch(eventControl.get("team_category_id"));
                    if (channel) await channel.delete("Removing text channels");
                } catch (e) {
                    console.error("Failed to delete text category", e?.rawError ?? e);
                }
            }
            if (actions.includes("delete_voice_channels") && !actions.includes("create_voice_channels") && eventControl.get("team_voice_category_id")) {
                // delete text category
                try {
                    const channel = await guild.channels.fetch(eventControl.get("team_voice_category_id"));
                    if (channel) await channel.delete("Removing voice channels");
                } catch (e) {
                    console.error("Failed to delete text category", e?.rawError ?? e);
                }
            }


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
