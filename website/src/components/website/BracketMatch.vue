<template>
    <router-link :to="url('match', this.match)" class="bracket-match no-link-style" v-if="!!match"
                 v-bind:class="{'hover': hover}"
                 @mouseover.native="matchHover" @mouseleave.native="matchEmpty">
        <div class="match-name d-none">{{ match && match.name }}</div>
        <div class="match-number" v-if="match.match_number">{{ match.match_number }}</div>
        <div class="match-teams">
            <BracketTeam v-for="(team, i) in teams"
                         :team="team.id && team"
                         :text="team.dummy && team.text"
                         :empty="team._empty"
                         v-bind:key="team.id"
                         :score="scores[i]" :win="scores[i] === match.first_to"
            />
        </div>
        <transition name="fade">
            <div class="match-highlight-text" v-if="matchHighlight"
                 :data-side="matchHighlight.side" v-bind:class="{ 'feeder': matchHighlight.feeder }">
                {{ matchHighlight.text }}
                <i class="fas fa-chevron-down" v-if="matchHighlight.feeder && matchHighlight.text === 'Loser'"></i>
                <i class="fas fa-chevron-right" v-if="matchHighlight.feeder && matchHighlight.text !== 'Loser'"></i>
            </div>
        </transition>
    </router-link>
    <div v-else class="bracket-match bracket-match-spacer"
         @mouseover="matchHover" @mouseleave="matchEmpty">
        <div class="match-name d-none"></div>
        <div class="match-teams">
            <BracketTeam v-for="(team, i) in teams"
                         :team="team.id && team"
                         :text="team.dummy && team.text"
                         :empty="team._empty"
                         v-bind:key="team.id"
                         :score="scores[i]"
            />
        </div>
    </div>
</template>

<script>
import BracketTeam from "@/components/website/BracketTeam";
import { url } from "@/utils/content-utils";
import store from "@/thing-store";

export default {
    name: "BracketMatch",
    components: { BracketTeam },
    props: ["match"],
    data: () => ({
        hover: false
    }),
    methods: {
        url,
        matchHover() {
            this.hover = true;
            console.log(this.match);
            const connections = this?.match?._bracket_data?.connections;
            if (!connections) return;

            const cons = [
                { id: connections.winner.id, text: "Winner advances here", side: connections.winner.side },
                { id: connections.loser.id, text: "Loser drops to here", side: connections.loser.side }
            ];

            connections.feederMatches.map(f => {
                cons.push({
                    id: f.id,
                    text: f._m,
                    feeder: true
                });
            });

            store.commit("setHighlights", cons);
        },
        matchEmpty() {
            this.hover = false;
            console.log(this.match, "empty");
            store.commit("setHighlights", []);
        }
    },
    computed: {
        scores() {
            if (!this.match) return [null, null];
            if (!this.match.teams || this.match.teams.length !== 2) return [null, null];
            return [this.match.score_1, this.match.score_2];
        },
        teams() {
            const dummy = { text: "TBD", dummy: true, id: null };
            if (!this.match) return [{ ...dummy, _empty: true }, { ...dummy, _empty: true }];

            const text = (this.match.placeholder_teams || "").trim().split("|").filter(t => t !== "");

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
        matchHighlight() {
            return store.getters.getHighlight(this.match.id);
        }
    }
};
</script>

<style scoped>
    .bracket-match {
        margin: 0.6em 0;
        position: relative;
        border: .15em solid transparent;
    }
    .bracket-match, .match-number {
        transition: border-color .15s ease;
    }
    .bracket-match.hover {
        border: .15em solid white;
    }

    .match-highlight-text {
        position: absolute;
        background: white;
        color: black;
        bottom: 100%;
        z-index: 1;
        padding: 2px 8px;
    }

    .match-highlight-text[data-side="1"], .match-highlight-text[data-side="2"] {
        width: 100%;
        height: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .match-highlight-text[data-side="1"] {
        top: 0;
    }
    .match-highlight-text[data-side="2"] {
        bottom: 0;
    }
    .match-highlight-text.feeder {
        right: 0;
        left: auto;
        height: 100%;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .match-highlight-text.feeder  i {
        font-size: 2em;
        margin-top: .15em;
    }

    .match-number {
        position: absolute;
        left: 0;
        background: #333;
        text-align: center;
        bottom: 100%;
        font-size: 12px;
        line-height: 1;
        padding-top: .1em;
        padding: 0 .3em;
        padding-bottom: .3em;
        color: white;
        border: 2px solid transparent;
        border-bottom: none;
    }

    .bracket-match.hover .match-number {
        border-color: white;
    }
</style>
