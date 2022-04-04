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
            let casters = (await Promise.all(live_match.casters.map(id => Cache.get(cleanID(id))))).map(caster => caster.name);
            return res.send(`Your casters for this match are ${niceJoin(casters)}!`);

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
};
