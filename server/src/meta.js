require("dotenv").config();
function cleanID(id) {
    if (!id) return null;
    if (typeof id !== "string") return id.id || null; // no real id oops
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

function getFileEnding(url) {
    let splits = url.split(".");
    return splits[splits.length - 1];
}

const dataServer = process.env.NODE_ENV === "development" ? "http://localhost:8901" : "https://data.slmn.gg";
function getResizedImage(airtableURL, size = "s-500") {
    // just using orig for now
    return `${dataServer}/image.${getFileEnding(airtableURL) || "png"}?size=orig&url=${encodeURIComponent(airtableURL)}`;
}

function aImg(airtableImage, size) {
    // console.log(airtableImage);
    if (!airtableImage || !airtableImage.length) return null;
    let i = airtableImage[0];
    return {
        width: i.width,
        height: i.height,
        type: i.type,
        url: getResizedImage(i.url, size)
    };
}
function themeSquare(id, size = 500) {
    if (!id) return null;
    return {
        width: size,
        height: size,
        type: "image/png",
        url: `${dataServer}/theme.png?id=${id}&size=${size}&padding=20`
    };
}
function matchWide(id, size = 500) {
    if (!id) return null;
    return {
        width: size * 2,
        height: size,
        type: "image/png",
        url: `${dataServer}/match.png?id=${id}&size=${size}&padding=30`
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

module.exports = ({ app, Cache }) => {

    async function subArrayNames(ids) {
        if (!ids?.length) return [];
        let things = await Promise.all((ids || []).map(id => Cache.get(id)));
        return things.filter(p => p.name).map(p => p.name);
    }

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

        // remove any keys that don't have a value so that they can be overridden by the default
        // this allows using optional chaining for values as one does not need to check that the result exists
        let cleanData = Object.fromEntries(Object.entries(data || {}).filter(([_, v]) => v != null));

        let response = {
            ...defaultResponse,
            ...cleanData,
        };

        if (cleanData.title) response.title = `${cleanData.title} | SLMN.GG`;
        if (cleanData.name) response.title = `${cleanData.name} | SLMN.GG`;
        if (cleanData.image) response.image = cleanData.image;
        if (cleanData.imageURL) response.image = { url: cleanData.image };
        if (cleanData.description) response.description = cleanData.description + "\n" + defaultResponse.description;
        if (cleanData.solo_description) response.description = cleanData.solo_description;

        if (cleanData.card_type) response.card_type = cleanData.card_type;

        return response;
    }

    const routes = [
        {
            url: "player",
            async handle({ parts }) {
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
            async handle({ parts }) {
                let thing = await Cache.get(cleanID(parts[1]));

                if (!thing.name) {
                    return null;
                }
                let theme = thing?.theme && await Cache.get(thing.theme[0]);

                return meta({
                    title: thing.name,
                    color: theme?.color_theme,
                    image: themeSquare(theme?.id)
                });
            }
        },
        {
            url: "team",
            async handle({ parts }) {
                let thing = await Cache.get(cleanID(parts[1]));
                if (!thing.name) {
                    return null;
                }

                let theme = thing?.theme && await Cache.get(thing.theme[0]);
                let event = thing?.event && await Cache.get(thing.event[0]);
                let captains = await subArrayNames(thing?.captains);
                let owners = await subArrayNames(thing?.owners);
                let players = await subArrayNames(thing?.players);
                let staff = await subArrayNames(thing?.staff);

                console.log(captains);

                let description = [];
                if (event?.name) description.push(`${thing.name} from ${event.name}.\n`);
                if (captains.length) description.push(`Captained by ${niceJoin(captains)}.`);
                if (owners.length) description.push(`Owned by ${niceJoin(owners)}.`);

                if (staff.length && players.length) {
                    // staff AND players
                    description.push(`The roster is ${niceJoin(players)}, and they're supported by their staff of ${niceJoin(staff)}.`);
                } else if (staff.length) {
                    // staff only
                    description.push(`The team staff are ${niceJoin(staff)}.`);
                } else if (players.length) {
                    // players only
                    description.push(`The roster is ${niceJoin(players)}.`);
                }

                return meta({
                    title: thing.name,
                    color: theme?.color_theme,
                    image: themeSquare(theme?.id),
                    description: description.join(" ")
                });
            }
        },
        {
            url: ["match", "detailed"],
            async handle({ parts }) {
                let thing = await Cache.get(cleanID(parts[1]));
                let data = {};
                let teams = await Promise.all((thing.teams || []).map(tID => Cache.get(tID)));

                if (thing.special_event) {
                    data.title = thing.custom_name;
                    if (teams.length === 2) data.description = teams.map(t => t.name).join(" vs ");
                } else if (thing.custom_name) {
                    // has custom name
                    data.title = thing.custom_name;
                    if (teams.length === 2) data.description = teams.map(t => t.name).join(" vs ");
                } else {
                    // standard match
                    if (teams.length === 2) {
                        data.title = teams.map(t => t.name).join(" vs ");
                    } else {
                        data.title = thing.name;
                    }
                }

                let event = await Cache.get(thing.event?.[0]);
                if (event) {
                    if (event?.name) data.title += ` | ${event.name}`;
                    let theme = await Cache.get(event.theme?.[0]);
                    if (thing.teams?.length === 2 || theme.id) {
                        data.image = matchWide(thing.id);
                    }
                    data.color = theme?.color_theme;
                }

                return meta(data);
            }
        },
        {
            url: "news",
            async handle({ parts }) {
                let thing = await Cache.get(`news-${parts[1]}`);
                if (!thing.headline) return;

                let event = thing?.event && await Cache.get(thing.event[0]);
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
                    solo_description: text.slice(0, cutoff) + (text.length > cutoff ? "..." : ""),
                    color: theme?.color_theme,
                    image: aImg(thing?.thumbnail, "w-1000") || aImg(thing?.header, "w-1000") || themeSquare(theme?.id),
                    card_type: (thing?.thumbnail || thing?.header) ? "summary_large_image" : null
                };

                return meta(data);
            }
        }
    ];

    const basicEventRoute = async ({ event }) => {
        let theme = event?.theme && await Cache.get(event.theme[0]);

        let data = {
            title: event.name,
            color: theme?.color_theme,
            image: themeSquare(theme?.id)
        };


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

    async function getRedirect(path = "", subdomain) {
        // get all redirects
        // see if any match path/subdomain combo
        // if it does, send back data for indexer

        let redirects = (await Cache.get("Redirects"))?.items;
        if (!path.startsWith("/")) path = "/" + path;
        path = path.trim().toLowerCase();
        if (!redirects?.length) return null;

        let redirect = redirects.find(r => {
            if (!r.active) return false;
            return (r.subdomain || undefined) === subdomain && r.incoming_url.trim().toLowerCase() === path;
        });

        if (!redirect) return null;
        return {
            error: false,
            redirect: true,
            url: redirect.outgoing_url
        };
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
            if (["slmn.gg", "dev.slmn.gg", "localhost"].includes(domain)) domain = null;

            if (domain) {
            // domain = SUBDOMAIN.SLMN.GG
                let subdomain = domain.split(".")[0];

                let redirect = await getRedirect(req.params.path, subdomain);
                if (redirect) return res.send(redirect);

                let event = await Cache.get(`subdomain-${subdomain}`);

                if (event && event.name && !isDefaultDomain(domain)) {
                // console.log(event);

                    // return if okay
                    const path = req.params.path || "";
                    let parts = path.split("/");

                    let route = eventRoutes.find(r => (typeof r.url === "object" ? r.url.includes(parts[0]) : r.url === parts[0]));
                    if (!route) route = routes.find(r => (typeof r.url === "object" ? r.url.includes(parts[0]) : r.url === parts[0]));

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

            let redirect = await getRedirect(req.params.path);
            if (redirect) return res.send(redirect);

            const path = req.params.path || "";
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
