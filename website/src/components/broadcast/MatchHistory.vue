<template>
    <div class="match-history d-flex">
        <div class="item letter">{{ letter }}</div>
        <div class="item opponent-icon-holder flex-center default-thing" :style="opponentTheme.theme">
            <div class="opponent-icon bg-center" :style="opponentTheme.logo"></div>
        </div>
        <div class="item scores">{{ scores }}</div>
        <squeezable class="item date-section" align="right">
            <div v-if="match.sub_event" class="date date-sub-event fw-bold">
                <div>{{ match.sub_event }}</div>
            </div>
            <div v-if="match.round || match.week_text" class="date date-round">
                <div>{{ match.round || match.week_text }}</div>
            </div>
        </squeezable>
    </div>
</template>

<script>
import { logoBackground1 } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";
import Squeezable from "@/components/broadcast/Squeezable.vue";

export default {
    name: "MatchHistory",
    components: { Squeezable },
    props: ["match", "thisTeam", "showSubEvent"],
    computed: {
        opponent() {
            if (!this.match?.teams?.length) return null;
            if (!this.thisTeam) return null;
            return this.match.teams.find(t => t.id !== this.thisTeam.id);
        },
        opponentTheme() {
            if (!this.opponent?.theme) return {};
            return {
                logo: resizedImage(this.opponent.theme, ["small_logo", "default_logo"], "w-100"),
                theme: logoBackground1(this.opponent)
            };
        },
        thisGameIndex() {
            if (!this.match?.teams?.length) return null;
            if (!this.thisTeam) return null;
            return this.match.teams.findIndex(t => t.id === this.thisTeam.id);
        },
        letter() {
            if (this.thisGameIndex === null) return "-";
            const scores = [(this.match.score_1 || 0), (this.match.score_2 || 0)];
            if (scores[this.thisGameIndex] === this.match.first_to) {
                // win
                return "W";
            } else if (scores[+!this.thisGameIndex] === this.match.first_to) {
                // loss
                return "L";
            } else {
                // undecided
                return "-";
            }
        },
        scores() {
            if (this.thisGameIndex === null) return "";
            const scores = [(this.match.score_1 || 0), (this.match.score_2 || 0)];
            if (this.thisGameIndex === 0) {
                return scores.join(" - ");
            }
            return scores.reverse().join(" - ");
        }
    }
};
</script>

<style scoped>

.match-history {
    width: 100%;
    justify-content: center;
    align-items: center;
    font-size: 1.25em;
    margin: 0.1em 0;
    line-height: 1;
}

.item.letter {
    width: 1.75em;
    text-align: center;
    font-weight: bold;
    flex-shrink: 0;
}

.opponent-icon-holder {
    width: 1.5em;
    height: 1.5em;
    flex-shrink: 0;
}

.opponent-icon {
    width: 90%;
    height: 90%;
}

.item.scores {
    padding: 0 .5em;
    font-variant-numeric: tabular-nums;
    flex-grow: 1;
    flex-shrink: 0;
}

.item.date-section {
    margin: 0 .5em;
    font-size: 0.4em;
    text-align: right;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
}
.date {
    line-height: 1.2;
}
</style>
