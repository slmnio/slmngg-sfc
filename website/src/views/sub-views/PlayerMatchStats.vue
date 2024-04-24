<template>
    <div class="container">

        <div class="settings mb-3">
            <b-form-group label="Tier filter" label-cols="4" label-cols-lg="2">
                <b-form-select class="w-auto" :options="tierFilterOptions" v-model="tierFilter"/>
            </b-form-group>
        </div>

        <table class="table-bordered table-dark">
            <thead>
                <tr>
                    <th v-if="showTeams" rowspan="2" @click="showTeams = !showTeams">Event</th>
                    <th v-if="showTeams" rowspan="2" @click="showTeams = !showTeams">Team</th>

                    <th v-if="!showTeams" rowspan="2" colspan="2" @click="showTeams = !showTeams"></th>

                    <th class="category new-category" colspan="3">Regular Season</th>
                    <th class="category new-category" colspan="3">Playoffs</th>
                    <th class="category new-category" colspan="3">Uncategorised</th>
                    <th class="category total-category" colspan="3">Total</th>
                </tr>
                <tr>
                    <th class="num new-category">W</th>
                    <th class="num">L</th>
                    <th class="winrate-text">W%</th>

                    <th class="num new-category">W</th>
                    <th class="num">L</th>
                    <th class="winrate-text">W%</th>

                    <th class="num new-category">W</th>
                    <th class="num">L</th>
                    <th class="winrate-text">W%</th>

                    <th class="num new-category total-category">W</th>
                    <th class="num">L</th>
                    <th class="winrate-text">W%</th>
<!--                    <th>F</th>-->
                </tr>
            </thead>
            <tbody>
                <tr class="team" v-for="team in showedTeams" :key="team.id">
                    <td :style="eventStyle(team)">
                        <div v-if="team.event">
                            <router-link class="d-flex align-items-center no-link-style" :to="url('event', team.event)">
                                <ThemeLogo :theme="team.event.theme" border-width="0" logo-size="s-76" class="logo"></ThemeLogo>
                                <div class="p-1 event-name"><b>{{ team.event && (team.event.short || team.event.name) }}</b></div>
                            </router-link>
                        </div>
                    </td>
                    <td :style="teamStyle(team)">
                        <router-link class="d-flex align-items-center no-link-style" :to="url('team', team)">
                            <ThemeLogo :theme="team.theme" border-width="0" logo-size="s-76" class="logo"></ThemeLogo>
                            <div class="p-1 team-name"><b>{{ team.name }}</b></div>
                        </router-link>
                    </td>

                    <td :class="{'no-matches': team.stats.regular_season.played === 0 }" class="num new-category">
                        <div class="main">{{ team.stats.regular_season.wins }}</div>
                        <div class="maps-text">{{ team.stats.regular_season.maps.wins }}</div>
                    </td>
                    <td :class="{'no-matches': team.stats.regular_season.played === 0 }" class="num">
                        <div class="main">{{ team.stats.regular_season.losses }}</div>
                        <div class="maps-text">{{ team.stats.regular_season.maps.losses }}</div>
                    </td>
                    <td :class="{'no-matches': team.stats.regular_season.played === 0 }" class="winrate">
                        <div class="main">{{ team.stats.regular_season.winrate }}</div>
                        <div class="maps-text">{{ team.stats.regular_season.maps.winrate }}</div>
                    </td>

                    <td :class="{'no-matches': team.stats.playoffs.played === 0 }" class="num new-category">
                        <div class="main">{{ team.stats.playoffs.wins }}</div>
                        <div class="maps-text">{{ team.stats.playoffs.maps.wins }}</div>
                    </td>
                    <td :class="{'no-matches': team.stats.playoffs.played === 0 }" class="num">
                        <div class="main">{{ team.stats.playoffs.losses }}</div>
                        <div class="maps-text">{{ team.stats.playoffs.maps.losses }}</div>
                    </td>
                    <td :class="{'no-matches': team.stats.playoffs.played === 0 }" class="winrate">
                        <div class="main">{{ team.stats.playoffs.winrate }}</div>
                        <div class="maps-text">{{ team.stats.playoffs.maps.winrate }}</div>
                    </td>

                    <td :class="{'no-matches': team.stats.others.played === 0 }" class="num new-category">
                        <div class="main">{{ team.stats.others.wins }}</div>
                        <div class="maps-text">{{ team.stats.others.maps.wins }}</div>
                    </td>
                    <td :class="{'no-matches': team.stats.others.played === 0 }" class="num">
                        <div class="main">{{ team.stats.others.losses }}</div>
                        <div class="maps-text">{{ team.stats.others.maps.losses }}</div>
                    </td>
                    <td :class="{'no-matches': team.stats.others.played === 0 }" class="winrate">
                        <div class="main">{{ team.stats.others.winrate }}</div>
                        <div class="maps-text">{{ team.stats.others.maps.winrate }}</div>
                    </td>

                    <td :class="{'no-matches': team.stats.all.played === 0 }" class="num new-category total-category">
                        <div class="main">{{ team.stats.all.wins }}</div>
                        <div class="maps-text">{{ team.stats.all.maps.wins }}</div>
                    </td>
                    <td :class="{'no-matches': team.stats.all.played === 0 }" class="num">
                        <div class="main">{{ team.stats.all.losses }}</div>
                        <div class="maps-text">{{ team.stats.all.maps.losses }}</div>
                    </td>
                    <td :class="{'no-matches': team.stats.all.played === 0 }" class="winrate">
                        <div class="main">{{ team.stats.all.winrate }}</div>
                        <div class="maps-text">{{ team.stats.all.maps.winrate }}</div>
                    </td>

                    <!--<editor-fold desc="old debug">-->
                    <!--                    <td class="px-2" :class="{'text-muted': team.stats.regular_season.length === 0}">-->
