import Vue from "vue";
import VueRouter from "vue-router";
import WebsiteApp from "@/apps/WebsiteApp";
import defaultRoutes from "@/router/default";
import MinisiteWrapperApp from "@/apps/MinisiteWrapperApp";

Vue.use(VueRouter);

const host = window.location.hostname;
const domains = ["slmn.gg", "localslmn", "localhost"].map(d => new RegExp(`(?:^|(.*)\\.)${d.replace(".", "\\.")}(?:$|\\n)`));
let subdomain = null;

domains.forEach(r => {
    const result = host.match(r);
    if (result && result[1]) {
        subdomain = result[1];
    }
});

let routes = [];

if (subdomain) {
    /* start with only one route, loading route
    *
    * once we have verified & loaded the event, add other routes
    * if unverified, add a 404 */

    routes = [
        { path: "/", name: "default", component: WebsiteApp, children: [{ path: "*", component: MinisiteWrapperApp }] }
    ];
} else {
    routes = defaultRoutes;
}


const router = new VueRouter({
    mode: "history",
    base: import.meta.env.BASE_URL,
    routes
});

export default router;
