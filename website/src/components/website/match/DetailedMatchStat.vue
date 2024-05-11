<template>
    <div v-if="shouldShow" class="stat mb-2">
        <div class="stat-a">
            <slot></slot>
        </div>
        <div v-if="raw" class="stat-b" v-html="formattedTargetData"></div>
        <div v-if="$slots.content" class="">
            <slot name="content"></slot>
        </div>
        <div v-else-if="time" class="stat-b">{{ prettyDate(targetData) }}</div>
        <div v-else-if="players" class="stat-b">
            <LinkedPlayers :players="targetData" :show-tally="showTally" />
        </div>
        <div v-else-if="externalLink" class="stat-b">
            <a class="ct-active" :href="targetData" target="_blank">{{ targetData.replace("https://", "") }}</a>
        </div>
        <div v-else-if="formattedTargetData" class="stat-b">{{ formattedTargetData }}</div>
    </div>
</template>

<script>
import LinkedPlayers from "@/components/website/LinkedPlayers";
import { formatTime } from "@/utils/content-utils";
import { useSettingsStore } from "@/stores/settingsStore";

export default {
    name: "DetailedMatchStat",
    components: { LinkedPlayers },
    props: ["match", "data", "override", "format", "raw", "time", "players", "externalLink", "showTally"],
    computed: {
        targetData() {
            return this.override || this.match[this.data];
        },
        shouldShow() {
            return this.$slots.content || (this.targetData && this.targetData?.length !== 0);
        },
        formattedTargetData() {
            return this.format ? this.format(this.targetData) : this.targetData;
        }
    },
    methods: {
        prettyDate(timeString) {
            return formatTime(timeString, {
                tz: useSettingsStore().timezone,
                use24HourTime: useSettingsStore().use24HourTime
            });
        }
    }
};
</script>

<style scoped>

.stat-a {
    font-weight: bold;
}

.stat-b:deep(a) {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    display: block;
    text-overflow: ellipsis;
}

</style>
