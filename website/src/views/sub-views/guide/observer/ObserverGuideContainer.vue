<template>
    <div class="container">
        <LearnTitleChip subtitle="Observer Tech Guide" />

        <SubPageNav class="my-2">
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'observing-tech-guide' }">1. Overview</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'observing-tech-virtual-cable' }">2. Virtual Cable</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'observing-tech-obs-setup' }">3. OBS Setup</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'observing-tech-obs-scenes' }">4. OBS Scenes</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'observing-tech-overwatch-settings' }">5. Overwatch Settings</router-link>
            </li>
        </SubPageNav>
        <router-view />
    </div>
</template>
<script>

import SubPageNav from "@/components/website/SubPageNav.vue";
import LearnTitleChip from "@/components/website/guide/LearnTitleChip.vue";

export default {
    name: "ObserverGuideContainer",
    components: {
        LearnTitleChip,
        SubPageNav
    },

    head() {
        return {
            title: "Observer Tech Guide"
        };
    }
};
</script>


