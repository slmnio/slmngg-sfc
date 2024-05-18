<template>
    <div class="container">
        <LearnTitleChip subtitle="Observer Settings Guide" />

        <SubPageNav class="my-2">
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'overwatch-settings'}">Intro</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'overwatch-settings-tool'}"><i class="fa fa-sparkles mr-1"></i> Automatic Settings Tool</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'overwatch-settings-video'}">Video</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'overwatch-settings-sound'}">Sound</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'overwatch-settings-controls'}">Controls</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'overwatch-settings-gameplay'}">Gameplay</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'overwatch-settings-social'}">Social</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'overwatch-settings-a11y'}">Accessibility</router-link>
            </li>
        </SubPageNav>
        <router-view />
    </div>
</template>
<script>

import SubPageNav from "@/components/website/SubPageNav.vue";
import LearnTitleChip from "@/components/website/guide/LearnTitleChip.vue";

export default {
    name: "OverwatchSettingsGuideContainer",
    components: {
        LearnTitleChip,
        SubPageNav
    },

    head() {
        return {
            title: "Overwatch Settings Guide"
        };
    }
};
</script>


