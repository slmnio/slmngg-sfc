const bodyParser = require("body-parser");
const fetch = require("node-fetch");

function discordEnvSet() {
    return ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET", "DISCORD_REDIRECT_URI"].every(key => process.env[key]);
}

module.exports = ({ app, router, cors, Cache, io }) => {
    if (!discordEnvSet()) return console.warn("Discord authentication on the server is disabled. Set DISCORD_ keys in server/.env to enable it.");

    const authApp = router;
    authApp.use(bodyParser.json());

    authApp.options("/*", cors());

    authApp.post("/discord-login", cors(), async (req, res) => {
        // console.log("[auth] attempt", req.body);
        const code = req.body?.code;
        if (!code) return res.status(400).send({ error: true, message: "No code sent to SLMN.GG server for Discord auth" });

        let tokens = await getToken(code);

        if (tokens.error) {
            return res.send({
                error: true,
                message: "Discord authentication error",
                for_a_developer: tokens.error_description
            });
        }

        let user = await getUser(tokens.access_token);
        // console.log("user", user);

        if (!user.discord) {
            return res.send({
                error: true,
                message: "No Discord details",
                for_a_developer: "Couldn't fetch Discord account details"
            });
        }
        if (!user.airtable) {
            return res.send({
                error: true,
                message: "No SLMN.GG profile found",
                for_a_developer: "Couldn't fetch Airtable account details"
            });
        }

        let localToken = await Cache.auth.start({
            discordID: user.discord.id,
            airtableID: cleanID(user.airtable.id),
            user,
            tokens
        });

        console.log(`[login] Successful auth & login by ${user.airtable.name} ${user.airtable.id}`);

        return res.send({
            error: false,
            token: localToken,
            user: cleanUser(user)
        });

        // res.status(501).send({ error: true, });
    });


    authApp.post("/login", cors(), async (req, res) => {
        const token = req.body?.token;
        if (!token) return res.status(400).send({ error: true, message: "No token sent to SLMN.GG server for Discord auth" });

        let userData = await Cache.auth.getData(token);
        if (!userData?.user) return res.status(404).send({ error: true, message: "Unknown token", for_a_developer: "No data associated with that token" });


        console.log(`[login] Successful token login by ${userData.user.airtable.name} ${userData.user.airtable.id}`);

        return res.send({
            error: false,
            user: cleanUser(userData.user)
        });
    });


    app.use("/auth", authApp);

    async function getToken(code) {

        // console.log("ZOOM DISCORD TIME");
        const data = {
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            redirect_uri: process.env.DISCORD_REDIRECT_URI,
            grant_type: "authorization_code",
            code: code,
            scope: "identify"
        };

        const stringParams = Object.entries(data)
            .map(parts => parts.map(part => encodeURIComponent(part)).join("="))
            .join("&");

        const tokens = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            body: stringParams,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(res => res.json());

        return tokens;
    }

    async function getUser(token) {
        let discord = await fetch("https://discord.com/api/users/@me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(res => res.json());

        let airtable = await getAirtablePlayer(discord);

        return { discord, airtable };
    }

    async function getAirtablePlayer(discordUser) {
        return Cache.auth.getPlayer(discordUser.id);
    }

};


function cleanID(id) {
    // console.log(">id", id);
    if (!id) return null;
    if (typeof id !== "string") return null;
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

function cleanUser(user) {
    // console.log("clean user", user);
    return ({
        discordID: user.discord?.id,
        airtableID: cleanID(user.airtable?.id),
        name: user.airtable.name,
        avatar: `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.png`
    });
}
