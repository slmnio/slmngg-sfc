<template>
    <div class="player-team-display d-flex flex-column" :style="teamBG">
        <div class="team-name flex-center text-center fw-bold" v-if="showName">{{ team.name }}</div>
        <div class="team-full-box d-flex">
            <div class="team-logo box flex-center">
                <div class="team-logo-inner bg-center" :style="teamLogo"></div>
                <div class="event-logo-inner bg-center" :style="eventLogo"></div>
            </div>
            <div class="team-rank box flex-center">
                <div class="ranking-text">{{ rankingText }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { logoBackground1 } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";

export default {
    name: "PlayerTeamDisplay",
    props: ["team", "showName"],
    computed: {
        teamBG() {
            return logoBackground1(this.team);
        },
        teamLogo() {
            return resizedImage(this.team?.theme, ["small_logo", "default_logo"], "h-100");
        },
        eventLogo() {
            return resizedImage(this.team?.event?.theme, ["small_logo", "default_logo"], "h-100");
        },
        rankingText() {
            if (!this.team?.ranking_text) return "N/A";
            return this.team?.ranking_text;
        }
    }
};
</script>

<style scoped>
    .team-name {
        line-height: .8;
        min-height: 28px;
    }
    .player-team-display {
        margin: .5em;
    }
    .box {
        --size: 80px;
        width: var(--size);
        height: var(--size);
        margin: .25em;
    }
    .team-logo-inner {
        width: 90%;
        height: 90%;
    }
    .team-rank {
        background-color: #111;
        color: white;
    }
    .team-rank .ranking-text {
        line-height: 1;
        font-weight: bold;
        font-size: 1.4em;
        text-align: center;
    }
    .event-logo-inner {
        position: absolute;
        width: 24px;
        height: 24px;
        bottom: 0;
        right: -5px;
    }
    .team-logo.box {
        position: relative;
    }
</style>
