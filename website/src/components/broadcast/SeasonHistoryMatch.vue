<template>
    <div class="season-history-match">
        <ThemeLogo class="opponent-logo" :theme="opponent && opponent.theme" icon-padding="25" />
        <div class="status status--upcoming" v-if="lower === 'time'">
            <ScheduleTime :time="match.start" no-times :custom-timezone="timezone" />
        </div>
        <div class="status status--score" v-if="lower === 'score'">
            {{ scoreText }}
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import ScheduleTime from "@/components/website/schedule/ScheduleTime";
export default {
    name: "SeasonHistoryMatch",
    components: { ScheduleTime, ThemeLogo },
    props: ["match", "homeTeam", "timezone", "liveMatch"],
    computed: {
        opponent() {
            if (!this.match?.teams?.length) return null;
            if (!this.homeTeam) return null;
            return this.match.teams.find(t => t.id !== this.homeTeam.id);
        },
        scores() {
            if (!this.match?.teams?.length) return [];

            try {
                if (this.match.teams[0].id === this.homeTeam.id) return [this.match.score_1 || 0, this.match.score_2 || 0];
                return [this.match.score_2 || 0, this.match.score_1 || 0];
            } catch (e) {
                console.error(e);
            }
            return [this.match.score_1 || 0, this.match.score_2 || 0];
        },
        isLive() {
            return (this.liveMatch && this.match.id === this.liveMatch.id);
        },
        lower() {
            if (this.isLive) return "score";
            console.log(this.scores, this.scores.some(s => !!s));
            if (this.scores && this.scores.some(s => !!s)) return "score";
            return "time";
        },
        scoreText() {
            return this.scores.join(" - ");
        }
    }
};
</script>

<style scoped>
    .opponent-logo {
        width: 100%;
    }
    .status {
        text-align: center;
    }
</style>
