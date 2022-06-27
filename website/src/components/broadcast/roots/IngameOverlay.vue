<template>
  <div class="ingame-overlay">
      <div class="top-overlay" :style="broadcastMargin">
          <transition-group name="itah" mode="out-in">
              <IngameTeam :key="`${team.id}-${i}`" v-for="(team, i) in teams" :theme="getAltTheme(team, i)"
                          :team="team" :right="i === 1" :score="scores[i]" :hideScores="broadcast.hide_scores" :extend-icons="extendIcons"
                          :width="teamWidth" :codes="useCodes" :event="broadcast.event" :auto-small="autoSmall" :map-attack="attacks[i]"/>
          </transition-group>

          <transition name="mid" mode="out-in">
              <Middle v-if="shouldShowMiddle" :text="middleText" :key="middleText" />
          </transition>

      </div>
      <transition name="fade" mode="out-in">
          {{ fadeSponsors }}
          <Sponsors v-if="showFadeSponsors" class="ingame-fade-sponsors" :sponsors="fadeSponsors" mode="out-in" :speed="sponsorFadeSpeed" />
      </transition>
  </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import IngameTeam from "@/components/broadcast/IngameTeam";
import Middle from "@/components/broadcast/Middle";
import Sponsors from "@/components/broadcast/Sponsors";

export default {
    name: "IngameOverlay",
    props: ["broadcast", "codes", "animationActive", "mapattack", "sponsorFadeSpeed"],
    components: { IngameTeam, Middle, Sponsors },
    computed: {
        match() {
            if (!this.broadcast || !this.broadcast.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    red_theme: ReactiveThing("red_theme"),
                    blue_theme: ReactiveThing("blue_theme"),
                    matches: ReactiveArray("matches", {
                        teams: ReactiveArray("teams")
                    })
                })
            });
        },
        teams() {
            if (!this.match || !this.match.teams || !this.match.teams.every(t => {
                if (t.theme === undefined && t.has_theme === 0) return true;
                return t.theme && !t.theme.__loading && t.theme.id;
            })) return [];
            if (!this.animationActive) return [];
            if (this.match.flip_teams && this.match.teams.length === 2) return [this.match.teams[1], this.match.teams[0]];
            if (this.match.teams.length !== 2) return [];
            return this.match.teams;
        },
        autoSmall() {
            return this.broadcast?.broadcast_settings?.includes("Show match records ingame") ? { show: "record", stage: this.broadcast?.current_stage } : null;
        },
        scores() {
            if (!this.teams) return [];
            const scores = [this.match.score_1, this.match.score_2];
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
            if (this.match.round && this.match.first_to) { return `${this.match.round.toUpperCase()} - FIRST TO ${this.match.first_to}`; }
            if (this.match.week_text && this.match.first_to) { return `${this.match.week_text.toUpperCase()} - FIRST TO ${this.match.first_to}`; }
            return null;
        },
        broadcastMargin() {
            if (!this.broadcast) return { marginTop: "0px" };
            return { marginTop: `${(this.broadcast.margin * 55)}px` };
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
        }
    },
    watch: {
        broadcast() {
            if (this.broadcast) {
                document.body.dataset.broadcast = this.broadcast.key;
            }
        }
    },
    methods: {
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
}


.itah-enter-active, .itah-leave-active {
    transition: all .5s ease-in-out;
}
.itah-enter-to, .itah-leave {
    max-width: 700px;
}
.itah-enter, .itah-leave-to {
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

.ingame-fade-sponsors >>> .sponsors-holder {
    height: 100% !important;
    width: 320px !important;
}

.ingame-fade-sponsors >>> .break-sponsor {
    background-color: transparent !important;
}

.ingame-fade-sponsors >>> .break-sponsor-logo {
    height: calc(100% - 1.5em) !important;
}
</style>
