<template>
    <div class="match-rescheduling">
        <div v-if="reschedulingEnabled && reschedulingAvailable && !matchComplete" class="flex-center flex-column gap-4">
            <ReportStepsTop :steps="steps" :title="`Match ${reschedule.slice(0, -1).toLowerCase()}ing`" />
            <div v-if="currentAction" class="step-action action-container text-left opacity-changes" :class="{'low-opacity': processing}">
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
                    <div v-if="(currentAction?.content || [])?.includes('information')">
                        <div v-if="match.earliest_start && match.latest_start">
                            <b>This match can be scheduled between: </b> <span class="time-text">{{ formatTime(match.earliest_start, { format: '{day-short} {date-ordinal} {month-short} {time}' }) }}</span> and <span class="time-text">{{ formatTime(match.latest_start, { format: '{day-short} {date-ordinal} {month-short} {time} {tz}' }) }}</span>
                        </div>
                        <div v-else-if="match.earliest_start">
                            <b>This match must be scheduled at or after: </b><span class="time-text">{{ formatTime(match.earliest_start) }}</span>
                        </div>
                        <div v-else-if="match.latest_start">
                            <b>This match must be scheduled at or before: </b><span class="time-text">{{ formatTime(match.latest_start) }}</span>
                        </div>

                        <div v-if="match.start"><b>Currently scheduled start:</b> {{ formatTime(match.start) }}</div>
                        <div v-else>This match does not currently have a scheduled start time</div>
                    </div>
                    <div v-if="(currentAction?.content || [])?.includes('match start')" class="border border-success p-2 rounded px-3">
                        <b>Match start time:</b> {{ formatTime(match.start || existingReportData?.start) }}
                    </div>
                    <div v-if="['datetimepicker', 'proposed-report', 'proposed-local'].some(text => (currentAction?.content || [])?.includes(text))" class="time-holder d-flex gap-2 flex-center">
                        <div v-if="(currentAction?.content || [])?.includes('datetime picker')">
                            <AdvancedDateEditor
                                :saved-time="match?.start || match?.earliest_start"
                                :earliest-time="match?.earliest_start"
                                :latest-time="match?.latest_start"
                                @submit="(timeString) => proposedTime = timeString">
                                Choose time
                            </AdvancedDateEditor>
                        </div>
                        <div v-if="(currentAction?.content || [])?.includes('proposed-report') && existingReportData?.start" class="border border-primary p-2 rounded px-3">
                            <b>Proposed time:</b> {{ formatTime(existingReportData?.start) }}
                        </div>
                        <div v-else-if="(currentAction?.content || [])?.includes('proposed-local') && proposedTime" class="border border-primary p-2 rounded px-3">
                            <b>Proposed time:</b> {{ formatTime(proposedTime) }}
                        </div>
                    </div>

                    <div v-if="(currentAction?.content || [])?.includes('staff editor link')" class="d-flex flex-column align-items-start gap-1 mb-1">
                        <div>You can't submit a {{ this.reschedule.toLowerCase() }} request, but you can edit the match time directly:</div>
                        <router-link class="btn btn-primary text-white" :to="url('match', match, { subPage: 'editor' })">Match editor</router-link>
                    </div>
                    <div v-if="(currentAction?.content || [])?.includes('log')">
                        <div class="mb-1 fw-bold">Request log</div>
                        <ReportLog v-if="existingScoreReport?.log" :report="existingScoreReport" :log="existingScoreReport.log" />
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
                                :variant="button.style?.variant"
                                :disabled="(button.disabled !== undefined ? button.disabled : null) || processing"
                                class="opacity-changes"
                                @click="button.click ? button.click(button) : actionButtonPress(button)">
                                <i v-if="button.style?.icon" class="fa-fw mr-1" :class="button.style.icon"></i> {{ button.style?.text }}
                            </b-button>
                        </b-button-group>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="matchComplete" class="text-center rounded action-container flex-column bg-dark">
            <div class="action-title h5 mb-0 border-0 fw-bold bg-dark d-flex align-items-center">
                <i class="fas fa-check fa-fw mr-1"></i>This match is complete
            </div>
            <div v-if="existingScoreReport?.log" class="action-content text-left">
                <ReportLog v-if="existingScoreReport?.log" :report="existingScoreReport" :log="existingScoreReport.log" />
            </div>
            <div v-if="reportHistory?.length" class="action-content text-left">
                <ReportLog v-for="report in reportHistory" :key="report.id" :report="report" :log="report.log" />
            </div>
        </div>
        <div v-else-if="!reschedulingAvailable" class="p-2 bg-dark text-center rounded">
            Match {{ reschedule.slice(0,-1).toLowerCase() }}ing is not set up for this match
        </div>
        <div v-else class="p-2 bg-dark text-center rounded">
            Match {{ reschedule.slice(0,-1).toLowerCase() }}ing is not enabled
        </div>

        <!--
         TODO:
            - Make sure Discord messages cover all events
            - Investigate what should be done for persistent Discord messages (i.e. some denials won't trigger a message to be removed)
            - Lockdown server logic for all events
            - Update sidebar/schedule badge to match logic
         -->

        <!--        <pre class="mt-4 border border-primary p-2 rounded bg-dark"><b>Current action</b><br>{{ currentAction }}</pre>-->
        <!--        <pre>{{ {...authStatus, isOpponent } }}</pre>-->
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";
import { cleanID, formatTime, url } from "@/utils/content-utils.js";
import { useAuthStore } from "@/stores/authStore.ts";
import { isEventStaffOrHasRole } from "@/utils/client-action-permissions.js";
import AdvancedDateEditor from "@/components/website/dashboard/AdvancedDateEditor.vue";
import { authenticatedRequest } from "@/utils/dashboard.ts";
import ReportStepsTop from "@/components/website/ReportStepsTop.vue";
import ReportLog from "@/components/website/ReportLog.vue";

export default {
    name: "MatchRescheduling",
    components: { ReportLog, AdvancedDateEditor, ReportStepsTop },
    props: ["match"],
    data: () => ({
        proposedTime: null,
        processing: false
    }),
    computed: {
        eventSettings() {
            if (!this.match?.event?.blocks) return null;
            return JSON.parse(this.match.event.blocks);
        },
        /** @returns {Report | null} */
        existingScoreReport() {
            return (ReactiveRoot(this.match?.id, {
                "reports": ReactiveArray("reports", {
                    "team": ReactiveThing("team"),
                    "player": ReactiveThing("player")
                })
            })?.reports || []).find(report => report.type === "Rescheduling" && cleanID(report.match?.[0]) === cleanID(this.match?.id));
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
        reportHistory() {
            return (ReactiveRoot(this.match?.id, {
                "report_history": ReactiveArray("report_history", {
                    "team": ReactiveThing("team"),
                    "player": ReactiveThing("player")
                })
            })?.report_history || []).filter(report => report.type === "Rescheduling").reverse();
        },
        matchComplete() {
            if (!this.match?.first_to) return false;
            return [this.match?.score_1 || 0, this.match?.score_2 || 0].some(x => x === this.match?.first_to);
        },
        reschedulingEnabled() {
            return this.eventSettings?.reporting?.rescheduling?.use;
        },
        reschedulingAvailable() {
            return this.match?.earliest_start && this.match?.latest_start;
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
                description: `The match will not be ${this.reschedule.toLowerCase()}d until ${this.approvalWarning.people} ${this.approvalWarning.types.length === 1 ? "has" : "have"} approved the request.`
            }] : (this.needsNoApproval ? [{
                icon: "fas fa-check",
                heading: `This event does not require any approval for ${this.reschedule.toLowerCase().slice(0,-1)}ing`,
            }] : []);


            const steps = [
                {
                    key: "report",
                    number: 1,
                    title: `${this.reschedule} request`,
                    description: `Either team submits a ${this.reschedule.slice(0,-1).toLowerCase()}ing request`,
                    status: "inactive",
                    icon: "fas fa-user-clock",
                    actions: {
                        submitter: {
                            title: { text: (this.needsNoApproval ? `${this.reschedule} this match` : `Submit a ${this.reschedule.toLowerCase()} request`), variant: "primary" },
                            content: ["information", "datetime picker", "proposed-local", "proposed-report"],
                            buttons: [{
                                click: () => this.submitRequest(),
                                disabled: !this.proposedTime || this.processing,
                                style: {
                                    variant: "success",
                                    text: this.needsNoApproval ? "Change time" : "Submit request",
                                    icon: "fas fa-cloud-upload"
                                },
                                successToast: `${this.reschedule} request submitted`
                            }],
                            footer: warningFooter
                        },
                        staff: {
                            title: {
                                text: `No ${this.reschedule.toLowerCase()} request active`,
                                variant: "secondary"
                            },
                            content: ["information", "staff editor link"]
                        },
                    }
                },
            ];

            if (this.needsNoApproval) {
                steps[0].title = `Match ${this.reschedule.toLowerCase()}`;
                steps[0].description = `Either team can ${this.reschedule.toLowerCase()} the match`;
            }

            if (this.existingScoreReport?.approved_by_team) {
                steps[0].status = "complete";
                steps[0].icon = "fas fa-check";

                if (this.existingScoreReport?.player?.name && this.existingScoreReport?.team?.name) {
                    steps[0].description = `${this.existingScoreReport?.player?.name} submitted request for ${this.existingScoreReport?.team?.name}`;
                }
            }

            if (this.eventSettings?.reporting?.rescheduling?.opponentApprove) {
                if (this.existingScoreReport?.denied_by_opponent) {
                    steps.push({
                        key: "opponentApprove",
                        number: 2,
                        title: "Opponent approval",
                        description: `${this.opponentTeam?.name} denied the request`,
                        status: "blocking",
                        icon: "fas fa-user-times",
                        actions: {
                            teams: {
                                title: { text: `${this.reschedule} request denied by opponent`, variant: "danger" },
                                content: ["information", "proposed-report", "log"],
                                buttons: [
                                    {
                                        reaction: "delete",
                                        action: "approve-match-reschedule",
                                        style: {
                                            variant: "primary",
                                            icon: "fas fa-redo",
                                            text: "Start new request"
                                        },
                                        successToast: "Match cleared and ready for a new request"
                                    },
                                ]
                            },
                            staff: {
                                title: { text: `${this.reschedule} request denied by opponent`, variant: "danger" },
                                content: ["information", "proposed-report", "log"],
                                buttons: [
                                    {
                                        reaction: "delete",
                                        action: "staff-approve-match-reschedule",
                                        style: {
                                            variant: "primary",
                                            icon: "fas fa-redo",
                                            text: "Start new request"
                                        },
                                        successToast: "Match cleared and ready for a new request"
                                    },
                                ]
                            },
                        }
                    });
                } else {
                    // normal
                    const newStep = {
                        key: "opponentApprove",
                        number: 2,
                        title: "Opponent approval",
                        description: "Opposing team approves the request",
                        status: "inactive",
                        icon: "fas fa-calendar-check",
                        actions: {
                            submitter: {
                                title: { text: `${this.reschedule} request in progress` },
                                // buttons: [
                                //     {
                                //         reaction: "delete", action: "approve-match-reschedule", style: { variant: "danger", icon: "fas fa-trash", text: "Cancel request" }, successToast: `${this.reschedule} request cancelled`
                                //     }
                                // ],
                                content: ["information", "proposed-report"],
                                footer: [{ heading: "Waiting for an opponent's response", icon: "fas fa-clock" }, ...warningFooter].filter(Boolean)
                            },
                            opponent: {
                                title: { text: `Match ${this.reschedule.toLowerCase()} request`, variant: "primary" },
                                content: ["information", "proposed-report"],
                                buttons: [
                                    { reaction: "approve", action: "approve-match-reschedule", style: { variant: "success", icon: "fas fa-check", text: "Approve" }, successToast: `${this.reschedule} request approved` },
                                    { reaction: "deny", action: "approve-match-reschedule", style: { variant: "danger", icon: "fas fa-times", text: "Deny" }, successToast: `${this.reschedule} request denied` },
                                ],
                                footer: this.eventSettings?.reporting?.rescheduling?.staffApprove ? [{ heading: "This event requires staff approval", description: `Once you approve this ${this.reschedule.toLowerCase()} request, the match will not be ${this.reschedule.toLowerCase()}d until a staff member has approved it.`, icon: "fas fa-exclamation-circle" }] : null
                            },
                            staff: (this.existingScoreReport?.approved_by_staff && !this.existingScoreReport?.denied_by_staff)
                                ? {
                                    title: {
                                        text: `${this.reschedule} request pre-approved`,
                                        variant: "success"
                                    },
                                    content: ["information", "proposed-report", "log"],
                                    buttons: [
                                        { reaction: "force-approve", action: "staff-approve-match-reschedule", style: { variant: "primary", icon: "fas fa-shield-check", text: "Force approve" }, successToast: `${this.reschedule} request force approved` },
                                        ...this.eventSettings?.reporting?.rescheduling?.staffApprove ? [{
                                            reaction: "pre-approve",
                                            action: "staff-approve-match-reschedule",
                                            disabled: true,
                                            successToast: `${this.reschedule} request pre-approved`,
                                            style: {
                                                variant: "success",
                                                icon: "fas fa-check",
                                                text: "Pre-approve"
                                            }
                                        }] : [],
                                        { reaction: "deny", action: "staff-approve-match-reschedule", style: { variant: "danger", icon: "fas fa-times", text: "Deny" }, successToast: `${this.reschedule} request denied & locked` },
                                        // { reaction: "delete", action: "staff-approve-match-reschedule", style: { variant: "danger", icon: "fas fa-trash", text: "Delete" }, successToast: `${this.reschedule} request deleted` },
                                    ],
                                    footer: [{ heading: "Waiting for opponent approval", icon: "fas fa-clock" }]
                                }
                                : {
                                    title: {
                                        text: this.eventSettings?.reporting?.rescheduling?.staffApprove ? `Pre-approve match ${this.reschedule.toLowerCase()}` : `${this.reschedule} request waiting for opponent approval`,
                                        variant: "primary"
                                    },
                                    content: ["information", "proposed-report"],
                                    buttons: [
                                        { reaction: "force-approve", action: "staff-approve-match-reschedule", style: { variant: "primary", icon: "fas fa-shield-check", text: "Force approve" }, successToast: `${this.reschedule} request force approved` },
                                        ...this.eventSettings?.reporting?.rescheduling?.staffApprove ? [{
                                            reaction: "pre-approve",
                                            action: "staff-approve-match-reschedule",
                                            successToast: `${this.reschedule} request pre-approved`,
                                            style: {
                                                variant: "success",
                                                icon: "fas fa-check",
                                                text: "Pre-approve"
                                            }
                                        }] : [],
                                        { reaction: "deny", action: "staff-approve-match-reschedule", style: { variant: "danger", icon: "fas fa-times", text: "Deny" }, successToast: `${this.reschedule} request denied & locked` },
                                    ],
                                    footer: this.eventSettings?.reporting?.rescheduling?.staffApprove ?
                                        [{ heading: "This event requires staff approval", icon: "fas fa-exclamation-circle" }] :
                                        [{ heading: "This event does not require staff approval", icon: "fas fa-check" }]
                                },
                        }
                    };

                    if (this.existingScoreReport?.approved_by_opponent) {
                        newStep.status = "complete";
                        newStep.icon = "fas fa-check";

                        const completeLogItem = this.logSteps.find(step => step.key === "approved_by_opponent");
                        if (completeLogItem?.user?.name) {
                            newStep.description = `${completeLogItem?.user?.name} approved the request as ${completeLogItem?.team?.name}`;
                        } else if (this.opponentTeam?.name) {
                            newStep.description = `${this.opponentTeam.name} approved the request`;
                        }
                    }

                    steps.push(newStep);
                }
            } else {
                steps.push({
                    key: "opponentApprove",
                    number: 2,
                    title: "Opponent approval",
                    description: "Opponent approval not needed on this match",
                    status: "disabled",
                    icon: "fas fa-check"
                });
            }

            if (this.eventSettings?.reporting?.rescheduling?.staffApprove) {
                if (this.existingScoreReport?.denied_by_staff) {
                    steps.push({
                        key: "staffApprove",
                        number: steps.length + 1,
                        title: "Staff approval",
                        description: "Staff member denied the request",
                        status: "blocking",
                        icon: "fas fa-user-times",

                        actions: {
                            teams: {
                                title: { text: `${this.reschedule} request denied by staff`, variant: "danger" },
                                content: ["information", "proposed-report", "log"],
                                footer: [{ icon: "fas fa-exclamation-triangle", heading: `This match is blocked from ${this.reschedule.slice(0,-1).toLowerCase()}ing requests`, description: `Contact event staff to reopen ${this.reschedule.slice(0,-1).toLowerCase()}ing if required.` }]
                            },
                            staff: {
                                title: { text: `${this.reschedule} request denied by staff`, variant: "danger" },
                                content: ["information", "proposed-report", "log"],
                                buttons: [
                                    { reaction: "delete", action: "staff-approve-match-reschedule", style: { variant: "primary", icon: "fas fa-redo", text: "Start new request" }, successToast: "Match cleared and ready for a new request" },
                                ],
                                footer: [{ icon: "fas fa-lock", heading: `This match is blocked from ${this.reschedule.slice(0,-1).toLowerCase()}ing requests`, description: `Staff can reset this match to reopen ${this.reschedule.slice(0,-1).toLowerCase()}ing.` }]
                            },
                        }
                    });
                } else {
                    const newStep = {
                        key: "staffApprove",
                        number: steps.length + 1,
                        title: "Staff approval",
                        description: "Staff member approves the request",
                        status: "inactive",
                        icon: "fas fa-business-time",

                        actions: {
                            submitter: {
                                title: { text: "Waiting for staff approval" },
                                content: ["information", "proposed-report"],
                                // buttons: [
                                //     { reaction: "cancel", action: "approve-match-reschedule", style: { variant: "danger", icon: "fas fa-trash", text: "Cancel request" } },
                                // ],
                                footer: warningFooter
                            },
                            opponent: {
                                title: { text: "Waiting for staff approval" },
                                content: ["information", "proposed-report"],
                                // buttons: [
                                //     { reaction: "cancel", action: "approve-match-reschedule", style: { variant: "danger", icon: "fas fa-trash", text: "Cancel request" } },
                                // ],
                                footer: !this.eventSettings?.reporting?.rescheduling?.opponentApprove ? [
                                    { heading: "Waiting for staff approval", icon: "fas fa-info-circle", description: `This event does not require opponent approval, a staff member will approve or deny this ${this.reschedule.toLowerCase()} request.` },
                                    warningFooter
                                ].filter(Boolean) : warningFooter
                            },
                            staff: {
                                title: {
                                    text: `Approve match ${this.reschedule.toLowerCase()}`,
                                    variant: "primary"
                                },
                                content: ["information", "proposed-report"],
                                buttons: [
                                    // { reaction: "force-approve", action: "staff-approve-match-reschedule", style: { variant: "primary", icon: "fas fa-shield-check", text: "Force approve" } },
                                    { reaction: "approve", action: "staff-approve-match-reschedule", style: { variant: "success", icon: "fas fa-check", text: "Approve" } },
                                    { reaction: "deny", action: "staff-approve-match-reschedule", style: { variant: "danger", icon: "fas fa-times", text: "Deny" } },
                                    // { reaction: "delete", action: "staff-approve-match-reschedule", style: { variant: "danger", icon: "fas fa-trash", text: "Delete" } },
                                ]
                            }
                        }
                    };

                    steps.push(newStep);
                }
            } else {
                steps.push({
                    key: "staffApprove",
                    number: steps.length + 1,
                    title: "Staff approval",
                    description: "Staff approval not needed on this match",
                    status: "disabled",
                    icon: "fas fa-check"
                });
            }


            if (this.existingScoreReport?.force_approved) {
                steps[steps.length-1].status = "complete";
                steps[steps.length-1].icon = "fas fa-shield-check";
                const completeLogItem = this.logSteps.find(step => step.key === "staff_force_approved");
                if (completeLogItem?.user?.name) {
                    steps[steps.length - 1].description = `${completeLogItem?.user?.name} force-approved the request as staff`;
                } else  {
                    steps[steps.length - 1].description = "Staff member force-approved the request";
                }
            } else if (this.existingScoreReport?.approved_by_staff) {
                steps[steps.length-1].status = "complete";
                steps[steps.length-1].icon = "fas fa-check";

                const approveLogItem = this.logSteps.find(step => step.key === "staff_approved");
                const preApproveLogItem = this.logSteps.find(step => step.key === "staff_preapproved");

                if (approveLogItem?.user?.name) {
                    steps[steps.length - 1].description = `${approveLogItem?.user?.name} approved the request as staff`;
                } else if (preApproveLogItem?.user?.name) {
                    steps[steps.length - 1].description = `${preApproveLogItem?.user?.name} pre-approved the request as staff`;
                } else {
                    steps[steps.length - 1].description = "Staff member approved the request";
                }
            }

            const noFurtherActions =
                this.existingScoreReport?.approved ||
                this.existingScoreReport?.denied_by_staff ||
                this.existingScoreReport?.denied_by_opponent;

            if (!noFurtherActions) {
                let firstAvailable = steps.findIndex(s => s.status === "inactive");
                if (firstAvailable !== -1) {
                    steps[firstAvailable].status = "active";
                }
            }


            console.log(steps);
            return steps.sort((a,b) => {
                if (a.status === "disabled" && b.status === "disabled") return a.number - b.number;
                if (a.status === "disabled") return 1;
                if (b.status === "disabled") return -1;
                return a.number - b.number;
            });
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

            const editorPerm = isEventStaffOrHasRole(user, this.match?.event, ["Can edit any match", "Can edit any event"]);
            if (editorPerm) status.staff = true;
            return status;
        },
        currentStep() {
            let next = (this.steps || []).find(s => s.status === "blocking");
            if (next) {
                return next;
            }
            next = (this.steps || []).find(s => s.status === "active");
            if (next) {
                return next;
            }
            return {
                key: "complete",
                number: this.steps.length + 1,
                actions: {
                    teams: {
                        title: {
                            text: `Match ${this.reschedule.toLowerCase()}d`,
                            variant: "success"
                        },
                        buttons: [
                            {
                                reaction: "delete",
                                action: "approve-match-reschedule",
                                style: {
                                    variant: "primary",
                                    icon: "fas fa-redo",
                                    text: "Start new request"
                                },
                                successToast: "Match ready for a new request"
                            },
                        ],
                        content: ["match start", "log"]
                    },
                    staff: {
                        title: {
                            text: `Match ${this.reschedule.toLowerCase()}d`,
                            variant: "success"
                        },
                        content: ["match start", "log"],
                        buttons: [
                            {
                                reaction: "delete",
                                action: "staff-approve-match-reschedule",
                                style: {
                                    variant: "primary",
                                    icon: "fas fa-redo",
                                    text: "Start new request"
                                },
                                successToast: "Match ready for a new request"
                            },
                        ],
                    }
                }
            };
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
            if (this.eventSettings?.reporting?.rescheduling?.opponentApprove) {
                types.opponent = true;
            }
            if (this.eventSettings?.reporting?.rescheduling?.staffApprove) {
                types.staff = true;
            }
            if (this.existingScoreReport?.approved_by_opponent) {
                types.opponent = false;
            }
            if (this.existingScoreReport?.approved_by_staff) {
                types.staff = false;
            }

            return {
                short: types.opponent && types.staff ? "opponent and staff" : (types.opponent ? "opponent" : (types.staff ? "staff" : null)),
                people: types.opponent && types.staff ? "an opponent and a staff member" : (types.opponent ? "an opponent" : (types.staff ? "a staff member" : null)),
                types: Object.values(types)
            };
        },
        reschedule() {
            if (this.match?.id && !this.match?.start) return "Schedule";
            return "Reschedule";
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
        formatTime,
        async submitRequest() {
            try {
                if (!this.proposedTime) {
                    return this.$notyf.error("No time was proposed");
                }
                this.processing = true;
                const response = await authenticatedRequest("actions/submit-match-reschedule", {
                    matchID: this.match.id,
                    startTime: this.proposedTime
                });
                // if (response.error) this.errorMessage = response.errorMessage;
                console.log(response);
                this.processing = false;

                if (!response.error) {
                    this.$notyf.success({
                        message: `${this.reschedule} request submitted`,
                        duration: 3000
                    });
                }
            } finally {
                this.processing = false;
                this.proposedTime = null;
            }
        },
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
        }
    }
};
</script>

<style scoped>
    @import "match-editors.css";
</style>
