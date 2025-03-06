<template>
    <div class="boxed-hero-roster-overlay">
        <div class="team-header">
            <theme-logo :theme="team?.theme" logo-size="w-200" border-width="8px" />
            <div class="team-text overlay--text-on-bg">
                <div class="team-name industry-align">{{ team?.name }}</div>
                <div v-if="decoratedSubtitle" class="team-subtitle industry-align">{{ decoratedSubtitle }}</div>
            </div>
        </div>

        <div v-if="showStaff" class="staff-wrapper overlay--text-on-bg">
            <div v-if="managers" class="staff manager">{{ managers }}</div>
            <div v-if="coaches" class="staff coach">{{ coaches }}</div>
        </div>
        <div class="player-wrapper">
            <div class="players h-100 d-flex flex-center">
                <div
                    v-for="(player, i) in players"
                    :key="player.id"
                    class="player-holder w-100 h-100"
                    :class="{'has-role-icon': showRoles}">
                    <theme-transition
                        :active="animationActive"
                        :theme="team?.theme"
                        start="top"
                        end="bottom"
                        inner-class="player"
                        :starting-delay="i * 100"
                        :leaving-delay="0"
                    >
                        <div
                            v-if="alternate"
                            class="alternate bg-center hero w-100"
                            :style="alternateHeroBG(player.favourite_hero, alternate)"></div>
                        <div v-else class="recolored-hero-holder hero w-100">
                            <RecoloredHero
                                v-if="team?.theme"
                                :hero="player.favourite_hero"
                                :theme="team?.theme" />
                        </div>
                        <div class="player-name-holder" :style="themeBackground1(team)">
                            <div class="player-name flex-center text-center px-1">
                                <span class="player-name-internal">{{ player.name }}</span>
                                <span
                                    v-if="showRoles === 'eligible'"
                                    class="flex-center player-eligible-roles">
                                    <span v-for="role in playerEligibleRoles(player)" :key="role" class="player-role flex-center" v-html="getRoleSVG(role)"></span>
                                </span>
                                <span
                                    v-else-if="showRoles && (player?.this_event_signup_data?.main_role || player.role)"
                                    class="player-role"
                                    v-html="getRoleSVG(player?.this_event_signup_data?.main_role || player.role)"></span>
                                <span
                                    v-if="showPronouns"
                                    :style="themeBackground1(team)"
                                    class="player-pronouns">{{ player.pronouns }}</span>
                            </div>
                        </div>
                    </theme-transition>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import RecoloredHero from "@/components/broadcast/RecoloredHero";
import { logoBackground1, themeBackground1 } from "@/utils/theme-styles";
import { autoRecord, cleanID, decoratePlayerWithDraftData, getRoleSVG } from "@/utils/content-utils";
import { bg, resizedAttachment, resizedImage } from "@/utils/images";
import { useStatusStore } from "@/stores/statusStore";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import ThemeTransition from "@/components/broadcast/ThemeTransition.vue";
import { sortRoles } from "@/utils/sorts.js";

function niceJoin(array, and = "and") {
    if (array.length > 1) {
        const last = array.pop();
        return array.join(", ") + ` ${and} ` + last;
    }
    return array[0];
}

