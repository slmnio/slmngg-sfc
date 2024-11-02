<template>
    <div class="ingame-overlay" :class="{'basic': basicMode}">
        <div class="top-overlay" :style="broadcastMargin">
            <IngameTeam
                v-for="(team, i) in teams"
                :key="team.id"
                :theme="getAltTheme(team, i)"
                :team="team"
                :right="i === 1"
                :active="noAnimation || shouldShowTeams"
                :score="scores[i]"
                :hide-scores="broadcast.hide_scores"
                :extend-icons="extendIcons"
                :color-logo-holder="colorLogoHolder"
                :width="teamWidth"
                :codes="useCodes"
                :event="broadcast.event"
                :auto-small="autoSmall"
                :map-attack="attacks[i]"
                :use-dots="useDots"
                :first-to="match && match.first_to"
                :event-info="i === 0 ? eventData : null"
                :show-event-maps="i === 1 ? showMapInformation : null"
                :match="match"
                :broadcast="broadcast"
                :player-names="teamPlayerNames[i]"
            />
            <Middle
                v-if="!basicMode"
                :active="shouldShowMiddle"
                :theme="broadcast?.event?.theme"
                :text="middleText"
                :tiny="broadcast.margin === 0"
                :borders="middleBorders" />

            <transition name="fly-in-left" mode="out-in">
                <ingame-hero-bans
                    v-if="showBannedHeroes && (noAnimation || shouldShowTeams)"
                    :broadcast="broadcast"
                    :match="match"
                    :display-mode="heroBansDisplayMode"
                    :style="themeBackground(broadcast?.event?.theme)" />
            </transition>
            <div class="ingame-promote">
                <ingame-promotion :broadcast="broadcast" :animation-active="animationActive" :match="match" />
            </div>
        </div>
        <transition name="fade" mode="out-in">
            <Sponsors
                v-if="showFadeSponsors && !basicMode"
                class="ingame-fade-sponsors"
                :sponsors="fadeSponsors"
                mode="out-in"
                :speed="sponsorFadeSpeed" />
        </transition>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import IngameTeam from "@/components/broadcast/IngameTeam";
import Middle from "@/components/broadcast/Middle";
import Sponsors from "@/components/broadcast/Sponsors";
import IngamePromotion from "@/components/broadcast/IngamePromotion.vue";
import { getFormatOptions } from "@/utils/content-utils";
import IngameHeroBans from "@/components/broadcast/IngameHeroBans.vue";
import { themeBackground } from "@/utils/theme-styles.js";

