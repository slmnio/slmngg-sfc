<template>
    <div class="match-hero" :class="{'special-event': match.special_event}">
        <div v-if="match.event && !$root.minisiteEvent && !match.special_event" class="match-hero-event flex-center default-thing-border-bg" :style="eventStyle"></div>
        <div v-if="!match.special_event" class="match-hero-teams">
            <MatchHeroTeam v-for="team in match.teams" :key="team.id" class="team" :team="team" />
            <div v-if="match.event" class="match-hero-event-logo" :style="eventLogo"></div>
        </div>
        <div v-if="match.special_event" class="match-hero-text flex-grow-1 flex-center text-center" :style="eventStyle">
            {{ match.custom_name }}
        </div>
    </div>
</template>

<script>
import MatchHeroTeam from "@/components/website/match/MatchHeroTeam";
import { image } from "@/utils/content-utils";

export default {
    name: "MatchHero",
    components: { MatchHeroTeam },
    props: ["match"],
    computed: {
        eventStyle() {
            if (!this.match.event?.theme) return {};
            return {
                backgroundColor: this.match.event.theme.color_logo_background || this.match.event.theme.color_theme,
                color: this.match.event.theme.color_text_on_logo_background || this.match.event.theme.color_text_on_theme,
                borderColor: this.match.event.theme.color_logo_accent || this.match.event.theme.color_accent
            };
        },
        eventLogo() {
            if (!this.match.event?.theme) return {};
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
        min-height: 10em;
        background-color: rgba(0,0,0,0.15);
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

    .match-hero.special-event .match-hero-text {
        width: 100%;
        height: 100%;
        font-size: 4em;
        font-weight: bold;
        border-bottom: 8px solid transparent;
        line-height: 1;
    }

    .match-hero.special-event {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    /*.match-hero.special-event .match-hero-event {*/
    /*    width: 100%;*/
    /*}*/
</style>
