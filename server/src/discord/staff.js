/* BPL Staff Automation */

const { Client, Intents, Permissions } = require("discord.js");
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ["MESSAGE", "REACTION"]
});
client.login(process.env.DISCORD_TOKEN);
client.once("ready", () => console.log(`[discord] Logged in as ${client.user.tag}`));

const Airtable = require("airtable");
const { MessageEmbed } = require("discord.js");
const airtable = new Airtable({apiKey: process.env.AIRTABLE_KEY});
const base = airtable.base("appQd7DO7rDiMUIEj");

function deAirtable(obj) {
    const data = {};
    Object.entries(obj.fields).forEach(([key, val]) => {
        data[key.replace(/ +/g, "_").replace(/[:()]/g, "_").replace(/_+/g,"_").toLowerCase()] = val;
    });
    data.id = obj.id;
    return data;
}


async function setupEvent(event) {
    const guild = await client.guilds.fetch(process.env.STAFFAPPS_GUILD_ID);
    if (!guild) return console.error("No guild found whilst setting up event.");
    const category = await guild.channels.fetch(process.env.STAFFAPPS_CATEGORY_ID);
    if (!category) return console.error("No event category found whilst setting up event.");

    let updatedData = {};

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

    embed.addField("Background and experience", application.background_and_experience);
    if (application.technical_details) {
        embed.addField("Technical details", application.technical_details);
    }

    embed.addField("Discord tag", application.discord_tag, true);
    if (application.battletag) embed.addField("Battletag", application.battletag, true);
    let message = await channel.send({ embeds: [embed] });
    await base("Staff Applications").update(application.id, {
        "Notification Message ID": message.id
    });
    await message.react(APPLICATION_APPROVE_EMOJI);
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
    await onApplicationApproved(deAirtable(application), message);
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
    await onApplicationApproved(application, message);
}

setInterval(checkForForceApprovedApplications, 8 * 1000);

async function onApplicationApproved(application, message) {
    await base("Staff Applications").update(application.id, { "Approved": true });

    // then set roles etc - DM?

    let event = deAirtable(await base("Events").find(application.event[0]));
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
        return console.error("Can't find member to auto give roles");
    }

    if (event.staff_role_id) member.roles.add(event.staff_role_id);

    if (event.production_role_id && ["In-game observers", "Lobby admins", "Producers"].some(r => application.roles.includes(r))) {
        // give prod role
        member.roles.add(event.production_role_id);
    }
    if (event.talent_role_id && ["Casters", "Desk hosts / interviewers"].some(r => application.roles.includes(r))) {
        // give talent role
        member.roles.add(event.talent_role_id);
    }

    let channel = await guild.channels.fetch(event.staff_channel_id);
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
                "name": "Approved & given roles",
                "icon_url": "https://cdn.discordapp.com/attachments/485493459357007876/880277441392828486/check-mark-button_2705.png"
            }
        }]});
    }
}
