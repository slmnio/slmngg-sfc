<template>
    <GenericOverlay class="hero-roster-overlay" :title="title || (team && team.name) || 'Roster'" :title-style="titleStyle" :custom-theme="team && team.theme" :accent-color="team && team.theme && team.theme.color_theme">
        <div class="players h-100 d-flex flex-center">
            <div class="player h-100" v-for="player in players" :key="player.id">
                <RecoloredHero class="h-100" :hero="player.favourite_hero" :theme="team.theme"></RecoloredHero>
                <div class="player-name flex-center text-center">{{ player.name }}</div>
            </div>
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import RecoloredHero from "@/components/broadcast/RecoloredHero";
import { themeBackground1 } from "@/utils/theme-styles";

export default {
    name: "HeroRosterOverlay",
    props: ["broadcast", "title", "playerCount", "teamNum"],
    components: { RecoloredHero, GenericOverlay },
    computed: {
        match() {
            if (!this.broadcast || !this.broadcast.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players", {
                        favourite_hero: ReactiveThing("favourite_hero")
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
            const players = this.team?.players || this.team?.limited_players;
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
        getFavouriteHero(heroName) {
            if (!heroName || !(this.heroes || []).length) return null;
            return this.heroes.find(h => h.name && h.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === heroName.toLowerCase());
        }
    },
    watch: {
        team: {
            deep: true,
            handler(team) {
                // console.log("team change", this.$parent);
                this.$parent.updateTheme(team.theme);
                // this.$emit("stinger_theme_change", team.theme);
            }
        }
    },
    metaInfo() {
        return {
            title: `Hero Roster #${this.teamNum || 1} | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .player >>> .color-holder {
        height: 100%;
        --over: 350%;
        width: calc(100% + var(--over));
        margin-left: calc(-0.5 * var(--over));
    }

    .player {
        /*width: 100%;*/
        flex-grow: 1;
    }

    .players {
        width: 100%;
    }

    .player >>> .color-holder div,
    .player >>> .color-holder canvas {
        object-fit: contain !important;
    }

    .player >>> .hero-image-base {
        background-size: contain !important;
    }

    .recolored-hero {
        height: calc(100% - 4em) !important;
    }

    .player-name {
        z-index: 2;
        display: flex; justify-content: center; align-items: center;
        flex-shrink: 0;
        flex-grow: 0;
        height: 3em;
        font-size: 2em;
    }

    .hero-roster-overlay >>> .g-body {
        overflow: hidden;
        color: white;
    }
</style>
