<template>
    <div class="match-score-reporting">
        <div v-if="scoreReportingEnabled" class="flex-center flex-column gap-4 score-reporting-container">
            <ReportStepsTop :steps="steps" title="Score Reporting" />
            <!--            <div class="score-reporting-status d-flex flex-column gap-3">-->
            <!--                <div v-for="step in steps" :key="step.number" class="step d-flex flex-center gap-3" :class="`status-${step.status}`">-->
            <!--                    <div class="step-num fw-bold">{{ step.number }}</div>-->
            <!--                    <div class="step-content flex-grow-1">-->
            <!--                        <div class="step-title fw-bold">{{ step.title }}</div>-->
            <!--                        <div class="step-description">{{ step.description }}</div>-->
            <!--                    </div>-->
            <!--                    <div class="step-icon-holder flex-center">-->
            <!--                        <div class="step-icon">-->
            <!--                            <i :class="`fa-fw ${step.icon}`"></i>-->
            <!--                        </div>-->
            <!--                    </div>-->
            <!--                </div>-->
            <!--            </div>-->


            <div v-if="existingScoreReport?.approved" class="text-center rounded action-container flex-column bg-dark">
                <div class="action-title h5 mb-0 fw-bold bg-success d-flex align-items-center">
                    <i class="fas fa-check-circle fa-fw mr-1"></i>Score report approved
                </div>
                <div class="action-content text-left">
                    <ReportLog v-if="existingScoreReport?.log" :log="existingScoreReport.log" />
                </div>
            </div>
            <div v-else-if="currentAction" class="step-action action-container text-left opacity-changes" :class="{'low-opacity': processing}">
                <div v-if="currentAction?.title?.text" class="action-title" :class="`bg-${currentAction?.title?.variant || 'dark'} fw-bold h5 mb-0`">
                    {{ currentAction?.title?.text }}
                    <transition name="fade">
                        <div v-if="processing" key="spinner" class="title-spinner flex-center">
                            <div>Working</div>
                            <i class="fas fa-cog fa-spin fa-fw ml-1"></i>
                        </div>
                    </transition>
                </div>
                <div v-if="(currentAction?.content || [])?.length" class="action-content bg-dark gap-2">
                    <div v-if="!denyEditor && ['match-editor'].some(text => (currentAction?.content || [])?.includes(text))" class="editor-holder d-flex gap-2 flex-center">
                        <MatchEditor
                            ref="main-editor"
                            :ignore-remote-updates="true"
                            :match="match"
                            :score-reporting="true"
                            :hide-match-extras="true"
                            score-report-action="submit"
                            :lock-controls="true"
                            :show-hero-picks="eventSettings?.reporting?.score?.showHeroPicks"
                            :show-hero-bans="eventSettings?.reporting?.score?.showHeroBans"
                            :show-map-bans="eventSettings?.reporting?.score?.showMapBans"
                            :show-score-report-forfeit="eventSettings?.reporting?.score?.allowForfeits"
                        />
                    </div>
                    <div v-if="!denyEditor && ['proposed-report', 'proposed-counter-report'].some(text => (currentAction?.content || [])?.includes(text))" class="editor-holder d-flex gap-2 flex-center align-items-start w-100">
                        <div v-if="(currentAction?.content || [])?.includes('proposed-report')" class="match-explainer">
                            <div v-if="(currentAction?.content || [])?.includes('proposed-counter-report')" class="match-explainer-title p-1 w-100 text-center fw-bold">Original report</div>
                            <MatchExplainerList
                                class="bg-light text-dark-low p-3 rounded"
                                :edited-map-data="existingReportData?.mapData"
                                :edited-match-data="existingReportData?.matchData"
                                :match="match" />
                        </div>
                        <div v-if="(currentAction?.content || [])?.includes('proposed-counter-report')" class="match-explainer">
                            <div class="match-explainer-title p-1 w-100 text-center fw-bold">Counter report</div>
                            <MatchExplainerList
                                class="bg-light text-dark-low p-3 rounded"
                                :edited-map-data="existingReportCounterData?.mapData"
                                :edited-match-data="existingReportCounterData?.matchData"
                                :comparison-data="existingReportData"
                                :match="match" />
                        </div>
                    </div>
                    <div v-if="denyEditor && ['deny-editor'].some(text => (currentAction?.content || [])?.includes(text))" class="editor-holder d-flex gap-2 flex-center flex-column">
                        <MatchEditor
                            ref="deny-editor"
                            :match="match"
                            :ignore-remote-updates="true"
                            :score-reporting="true"
                            :hide-match-extras="true"
                            score-report-action="counter"
                            :proposed-data="existingReportData"
                            :lock-controls="true"
                            :show-hero-picks="eventSettings?.reporting?.score?.showHeroPicks"
                            :show-hero-bans="eventSettings?.reporting?.score?.showHeroBans"
                            :show-map-bans="eventSettings?.reporting?.score?.showMapBans"
                            :show-score-report-forfeit="eventSettings?.reporting?.score?.allowForfeits"
                        />
                    </div>


                    <div v-if="(currentAction?.content || [])?.includes('staff editor link')" class="d-flex flex-column align-items-start gap-1 mb-1">
                        <div>You can't submit a score report, but you can edit the match directly:</div>
                        <router-link class="btn btn-primary text-white" :to="url('match', match, { subPage: 'editor' })">Match editor</router-link>
                    </div>
                    <div v-if="(currentAction?.content || [])?.includes('log')">
                        <div class="mb-1 fw-bold">Request log</div>
                        <ReportLog v-if="existingScoreReport?.log" :log="existingScoreReport.log" />
                    </div>
                </div>
                <div v-if="currentAction?.footer?.length" class="action-footer action-footer-footers bg-dark flex-column gap-2">
                    <div v-for="footer in currentAction.footer" :key="footer.heading" class="footer-item">
                        <i v-if="footer.icon" class="fa-fw mr-1" :class="footer.icon"></i>
                        <b v-if="footer.heading">{{ footer.heading }}</b>
                        <br v-if="footer.heading && footer.description">
                        <small v-if="footer.description">{{ footer.description }}</small>
                    </div>
                </div>
                <div v-if="currentAction?.buttons?.length" class="action-footer action-footer-buttons bg-dark flex-column gap-2">
                    <div>
                        <b-button-group v-if="currentAction?.buttons?.length">
                            <b-button
                                v-for="button in currentAction.buttons"
                                :key="button.reaction"
                                v-b-tooltip
                                :variant="button.style?.variant"
                                :disabled="(button.disabled !== undefined ? button.disabled : null) || processing"
                                :title="button.tooltip"
                                class="opacity-changes"
                                @click="button.click ? button.click(button) : actionButtonPress(button)">
                                <i v-if="button.style?.icon" class="fa-fw mr-1" :class="button.style.icon"></i> {{ button.style?.text }}
                            </b-button>
                        </b-button-group>
                    </div>
                </div>
            </div>
            <!--            <div v-else-if="currentStep?.key === 'report' && authStatus?.team" class="step-action action-container">-->
            <!--                <div class="action-title bg-primary fw-bold h5 mb-0">-->
            <!--                    Submit score report-->
            <!--                    <transition name="fade">-->
            <!--                        <div v-if="processing" key="spinner" class="title-spinner flex-center">-->
            <!--                            <div>Working</div>-->
            <!--                            <i class="fas fa-cog fa-spin fa-fw ml-1"></i>-->
            <!--                        </div>-->
            <!--                    </transition>-->
            <!--                </div>-->
            <!--            </div>-->
            <!--            <div v-else-if="currentStep?.key === 'opponentApprove' && denyEditor" class="step-action">-->
            <!--                <div class="d-flex gap-2">-->
            <!--                    <div class="p-2 bg-primary text-center rounded flex-grow-1">-->
            <!--                        Denying score report: Submit your own score report-->
            <!--                    </div>-->
            <!--                    <b-button variant="danger" @click="denyEditor = false">-->
            <!--                        <i class="fas fa-fw fa-times"></i> Cancel-->
            <!--                    </b-button>-->
            <!--                </div>-->
            <!--            </div>-->
            <!--            <div v-else-if="currentStep?.key === 'opponentApprove'" class="step-action action-container">-->
            <!--                <div v-if="isOpponent" class="d-flex flex-column gap-2">-->
            <!--                    <div class="p-2 bg-primary text-center rounded">-->
            <!--                        Approve or deny {{ existingScoreReport?.team?.name ? existingScoreReport.team.name + "'s" : "your opponent's" }} score report.-->
            <!--                    </div>-->

            <!--                    <MatchExplainerList class="bg-light text-dark-low p-3 rounded" :edited-map-data="existingReportData?.mapData" :edited-match-data="existingReportData?.matchData" :match="match" />-->

            <!--                    <div class="flex-center">-->
            <!--                        <b-button-group>-->
            <!--                            <b-button :disabled="processing" variant="success" @click="approveReport('approve')"><i class="fas fa-fw fa-check mr-1"></i> Approve</b-button>-->
            <!--                            <b-button :disabled="processing" variant="danger" @click="denyEditor = true"><i class="fas fa-fw fa-times mr-1"></i> Deny & counter</b-button>-->
            <!--                        </b-button-group>-->
            <!--                    </div>-->
            <!--                </div>-->
            <!--                <div v-else-if="authStatus?.staff && !existingScoreReport?.approved_by_staff" class="d-flex flex-column gap-2">-->
            <!--                    <div class="p-2 bg-primary text-center rounded">-->
            <!--                        Pre-approve or deny {{ existingScoreReport.team.name }}'s score report.-->
            <!--                    </div>-->

            <!--                    <MatchExplainerList class="bg-light text-dark-low p-3 rounded" :edited-map-data="existingReportData?.mapData" :edited-match-data="existingReportData?.matchData" :match="match" />-->

            <!--                    <div class="flex-center">-->
            <!--                        <b-button-group>-->
            <!--                            <b-button v-b-tooltip="'Approve without waiting for opponent approval'" :disabled="processing" variant="primary" @click="staffApproveReport('force-approve')"><i class="fas fa-fw fa-shield-check mr-1"></i> Force approve</b-button>-->
            <!--                            <b-button v-b-tooltip="'Auto approve this report once the opponent approves'" :disabled="processing" variant="success" @click="staffApproveReport('pre-approve')"><i class="fas fa-fw fa-check mr-1"></i> Pre-approve</b-button>-->
            <!--                            <b-button :disabled="processing" variant="danger" @click="staffApproveReport('delete')"><i class="fas fa-fw fa-trash mr-1"></i> Deny & delete</b-button>-->
            <!--                        </b-button-group>-->
            <!--                    </div>-->
            <!--                </div>-->
            <!--                <div v-else class="action-title bg-dark fw-bold h5 mb-0 border-0">-->
            <!--                    Waiting for opponent approval-->
            <!--                </div>-->
            <!--            </div>-->
            <!--            <div v-else-if="currentStep?.key === 'staffApprove' && (authStatus?.staff || authStatus?.team)" class="step-action">-->
            <!--                <div v-if="authStatus?.staff" class="d-flex flex-column gap-2">-->
            <!--                    <div class="p-2 bg-primary text-center rounded">-->
            <!--                        Approve or deny {{ existingScoreReport.team.name }}'s score report.-->
            <!--                    </div>-->

            <!--                    <MatchExplainerList class="bg-light text-dark-low p-3 rounded" :edited-map-data="existingReportData?.mapData" :edited-match-data="existingReportData?.matchData" :match="match" />-->

            <!--                    <div class="flex-center">-->
            <!--                        <b-button-group>-->
            <!--                            <b-button :disabled="processing" variant="success" @click="staffApproveReport('approve')"><i class="fas fa-fw fa-check mr-1"></i> Approve</b-button>-->
            <!--                            <b-button :disabled="processing" variant="danger" @click="staffApproveReport('delete')"><i class="fas fa-fw fa-trash mr-1"></i> Deny & delete</b-button>-->
            <!--                        </b-button-group>-->
            <!--                    </div>-->
            <!--                </div>-->
            <!--                <div v-else>-->
            <!--                    Team - wait for staff approval-->
            <!--                </div>-->
            <!--            </div>-->
            <!--            <div v-else-if="(matchComplete) || existingScoreReport?.approved" class="p-2 bg-success text-center rounded">-->
            <!--                This match's score has been approved-->
            <!--            </div>-->
            <!--            <div v-else-if="currentStep?.key === 'counterReportApprove' && authStatus?.team">-->
            <!--                <div v-if="isOpponent" class="d-flex flex-column gap-2">-->
            <!--                    Counter approval submitted - wait for opponent approval.-->
            <!--                </div>-->
            <!--                <div v-else class="d-flex flex-column gap-2">-->
            <!--                    <div class="p-2 bg-primary text-center rounded">-->
            <!--                        Approve or deny counter score report.-->
            <!--                    </div>-->

            <!--                    <MatchExplainerList class="bg-light text-dark-low p-3 rounded" :edited-map-data="existingReportCounterData?.mapData" :edited-match-data="existingReportCounterData?.matchData" :match="match" />-->

            <!--                    <div class="flex-center">-->
            <!--                        <b-button-group>-->
            <!--                            <b-button :disabled="processing" variant="success" @click="approveReport('counter-approve')"><i class="fas fa-fw fa-check mr-1"></i> Approve</b-button>-->
            <!--                            <b-button :disabled="processing" variant="danger" @click="approveReport('counter-deny')"><i class="fas fa-fw fa-times mr-1"></i> Deny</b-button>-->
            <!--                        </b-button-group>-->
            <!--                    </div>-->
            <!--                </div>-->
            <!--            </div>-->
            <!--            <div v-else-if="currentStep?.key === 'counterReportApprove' && authStatus?.staff" class="d-flex flex-column gap-2">-->
            <!--                <div class="lists d-flex gap-2">-->
            <!--                    <div class="d-flex flex-column gap-2">-->
            <!--                        <div class="text-center fw-bold">Original report</div>-->
            <!--                        <MatchExplainerList-->
            <!--                            class="bg-light text-dark-low p-3 rounded"-->
            <!--                            :edited-map-data="existingReportData?.mapData"-->
            <!--                            :edited-match-data="existingReportCounterData?.matchData"-->
            <!--                            :match="match" />-->
            <!--                    </div>-->
            <!--                    <div class="d-flex flex-column gap-2">-->
            <!--                        <div class="text-center fw-bold">Countered report</div>-->
            <!--                        <MatchExplainerList-->
            <!--                            class="bg-light text-dark-low p-3 rounded"-->
            <!--                            :edited-map-data="existingReportCounterData?.mapData"-->
            <!--                            :edited-match-data="existingReportCounterData?.matchData"-->
            <!--                            :match="match" />-->
            <!--                    </div>-->
            <!--                </div>-->

            <!--                <div v-if="existingScoreReport?.approved_by_staff" class="p-2 bg-success text-center rounded">-->
            <!--                    Approved by staff-->
            <!--                </div>-->
            <!--                <div>-->
            <!--                    <div class="flex-center">-->
            <!--                        <b-button-group class="flex-wrap">-->
            <!--                            <b-button-->
            <!--                                v-b-tooltip="'Approve the original report without waiting for opponent approval'"-->
            <!--                                :disabled="processing"-->
            <!--                                variant="primary"-->
            <!--                                @click="staffApproveReport('force-approve')">-->
            <!--                                <i class="fas fa-fw fa-shield-check mr-1"></i> Force approve original-->
            <!--                            </b-button>-->
            <!--                            <b-button-->
            <!--                                v-if="!existingScoreReport?.approved_by_staff"-->
            <!--                                v-b-tooltip="'Auto approve this report once both teams agree'"-->
            <!--                                :disabled="processing"-->
            <!--                                variant="success"-->
            <!--                                @click="staffApproveReport('pre-approve')">-->
            <!--                                <i class="fas fa-fw fa-check mr-1"></i> Pre-approve-->
            <!--                            </b-button>-->
            <!--                            <b-button-->
            <!--                                :disabled="processing"-->
            <!--                                variant="danger"-->
            <!--                                @click="staffApproveReport('delete')">-->
            <!--                                <i class="fas fa-fw fa-trash mr-1"></i> Deny-->
            <!--                                & delete-->
            <!--                            </b-button>-->
            <!--                            <b-button-->
            <!--                                v-b-tooltip="'Approve the countered report without waiting for opponent approval'"-->
            <!--                                :disabled="processing"-->
            <!--                                variant="primary"-->
            <!--                                @click="staffApproveReport('force-counter-approve')">-->
            <!--                                <i class="fas fa-fw fa-shield-check mr-1"></i> Force approve counter-->
            <!--                            </b-button>-->
            <!--                        </b-button-group>-->
            <!--                    </div>-->
            <!--                </div>-->
            <!--            </div>-->
            <div v-else-if="authStatus?.staff || authStatus?.team" class="text-center rounded action-container flex-column bg-dark">
                <div class="action-title h5 mb-0 fw-bold bg-dark d-flex align-items-center">
                    <i class="fas fa-stopwatch fa-fw mr-1"></i>No action available at this time
                </div>
                <div class="action-content text-left">
                    <ReportLog v-if="existingScoreReport?.log" :log="existingScoreReport.log" />
                </div>
            </div>
            <div v-else class="p-2 bg-dark text-center rounded action-container h5 mb-0 fw-bold">
                <i class="fas fa-ban fa-fw mr-1"></i>You don't have access to report scores for this match
            </div>

            <!--            <pre style="white-space: pre-wrap;width:100%;">currentAction:<br>{{ currentAction || typeof (currentAction) }}</pre>-->
            <!--            <pre style="white-space: pre-wrap;width:100%;">currentStep:<br>{{ currentStep }}</pre>-->

            <!--            <pre v-if="existingScoreReport?.log" style="white-space: pre-wrap">{{ existingScoreReport.log }}</pre>-->
        </div>
        <div v-else class="p-2 bg-dark text-center rounded action-container h5 mb-0 fw-bold">
            <i class="fas fa-ban fa-fw mr-1"></i>Score reporting is not enabled
        </div>
    </div>
