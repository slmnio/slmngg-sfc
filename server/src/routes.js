const fetch = require("node-fetch");
const { updateRecord,
    createRecord
} = require("./action-utils");
const { exchangeCode } = require("@twurple/auth");

function cleanID(id) {
    if (!id) return null;
    if (typeof id !== "string") return id.id || null; // no real id oops
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

function niceJoin(array) {
    if (array.length > 1) {
        let last = array.pop();
        return array.join(", ") + " and " + last;
    }
    return array[0];
}

module.exports = ({ app, cors, Cache, io }) => {
    app.get("/redirect", async (req, res) => {
        try {
            let redirects = (await Cache.get("Redirects"))?.items;

            let subdomain = req.query.subdomain || null;
            let path = req.query.path;
            if (!path.startsWith("/")) path = "/" + path;
            path = path.trim().toLowerCase();


            if (!redirects) return res.send({ redirect: null, warn: "no redirects loaded" });

            let redirect = redirects.find(r => {
                if (!r.active) return false;
                // check subdomain & urls match
                return (r.subdomain || null) === subdomain && r.incoming_url.trim().toLowerCase() === path;
            });

            if (!redirect) redirect = redirects.find(r => {
                if (!r.active) return false;
                // if we can't find anything on the specific subdomain, use a global one
                if (r.subdomain) return false;
                return (r.incoming_url.trim().toLowerCase() === path);
            });

            if (!redirect) {
                return res.send({ redirect: null });
            }

            res.send({
                redirect
            });
        } catch (e) {
            console.error(e);
            return res.send({ redirect: null, warn: "error occurred" });
        }
    });

    async function getBroadcast(streamURL) {
        let broadcasts = (await Cache.get("Broadcasts"))?.ids;
        if (!broadcasts) return { "error": true, "message": "No broadcast data is available right now. Check https://slmn.gg for information." };
        broadcasts = await Promise.all(broadcasts.map(id => Cache.get(cleanID(id))));

        if (!broadcasts) return { "error": true, "message": "No broadcast data is available right now. Check https://slmn.gg for information." };
        let broadcast = broadcasts.find(b => b.active && b.stream_link && b.stream_link.toLowerCase() === streamURL.toLowerCase());
        return { "error": false, data: broadcast};
    }

    async function getLiveMatch(streamURL) {
        let broadcast = await getBroadcast(streamURL);
        if (broadcast.error) return { "error": true, message: broadcast.message };
        if (!broadcast || !broadcast.data) return { "error": true, "message": "No broadcast data is available right now. Check https://slmn.gg for information." };
        broadcast = broadcast.data;

        if (!broadcast.live_match || broadcast.live_match.length === 0) return { "error": true, "message": "No match is live." };
        let live_match = await Cache.get(cleanID(broadcast.live_match[0]));
        if (!live_match) return { "error": true, "message": "No match is live." };
        return { "error": false, data: live_match};
    }

    app.get("/casters", async (req, res) => {
        try {
            if (!req.query.stream) return res.send("The 'stream' query is required.");

            let live_match = await getLiveMatch(req.query.stream);
            if (live_match.error) return res.send(live_match.message);
            live_match = live_match.data;

            if (!live_match.casters || live_match.casters.length === 0) return res.send("No casters are linked to this match.");
            let casters = (await Promise.all(live_match.casters.map(id => Cache.get(cleanID(id))))).map(caster => caster.name + (caster.twitter_link?.length ? ": " + caster.twitter_link[0].replace("https://", "").toLowerCase() + " ": ""));
            return res.send(`Your casters for this match are ${niceJoin(casters)}`);

        } catch (e) {
            console.error(e);
            return res.send("An error occurred loading data");
        }
    });

    app.get("/production", async (req, res) => {
        try {
            if (!req.query.stream) return res.send("The 'stream' query is required.");

            let live_match = await getLiveMatch(req.query.stream);
            if (live_match.error) return res.send(live_match.message);
            live_match = live_match.data;

            if (!live_match.player_relationships || live_match.player_relationships.length === 0) return res.send("No staff are linked to this match.");
            let player_relationships = (await Promise.all(live_match.player_relationships.map(id => Cache.get(cleanID(id)))));

            let groups = {};
            player_relationships.forEach(rel => {
                if (!groups[rel.singular_name]) groups[rel.singular_name] = {
                    singular_name: rel.singular_name,
                    plural_name: rel.plural_name,
                    items: []
                };
                groups[rel.singular_name].items.push(rel.player_name[0]);
            });

            return res.send("Your production staff for this match are: " + Object.entries(groups).map(([groupName, group]) => {
                if (group.items.length > 1) {
                    return `${group.plural_name}: ${niceJoin(group.items)}`;
                }
                return `${group.singular_name}: ${group.items[0]}`;
            }).join(" / "));

        } catch (e) {
            console.error(e);
            return res.send("An error occurred loading data");
        }
    });

    async function getEventURL(streamURL) {
        let broadcast = await getBroadcast(streamURL);
        if (broadcast.error) return { "error": true, "message": broadcast.message };
        broadcast = broadcast.data;
        if (!broadcast) return { "error": true, "message": "No broadcast data is available right now. Check https://slmn.gg for information." };
        if (!broadcast.event) return { "error": true, "message": "No event is linked to this stream." };
        let event = await Cache.get(cleanID(broadcast.event[0]));

        let url = "";

        if (event.subdomain) {
            url = `https://${event.subdomain}.slmn.gg/`;
        } else {
            url = `https://slmn.gg/event/${cleanID(event.id)}/`;
        }
        return { "error": false, data: url };
    }

    app.get("/link", async (req, res) => {
        try {
            if (!req.query.stream) return res.send("The 'stream' query is required.");
            // if (!req.query.to) return res.send("The 'to' query is required.");
            let url = await getEventURL(req.query.stream);
            if (url.error) return res.send(url.message);
            url = url.data;

            res.send(`${url}${req.query.to || ""}`);
        } catch (e) {
            console.error(e);
            return res.send("An error occurred loading data");
        }
    });

    app.get("/trigger", async (req, res) => {
        console.log(req.query.client, req.query.event, `prod:client-${req.query.client}`);
        if (!req.query?.event || !req.query?.client) return res.send("event and client are required.");
        io.to(`prod:client-${req.query.client}`).emit(req.query.event, "go");
        return res.send(":) ok bet");
    });

    function getdtz(time) {
        return [
            time.getUTCFullYear().toString().padStart(4, "0"),
            (time.getUTCMonth() + 1).toString().padStart(2, "0"),
            time.getUTCDate().toString().padStart(2, "0"),
            "T",
            time.getUTCHours().toString().padStart(2, "0"),
            time.getUTCMinutes().toString().padStart(2, "0"),
            time.getUTCSeconds().toString().padStart(2, "0"),
            "Z"
        ].join("");
    }

    function addHours(date = new Date(), num) {
        // console.log(date, "+", num, date.getTime(), (num * 60 * 60 * 1000), date.getTime() + (num * 60 * 60 * 1000), new Date(date.getTime() + (num * 60 * 60 * 1000)));
        return new Date(date.getTime() + (num * 60 * 60 * 1000));
    }
    function addMins(date = new Date(), num) {
        // console.log(date, "+m", num, date.getTime(), (num * 60 * 1000), date.getTime() + (num * 60 * 1000), new Date(date.getTime() + (num * 60 * 1000)));
        return new Date(date.getTime() + (num * 60 * 1000));
    }

    function getMatchCal(match, event) {
        let start = new Date(match.start);
        let end = new Date(match.start);

        if (match.duration) {
            end = addMins(start, match.duration);
        } else {
            if (match.first_to === 2) {
                end = addHours(start, 1);
            }
            if (match.first_to === 3) {
                end = addHours(start, 2);
            }
        }

        if (start.getTime() === end.getTime()) {
            end = addHours(start, 1);
        }

        let matchDesc = [];
        if (event && event.name) { matchDesc.push("Event: " + event.name); }
        if (match.vod) { matchDesc.push("Stream: " + match.vod); }
        let subdomain = event.subdomain || event.partial_subdomain;
        matchDesc.push(`Match details: https://${subdomain ? `${subdomain}.` : ""}slmn.gg/match/${match.id.slice(3)}`);

        matchDesc.push("");
        matchDesc.push("Synced from SLMN.GG");
        if (match.modified) matchDesc.push(`Last updated: ${new Date(match.modified).toUTCString()}.`);
        matchDesc.push(`Last synced: ${new Date().toUTCString()}.`);

        return [
            "BEGIN:VEVENT",
            `UID:evt-${match.id}@slmn.gg`,
            `DTSTAMP:${getdtz(new Date(match.created))}`,
            `DTSTART:${getdtz(start)}`,
            `DTEND:${getdtz(end)}`,
            `SUMMARY:${match.name}`,
            `DESCRIPTION:${matchDesc.join("\\n")}`,
            "END:VEVENT"
        ];
    }

    function getCalCol(hex) {
        if (!hex) return null;
        hex = hex.replace("#", "");
        return [
            hex.slice(0,2),
            hex.slice(2,4),
            hex.slice(4,6)
        ].map(hex => parseInt(hex, 16)).join(":");
    }

    async function generateCal(event) {
        let theme = (event.theme ? await Cache.get(event.theme[0]) : null);
        let matches = await Promise.all(event.matches.map(id => Cache.get(id)));
        matches = matches.filter(m => m.start).map(m => getMatchCal(m, event));
        if (!matches.length) return null;
        let cal = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//2022//SLMN.GG//EN",
            "METHOD:PUBLISH",
            "CALSCALE:GREGORIAN",
            `NAME:${event.name} (SLMN.GG)`,
            `X-WR-CALNAME:${event.name} (SLMN.GG)`,
            `COLOR:${theme ? getCalCol(theme.color_theme) : "64:64:64"}`,
            "REFRESH-INTERVAL;VALUE=DURATION:PT10M",
            "X-PUBLISHED-TTL:PT10M"
        ];
        matches.forEach(matchCal => {
            cal = [
                ...cal,
                ...matchCal,
            ];
        });
        cal.push("END:VCALENDAR");
        return cal.join("\n");
    }

    app.get("/ical", async (req, res) => {
        try {
            if (!req.query.event) return res.status(400).send("The 'event' query is required");
            let event = await Cache.get(req.query.event);
            if (!event || event.__tableName !== "Events") return res.status(400).send("Unknown event");

            let ical = await generateCal(event);
            if (!ical) return res.status(400).send("No matches scheduled");

            return res.header("Content-Type", "text/calendar").send(ical);
        } catch (e) {
            console.error(e);
            return res.status(500).send(e.message);
        }
    });

    let states = {};

    function createState() {
        // return a uuid without a library
        let uuid = "";
        for (let i = 0; i < 32; i++) {
            uuid += Math.floor(Math.random() * 16).toString(16);
        }
        return uuid;
    }
    const TwitchEnvSet = ["TWITCH_REDIRECT_URI", "TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET"].every(key => !!process.env[key]);
    if (!TwitchEnvSet) {
        console.error("Twitch authentication on the server is disabled. Set TWITCH_ keys in server/.env to enable it.");
    }

    app.get("/twitch_auth/:scopes", (req, res) => {
        if (!TwitchEnvSet) return res.status(503).send({ error: true, message: "Twitch authentication is disabled on the server." });
        let state = createState();
        states[state] = req.params.scopes;
        res.redirect(`https://id.twitch.tv/oauth2/authorize?client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_REDIRECT_URI}&response_type=code&scope=${req.params.scopes}&force_verify=true`);
    });


    app.get("/twitch_callback", async(req, res) => {
        if (!TwitchEnvSet) return res.status(503).send({ error: true, message: "Twitch authentication is disabled on the server." });
        try {
            const tokenInfo = await exchangeCode(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET, req.query.code, process.env.TWITCH_REDIRECT_URI);

            let scopes = states[req.query.state];
            if (scopes) delete states[req.query.state];

            // get or create channel in table
            const channelIDs = (await Cache.get("Channels"))?.ids || [];
            const channels = await Promise.all(channelIDs.map(id => Cache.get(id)));
            console.log(channels);
            const existingChannel = channels.find(c => c.channel_id === tokenInfo.userId);

            let airtableResponse;
            // store into channels table with tokens + scopes

            if (existingChannel) {
                airtableResponse = await updateRecord(Cache, "Channels", existingChannel.id, {
                    "Twitch Refresh Token": tokenInfo.accessToken,
                    "Twitch Scopes": tokenInfo.scopes.join(" "),
                    "Channel ID": tokenInfo.userId,
                    "Name": tokenInfo.userName
                });
            } else {
                airtableResponse = await createRecord(Cache, "Channels", [{
                    "Twitch Refresh Token": tokenInfo.accessToken,
                    "Twitch Scopes": tokenInfo.scopes.join(" "),
                    "Channel ID": tokenInfo.userId,
                    "Name": tokenInfo.userName
                }]);
            }

            // console.log(airtableResponse);

            return res.send("okay thanks");
        } catch (e) {
            console.error("[Twitch Auth] error", e);
            res.status(400).send({ error: true, errorMessage: e.message});
        }
    });

};
