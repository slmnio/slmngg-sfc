<template>
  <div class="player-team-display d-flex flex-column" :style="teamBG">
    <div class="team-name flex-center text-center font-weight-bold" v-if="showName">{{team.name}}</div>
    <div class="team-full-box d-flex">
        <div class="team-logo box flex-center">
            <div class="team-logo-inner bg-center" :style="teamLogo"></div>
            <div class="event-logo-inner bg-center" :style="eventLogo"></div>
        </div>
        <div class="team-rank box flex-center">
            <div class="ranking-text">{{ team.ranking_text }}</div>
        </div>
    </div>
  </div>
</template>

<script>
import { logoBackground1 } from "@/utils/theme-styles";
import { cssImage } from "@/utils/content-utils";

export default {
    name: "PlayerTeamDisplay",
    props: ["team", "showName"],
    computed: {
        teamBG() {
            return logoBackground1(this.team);
        },
        teamLogo() {
            return cssImage("backgroundImage", this.team?.theme, ["small_logo", "default_logo"], 100);
        },
        eventLogo() {
            return cssImage("backgroundImage", this.team?.event?.theme, ["small_logo", "default_logo"], 100);
        }
    }
};
</script>

<style scoped>
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
