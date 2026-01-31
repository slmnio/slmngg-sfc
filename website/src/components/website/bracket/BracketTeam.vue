<template>
    <div
        class="bracket-team default-thing"
        :class="{'text': !!text, 'empty': empty, 'highlighted': highlighted, 'lowlighted': lowlighted, 'team-win': win}"
        :style="background"
        @mouseover="highlight"
        @mouseout="unHighlight">
        <div v-if="!empty" class="inner">
            <span class="text">{{ text }}</span>
            <span class="short">{{ short }}</span>
            <div v-if="team" class="team-logo-holder flex-center">
                <div class="team-logo bg-center" :style="teamLogo"></div>
            </div>
            <div v-if="team" class="team-name-holder">
                <div class="team-name industry-align">{{ team.name }}</div>
                <div class="team-code industry-align">{{ team.code }}</div>
            </div>
            <div v-if="team && score !== null" class="team-score flex-center" :class="{ 'win': win }">
                <div class="industry-align">{{ score }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { logoBackground1 } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";
import { useStatusStore } from "@/stores/statusStore";

export default {
    name: "BracketTeam",
    props: ["team", "text", "empty", "score", "win", "short"],
    computed: {
        highlighted() {
            if (!this.team) return false;
            return useStatusStore().highlightedTeam === this.team.id;
        },
        lowlighted() {
            if (this.highlighted) return false;
            return useStatusStore().highlightedTeam !== null;
        },
        background() {
            if (this.empty) return { backgroundColor: "transparent" };
            if (this.team?.id) return logoBackground1(this.team);
            return {};
        },
        teamLogo() {
            if (!this.team) return {};
            return resizedImage(this.team?.theme, ["small_logo", "default_logo"], "s-80");
        }
    },
    methods: {
        highlight() { useStatusStore().highlightedTeam = this.team?.id || null; },
        unHighlight() { useStatusStore().highlightedTeam = null; }
    }
};
</script>

<style scoped>
    .inner {
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
    }

    .bracket-team {
        width: 100%;
        --match-height: 2.25em;
        height: var(--match-height);
        /*background-color: #282828;*/
    }
    .team-logo-holder {
        width: var(--match-height);
        height: var(--match-height);
        flex-shrink: 0;
    }
    .team-logo {
        --padding: .25em;
        width: calc(100% - var(--padding));
        height: calc(100% - var(--padding));
    }
    .bracket-team.empty {
        opacity: 0;
    }
    .bracket-team.text .inner {
        text-align: center;
        justify-content: center;
    }

    /* messy but works for now */
    .team-name-holder {
        flex-grow: 1;
        padding: 0 .25em;
        display: flex;
        align-items: center;
        overflow: hidden;
    }
    .team-name {
        line-height: 0.92;
        /*line-height: 1;*/
        /* transform: var(--overlay-line-height-adjust, translate(0, -0.0925em)); !* industry-align *!*/

        font-size: 1.1em;
        padding: 0.15em 0;

        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-align: left;
    }

    .team-score {
        background-color: #444;
        color: #aaa;
        flex-shrink: 0;
        width: 1.4em;
        height: 100%;
        font-weight: bold;
    }

    .team-score.win {
        color: var(--win-color);
        background-color: var(--win-background-color);
    }

    .bracket-team {
        transition: opacity 150ms ease;
    }
    .bracket-team.lowlighted {
        opacity: 0.2;
    }

    .team-code {
        display: none;
        font-size: 2em;
        transform: var(--overlay-line-height-adjust, translate(0, -0.0925em));/* industry-align */
    }

    .bracket.small .team-code {
        display: flex;
    }
    .bracket.small .team-name {
        display: none;
    }
    .bracket.small .team-score {
        font-size: 1.6em;
    }
    .inner .short {
        display: none;
    }
</style>
