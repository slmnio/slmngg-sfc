<template>
    <div class="report-log">
        <div v-for="step in steps" :key="step.key" class="step">
            <span v-if="step.time" class="time">{{ step.time }}:&nbsp;</span>
            <span v-if="stepIcon[step.key]"><i :class="`fa-fw ${stepIcon[step.key]}`"></i>&nbsp;</span>
            <span v-if="step.user"><router-link :to="url('player', step.user)">{{ step.user?.name }}</router-link>&nbsp;</span>
            <span v-if="step.text" class="action">{{ step.text.slice(0,1).toLowerCase() + step.text.slice(1) }}&nbsp;</span>
            <span v-if="step.team">as <router-link :to="url('team', step.team)">{{ step.team?.name }}</router-link>&nbsp;</span>
            <span v-if="step.key === 'submitted_request' && existingReportData?.start" class="submission">for {{ formatTime(existingReportData?.start) }}</span>
            <span v-else-if="step.staff">as staff&nbsp;</span>
        </div>
    </div>
</template>

<script>
import { ReactiveRoot } from "@/utils/reactive";
import { formatTime, url } from "@/utils/content-utils";

export default {
    name: "ReportLog",
    props: {
        log: String,
        report: Object
    },
    computed: {
        steps() {
            return this.log.split("\n").map(step => Object.fromEntries(step.split("|").map(pair => pair.split("=")))).map(step => {

                step.time = formatTime(new Date(parseInt(step.date)), { format: "{date-ordinal} {month-short} {time}"});
                if (step.user) step.user = ReactiveRoot(step.user);
                if (step.team) step.team = ReactiveRoot(step.team);
                if (step.staff) step.staff = true;

                return step;
            });
        },
        existingReportData() {
            if (!this.report?.data) return null;
            try {
                return JSON.parse(this.report.data);
            } catch (e) {
                console.error(e);
                return null;
            }
        },
        stepIcon() {
            return {
                "approved_by_opponent": "fas fa-check",
                "staff_preapproved": "fas fa-check",
                "staff_approved": "fas fa-check",
                "staff_force_approved": "fas fa-shield-check",
                "staff_force_approved_counter": "fas fa-shield-check",
                "approved_counter_report": "fas fa-check",

                "deleted": "fas fa-trash",
                "staff_deleted": "fas fa-trash",

                "denied_by_opponent": "fas fa-times",
                "staff_denied": "fas fa-times-octagon",

                "submitted_request": "fas fa-calendar-alt",
                "submitted_score_report": "fas fa-file-alt",
                "countered_score_report": "fas fa-exchange",
            };
        }
    },
    methods: { formatTime, url }
};
</script>

<style scoped>
.time {
    min-width: 15ex;
    display: inline-block;
    text-align: right;
}
</style>
