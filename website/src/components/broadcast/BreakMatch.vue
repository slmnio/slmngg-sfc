<template>
    <div class="break-match flex-center" v-bind:class="{'expanded': expanded}" :data-center="centerShow">
        <div class="match-next-details" v-if="!expanded">
            <transition name="fade" mode="out-in">
                <span :key="match ? match.round : 'empty'">UP NEXT: {{ match && match.round }}</span>
            </transition>
        </div>
        <!--
        <div class="match-details" v-if="expanded && start">
            {{ start }}
        </div>
        -->
<!--        <transition-group name="fade" mode="out-in" class="match-teams flex-center">-->
        <div class="match-teams flex-center">
                <div class="match-team" v-for="(team, i) in teams" v-bind:key="team ? `${team.id}-${team.name}-${team.code}-${i}` : i" :style="{ order: i*2 }">
                    <div :class="expanded ? 'match-team-name' : 'match-team-code'" v-if="team && expanded" :data-code="team.code">
                        <span class="industry-align" v-if="team.dummy">{{ team.text }}</span>
                        <span class="industry-align" v-else-if="expanded && team.split_name" v-html="nbr(team.split_name)"></span>
                        <span v-else class="industry-align">{{ expanded ? team.name : team.code }}</span>
                    </div>
                    <div class="match-team-logo-holder flex-center" :style="teamTheme(team)">
                        <div class="match-team-logo bg-center" :style="teamLogo(team)"></div>
                    </div>
                    <div class="match-team-logo-spacer" v-if="expanded"></div>
                </div>
            <div class="match-team-center" v-if="match">
                <div v-if="centerShow === 'scores'" class="center-scores flex-center">
                    <div class="center-score" :style="winCSS(0)" v-bind:class="{'win': scores[0] === match.first_to}"><span class="industry-align">{{ scores[0] }}</span></div>
                    <div class="center-dash">-</div>
                    <div class="center-score" :style="winCSS(1)" v-bind:class="{'win': scores[1] === match.first_to}"><span class="industry-align">{{ scores[1] }}</span></div>
                </div>
                <div v-if="centerShow === 'time'" class="center-time">{{ start }}</div>
                <div v-if="centerShow === 'vs'" class="center-vs">vs</div>
            </div>
        </div>
<!--        </transition-group>-->
    </div>
</template>

<script>
import { cssImage } from "@/utils/content-utils";
import spacetime from "spacetime";
import { logoBackground1 } from "@/utils/theme-styles";

export default {
    name: "BreakMatch",
    props: ["match", "expanded", "timezone", "live", "themeColor"],
    computed: {
        teams() {
            const dummy = { text: "TBD", dummy: true, id: null };
            if (!this.match) return [{ ...dummy, _empty: true }, { ...dummy, _empty: true }];

            let text = (this.match.placeholder_teams || "").trim().split("|").filter(t => t !== "");
            let extraText = [];
            if (text.length === 4) {
                extraText = [text[2], text[3]];
                text = [text[0], text[1]];
            }
            if (!this.match.teams || this.match.teams.length === 0) {
                if (text.length === 2) {
                    return text.map(t => ({ ...dummy, text: t }));
                } else if (text.length === 1) {
                    if (this.match.placeholder_right) return [dummy, { ...dummy, text: text[0] }];
                    return [{ ...dummy, text: text[0] }, dummy];
                } else if (text.length === 0) {
                    // no text, just use TBDs
                    return [dummy, dummy];
                }
            }
            if (this.match.teams.length === 1) {
                if (text.length === 2) {
                    if (this.match.placeholder_right) return [this.match.teams[0], { ...dummy, text: text[1] }];
                    return [{ ...dummy, text: text[0] }, this.match.teams[0]];
                } else if (text.length === 1) {
                    if (this.match.placeholder_right) return [this.match.teams[0], { ...dummy, text: text[0] }];
                    return [{ ...dummy, text: text[0] }, this.match.teams[0]];
                } else if (text.length === 0) {
                    // no text, just use TBDs
                    if (this.match.placeholder_right) return [this.match.teams[0], dummy];
                    return [dummy, this.match.teams[0]];
                }
            }

            if (this.match.teams.length === 2) return this.match.teams;
            return [];
        },
        start() {
            if (!this.match || !this.match.start) return null;
            const utc = spacetime(this.match.start);
            const local = utc.goto(this.timezone || "America/New_York");
            return local.format("time");
        },
        hasScore() {
            // return false;
            // eslint-disable-next-line no-unreachable
            if (!this.match) return false;
            if (this.match.live) return true;
            return this.scores.some(t => !!t);
        },
        scores() {
            if (!this.match) return [];
            return [this.match.score_1, this.match.score_2];
        },
        centerShow() {
            if (this.live || this.hasScore) return "scores"; // return this.scores.join(" - ");

            if (this.expanded) {
                return "time";
                // return this.start;
            } else {
                return "vs";
            }
            // return "vs";
            // return " 0 - 0 ";
            // return "6pm"


            // return null;
        }
    },
    methods: {
        teamLogo(team) {
            if (!team || !team.theme) return {};
            return {
                ...cssImage("backgroundImage", team.theme, ["small_logo", "default_logo"], 40, true)
            };
        },
        teamTheme(team) {
            return logoBackground1(team) || {};
        },
        nbr(text) {
            // console.log(text);
            return text.replace(/\\n/g, "<br>");
        },
        winCSS(index) {
            // console.log(index, this.themeColor);
            if (this.scores[index] === this.match.first_to) return this.themeColor || {};
            return {};
        }
    }
};
</script>

