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
                <tr v-for="([key, data]) in Object.entries(standingsSort)" :key="key">
                    <td>{{ key }}</td>
                    <td>{{ data.description }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { StandingsShowKeys, StandingsSortKeys } from "@/utils/standings";
import LearnTitleChip from "@/components/website/guide/LearnTitleChip.vue";

export default {
    name: "ToolStandings",
    components: { LearnTitleChip },
    computed: {
        standingsShow() {
            return StandingsShowKeys();
        },
        standingsSort() {
            return StandingsSortKeys();
        }
    },
    head() {
        return {
            title: "Standings"
        };
    },
};
</script>
