/* BPL Staff Automation */

const client = require("./client.js");
const Airtable = require("airtable");
const { MessageEmbed, Permissions } = require("discord.js");
const airtable = new Airtable({apiKey: process.env.AIRTABLE_KEY});
const base = airtable.base("appQd7DO7rDiMUIEj");

const { MapHandler } = require("./managers.js");
const { log } = require("./slmngg-log.js");

function deAirtable(obj) {
    const data = {};
    Object.entries(obj.fields).forEach(([key, val]) => {
        data[key.replace(/ +/g, "_").replace(/[:()]/g, "_").replace(/_+/g,"_").toLowerCase()] = val;
    });
    data.id = obj.id;
    return data;
}


async function setupEvent(event) {
    console.log(`[events] Setting up ${event.name}`);
    log(`Setting up new event: **${event.name}**.`);
    const guild = await client.guilds.fetch(process.env.STAFFAPPS_GUILD_ID);
    if (!guild) return console.error("No guild found whilst setting up event.");
    const category = await guild.channels.fetch(process.env.STAFFAPPS_CATEGORY_ID);
    if (!category) return console.error("No event category found whilst setting up event.");

    let updatedData = {
        "Re-setup": false
    };

    // console.log(event);

    if (event.role_map) {
        let roles = new MapHandler({
            map: event.role_map,
            ids: event.role_ids,
            create_function: async (item) => {
                console.log("create role", item);
                return {
                    key: item.key,
                    item: (await guild.roles.create({
                        name: `${event.prefix} ${item.key}`,
                        ...(item.key === "Staff" ? { color: event.color } : {})
                    }))
                };
            }
        });
        await roles.createMissingItems((["Staff", ...roles.map.uniqueData]).filter(r => !roles.ids.data.find(m => m.key === r)).map(e => ({key: e})));
        updatedData["Role IDs"] = roles.ids.textMap;

        // let channels = new MapHandler({
        //     map: event.channel_map,
        //     ids: event.channel_ids,
        //     event
        // })
        // let allRoles = ["Staff"];
        // responses.forEach(response => {
        //     response.roles.forEach(role => {
        //         if (allRoles.indexOf(role) === -1) allRoles.push(role);
        //     });
        // });
        //
        // let eventRoles = (event.role_ids || "").trim().split("\n").map(r => {
        //     let [role, id] = r.split("=");
        //     return {role, id};
        // });
        // let rolesToCreate = allRoles.filter(roleName => !eventRoles.find(e => e.role === roleName));
        // let newRoles = await Promise.all(rolesToCreate.map(async roleName => {
        //     return {
        //         name: roleName,
        //         role: (await guild.roles.create({
        //             name: `${event.prefix} ${roleName}`
        //         }))
        //     };
        // }));
        // updatedData["Role IDs"] = ((event.role_ids ? event.role_ids + "\n" : "") + newRoles.map(r => [r.name, r.role.id].join("=")).join("\n")).trim();
        // newRoles.forEach(r => {
        //     eventRoles.push({ role: r.name, id: r.role.id });
        // });
        //
        // let allCategories = ["Staff", "Live"];
        // let eventCategories = (event.category_ids || "").trim().split("\n").map(r => {
        //     let [category, id] = r.split("=");
        //     return { category, id };
        // });
        // let categoriesToCreate = allCategories.filter(catName => !eventCategories.find(e => e.category === catName));
        // let newCategories = await Promise.all(categoriesToCreate.map(async catName => {
        //     return {
        //         name: catName,
        //         category: (await guild.channels.create(`${event.name} ${catName}`, {
        //             type: "GUILD_CATEGORY",
        //             permissionOverwrites: [
        //                 { id: eventRoles.find(r => r.role === "Staff").id, allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.CONNECT] },
        //                 { id: guild.roles.everyone, deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT] }
        //             ]
        //         }))
        //     };
        // }));
        // updatedData["Category IDs"] = ((event.category_ids ? event.category_ids + "\n" : "") + newCategories.map(c => [c.name, c.category.id].join("=")).join("\n")).trim();

        let categories = new MapHandler({
            map: event.category_map,
            ids: event.category_ids,
            create_function: async (item) => {
                console.log("create", item);
                return {
                    key: item.key,
                    item: (await guild.channels.create(`${event.prefix} ${item.key}`, {
                        type: "GUILD_CATEGORY",
                        permissionOverwrites: [
                            ...(item.data.map(roleName => {
                                let id = roles.ids.get(roleName);
                                if (!id) return null;
                                return { id, allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT]};
                            }).filter(i => i)),
                            { id: guild.roles.everyone, deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT]}
                        ]
                    }))
                };
            }
        });
        await categories.createMissingItems();
        updatedData["Category IDs"] = categories.ids.textMap;

        let channels = new MapHandler({
            map: event.channel_map,
            ids: event.channel_ids,
            create_function: async (item) => {
                console.log("create channel", item);

                let category = categories.combined.find(c => c.data.includes(item.key));
                console.log("category", category);

                return {
                    key: item.key,
                    item: (await guild.channels.create(`${event.prefix}-${item.key}`, {
                        permissionOverwrites: [
                            ...(item.data.map(roleName => {
                                let id = roles.ids.get(roleName);
                                if (!id) return null;
                                return { id, allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT]};
                            }).filter(i => i)),
                            { id: guild.roles.everyone, deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT] }
                        ],
                        ...(category ? { parent: category.id } : {})
                    }))
                };
            }
        });
        await channels.createMissingItems();
        updatedData["Channel IDs"] = channels.ids.textMap;

        // let channelMap = (event.channel_map || "").split("\n").map(m => m.split("="));
        // let eventChannels = event.channel_ids.split("\n").map(c => {
        //     let [channel, id] = c.split("=");
        //     return {channel, id};
        // });
        // let channelsToCreate = allRoles.filter(roleName => !eventChannels.find(e => e.channel === roleName));
        // let newChannels = await Promise.all(channelsToCreate.map(async roleName => {
        //     return {
        //         name: roleName,
        //         channel: (await )
        //     }
        // }));

        // let channels = new MapManager({
        //     map: event.channel_map,
        //     ids: event.channel_ids,
        //     create_function: async (name) => {
        //         return {
        //             name,
        //             channel:
        //         }
        //     }
        // });

        await base("Events").update(event.id, updatedData);
    }

    /*
    *  Make sure all requested roles are created (has ID stored)
    *  Make sure all requested channels are created (has ID stored)
    *
    * */

    return;

    /* - Make a general staff role with a colour
    *  - Make a general staff channel
    *  - Make sub-roles (holding off on sub-channels for now) */

    if (!event.staff_role_id) {
        // create staff role

        let role = await guild.roles.create({
            name: `${event.prefix} Staff`,
            color: event.color
        });

        updatedData["Staff Role ID"] = role.id; // update it to sync on airtable later
        event.staff_role_id = role.id; // update it now for further processing

        if (event.staff_channel_id) {
            // update perms
            let channel = await guild.channels.fetch(event.staff_channel_id);
            if (!channel) return console.error("Tried to update staff channel perms after creating a new role but failed lookup of staff channel");
            await channel.permissionOverwrites.create(role.id, {
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true
            });
        }
    }

    if (!event.staff_channel_id) {
        // make a staff channel
        let channel = await guild.channels.create(`${event.slug}-staff`, {
            permissionOverwrites: [
                { id: event.staff_role_id, allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES] },
                { id: guild.roles.everyone, deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT] }
                // this might not work but we'll see
            ],
            parent: category
        });

        updatedData["Staff Channel ID"] = channel.id;
        event.staff_channel_id = channel.id;
    }

    if (!event.production_role_id) {
        // make prod role
        let role = await guild.roles.create({
            name: `${event.prefix} Production`
        });
        updatedData["Production Role ID"] = role.id;
        event.production_role_id = role.id;
    }

    if (!event.talent_role_id) {
        // make talent role
        let role = await guild.roles.create({
            name: `${event.prefix} Talent`
        });
        updatedData["Talent Role ID"] = role.id;
        event.talent_role_id = role.id;
    }

    // update
    await base("Events").update(event.id, updatedData);

    if (event.make_live_channels) {
        /*
        * - make category
        * - make talent/production text
        * - make live vc
        * - make waiting room vc
        * */

        // set no-one but
        let eventCategory = await guild.channels.create(event.name, {
            type: "GUILD_CATEGORY",
            permissionOverwrites: [
                { id: event.staff_role_id, allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.CONNECT] },
                { id: guild.roles.everyone, deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT] }
            ]
        });

        await guild.channels.create(`${event.slug}-talent`, {
            parent: eventCategory,
            permissionOverwrites: [
                { id: event.talent_role_id, allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES] },
                { id: guild.roles.everyone, deny: [Permissions.FLAGS.VIEW_CHANNEL] }
            ]
        });
        await guild.channels.create(`${event.slug}-production`, {
            parent: eventCategory,
            permissionOverwrites: [
                { id: event.production_role_id, allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES] },
                { id: guild.roles.everyone, deny: [Permissions.FLAGS.VIEW_CHANNEL] }
            ]
        });

        await guild.channels.create(`${event.prefix} LIVE`, {
            type: "GUILD_VOICE",
            parent: eventCategory,
            permissionOverwrites: [
                { id: event.staff_role_id, allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT] },
                { id: event.talent_role_id, allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT] },
                { id: guild.roles.everyone, deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT] }
            ]
        });

        await guild.channels.create(`${event.prefix} Waiting`, {
            type: "GUILD_VOICE",
            parent: eventCategory,
            permissionOverwrites: [
                { id: guild.roles.everyone, allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT] }
            ]
        });
    }
}

