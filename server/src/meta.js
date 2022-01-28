function cleanID(id) {
    if (!id) return null;
    if (typeof id !== "string") return id.id || null; // no real id oops
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

function aImg(airtableImage) {
    // console.log(airtableImage);
    if (!airtableImage.length) return null;
    let i = airtableImage[0];
    return {
        url: i.url,
        width: i.width,
        height: i.height,
        type: i.type
    };
}

function stripMarkdown(md) {
    try {
        return md.replace(/\[([^\]]*)\]\(([^)]*)\)/g, "$1") // replace links [$1]($2) with $1
            .replace(/\*\*([^\*]*)\*\*/g, "$1"); // replace bold **$1** with $1
    } catch (e) {
        console.error(e);
        return md;
    }
}

function niceJoin(array) {
    if (array.length > 1) {
        let last = array.pop();
        return array.join(", ") + " and " + last;
    }
    return array[0];
}

module.exports = ({ app, cors, Cache }) => {


    //     $meta = (object)[
    //         "title" => " | SLMN.GG",
    //         "image" => (object)[
    //         "url" => "https://preds.slmn.io/media/gigabrain-square.png",
    //         "width" => 450,
    //         "height" => 450
    //      ],
    //     "description" => " \nView this and other SLMN-affiliated events, teams and matches on SLMN.GG",
    //         "color" => "#111111"
    //      ];
    function meta(data) {
        // console.log(data);
        let defaultResponse = {
            title: "SLMN.GG",
            image: {
                "url" : "https://preds.slmn.io/media/gigabrain-square.png",
                "width" : 450,
                "height" : 450
            },
            description: "View this and other SLMN-affiliated events, teams and matches on SLMN.GG",
            color: "#111111",
            card_type: "summary"
        };

        let response = {
            ...defaultResponse,
            ...data,
        };

        if (data.title) response.title = `${data.title} | SLMN.GG`;
        if (data.name) response.title = `${data.name} | SLMN.GG`;
        if (data.image) response.image = data.image;
        if (data.imageURL) response.image = { url: data.image };
        if (data.description) response.description = data.description + "\n" + defaultResponse.description;
        if (data.solo_description) response.description = data.solo_description;

        if (data.card_type) response.card_type = data.card_type;

        return response;
    }

    const routes = [
        {
            url: "player",
            async handle({ path, parts }) {
                let thing = await Cache.get(cleanID(parts[1]));

                if (!thing.name) {
                    return null;
                }

                return meta({
                    title: thing.name,
                    ...(thing.overwatch_icon ? {
                        image: { url: thing.overwatch_icon,
                            width: 128, height: 128 }
                    } : {}),
                    description: `${thing.name}'s player profile.`
                });
            }
        },
        {
            url: "event",
            async handle({ path, parts }) {
                let thing = await Cache.get(cleanID(parts[1]));

                if (!thing.name) {
                    return null;
                }
                let theme = thing?.theme && await Cache.get(thing.theme[0]);

                let data = {
                    title: thing.name
                };
                if (theme) {
                    data.color = theme.color_theme;
                }
                if (!data.image && theme?.default_wordmark) data.image = aImg(theme.default_wordmark);
                if (!data.image && theme?.default_logo) data.image = aImg(theme.default_logo);
                return meta(data);
            }
        },
        {
            url: ["match", "detailed"],
            async handle({ path, parts }) {
                let thing = await Cache.get(cleanID(parts[1]));
                let data = {};

                if (thing.special_event) {
                    data.title = thing.custom_name;
                } else {
                    // standard match
                    let teams = await Promise.all((thing.teams || []).map(tID => Cache.get(tID)));
                    data.title = thing.custom_name || teams.map(t => t.name).join(" vs ");
                }

                let event = await Cache.get(thing.event?.[0]);
                if (event) {
                    if (event?.name) data.title += ` | ${event.name}`;
                    let theme = await Cache.get(event.theme?.[0]);

                    if (!data.image && theme?.default_wordmark) data.image = aImg(theme.default_wordmark);
                    if (!data.image && theme?.default_logo) data.image = aImg(theme.default_logo);
                    if (theme.color_theme) data.color = theme.color_theme;
                }

                return meta(data);
            }
        },
        {
            url: "news",
            async handle({ path, parts }) {
                let thing = await Cache.get(`news-${parts[1]}`);
                if (!thing.headline) return;

                let event = thing.event && await Cache.get(thing.event[0]);
                let theme = event?.theme && await Cache.get(event.theme[0]);


                /*
                need to get:
                - title -> news.headline
                - description -> news.content (truncated, markdown stripped?)
                - color -> news.event.theme
                - image -> news.thumbnail or news.header or news.event.theme.default_wordmark
                * */


                let text = stripMarkdown(thing.content).split("\n\n")[0];
                let cutoff = 300;
                let data = {
                    title: thing.headline,
                    /* solo_description removes slmn.gg footer */
                    solo_description: text.slice(0, 300) + (text.length > 300 ? "..." : "")
                };
                if (theme) {
                    data.color = theme.color_theme;
                }
                if (thing.thumbnail) {
                    data.image = aImg(thing.thumbnail);
                    data.card_type = "summary_large_image";
                }
                if (!data.image && thing.header) {
                    data.image = aImg(thing.header);
                    data.card_type = "summary_large_image";
                }
                if (!data.image && theme?.default_wordmark) data.image = aImg(theme.default_wordmark);
                if (!data.image && theme?.default_logo) data.image = aImg(theme.default_logo);

                return meta(data);
            }
        }
    ];

    const basicEventRoute = async ({ event, path, parts }) => {
        let data = {
            title: event.name
        };

        let theme = event?.theme && await Cache.get(event.theme[0]);
        // console.log(event);
        if (theme) data.color = theme.color_theme;
        if (!data.image && theme?.default_wordmark) data.image = aImg(theme.default_wordmark);
        if (!data.image && theme?.default_logo) data.image = aImg(theme.default_logo);

        let things = [];
        if (event.teams?.length) things.push("team" + (event.teams.length === 1 ? "" : "s"));
        if (event.matches?.length) things.push("schedule");
        if (event.brackets?.length) things.push("bracket" + (event.brackets.length === 1 ? "" : "s"));
        if (event.news_items?.length) things.push("articles");
        if (event.player_relationships?.length) things.push("staff");

        if (things.length > 0) {
            data.description = `See the ${niceJoin(things)} for the ${event.name}!`;
        } else {
            data.description = `See information for the ${event.name}!`;
        }

        return meta(data);
    };
    const eventRoutes = [
        {
            url: "",
            handle: basicEventRoute
        },
        {
            url: ["bracket", "brackets"],
            async handle({ event, path, parts }) {
                let data = await basicEventRoute({ event, path, parts });
                return {
                    ...data,
                    title: `Bracket | ${data.title}`
                };
            }
        },
        {
            url: ["schedule", "matches"],
            async handle({ event, path, parts }) {
                let data = await basicEventRoute({ event, path, parts });
                return {
                    ...data,
                    title: `Schedule | ${data.title}`
                };
            }
        },
        {
            url: "news",
            async handle({ event, path, parts}) {
                let eventMeta = await basicEventRoute({ event, path, parts });
                let newsMeta = await routes.find(r => r.url === "news").handle({ path, parts });
                if (!newsMeta) return null;
                return {
                    ...newsMeta,
                    color: eventMeta.color || newsMeta.color,
                    solo_description: newsMeta.solo_description || eventMeta.description,
                    card_type: newsMeta.card_type || "summary",
                    image: newsMeta.image || eventMeta.image
                };
            }
        }
    ];
    function isDefaultDomain(domain) {
        return [
            "slmn.gg",
            "dev.slmn.gg",
            "localhost",
            "localslmn",
        ].includes(domain.toLowerCase());
    }

    app.get("/meta/:path?", async (req, res) => {

        /*
        *  need to detect whether it's a standard slmn.gg/ (or equivalent) request
        *    or a subdomain.slmn.gg request
        * */

        try {
            if (!req.params.path && !req.query.domain) {
                return res.status(400).send({ error: true, message: "no path or domain included" });
            }

            let domain = req.query.domain;

            if (domain) {
            // domain = SUBDOMAIN.SLMN.GG
                let subdomain = domain.split(".")[0];

                let event = await Cache.get(`subdomain-${subdomain}`);

                if (event && event.name && !isDefaultDomain(domain)) {
                // console.log(event);

                    // return if okay
                    const path = req.params.path || "";
                    let parts = path.split("/");

                    let route = eventRoutes.find(r => (typeof r.url === "object" ? r.url.includes(parts[0]) : r.url === parts[0]));

                    if (route) {
                        let data = await route.handle({ event, path, parts });
                        if (!data) return res.status(500).send({ error: true, message: "router handler error" });
                        return res.send(data);
                    }
                    return res.status(500).send({ error: true, message: "no event router handler found" });

                } else {
                    if (!req.params.path) return res.status(400).send({ error: true, message: "couldn't find event and no path is provided." });
                }
            }

            // standard slmn.gg/event


            const path = req.params.path;
            let parts = path.split("/");

            const route = routes.find(r => (typeof r.url === "object" ? r.url.includes(parts[0]) : r.url === parts[0]));

            if (route) {
                let data = await route.handle({ path, parts });
                if (!data) return res.status(500).send({ error: true, message: "router handler error" });
                return res.send(data);
            }
            return res.status(500).send({ error: true, message: "no router handler found" });
        } catch (e) {
            console.error(e);
            return res.send({ error: true, message: "error occurred" });
        }
    });
};