export default {
    name: "BoxedHeroRosterOverlay",
    components: {
        ThemeLogo,
        RecoloredHero,
        ThemeTransition
    },
    props: ["broadcast", "title", "playerCount", "teamNum", "showRoles", "showPronouns", "active", "animationActive", "subtitle", "alternate", "showStaff", "fill"],
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
                    matches: ReactiveArray("matches", {
                        teams: ReactiveArray("teams")
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
                        }),
                        "matches": ReactiveArray("matches", {
                            "teams": ReactiveArray("teams")
                        })
                    })
                })?.highlight_team;
            }
            return this.match?.teams?.[0];
        },
        decoratedSubtitle() {
            let text;
            if ((this.broadcast?.broadcast_settings || [])?.includes("Show match records ingame")) {
                console.log("auto small text", this.team, this.team?.matches);
                text = autoRecord(this.team, this.broadcast?.current_stage || this.match?.match_group);
            }
            return (this.subtitle || "").replace("{small}", (this.team?.small_overlay_text || text || ""));
        },
        teamLogo() {
            return resizedImage(this.team?.theme, ["default_logo", "small_logo"], "w-200");
        },
        allPlayers() {
            return this.team?.players || this.team?.limited_players;
        },
        players() {
            let players = this.team?.players || this.team?.limited_players;
            if (!this.team?.players && this.team?.limited_players) {
                players.forEach(player => {
                    // set hero from lookup
                    player.favourite_hero = this.getFavouriteHero(player.favourite_hero);
                });
            }
            if (this.playerCount) players = (players || []).slice(0, this.playerCount);

            if ((this.match?.teams || []).some(team => cleanID(team?.id) === cleanID(this.team?.id))) {
                // only work with teams on broadcast live match
                const isSecondTeam = cleanID(this.team?.id) === cleanID(this.match?.teams?.[1]?.id);

                const broadcast = ReactiveRoot(this.broadcast?.id, {
                    "team_1_cams": ReactiveArray("team_1_cams", {
                        "player": ReactiveThing("player", {
                            "favourite_hero": ReactiveThing("favourite_hero")
                        })
                    }),
                    "team_2_cams": ReactiveArray("team_2_cams", {
                        "player": ReactiveThing("player", {
                            "favourite_hero": ReactiveThing("favourite_hero")
                        })
                    })
                });

                const cams = broadcast?.[isSecondTeam ? "team_2_cams" : "team_1_cams"] || [];
                if (cams.length) {
                    players = cams.map(cam => cam?.player);
                }
            }

            // const heroes = (this.heroes || [])?.filter(h => h.game === "Marvel Rivals");
            // const page = 5;
            // players = heroes.slice(page * 6, (page + 1) * 6).map(x => ({ ...x, favourite_hero: x }));
            const fillingHeroes = (this.fill || []).map(str => this.getFavouriteHero(str));

            return (players || []).sort((a, b) => {
                console.log(a, b);
                if (a._draftData?.role !== b._draftData?.role) {
                    const order = ["DPS", "Tank", "Support"];
                    return order.indexOf(a._draftData?.role) - order.indexOf(b._draftData?.role);
                }
                return 0;
            }).map(p => {
                const player = decoratePlayerWithDraftData(p, this.broadcast?.event?.id);

                if (!player?.favourite_hero) {
                    player.favourite_hero = fillingHeroes.shift();
                }
                return player;
            });
        },
        titleStyle() {
            return themeBackground1(this.team);
        },
        staffPlayers() {
            return [
                ...(this.allPlayers || []),
                ...(this.team?.staff || [])
            ].filter((val, pos, arr) => arr.findIndex((p) => p.id === val.id) === pos);
        },
        managers() {
            const staff = (this.staffPlayers || []).filter(p => (p.staff_role?.toLowerCase() || p.role?.toLowerCase() || "").includes("manager")).map(p => p.name).filter(Boolean);
            if (!staff.length) return "";
            return `Manager${staff.length === 1 ? "" : "s"}: ${niceJoin(staff, "&")}`;
        },
        coaches() {
            const staff = (this.staffPlayers || []).filter(p => (p.staff_role?.toLowerCase() || p.role?.toLowerCase() || "").includes("coach")).map(p => p.name).filter(Boolean);
            if (!staff.length) return "";
            return `Coach${staff.length === 1 ? "" : "es"}: ${niceJoin(staff, "&")}`;
        }
    },
    methods: {
        logoBackground1,
        getFavouriteHero(heroName) {
            if (!heroName || !(this.heroes || []).length) return null;
            return this.heroes.find(h => h.name && h.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === heroName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
        },
        themeBackground1,
        getRoleSVG,
        alternateHeroBG(hero, alternateNum) {
            // console.log(hero, alternateNum);
            if (!hero) return {};
            const file = hero.alternate_set_image?.[alternateNum - 1];
            // console.log(file);
            if (!file) return {};
            const style = bg(resizedAttachment(file, "orig"));
            // console.log(style);
            return style;
        },
        playerEligibleRoles(player) {
            return (player?.this_event_signup_data?.eligible_roles || player.eligible_roles || []).sort(sortRoles);
        }
    },
    watch: {
        team: {
            deep: true,
            handler(team) {
                // console.log("team change", this.$parent);
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
.players:deep(.player) {
    width: 100%;
    justify-content: flex-end;
    display: flex;
    flex-direction: column;
}

.hero {
    flex-grow: 1;
}

.players {
    width: 100%;
    gap: 6px;
}

.players:deep(.color-holder div),
.players:deep(.color-holder canvas) {
    object-fit: contain !important;
}

.players:deep(.hero-image-base) {
    background-size: contain !important;
}
.players:deep(.recolored-hero) {
    --oversize-scale: 50%;
    --oversize-width: 400%;
    height: calc(100% + var(--oversize-scale)) !important;
    margin-top: calc(var(--oversize-scale) * -0.75);
    width: calc(100% + var(--oversize-width));
    margin-left: calc(-0.5 * var(--oversize-width));
}
.recolored-hero-holder {
    overflow: hidden;
}

.recolored-hero-holder, .alternate {
    background-color: rgba(0,0,0,0.2);
}
.player-name {
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    flex-grow: 0;
    font-size: 2em;
    gap: 0.1em;
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

.player-pronouns {
    padding: 0.25em 0.5em;
    font-size: 0.6em;
    line-height: 1;
    margin-top: .2em;
}


.contenders-team-header {
    display: flex;
    margin-left: 225px;
    margin-top: 85px;
}

.team-logo-holder {
    width: 170px;
    height: 120px;
}

.team-text {
    margin-left: 30px;
    line-height: 1;
    font-size: 82px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.team-name {
    font-weight: bold;
}

.team-subtitle {
    font-size: 0.33em;
    margin-top: .25em;
    font-weight: bold;
    margin-left: .15em;
    text-transform: uppercase;
}


.contenders-player-wrapper {
    margin: 0 270px;
    margin-top: 65px;
    height: 655px;
}

.boxed-hero-roster-overlay {
    padding: 80px 240px;
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
}
.team-header {
    display: flex;
    margin-bottom: 60px;
}
.player-wrapper {
    flex-grow: 1;
}


.player-name-holder {
    width: 100%;
    height: 170px;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 6px solid transparent;
}

.player, .player-name-holder {
    background-color: rgba(0, 0, 0, 0.25);
    color: white;
}

.team-logo {
    width: 80%;
    height: 90%;
}

.staff-wrapper {
    font-size: 1.5em;
    font-weight: bold;
    text-transform: uppercase;
    display: flex;
    gap: 1em;
    align-items: center;
    width: 100%;
    justify-content: flex-end;
}

.recolored-hero-holder:deep(.recolored-hero[data-hero="Torbjörn"]) { transform: translate(3%, -5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Roadhog"]) { transform: translate(0%, -6%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Junker Queen"]) { transform: translate(0.5%, 2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Brigitte"]) { transform: translate(0%, -5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Wrecking Ball"]) { transform: translate(0%, 5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Mauga"]) { transform: translate(-4%, 5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Echo"]) { transform: translate(0%, -1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Reaper"]) { transform: translate(0%, -3%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Reinhardt"]) { transform: translate(4%, 5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Ana"]) { transform: translate(0%, -7%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Symmetra"]) { transform: translate(0%, -7%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Sombra"]) { transform: translate(0%, -7%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Genji"]) { transform: translate(-2.5%, -10%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Juno"]) { transform: translate(1%, -2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Widowmaker"]) { transform: translate(0.5%, 3%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Ashe"]) { transform: translate(0%, -5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Illari"]) { transform: translate(1.5%, -1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Cassidy"]) { transform: translate(1%, 1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Junkrat"]) { transform: translate(1%, -3%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Mei"]) { transform: translate(1.5%, -5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Mercy"]) { transform: translate(0%, -5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Ramattra"]) { transform: translate(-1%, 7%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Soldier: 76"]) { transform: translate(0%, -5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Winston"]) { transform: translate(5%, 0%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Orisa"]) { transform: translate(-1%, 9%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Pharah"]) { transform: translate(-0.5%, -5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Sigma"]) { transform: translate(2%, 11%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Kiriko"]) { transform: translate(2.5%, -5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Zarya"]) { transform: translate(3%, -2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Lúcio"]) { transform: translate(0%, -8%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Venture"]) { transform: translate(5%, -8%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Doomfist"]) { transform: translate(-1%, 2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Moira"]) { transform: translate(-1%, -2%); }

.recolored-hero-holder:deep(.recolored-hero[data-hero="Mirage"]) { transform: translate(-1%, 2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Dynamo"]) { transform: translate(-17%, -5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Sinclair"]) { transform: translate(-11%, -2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Mo and Krill"]) { transform: translate(-5.5%, -1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Lash"]) { transform: translate(5%, -1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Wraith"]) { transform: translate(-4.5%, 2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Paradox"]) { transform: translate(1%, -3%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Infernus"]) { transform: translate(-12%, 8%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Bebop"]) { transform: translate(4%, 2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Seven"]) { transform: translate(-11%, 1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Holliday"]) { transform: translate(-5%, 1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Grey Talon"]) { transform: translate(13%, -9%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Calico"]) { transform: translate(1%, 5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Kelvin"]) { transform: translate(4%, -2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Abrams"]) { transform: translate(-4%, -1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Viscous"]) { transform: translate(2%, -5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="McGinnis"]) { transform: translate(15%, -1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Haze"]) { transform: translate(12%, -3%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Ivy"]) { transform: translate(-3%, -2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Pocket"]) { transform: translate(-0.5%, 1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Shiv"]) { transform: translate(1%, 2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Warden"]) { transform: translate(0%, 4%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Lady Geist"]) { transform: translate(2%, 2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Yamato"]) { transform: translate(0.6%, 4%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Vindicta"]) { transform: translate(-3%, 3%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Vyper"]) { transform: translate(3%, -5%); }


.recolored-hero-holder:deep(.recolored-hero[data-hero="Psylocke"]) { transform: translate(-1%, 2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Magneto"]) { transform: translate(8%, 1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Squirrel Girl"]) { transform: translate(-3%, 3%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Doctor Strange"]) { transform: translate(-5%, 3%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Spider-Man"]) { transform: translate(-1%, 0%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Human Torch"]) { transform: translate(1%, 8%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Luna Snow"]) { transform: translate(1%, -1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Black Panther"]) { transform: translate(0%, 0%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Captain America"]) { transform: translate(0%, 10%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Hawkeye"]) { transform: translate(2.5%, 1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Venom"]) { transform: translate(-3%, 9%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Storm"]) { transform: translate(-18%, 1%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Winter Soldier"]) { transform: translate(0%, 11%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Iron Fist"]) { transform: translate(-1%, 5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="The Thing"]) { transform: translate(-2%, 3%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="The Punisher"]) { transform: translate(1%, 0%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Groot"]) { transform: translate(-2%, 7%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Hela"]) { transform: translate(-11%, 4%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Magik"]) { transform: translate(14%, 3%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Iron Man"]) { transform: translate(1%, 3%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Hulk"]) { transform: translate(-4%, 7%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Black Widow"]) { transform: translate(1%, 4%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Scarlet Witch"]) { transform: translate(0%, 2%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Invisible Woman"]) { transform: translate(0%, 4%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Moon Knight"]) { transform: translate(7%, 0%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Mister Fantastic"]) { transform: translate(-2%, 5%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Thor"]) { transform: translate(-2.5%, 7%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Rocket Raccoon"]) { transform: translate(1%, -8%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Namor"]) { transform: translate(-1%, 0%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Star-Lord"]) { transform: translate(0.5%, 0%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Cloak & Dagger"]) { transform: translate(-21%, 0%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Adam Warlock"]) { transform: translate(-1.5%, 12%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Wolverine"]) { transform: translate(0%, 0%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Loki"]) { transform: translate(-1%, 7%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Jeff the Land Shark"]) { transform: translate(-4%, 0%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Mantis"]) { transform: translate(0.5%, 3%); }
.recolored-hero-holder:deep(.recolored-hero[data-hero="Peni Parker"]) { transform: translate(-4%, 7%); }
</style>
