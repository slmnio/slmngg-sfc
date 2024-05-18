<template>
    <div class="container">
        <LearnTitleChip subtitle="Standings Reference" />
        <p>
            The standings pages can be customised from the event or from overlays. There are separate keys to sort
            (ordering teams) and to show (displaying as columns).
        </p>

        <h2>Standings showing keys</h2>

        <p>
            You can use this in an event's standings block (<code>"show": ["MatchWinrate", "MapWinrate"]</code>) or on
            overlays <code>show=Matches,Maps,MapDiff</code>
        </p>

        <table class="table table-sm table-dark table-bordered">
            <thead>
                <tr>
                    <th>Key</th>
                    <th>Header</th>
                    <th>Title</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="([key, stat]) in Object.entries(standingsShow)" :key="key">
                    <td>{{ key }}</td>
                    <td>{{ stat.header }}</td>
                    <td>{{ stat.title }}</td>
                    <td>{{ stat.description }}</td>
                </tr>
                <!--                <tr>-->
                <!--                    <td>MatchWinrate</td>-->
                <!--                    <td>W%</td>-->
                <!--                    <td>Match winrate</td>-->
                <!--                    <td>% of matches won</td>-->
                <!--                </tr>-->
                <!--                <tr>-->
                <!--                    <td>MapWinrate</td>-->
                <!--                    <td>MW%</td>-->
                <!--                    <td>Map winrate</td>-->
                <!--                    <td>% of maps won</td>-->
                <!--                </tr>-->
                <!--                <tr>-->
                <!--                    <td>OMatchWinrate</td>-->
                <!--                    <td>OW%</td>-->
                <!--                    <td>Opponents' match winrate</td>-->
                <!--                    <td>Average % of all opponents match winrate</td>-->
                <!--                </tr>-->
                <!--                <tr>-->
                <!--                    <td>OMapWinrate</td>-->
                <!--                    <td>OMW%</td>-->
                <!--                    <td>Opponents' map winrate</td>-->
                <!--                    <td>Average % of all opponents maps winrate</td>-->
                <!--                </tr>-->
                <!--                <tr>-->
                <!--                    <td>Matches</td>-->
                <!--                    <td>Matches</td>-->
                <!--                    <td>Matches won and lost</td>-->
                <!--                    <td>X-X matches</td>-->
                <!--                </tr>-->
                <!--                <tr>-->
                <!--                    <td>MatchDiff</td>-->
                <!--                    <td>Match Diff</td>-->
                <!--                    <td>Matches won - matches lost</td>-->
                <!--                    <td>±Match delta</td>-->
                <!--                </tr>-->
                <!--                <tr>-->
                <!--                    <td>Maps</td>-->
                <!--                    <td>Maps</td>-->
                <!--                    <td>Maps won and lost</td>-->
                <!--                    <td>X-X maps</td>-->
                <!--                </tr>-->
                <!--                <tr>-->
                <!--                    <td>MapDiff</td>-->
                <!--                    <td>Map Diff</td>-->
                <!--                    <td>Maps won - maps lost</td>-->
                <!--                    <td>±Map delta</td>-->
                <!--                </tr>-->
                <!--                <tr>-->
                <!--                    <td>ValorantRounds</td>-->
                <!--                    <td>RW-RL</td>-->
                <!--                    <td>Rounds won - rounds lost</td>-->
                <!--                    <td>X-X map rounds (could be used in other games if the map scores made sense)</td>-->
                <!--                </tr>-->
                <!--                <tr>-->
                <!--                    <td>ValorantRoundDiff</td>-->
                <!--                    <td>ΔR</td>-->
                <!--                    <td>Round diff</td>-->
                <!--                    <td>±Map round score delta</td>-->
                <!--                </tr>-->
            </tbody>
        </table>

        <h2>Standings sorting keys</h2>

        <table class="table table-sm table-dark table-bordered">
            <thead>
                <tr>
                    <th>Key</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>MatchDiff</td>
                    <td>Calculates match diff (match wins - match losses)</td>
                </tr>
                <tr>
                    <td>MapDiff</td>
                    <td>Calculates map diff (map wins - map losses)</td>
                </tr>
                <tr>
                    <td>MatchWinrate</td>
                    <td>Calculates match winrate (match wins / matches played)</td>
                </tr>
                <tr>
                    <td>MapWinrate</td>
                    <td>Calculates map winrate (map wins / maps played)</td>
                </tr>
                <tr>
                    <td>HeadToHead</td>
                    <td>
                        For 2 teams max - counts the matches aggregate (e.g. if they play each other once, it'll be 1 or -1.
                        Multiple matches in the same match group could even it out)
                    </td>
                </tr>
                <tr>
                    <td>MapWins</td>
                    <td>Sorts only by map wins (not diff)</td>
                </tr>
                <tr>
                    <td>OMW</td>
                    <td>Averages all opponent's match winrates. Identical to OMatchWinrate (I think)</td>
                </tr>
                <tr>
                    <td>OMatchWinrate</td>
                    <td>Averages all opponent's match winrates</td>
                </tr>
                <tr>
                    <td>OMapWinrate</td>
                    <td>Averages all opponent's map winrates</td>
                </tr>
                <tr>
                    <td>MiniLeague</td>
                    <td>
                        Creates a standings of the matches for the opponents that are tied, and sorts them by match diff
                    </td>
                </tr>
                <tr>
                    <td>MiniLeagueMaps</td>
                    <td>Creates a standings of the matches for the opponents that are tied, and sorts them by map diff</td>
                </tr>
                <tr>
                    <td>MapRoundsDiff</td>
                    <td>Sorts by map round diff (map score wins - map score losses)</td>
                </tr>
                <tr>
                    <td>MapRoundWins</td>
                    <td>Sorts by map score wins only (not diff)</td>
                </tr>
                <tr>
                    <td>Points</td>
                    <td>Sorts by extra points (on team.extra_points)</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { StandingsShowKeys } from "@/utils/standings";
import LearnTitleChip from "@/components/website/guide/LearnTitleChip.vue";

export default {
    name: "ToolStandings",
    components: { LearnTitleChip },
    computed: {
        standingsShow() {
            return StandingsShowKeys;
        }
    },
    head() {
        return {
            title: "Standings"
        };
    },
};
</script>
