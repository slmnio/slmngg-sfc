<template>
    <div class="hero-bans-overlay text-white d-flex flex-column h-100 w-100 flex-center">
        <div class="hero-bans-display d-flex">
            <div v-for="group in heroGroups" :key="group.role" class="hero-group" :class="{'role-has-current-ban': banStatus[group.role]?.hasCurrentBan }">
                <div class="role-title text-center" :style="boxColorCSS">{{ group.role }}</div>
                <div class="heroes">
                    <div
                        v-for="hero in group.heroes"
                        :key="hero.id"
                        class="hero"
                        :style="boxColorCSS"
                        :class="{
                            'is-currently-banned bg-danger text-white': banStatus[hero.id]?.currentlyBannedByTeam1 || banStatus[hero.id]?.currentlyBannedByTeam2,
                            'is-currently-banned-t1': banStatus[hero.id]?.currentlyBannedByTeam1,
                            'is-currently-banned-t2': banStatus[hero.id]?.currentlyBannedByTeam2
                        }">
                        <div
                            class="hero-icon bg-center"
                            :style="resizedImage(hero, ['icon', 'main_image'], 's-250')">
                            <div v-if="banStatus[hero.id]?.currentlyBannedByTeam1 || banStatus[hero.id]?.currentlyBannedByTeam2" class="currently-banned">
                                <div class="ban-gel w-100 h-100 bg-danger"></div>
                                <div class="ban-icon-center w-100 flex-center text-white"><i class="fas fa-ban"></i></div>
                            </div>


                            <div v-if="!banStatus[hero.id]?.currentlyBanned && banStatus[hero.id]?.bannedByTeam1" class="banned team-1">
                                <theme-logo
                                    icon-padding=".5em"
                                    :theme="liveMatch.teams[0]?.theme"
                                    class="ban-team-logo"
                                    border-width="3px"
                                    logo-size="s-50" />
                            </div>
                            <div v-else-if="banStatus[hero.id]?.currentlyBanned && banStatus[hero.id]?.bannedByTeam1" class="banned team-1 current-banned" :style="logoBackground1(liveMatch.teams?.[0])">
                                <div class="current-ban-text">BAN BY {{ liveMatch?.teams?.[0]?.code }}</div>
                            </div>


                            <div v-if="!banStatus[hero.id]?.currentlyBanned && banStatus[hero.id]?.bannedByTeam2" class="banned team-2">
                                <theme-logo
                                    icon-padding=".5em"
                                    :theme="liveMatch.teams[1]?.theme"
                                    class="ban-team-logo"
                                    border-width="3px"
                                    logo-size="s-50" />
                            </div>
                            <div v-else-if="banStatus[hero.id]?.currentlyBanned && banStatus[hero.id]?.bannedByTeam2" class="banned team-2 current-banned" :style="logoBackground1(liveMatch.teams?.[1])">
                                <div class="current-ban-text">BAN BY {{ liveMatch?.teams?.[1]?.code }}</div>
                            </div>
                        </div>
                        <div class="hero-name">{{ hero.name }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="bans-l3 flex-center">
            <div class="scoreboard-holder">
                <MatchScoreboard
                    v-if="liveMatch"
                    key="scoreboard"
                    :active="animationActive"
                    class="scoreboard"
                    :match="liveMatch"
                    :broadcast="broadcast"
                    custom-display="bans"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";
import { sortAlpha, sortRoles } from "@/utils/sorts.js";
import MatchScoreboard from "@/components/broadcast/MatchScoreboard.vue";
import { resizedImage } from "@/utils/images.js";
import { logoBackground, logoBackground1 } from "@/utils/theme-styles.js";
import ThemeLogo from "@/components/website/ThemeLogo.vue";

export default {
    name: "HeroBansOverlay",
    components: { ThemeLogo, MatchScoreboard },
    props: ["broadcast", "animationActive"],
    computed: {
        heroes() {
            const heroes = ReactiveRoot("Heroes", {
                ids: ReactiveArray("ids")
            })?.ids;
            return (heroes || []).filter(h => h.game === (this.broadcast?.event?.game || "Overwatch"));
        },
        banStatus() {
            const banStatus = {};

            (this.liveMatch?.maps || []).forEach(map => {
                if (map.banner) return;
                if (!map.team_1_bans?.length) return;
                const isCurrentlyBanned = this.currentMap?.id === map?.id;

                (map.team_1_bans || []).forEach(bannedHero => {
                    if (!bannedHero.id) return;

                    console.log(bannedHero);
                    if (!banStatus[bannedHero.id]) banStatus[bannedHero.id] = {};
                    banStatus[bannedHero.id].bannedByTeam1 = true;
                    if (isCurrentlyBanned) {
                        banStatus[bannedHero.id].currentlyBanned = true;
                        banStatus[bannedHero.id].currentlyBannedByTeam1 = true;

                        if (bannedHero.role) {
                            if (!banStatus[bannedHero.role]) banStatus[bannedHero.role] = {};
                            banStatus[bannedHero.role].hasCurrentBan = true;
                        }
                    }
                });

                (map.team_2_bans || []).forEach(bannedHero => {
                    if (!bannedHero.id) return;

                    console.log(bannedHero);
                    if (!banStatus[bannedHero.id]) banStatus[bannedHero.id] = {};
                    banStatus[bannedHero.id].bannedByTeam2 = true;
                    if (isCurrentlyBanned) {
                        banStatus[bannedHero.id].currentlyBanned = true;
                        banStatus[bannedHero.id].currentlyBannedByTeam2 = true;

                        if (bannedHero.role) {
                            if (!banStatus[bannedHero.role]) banStatus[bannedHero.role] = {};
                            banStatus[bannedHero.role].hasCurrentBan = true;
                        }
                    }
                });
            });

            return banStatus;
        },
        heroGroups() {
            const groups = {};
            (this.heroes || []).forEach(hero => {
                if (hero.role) {
                    if (!groups[hero.role]) groups[hero.role] = [];
                    groups[hero.role].push(hero);
                }
            });
            return Object.entries(groups).map(([role, heroes]) => ({
                role,
                heroes: heroes.sort((a, b) => sortAlpha(a, b, "name"))
            })).sort((a, b) => sortRoles(a.role, b.role));
        },
        liveMatch: function () {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                maps: ReactiveArray("maps", {
                    map: ReactiveThing("map"),
                    winner: ReactiveThing("winner", {
                        theme: ReactiveThing("theme")
                    }),
                    picker: ReactiveThing("picker", {
                        theme: ReactiveThing("theme")
                    }),
                    banner: ReactiveThing("banner", {
                        theme: ReactiveThing("theme")
                    }),
                    team_1_picks: ReactiveArray("team_1_picks"),
                    team_1_bans: ReactiveArray("team_1_bans"),
                    team_2_picks: ReactiveArray("team_2_picks"),
                    team_2_bans: ReactiveArray("team_2_bans"),
                })
            });
        },
        boxColorCSS() {
            return logoBackground(this.broadcast?.event?.theme);
        },
        currentMap() {
            const maps = (this.liveMatch?.maps || []).map((map, i) => ({
                ...map,
                number: map.number || i + 1
            })).filter(map => !map.banner);

            let currentMap = maps.find(map => !(map.draw || map.winner));
            if (!currentMap && maps.length) {
                currentMap = maps[maps.length - 1];
            }
            return currentMap;
        }
    },
    methods: { logoBackground1, resizedImage }
};
</script>

