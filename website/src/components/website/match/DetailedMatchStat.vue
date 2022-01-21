<template>
    <div class="stat mb-2" v-if="shouldShow">
        <div class="stat-a"><slot></slot></div>
        <div class="stat-b" v-if="raw" v-html="formattedTargetData"></div>
        <div class="stat-b" v-else-if="time">{{ prettyDate(targetData) }} local time</div>
        <div class="stat-b" v-else-if="players">
            <LinkedPlayers :players="targetData" :show-tally="showTally" />
        </div>
        <div class="stat-b" v-else-if="externalLink">
            <a class="ct-active" :href="targetData" target="_blank">{{ targetData.replace('https://', '') }}</a>
        </div>
        <div class="stat-b" v-else>{{ formattedTargetData }}</div>
    </div>
</template>

<script>
import LinkedPlayers from "@/components/website/LinkedPlayers";
import spacetime from "spacetime";

export default {
    name: "DetailedMatchStat",
    props: ["match", "data", "override", "format", "raw", "time", "players", "externalLink", "showTally"],
    components: { LinkedPlayers },
    methods: {
        prettyDate(timeString) {
            return spacetime(timeString).goto(null).format("{date} {month-short} {time}");
        }
    },
    computed: {
        targetData() {
            return this.override || this.match[this.data];
        },
        shouldShow() {
            return this.targetData && this.targetData?.length !== 0;
        },
        formattedTargetData() {
            return this.format ? this.format(this.targetData) : this.targetData;
        }
    }
};
</script>

<style scoped>

    .stat-a {
        font-weight: bold;
    }
    .stat-b >>> a {
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        display: block;
        text-overflow: ellipsis;
    }

</style>
