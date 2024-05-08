<template>
    <div class="container">
        <h1>Observer Guide</h1>

        <SubPageNav class="my-2">
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/observing">1. Overview</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/observing/virtual-cable">2. Virtual Cable</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/observing/obs-setup">3. OBS Setup</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/observing/obs-scenes">4. OBS Scenes</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/observing/ow-settings">5. Overwatch Settings</router-link>
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
            title: "Observer Guide"
        };
    }
};
</script>


