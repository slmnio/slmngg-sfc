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


            <div v-if="existingScoreReport?.approved" class="p-2 bg-success text-center rounded">
                This match's score has been approved
            </div>
            <div v-else-if="currentStep?.key === 'report' && authStatus?.team" class="step-action">
                <div class="p-2 bg-primary text-center rounded">
                    Submit score report
                </div>
                <MatchEditor :match="match" :score-reporting="true" :hide-match-extras="true" score-report-action="submit" />
            </div>
            <div v-else-if="currentStep?.key === 'opponentApprove' && denyEditor" class="step-action">
                <div class="d-flex gap-2">
                    <div class="p-2 bg-primary text-center rounded flex-grow-1">
                        Denying score report: Submit your own score report
                    </div>
                    <b-button variant="danger" @click="denyEditor = false">
                        <i class="fas fa-fw fa-times"></i> Cancel
                    </b-button>
                </div>
                <MatchEditor
                    :match="match"
                    :score-reporting="true"
                    :hide-match-extras="true"
                    score-report-action="counter"
                    :proposed-data="existingReportData" />
            </div>
            <div v-else-if="currentStep?.key === 'opponentApprove'" class="step-action">
                <div v-if="isOpponent" class="d-flex flex-column gap-2">
                    <div class="p-2 bg-primary text-center rounded">
                        Approve or deny {{ existingScoreReport?.team?.name ? existingScoreReport.team.name + "'s" : "your opponent's" }} score report.
                    </div>

                    <MatchExplainerList class="bg-light text-dark-low p-3 rounded" :edited-map-data="existingReportData?.mapData" :edited-match-data="existingReportData?.matchData" :match="match" />

                    <div class="flex-center">
                        <b-button-group>
                            <b-button :disabled="processing.approval" variant="success" @click="approveReport('approve')"><i class="fas fa-fw fa-check mr-1"></i> Approve</b-button>
                            <b-button :disabled="processing.approval" variant="danger" @click="denyEditor = true"><i class="fas fa-fw fa-times mr-1"></i> Deny</b-button>
                        </b-button-group>
                    </div>
                </div>
                <div v-else-if="authStatus?.staff && !existingScoreReport?.approved_by_staff" class="d-flex flex-column gap-2">
                    <div class="p-2 bg-primary text-center rounded">
                        Pre-approve or deny {{ existingScoreReport.team.name }}'s score report.
                    </div>

                    <MatchExplainerList class="bg-light text-dark-low p-3 rounded" :edited-map-data="existingReportData?.mapData" :edited-match-data="existingReportData?.matchData" :match="match" />

                    <div class="flex-center">
                        <b-button-group>
                            <b-button v-b-tooltip="'Approve without waiting for opponent approval'" :disabled="processing.approval" variant="primary" @click="staffApproveReport('force-approve')"><i class="fas fa-fw fa-shield-check mr-1"></i> Force approve</b-button>
                            <b-button v-b-tooltip="'Auto approve this report once the opponent approves'" :disabled="processing.approval" variant="success" @click="staffApproveReport('pre-approve')"><i class="fas fa-fw fa-check mr-1"></i> Pre-approve</b-button>
                            <b-button :disabled="processing.approval" variant="danger" @click="staffApproveReport('delete')"><i class="fas fa-fw fa-trash mr-1"></i> Deny & delete</b-button>
                        </b-button-group>
                    </div>
                </div>
                <div v-else class="p-2 bg-dark text-center rounded">
                    Waiting for opponent approval
                </div>
            </div>
            <div v-else-if="currentStep?.key === 'staffApprove' && (authStatus?.staff || authStatus?.team)" class="step-action">
                <div v-if="authStatus?.staff" class="d-flex flex-column gap-2">
                    <div class="p-2 bg-primary text-center rounded">
                        Approve or deny {{ existingScoreReport.team.name }}'s score report.
                    </div>

                    <MatchExplainerList class="bg-light text-dark-low p-3 rounded" :edited-map-data="existingReportData?.mapData" :edited-match-data="existingReportData?.matchData" :match="match" />

                    <div class="flex-center">
                        <b-button-group>
                            <b-button :disabled="processing.approval" variant="success" @click="staffApproveReport('approve')"><i class="fas fa-fw fa-check mr-1"></i> Approve</b-button>
                            <b-button :disabled="processing.approval" variant="danger" @click="staffApproveReport('delete')"><i class="fas fa-fw fa-trash mr-1"></i> Deny & delete</b-button>
                        </b-button-group>
                    </div>
                </div>
                <div v-else>
                    Team - wait for staff approval
                </div>
            </div>
            <div v-else-if="(matchComplete) || existingScoreReport?.approved" class="p-2 bg-success text-center rounded">
                This match's score has been approved
            </div>
            <div v-else-if="currentStep?.key === 'counterReportApprove' && authStatus?.team">
                <div v-if="isOpponent" class="d-flex flex-column gap-2">
                    Counter approval submitted - wait for opponent approval.
                </div>
                <div v-else class="d-flex flex-column gap-2">
                    <div class="p-2 bg-primary text-center rounded">
                        Approve or deny counter score report.
                    </div>

                    <MatchExplainerList class="bg-light text-dark-low p-3 rounded" :edited-map-data="existingReportCounterData?.mapData" :edited-match-data="existingReportCounterData?.matchData" :match="match" />

                    <div class="flex-center">
                        <b-button-group>
                            <b-button :disabled="processing.approval" variant="success" @click="approveReport('counter-approve')"><i class="fas fa-fw fa-check mr-1"></i> Approve</b-button>
                            <b-button :disabled="processing.approval" variant="danger" @click="approveReport('counter-deny')"><i class="fas fa-fw fa-times mr-1"></i> Deny</b-button>
                        </b-button-group>
                    </div>
                </div>
            </div>
            <div v-else-if="currentStep?.key === 'counterReportApprove' && authStatus?.staff" class="d-flex flex-column gap-2">
                <div class="lists d-flex gap-2">
                    <div class="d-flex flex-column gap-2">
                        <div class="text-center fw-bold">Original report</div>
                        <MatchExplainerList
                            class="bg-light text-dark-low p-3 rounded"
                            :edited-map-data="existingReportData?.mapData"
                            :edited-match-data="existingReportCounterData?.matchData"
                            :match="match" />
                    </div>
                    <div class="d-flex flex-column gap-2">
                        <div class="text-center fw-bold">Countered report</div>
                        <MatchExplainerList
                            class="bg-light text-dark-low p-3 rounded"
                            :edited-map-data="existingReportCounterData?.mapData"
                            :edited-match-data="existingReportCounterData?.matchData"
                            :match="match" />
                    </div>
                </div>

                <div v-if="existingScoreReport?.approved_by_staff" class="p-2 bg-success text-center rounded">
                    Approved by staff
                </div>
                <div>
                    <div class="flex-center">
                        <b-button-group class="flex-wrap">
                            <b-button
                                v-b-tooltip="'Approve the original report without waiting for opponent approval'"
                                :disabled="processing.approval"
                                variant="primary"
                                @click="staffApproveReport('force-approve')">
                                <i class="fas fa-fw fa-shield-check mr-1"></i> Force approve original
                            </b-button>
                            <b-button
                                v-if="!existingScoreReport?.approved_by_staff"
                                v-b-tooltip="'Auto approve this report once both teams agree'"
                                :disabled="processing.approval"
                                variant="success"
                                @click="staffApproveReport('pre-approve')">
                                <i class="fas fa-fw fa-check mr-1"></i> Pre-approve
                            </b-button>
                            <b-button
                                :disabled="processing.approval"
                                variant="danger"
                                @click="staffApproveReport('delete')">
                                <i class="fas fa-fw fa-trash mr-1"></i> Deny
                                & delete
                            </b-button>
                            <b-button
                                v-b-tooltip="'Approve the countered report without waiting for opponent approval'"
                                :disabled="processing.approval"
                                variant="primary"
                                @click="staffApproveReport('force-counter-approve')">
                                <i class="fas fa-fw fa-shield-check mr-1"></i> Force approve counter
                            </b-button>
                        </b-button-group>
                    </div>
                </div>
            </div>
            <div v-else-if="authStatus?.staff" class="p-2 bg-dark text-center rounded">
                <div class="mb-2">You can't submit a score report, but you can edit the match directly</div>
                <router-link class="btn btn-primary text-white" :to="url('match', match, { subPage: 'editor' })">Match editor</router-link>
            </div>
            <div v-else class="p-2 bg-dark text-center rounded">
                You don't have access to report scores for this match
            </div>

            <pre v-if="existingScoreReport?.log" style="white-space: pre-wrap">{{ existingScoreReport.log }}</pre>
        </div>
        <div v-else class="p-2 bg-dark text-center rounded">
            Team score reporting is not enabled
        </div>
    </div>
