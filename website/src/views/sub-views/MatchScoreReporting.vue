<template>
    <div class="match-score-reporting">
        <h2 class="text-center">Score Reporting</h2>

        <div v-if="scoreReportingEnabled" class="flex-center flex-column gap-4">
            <div class="score-reporting-status d-flex flex-column gap-3">
                <div v-for="step in steps" :key="step.number" class="step d-flex flex-center gap-3" :class="`status-${step.status}`">
                    <div class="step-num fw-bold">{{ step.number }}</div>
                    <div class="step-content flex-grow-1">
                        <div class="step-title fw-bold">{{ step.title }}</div>
                        <div class="step-description">{{ step.description }}</div>
                    </div>
                    <div class="step-icon-holder flex-center">
                        <div class="step-icon">
                            <i :class="`fa-fw ${step.icon}`"></i>
                        </div>
                    </div>
                </div>
            </div>


            <div v-if="currentStep?.key === 'report' && authStatus?.team" class="step-action">
                <MatchEditor :match="match" :score-reporting="true" :hide-match-extras="true" />
            </div>
            <div v-else-if="currentStep?.key === 'opponentApprove'" class="step-action">
                <div v-if="isOpponent" class="d-flex flex-column gap-2">
                    <div class="p-2 bg-dark text-center rounded">
                        Approve or deny {{ existingScoreReport?.team?.name ? existingScoreReport.team.name + "'s" : "your opponent's" }} score report.
                    </div>

                    <MatchExplainerList class="bg-light text-dark-low p-3 rounded" :edited-map-data="existingReportData" :match="match" />

                    <div class="flex-center">
                        <b-button-group>
                            <b-button :disabled="processing.approval" variant="success" @click="approveReport('approve')"><i class="fas fa-fw fa-check mr-1"></i> Approve</b-button>
                            <b-button :disabled="processing.approval" variant="danger" @click="approveReport('deny')"><i class="fas fa-fw fa-times mr-1"></i> Deny</b-button>
                        </b-button-group>
                    </div>
                </div>
                <div v-else class="p-2 bg-dark text-center rounded">
                    Waiting for opponent approval
                </div>
            </div>
            <div v-else-if="currentStep?.key === 'staffApprove' && (authStatus?.staff || authStatus?.team)" class="step-action">
                <div v-if="authStatus?.staff">
                    Staff - approve !
                </div>
                <div v-else>
                    Team - wait for staff approval
                </div>
            </div>
            <div v-else-if="matchComplete && existingScoreReport" class="p-2 bg-success text-center rounded">
                This match's score has been approved
            </div>
            <div v-else-if="matchComplete" class="p-2 bg-dark text-center rounded">
                This match is complete.
            </div>
            <div v-else-if="authStatus?.staff" class="p-2 bg-dark text-center rounded">
                <div class="mb-2">You can't submit a score report, but you can edit the match directly</div>
                <router-link class="btn btn-primary text-white" :to="url('match', match, { subPage: 'editor' })">Match editor</router-link>
            </div>
            <div v-else class="p-2 bg-dark text-center rounded">
                You don't have access to report scores for this match
            </div>

            <pre v-if="existingScoreReport?.log">{{ existingScoreReport.log }}</pre>
        </div>
        <div v-else class="p-2 bg-dark text-center rounded">
            Team score reporting is not enabled
        </div>
    </div>
</template>

<script>

import MatchEditor from "@/components/website/dashboard/MatchEditor.vue";
import { useAuthStore } from "@/stores/authStore";
import { canEditMatch } from "@/utils/client-action-permissions";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { cleanID, url } from "@/utils/content-utils";
import MatchExplainerList from "@/components/website/dashboard/MatchExplainerList.vue";
import { authenticatedRequest } from "@/utils/dashboard.ts";

/**
 * @typedef {object} Report
 * @property {AnyAirtableID} id
 * @property {string} type
 * @property {DirtyAirtableID[]} player
 * @property {DirtyAirtableID[]} team
 * @property {string} data
 * @property {string} log
 * @property {string} message_data
 * @property {boolean} approved_by_team
 * @property {boolean} approved_by_opponent
 * @property {boolean} approved_by_staff
 * */