async function checkAndSetupEvent() {
    try {
        let [event] = await base("Events").select({
            "view": "Events to setup",
            "maxRecords": 1,
            "filterByFormula": "{Active} = TRUE()"
        }).all();
        if (!event) return;
        await setupEvent(deAirtable(event));
    } catch (e) {
        console.error(e);
    }
}

checkAndSetupEvent();
setInterval(checkAndSetupEvent, 20 * 1000);


async function checkForEventsToEmpty() {
    try {
        let [event] = await base("Events").select({
            "view": "Events to empty roles",
            "maxRecords": 1
        }).all();
        if (!event) return;
        await emptyEmptyRoles(deAirtable(event));
    } catch (e) {
        console.error(e);
    }
}
async function emptyEmptyRoles(event) {
    const guild = await client.guilds.fetch(process.env.STAFFAPPS_GUILD_ID);
    if (!guild) return console.error("No guild found whilst setting up event.");
    // Load members into cache
    await guild.members.list({ limit: 1000 });

    let checkRoles = guild.roles.cache.filter(r => r.name !== "@everyone" && r.members.size !== 0);

    if (checkRoles.length === 0) return console.warn("Didn't want to empty roles - all roles appear to be empty");

    let eligibleRoles = guild.roles.cache.filter(r => r.name.startsWith(event.prefix) && r.members.size === 0);

    log(`Requested empty role deletion for **${event.name}**. The roles were:\n\`\`\`${eligibleRoles.map(r => `${r.id} - ${r.name}`)}\`\`\``);

    await base("Events").update(event.id, { "Wipe empty roles": false });

    await Promise.all(eligibleRoles.map(r => r.delete()));
}
checkForEventsToEmpty();
setInterval(checkForEventsToEmpty, 20 * 1000);


