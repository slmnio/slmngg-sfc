<template>
    <div class="match-hero-team flex-center default-thing" :style="teamBG" v-if="team">
        <div class="team-logo" :style="teamLogo"></div>
        <router-link :to="url('team', team)" :style="teamText" class="team-name no-link-style">{{ team.name }}</router-link>
    </div>
</template>

<script>
import { url } from "@/utils/content-utils";
import { resizedImage } from "@/utils/images";

export default {
    name: "MatchHeroTeam",
    props: ["team"],
    methods: { url },
    computed: {
        teamLogo() {
            if (!this.team?.theme) return {};
            return resizedImage(this.team.theme, ["default_wordmark", "default_logo"], "w-1000");
        },
        teamBG() {
            if (!this.team?.theme) return {};
            return {
                backgroundColor: this.team.theme.color_logo_background || this.team.theme.color_theme
            };
        },
        teamText() {
            if (!this.team?.theme) return {};
            return {
                color: this.team.theme.color_text_on_logo_background || this.team.theme.color_text_on_theme
            };
        }
    }
};
</script>

<style scoped>
    .match-hero-team {
        position: relative;
        width: 50%;
        /*height: 100%;*/
        min-height: 10em;
    }
    .team-logo {
        position: absolute;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        filter: blur(2px);
        opacity: 0.1;
    }
    .team-name {
        z-index: 1;
        font-size: 4em;
        font-weight: bold;
        text-align: center;
        line-height: 1;
        margin: .25em 2vw;
        text-decoration: none;
    }

    @media (max-width: 767px) {
        .team-name {
            font-size: 2em
        }
    }
</style>
