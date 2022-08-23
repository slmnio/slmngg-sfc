<template>
    <div class="prev-match">
        <div class="prev-match-date" v-if="match.round || match.sub_event">{{ match.round || match.sub_event }}</div>
        <div class="prev-match-date" v-else-if="match.start">{{ goodDate }}</div>
        <div class="prev-match-result">{{ resultLetter }}</div>
        <router-link :to="url('detailed', match)" class="prev-match-vs">vs</router-link>
        <div class="prev-match-opponent default-thing flex-center flex-shrink-0" :style="teamTheme(opponent)"><div class="prev-match-opponent-logo bg-center" :style="largeIcon(opponent)"></div></div>
        <div class="prev-match-maps"><MapDisplay class="map"
                v-for="map in (match.maps || []).filter(map => map.number <= match.first_to || map.winner)"
                :key="map.id" :map="map" :theme="team.theme"
                :match="match" condensed="true"></MapDisplay></div>
    </div>
</template>

<script>
import { url } from "@/utils/content-utils";
import MapDisplay from "@/components/website/match/MapDisplay";
import { logoBackground1 } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";

export default {
    name: "PreviousMatch",
    props: ["match", "team"],
    components: { MapDisplay },
    computed: {
        winner() {
            if (!this.match?.first_to) return null;
            if ([this.match.score_1, this.match.score_2].some(t => t === this.match.first_to)) {
                // game is finished
                return this.match.teams[[this.match.score_1, this.match.score_2].findIndex(t => t === this.match.first_to)];
            } else {
                // game not finished
                return null;
            }
        },
        resultLetter() {
            if (!this.winner) return "-";
            if (this.winner.id === this.team.id) return "W";
            return "L";
        },
        opponent() {
            if (!this.match?.teams) return null;
            return this.match.teams.find(t => t.id !== this.team.id);
        },
        goodDate() {
            // if (!this.match.start) return '';
            let str = "";
            // const d = new Date(this.match.start);

            if (this.match.week) { str += "W" + this.match.week; }
            console.log(this.match.event);
            if (this.match.event && this.match.event[0] === "recp6F5Ym0YuBilAm" && this.match.day && this.match.day >= 2) {
                if (this.match.day) { str += " D" + (this.match.day - 1); }
            } else {
                if (this.match.day) { str += " D" + this.match.day; }
            }


            return str;
        }
    },
    methods: {
        teamTheme: (team) => logoBackground1(team),
        largeIcon: (team) => resizedImage(team?.theme, ["default_logo", "small_logo"], "h-50"),
        url
    }
};
</script>

<style scoped>
    .prev-match {
        display: flex;
        align-items: center;
        position: relative;
        min-height: 74px;
    }
    .prev-match-maps {
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
    }
    .prev-match-maps .map {
        max-width: 50px;
        height: 50px;
        flex-grow: 1;
        width: 100%;
    }
    .prev-match-maps >>> .map-image {
        padding-bottom: 100%;
    }


    .prev-match-opponent {
        width: 40px;
        height: 40px;
    }
    .prev-match-opponent-logo {
        width: calc(100% - 4px);
        height: calc(100% - 4px);
    }

    .prev-match-result {
        font-weight: bold;
        font-size: 30px;
        min-width: 30px;
        text-align: center;
    }
    .prev-match-vs {
        margin: 0 8px;
    }


    .prev-match-date {
        position: absolute;
        left: 0;
        font-size: .75em;
        width: 102px;
        text-align: center;
        line-height: 1;
        bottom: 0;
    }
</style>