<style scoped>
.heroes {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: .5em
}

.hero {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: #373737;
    border-bottom: 4px solid transparent;
}

.hero-bans-display {
    gap: 4em;
}

.hero-icon {
    width: 7em;
    height: 7em;
    margin: .5em;
    margin-bottom: 0;
    position: relative;
}

.hero-name {
    font-weight: bold;
    font-size: 1.1em;
}

.bans-l3 {
    position: absolute;
    width: 100%;
    bottom: 0;
    margin-bottom: 20px;
}

.role-title {
    background-color: #373737;
    border-bottom: 4px solid transparent;
    font-weight: bold;
    font-size: 2em;
    margin: .25em 0;
}
.ban-team-logo {
    width: 3em;
    height: 3em;
}
.is-currently-banned-t1 .team-2 .ban-team-logo {
    width: 2em;
    height: 2em;
}
.is-currently-banned-t2 .team-1 .ban-team-logo {
    width: 2em;
    height: 2em;
}
.banned {
    position: absolute;
    bottom: 0;
}
.banned.team-1 {
    left: 0;
}
.banned.team-2 {
    right: 0;
}
.ban-gel {
    position: absolute;
    opacity: 0.5;
}
.ban-icon-center {
    font-size: 4em;
    position: absolute;
    height: 80%;
}

.current-banned {
    width: 100%;
}
.current-ban-text {
    width: 100%;
    text-align: center;
    line-height: 1;
    padding: 0.2em 0;
    font-weight: bold;
}
</style>