</template>

<script>

import MatchEditor from "@/components/website/dashboard/MatchEditor.vue";
import { useAuthStore } from "@/stores/authStore";
import { canEditMatch, isEventStaffOrHasRole } from "@/utils/client-action-permissions";
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
        processing: {},
        denyEditor: false
    }),
    computed: {
        eventSettings() {
            if (!this.match?.event?.blocks) return null;
            return JSON.parse(this.match.event.blocks);
        },
        matchComplete() {
            if (!this.match?.first_to) return false;
            return [this.match?.score_1 || 0, this.match?.score_2 || 0].some(x => x === this.match?.first_to);
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
        existingReportCounterData() {
            if (!this.existingScoreReport?.countered_data) return null;
            try {
                return JSON.parse(this.existingScoreReport.countered_data);
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
        opponentTeam() {
            return this.controllableTeams.find(t => cleanID(t.id) !== cleanID(this.existingScoreReport?.team?.id));
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

            const editorPerm = isEventStaffOrHasRole(player, { event: this.match?.event, websiteRoles: ["Can edit any match", "Can edit any event"] });
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
                if (this.existingScoreReport?.player?.name && this.existingScoreReport?.team?.name) {
                    steps[0].description = `${this.existingScoreReport?.player?.name} reported score for ${this.existingScoreReport?.team?.name}`;
                }
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
                    if (this.opponentTeam?.name) {
                        newStep.description = `${this.opponentTeam.name} approved the report`;
                    }
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

            if (this.existingScoreReport?.countered_by_opponent) {
                steps[steps.length-1].status = "countered";
                steps[steps.length-1].icon = "fas fa-exchange";
                if (this.opponentTeam?.name) {
                    steps[steps.length-1].description = `${this.opponentTeam.name} submitted a counter report`;
                }
                steps.push(
                    {
                        key: "counterReportApprove",
                        number: 3,
                        title: "Counter approval",
                        description: `${this.existingScoreReport?.team?.name || "Original team"} approves counter report`,
                        status: "inactive",
                        icon: "fas fa-clipboard-list"
                    }
                );

            }

            if (this.eventSettings?.reporting?.score?.staffApprove) {
                const newStep = {
                    key: "staffApprove",
                    number: steps.length + 1,
                    title: "Staff approval",
                    description: "Staff member approves the report",
                    status: "inactive",
                    icon: "fas fa-clipboard-check"
                };

                if (this.existingScoreReport?.force_approved) {
                    newStep.status = "complete";
                    newStep.icon = "fas fa-shield-check";
                    newStep.description = "Staff member force approved this report";
                } else if (this.existingScoreReport?.approved_by_staff) {
                    newStep.status = "complete";
                    newStep.icon = "fas fa-check";
                }
                steps.push(newStep);
            } else {
                steps.push({
                    key: "staffApprove",
                    number: steps.length + 1,
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
        async staffApproveReport(reaction) {
            this.processing.approval = true;
            try {
                const response = await authenticatedRequest("actions/staff-approve-score-report", {
                    matchID: this.match.id,
                    reaction
                });

                if (!response.error) {
                    this.$notyf.success("Score report complete");
                }

            } finally {
                this.processing.approval = false;
            }
        }
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
    .step.status-countered .step-icon-holder {
        background-color: var(--yellow);
        color: var(--dark);
    }
    .step.status-disabled {
        opacity: 0.5;
    }

    .step .step-icon i[class*="clipboard"] {
        /* optically aligning clipboards */
        transform: translateY(-0.1em)
    }
</style>
