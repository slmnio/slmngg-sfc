<template>
    <div v-if="standings && standings.standings && standings.standings.length" class="standings" :style="useAutoFontSize ? { 'fontSize': autoFontSize} : {}">
        <!--        <div>{{ event.name }} / {{ stage }} / {{ allMatches.length }} -> {{ stageMatches.length }} ({{ teams.length }} teams)</div>-->
        <h3 class="top-standings-name text-center d-md-none">{{ title || (standingsSettings && standingsSettings.title) || stage || 'Team' }}</h3>
        <div class="standings-header d-flex align-items-center">
            <div class="team-name flex-grow-1 text-start d-none d-md-flex">{{ title || (standingsSettings && standingsSettings.title) || stage || 'Team' }}</div>
            <div class="team-name team-code flex-grow-1 text-start d-md-none"></div>
            <div class="team-stats d-flex">
                <div v-for="col in showColumns" :key="col" v-b-tooltip="getColumnText(col).title" class="team-stat text-center">
                    {{ getColumnText(col).header }}
                </div>
                <!--                <div class="team-stat text-center">Matches</div>-->
                <!--                <div class="team-stat text-center">Maps</div>-->
                <!--                <div class="team-stat text-center">Map Diff</div>-->
                <!--                <div v-if="useOMW" class="team-stat text-center d-none d-md-block" v-b-tooltip:top="'Opponent Match Winrate'">OMW</div>-->
                <!--                <div class="team-stat text-center">Points</div>-->
            </div>
        </div>
        <div class="teams">
            <div v-for="(group, i) in standings.standings" :key="i" class="team-group">
                <div v-for="team in group" :key="team.id" class="team">
                    <StandingsTeam
                        :team="team"
                        :tie-text="tieText"
                        :show-columns="showColumns"
                        icon-size="w-60"
                        :game="event?.game"
                        :highlight="teamIsInHighlightMatch(team)"
                        :use-codes="useCodes" />
                </div>
            </div>
        </div>
        <div v-if="standings && standings.warnings.length" class="warnings flex-center flex-column mt-2 mx-2">
            <div v-for="warn in standings.warnings" :key="warn" class="warning bg-warning text-dark p-1 px-2 mb-1">{{ warn }}</div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import StandingsTeam from "@/components/broadcast/StandingsTeam";
import { calculateStandings, StandingsShowKeys } from "@/utils/standings";
import { cleanID } from "@/utils/content-utils";


function avg(arr) {
    if (!arr?.length) return null;
    const sum = arr.reduce((a, b) => a + b, 0);
    const avg = (sum / arr.length) || 0;
    return avg;
}


export default {
    name: "Standings",
    components: { StandingsTeam },
    props: {
        event: Object,
        stage: String,
        stages: Array,
        title: String,
        tieText: String,
        showMapDiff: Boolean,
        useCodes: Boolean,
        overrideShowColumns: Array,
        useAutoFontSize: Boolean,
        highlightMatch: Object
    },
    computed: {
        autoFontSize() {
            const teams = this.standings?.standings;
            if (!teams) return "";

            function clamp(number, min, max) {
                return Math.max(min, Math.min(number, max));
            }
            return clamp(380 / ((teams?.length || 0) + 1.2), 16, 46) + "px";
        },
        allMatches() {
            if (!this.event?.matches) return [];
            return ReactiveArray("matches", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                maps: ReactiveArray("maps")
            })(this.event);
        },
        stageMatches() {
            if (!this.allMatches?.length) return [];
            if (this.stage || this.stages) {
                if (this.stages) {
                    return this.allMatches.filter(match => this.stages.some(stage => match.match_group && match.match_group.toLowerCase() === stage.toLowerCase()));
                } else if (this.stage) {
                    return this.allMatches.filter(match => match.match_group && match.match_group.toLowerCase() === this.stage.toLowerCase());
                }
            }
            return this.allMatches;
        },
        blocks() {
            if (!this.event?.blocks) return null;
            try {
                const blocks = JSON.parse(this.event.blocks);
                return blocks || null;
            } catch (e) {
                return null;
            }
        },
        settings() {
            if (!this.blocks) return null;
            return this.blocks?.settings || null;
        },
        useOMW() {
            return this.settings?.useOMW || ["OMatchWinrate", "OMapWinrate"].some(k => (this.standingsSort || []).includes(k) || (this.showColumns || []).includes(k));
            // return this.settings?.useOMW && this.stageMatches.every(m => [m.score_1, m.score_2].some(s => s === m.first_to));
        },
        standingsSort() {
            return this.standingsSettings?.sort || [];
        },
        standingsSettings() {
            return (this.blocks?.standings || []).find(s =>
                s.group?.toLowerCase() === this.stage?.toLowerCase() ||
                s.key?.toLowerCase() === this.stage?.toLowerCase()
            );
        },
        showColumns() {
            return this.overrideShowColumns || this.standingsSettings?.show || [
                "Matches", "Maps", "MapDiff"
            ];
        },
        standings() {
            return calculateStandings(this.stageMatches, this.event, this.settings, this.useOMW, this.standingsSort, this.standingsSettings);
        }
    },
    methods: {
        getColumnText(col) {
            return (StandingsShowKeys(this.event?.game))[col] || {
                header: "-", title: col
            };
        },
        hasColumns(...cols) {
            // TODO: needs to be either shown columns or has columns? feel like it's getting a little tangled
            console.log("cols", cols, this.showColumns);
            return this.showColumns.some(col => cols.includes(col));
        },
        teamIsInHighlightMatch(team) {
            if (!this.highlightMatch?.teams?.length) return false;
            return this.highlightMatch.teams.some(t => cleanID(t?.id || t) === (team?.id || team));
        }
    }
};
</script>

<style scoped>
    .standings {
        font-size: 46px;
        width: 100%;
    }

    .team-stat {
        width: 5.3333em;
        font-size: .75em;
    }

    .standings-header, .top-standings-name {
        font-weight: bold;
        text-transform: uppercase;
        line-height: 1;
        margin-bottom: .2em;
    }
    .team-name {
        margin-left: 2em;
    }
    .warnings {
        font-weight: bold;
        font-size: 18px;
    }
    .warning {
        max-width: calc(100vw - 2em);
    }
</style>