async function checkForApplications() {
    let [application] = await base("Staff Applications").select({
        "view": "Messages to be posted",
        "maxRecords": 1,
    }).all();
    if (!application) return;
    await sendApplicationMessage(deAirtable(application));
}

setInterval(checkForApplications, 5 * 1000);

async function findMember(guild, discordTag) {
    let [username, discriminator] = discordTag.split("#");
    let checkFunction = (m) => m.user && m.user.username.toLowerCase() === username.toLowerCase() && m.user.discriminator === discriminator;

    let member = guild.members.cache.find(checkFunction);
    if (member) return member;

    let results = await guild.members.search({ query: username });
    if (!results) return null;
    return results.find(checkFunction) || null;
}

function niceJoin(array) {
    if (array.length > 1) {
        let last = array.pop();
        return array.join(", ") + " and " + last;
    }
    return array[0];
}

const APPLICATION_APPROVE_EMOJI = "✅";

async function sendApplicationMessage(application) {
    const guild = await client.guilds.fetch(process.env.STAFFAPPS_GUILD_ID);
    if (!guild) return console.error("No guild found whilst trying to send an application message.");
    const channel = await guild.channels.fetch(process.env.STAFFAPPS_APPLICATION_CHANNEL_ID);
    if (!channel) return console.error("No application message channel found.");
    application.event = deAirtable(await base("Events").find(application.event[0]));

    let member = await findMember(guild, application.discord_tag);

    let embed = new MessageEmbed();
    embed.setTitle(`${application.event.name} – Staff Application – ${application.name}`);
    embed.setColor(application.event.color);

    let description = [
        `Signed up for: ${niceJoin(application.roles)}`
    ];
    if (member) {
        description.push(`✅ In the server: ${member}`);
    } else {
        description.push("❌ Not in the server (or couldn't be detected)");
    }
    embed.setDescription(description.join("\n"));

    if (application.background_and_experience) embed.addField("Background and experience", application.background_and_experience.slice(0, 750) + (application.background_and_experience.length > 750 ? "..." : ""));
    if (application.technical_details) embed.addField("Technical details", application.technical_details.slice(0, 250) + (application.technical_details.length > 250 ? "..." : ""));

    embed.addField("Discord tag", application.discord_tag, true);
    if (application.battletag) embed.addField("Battletag", application.battletag, true);
    let message = await channel.send({ embeds: [embed] });
    await base("Staff Applications").update(application.id, {
        "Notification Message ID": message.id
    });
    await message.react(APPLICATION_APPROVE_EMOJI);
    log(`**Applications**: New application from **${ application.name }** for **${ application.event.name }**.`);
}

