<template>
    <div class="container">
        <h1>Overwatch Settings Guide</h1>

        <SubPageNav class="my-2">
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/ow-settings">Intro</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/ow-settings/video">Video</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/ow-settings/sound">Sound</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/ow-settings/controls">Controls</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/ow-settings/gameplay">Gameplay</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/ow-settings/social">Social</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/ow-settings/a11y">Accessibility</router-link>
            </li>
        </SubPageNav>
        <router-view/>
    </div>
</template>
<script>

import SubPageNav from "@/components/website/SubPageNav.vue";

export default {
    name: "OverwatchSettingsGuideContainer",
    components: {
        SubPageNav
    },

    metaInfo() {
        return {
            title: "Overwatch Settings Guide"
        };
    }
};
</script>


