<template>
    <div class="container">
        <h1>Companion Module Guide</h1>
        <SubPageNav class="my-2">
            <li class="nav-item ct-passive">
                <router-link class="nav-link" to="/learn/guides/companion-module">Intro</router-link>
            </li>
        </SubPageNav>
        <router-view />
    </div>
</template>

<script>
import SubPageNav from "@/components/website/SubPageNav.vue";

export default {
    name: "CompanionModuleGuide",
    components: { SubPageNav },

    head() {
        return {
            title: "Companion Module Guide"
        };
    }
};
</script>