<style scoped>
    .break-match {
        font-size: 48px;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        /*padding: 10px 0;*/
    }
    .break-match.expanded {
        flex-direction: row;
        padding: .25em 0;
    }

    .match-teams {
        display: flex;
        width: 100%;
    }
    .break-match.expanded .match-teams {
        margin-left: .2em;
    }
    .break-match:not(.expanded) .match-teams {
        margin-top: .2em
    }
    .match-team {
        width: 100%;
        display: flex;
        align-items: center;
    }

    .match-next-details {
        font-weight: bold;
        font-size: 0.6em;
        text-transform: uppercase;
        margin-bottom: .3em;
        line-height: 1;
    }

    .match-team { flex-direction: row-reverse; justify-content: flex-end; }
    .match-team:first-of-type {  flex-direction: row; }


    .match-team-vs {
        order: 1;
        text-transform: uppercase;
        font-size: .5em;
        margin: 0 .2em;
    }
    .match-team-code {
        font-weight: bold;
        display: flex;
        line-height: 1;
    }

    .match-team-logo-holder {
        width: 1.3em;
        height: 1.3em;
        margin: .1em .25em;
        flex-shrink: 0;
    }
    .match-team-logo {
        width: 100%;
        height: 100%;
    }
    span.industry-align {
        transform: translate(0, -.0925em);
        display: inline-flex;
    }

    .match-details {
        font-size: 0.6em;
        width: 4em;
        margin-right: .5em;
        flex-shrink: 0;
    }

    .match-team-name {
        text-align: left;
        line-height: 1;
        font-size: 0.75em;
        font-weight: bold;
        text-transform: uppercase;
    }
    .match-team:first-of-type .match-team-name {
        text-align: right;
    }
</style>
<style scoped>
    .match-team {
        /*border-radius: 20px;*/
        position: relative;
        height: 1.8em;
        margin: .3em 0;
    }
    .break-match.expanded .match-team {
        background: white;
        color: black;
    }
    .match-team-center {
        white-space: nowrap;
    }
    .match-team-logo-holder {
        background-color: #333;
        width: 2.25em;
        height: 2.25em;
        position: absolute;
        /*border-radius: 20px;*/
        margin: 0;
    }
    .match-team-logo {
        --size: 80%; width: var(--size); height: var(--size);
    }
    .match-team-logo-spacer {
        display: flex;
        flex-shrink: 0;
        width: 2em;
        margin: 0 .15em;
    }
    .match-team-center {
        font-weight: bold;
        font-size: .75em;
        flex-shrink: 0;
        text-align: center;
    }
    .center-vs {
        padding: 0 .75em;
    }
    .break-match.expanded .match-team-center {
        width: 4.75em;
    }
    .match-team-name span {
        transform: translate(0, -0.05em)
    }
    .match-team-name {
        margin: 0 0.3em;
    }

    .center-scores {
        justify-content: center;
        padding: 0 .4em;
    }

    .center-score {
        background: white;
        color: black;
        width: 1.1em;
        /*border-radius: 10px;*/
        font-size: calc(4em * (1 / 3));
        line-height: 1;
        padding: 0.15em 0;
    }
    .center-score.win {
        background-color: #333333;
        color: white;
    }

    .center-dash {
        margin: 0 .2em;
        line-height: 1;
        font-size: calc(1.1em);
        transform: translate(0, -0.0925em);
    }
</style>
