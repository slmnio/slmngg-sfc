<template>
    <div class="container">
        <LearnTitleChip subtitle="Producing Guide" />

        <SubPageNav class="my-2">
            <li class="nav-item ct-passive">
                <router-link class="nav-link" :to="{ name: 'producing-guide'}">Intro</router-link>
            </li>
        </SubPageNav>
        <router-view />
    </div>
</template>

<script>
import LearnTitleChip from "@/components/website/guide/LearnTitleChip.vue";
import SubPageNav from "@/components/website/SubPageNav.vue";

export default {
    name: "ProducingGuideContainer",
    components: {
        SubPageNav,
        LearnTitleChip
    }
};
</script>
