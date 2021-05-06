<template>
    <div class="match-hero">
        <div class="match-hero-event flex-center" v-if="match.event" :style="eventStyle"></div>
        <div class="match-hero-teams">
            <MatchHeroTeam class="team" v-for="team in match.teams" v-bind:key="team.id" :team="team" />
            <div class="match-hero-event-logo" v-if="match.event" :style="eventLogo"></div>
        </div>
    </div>
</template>

<script>
import MatchHeroTeam from "@/components/MatchHeroTeam";
import { image } from "@/utils/content-utils";

export default {
    name: "MatchHero",
    components: { MatchHeroTeam },
    props: ["match"],
    computed: {
        eventStyle() {
            if (!this.match.event || !this.match.event.theme) return {};
            return {
                backgroundColor: this.match.event.theme.color_logo_background || this.match.event.theme.color_theme,
                color: this.match.event.theme.color_text_on_logo_background || this.match.event.theme.color_text_on_theme
            };
        },
        eventLogo() {
            if (!this.match.event || !this.match.event.theme) return {};
            return {
                backgroundImage: image(this.match.event.theme, "default_logo")
            };
        }
    }
};
</script>

<style scoped>
    .match-hero {
        position: relative;
    }
    .match-hero-teams {
        /*height: 25vh;*/
        display: flex;
    }
    .match-hero-event {
        height: 1em;
    }
    .match-hero-event-logo {
        height: 33%;
        width: 10%;
        bottom: 5%;
        left: 45%;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: bottom;
        position: absolute;
        z-index: 1;
    }
</style>
