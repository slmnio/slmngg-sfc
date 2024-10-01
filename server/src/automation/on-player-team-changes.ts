import { AnyAirtableID, EventSettings, Player, TeamResolvableID } from "../types.js";
import { get } from "../action-utils/action-cache.js";
import { MapObject } from "../discord/managers.js";
import client from "../discord/client.js";
import { cleanID, findMember } from "../action-utils/action-utils.js";

const PlayerTeamRoleMap = {
    "member_of": "player",
    "captain_of": "captain",
    "owned_teams": "owner",
    "team_staff": "staff",
};

type Alterations = {
    added: TeamResolvableID[]
    removed: TeamResolvableID[]
}

const emotes = {
    transfer_in: "<:transfer_in:485964607916212264>",
    transfer_out: "<:transfer_out:485964606913773579>",
    transfer_change: "<:transfer_change:486586258470993930>",
};

function money(num: number) {
    return `$${num || 0}k`;
}

export default {
    async handler({ id: playerID, newData: player, oldData, options }: { id: AnyAirtableID, newData: Player, oldData: Player, options?: { source?: string } }) {
        if (player?.__tableName !== "Players") return;
        // TODO: this doesn't work for people who are created with team memberships (e.g. brand new players straight into teams through signups)
        //       ATM it is restricted so it doesn't fire when the server starts up. It may only need us to check if the server is rebuilding rather than having no data.
        if (!oldData?.id) return;

        const changes : any = {};

        const PlayerTeamMembershipKeys = ["member_of", "captain_of", "owned_teams", "team_staff"] as const;

        PlayerTeamMembershipKeys.forEach((key) => {
            changes[key] = {
                added: [],
                removed: []
            };

            (player[key] || []).forEach((teamID) => {
                if (!(oldData[key] || []).includes(teamID)) {
                    // in new, not in old
                    // ADDED
                    changes[key].added.push(teamID);
                }
            });
            (oldData[key] || []).forEach((teamID) => {
                if (!(player[key] || []).includes(teamID)) {
                    // in old, not in new
                    // REMOVED
                    changes[key].removed.push(teamID);
                }
            });
        });

        if (! (Object.values(changes) as Alterations[]).some(({ added, removed }) => added.length || removed.length)) {
            // console.log("No changes for this player");
            return;
        }

        console.log(player?.name, player?.id, changes);

        const teams = new Map<TeamResolvableID, { key: typeof PlayerTeamMembershipKeys[number], alteration: keyof Alterations }[]>();

        (Object.entries(changes) as [typeof PlayerTeamMembershipKeys[number], Alterations][]).forEach(([key, alterations]) => {
            (["added", "removed"] as (keyof Alterations)[]).forEach(alteration => {
                alterations[alteration].forEach(teamID => {
                    teams.set(teamID, [
                        ...teams.get(teamID) || [],
                        { key, alteration }
                    ]);
                });
            });
        });

        // destructuring innit
        // eslint-disable-next-line prefer-const
        for (let [teamID, teamChanges] of teams.entries()) {
            const team = await get(teamID);
            if (!team?.id) continue;
            if (!team?.event?.[0]) continue;
            const event = await get(team.event[0]);
            if (!event?.id) continue;

            // Can give a team role if event has server and team has role id
            // Can announce the signing if the event has logging enabled

            console.log({ teamChanges });

            // we can't query the team for the player's ID because it might not be updated yet.
            // we can, however, query they player and see if the team is on the player's relationships

            const allPlayerTeamPositions: TeamResolvableID[] = [];
            PlayerTeamMembershipKeys.forEach(k => allPlayerTeamPositions.push(...(player[k] || []).map(id => cleanID(id))));

            console.log(allPlayerTeamPositions, playerID);
            const addRole = allPlayerTeamPositions.includes(cleanID(team.id));
            const removeRole = !addRole;

            let playerMember;
            let guild;

            // Team role
            if (client && event.discord_control && team.discord_control) {
                const eventDiscord = new MapObject(event.discord_control);
                const teamDiscord = new MapObject(team.discord_control);

                if (eventDiscord.get("guild_id") && teamDiscord.get("role_id")) {
                    try {
                        if (!guild) {
                            guild = await client.guilds.fetch(eventDiscord.get("guild_id"));
                        }

                        const { member } = await findMember(player, null, guild);

                        if (member) {
                            playerMember = member;
                        }

                        if (playerMember && addRole) {
                            console.log("Adding player to role");
                            await playerMember.roles.add(teamDiscord.get("role_id"));
                        }
                        if (playerMember && removeRole) {
                            console.log("Removing player from role");
                            await playerMember.roles.remove(teamDiscord.get("role_id"));
                        }

                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            // Announce
            if (client && event.blocks && event.discord_control) {
                try {
                    const eventSettings = JSON.parse(event.blocks) as EventSettings;
                    const eventDiscord = new MapObject(event.discord_control);

                    if (eventSettings.logging?.hideNonStaffRosterChanges) {
                        teamChanges = teamChanges.filter(({ key }) => key === "member_of");
                    }

                    let subdomain = "";

                    if (event?.subdomain || event?.partial_subdomain) {
                        subdomain = (event.subdomain || event.partial_subdomain || "") + ".";
                    }
                    const playerLink = `https://${subdomain}slmn.gg/player/${cleanID(player.id)}`;
                    const teamLink = `https://${subdomain}slmn.gg/team/${cleanID(team.id)}`;

                    if (eventSettings?.logging?.publicRosterChanges) {
                        if (!guild) {
                            guild = await client.guilds.fetch(eventDiscord.get("guild_id"));
                        }

                        if (!playerMember) {
                            const { member } = await findMember(player, null, guild);

                            if (member) {
                                playerMember = member;
                            }
                        }

                        if (guild) {
                            const logChannel = await guild.channels.fetch(eventSettings.logging.publicRosterChanges);
                            if (logChannel && logChannel.type === 0) {
                                const parts : string[] = [];

                                const addedInAll = teamChanges.some(({alteration}) => alteration === "added");
                                const removedInAll = teamChanges.every(({alteration}) => alteration !== "added");

                                if (addedInAll && removedInAll) {
                                    // some sort of change
                                    parts.push(emotes.transfer_change);
                                } else if (addedInAll) {
                                    parts.push(emotes.transfer_in);

                                } else if (removedInAll) {
                                    parts.push(emotes.transfer_out);
                                }


                                if (player.name) parts.push(`[${player.name}](<${playerLink}>)`);
                                if (playerMember?.id) parts.push(`(<@${playerMember.id}>)`);


                                if (addedInAll && removedInAll) {
                                    // some sort of change
                                    parts.push(`has been changed: ${teamChanges.map(({ key, alteration }) => `${alteration} as ${PlayerTeamRoleMap[key]}`).join(", ")} from`);
                                } else if (addedInAll) {
                                    const addedAsPlayer = teamChanges.some(({key, alteration}) => alteration === "added" && key === "member_of");
                                    if (addedAsPlayer && teamChanges.length === 1) {
                                        if (options?.source === "auction-signed-player") {
                                            parts.push("has been signed to");
                                        } else {
                                            parts.push("has been added to");
                                        }
                                    } else {
                                        // added as something else
                                        parts.push(`has been added as ${teamChanges.filter(({ alteration}) => alteration === "added").map(({ key }) => PlayerTeamRoleMap[key])} from`);
                                    }

                                } else if (removedInAll) {
                                    const removedAsPlayer = teamChanges.some(({key, alteration}) => alteration !== "added" && key === "member_of");
                                    if (removedAsPlayer && teamChanges.length === 1) {
                                        parts.push("has been removed from");
                                    } else {
                                        // removed as something else
                                        parts.push(`has been removed as ${teamChanges.filter(({ alteration}) => alteration === "removed").map(({ key }) => PlayerTeamRoleMap[key])} from`);
                                    }
                                }


                                if (team.discord_control) {
                                    const teamDiscord = new MapObject(team.discord_control);
                                    if (teamDiscord.get("emoji_id")) {
                                        const emoji = await guild.emojis.fetch(teamDiscord.get("emoji_id"));
                                        if (emoji?.id) {
                                            parts.push(`<:${emoji.name}:${emoji.id}>`);
                                        }
                                    }
                                }

                                parts.push(`**[${team.name}](<${teamLink}>)**`);

                                if (options?.source === "auction-signed-player" && player.auction_price !== undefined) {
                                    parts.push(`for **${money(player.auction_price)}**`);
                                }

                                logChannel.send(parts.join(" "));
                            }
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            }

        }

    }
};
