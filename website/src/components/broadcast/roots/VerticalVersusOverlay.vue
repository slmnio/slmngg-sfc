<template>
    <div class="versus-overlay d-flex flex-column">
        <transition name="fly-sides">
            <div v-if="animationActive" class="versus-block-holder flex-center">
                <div v-if="animationActive" class="header slant">
                    <div class="reverse-slant">UP NEXT</div>
                </div>
                <div v-for="team in teams" :key="team.id" class="team-text-box" :style="getTeamStyle(team)">
                        <div class="team-text">{{ team.name }}</div>
                </div>
                <div v-if="animationActive" class="vs slant">
                    <div class="reverse-slant">{{ versusText }}</div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { resizedImage } from "@/utils/images";
import { logoBackground1 } from "@/utils/theme-styles";

export default {
    name: "VerticalVersusOverlay",
    props: {
        broadcast: {},
        animationActive: Boolean
    },
    computed: {
        match() {
            if (!this.broadcast?.live_match?.[0]) return null;
            return ReactiveRoot(this.broadcast?.live_match?.[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        teams() {
            return this.match?.teams || [];
        },
        eventLogo() {
            if (!this.broadcast?.event?.theme) return {};
            return resizedImage(this.broadcast?.event?.theme, ["allmode_logo", "default_wordmark", "default_logo"], "h-154");
        },
        versusText() {
            const scores = [this.match?.score_1 || 0, this.match?.score_2 || 0];
            if (scores.some(s => s > 0)) {
                return scores.join(" - ");
            }
            return "VS";
        }
    },
    methods: {
        getTeamStyle(team) {
            return {
                ...logoBackground1(team)
            };
        },
        getTeamLogo(team) {
            return {
                ...resizedImage(team?.theme, ["default_wordmark", "default_logo"], "w-1000")
            };
        }
    }
};
</script>
<style scoped>
    .versus-overlay {
        width: 100vw;
        height: 100vh;
    }

    .versus-block-holder {
        margin: 210px 210px 0 210px;
        height: 100%;
        position: relative;
        flex-direction: column;
        row-gap: 8em;
    }

    .team-text-box {
        line-height: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .team-text {
        background-color: #333;
        color: white;
        text-transform: uppercase;
        font-weight: bold;
        font-size: 84px;
        text-align: center;
        padding: 0.25em 0.5em;
        line-height: 1;
    }
    .vs {
        position: absolute;
        font-size: 5em;
        font-weight: bold;
        background-color: white;
        width: 3em;
        text-align: center;
    }
    .header {
        position: absolute;
        top: calc(100% / 2 - 325px);
        font-size: 5em;
        font-weight: bold;
        background-color: white;
        width: 5em;
        text-align: center;
    }

    .slant {
        --skew: -20deg;
        transform: skewX(var(--skew));
    }
    .reverse-slant {
        transform: skewX(calc(var(--skew) * -1));
    }
</style>
