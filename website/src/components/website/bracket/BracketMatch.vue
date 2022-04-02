<template>
    <router-link :to="url('match', this.match)" class="bracket-match no-link-style" v-if="!!match"
                 v-bind:class="{'hover': hover, 'forfeit': match && match.forfeit }"
                 @mouseover.native="matchHover" @mouseleave.native="matchEmpty">
        <div class="match-name d-none">{{ match && match.name }}</div>
        <div class="match-number" v-bind:class="{'lowlight': lowlight}" v-if="match.match_number">{{ match.match_number }}</div>
        <div class="match-teams">
            <BracketTeam v-for="(team, i) in teams"
                         :team="team.id && team"
                         :text="team.dummy && team.text"
                         :short="team.dummy && team.short"
                         :empty="team._empty"
                         v-bind:key="team.id"
                         :score="displayScores[i]" :win="scores[i] === match.first_to"
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
                         :short="team.dummy && team.short"
                         :empty="team._empty"
                         v-bind:key="team.id"
                         :score="displayScores[i]"
            />
        </div>
    </div>
</template>

<script>
import BracketTeam from "@/components/website/bracket/BracketTeam";
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
            // console.log(this.match);
            const connections = this?.match?._bracket_data?.connections;
            if (!connections) return;

            const cons = [
                { id: connections.winner.id, text: "Winner advances here", side: connections.winner.side, number: connections.winner?.match_number },
                { id: connections.loser.id, text: "Loser drops to here", side: connections.loser.side, number: connections.loser?.match_number }
            ];

            connections.feederMatches.map(f => {
                cons.push({
                    id: f.id,
                    text: f._m,
                    feeder: true
                });
            });

            // store.commit("setHighlights", cons); // disable this for now
            store.commit("setHighlightedMatch", this.match.id);
        },
        matchEmpty() {
            this.hover = false;
            // console.log(this.match, "empty");
            store.commit("setHighlights", []);
            store.commit("setHighlightedMatch", null);
        }
    },
    computed: {
        scores() {
            if (!this.match) return [null, null];
            if (!this.match.teams || this.match.teams.length !== 2) return [null, null];
            return [this.match.score_1, this.match.score_2];
        },
        displayScores() {
            if (this.match && this.match.first_to === 1 && this.match.maps?.length === 1) {
                const map = this.match.maps[0];
                if (map.id && (map.score_1 !== undefined && map.score_2 !== undefined)) {
                    if (this.shouldSwapTeams) return [map.score_2, map.score_1];
                    return [map.score_1, map.score_2];
                }
            }
            return this.scores;
        },
        teams() {
            const dummy = { text: "TBD", dummy: true, id: null };
            if (!this.match) return [{ ...dummy, _empty: true }, { ...dummy, _empty: true }];

            let text = (this.match.placeholder_teams || "").trim().split("|").filter(t => t !== "");
            let extraText = [null, null];

            if (text.length === 4) {
                extraText = [text[2], text[3]];
                text = [text[0], text[1]];
            }

            if (!this.match.teams || this.match.teams.length === 0) {
                if (text.length === 2) {
                    return text.map((t, i) => ({ ...dummy, text: t, short: extraText[i] }));
                } else if (text.length === 1) {
                    if (this.match.placeholder_right) return [dummy, { ...dummy, text: text[0] }];
                    return [{ ...dummy, text: text[0], short: extraText[0] }, dummy];
                } else if (text.length === 0) {
                    // no text, just use TBDs
                    return [dummy, dummy];
                }
            }
            if (this.match.teams.length === 1) {
                if (text.length === 2) {
                    if (this.match.placeholder_right) return [this.match.teams[0], { ...dummy, text: text[1], short: extraText[1] }];
                    return [{ ...dummy, text: text[0], short: extraText[0] }, this.match.teams[0]];
                } else if (text.length === 1) {
                    if (this.match.placeholder_right) return [this.match.teams[0], { ...dummy, text: text[0], short: extraText[0] }];
                    return [{ ...dummy, text: text[0], short: extraText[0] }, this.match.teams[0]];
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
        },
        lowlight() {
            return !!store.state.highlighted_team;
        }
    }
};
</script>

<style scoped>
    .bracket-match {
        margin: 0.6em 0;
        position: relative;
        border: .125em solid transparent;
    }
    .bracket-match {
        transition: border-color .15s ease;
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
        font-size: 0.75em;
        line-height: 1;
        padding: 0 .3em;
        padding-bottom: .3em;
        color: white;
        border: 2px solid transparent;
        border-bottom: none;
        transition: opacity 150ms, border-color 150ms;
    }

    .bracket-match.hover,
    .bracket-match.hover .match-number {
        border-color:  rgba(255, 255, 255, 0.5);
    }
    .bracket-match:not(:hover) .match-number.lowlight {
        opacity: 0.2;
    }
</style>
