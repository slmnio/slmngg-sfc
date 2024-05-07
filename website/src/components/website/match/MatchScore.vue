<template>
    <div v-if="match.first_to" class="match-scoreline">
        <div
            v-for="(score, i) in scores"
            :key="i"
            class="match-score flex-center default-thing"
            :class="{'match-score-win': score === match.first_to }"
            :style="{order: i*2, ...(score === match.first_to ? {... pointColor} : {})}">
            {{ displayScores[i] }}
        </div>
        <div class="match-score-center">-</div>
    </div>
</template>

<script>
export default {
    name: "MatchScore",
    props: ["match"],
    computed: {
        scores() {
            return [this.match.score_1, this.match.score_2];
        },
        displayScores() {
            if (this.match.first_to === 1 && this.match.valorant) {
                const valorantData = Object.fromEntries(this.match.valorant.split("|").map(section => section.split(":")));
                if (valorantData?.rounds) {
                    const score = [0, 0];
                    valorantData.rounds.toLowerCase().trim()
                        .split(",")
                        .map(frag => ({
                            left: frag.slice(0, 1) === "l"
                        })).forEach(e => e.left ? score[0]++ : score[1]++);
                    return score;
                }
            }
            if (this.match.first_to === 1 && this.match.maps?.filter(m => !(m.banner)).length === 1) {
                const map = this.match.maps.find(m => !(m.banner));
                if (map.id && (map.score_1 !== undefined && map.score_2 !== undefined)) {
                    return [map.score_1, map.score_2];
                }
            }
            return this.scores;
        },
        pointColor() {
            if (!this.match?.event?.theme?.color_theme) return {};
            return {
                backgroundColor: this.match.event.theme.color_theme,
                color: this.match.event.theme.color_text_on_theme
            };
        }
    }
};
</script>

<style scoped>
    .match-scoreline {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .match-score {
        font-size: 3em;
        width: 1.4em;
        height: 1.4em;
        font-weight: bold;
        line-height: 1;
        padding-bottom: 8px;
        background: #333;
    }
    .match-score-center {
        font-size: 1.5em;
        width: 1em;
    }
    .default-thing.match-score-win {
        background-color: rgba(255, 255, 255, 0.2);
        /* TODO: add hydration transition  */
    }
</style>
