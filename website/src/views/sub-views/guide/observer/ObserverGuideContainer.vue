<template>
    <div class="container">
        <h1>Observer Tech Guide</h1>

        <SubPageNav class="my-2">
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/observing-tech">1. Overview</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/observing-tech/virtual-cable">2. Virtual Cable</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/observing-tech/obs-setup">3. OBS Setup</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/observing-tech/obs-scenes">4. OBS Scenes</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/observing-tech/ow-settings">5. Overwatch Settings</router-link>
            </li>
        </SubPageNav>
        <router-view />
    </div>
</template>
<script>

import SubPageNav from "@/components/website/SubPageNav.vue";

export default {
    name: "ObserverGuideContainer",
    components: {
        SubPageNav
    },

    head() {
        return {
            title: "Observer Tech Guide"
        };
    }
};
</script>


