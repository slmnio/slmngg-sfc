<template>
    <div class="mvp-overlay">
        <div v-if="mvp">
            <div class="text-container">
                <div class="title-holder">
                    <ThemeTransition start="right" :theme="themeBackground" :active="animationActive" :starting-delay="100" :duration="500">
                        <div class="title" :style="borderColor">{{ title || 'MVP' }}</div>
                    </ThemeTransition>
                </div>

                <div class="text-holder">
                    <ThemeTransition start="right" :theme="themeBackground" :active="animationActive" :startingDelay="400" :duration="300">
                        <div class="player-name-holder" :style="themeBackground">
                            <ThemeLogo icon-padding="20%" border-width="0" :theme="mvpTeam && mvpTeam.theme" class="player-team-logo"></ThemeLogo>
                            <div class="player-name">{{ mvp.name }}</div>
                        </div>
                    </ThemeTransition>
                </div>
            </div>
            <transition name="hero-move">
                <div class="hero-container" v-show="animationActive && mvpTeam && mvpTeam.theme">
                    <recolored-hero class="hero" v-if="mvpTeam && mvpTeam.theme" :theme="mvpTeam.theme" :hero="hero"></recolored-hero>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import RecoloredHero from "@/components/broadcast/RecoloredHero";
import ThemeLogo from "@/components/website/ThemeLogo";
import { themeBackground1 } from "@/utils/theme-styles";
import ThemeTransition from "@/components/broadcast/ThemeTransition";

export default {
    name: "MVPOverlay",
    components: { ThemeTransition, ThemeLogo, RecoloredHero },
    props: ["broadcast", "title", "animationActive"],
    computed: {
        match() {
            return ReactiveRoot(this.broadcast?.live_match?.[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                mvp: ReactiveThing("mvp", {
                    member_of: ReactiveArray("member_of", {
                        theme: ReactiveThing("theme")
                    })
                })
            });
        },
        broadcastData() {
            return ReactiveRoot(this.broadcast?.id, {
                highlight_player: ReactiveThing("highlight_player"),
                highlight_team: ReactiveThing("highlight_team", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        mvp() {
            return this.match?.mvp || this.broadcastData?.highlight_player;
        },
        mvpTeam() {
            return this.relatedMvpTeam || this.broadcastData?.highlight_team;
        },
        relatedMvpTeam() {
            if (!this.mvp) return null;
            return (this.mvp.member_of || []).find(team => (this.match?.teams || []).some(t => t.id === team.id));
        },
        hero() {
            return this.broadcast?.highlight_hero || this.mvp?.favourite_hero;
        },
        borderColor() {
            return {
                borderColor: this.mvpTeam?.theme?.color_theme
            };
        },
        themeBackground() {
            return themeBackground1(this.mvpTeam);
        }
    },
    watch: {
        mvpTeam: {
            deep: true,
            handler(team) {
                if (team && team?.theme) {
                    this.$parent.updateTheme(team.theme);
                }
            }
        }
    },
    head() {
        return {
            title: `MVP | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .hero-container {
        position: absolute;
        width: 50vw;
        height: 130vh;
        right: -5vw;
        top: -12vh;
    }
    .text-container {
        position: absolute;
        width: 60vw;
        height: 100vh;
        text-align: center;
        justify-content: center;
        align-items: center;
        display: flex;
        flex-direction: column;
    }
    .text-holder {
        min-height: 168px;
    }
    .title-holder {
        min-height: 168px;
    }
    .title {
        display: flex;
        font-size: 6em;
        background-color: #222;
        color: white;
        padding: 0em .5em;
        border-bottom: 8px solid transparent;
        margin-bottom: .5em;
    }
    .player-name-holder {
        display: flex;
    }
    .player-name {
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-size: 5em;
        padding: 0 0.5em;
    }
    .player-name-holder {
        border-bottom: 8px solid transparent;
    }

    .mvp-overlay >>> .theme-transition,
    .mvp-overlay >>> .theme-transition-outer,
    .mvp-overlay >>> .theme-transition-inner {
        width: auto !important;
        height: auto !important;
    }

    .hero-move-enter-active { transition: all .5s; transform: translate(0%, 0%); transition-delay: 500ms; }
    .hero-move-leave-active { transition: none; }
    .hero-move-enter-from, .hero-move-leave-to { transform: translate(100%, 0%) }
    .hero-move-enter-to, .hero-move-leave-from { transform: translate(0%, 0%) }
</style>