<!--                        {{ team.stats.regular_season.length }} Regular season matches<br>-->
<!--                        {{ getWLP(team.stats.regular_season, team) }}-->
<!--                        <ul>-->
<!--                            <li v-for="item in team.stats.regular_season" :key="item.id">-->
<!--                                <router-link :to="url('match', item)">{{ item.name }}</router-link>-->
<!--                            </li>-->
<!--                        </ul>-->
<!--                    </td>-->
<!--                    <td class="px-2" :class="{'text-muted': team.stats.playoffs.length === 0}">-->
<!--                        {{ team.stats.playoffs.length }} Playoffs matches<br>-->
<!--                        {{ getWLP(team.stats.playoffs, team) }}-->
<!--                        <ul>-->
<!--                            <li v-for="item in team.stats.playoffs" :key="item.id">-->
<!--                                <router-link :to="url('match', item)">{{ item.name }}</router-link>-->
<!--                            </li>-->
<!--                        </ul>-->
<!--                    </td>-->
<!--                    <td class="px-2" :class="{'text-muted': team.stats.others.length === 0}">-->
<!--                        {{ team.stats.others.length }} Uncategorised matches<br>-->
<!--                        {{ getWLP(team.stats.others, team) }}-->
<!--                        <ul>-->
<!--                            <li v-for="item in team.stats.others" :key="item.id">-->
<!--                                <router-link :to="url('match', item)">{{ item.name }}</router-link>-->
<!--                            </li>-->
<!--                        </ul>-->
<!--                    </td>-->
                    <!--</editor-fold>-->
                </tr>
                <tr class="totals">
                    <td colspan="2" class="text-end">Total ({{ totals.all.played }} matches)</td>

                    <td class="num new-category">{{ totals.regular_season.wins }}</td>
                    <td class="num">{{ totals.regular_season.losses }}</td>
                    <td class="winrate">{{ totals.regular_season.winrate }}</td>

                    <td class="num new-category">{{ totals.playoffs.wins }}</td>
                    <td class="num">{{ totals.playoffs.losses }}</td>
                    <td class="winrate">{{ totals.playoffs.winrate }}</td>

                    <td class="num new-category">{{ totals.others.wins }}</td>
                    <td class="num">{{ totals.others.losses }}</td>
                    <td class="winrate">{{ totals.others.winrate }}</td>

                    <td class="num new-category total-category">{{ totals.all.wins }}</td>
                    <td class="num">{{ totals.all.losses }}</td>
                    <td class="winrate">{{ totals.all.winrate }}</td>
                </tr>
                <tr class="totals">
                    <td colspan="2" class="text-end">Total ({{ totals.all.maps.played }} maps)</td>

                    <td class="num new-category">{{ totals.regular_season.maps.wins }}</td>
                    <td class="num">{{ totals.regular_season.maps.losses }}</td>
                    <td class="winrate">{{ totals.regular_season.maps.winrate }}</td>

                    <td class="num new-category">{{ totals.playoffs.maps.wins }}</td>
                    <td class="num">{{ totals.playoffs.maps.losses }}</td>
                    <td class="winrate">{{ totals.playoffs.maps.winrate }}</td>

                    <td class="num new-category">{{ totals.others.maps.wins }}</td>
                    <td class="num">{{ totals.others.maps.losses }}</td>
                    <td class="winrate">{{ totals.others.maps.winrate }}</td>

                    <td class="num new-category total-category">{{ totals.all.maps.wins }}</td>
                    <td class="num">{{ totals.all.maps.losses }}</td>
                    <td class="winrate">{{ totals.all.maps.winrate }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { url } from "@/utils/content-utils";
import { sortMatches } from "@/utils/sorts";
import { logoBackground1 } from "@/utils/theme-styles";
import ThemeLogo from "@/components/website/ThemeLogo.vue";

function getWinrate(wins, matchCount) {
    if (!matchCount) return "-";
    const num = wins / matchCount;
    if (num === 1) return "100%";

    if (matchCount > 10) return (num * 100).toFixed(1) + "%";
    return (num * 100).toFixed(0) + "%";
}
function getWLP(matches, team) {
    if (!matches || !team) return {};

    matches = matches.filter(match => [match.score_1, match.score_2].includes(match.first_to));

    const wins = matches.filter(match =>
        match?.teams?.length === 2 &&
        (
            (match.score_1 === match.first_to && match.teams[0]?.id === team.id) ||
            (match.score_2 === match.first_to && match.teams[1]?.id === team.id)
        )
    );
    const losses = matches.filter(match =>
        match?.teams?.length === 2 &&
        (
            (match.score_2 === match.first_to && match.teams[0]?.id === team.id) ||
            (match.score_1 === match.first_to && match.teams[1]?.id === team.id)
        )
    );

    const forfeits = matches.filter(match =>
        match.forfeit &&
        match?.teams?.length === 2 &&
        (
            (match.score_1 === match.first_to && match.teams[0]?.id === team.id) ||
            (match.score_2 === match.first_to && match.teams[1]?.id === team.id)
        )
    );

    const maps = {
        wins: 0,
        losses: 0,
        played: 0
    };

    matches.forEach(match => {
        if ([match.score_1, match.score_2].some(s => match.first_to === s)) {
            // match
            if (!match.teams?.[0]?.id) return;

            const teamIsLeft = match.teams[0]?.id === team.id;
            maps.wins += teamIsLeft ? (match.score_1 || 0) : (match.score_2 || 0);
            maps.losses += teamIsLeft ? (match.score_2 || 0) : (match.score_1 || 0);
            maps.played += (match.score_1 || 0) + (match.score_2 || 0);
        }
    });

    maps.winrate = getWinrate(maps.wins, maps.played);

    return {
        wins: wins.length,
        losses: losses.length,
        forfeits: forfeits.length,
        winrate: getWinrate(wins.length, matches.length),
        winrateNum: wins.length / matches.length,
        played: matches.length,
        maps,
        matches: { wins, losses, forfeits, all: matches }
    };
}
function getGroups(matches) {
    const groups = {
        playoffs: [],
        regularSeason: [],
        others: [],
        _sorted: []
    };
    matches.forEach(match => {
        let matchType;
        const brackets = (match.brackets || []).filter(b => b?.events);
        // console.log([match.sub_event, match.match_group, match.round, ...(brackets || []).map(bracket => bracket.name)].filter((v, i, a) => v && a.indexOf(v) === i).map(e => e.toLowerCase()));
        [match.sub_event, match.match_group, match.round, ...(brackets || []).map(bracket => bracket.name)].filter((v, i, a) => v && a.indexOf(v) === i).map(e => e.toLowerCase()).forEach(identifier => {
            if (!identifier || matchType) return;

            if (["playoff", "play-in", "playin"].some(x => identifier.includes(x))) {
                matchType = "playoffs";
            } else if (["regular season", "swiss", "group", "league"].some(x => identifier.includes(x))) {
                matchType = "regularSeason";
            } else if (["playoff", "play-in", "playin", "final", "bracket"].some(x => identifier.includes(x)) || brackets?.length) {
                matchType = "playoffs";
            } else {
                matchType = "others";
            }
        });
        if (matchType) {
            groups[matchType].push(match);
        }
    });
    // console.log({
    //     event: matches[0]?.event?.name,
    //     others: groups.others
    // });
    return groups;
    // return Object.entries(groups).filter(([key, num]) => num > 1).map(([key, num]) => key);
}

const tiers = ["S Tier", "A Tier", "B Tier", "C Tier", "Unranked"];

export default {
    name: "PlayerMatchStats",
    props: ["player"],
    methods: {
        url,
        eventStyle(team) {
            if (!team?.event?.theme) return {};
            return {
                ...logoBackground1(team.event),
                borderColor: null
            };
        },
        teamStyle(team) {
            if (!team?.theme) return {};
            return {
                ...logoBackground1(team),
                borderColor: null
            };
        }
    },
    components: {
        ThemeLogo
    },
    data: () => ({
        showTeams: true,
        tierFilter: "A Tier+"
    }),
    computed: {
        tierFilterOptions() {
            return [
                ...tiers.slice(0, tiers.length - 1).map(t => `${t}+`),
                "All"
            ];
        },
        showedTeams() {
            return this.showTeams
                ? this.teams.filter(team => {
                    if (this.tierFilter === "All") return true;
                    if (!team.event?.tier) return false;
                    const tierFilterIndex = tiers.indexOf(this.tierFilter.replace("+", ""));
                    const eventTierIndex = tiers.indexOf(team.event?.tier);

                    console.log({ tierFilterIndex, eventTierIndex, tier: team.event?.tier, event: team.event?.name });
                    return eventTierIndex <= tierFilterIndex;
                })
                : [];
        },
        teams() {
            if (!this.player?.member_of?.length) return [];
            return ReactiveArray("member_of", {
                theme: ReactiveThing("theme"),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                matches: ReactiveArray("matches", {
                    brackets: ReactiveArray("brackets"),
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    }),
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                })
            })(this.player).filter((t) => t.matches?.length).map(team => {
                const { regularSeason, playoffs, others } = getGroups(team.matches);

                return {
                    ...team,
                    stats: {
                        regular_season: getWLP(regularSeason, team),
                        playoffs: getWLP(playoffs, team),
                        others: getWLP(others, team),
                        all: getWLP(team.matches, team)
                    }
                };
            }).sort(sortMatches);
            //     .sort((a, b) => {
            //     const diff = b.stats.all.winrateNum - a.stats.all.winrateNum;
            //     if (diff !== 0) return diff;
            //     return b.stats.all.played - a.stats.all.played;
            // });
        },
        totals() {
            const totalStats = {
                regular_season: {
                    wins: 0,
                    losses: 0,
                    played: 0,
                    forfeits: 0,
                    maps: {
                        wins: 0,
                        losses: 0,
                        played: 0
                    }
                },
                playoffs: {
                    wins: 0,
                    losses: 0,
                    played: 0,
                    forfeits: 0,
                    maps: {
                        wins: 0,
                        losses: 0,
                        played: 0
                    }
                },
                others: {
                    wins: 0,
                    losses: 0,
                    played: 0,
                    forfeits: 0,
                    maps: {
                        wins: 0,
                        losses: 0,
                        played: 0
                    }
                },
                all: {
                    wins: 0,
                    losses: 0,
                    played: 0,
                    forfeits: 0,
                    maps: {
                        wins: 0,
                        losses: 0,
                        played: 0
                    }
                }
            };

            this.showedTeams.forEach(team => {
                Object.entries(team.stats).forEach(([statGroup, stats]) => {
                    if (!totalStats[statGroup]) return;
                    totalStats[statGroup].wins += stats.wins;
                    totalStats[statGroup].losses += stats.losses;
                    totalStats[statGroup].played += stats.played;
                    totalStats[statGroup].forfeits += stats.forfeits;

                    totalStats[statGroup].maps.wins += stats.maps.wins;
                    totalStats[statGroup].maps.losses += stats.maps.losses;
                    totalStats[statGroup].maps.played += stats.maps.played;
                });
            });

            Object.entries(totalStats).forEach(([key, statsGroup]) => {
                totalStats[key].winrate = getWinrate(totalStats[key].wins, totalStats[key].played);
                totalStats[key].maps.winrate = getWinrate(totalStats[key].maps.wins, totalStats[key].maps.played);
            });

            return totalStats;
        }
    }
};
</script>

<style scoped>
    th, td {
        padding: 0 .5em;
    }
    .category {
        min-width: 9em;
        text-align: center;
    }
    .num, .winrate, .winrate-text {
        text-align: center;
    }
    tbody .num {
        font-size: 1.5em;
    }
    .num .main {
        padding-top: .125em;
        line-height: 1;
    }
    .no-matches {
        color: rgba(255,255,255,0.2);
    }

    .new-category {
        border-left-width: 3px;
    }
    .totals td {
        border-top-width: 3px;
    }

    .total-category {
        border-left: 2px solid #737f8c;
    }

    .maps-text {
        font-size: 0.6em;
    }

    .logo {
        height: 50px;
        width: 50px;
    }
    .event-name, .team-name {
        line-height: 1;
    }
</style>
