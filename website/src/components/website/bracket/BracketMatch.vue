<template>
    <router-link
        v-if="!!match"
        :to="url('match', this.match)"
        class="bracket-match no-link-style"
        :class="{'hover': hover, 'forfeit': match && match.forfeit }"
        @mouseover="matchHover"
        @mouseleave="matchEmpty">
        <div class="match-name d-none">{{ match && match.name }}</div>
        <div v-if="matchNumber" class="match-number" :class="{'lowlight': lowlight}">
            <div class="industry-align">{{ matchNumber }}</div>
        </div>
        <div class="match-extra-info">
            <div v-if="showBroadcasts && match.stream_code" class="match-stream" :class="{'lowlight': lowlight}">
                <div class="industry-align">{{ match.stream_code }} stream</div>
            </div>
            <div v-if="showTimes && friendlyStartTime" class="match-time" :class="{'lowlight': lowlight}">
                <div class="industry-align">{{ friendlyStartTime }}</div>
            </div>
        </div>
        <div class="match-teams">
            <BracketTeam
                v-for="(team, i) in teams"
                :key="team.id"
                :team="team.id && team"
                :text="team.dummy && team.text"
                :short="team.dummy && team.short"
                :empty="team._empty"
                :score="displayScores[i]"
                :win="scores[i] === match.first_to"
            />
        </div>
        <transition name="fade">
            <div
                v-if="matchHighlight"
                class="match-highlight-text"
                :data-side="matchHighlight.side"
                :class="{ 'feeder': matchHighlight.feeder }">
                {{ matchHighlight.text }}
                <i v-if="matchHighlight.feeder && matchHighlight.text === 'Loser'" class="fas fa-chevron-down"></i>
                <i v-if="matchHighlight.feeder && matchHighlight.text !== 'Loser'" class="fas fa-chevron-right"></i>
            </div>
        </transition>
    </router-link>
    <div
        v-else
        class="bracket-match bracket-match-spacer"
        @mouseover="matchHover"
        @mouseleave="matchEmpty">
        <div class="match-name d-none"></div>
        <div class="match-teams">
            <BracketTeam
                v-for="(team, i) in teams"
                :key="team.id"
                :team="team.id && team"
                :text="team.dummy && team.text"
                :short="team.dummy && team.short"
                :empty="team._empty"
                :score="displayScores[i]"
            />
        </div>
    </div>
</template>

<script>
import BracketTeam from "@/components/website/bracket/BracketTeam";
import { getTeamsWithPlaceholders, url } from "@/utils/content-utils";
import spacetime from "spacetime";
import { useStatusStore } from "@/stores/statusStore";
import { useSettingsStore } from "@/stores/settingsStore";

export default {
    name: "BracketMatch",
    components: { BracketTeam },
    props: ["match", "showTimes", "showBroadcasts", "customTimezone"],
    data: () => ({
        hover: false
    }),
    computed: {
        matchNumber() {
            const localNumber = this.match?._bracket_data?.num;

            if (!this.match) return localNumber;
            return this.match.match_number || localNumber;
        },
        scores() {
            if (!this.match) return [null, null];
            if (!this.match.teams || this.match.teams.length !== 2) return [null, null];
            return [this.match.score_1, this.match.score_2];
        },
        displayScores() {
            if (this.match?.forfeit) {
                // check that it was a 3-0 or similar
                // some matches are forfeited with other scores that are important to display
                if (this.scores[0] === this.match.first_to && !this.scores[1]) {
                    return ["W", "FF"];
                } else if (this.scores[1] === this.match.first_to && !this.scores[0]) {
                    return ["FF", "W"];
                }
            }
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
            return getTeamsWithPlaceholders(this.match, this.match?._bracket_data);
        },
        matchHighlight() {
            return useStatusStore().matchHighlights.find(match => match.id === this.match.id);
        },
        lowlight() {
            return !!useStatusStore().highlightedTeam;
        },
        friendlyStartTime() {
            if (!this.match.start) return null;
            const utc = spacetime(this.match.start);
            const time = utc.goto(this.activeTimezone);
            const diffFromNow = new Date(this.match.start) - new Date();

            // if (diffFromNow <= 0) return null; // don't show on past matches (could be disabled)
            if ((this.scores || []).some(s => s === (this.match?.first_to || 2))) return null; // don't show on matches in progress / completed

            const clarifyDate = diffFromNow <= 0 || diffFromNow >= 1000 * 60 * 60 * 24 * 7;

            const format = "{day-short}[D] {hour}[M]{ampm}"
                .replace("[M]", time.minute() === 0 ? "" : ":{minute-pad}")
                .replace("[D]", clarifyDate ? " {date-ordinal} {month-short}" : "");

            return time.format(format);
        },
        activeTimezone() {
            const stz = this.customTimezone || useSettingsStore().timezone;
            if (!stz || stz === "local") return spacetime.now().timezone().name;
            return stz;
        }
    },
    methods: {
        url,
        matchHover() {
            this.hover = true;
            // console.log(this.match);
            const connections = this?.match?._bracket_data?.connections;
            if (!connections) return;

            // const cons = [
            //     { id: connections.winner.id, text: "Winner advances here", side: connections.winner.side, number: connections.winner?.match_number },
            //     { id: connections.loser.id, text: "Loser drops to here", side: connections.loser.side, number: connections.loser?.match_number }
            // ];

            // connections.feederMatches.map(f => {
            //     cons.push({
            //         id: f.id,
            //         text: f._m,
            //         feeder: true
            //     });
            // });

            // store.commit("setHighlights", cons); // disable this for now
            useStatusStore().highlightedMatch = this.match.id;
        },
        matchEmpty() {
            this.hover = false;
            // console.log(this.match, "empty");
            useStatusStore().matchHighlights = [];
            useStatusStore().highlightedMatch = null;
        },
    }
};
</script>

<style scoped>
    .bracket-match {
        margin: 0.8em 0;
        position: relative;
        /*border: .125em solid transparent;*/
        outline: .125em solid transparent;
    }
    .bracket-match {
        transition: outline-color .15s ease;
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

    .match-number, .match-extra-info > div {
        background: #333;
        text-align: center;
        padding: .25em .5em;
        color: white;
        transition: opacity 150ms, outline-color 150ms;

    }

    .match-extra-info > div + div {
        margin-left: 5px;
    }

    .match-extra-info {
        position: absolute;
        bottom: 100%;
        line-height: 1;
        font-size: 0.75em;
        right: 0;

        display: flex;
        justify-content: flex-end;
    }

    .match-number {
        position: absolute;
        bottom: 100%;
        left: 0;
        font-size: 0.75em;
        line-height: 1;
        border-bottom: none;
        white-space: nowrap;
    }

    .match-extra-info  .match-stream {
        background-color: var(--win-background-color);
        color: var(--win-color);
    }

    .bracket-match.hover,
    .bracket-match.hover .match-number,
    .bracket-match.hover .match-extra-info > div {
        outline-color:  rgba(255, 255, 255, 0.5);
    }
    .bracket-match:not(:hover) .match-number.lowlight,
    .bracket-match:not(:hover) .match-extra-info > div.lowlight {
        opacity: 0.2;
    }
</style>
