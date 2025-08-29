<template>
    <GenericOverlay
        class="hero-roster-overlay"
        :title="title || (team && team.name) || 'Roster'"
        :title-style="titleStyle"
        :custom-theme="team && team.theme"
        :accent-color="team && team.theme && team.theme.color_theme">
        <div class="flex-center h-100 w-100 flex-column">
            <div class="players h-100 d-flex flex-center">
                <div
                    v-for="(player, i) in players"
                    :key="player.id"
                    class="player h-100"
                    :class="{'has-role-icon': showRoles}"
                    :data-image-width="widths[i]"
                    :style="{flexGrow: widths[i], zIndex: animationActive ? Math.max(...widths) - widths[i] : 1}">
                    <RecoloredHero
                        v-if="player.favourite_hero?.recolor_layers"
                        class="h-100"
                        :hero="player.favourite_hero"
                        :theme="team.theme"
                        @recolor_width="(w) => handleWidth(i, w)" />
                    <div v-else class="player-static h-100 w-100 bg-center" :style="resizedImage(player.favourite_hero, ['recolor_base', 'main_image'], 'h-800')"></div>
                </div>
            </div>
            <div class="player-names flex-center w-100 mt-4 justify-content-around" :class="{'has-role-icon': showRoles}">
                <div v-for="player in players" :key="player.id" class="player-name-holder">
                    <div class="player-name flex-center text-center">
                        <span class="player-name-internal">{{ player.name }}</span>
                        <span v-if="showRoles" class="player-role" v-html="getRoleSVG(player.role)"></span>
                        <span v-if="showPronouns" :style="themeBackground1(team)" class="player-pronouns">{{ player.pronouns }}</span>
                    </div>
                </div>
            </div>
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import RecoloredHero from "@/components/broadcast/RecoloredHero";
import { themeBackground1 } from "@/utils/theme-styles";
import { decoratePlayerWithDraftData, getRoleSVG } from "@/utils/content-utils";
import { useStatusStore } from "@/stores/statusStore";
import { bg, resizedImage } from "@/utils/images.js";

export default {
    name: "HeroRosterOverlay",
    components: { RecoloredHero, GenericOverlay },
    props: ["broadcast", "title", "playerCount", "teamNum", "showRoles", "showPronouns", "active", "animationActive"],
    data: () => ({
        widths: []
    }),
    computed: {
        match() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players", {
                        favourite_hero: ReactiveThing("favourite_hero"),
                        signup_data: ReactiveArray("signup_data")
                    }),
                    staff: ReactiveArray("staff")
                })
            });
        },
        heroes() {
            return ReactiveRoot("Heroes", {
                ids: ReactiveArray("ids")
            })?.ids;
        },
        team() {
            if ([2, "2", "right", "alt"].includes(this.teamNum)) {
                return this.match?.teams?.[1];
            }
            if ([3, "3", "highlight", "highlighted"].includes(this.teamNum)) {
                return ReactiveRoot(this.broadcast.id, {
                    highlight_team: ReactiveThing("highlight_team", {
                        theme: ReactiveThing("theme"),
                        players: ReactiveArray("players", {
                            favourite_hero: ReactiveThing("favourite_hero")
                        })
                    })
                })?.highlight_team;
            }
            return this.match?.teams?.[0];
        },
        players() {
            const players = (this.team?.players || this.team?.limited_players || []).map(p => decoratePlayerWithDraftData(p, this.broadcast?.event?.id));
            if (!this.team?.players && this.team?.limited_players) {
                players.forEach(player => {
                    // set hero from lookup
                    player.favourite_hero = this.getFavouriteHero(player.favourite_hero);
                });
            }
            if (this.playerCount) return (players || []).slice(0, this.playerCount);
            return (players || []);
        },
        titleStyle() {
            return themeBackground1(this.team);
        }
    },
    methods: {
        resizedImage,
        bg,
        getFavouriteHero(heroName) {
            if (!heroName || !(this.heroes || []).length) return null;
            return this.heroes.find(h => h.name && h.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === heroName.toLowerCase());
        },
        handleWidth(i, w) {
            // console.log("width of index", i, w);
            this.widths[i] = w;
        },
        themeBackground1,
        getRoleSVG
    },
    watch: {
        team: {
            deep: true,
            handler(team) {
                useStatusStore().customStingerTheme = team?.theme;
                // this.$emit("stinger_theme_change", team.theme);
            }
        },
        active(a) {
            console.log("active", a);
        },
        animationActive(a) {
            console.log("animation active", a);
        }
    },
    head() {
        return {
            title: `Hero Roster #${this.teamNum || 1} | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .player:deep(.color-holder) {
        height: 100%;
        --oversize-width: 350%;
        width: calc(100% + var(--oversize-width));
        margin-left: calc(-0.5 * var(--oversize-width));
    }

    .player {
        /*width: 100%;*/
        flex-grow: 1;
    }

    .players {
        width: 100%;
    }

    .player:deep(.color-holder div),
    .player:deep(.color-holder canvas) {
        object-fit: contain !important;
    }

    .player:deep(.hero-image-base) {
        background-size: contain !important;
    }

    .recolored-hero {
        /*height: calc(100% - 2em) !important;*/
    }

    .player-name {
        z-index: 2;
        display: flex; justify-content: center; align-items: center;
        flex-shrink: 0;
        flex-grow: 0;
        font-size: 2em;
    }

    .hero-roster-overlay:deep(.g-body) {
        overflow: hidden;
        color: white;
    }

    .player-name {
        flex-direction: column;
    }
    .player-role {
        width: 2em;
    }
    .player.has-role-icon .player-name {
        height: 4.25em;
    }
    .player.has-role-icon .recolored-hero {
        /*height: calc(100% - 6em) !important;*/
    }
    .player-pronouns {
        padding: 0.25em 0.5em;
        font-size: 0.6em;
        line-height: 1;
        margin-top: .2em;
    }
</style>