client.on("messageReactionAdd", async (reaction, user) => {
    let message = reaction.message; // may be partial
    if (message.guildId !== process.env.STAFFAPPS_GUILD_ID) return;
    if (message.channelId !== process.env.STAFFAPPS_APPLICATION_CHANNEL_ID) return;
    if (reaction.emoji.name !== APPLICATION_APPROVE_EMOJI) return;
    if (user.bot) return;

    // TODO: FILTER BOTS AWAY LOL

    let [application] = await base("Staff Applications").select({
        maxRecords: 1,
        view: "Approvable applications",
        filterByFormula: `{Notification Message ID} = "${message.id}"`
    }).all();
    if (!application) {
        return console.warn(`No valid application found for https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`);
    }
    await onApplicationApproved(deAirtable(application), message, user.username);
});

async function getMessage(id) {
    try {
        const guild = await client.guilds.fetch(process.env.STAFFAPPS_GUILD_ID);
        if (!guild) return null;
        const channel = await guild.channels.fetch(process.env.STAFFAPPS_APPLICATION_CHANNEL_ID);
        if (!channel) return null;
        return await channel.messages.fetch(id);
    } catch (e) {
        return null;
    }
}

async function checkForForceApprovedApplications() {
    let [application] = await base("Staff Applications").select({
        maxRecords: 1,
        view: "Force approved"
    }).all();
    if (!application) return;
    application = deAirtable(application);

    let message = null;
    if (application.notification_message_id) {
        // find message
        message = await getMessage(application.notification_message_id);
    }
    await onApplicationApproved(application, message, "Force via Airtable");
}

setInterval(checkForForceApprovedApplications, 8 * 1000);

async function onApplicationApproved(application, message, approver) {
    let event = deAirtable(await base("Events").find(application.event[0]));
    if (!event.active) return console.warn("Event is no longer active but an application was approved");
    await base("Staff Applications").update(application.id, { "Approved": true });

    let guild = await client.guilds.fetch(process.env.STAFFAPPS_GUILD_ID);
    let member = await findMember(guild, application.discord_tag);

    if (!member && message) {
        if (message.partial) message = await message.fetch(); // force update
        message.edit({ embeds: [{
            ...message.embeds[0],
            color: "#ff8f00",
            fields: [
                ...message.embeds[0].fields,
                {
                    "name": "Couldn't autorole",
                    "value": "You will need to manually give this person their roles."
                }
            ]
        }]});
        log(`**Applications**: Couldn't autorole **${application.discord_tag}**${approver ? ` (approved by **${approver}**)` : ""}`);
        return console.error("Can't find member to auto give roles");
    }

    // need to use new system for roles.

    let roles = new MapHandler({
        map: event.role_map,
        ids: event.role_ids
    });

    let allRoles = [...application.roles].map(selectedRole => roles.map.get(selectedRole)).flat().filter((i, pos, arr) => arr.indexOf(i) === pos);

    ["Staff", ...allRoles].map(r => roles.ids.get(r)).forEach(id => {
        console.log(allRoles, id);
        member.roles.add(id);
    });

    let channels = new MapHandler({
        map: event.channel_map,
        ids: event.channel_ids
    });

    let channel = await guild.channels.fetch(channels.ids.get("Staff"));
    if (channel) {
        // setting a delay so their Discord clients can catch up
        setTimeout(() => {
            channel.send(`Welcome ${member}!`);
        }, 3000);
    }

    if (message) {
        if (message.partial) message = await message.fetch(); // force update
        message.edit({ embeds: [{
            ...message.embeds[0],
            color: "#77B255",
            author: {
                "name": approver ? `Approved by ${approver}` : "Approved",
                "icon_url": "https://cdn.discordapp.com/attachments/485493459357007876/880277441392828486/check-mark-button_2705.png"
            }
        }]});
        log(`**Applications**: **${application.name}** approved for **${event.name}**${approver ? ` by **${approver}**` : ""}.`);
        setTimeout(() => {
            message.delete();
        }, 10 * 1000);
    }
}
