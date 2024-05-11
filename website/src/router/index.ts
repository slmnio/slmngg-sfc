import { createRouter as _createRouter, createWebHistory } from "vue-router";
import defaultRoutes from "@/router/default";
import MinisiteWrapperApp from "@/apps/MinisiteWrapperApp.vue";
import Event from "@/views/Event.vue";
import EventRoutes from "@/router/event";
import SharedRoutes from "@/router/shared-routes";
import NotFoundContent from "@/views/sub-views/NotFoundContent.vue";
import AuthRedirects from "@/router/auth-redirects";
import type { App } from "vue";


export function createRouter(app: App, subID?: string, subdomain?: string) {
    console.log({ subID, subdomain });

    if (!subdomain || !subID) {
        console.log("No minisite, using default routes");
        return {
            router: _createRouter({
                history: createWebHistory(import.meta.env.BASE_URL),
                routes: [
                    ...defaultRoutes,
                    ...AuthRedirects(app)
                ]
            }),
            subdomain: null
        };
    }

    console.log("Using minisite routes for", subdomain, "with ID", subID);
    return {
        router: _createRouter({
            history: createWebHistory(import.meta.env.BASE_URL),
            routes: [
                {
                    path: "/",
                    component: MinisiteWrapperApp,
                    children: [
                        ...SharedRoutes,
                        {
                            path: "/",
                            component: Event,
                            children: EventRoutes,
                            props: () => {
                                return {
                                    id: subID,
                                    isMinisite: true
                                };
                            }
                        },
                        ...AuthRedirects(app),
                        { path: "/:pathMatch(.*)*", component: NotFoundContent }
                    ]
                }
            ]
        }),
        subdomain
    };
}

