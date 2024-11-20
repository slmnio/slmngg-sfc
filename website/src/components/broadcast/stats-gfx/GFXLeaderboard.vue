<template>
    <div
        class="player-leaderboard w-100"
        :class="{'show-subtle-bars': showBarGraph}"
        :data-thing-count="things?.length || 0"
        :style="{ fontSize: leaderboardFontSize }">
        <table class="w-100">
            <tbody>
                <tr v-for="(thing, i) in things" :key="thing?.id" class="leaderboard-row" :class="{'multi-item': leaderboardData?.[i]?.length > 1}">
                    <td class="position-number">
                        <div class="industry-align">{{ i+1 }}</div>
                    </td>
                    <div
                        v-if="showBarGraph"
                        class="bar"
                        :style="{
                            width: `${parseInt(leaderboardData?.[i]?.[leaderboardData?.[i]?.length - 1]) / parseInt(leaderboardData?.[0]?.[leaderboardData?.[0]?.length - 1]) * 100}%`,
                            animationDuration: `${1.5 + (i * 0.1)}s`
                        }"></div>
                    <td class="logo-container">
                        <ThemeLogo
                            v-if="getRelevantTeam(thing)"
                            border-width=".1em"
                            class="player-team-logo"
                            :theme="getRelevantTeam(thing)?.theme"
                            logo-size="w-500" />
                        <div v-else class="player-team-logo default-thing player-team-logo-placeholder"></div>
                    </td>
                    <td class="player-name">
                        <div class="industry-align">{{ thing.name }}</div>
                    </td>
                    <td
                        v-for="(item, itemNum) in (leaderboardData?.[i] || [])"
                        :key="item"
                        class="leaderboard-item text-right"
                        :class="{'nums': numeric(item), 'data-item': itemNum === leaderboardData?.[i]?.length - 1}"
                        :data-item-num="(itemNum)">
                        <div class="industry-align">{{ item }}</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { cleanID } from "@/utils/content-utils.js";
import ThemeLogo from "@/components/website/ThemeLogo.vue";

export default {
    name: "GFXLeaderboard",
    components: { ThemeLogo },
    props: {
        gfx: Object,
        broadcast: Object,
    },
    computed: {
        things() {
            if (this.gfx?.teams?.length) return this.gfx.teams;
            if (this.gfx?.players?.length) return this.gfx.players;
            return [];
        },
        leaderboardData() {
            if (!this.gfx?.markdown?.length) return [];
            return this.gfx.markdown.split("\n").filter(Boolean).map(line => line.split("|"));
        },
        leaderboardFontSize() {
            const thingCount = this.things?.length;
            if (!thingCount) return "";

            function clamp(number, min, max) {
                return Math.max(min, Math.min(number, max));
            }
            return clamp(350 / thingCount, 16, 72) + "px";
        },
        showBarGraph() {
            return (this.gfx?.graphics_settings || [])?.includes("Show bar graph behind leaderboard");
        }
    },
    methods: {
        /**
         * @param {Team[]} thing.member_of
         */
        getRelevantTeam(thing) {
            if (thing.__tableName === "Teams") return thing;
            if (!thing?.member_of?.length) return null;
            const eventTeams = thing.member_of.filter(team => team.id && cleanID(team.event?.[0]) === cleanID(this.broadcast?.event?.id));
            if (!eventTeams?.length) return null;
            return eventTeams[eventTeams.length - 1]; // get last so we can reorder it without too much issue
        },
        numeric(test) {
            // TODO: this doesn't work yet
            return /[^\d\-+%.~]*/.test(test);
        }
    },
};
</script>

<style scoped>
    .player-leaderboard {
        font-size: 60px;
    }
    .player-team-logo {
        height: 1.5em;
        width: 1.75em;
        margin: 0.1em 0;
    }
    .player-team-logo-placeholder {
        border-bottom-width: .1em;
        border-bottom-style: solid;
        /* let .default-thing control colour */
    }
    .position-number {
        font-size: 0.75em;
        text-align: center;
        min-width: 1.5em;
    }
    table {
        border-collapse:separate;
        border-spacing: 0 0.25em;
    }
    td {
        padding: 0 0.25em;
        white-space: nowrap;
        background-color: #FFFFFF0C;
    }

    .player-leaderboard.show-subtle-bars td {
        background-color: #FFFFFF06;
    }

    td:first-child {
        padding-left: .5em;
    }
    td:last-child {
        padding-right: .5em;
    }

    .player-name {
        width: 100%;
    }
    .nums {
        font-variant-numeric: tabular-nums;
    }

    .bar {
        position: absolute;
        background-color: #FFFFFF08;
        height: 100%;
        top: 0;
        left: 0;
        z-index: -1;
        animation: bar-animate 1.5s forwards ease-in-out;
    }

    @keyframes bar-animate {
        0%, 25% {
            width: 0;
        }
    }
    tr {
        position: relative;
        z-index: 2;
    }
    .leaderboard-row.multi-item .leaderboard-item:not(.data-item) {
        font-size: 0.6em;
        padding-right: 1em;
    }
    .leaderboard-row.multi-item .leaderboard-item:not(.data-item) .industry-align {
        opacity: 0.75;
    }
</style>