</template>

<script>
import { mapWritableState } from "pinia";
import MatchEditor from "@/components/website/dashboard/MatchEditor.vue";
import { useAuthStore } from "@/stores/authStore";
import { isEventStaffOrHasRole } from "@/utils/client-action-permissions";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { cleanID, url } from "@/utils/content-utils";
import MatchExplainerList from "@/components/website/dashboard/MatchExplainerList.vue";
import { authenticatedRequest } from "@/utils/dashboard.ts";
import ReportStepsTop from "@/components/website/ReportStepsTop.vue";
import ReportLog from "@/components/website/ReportLog.vue";
import { useSettingsStore } from "@/stores/settingsStore.ts";

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
    components: { ReportLog, ReportStepsTop, MatchExplainerList, MatchEditor },
    props: ["match"],
    data: () => ({
        processing: false,
    }),
    computed: {
        ...mapWritableState(useSettingsStore, ["denyEditor"]),
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
                    "staff": ReactiveArray("staff"),
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
            return this.teams.find(t => cleanID(t.id) !== cleanID(this.existingScoreReport?.team?.id));
        },
        controllableTeams() {
            const { isAuthenticated, player } = useAuthStore();
            if (!isAuthenticated) return [];

            return (this.teams || []).filter(team => [
                ...team.players || [],
                ...team.captains || [],
                ...team.staff || [],
                ...team.owners || [],
            ].some(person => cleanID(player?.id) === cleanID(person?.id)));
        },
        authStatus() {
            const { isAuthenticated, user } = useAuthStore();
            if (!isAuthenticated) return false;

            let status = {};

            if (this.controllableTeams?.length) status.team = true;

            const editorPerm = isEventStaffOrHasRole(user, { event: this.match?.event, websiteRoles: ["Can edit any match", "Can edit any event"] });
            if (editorPerm) status.staff = true;
            return status;
        },
        currentAction() {
            if (!this.currentStep) return null;
            let action;
            if (this.authStatus?.team && !this.isOpponent) {
                action = this.currentStep?.actions?.submitter;
            } else if (this.authStatus?.team && this.isOpponent) {
                action = this.currentStep?.actions?.opponent;
            }
            if (!action && this.authStatus?.team && this.currentStep?.actions?.teams) {
                action = this.currentStep?.actions?.teams;
            }
            if (!action && this.authStatus?.staff) {
                action = this.currentStep?.actions?.staff;
            }
            return action;
        },
        approvalWarning() {
            const types = {};
            if (this.eventSettings?.reporting?.score?.opponentApprove) {
                types.opponent = true;
            }
            if (this.eventSettings?.reporting?.score?.staffApprove) {
                types.staff = true;
            }
            if (this.existingScoreReport?.approved_by_opponent || this.existingScoreReport?.countered_by_opponent) {
                types.opponent = false;
            }
            if (this.existingScoreReport?.approved_by_staff) {
                types.staff = false;
            }
            return {
                short: types.opponent && types.staff ? "opponent and staff" : (types.opponent ? "opponent" : (types.staff ? "staff" : null)),
                people: types.opponent && types.staff ? "an opponent and a staff member" : (types.opponent ? "an opponent" : (types.staff ? "a staff member" : null)),
                types: Object.entries(types).filter(([key, active]) => active).map(([key]) => key)
            };
        },
        needsNoApproval() {
            return this.eventSettings?.reporting?.rescheduling &&
                !this.eventSettings?.reporting?.rescheduling?.opponentApprove &&
                !this.eventSettings?.reporting?.rescheduling?.staffApprove;
        },
        steps() {
            const warningFooter = this.approvalWarning?.short ? [{
                icon: "fas fa-exclamation-circle",
                heading: `This event requires ${this.approvalWarning.short} approval`,
                description: `The score report will not be confirmed until ${this.approvalWarning.people} ${this.approvalWarning.types.length === 1 ? "has" : "have"} approved the request.`
            }] : (this.needsNoApproval ? [{
                icon: "fas fa-check",
                heading: "This event does not require any approval for score reporting",
            }] : []);

            const steps = [
                {
                    key: "report",
                    number: 1,
                    title: "Score report",
                    description: "Team submits the maps and scores of the match",
                    status: "inactive",
                    icon: "fas fa-clipboard-list",
                    actions: {
                        submitter: {
                            title: {
                                text: "Submit a score report",
                                variant: "primary"
                            },
                            content: ["match-editor"],
                            footer: warningFooter,
                            buttons: [
                                { click: () => { this.$refs["main-editor"].scoreReportConfirmModal = true; }, style: { variant: "success", icon: "fas fa-cloud-upload", text: "Submit report" } },
                            ]
                        },
                        staff: {
                            title: {
                                text: "No score reported",
                                variant: "secondary"
                            },
                            content: ["staff editor link"]
                        },
                    }
                },
            ];

            if (this.existingScoreReport?.approved_by_team) {
                steps[0].status = "complete";
                steps[0].icon = "fas fa-check";
                if (this.existingScoreReport?.player?.name && this.existingScoreReport?.team?.name) {
                    steps[0].description = `${this.existingScoreReport?.player?.name} reported score as ${this.existingScoreReport?.team?.name}`;
                }
            }

            if (this.eventSettings?.reporting?.score?.opponentApprove) {
                const newStep = {
                    key: "opponentApprove",
                    number: 2,
                    title: "Opponent approval",
                    description: "Opposing team approves the report",
                    status: "inactive",
                    icon: "fas fa-clipboard-list-check",
                    actions: {
                        submitter: {
                            title: { text: "Score report submitted" },
                            content: ["proposed-report"],
                            footer: [{ heading: "Waiting for an opponent's response", icon: "fas fa-clock" }, ...warningFooter].filter(Boolean)
                        },
                        opponent: {
                            title: { text: this.denyEditor ? "Submit counter score report" : "Approve or deny score report", variant: "primary" },
                            content: ["proposed-report", "deny-editor"],
                            footer: warningFooter,
                            buttons: this.denyEditor ? [
                                { click: () => { this.$refs["deny-editor"].scoreReportConfirmModal = true; }, style: { variant: "success", icon: "fas fa-check", text: "Submit counter report" } },
                                { click: () => { this.denyEditor = false; }, style: { variant: "secondary", icon: "fas fa-times", text: "Cancel counter edit" } }
                            ] : [
                                { disabled: this.denyEditor, reaction: "approve", action: "approve-score-report", style: { variant: "success", icon: "fas fa-check", text: "Approve" } },
                                { click: () => { this.denyEditor = true; }, style: { variant: "danger", icon: "fas fa-times", text: "Deny & counter" } }
                            ]
                        },
                        staff: (this.existingScoreReport?.approved_by_staff && !this.existingScoreReport?.denied_by_staff)
                            ? {
                                title: {
                                    text: "Score report pre-approved",
                                    variant: "success"
                                },
                                content: ["proposed-report", "log"],
                                buttons: [
                                    {
                                        reaction: "force-approve",
                                        action: "staff-approve-score-report",
                                        style: {
                                            variant: "primary",
                                            icon: "fas fa-shield-check",
                                            text: "Force approve"
                                        },
                                        successToast: "Score report force approved"
                                    },
                                    ...this.eventSettings?.reporting?.score?.staffApprove ? [{
                                        reaction: "pre-approve",
                                        action: "staff-approve-score-report",
                                        disabled: true,
                                        successToast: "Score report pre-approved",
                                        style: {
                                            variant: "success",
                                            icon: "fas fa-check",
                                            text: "Pre-approve"
                                        }
                                    }] : [],
                                    {
                                        reaction: "deny",
                                        action: "staff-approve-score-report",
                                        style: {
                                            variant: "danger",
                                            icon: "fas fa-times",
                                            text: "Deny"
                                        },
                                        successToast: "Score report denied"
                                    },
                                    // { reaction: "delete", action: "staff-approve-score-report", style: { variant: "danger", icon: "fas fa-trash", text: "Delete" }, successToast: `Score report deleted` },
                                ],
                                footer: [{ heading: "Waiting for opponent approval", icon: "fas fa-clock" }]
                            }
                            : {
                                title: {
                                    text: this.eventSettings?.reporting?.score?.staffApprove ? "Pre-approve score report" : "Score report waiting for opponent approval",
                                    variant: "primary"
                                },
                                content: ["information", "proposed-report"],
                                buttons: [
                                    {
                                        reaction: "force-approve",
                                        action: "staff-approve-score-report",
                                        style: {
                                            variant: "primary",
                                            icon: "fas fa-shield-check",
                                            text: "Force approve"
                                        },
                                        successToast: "Score report force approved"
                                    },
                                    ...this.eventSettings?.reporting?.score?.staffApprove ? [{
                                        reaction: "pre-approve",
                                        action: "staff-approve-score-report",
                                        successToast: "Score report pre-approved",
                                        style: {
                                            variant: "success",
                                            icon: "fas fa-check",
                                            text: "Pre-approve"
                                        }
                                    }] : [],
                                    {
                                        reaction: "deny",
                                        action: "staff-approve-score-report",
                                        style: {
                                            variant: "danger",
                                            icon: "fas fa-times",
                                            text: "Deny"
                                        },
                                        successToast: "Score report denied & locked"
                                    },
                                ],
                                footer: warningFooter
                            },
                    }
                };

                if (this.existingScoreReport?.approved_by_opponent) {
                    newStep.status = "complete";
                    newStep.icon = "fas fa-check";

                    const completeLogItem = this.logSteps.find(step => step.key === "approved_by_opponent");
                    if (completeLogItem?.user?.name) {
                        newStep.description = `${completeLogItem?.user?.name} approved the report as ${completeLogItem?.team?.name}`;
                    } else if (this.opponentTeam?.name) {
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
                    icon: "fas fa-check",
                    actions: {
                        teams: {
                            title: { text: "Waiting for staff approval" },
                            content: ["proposed-report"],
                            footer: warningFooter
                        },
                        staff: (this.existingScoreReport?.approved_by_staff && !this.existingScoreReport?.denied_by_staff)
                            ? {
                                title: {
                                    text: "Score report pre-approved",
                                    variant: "success"
                                },
                                content: ["proposed-report", "log"],
                                buttons: [
                                    {
                                        reaction: "force-approve",
                                        action: "staff-approve-score-report",
                                        style: {
                                            variant: "primary",
                                            icon: "fas fa-shield-check",
                                            text: "Force approve"
                                        },
                                        successToast: "Score report force approved"
                                    },
                                    ...this.eventSettings?.reporting?.score?.staffApprove ? [{
                                        reaction: "pre-approve",
                                        action: "staff-approve-score-report",
                                        disabled: true,
                                        successToast: "Score report pre-approved",
                                        style: {
                                            variant: "success",
                                            icon: "fas fa-check",
                                            text: "Pre-approve"
                                        }
                                    }] : [],
                                    {
                                        reaction: "deny",
                                        action: "staff-approve-score-report",
                                        style: {
                                            variant: "danger",
                                            icon: "fas fa-times",
                                            text: "Deny"
                                        },
                                        successToast: "Score report denied"
                                    },
                                    // { reaction: "delete", action: "staff-approve-score-report", style: { variant: "danger", icon: "fas fa-trash", text: "Delete" }, successToast: `Score report deleted` },
                                ],
                                footer: [{ heading: "Waiting for opponent approval", icon: "fas fa-clock" }]
                            }
                            : {
                                title: {
                                    text: this.eventSettings?.reporting?.score?.staffApprove ? "Pre-approve score report" : "Score report waiting for opponent approval",
                                    variant: "primary"
                                },
                                content: ["information", "proposed-report"],
                                buttons: [
                                    {
                                        reaction: "force-approve",
                                        action: "staff-approve-score-report",
                                        style: {
                                            variant: "primary",
                                            icon: "fas fa-shield-check",
                                            text: "Force approve"
                                        },
                                        successToast: "Score report force approved"
                                    },
                                    ...this.eventSettings?.reporting?.score?.staffApprove ? [{
                                        reaction: "pre-approve",
                                        action: "staff-approve-score-report",
                                        successToast: "Score report pre-approved",
                                        style: {
                                            variant: "success",
                                            icon: "fas fa-check",
                                            text: "Pre-approve"
                                        }
                                    }] : [],
                                    {
                                        reaction: "deny",
                                        action: "staff-approve-score-report",
                                        style: {
                                            variant: "danger",
                                            icon: "fas fa-times",
                                            text: "Deny"
                                        },
                                        successToast: "Score report denied & locked"
                                    },
                                ],
                                footer: this.eventSettings?.reporting?.score?.staffApprove ?
                                    [{ heading: "This event requires staff approval", icon: "fas fa-exclamation-circle" }] :
                                    [{ heading: "This event does not require staff approval", icon: "fas fa-check" }]
                            },
                    }
                });
            }

            if (this.existingScoreReport?.countered_by_opponent) {
                steps[steps.length-1].status = "countered";
                steps[steps.length-1].icon = "fas fa-exchange";

                const completeLogItem = this.logSteps.find(step => step.key === "countered_score_report");
                if (completeLogItem?.user?.name) {
                    steps[steps.length-1].description = `${completeLogItem?.user?.name} submitted a counter report as ${completeLogItem?.team?.name}`;
                } else if (this.opponentTeam?.name) {
                    steps[steps.length-1].description = `${this.opponentTeam.name} submitted a counter report`;
                } else {
                    steps[steps.length-1].description = "Opponent submitted a counter report";
                }

                steps.push(
                    {
                        key: "counterReportApprove",
                        number: 3,
                        title: "Counter approval",
                        description: `${this.existingScoreReport?.team?.name || "Original team"} approves counter report`,
                        status: "inactive",
                        icon: "fas fa-clipboard-list",
                        actions: {
                            submitter: {
                                title: { text: "Approve or deny counter report", variant: "primary" },
                                content: ["proposed-report", "proposed-counter-report"],
                                footer: [...warningFooter].filter(Boolean),
                                buttons: [
                                    { reaction: "counter-approve", action: "approve-score-report", style: { variant: "success", icon: "fas fa-check", text: "Approve counter" } },
                                    { reaction: "counter-deny", action: "approve-score-report", style: { variant: "danger", icon: "fas fa-times", text: "Deny counter" } }
                                ]
                            },
                            opponent: {
                                title: { text: "Counter report submitted" },
                                content: ["proposed-report", "proposed-counter-report"],
                                footer: [{ heading: "Waiting for an opponent's response", icon: "fas fa-clock" }, ...warningFooter].filter(Boolean)
                            },
                            staff: {
                                content: ["proposed-report", "proposed-counter-report"],
                                buttons: [
                                    { reaction: "force-approve", action: "staff-approve-score-report", style: { variant: "primary", icon: "fas fa-shield-check", text: "Force-approve original" }, tooltip: "Force-approve the original report" },
                                    { reaction: "pre-approve", action: "staff-approve-score-report", style: { variant: "success", icon: "fas fa-check", text: "Pre-approve" }, tooltip: "Auto approve this report once the counter report is approved by both teams" },
                                    { reaction: "deny", action: "staff-approve-score-report", style: { variant: "danger", icon: "fas fa-times", text: "Deny" }, tooltip: "Force deny this report" },
                                    { reaction: "force-counter-approve", action: "staff-approve-score-report", style: { variant: "primary", icon: "fas fa-shield-check", text: "Force-approve counter" }, tooltip: "Force-approve the counter report without waiting for team approval" },
                                ]
                            }
                            // staff: this.existingScoreReport?.approved_by_staff && !this.existingScoreReport?.denied_by_staff ?
                            //     {
                            //         title: { text: "Report pre-approved", variant: "success" },
                            //         content: ["proposed-report", "proposed-counter-report"],
                            //
                            //     } : (this.eventSettings?.reporting?.score?.staffApprove ?
                            //         {
                            //             title: { text: "Pre-approve report", variant: "primary" },
                            //             content: ["proposed-report", "proposed-counter-report"],
                            //
                            //         } : {
                            //             title: { text: "Counter report submitted" },
                            //             content: ["proposed-report", "proposed-counter-report"],
                            //
                            //         })
                        }
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
                    icon: "fas fa-clipboard-check",
                    actions: {
                        teams: {
                            title: { text: "Waiting for staff approval" },
                            content: ["proposed-report"],
                            footer: warningFooter
                        },
                        staff: {
                            title: { text: "Approve or deny score report" },
                            content: ["proposed-report"],
                            footer: warningFooter,
                            buttons: [
                                {
                                    reaction: "approve",
                                    action: "staff-approve-score-report",
                                    style: {
                                        variant: "success",
                                        icon: "fas fa-check",
                                        text: "Approve"
                                    }
                                },
                                {
                                    reaction: "delete",
                                    action: "staff-approve-score-report",
                                    style: {
                                        variant: "danger",
                                        icon: "fas fa-times",
                                        text: "Deny"
                                    }
                                }
                            ]
                        }
                    }
                };


                if (this.existingScoreReport?.approved_by_staff) {
                    newStep.status = "complete";
                    newStep.icon = "fas fa-check";

                    const completeLogItem = this.logSteps.find(step => step.key === "staff_approved");
                    if (completeLogItem?.user?.name) {
                        newStep.description = `${completeLogItem?.user?.name} approved the report as staff`;
                    } else {
                        newStep.description = "Staff member approved the report";
                    }

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

            if (this.existingScoreReport?.force_approved) {
                steps[steps.length - 1].status = "complete";
                steps[steps.length - 1].icon = "fas fa-shield-check";

                const completeLogItem = this.logSteps.find(step => step.key === "staff_force_approved");
                if (completeLogItem?.user?.name) {
                    steps[steps.length - 1].description = `${completeLogItem?.user?.name} force-approved the report as staff`;
                } else  {
                    steps[steps.length - 1].description = "Staff member force-approved the report";
                }
            }

            let firstAvailable = steps.findIndex(s => s.status === "inactive");
            if (firstAvailable !== -1) {
                steps[firstAvailable].status = "active";
            }

            return steps;
        },
        currentStep() {
            return (this.steps || []).find(s => s.status === "active");
        },
        logSteps() {
            if (!this.existingScoreReport?.log?.length) return [];
            return this.existingScoreReport.log.split("\n").map(step => Object.fromEntries(step.split("|").map(pair => pair.split("=")))).map(step => {
                if (step.user) step.user = ReactiveRoot(step.user);
                if (step.team) step.team = ReactiveRoot(step.team);
                if (step.staff) step.staff = true;
                return step;
            });
        }
    },
    methods: {
        url,
        async actionButtonPress(button) {
            this.processing = true;
            try {
                const response = await authenticatedRequest(`actions/${button.action}`, {
                    matchID: this.match.id,
                    reaction: button.reaction
                });

                if (!response.error) {
                    this.$notyf.success(`Success: ${button.successToast || button.style.text.toLowerCase()}`);
                }

            } finally {
                this.processing = false;
                this.proposedTime = null;
            }
        },
        async approveReport(reaction) {
            this.processing = true;
            try {
                const response = await authenticatedRequest("actions/approve-score-report", {
                    matchID: this.match.id,
                    reaction
                });

                if (!response.error) {
                    this.$notyf.success("Score report complete");
                }

            } finally {
                this.processing = false;
            }
        },
        async staffApproveReport(reaction) {
            this.processing = true;
            try {
                const response = await authenticatedRequest("actions/staff-approve-score-report", {
                    matchID: this.match.id,
                    reaction
                });

                if (!response.error) {
                    this.$notyf.success("Score report complete");
                }

            } finally {
                this.processing = false;
            }
        }
    },
};
</script>

<style scoped>
    @import "match-editors.css";

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
    .step-action {
        display: flex;
        flex-direction: column;
        max-width: 100%;
    }

    .score-reporting-container>div:not(.report-steps-top):not(.action-container) {
        outline: 3px solid red;
    }
    .match-explainer {
        flex: 1 0;
    }
</style>
