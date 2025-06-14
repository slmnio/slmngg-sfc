<template>
    <div v-if="mvp" class="mvp-overlay">
        <div class="text-container">
            <div class="all-text-holder">
                <div v-if="sponsor" class="sponsor-theme-holder">
                    <ThemeTransition
                        class="sponsor-theme-transition"
                        start="right"
                        :theme="sponsor"
                        :active="animationActive"
                        :starting-delay="200"
                        :duration="300">
                        <div v-if="showSponsor" class="sponsor-logo-holder flex-center">
                            <div class="sponsor-logo bg-center" :style="logo(sponsor)"></div>
                        </div>
                    </ThemeTransition>
                </div>
                <div class="title-holder">
                    <ThemeTransition
                        start="right"
                        :theme="themeBackground(broadcast?.event?.theme)"
                        :active="animationActive"
                        :starting-delay="100"
                        :duration="500">
                        <div class="title" :style="themeBackground(broadcast?.event?.theme)">{{ title || 'MVP' }}</div>
                    </ThemeTransition>
                </div>

                <div class="text-holder">
                    <ThemeTransition
                        start="right"
                        :theme="theme"
                        :active="animationActive"
                        :starting-delay="400"
                        :duration="300">
                        <div class="player-name-holder" :style="themeBackground(theme)">
                            <ThemeLogo
                                icon-padding="20%"
                                border-width="0"
                                :theme="mvpTeam && mvpTeam.theme"
                                class="player-team-logo" />
                            <div class="player-name">{{ mvp.name }}</div>
                        </div>
                    </ThemeTransition>
                </div>
            </div>
        </div>
        <transition name="hero-move">
            <div v-show="animationActive && mvpTeam && mvpTeam.theme" class="hero-container">
                <div
                    v-if="alternate"
                    class="alternate bg-center hero w-100 h-100"
                    :style="alternateHeroBG(hero, alternate)"></div>
                <recolored-hero v-else-if="mvpTeam && mvpTeam.theme" class="hero" :theme="mvpTeam.theme" :hero="hero" />
            </div>
        </transition>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import RecoloredHero from "@/components/broadcast/RecoloredHero";
import ThemeLogo from "@/components/website/ThemeLogo";
import { themeBackground } from "@/utils/theme-styles";
import ThemeTransition from "@/components/broadcast/ThemeTransition";
import { useStatusStore } from "@/stores/statusStore";
import { bg, resizedAttachment, resizedImage } from "@/utils/images";
import { cleanID } from "@/utils/content-utils";

export default {
    name: "MVPOverlay",
    components: { ThemeTransition, ThemeLogo, RecoloredHero },
    props: ["broadcast", "title", "animationActive", "showSponsor", "player", "team", "customHero", "alternate"],
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
            if (this.player) {
                // Load all event data if a player is passed (i.e. GFX or something)
                return ReactiveRoot(this.broadcast?.id, {
                    highlight_player: ReactiveThing("highlight_player"),
                    highlight_team: ReactiveThing("highlight_team", {
                        theme: ReactiveThing("theme")
                    }),
                    event: ReactiveThing("event", {
                        teams: ReactiveArray("teams", {
                            players: ReactiveArray("players"),
                            theme: ReactiveThing("theme")
                        })
                    })
                });
            } else {
                return ReactiveRoot(this.broadcast?.id, {
                    highlight_player: ReactiveThing("highlight_player"),
                    highlight_team: ReactiveThing("highlight_team", {
                        theme: ReactiveThing("theme")
                    })
                });

            }
        },
        mvp() {
            return this.player || this.match?.mvp || this.broadcastData?.highlight_player;
        },
        mvpTeam() {
            return this.relatedMvpTeam || this.broadcastData?.highlight_team;
        },
        relatedMvpTeam() {
            if (this.team) return this.team;
            if (this.player) {
                let playerTeam = (this.broadcastData?.event?.teams || []).find(team => (team?.players || []).find(player => cleanID(player.id) === cleanID(this.player?.id)));
                if (playerTeam) return playerTeam;
            }
            if (!this.mvp) return null;
            return (this.mvp.member_of || []).find(team => (this.match?.teams || []).some(t => t.id === team.id));
        },
        hero() {
            return this.customHero || this.broadcast?.highlight_hero || this.mvp?.favourite_hero;
        },
        borderColor() {
            return {
                borderColor: this.mvpTeam?.theme?.color_theme
            };
        },
        theme() {
            return (this.mvpTeam || this.broadcast?.event)?.theme;
        },
        sponsor() {
            if (!this.broadcast?.sponsors) return null;
            return ReactiveArray("sponsors", {
                theme: ReactiveThing("theme"),
            })(this.broadcast)[0];
        },
    },
    methods: {
        logo (theme) {
            return resizedImage(theme, ["default_wordmark", "default_logo"], "h-300");
        },
        themeBackground,
        alternateHeroBG(hero, alternateNum) {
            if (!hero) return {};
            const file = hero.alternate_set_image?.[alternateNum - 1];
            if (!file) return {};
            return bg(resizedAttachment(file, "orig"));
        },
    },
    watch: {
        mvpTeam: {
            deep: true,
            handler(team) {
                if (team?.theme) {
                    useStatusStore().customStingerTheme = team?.theme;
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
    .all-text-holder {
        text-align: center;
        justify-content: center;
        align-items: center;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .text-holder {
        min-height: 168px;
    }
    .title-holder {
        min-height: 168px;
    }
    .sponsor-theme-transition {
        margin-bottom: 2em;
    }
    .sponsor-logo-holder {
        width: 350px;
        height: 120px;
    }
    .sponsor-theme-holder {
        position: absolute;
        bottom: 100%;
    }
    .sponsor-logo {
        width: 80%;
        height: 80%;
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

    .mvp-overlay:deep(.theme-transition),
    .mvp-overlay:deep(.theme-transition-outer),
    .mvp-overlay:deep(.theme-transition-inner) {
        width: auto !important;
        height: auto !important;
    }

    .hero-move-enter-active { transition: all .5s; transform: translate(0%, 0%); transition-delay: 500ms; }
    .hero-move-leave-active { transition: none; }
    .hero-move-enter-from, .hero-move-leave-to { transform: translate(100%, 0%) }
    .hero-move-enter-to, .hero-move-leave-from { transform: translate(0%, 0%) }
</style>