export default {
    name: "IngameOverlay",
    components: {
        IngamePromotion,
        IngameTeam,
        Middle,
        Sponsors,
        IngameHeroBans
    },
    props: ["broadcast", "codes", "animationActive", "mapattack", "sponsorFadeSpeed", "noAnimation", "basicMode"],
    data: () => ({
        flippingTeams: false
    }),
    computed: {
        match() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    red_theme: ReactiveThing("red_theme"),
                    blue_theme: ReactiveThing("blue_theme"),
                    matches: ReactiveArray("matches", {
                        teams: ReactiveArray("teams")
                    })
                }),
                maps: ReactiveArray("maps", {
                    "team_1_bans": ReactiveArray("team_1_bans"),
                    "team_2_bans": ReactiveArray("team_2_bans"),
                })
            });
        },
        teams() {
            console.warn("Teams", this.match?.teams);
            if (!this.match?.teams?.every(t => {
                if (t.theme === undefined && t.has_theme === 0) return true;
                return t.theme && !t.theme.__loading && t.theme.id;
            })) {
                console.warn("No teams, not loaded", this.match?.teams);
                return [];
            }
            // if (!this.animationActive) return [];

            console.log("teams - flipping teams", this.flippingTeams);
            if (this.flippingTeams) {
                // hold old ones for a second
                const teams = [...this.match.teams];
                if (this.match.flip_teams) {
                    // do invert
                    console.log("holding 0,1", teams[0]);
                    return [teams[0], teams[1]];
                } else {
                    console.log("holding 1,0", teams[0]);
                    return [teams[1], teams[0]];
                }
            }
            console.log("default view", this.match.teams, this.match.teams.length);
            if (this.match.flip_teams && this.match.teams.length === 2) return [this.match.teams[1], this.match.teams[0]];
            if (this.match.teams.length !== 2) return [];
            return this.match.teams;
        },
        teamPlayerNames() {
            if (!(this.broadcast?.broadcast_settings || [])?.includes("Show all player names")) return [];
            const names = [
                ReactiveArray("team_1_cams", {
                    "player": ReactiveThing("player")
                })(this.broadcast),
                ReactiveArray("team_2_cams", {
                    "player": ReactiveThing("player")
                })(this.broadcast)
            ];
            if (this.flippingTeams) {
                // hold old ones for a second
                const teams = [...names];
                if (this.match.flip_teams) {
                    // do invert
                    console.log("holding 0,1", teams[0]);
                    return [teams[0], teams[1]];
                } else {
                    console.log("holding 1,0", teams[0]);
                    return [teams[1], teams[0]];
                }
            }
            if (this.match.flip_teams && this.match.teams.length === 2) return [names[1], names[0]];
            if (this.match.teams.length !== 2) return [];
            return names;
        },
        useDots() {
            return this.broadcast?.broadcast_settings?.includes("Use dots instead of numbers for score");
        },
        showBannedHeroes() {
            return this.broadcast?.broadcast_settings?.includes("Show banned heroes ingame");
        },
        heroBansDisplayMode() {
            const mode = this.broadcast?.broadcast_settings?.find(setting => setting.startsWith("Display hero bans: "));
            if (!mode) return;
            return mode.split(":").pop().trim();
        },
        autoSmall() {
            return this.broadcast?.broadcast_settings?.includes("Show match records ingame") ? {
                show: "record",
                stage: this.broadcast?.current_stage || this.match?.match_group
            } : null;
        },
        scores() {
            if (!this.teams) return [];
            const scores = [this.match.score_1, this.match.score_2];
            if (this.flippingTeams) {
                // hold old ones for a second
                if (this.match.flip_teams) {
                    // do invert
                    return [scores[0], scores[1]];
                } else {
                    return [scores[1], scores[0]];
                }
            }
            if (this.match.flip_teams && this.match.teams.length === 2) return [scores[1], scores[0]];
            return scores;
        },
        shouldShowMiddle() {
            if (!this.animationActive) return false;
            if (this.match?.special_event) {
                return this.middleText;
            }
            return this.teams?.length === 2 && this.middleText;
        },
        showFadeSponsors() {
            return (this.broadcast?.broadcast_settings || [])?.includes("Fade ingame sponsors");
        },
        sponsorData() {
            if (!this.broadcast.id) return {};
            return ReactiveRoot(this.broadcast.id, {
                persistent_sponsors: ReactiveArray("persistent_sponsors"),
                sponsors: ReactiveArray("sponsors")
            });
        },
        fadeSponsors() {
            return this.sponsorData?.persistent_sponsors || this.sponsorData?.sponsors;
        },
        middleText() {
            if (!this.match) return null;
            if (this.match.middle_text) return this.match.middle_text;

            if (this.broadcast?.middle_text_format) {
                let format = this.broadcast?.middle_text_format;
                const formatOptions = getFormatOptions(this.broadcast?.event, this.match);

                Object.entries(formatOptions).forEach(([key, val]) => {
                    format = format.replace(`{${key}}`, val || "");
                });

                return format.trim();
            }

            if ((this.broadcast?.broadcast_settings || [])?.includes("Use map number in middle text")) {
                console.log("middle match maps", this.match.maps);

                let mapText;

                const maps = (this.match.maps || []).map((map, i) => ({
                    ...map,
                    number: map.number || i + 1
                })).filter(map => !map.banner);

                let currentMap = maps.find(map => !(map.draw || map.winner));

                if (!currentMap && maps.length) {
                    currentMap = maps[maps.length - 1];
                }

                // if ([this.match.score_1, this.match.score_2].includes(this.match.first_to)) {
                //     // match has finished
                //     // mapText = "Final Score"; // maybe
                //     mapText = `Map ${currentMap.number}`;
                // } else if (currentMap) {
                //     mapText = `Map ${currentMap.number}`;
                // }

                if (currentMap) {
                    mapText = `Map ${currentMap.number}`;
                }

                console.log("map text", mapText, currentMap);


                if (this.match.first_to && currentMap) {
                    // Map X - First to Y
                    return `Map ${currentMap.number} - First to ${this.match.first_to}`;
                } else {
                    // Semifinals - Map X
                    const matchRound = this.match.round || this.match.week_text;
                    return `${matchRound ? `${matchRound} - ` : ""}First to ${this.match.first_to}`;
                }
            }

            if (this.match.round && this.match.first_to) {
                return `${this.match.round.toUpperCase()} - FIRST TO ${this.match.first_to}`;
            }
            if (this.match.week_text && this.match.first_to) {
                return `${this.match.week_text.toUpperCase()} - FIRST TO ${this.match.first_to}`;
            }
            return null;
        },
        broadcastMargin() {
            if (!this.broadcast) return { marginTop: "0px" };
            return { marginTop: `${Math.floor(this.broadcast.margin * 55)}px` };
        },
        teamWidth() {
            if (!this.broadcast?.ingame_team_width) return null;
            return this.broadcast.ingame_team_width;
        },
        attacks() {
            if (this.broadcast?.map_attack === "Left") return ["atk", "def"];
            if (this.broadcast?.map_attack === "Right") return ["def", "atk"];
            if (this.broadcast?.map_attack === "Both") return ["atk", "atk"];
            return [null, null];
        },
        extendIcons() {
            return (this.broadcast?.broadcast_settings || []).includes("Extend ingame map icons");
        },
        useCodes() {
            return this.codes || (this.broadcast?.broadcast_settings || []).includes("Use team codes");
        },
        prodData() {
            return {
                match: this.match?.name || this.broadcast?.code || this.broadcast?.name
            };
        },
        flipTeams() {
            return this.match?.flip_teams || false;
        },
        shouldShowTeams() {
            return this.animationActive && !this.flippingTeams;
        },
        middleBorders() {
            if (!(this.broadcast?.broadcast_settings || []).includes("Show borders on middle")) return null;
            return this.teams.map(t => {
                if (!t?.theme) return {};
                let color = t.theme.color_theme;
                if (!color || color.toLowerCase() === "#ffffff") color = t.theme.color_logo_accent;
                if (!color || color.toLowerCase() === "#ffffff") color = t.theme.color_accent;
                return {
                    backgroundColor: color
                };
            });
        },
        colorLogoHolder() {
            return (this.broadcast?.broadcast_settings || []).includes("Color ingame team logo holder");
        },
        showEventData() {
            return (this.broadcast?.broadcast_settings || []).includes("Show event details ingame");
        },
        eventData() {
            if (!this.showEventData) return [];

            const formatOptions = getFormatOptions(this.broadcast?.event, this.match);
            const format = this.broadcast?.ingame_details_format || "event_short,event_sub_event,match_round";

            return format.split(",").map(key => {
                key = key.replaceAll(/[{}]/g,"");
                return formatOptions[key] || "";
            }).filter(Boolean);
        },
        showMapInformation() {
            return (this.broadcast?.broadcast_settings || []).includes("Show map information ingame");
        }
    },
    methods: {
        themeBackground,
        getAltTheme(team, i) {
            console.log({ team, i });
            if (!(this.broadcast?.broadcast_settings || []).includes("Use coloured team themes")) return team.theme;

            if (i === 0) {
                // try blue
                if (team.blue_theme && !team.blue_theme?.__loading) {
                    return {
                        ...team.theme,
                        ...team.blue_theme
                    };
                }
            } else {
                // try red
                if (team.red_theme && !team.red_theme?.__loading) {
                    console.log(team.red_theme);
                    return {
                        ...team.theme,
                        ...team.red_theme
                    };
                }
            }

            return team.theme;
        }
    },
    watch: {
        broadcast() {
            if (this.broadcast) {
                document.body.dataset.broadcast = this.broadcast.key;
            }
        },
        flipTeams: {
            handler(newValue) {
                console.log("flip teams now", newValue);
                this.flippingTeams = true;
                setTimeout(() => {
                    this.flippingTeams = false;
                    console.log("flip teams now", this.flippingTeams);
                }, 1500);
            }
        },
        shouldShowTeams: {
            handler(val) {
                console.log("should show teams", val);
            }
        }
    },
    head() {
        return {
            title: `Ingame | ${this.match?.name || this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
/*@import "~@/assets/overlay.css";*/
.ingame-overlay {
    /* BPL screenshot */
    /*background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/840984014504722472/unknown.png");*/
    /* Margin: 1.0 */
    /*background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/841070256696983552/ScreenShot_21-05-09_22-44-45-000.jpg");*/
    /* Margin: 0.5 */
    /*background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/841070258440896602/ScreenShot_21-05-09_22-46-01-000.jpg");*/
    /* Margin: 0.0 */
    /*background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/841070262060974110/ScreenShot_21-05-09_22-48-02-000.jpg");*/
    /* Margin: 0.5 4v4 */
    /*background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/841443615557287956/ScreenShot_21-05-10_23-36-13-000.jpg");*/
    /*background-image: url(https://cdn.discordapp.com/attachments/485493459357007876/974757857188794378/unknown.png);*/

    /* Overwatch 2 */
    /* Margin: 0.0 */
    /* background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/1097643734834872471/escort-0-active.jpg"); */

    /* Margin: 0.5 */
    /* background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/1097641564580368414/escort-pre-countdown.jpg"); */
    /* background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/1097641565381480479/escort-active.jpg"); */
    /* background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/1097641565100453978/control-pre-countdown.jpg"); */
    /* background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/1097641564852994169/control-capped.jpg"); */
    background-size: contain;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    overflow: hidden;

    font-family: "SLMN-Industry", "Industry", sans-serif;
}

.top-overlay {
    position: relative;
    transition: margin-top .2s;
    --team-height: 48px;
    --side-margins: 43px;
    --side-margins: 0px;
    margin-left: var(--side-margins);
    margin-right: var(--side-margins);
}


.itah-enter-active, .itah-leave-active {
    transition: all .5s ease-in-out;
}

.itah-enter-to, .itah-leave-from {
    max-width: 700px;
}

.itah-enter-from, .itah-leave-to {
    max-width: 0;
}

.ingame-fade-sponsors {
    position: absolute;
    bottom: 0;
    padding: 0 !important;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 80px;
}

.ingame-fade-sponsors:deep(.sponsors-holder) {
    height: 100% !important;
    width: 320px !important;
}

.ingame-fade-sponsors:deep(.break-sponsor) {
    background-color: transparent !important;
}

.ingame-fade-sponsors:deep(.break-sponsor-logo) {
    height: calc(100% - 1.5em) !important;
}

.ingame-overlay.basic:deep(.team-small-text),
.ingame-overlay.basic:deep(.team-score),
.ingame-overlay.basic:deep(.attack-holder),
.ingame-overlay.basic:deep(.event-fly-in) {
    display: none !important;
}

.ingame-overlay.basic:deep(.ingame-team) {
    --team-expand: 0px !important;
}

.ingame-promote {
    position: relative;
    top: 165px;
    display: flex;
}


.fly-in-left-enter-active {
    transition: all .75s ease 2s, width 200ms ease;
}
.fly-in-left-enter-from {
    transform: translate(-200px, 0px)
}
.fly-in-left-enter-to {
    transform: translate(0, 0);
}

.fly-in-left-leave-active {
    transition: opacity .3s ease, width 200ms ease;
}
.fly-in-left-leave-to {
    opacity: 0;
}
</style>
