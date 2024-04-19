<template>
    <div class="container">
        <h1>BPL Observer Guide</h1>

        <SubPageNav class="my-2">
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/guide">Overview</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/guide/virtual-cable">Virtual Cable</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/guide/obs">OBS Setup</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/guide/obs-profile">OBS Profile</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/guide/ow-settings">Overwatch Settings</router-link>
            </li>
        </SubPageNav>
        <router-view/>
    </div>
</template>
<script>

import SubPageNav from "@/components/website/SubPageNav.vue";
import Social from "@/components/website/Social.vue";

export default {
    name: "Guide",
    components: {
        Social,
        SubPageNav
    },

    metaInfo() {
        return {
            title: "Guide"
        };
    }
};
</script>