export default {
    name: "MatchScoreReporting",
    components: { MatchExplainerList, MatchEditor },
    props: ["match"],
    data: () => ({
        processing: {}
    }),
    computed: {
        eventSettings() {
            if (!this.match?.event?.blocks) return null;
            return JSON.parse(this.match.event.blocks);
        },
        matchComplete() {
            if (!this.match?.first_to) return false;
            return this.match.maps?.length || [this.match?.score_1 || 0, this.match?.score_2 || 0].some(x => x === this.match?.first_to);
        },
        scoreReportingEnabled() {
            return this.eventSettings?.reporting?.score?.use;
        },
        /** @returns {Report | null} */
        existingScoreReport() {
            return (ReactiveRoot(this.match?.id, {
                "reports": ReactiveArray("reports", {
                    "team": ReactiveThing("team"),
                    "player": ReactiveThing("player")
                })
            })?.reports || []).find(report => report.type === "Scores" && cleanID(report.match?.[0]) === cleanID(this.match?.id));
        },
        existingReportData() {
            if (!this.existingScoreReport?.data) return null;
            try {
                return JSON.parse(this.existingScoreReport.data);
            } catch (e) {
                console.error(e);
                return null;
            }
        },
        teams() {
            return (ReactiveRoot(this.match?.id, {
                "teams": ReactiveArray("teams", {
                    "players": ReactiveArray("players"),
                    "captains": ReactiveArray("captains"),
                    "team_staff": ReactiveArray("team_staff"),
                    "owners": ReactiveArray("owners")
                })
            }))?.teams || [];
        },
        isOpponent() {
            // find controllable teams that is not the one that reported this
            if (!this.existingScoreReport?.team?.id) return false;
            return this.controllableTeams.some(t => cleanID(t.id) !== cleanID(this.existingScoreReport?.team?.id));
        },
        controllableTeams() {
            const { isAuthenticated, player } = useAuthStore();
            if (!isAuthenticated) return [];

            return (this.teams || []).filter(team => [
                ...team.players || [],
                ...team.captains || [],
                ...team.team_staff || [],
                ...team.owners || [],
            ].some(person => cleanID(player?.id) === cleanID(person?.id)));
        },
        authStatus() {
            const { isAuthenticated, player } = useAuthStore();
            if (!isAuthenticated) return false;

            let status = {};

            if (this.controllableTeams?.length) status.team = true;

            const editorPerm = canEditMatch(player, { event: this.match?.event, match: this.match });
            if (editorPerm) status.staff = true;
            return status;
        },
        steps() {
            const steps = [
                {
                    key: "report",
                    number: 1,
                    title: "Score report",
                    description: "Team submits the maps and scores of the match",
                    status: "inactive",
                    icon: "fas fa-clipboard-list"
                },
            ];

            if (this.existingScoreReport?.approved_by_team) {
                steps[0].status = "complete";
                steps[0].icon = "fas fa-check";
            }

            if (this.eventSettings?.reporting?.score?.opponentApprove) {
                const newStep = {
                    key: "opponentApprove",
                    number: 2,
                    title: "Opponent approval",
                    description: "Opposing team approves the report",
                    status: "inactive",
                    icon: "fas fa-clipboard-list-check"
                };

                if (this.existingScoreReport?.approved_by_opponent) {
                    newStep.status = "complete";
                    newStep.icon = "fas fa-check";
                }
                steps.push(newStep);
            } else {
                steps.push({
                    key: "opponentApprove",
                    number: 2,
                    title: "Opponent approval",
                    description: "Opponent approvals not needed on this match",
                    status: "disabled",
                    icon: "fas fa-check"
                });
            }

            if (this.eventSettings?.reporting?.score?.staffApprove) {
                const newStep = {
                    key: "staffApprove",
                    number: 3,
                    title: "Staff approval",
                    description: "Staff member approves the report",
                    status: "inactive",
                    icon: "fas fa-clipboard-check"
                };

                if (this.existingScoreReport?.approved_by_staff) {
                    newStep.status = "complete";
                    newStep.icon = "fas fa-check";
                }
                steps.push(newStep);
            } else {
                steps.push({
                    key: "staffApprove",
                    number: 3,
                    title: "Staff approval",
                    description: "Staff approvals not needed on this match",
                    status: "disabled",
                    icon: "fas fa-check"
                });
            }

            let firstAvailable = steps.findIndex(s => s.status === "inactive");
            if (firstAvailable !== -1) {
                steps[firstAvailable].status = "active";
            }

            return steps;
        },
        currentStep() {
            return (this.steps || []).find(s => s.status === "active");
        }
    },
    methods: {
        url,
        async approveReport(reaction) {
            this.processing.approval = true;
            try {
                const response = await authenticatedRequest("actions/approve-score-report", {
                    matchID: this.match.id,
                    reaction
                });

                if (!response.error) {
                    this.$notyf.success("Score report complete");
                }

            } finally {
                this.processing.approval = false;
            }
        },
    },
};
</script>

<style scoped>
    .score-reporting-status {
        max-width: min(500px, 75%)
    }
    .step-num {
        font-size: 1.5em;
        width: .75em;
        text-align: center;
    }
    .step-icon {
        font-size: 2em;
    }
    .step-icon-holder {
        background-color: rgba(255,255,255,0.1);
        width:  4em;
        height: 4em;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .step.status-active .step-icon-holder {
        background-color: var(--primary);
    }
    .step.status-complete .step-icon-holder {
        background-color: var(--green);
    }
    .step.status-disabled {
        opacity: 0.5;
    }

    .step .step-icon i[class*="clipboard"] {
        /* optically aligning clipboards */
        transform: translateY(-0.1em)
    }
</style>
