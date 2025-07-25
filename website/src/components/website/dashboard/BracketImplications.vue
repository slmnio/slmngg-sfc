<template>
    <div v-if="bracketImplications.length" class="bracket-implications bg-dark p-2 d-flex flex-column">
        <div v-for="imps in bracketImplications" :key="imps.bracket.id" class="bracket-i-b w-100">
            <div class="mb-1 text-center"><b><i class="fas fa-sitemap fa-fw mr-2"></i><router-link :to="url('event', match.event, { subPage: 'bracket' })">{{ imps.bracket.name }}</router-link></b></div>
            <div class="bracket-row">
                <!--                <div class="bracket-details">{{ imps.bracket.description }}</div>-->
                <BracketImplicationMatch
                    class="flex-grow-1"
                    :imp="imps.win"
                    :rank="imps?.winnerRank"
                    relation="Winner"
                    :team="matchWinner"
                    :link-to-detailed-match="linkToDetailedMatch" />
                <BracketImplicationMatch
                    class="flex-grow-1"
                    :imp="imps.lose"
                    :rank="imps?.loserRank"
                    relation="Loser"
                    :team="matchLoser"
                    :link-to-detailed-match="linkToDetailedMatch" />
                <div v-if="showResolveButton" class="button-holder">
                    <BracketResolveButton :show-button="showResolveButton" :bracket="imps.bracket" vertical-button />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { url } from "@/utils/content-utils";
import BracketImplicationMatch from "@/components/website/dashboard/BracketImplicationMatch.vue";
import BracketResolveButton from "@/components/website/bracket/BracketResolveButton.vue";

export default {
    name: "BracketImplications",
    components: { BracketResolveButton, BracketImplicationMatch },
    props: {
        match: Object,
        linkToDetailedMatch: Boolean,
        showResolveButton: Boolean
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
            return this.bracketsIncludingMatch.filter(bracket => !bracket.hide_implications).map(bracket => {
                if (!bracket?.bracket_layout) return null;
                try {
                    const { connections } = (JSON.parse(bracket.bracket_layout));
                    const thisMatchNumber = bracket.ordered_matches.findIndex(match => match.id === this.match.id);
                    console.log("bracket imp", connections, thisMatchNumber);

                    if (thisMatchNumber === -1 || !connections) return null;

                    const matchConnections = {
                        win: this.getMatchDetails(connections[thisMatchNumber + 1].win, bracket.ordered_matches, connections),
                        winnerRank: connections[thisMatchNumber + 1].winnerRank,
                        lose: this.getMatchDetails(connections[thisMatchNumber + 1].lose, bracket.ordered_matches, connections),
                        loserRank: connections[thisMatchNumber + 1].loserRank,
                    };

                    console.log("bracket imp", thisMatchNumber, matchConnections);

                    return {
                        bracket,
                        ...matchConnections
                    };
                } catch (e) {
                    console.error(e);
                    return null;
                }
            }).filter(Boolean);
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
            const otherMatchOtherTeams = (otherMatch.teams || []).filter(oTeam => !(this.match.teams || []).some(mTeam => mTeam.code === oTeam.code));

            if (otherMatchOtherTeams?.length === 1) {
                return {
                    otherMatch,
                    position,
                    facingTeam: otherMatchOtherTeams[0]
                };
            } else if (otherMatchOtherTeams?.length === 2) {
                return {
                    text: `Match already has the teams ${otherMatch.teams.map(team => team.name).join(" vs ")}`
                };
            } else {
                const feederMatches = [];
                // lookup to see feeder matches
                Object.entries(connections).forEach(([matchNum, data]) => {
                    if (!matchNum || matchNum === "null") return;
                    if (data.win?.includes(".") && parseInt(data.win?.split(".")[0]) === otherMatchNum) {
                        feederMatches.push({
                            ...matches[matchNum - 1],
                            feederTake: "Winner"
                        });
                    }
                    if (data.lose?.includes(".") && parseInt(data.lose?.split(".")[0]) === otherMatchNum) {
                        feederMatches.push({
                            ...matches[matchNum - 1],
                            feederTake: "Loser"
                        });
                    }
                });

                console.log(feederMatches, this.match, feederMatches.filter(match => this.match.id !== match.id).map(match => `${match.feederTake} of ${match.name}`).join(", "));

                const feederMatch = feederMatches.filter(match => this.match.id !== match.id)[0];

                if ((feederMatch?.first_to && [feederMatch?.score_1, feederMatch?.score_2].some(s => s === feederMatch?.first_to))) {
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
    .bracket-implications .bracket-i-b + .bracket-i-b {
        margin-top: 1em;
        padding-top: .75em;
        border-top: 1px solid rgba(255,255,255,0.05)
    }
</style>
