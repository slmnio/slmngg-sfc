<template>
    <div class="bracket-implications bg-dark p-2 d-flex ">
        <div class="bracket-i-b w-100" v-for="imps in bracketImplications" :key="imps.bracket.id">
            <div class="mb-1 text-center"><b><i class="fas fa-sitemap fa-fw mr-2"></i><router-link :to="url('event', match.event, { subPage: 'bracket' })">{{ imps.bracket.name }}</router-link></b></div>
            <div class="bracket-row">
<!--                <div class="bracket-details">{{ imps.bracket.description }}</div>-->
                <BracketImplicationMatch class="flex-grow-1" :imp="imps.win" relation="Winner" :team="matchWinner" :link-to-detailed-match="linkToDetailedMatch"></BracketImplicationMatch>
                <BracketImplicationMatch class="flex-grow-1" :imp="imps.lose" relation="Loser" :team="matchLoser" :link-to-detailed-match="linkToDetailedMatch"></BracketImplicationMatch>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { url } from "@/utils/content-utils";
import BracketImplicationMatch from "@/components/website/dashboard/BracketImplicationMatch.vue";

export default {
    name: "BracketImplications",
    components: { BracketImplicationMatch },
    props: {
        match: Object,
        linkToDetailedMatch: Boolean
    },
    computed: {
        bracketsIncludingMatch() {
            if (!this.match?.brackets?.length) return [];
            return ReactiveArray("brackets", {
                ordered_matches: ReactiveArray("ordered_matches", {
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    })
                })
            })(this.match);
        },
        bracketImplications() {
            return this.bracketsIncludingMatch.map(bracket => {
                try {
                    const { connections } = JSON.parse(bracket.bracket_layout);
                    const thisMatchNumber = bracket.ordered_matches.findIndex(match => match.id === this.match.id);
                    if (thisMatchNumber === -1) return null;

                    const matchConnections = {
                        win: this.getMatchDetails(connections[thisMatchNumber + 1].win, bracket.ordered_matches, connections),
                        lose: this.getMatchDetails(connections[thisMatchNumber + 1].lose, bracket.ordered_matches, connections)
                    };

                    return {
                        bracket,
                        ...matchConnections
                    };
                } catch (e) {
                // console.error(e);
                    return null;
                }
            }).filter(s => s);
        },
        matchWinner() {
            if (!(this.match.first_to && [this.match.score_1, this.match.score_2].some(s => s === this.match.first_to))) return null;
            return this.match.teams[this.match.score_1 === this.match.first_to ? 0 : 1];
        },
        matchLoser() {
            if (!(this.match.first_to && [this.match.score_1, this.match.score_2].some(s => s === this.match.first_to))) return null;
            return this.match.teams[this.match.score_1 === this.match.first_to ? 1 : 0];
        }
    },
    methods: {
        url,
        getMatchDetails(pointedMatch, matches, connections) {
            if (!pointedMatch) return null;
            if (!pointedMatch.includes(".")) {
                if (["eliminated", "champion"].includes(pointedMatch)) {
                    return { special: pointedMatch };
                } else {
                    return { text: pointedMatch };
                }
            }
            const [otherMatchNum, position] = pointedMatch.split(".").map(e => parseInt(e));
            const otherMatch = matches[otherMatchNum - 1];

            if (otherMatch?.teams?.length === 1) {
                return {
                    otherMatch,
                    position,
                    facingTeam: otherMatch.teams[0]
                };
            } else if (otherMatch?.teams?.length === 2) {
                const otherMatchOtherTeams = otherMatch.teams.filter(oTeam => !this.match.teams.some(mTeam => mTeam.code === oTeam.code));

                if (otherMatchOtherTeams.length === 1) {
                    return {
                        otherMatch,
                        position,
                        facingTeam: otherMatchOtherTeams[0]
                    };
                }

                return {
                    text: `Match already has the teams ${otherMatch.teams.map(team => team.name).join(" vs ")}`
                };
            } else {
                const feederMatches = [];
                // lookup to see feeder matches
                Object.entries(connections).forEach(([matchNum, data]) => {
                    if (data.win.includes(".") && parseInt(data.win.split(".")[0]) === otherMatchNum) {
                        feederMatches.push({
                            ...matches[matchNum - 1],
                            feederTake: "Winner"
                        });
                    }
                    if (data.lose.includes(".") && parseInt(data.lose.split(".")[0]) === otherMatchNum) {
                        feederMatches.push({
                            ...matches[matchNum - 1],
                            feederTake: "Loser"
                        });
                    }
                });

                console.log(feederMatches, this.match, feederMatches.filter(match => this.match.id !== match.id).map(match => `${match.feederTake} of ${match.name}`).join(", "));

                const feederMatch = feederMatches.filter(match => this.match.id !== match.id)[0];

                if ((feederMatch.first_to && [feederMatch.score_1, feederMatch.score_2].some(s => s === feederMatch.first_to))) {
                    console.log("feeder match already finished");

                    if (feederMatch.feederTake === "Winner") {
                        const winner = feederMatch.teams[feederMatch.score_1 === feederMatch.first_to ? 0 : 1];
                        return {
                            otherMatch,
                            facingTeam: winner
                        };
                    } else if (feederMatch.feederTake === "Loser") {
                        const loser = feederMatch.teams[feederMatch.score_1 === feederMatch.first_to ? 1 : 0];
                        return {
                            otherMatch,
                            facingTeam: loser
                        };
                    }
                }

                return {
                    otherMatch,
                    position,
                    feederMatch
                };
            }
        }
    }
};
</script>

<style scoped>
    .bracket-row {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
    }
    .bracket-details {
        white-space: pre-wrap;
    }
</style>
