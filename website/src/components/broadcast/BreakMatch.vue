<template>
    <div class="break-match flex-center" v-bind:class="{'expanded': expanded}">
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
                    <div :class="expanded ? 'match-team-name' : 'match-team-code'" v-if="team && expanded">
                        <span class="industry-align">{{ expanded ? team.name : team.code }}</span>
                    </div>
                    <div class="match-team-logo-holder flex-center" :style="teamTheme(team)">
                        <div class="match-team-logo bg-center" :style="teamLogo(team)"></div>
                    </div>
                    <div class="match-team-logo-spacer" v-if="expanded"></div>
                </div>
            <div class="match-team-center">
                <span v-if="!hasScore">{{ expanded ? start : 'vs' }}</span>
                <span v-else>{{ scores.join(' - ') }}</span>
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
    props: ["match", "expanded", "timezone"],
    computed: {
        teams() {
            if (!this.match || !this.match.teams) return [null, null];
            return this.match.teams;
        },
        start() {
            if (!this.match || !this.match.start) return null;
            const utc = spacetime(this.match.start);
            const local = utc.goto(this.timezone || "America/New_York");
            return local.format("time");
        },
        hasScore() {
            return false;
            // eslint-disable-next-line no-unreachable
            if (!this.match) return false;
            if (this.match.live) return true;
            return this.scores.some(t => !!t);
        },
        scores() {
            if (!this.match) return [];
            return [this.match.score_1, this.match.score_2];
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
        padding: 15px 0;
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
        border-radius: 20px;
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
        width: 2.25em;
        height: 2.25em;
        position: absolute;
        border-radius: 20px;
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
        width: 80px;
        flex-shrink: 0;
        text-align: center;
    }
    .break-match.expanded .match-team-center {
        width: 170px;
    }
    .match-team-name span {
        transform: translate(0, -0.05em)
    }
    .match-team-name {
        margin: 0 0.3em;
    }
</style>
