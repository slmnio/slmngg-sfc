import { isOnMainDomain, setAuthNext } from "@/utils/auth";
import { getMainDomain } from "@/utils/fetch";

export default (app, mainDomain) => ([
    {
        path: "/login",
        redirect: to => ({
            path: "/auth/discord/redirect",
            query: { return: to.query.return },
            beforeEnter(to, from, next) {
                console.log(to.query);
                next();
            }
        })
    },
    {
        path: "/auth/discord/redirect",
        beforeEnter(to, from, next) {
            console.log("ZOOM DISCORD TIME", mainDomain, from.fullPath, to.query.return, to, from);

            if (!isOnMainDomain()) {
                console.log("[auth] Redirecting through main domain for next q/m", to.query.return, window.location.origin + from.fullPath);
                return window.location.replace(getMainDomain() + `/login?return=${encodeURIComponent((to.query?.return?.includes("http") ? "" : window.location.origin) + (to.query.return || from.fullPath))}`);
            }

            setAuthNext(app?.$root, to.query.return || from.fullPath);

            const params = {
                client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
                redirect_uri: `${mainDomain}/auth/discord/return`,
                response_type: "code",
                scope: ["identify"].join(" ")
            };

            const stringParams = Object.entries(params)
                .map(parts => parts.map(part => encodeURIComponent(part)).join("="))
                .join("&");

            window.location.replace("https://discord.com/api/oauth2/authorize?" + stringParams);
        }
    }
]);
