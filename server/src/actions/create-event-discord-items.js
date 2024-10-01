import client from "../discord/client.js";
import * as Cache from "../cache.js";
import { MapObject } from "../discord/managers.js";
import { isEventStaffOrHasRole } from "../action-utils/action-permissions.js";
import { cleanID, findMember, getAll } from "../action-utils/action-utils.js";
import { getDiscordIcon } from "../discord/role-icon.js";
import { ChannelType, GuildFeature, PermissionFlagsBits } from "discord-api-types/v10";
import { PermissionsBitField } from "discord.js";

function multiple(num, singular, plural) {
    if (num === 1) return num + " " + singular;
    return num + " " + plural;
}

const working = new Map();
/**
 *
 * @typedef { "edit_roles" | "assign_roles" | "unassign_roles" | "create_roles" | "delete_roles" | "delete_text_channels" | "create_text_channels" | "edit_text_channels" | "update_text_channels_permissions" | "delete_voice_channels" | "create_voice_channels" | "edit_voice_channels" | "update_voice_channels_permissions", "create_team_emoji", "edit_team_emoji", "delete_team_emoji" } ActionKey
 * */
export default {
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
     * @param {boolean?} settings.textChannels.useTeamCategories
     * @param {Snowflake[]} settings.voiceChannels.viewRoleIDs
     * @param {Snowflake[]} settings.voiceChannels.connectRoleIDs
     * @param {boolean?} settings.voiceChannels.useTeamCategories
     * @param {number?} settings.roles.rolePosition
     * @param {string?} settings.roles.roleColorOverride
     * @param {string?} settings.roles.changeColors
     * @param {boolean?} settings.roles.pingable
     * @param {boolean?} settings.roles.hoist
     * @param {string?} settings.teamEmoji.format
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
                teams: { processed: 0, updated: 0 },
                emoji: { created: 0, edited: 0, deleted: 0 },
                roles: { created: 0, edited: 0, deleted: 0, assigned: 0, alreadyAssigned: 0, unassigned: 0 },
                players: { tagsUpdated: 0 },
                categories: { created: 0, deleted: 0 },
                channels: { created: 0, edited: 0, deleted: 0 }
            };

            let fixes = [];

            let eventTextCategory;
            if (actions.includes("create_text_channels") || actions.includes("edit_text_channels")) {
                // Get or create category

                if (!settings.textChannels.useTeamCategories) {
                    if (eventControl.get("team_category_id")) {
                        try {
                            eventTextCategory = await guild.channels.fetch(eventControl.get("team_category_id"));
                            responseCounts.categories.created++;
                        } catch (e) {
                            console.error(e?.rawError ?? e);
                        }
                    }

                    if (!eventTextCategory) {
                        try {
                            eventTextCategory = await guild.channels.create({
                                type: ChannelType.GuildCategory,
                                name: `${event.name}`,
                                reason: `Creating text category for ${event.name}`
                            });
                            eventControl.push("team_category_id", eventTextCategory.id);
                            responseCounts.categories.created++;
                        } catch (e) {
                            console.error(e?.rawError ?? e);
                        }
                    }
                }
            }
            let eventVoiceCategory;
            if (actions.includes("create_voice_channels") || actions.includes("edit_voice_channels"))  {
                if (!settings.voiceChannels.useTeamCategories) {
                    if (eventControl.get("team_voice_category_id")) {
                        try {
                            eventVoiceCategory = await guild.channels.fetch(eventControl.get("team_voice_category_id"));
                            responseCounts.categories.created++;
                        } catch (e) {
                            console.error(e?.rawError ?? e);
                        }
                    }
                    if (!eventVoiceCategory) {
                        try {
                            eventVoiceCategory = await guild.channels.create({
                                type: ChannelType.GuildCategory,
                                name: `${event.name} VC`,
                                reason: `Creating voice category for ${event.name}`
                            });
                            eventControl.push("team_voice_category_id", eventVoiceCategory.id);
                            responseCounts.categories.created++;
                        } catch (e) {
                            console.error(e?.rawError ?? e);
                        }
                    }
                }
            }

            let eventTextCategories = new Map();
            let eventVoiceCategories = new Map();


            const teams = await getAll(event.teams);
            let i = -1;
            for (const team of teams) {
                i++;
                Cache.set(`create-event-discord-items-${eventID}`, {
                    working: true,
                    bar: {
                        current: i + 1,
                        total: teams.length
                    },
                    text: `Processing ${team?.name}`,
                    __tableName: "auto"
                });
                const theme = await this.helpers.get(team?.theme?.[0]);
                console.log(`[Discord-Automation] team ${i + 1}/${teams.length}`);
                const teamControl = new MapObject(team.discord_control);
                const starting = teamControl.textMap;

                if (actions.includes("delete_roles") && teamControl.get("role_id")) {
                    console.log(`[Discord-Automation] deleting role ${teamControl.get("role_id")}`);
                    try {
                        // ACTION: delete_roles
                        await guild.roles.delete(teamControl.get("role_id"), `Deleting and recreating roles for ${event.name}`);
                        responseCounts.roles.deleted++;
                    } catch (e) {
                        console.error(e?.rawError ?? e);
                    }
                    teamControl.push("role_id", null);
                }
                if (actions.includes("edit_roles") || actions.includes("create_roles")) {
                    const role = {
                        name: team.name,
                        permissions: new PermissionsBitField(),
                        mentionable: !!settings.roles.pingable,
                        hoist: !!settings.roles.hoist
                    };
                    if (theme && guild.features.includes(GuildFeature.RoleIcons)) {
                        role.icon = await getDiscordIcon(theme);
                    }
                    if (settings?.roles?.rolePosition) {
                        role.position = settings.roles.rolePosition;
                    }
                    if ((actions.includes("edit_roles") && settings?.roles?.changeColors) || actions.includes("create_roles")) {
                        role.color = settings.roles.changeColors === "override" ? settings.roles.roleColorOverride : theme?.color_theme;
                    }


                    if (actions.includes("create_roles") && !teamControl.get("role_id")) {
                        console.log("[Discord-Automation] creating role", role);
                        try {
                            // ACTION: create_roles
                            teamControl.push("role_id", (await guild.roles.create(role))?.id);
                            responseCounts.roles.created++;
                        } catch (e) {
                            console.error(e?.rawError ?? e);
                        }
                    }

                    if (actions.includes("edit_roles") && teamControl.get("role_id")) {
                        console.log("[Discord-Automation] updating role", role);
                        // update
                        try {
                            // ACTION: edit_roles
                            await guild.roles.edit(teamControl.get("role_id"), role);
                            responseCounts.roles.edited++;
                        } catch (e) {
                            console.error(e?.rawError ?? e);
                        }
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
                        fixes = [...fixes, ...newFixes];
                        if (member) {
                            membersForRole.push({ member, player });
                        }
                    }));
                }
                if (actions.includes("assign_roles") && teamControl.get("role_id")) {
                    await Promise.all(membersForRole.map(async ({ member, player }) => {
                        try {
                            // ACTION: assign_roles
                            if (member.roles?.cache?.has(teamControl.get("role_id"))) {
                                console.log("Player already has role", team.name, teamControl.get("role_id"), member.id, member.user.username, player.name);
                                responseCounts.roles.alreadyAssigned++;
                            } else {
                                await member.roles.add(teamControl.get("role_id"), `Team role for ${event.name}`);
                                console.log("Role success", team.name, teamControl.get("role_id"), member.id, member.user.username, player.name);
                                responseCounts.roles.assigned++;
                            }
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
                            responseCounts.players.tagsUpdated++;

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
                                responseCounts.roles.unassigned++;
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
                        responseCounts.channels.deleted++;
                    } catch (e) {
                        console.error(e?.rawError ?? e);
                    }
                    teamControl.push("text_channel_id", null);
                }


                let textChannelPermissions = [];
                if ((actions.includes("create_text_channels") || actions.includes("update_text_channels_permissions")) && teamControl.get("role_id")) {
                    // set up permissions
                    try {
                        textChannelPermissions.push({
                            id: client.user.id, allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.ManageChannels
                            ]
                        });
                        textChannelPermissions.push({ id: teamControl.get("role_id"), allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]});
                        textChannelPermissions.push({ id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel]});

                        (settings?.textChannels.accessRoleIDs || []).forEach(roleID => {
                            textChannelPermissions.push({ id: roleID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]});
                        });
                    } catch (e) {
                        console.error(e?.rawError ?? e);
                    }
                }

                let teamTextCategoryChannel = eventTextCategory;
                if (settings.textChannels.useTeamCategories && team.team_category) {
                    // need to find or create a category channel based on the team.team_category
                    const split = team.team_category.split(";");
                    const teamCategory = split.pop();
                    if (eventTextCategories.has(teamCategory)) {
                        // already loaded into map
                        teamTextCategoryChannel = eventTextCategories.get(teamCategory);
                    } else {
                        let searchedCategoryChannel;
                        if (teamControl.get("team_category_text_category_id")) {
                            // not loaded into map, see if it exists
                            try {
                                searchedCategoryChannel = await guild.channels.fetch(teamControl.get("team_category_text_category_id"));
                                if (searchedCategoryChannel) {
                                    teamTextCategoryChannel = searchedCategoryChannel;
                                    eventTextCategories.set(teamCategory, teamTextCategoryChannel);
                                    teamControl.push("team_category_text_category_id", teamTextCategoryChannel.id);
                                }
                            } catch (e) {
                                console.warn("Couldn't find category channel", teamCategory, teamControl.textMap());
                            }
                        }
                        if (!searchedCategoryChannel) {
                            // create category
                            console.log("Creating team category since it doesn't seem to exist");
                            teamTextCategoryChannel = await guild.channels.create({
                                name: teamCategory,
                                type: ChannelType.GuildCategory
                            });
                            eventTextCategories.set(teamCategory, teamTextCategoryChannel);
                            teamControl.push("team_category_text_category_id", teamTextCategoryChannel.id);
                            responseCounts.categories.created++;
                        }
                    }
                }
                let teamVoiceCategoryChannel = eventVoiceCategory;
                if (settings.voiceChannels.useTeamCategories && team.team_category) {
                    // need to find or create a category channel based on the team.team_category
                    const split = team.team_category.split(";");
                    const teamCategory = split.pop();
                    if (eventVoiceCategories.has(teamCategory)) {
                        // already loaded into map
                        teamVoiceCategoryChannel = eventVoiceCategories.get(teamCategory);
                    } else {
                        let searchedCategoryChannel;
                        if (teamControl.get("team_category_voice_category_id")) {
                            // not loaded into map, see if it exists
                            try {
                                searchedCategoryChannel = await guild.channels.fetch(teamControl.get("team_category_voice_category_id"));
                                if (searchedCategoryChannel) {
                                    teamVoiceCategoryChannel = searchedCategoryChannel;
                                    eventVoiceCategories.set(teamCategory, teamVoiceCategoryChannel);
                                    teamControl.push("team_category_voice_category_id", teamVoiceCategoryChannel.id);
                                }
                            } catch (e) {
                                console.warn("Couldn't find category channel", teamCategory, teamControl.textMap);
                            }
                        }
                        if (!searchedCategoryChannel) {
                            // create category
                            console.log("Creating team voice category since it doesn't seem to exist");
                            teamVoiceCategoryChannel = await guild.channels.create({
                                name: teamCategory,
                                type: ChannelType.GuildCategory
                            });
                            eventVoiceCategories.set(teamCategory, teamVoiceCategoryChannel);
                            teamControl.push("team_category_voice_category_id", teamVoiceCategoryChannel.id);
                            responseCounts.categories.created++;
                        }
                    }
                }

                if (actions.includes("create_text_channels") && !teamControl.get("text_channel_id") && teamTextCategoryChannel) {
                    // ACTION: create_text_channels
                    const channel = await guild.channels.create({
                        parent: teamTextCategoryChannel,
                        name: team.name,
                        type: ChannelType.GuildText,
                        permissionOverwrites: textChannelPermissions
                    });
                    responseCounts.channels.created++;
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
                            console.log(channel?.parentID, teamTextCategoryChannel?.id);
                            if (teamTextCategoryChannel && channel?.parentId !== teamTextCategoryChannel?.id) {
                                edit.parent = teamTextCategoryChannel;
                            }
                        }

                        if (edit) {
                            await channel.edit(edit);
                            responseCounts.channels.edited++;
                        }
                    }
                }


                if (teamControl.get("voice_channel_id") && actions.includes("delete_voice_channels")) {
                    try {
                        // ACTION: delete_voice_channels
                        await guild.channels.delete(teamControl.get("voice_channel_id"));
                        responseCounts.channels.deleted++;
                    } catch (e) {
                        console.error(e?.rawError ?? e);
                    }
                    teamControl.push("voice_channel_id", null);
                }
                let voiceChannelPermissions = [];
                if ((actions.includes("create_voice_channels") || actions.includes("update_voice_channels_permissions")) && teamControl.get("role_id")) {
                    // set up permissions
                    try {
                        voiceChannelPermissions.push({
                            id: client.user.id, allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.Connect,
                                PermissionFlagsBits.ManageChannels
                            ]
                        });
                        voiceChannelPermissions.push({ id: teamControl.get("role_id"), allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]});
                        voiceChannelPermissions.push({ id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]});

                        (settings?.voiceChannels.viewRoleIDs || []).forEach(roleID => {
                            voiceChannelPermissions.push({ id: roleID, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.Connect]});
                        });
                        (settings?.voiceChannels.connectRoleIDs || []).forEach(roleID => {
                            let existing = voiceChannelPermissions.find(perm => perm.id === roleID);
                            if (existing) {
                                existing.allow.push(PermissionFlagsBits.Connect);
                                existing.deny = existing.deny.filter(f => f === PermissionFlagsBits.Connect);
                            } else {
                                voiceChannelPermissions.push({ id: roleID, allow: [PermissionFlagsBits.ViewChannel,PermissionFlagsBits.Connect]});
                            }
                        });
                    } catch (e) {
                        console.error(e?.rawError ?? e);
                    }
                }
                if (actions.includes("create_voice_channels") && !teamControl.get("voice_channel_id") && teamVoiceCategoryChannel) {
                    // ACTION: create_voice_channels
                    const channel = await guild.channels.create({
                        parent: teamVoiceCategoryChannel,
                        name: team.name,
                        type: ChannelType.GuildVoice,
                        permissionOverwrites: voiceChannelPermissions
                    });
                    responseCounts.channels.created++;
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
                            if (teamVoiceCategoryChannel) {
                                edit.parent = teamVoiceCategoryChannel;
                            }
                        }

                        if (edit) {
                            console.log("Editing channel", edit);
                            await channel.edit(edit);
                            responseCounts.channels.edited++;
                        }
                    }
                }


                /* Team emoji */

                if (actions.includes("delete_team_emoji") && teamControl.get("emoji_id")) {
                    // delete team emoji
                    try {
                        const emoji = await guild.emojis.fetch(teamControl.get("emoji_id"));
                        if (emoji) {
                            await emoji.delete("Removing team emoji");
                            responseCounts.emoji.deleted++;
                        }
                    } catch (e) {
                        console.error(e?.rawError ?? e);
                    }
                    teamControl.push("emoji_id", null);
                }
                if (actions.includes("edit_team_emoji") || actions.includes("create_team_emoji")) {
                    const emoji = {};
                    emoji.name = (settings.teamEmoji.format || "")
                        .replaceAll("{team_id}", team?.id || "")
                        .replaceAll("{team_code}", team?.code || "")
                        .replaceAll("{team_name}", team?.name || "")
                        .replaceAll("{team_category}", (team?.team_category?.includes(";") ? team.team_category.split(";")?.[1] : team?.team_category) || "")
                        .replaceAll("{event_id}", event?.id || "")
                        .replaceAll("{event_name}", event?.name || "")
                        .replaceAll("{event_short}", event?.short || "")
                        .replaceAll(/[^a-zA-Z0-9_]/g, "")
                        .slice(0, 32);

                    if (actions.includes("edit_team_emoji") && teamControl.get("emoji_id") && theme) {
                        try {
                            const guildEmoji = await client.emojis.resolve(teamControl.get("emoji_id"));
                            if (guildEmoji) {
                                await guildEmoji.edit({
                                    name: emoji.name
                                });
                                responseCounts.emoji.edited++;
                            }
                        } catch (e) {
                            console.error(e?.rawError ?? e);
                        }

                    } else if (actions.includes("create_team_emoji") && !teamControl.get("emoji_id") && theme) {
                        // create team emoji
                        emoji.icon = await getDiscordIcon(theme);
                        if (emoji.icon) {
                            try {
                                console.log(emoji);
                                const guildEmoji = await guild.emojis.create({
                                    attachment: emoji.icon,
                                    name: emoji.name,
                                    reason: `Creating team emoji for ${team.name}`
                                }
                                );
                                teamControl.push("emoji_id", guildEmoji.id);
                                responseCounts.emoji.created++;
                            } catch (e) {
                                console.error(e?.rawError ?? e);
                                fixes.push({
                                    type: "team_emoji_error",
                                    teamID: team.id,
                                    errorMessage: e?.rawError?.message,
                                    errorCode: e?.rawError?.code,
                                });
                            }
                        }
                    }
                }


                if (starting !== teamControl.textMap) {
                    await this.helpers.updateRecord("Teams", team, {
                        "Discord Control": teamControl.textMap
                    });
                    responseCounts.teams.updated++;
                }
                responseCounts.teams.processed++;
            }


            if (actions.includes("delete_text_channels") && !actions.includes("create_text_channels") && eventControl.get("team_category_id")) {
                // delete text category
                try {
                    const channel = await guild.channels.fetch(eventControl.get("team_category_id"));
                    if (channel) {
                        await channel.delete("Removing text channels");
                        responseCounts.categories.deleted++;
                    }
                } catch (e) {
                    console.error("Failed to delete text category", e?.rawError ?? e);
                }
            }
            if (actions.includes("delete_voice_channels") && !actions.includes("create_voice_channels") && eventControl.get("team_voice_category_id")) {
                // delete text category
                try {
                    const channel = await guild.channels.fetch(eventControl.get("team_voice_category_id"));
                    if (channel) {
                        await channel.delete("Removing voice channels");
                        responseCounts.categories.deleted++;
                    }
                } catch (e) {
                    console.error("Failed to delete text category", e?.rawError ?? e);
                }
            }

            // TODO: delete team category categories

            if (actions.includes("delete_text_channels") && !actions.includes("create_text_channels")) {
                // delete text category
                const deleted = new Set();

                for (const team of teams) {
                    const teamControl = new MapObject(team.discord_control);
                    try {
                        const textCatID = teamControl.get("team_category_text_category_id");
                        if (textCatID && !deleted.has(textCatID)) {
                            const channel = await guild.channels.fetch(textCatID);
                            if (channel) {
                                await channel.delete("Removing text channels");
                                responseCounts.categories.deleted++;
                            }
                            deleted.add(textCatID);
                        }
                    } catch (e) {
                        console.error("Failed to delete text team category category", e?.rawError ?? e);
                    }
                }
            }
            if (actions.includes("delete_voice_channels") && !actions.includes("create_voice_channels")) {
                // delete voice category
                const deleted = new Set();

                for (const team of teams) {
                    const teamControl = new MapObject(team.discord_control);
                    try {
                        const voiceCatID = teamControl.get("team_category_voice_category_id");
                        if (voiceCatID && !deleted.has(voiceCatID)) {
                            const channel = await guild.channels.fetch(voiceCatID);
                            if (channel) {
                                await channel.delete("Removing voice channels");
                                responseCounts.categories.deleted++;
                            }
                            deleted.add(voiceCatID);
                        }
                    } catch (e) {
                        console.error("Failed to delete voice team category category", e?.rawError ?? e);
                    }
                }
            }

            await this.helpers.updateRecord("Events", event, {
                "Discord Control": eventControl.textMap
            });

            const output = {
                status: [
                    responseCounts.teams.processed ? multiple(responseCounts.teams.processed, "team processed", "teams processed") : null,
                    responseCounts.teams.updated ? multiple(responseCounts.teams.updated, "team updated", "teams updated") : null,

                    responseCounts.roles.created ? multiple(responseCounts.roles.created, "role created", "roles created") : null,
                    responseCounts.roles.edited ? multiple(responseCounts.roles.edited, "role edited", "roles edited") : null,
                    responseCounts.roles.deleted ? multiple(responseCounts.roles.deleted, "role deleted", "roles deleted") : null,
                    responseCounts.roles.assigned ? multiple(responseCounts.roles.assigned, "role assigned", "roles assigned") : null,
                    responseCounts.roles.alreadyAssigned ? multiple(responseCounts.roles.alreadyAssigned, "roles already assigned", "roles already assigned") : null,
                    responseCounts.roles.unassigned ? multiple(responseCounts.roles.unassigned, "role unassigned", "roles unassigned") : null,

                    responseCounts.players.tagsUpdated ? multiple(responseCounts.players.tagsUpdated, "player tag updated", "player tags updated") : null,

                    responseCounts.categories.created ? multiple(responseCounts.categories.created, "category created", "categories created") : null,
                    responseCounts.categories.deleted ? multiple(responseCounts.categories.deleted, "category deleted", "categories deleted") : null,

                    responseCounts.channels.created ? multiple(responseCounts.channels.created, "channel created", "channels created") : null,
                    responseCounts.channels.deleted ? multiple(responseCounts.channels.deleted, "channel deleted", "channels deleted") : null,
                    responseCounts.channels.edited ? multiple(responseCounts.channels.edited, "channel edited", "channels edited") : null,

                    responseCounts.emoji.created ? `${responseCounts.emoji.created} emoji created` : null,
                    responseCounts.emoji.deleted ? `${responseCounts.emoji.deleted} emoji deleted` : null,
                    responseCounts.emoji.edited ? `${responseCounts.emoji.edited} emoji edited` : null,

                    multiple(fixes.length, "fix", "fixes"),
                ].filter(Boolean).join("\n"),
                counts: responseCounts,
                fixes
            };
            Cache.set(`create-event-discord-items-${cleanID(eventID)}`, {
                working: false,
                complete: true,
                output,
                __tableName: "auto"
            });
            return output;
        } catch (e) {
            Cache.set(`create-event-discord-items-${eventID}`, {
                working: false,
                __tableName: "auto"
            });
            throw e;
        } finally {
            working.set(eventID, false);
        }
    },

};
