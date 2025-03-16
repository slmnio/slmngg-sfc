<template>
    <div class="container">
        <LearnTitleChip subtitle="Solo Overlay Guide" />

        <SubPageNav class="my-2">
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'solo-overlay-guide' }">1. Intro</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'solo-overlay-installation' }">2. Installation</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'solo-overlay-setup' }">3. Setup</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'solo-overlay-usage' }">4. Usage</router-link>
            </li>
        </SubPageNav>
        <router-view />
    </div>
</template>
<script>

import SubPageNav from "@/components/website/SubPageNav.vue";
import LearnTitleChip from "@/components/website/guide/LearnTitleChip.vue";

export default {
    name: "SoloOverlayGuide",
    components: {
        LearnTitleChip,
        SubPageNav
    },
    head() {
        return {
            title: "Solo Overlay Guide"
        };
    }
};
</script>


