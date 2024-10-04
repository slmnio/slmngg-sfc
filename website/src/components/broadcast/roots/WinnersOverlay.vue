<template>
    <div class="winners-overlay flex-center">
        <ConfettiOverlay v-if="useConfetti && winner" ref="confetti" :theme="winner?.theme" />
        <div class="winners-overlay-container flex-center">
            <div v-if="winner" class="winner-box flex-center">
                <div class="winner-logo-holder flex-center" :style="teamStyle">
                    <div class="winner-logo bg-center" :style="teamLogo"></div>
                </div>
            </div>
            <div class="text-box">
                <div class="team-name industry-align">{{ winner?.name }}</div>
                <div class="winners-text industry-align">{{ title || "Winners" }}</div>
            </div>
            <div class="roster-box flex-center flex-column">
                <div v-if="teamRoster?.players?.length" class="roster-row players flex-center">
                    <div v-for="player in teamRoster.players" :key="player" class="player">{{ player }}</div>
                </div>
                <div v-if="teamRoster?.staff?.length" class="roster-row staff flex-center">
                    <div v-for="player in teamRoster.staff" :key="player" class="player">{{ player }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { resizedImage } from "@/utils/images";
import { logoBackground1 } from "@/utils/theme-styles";
import ConfettiOverlay from "@/components/broadcast/roots/ConfettiOverlay.vue";

export default {
    name: "WinnersOverlay",
    components: { ConfettiOverlay },
    props: {
        broadcast: {},
        title: String,
        useConfetti: Boolean,
        animationActive: Boolean
    },
    computed: {
        match() {
            if (!this.broadcast?.live_match?.[0]) return null;
            return ReactiveRoot(this.broadcast?.live_match?.[0], {
                teams: ReactiveArray("teams", {
                    players: ReactiveArray("players"),
                    theme: ReactiveThing("theme")
                })
            });
        },
        winner() {
            const scores = [this.match?.score_1 || 0, this.match?.score_2 || 0];
            if (!scores.some(s => s === this.match?.first_to)) return null;
            return this.match.teams[scores[0] === this.match.first_to ? 0 : 1];
        },
        teamStyle() {
            if (!this.winner?.theme) return {};
            return logoBackground1(this.winner);
        },
        teamLogo() {
            if (!this.winner?.theme) return {};
            return resizedImage(this.winner?.theme, ["default_wordmark", "default_logo"], "w-1000");
        },
        teamRoster() {
            if (!this.winner) return { players: [], staff: [] };
            const people = this.winner.players || (this.winner.limited_players || []).filter(p => p.name) || [];
            const players = [];
            const staff = [];
            people.forEach(p => {
                if (["manager", "coach", "staff"].some(s => p.role?.toLowerCase().includes(s))) {
                    staff.push(p);
                } else {
                    players.push(p);
                }
            });
            (this.winner.team_staff || []).forEach(p => staff.push(p));
            return { players: players.map(p => p.name), staff: staff.map(p => p.name) };
        }
    },
    watch: {
        animationActive: {
            immediate: true,
            handler(active) {
                if (active) {
                    this.$refs.confetti?.startOrUpdateConfetti();
                }
            }
        }
    }
};
</script>
<style scoped>
    .winner-box {
        width: 60%;
        height: 80%;
        margin-bottom: 3vh;
    }

    .winners-overlay-container {
        height: 100vh;
        width: 100vw;
        flex-direction: column;
        padding: 5vh 5vw;
        z-index: 1;
    }

    .winner-logo-holder {
        width: 100%;
        height: 100%;
    }

    .text-box {
        font-weight: bold;
        text-transform: uppercase;
        font-size: 175px;
        line-height: 1.1;
        text-align: center;
        margin-bottom: 1vh;
    }

    .team-name {
        font-size: 0.6em;
    }

    .winner-logo {
        width: 80%;
        height: 80%;
    }

    .roster-box {
        font-size: 28px;
    }
    .roster-row {
        gap: 1em;
    }
    .roster-row.players {
        font-size: 1.5em;
        font-weight: bold;
        margin-bottom: .1em;
        flex-wrap: wrap;
        row-gap: 0;
    }
</style>
