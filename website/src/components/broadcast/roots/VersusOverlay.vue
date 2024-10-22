<template>
    <div class="versus-overlay d-flex flex-column">
        <transition v-if="!vertical" name="fly-down">
            <div v-if="animationActive" class="top-logo-holder flex-center">
                <div class="logo bg-center" :style="eventLogo"></div>
            </div>
        </transition>
        <transition name="fly-sides">
            <div v-if="animationActive" class="flex-center" :class="vertical ? 'versus-block-holder-vertical' : 'versus-block-holder'">
                <div v-if="animationActive && vertical" class="header-vertical slant">
                    <div class="reverse-slant">UP NEXT</div>
                </div>
                <div v-for="team in teams" :key="team.id" :class="vertical ? 'team-text-box-vertical' : 'team'" :style="getTeamStyle(team)">
                    <div v-if="!vertical" class="team-logo bg-center" :style="getTeamLogo(team)"></div>
                    <div v-if="!vertical" class="team-text-box">
                        <div class="team-text">{{ team.name }}</div>
                    </div>
                    <div v-if="vertical" class="team-text-vertical">{{ team.name }}</div>
                </div>
                <transition name="slide-out">
                    <div v-if="animationActive" class="slant" :class="vertical ? 'vs-vertical' : 'vs'">
                        <div class="reverse-slant">{{ versusText }}</div>
                    </div>
                </transition>
            </div>
        </transition>
    </div>
</template>
<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { resizedImage } from "@/utils/images";
import { logoBackground1 } from "@/utils/theme-styles";

export default {
    name: "VersusOverlay",
    props: {
        broadcast: {},
        animationActive: Boolean,
        vertical: Boolean
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

    .top-logo-holder {
        height: 192px;
        background-size: 340px;
        background-repeat: no-repeat;
        margin-top: 40px;
        margin-bottom: 10px;
    }

    .logo {
        height: 80%;
        width: 100%;
    }

    .team {
        width: 100%;
        height: 100%;
        padding: 75px 50px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    .versus-block-holder {
        margin: 0 210px;
        height: 660px;
        position: relative;
    }

    .versus-block-holder-vertical {
        margin: 210px 210px 0 210px;
        height: 100%;
        position: relative;
        flex-direction: column;
        row-gap: 8em;
    }

    .team-logo {
        height: 100%;
        width: 100%;
    }

    .team-text-box {
        width: 515px;
        position: absolute;
        line-height: 1;
        top: calc(100% - 150px);
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .team-text-box-vertical {
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
        font-size: 42px;
        text-align: center;
        padding: 0.25em 0.5em;
        width: 515px;
        position: absolute;
        line-height: 1;
    }
    .team-text-vertical {
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
        font-size: 3em;
        font-weight: bold;
        background-color: white;
        width: 3em;
        text-align: center;
    }
    .vs-vertical {
        position: absolute;
        font-size: 5em;
        font-weight: bold;
        background-color: white;
        width: 3em;
        text-align: center;
    }
    .header-vertical {
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

    .fly-down-enter-active {
        transition: 1s ease;
    }
    .fly-down-enter-from,
    .fly-down-leave-to {
        transform: translate(0, -232px);
    }


    .fly-sides-enter-active {
        transition: all 5s ease;
    }


    .fly-sides-enter-to .team {
        transform: translateX(0);
    }


    @keyframes left-in {
        0%, 25% { transform: translateX(-1000px); }
        100% { transform: translateX(0) }
    }

    .fly-sides-enter-active .team:nth-child(1) {
        animation: left-in forwards 2.5s ease;
    }


    @keyframes right-in {
        0%, 25% { transform: translateX(1000px); }
        100% { transform: translateX(0) }
    }
    .fly-sides-enter-active .team:nth-child(2) {
        animation: right-in forwards 2.5s ease;
    }

    @keyframes split-middle-out {
        0%, 85% {
            clip-path: polygon(50% 0, 50% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0);
        }
        100% {
            clip-path: polygon(0% 0%, 0% 100%, 50% 100%, 50% 0, 50% 0, 50% 100%, 100% 100%, 100% 0%);
        }
    }
    .fly-sides-enter-active .vs {
        animation: split-middle-out forwards 3s ease;
    }

    @keyframes split-middle-out-text {
        0%, 90% {
            clip-path: polygon(50% 0, 50% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0);
        }
        100% {
            clip-path: polygon(0% 0%, 0% 100%, 50% 100%, 50% 0, 50% 0, 50% 100%, 100% 100%, 100% 0%);
        }
    }

    .fly-sides-enter-active .team .team-text {
        animation: split-middle-out forwards 3.5s ease;
    }

</style>
