<template>
    <div class="bracket-team default-thing" v-bind:class="{'text': !!text, 'empty': empty, 'highlighted': highlighted, 'lowlighted': lowlighted}"
         @mouseover="highlight" @mouseout="unHighlight"
         :style="background">
        <div class="inner" v-if="!empty">
            <span class="text">{{ text }}</span>
            <span class="short">{{ short }}</span>
            <div class="team-logo-holder flex-center" v-if="team">
                <div class="team-logo bg-center" :style="teamLogo"></div>
            </div>
            <div class="team-name-holder" v-if="team">
                <div class="team-name">{{ team.name }}</div>
                <div class="team-code">{{ team.code }}</div>
            </div>
            <div class="team-score flex-center" v-bind:class="{ 'win': win }" v-if="team && score !== null">{{ score }}</div>
        </div>
    </div>
</template>

<script>
import { logoBackground1 } from "@/utils/theme-styles";
import Store from "@/thing-store";
import { resizedImage } from "@/utils/images";

export default {
    name: "BracketTeam",
    props: ["team", "text", "empty", "score", "win", "short"],
    methods: {
        highlight() { Store.commit("setHighlightedTeam", this.team?.id || null); },
        unHighlight() { Store.commit("setHighlightedTeam", null); }
    },
    computed: {
        highlighted() {
            if (!this.team) return false;
            return Store.getters.isHighlighted(this.team.id);
        },
        lowlighted() {
            if (this.highlighted) return false;
            return !!Store.state.highlighted_team;
        },
        background() {
            if (this.empty) return { backgroundColor: "transparent" };
            if (this.team && this.team.id) return logoBackground1(this.team);
            return {};
        },
        teamLogo() {
            if (!this.team) return {};
            return resizedImage(this.team?.theme, ["small_logo", "default_logo"], "s-40");
        }
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
        --match-height: 2.3em;
        height: var(--match-height);
        /*background-color: #282828;*/
    }
    .team-logo-holder {
        width: var(--match-height);
        height: var(--match-height);
        flex-shrink: 0;
    }
    .team-logo {
        --padding: 4px;
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
        line-height: 1;
        transform: translate(0, -0.0925em); /* industry-align */

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
        transition: opacity 150ms;
    }
    .bracket-team.lowlighted {
        opacity: 0.2;
    }

    .team-code {
        display: none;
        font-size: 2em;
        transform: translate(0, -0.0925em); /* industry-align */
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
