function cleanID(id) {
    if (!id) return null;
    if (typeof id !== "string") return id.id || null; // no real id oops
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

function aImg(airtableImage) {
    console.log(airtableImage);
    if (!airtableImage.length) return null;
    let i = airtableImage[0];
    return {
        url: i.url,
        width: i.width,
        height: i.height,
        type: i.type
    };
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
        console.log(data);
        let response = {
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

        response = {
            ...response,
            ...data,
        };

        if (data.title) response.title = `${data.title} | SLMN.GG`;
        if (data.name) response.title = `${data.name} | SLMN.GG`;
        if (data.image) response.image = data.image;
        if (data.imageURL) response.image = { url: data.image };
        if (data.description) response.description = data.description + "\n" + response.description;
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


                let data = {
                    title: thing.headline,
                    /* solo_description removes slmn.gg footer */
                    solo_description: thing.content.split("\n\n")[0].slice(0, 200)
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


    app.get("/meta/:path", async (req, res) => {
        try {
            if (!req.params.path) return res.status(400).send({ error: true, message: "no path included" });
            const path = req.params.path;
            let parts = path.split("/");
            let route = routes.find(r => r.url === parts[0]);
            if (route) {
                let data = await route.handle({ path, parts });
                if (!data) return res.status(500).send({ error: true, message: "router handler error" });
                return res.send(data);
            }
            return res.status(500).send({ error: true, message: "no router handler found" });
        } catch (e) {
            console.error(e);
            return res.send({ redirect: null, warn: "error occurred" });
        }
    });
};
