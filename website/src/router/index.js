import { createRouter as _createRouter, createWebHistory } from 'vue-router'
import defaultRoutes from "@/router/default";
import MinisiteWrapperApp from "@/apps/MinisiteWrapperApp";
import Event from "@/views/Event.vue";
import EventRoutes from "@/router/event";
import SharedRoutes from "@/router/shared-routes";
import NotFoundContent from "@/views/sub-views/NotFoundContent.vue";
import {fetchThings, getMainDomain} from "@/utils/fetch";


export async function createRouter() {
    const host = window.location.hostname;
    const domains = ["slmn.gg", "localslmn", "localhost"].map(d => ({
        main: d,
        r: new RegExp(`(?:^|(.*)\\.)${d.replace(".", "\\.")}(?:$|\\n)`)
    }));

    let subdomain = null;

    for (const { r} of domains) {
        const result = host.match(r);
        if (result && result[1] && !["dev", "live"].includes(result[1])) {
            if (result[1].endsWith(".dev")) {
                result[1] = result[1].slice(0, -4);
            }
            if (result[1].endsWith(".live")) {
                result[1] = result[1].slice(0, -5);
            }
            subdomain = result[1];
        }
    }

    if (!subdomain) {
        console.log("[subdomain]", "no subdomain, using default routes");

        return _createRouter({
            history: createWebHistory(import.meta.env.BASE_URL),
            routes: defaultRoutes
        });
    }

    console.log("[subdomain]", `found ${subdomain}, checking for minisite`);

    const data = await fetchThings([`subdomain-${subdomain}`]);

    if (!data || !data[0] || !data[0].id) {
        console.log("[subdomain]", "no valid minisite");
        return _createRouter({
            history: createWebHistory(import.meta.env.BASE_URL),
            routes: defaultRoutes
        });
    }

    let subID;

    subID = data[0]._original_data_id || data[0].id;
    // store.dispatch("subscribe", subID);
    // store.dispatch("subscribe", `subdomain-${subdomain}`);
    console.log("[subID]", subID);

    return _createRouter({
        history: createWebHistory(import.meta.env.BASE_URL),
        routes: [
            {
                path: "/",
                component: MinisiteWrapperApp,
                children: [
                    {
                        path: "/",
                        component: Event,
                        children: EventRoutes,
                        props: (route) => {
                            return {
                                id: subID,
                                isMinisite: true
                            };
                        }
                    },
                    ...SharedRoutes,
                    { path: '/:pathMatch(.*)*', component: NotFoundContent }
                ]
            }
        ]
    });
}

