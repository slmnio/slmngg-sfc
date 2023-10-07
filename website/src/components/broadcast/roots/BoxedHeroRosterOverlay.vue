<template>
    <div class="boxed-hero-roster-overlay">
        <div class="contenders-team-header">
            <div class="team-logo-holder flex-center" :style="logoBackground1(team)">
                <div class="team-logo bg-center" :style="teamLogo"></div>
            </div>
            <div class="team-text">
                <div class="team-name">{{ team?.name }}</div>
                <div class="team-subtitle" v-if="decoratedSubtitle">{{ decoratedSubtitle }}</div>
            </div>
        </div>

        <div class="staff-wrapper" v-if="showStaff">
            <div class="staff manager" v-if="managers">{{ managers }}</div>
            <div class="staff coach" v-if="coaches">{{ coaches }}</div>
        </div>
        <div class="player-wrapper">
            <div class="players h-100 d-flex flex-center">
                <div class="player h-100" v-for="player in players" :key="player.id" :class="{'has-role-icon': showRoles}">
                    <div class="alternate bg-center hero h-100 w-100" v-if="alternate" :style="alternateHeroBG(player.favourite_hero, alternate)"></div>
                    <RecoloredHero v-else class="hero" :hero="player.favourite_hero" :theme="team.theme"></RecoloredHero>
                    <div class="player-name-holder" :style="themeBackground1(team)">
                        <div class="player-name flex-center text-center">
                            <span class="player-name-internal">{{ player.name }}</span>
                            <span v-if="showRoles" class="player-role" v-html="getRoleSVG(player.role)"></span>
                            <span :style="themeBackground1(team)" v-if="showPronouns"
                                  class="player-pronouns">{{ player.pronouns }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import RecoloredHero from "@/components/broadcast/RecoloredHero";
import { logoBackground1, themeBackground1 } from "@/utils/theme-styles";
import { autoRecord, getRoleSVG } from "@/utils/content-utils";
import { bg, resizedAttachment, resizedImage } from "@/utils/images";

function niceJoin(array, and = "and") {
    if (array.length > 1) {
        const last = array.pop();
        return array.join(", ") + ` ${and} ` + last;
    }
    return array[0];
}

export default {
    name: "BoxedHeroRosterOverlay",
    props: ["broadcast", "title", "playerCount", "teamNum", "showRoles", "showPronouns", "active", "animationActive", "subtitle", "alternate", "showStaff"],
    components: {
        RecoloredHero
    },
    computed: {
        match() {
            if (!this.broadcast || !this.broadcast.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players", {
                        favourite_hero: ReactiveThing("favourite_hero")
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
                        })
                    })
                })?.highlight_team;
            }
            return this.match?.teams?.[0];
        },
        decoratedSubtitle() {
            let text;
            if ((this.broadcast?.broadcast_settings || [])?.includes("Show match records ingame")) {
                console.log("auto small text", this.team, this.team.matches);
                text = autoRecord(this.team, this.broadcast?.current_stage || this.match?.match_group);
            }
            return this.subtitle.replace("{small}", (this.team.small_overlay_text || text || ""));
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
            return (players || []).sort((a, b) => {
                console.log(a, b);
                if (a.role !== b.role) {
                    const order = ["DPS", "Tank", "Support"];
                    return order.indexOf(a.role) - order.indexOf(b.role);
                }
            });
        },
        titleStyle() {
            return themeBackground1(this.team);
        },
        managers() {
            const staff = (this.allPlayers || []).filter(p => (p.role?.toLowerCase() || "").includes("manager")).map(p => p.name).filter(Boolean);
            if (!staff.length) return "";
            return `Manager${staff.length === 1 ? "" : "s"}: ${niceJoin(staff, "&")}`;
        },
        coaches() {
            const staff = (this.allPlayers || []).filter(p => (p.role?.toLowerCase() || "").includes("coach")).map(p => p.name).filter(Boolean);
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
        }
    },
    watch: {
        team: {
            deep: true,
            handler(team) {
                // console.log("team change", this.$parent);
                this.$parent.updateTheme(team?.theme);
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
    width: 100%;
}

.players {
    width: 100%;
    gap: 6px;
}

.player >>> .color-holder div,
.player >>> .color-holder canvas {
    object-fit: contain !important;
}

.player >>> .hero-image-base {
    background-size: contain !important;
}

.recolored-hero {
    /*height: calc(100% - 2em) !important;*/
}

.player-name {
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    flex-grow: 0;
    font-size: 2em;
}

.hero-roster-overlay >>> .g-body {
    overflow: hidden;
    color: white;
}

.player-name {
    flex-direction: column;
}

.player-role {
    width: 2em;
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
}


.player-wrapper {
    margin: 0 270px;
    margin-top: 65px;
    height: 655px;
}


.player-name-holder {
    width: 100%;
    height: 170px;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.player {
    display: flex;
    flex-direction: column;
}
.player, .player-name-holder {
    background-color: rgba(0,0,0,0.25);
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
    justify-content: center;
}
</style>
