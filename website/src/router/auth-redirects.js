import NotFoundPage from "@/views/NotFoundPage";
import { isOnMainDomain, setAuthNext } from "@/utils/auth";
import { getMainDomain } from "@/utils/fetch";

export default (app, mainDomain) => ([
    {
        path: "/login",
        redirect: to => ({
            path: "/auth/discord/redirect",
            query: { return: to.params.return }
        })
    },
    {
        path: "/auth/discord/redirect",
        beforeEnter(to, from, next) {
            console.log("ZOOM DISCORD TIME", mainDomain, from.fullPath);

            if (!isOnMainDomain()) {
                console.log("[auth] Redirecting through main domain for next");
                return window.location.replace(getMainDomain() + `/login?return=${encodeURIComponent(window.location.origin + from.fullPath)}`);
            }

            setAuthNext(app?.$root, to.query.return || from.fullPath);

            const params = {
                client_id: process.env.VUE_APP_DISCORD_CLIENT_ID,
                redirect_uri: `${mainDomain}/auth/discord/return`,
                response_type: "code",
                scope: ["identify"].join(" ")
            };

            const stringParams = Object.entries(params)
                .map(parts => parts.map(part => encodeURIComponent(part)).join("="))
                .join("&");

            window.location.replace("https://discord.com/api/oauth2/authorize?" + stringParams);
        }
    },
    {
        path: "/*",
        component: NotFoundPage
    }
]);
