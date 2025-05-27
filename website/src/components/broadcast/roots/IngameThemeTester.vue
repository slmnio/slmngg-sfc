<template>
    <div class="ingame-theme-tester ingame-overlay" style="position: relative">
        <div class="top-overlay">
            <IngameTeam
                v-for="team in (teams || [])"
                :key="team.id"
                :event="broadcast?.event"
                class="branding-ingame-team my-2"
                :team="team"
                :active="true" />
        </div>
    </div>
</template>

<script>
import IngameTeam from "@/components/broadcast/IngameTeam.vue";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive.js";

export default {
    name: "IngameThemeTester",
    components: { IngameTeam },
    props: ["broadcast"],
    computed: {
        teams() {
            return ReactiveArray("teams", {
                "theme": ReactiveThing("theme")
            })(this.broadcast?.event || {});
        }
    }
};
</script>

<style scoped>
.top-overlay {
    position: relative;
    transition: margin-top .2s;
    --team-height: 48px;
    --side-margins: 43px;
    --side-margins: 0px;
    margin-left: var(--side-margins);
    margin-right: var(--side-margins);
    padding-bottom: 30px;

    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    max-height: 100vh;
}
.branding-ingame-team {
    top: 0;
    position: relative;
}
.ingame-theme-tester {
    background-color: #abf1eb;
    overflow: scroll;
    max-height: 100vh;
}
</style>
