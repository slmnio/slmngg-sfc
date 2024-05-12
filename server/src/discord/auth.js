import fetch from "node-fetch";
import { updateRecord } from "../action-utils/action-utils.js";
import {
    createError,
    createRouter,
    defineEventHandler,
    getQuery,
    getRequestHeader,
    handleCors,
    readBody,
    useBase
} from "h3";
import { h3App } from "../index.js";


function discordEnvSet() {
    return ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET"].every(key => !!process.env[key])
        && ["DISCORD_REDIRECT_DOMAINS", "DISCORD_REDIRECT_URI"].some(key => !!process.env[key]);
}

function getRequestingDomain(origin) {
    // check it against our list
    let domains = (process.env.DISCORD_REDIRECT_DOMAINS || "").split(",");

    if (domains.includes(origin)) return origin;
    return "https://dev.slmn.gg";
}

export default ({ cors, Cache }) => {

    const authRouter = createRouter();
    authRouter.use("/**", defineEventHandler(async (event) => {
        handleCors(event, {
            origin: "*"
        });
    }));
    // tempAuthApp.options("/*", cors()); TODO CORS


    if (!discordEnvSet()) {
        // TODO Options for CORS
        authRouter.post("/*", defineEventHandler(async (event) => {
            throw createError({
                status: 503,
                message: "Discord authentication is disabled",
            });
        }));
        h3App.use("/auth", useBase("/auth", authRouter.handler));

        return console.warn("Discord authentication on the server is disabled. Set DISCORD_ keys in server/.env to enable it.");
    }


    // TODO CORS
    // TODO Options for CORS
    authRouter.post("/discord-login", defineEventHandler(async (event) => {
        // console.log("[auth] attempt", req.body);
        const { code } = getQuery(event);
        if (!code) throw createError({ status: 400, message: "No code sent to SLMN.GG server for Discord auth" }); // TODO error: true

        const origin = getRequestHeader(event, "origin");
        let tokens = await getToken(code, getRequestingDomain(origin));

        if (tokens.error) {
            throw createError({
                status: 401,
                message: "Discord authentication error",
                data: {
                    forADeveloper: tokens.error_description
                }
            });
        }

        let user = await getUser(tokens.access_token);
        // console.log("user", user);

        if (!user.discord) {
            throw createError({
                status: 401,
                message: "No Discord details",
                data: {
                    forADeveloper: "Couldn't fetch Discord account details"
                }
            });
        }
        if (!user.airtable) {
            console.log(`[Auth] No SLMN.GG profile for ${user.discord.id} ${user.discord.username}#${user.discord.discriminator}`);
            throw createError({
                status: 404,
                message: "No SLMN.GG profile found",
                data: {
                    forADeveloper: "Couldn't fetch Airtable account details"
                }
            });
        }

        let localToken = await Cache.auth.start({
            discordID: user.discord.id,
            airtableID: cleanID(user.airtable.id),
            user,
            tokens
        });

        console.log(`[login] Successful auth & login by ${user.airtable.name} ${user.airtable.id}`);

        return {
            error: false,
            token: localToken,
            user: cleanUser(user)
        };

        // res.status(501).send({ error: true, });
    }));


    authRouter.post("/login", defineEventHandler(async (event) => {
        const body = await readBody(event);
        const token = body?.token;
        if (!token) throw createError({ status: 400, message: "No token sent to SLMN.GG server for Discord auth" }); // TODO error: true

        let userData = await Cache.auth.getData(token);
        if (!userData?.user) throw createError({
            status: 404,
            message: "Unknown token",
            data: {
                for_a_developer: "No data associated with that token"
            }
        });


        console.log(`[login] Successful token login by ${userData.user.airtable.name} ${userData.user.airtable.id}`);

        return {
            error: false,
            user: cleanUser(userData.user)
        };
    }));

    h3App.use("/auth", useBase("/auth", authRouter.handler));


    async function getToken(code, origin) {

        // console.log("ZOOM DISCORD TIME");
        const data = {
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            redirect_uri: process.env.DISCORD_REDIRECT_URI || `${origin}/auth/discord/return`,
            grant_type: "authorization_code",
            code: code,
            scope: "identify"
        };

        const stringParams = Object.entries(data)
            .map(parts => parts.map(part => encodeURIComponent(part)).join("="))
            .join("&");

        let tokens = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            body: stringParams,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        let statusCode = tokens.status;
        tokens = await tokens.json();

        if (statusCode !== 200) {
            return {
                error: true,
                error_description: tokens,
            };
        }

        return tokens;
    }

    async function getUser(token) {
        let discord = await fetch("https://discord.com/api/users/@me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(res => res.json());

        let airtable = await getAirtablePlayer(discord);

        if (airtable && ![discord.username, `${discord.username}#${discord.discriminator}`].includes(airtable.discord_tag)) {
            const updatedUsername = discord.discriminator === "0" ? discord.username : `${discord.username}#${discord.discriminator}`;
            await updateRecord(Cache, "Players", airtable, { "Discord Tag": updatedUsername });
        }

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
        avatar: `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.png`,
        website_settings: user.airtable.website_settings || []
    });
}
