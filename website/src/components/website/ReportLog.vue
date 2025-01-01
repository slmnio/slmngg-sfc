<template>
    <div class="report-log">
        <div v-for="step in steps" :key="step.key" class="step">
            <span v-if="step.time">{{ step.time }}:&nbsp;</span>
            <span v-if="step.user"><router-link :to="url('player', step.user)">{{ step.user?.name }}</router-link>&nbsp;</span>
            <span v-if="step.text" class="action">{{ step.text.slice(0,1).toLowerCase() + step.text.slice(1) }}&nbsp;</span>
            <span v-if="step.team">as <router-link :to="url('team', step.team)">{{ step.team?.name }}</router-link>&nbsp;</span>
            <span v-else-if="step.staff">as staff&nbsp;</span>
        </div>
    </div>
</template>

<script>
import { ReactiveRoot } from "@/utils/reactive.js";
import { formatTime, url } from "@/utils/content-utils.js";

export default {
    name: "ReportLog",
    props: {
        log: String
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
        }
    },
    methods: { url }
};
</script>

<style scoped>
</style>
