<template>
    <div class="container">
        <LearnTitleChip subtitle="Companion Module Guide" />
        <SubPageNav class="my-2">
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ 'name': 'companion-module' }">Intro</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ 'name': 'companion-module-companion' }">Companion Setup</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ 'name': 'companion-module-module' }">Module Setup</router-link>
            </li>
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ 'name': 'companion-module-connections' }">Connections & Buttons</router-link>
            </li>
        </SubPageNav>
        <router-view />
    </div>
</template>

<script>
import SubPageNav from "@/components/website/SubPageNav.vue";
import LearnTitleChip from "@/components/website/guide/LearnTitleChip.vue";

export default {
    name: "CompanionModuleGuide",
    components: { LearnTitleChip, SubPageNav },

    head() {
        return {
            title: "Companion Module Guide"
        };
    }
};
</script>
