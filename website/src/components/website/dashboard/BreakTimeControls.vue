<template>
    <div class="break-time-controls mb-3 d-flex flex-column gap-3">
        <div class="d-flex flex-center rounded flex-grow-1 countdown-wrapper mb-1">
            <Countdown :to="broadcast.countdown_end" />
        </div>
        <div class="d-flex gap-3 opacity-changes" :class="{'low-opacity': processing}">
            <div class="flex-grow-1 d-flex gap-3">
                <div class="stack">
                    <div class="label small text-muted">Manual end point</div>
                    <AdvancedDateEditor
                        class="date-editor"
                        :saved-time="broadcast.countdown_end"
                        :is-processing="manualProcessing"
                        @submit="(timeString) => setManualCountdownEnd(timeString)" />
                </div>
                <div class="stack">
                    <div class="label small text-muted">Quick buttons</div>
                    <div class="div d-flex gap-1">
                        <b-button variant="success" @click="setCountdownFromNow(3 * 60)">3:00</b-button>
                        <b-button variant="success" @click="setCountdownFromNow(5 * 60)">5:00</b-button>
                        <b-button variant="success" @click="setCountdownFromNow(10 * 60)">10:00</b-button>
                    </div>
                </div>
            </div>
            <div>
                <b-button class="label-padding" :variant="broadcast.countdown_end ? 'danger' : ''" :disabled="!broadcast.countdown_end" @click="setCountdownEnd(null)">
                    <i class="fal fa-times mr-1"></i>
                    Clear
                </b-button>
            </div>
        </div>
        <div v-if="showLiveMatch" class="d-flex gap-2 opacity-changes" :class="{'low-opacity': processing}">
            <div class="flex-grow-1 d-flex gap-3">
                <div class="stack">
                    <div class="label small text-muted">From match start ({{ formatTime(broadcast.live_match.start, { format: "{time} {tz}" }) }})</div>
                    <div class="div d-flex gap-1">
                        <b-button variant="success" @click="setManualCountdownEnd(new Date(broadcast.live_match.start).getTime() - (5 * 60 * 1000))">-5:00</b-button>
                        <b-button variant="success" @click="setManualCountdownEnd(new Date(broadcast.live_match.start).getTime() - (2 * 60 * 1000))">-2:00</b-button>
                        <b-button variant="secondary" @click="setManualCountdownEnd(new Date(broadcast.live_match.start).getTime())">Start</b-button>
                        <b-button variant="success" @click="setManualCountdownEnd(new Date(broadcast.live_match.start).getTime() + (2 * 60 * 1000))">+2:00</b-button>
                        <b-button variant="success" @click="setManualCountdownEnd(new Date(broadcast.live_match.start).getTime() + (5 * 60 * 1000))">+5:00</b-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="d-flex gap-2 opacity-changes" :class="{'low-opacity': processing}">
            <div class="flex-grow-1">
                <div class="d-flex gap-1">
                    <div class="digit w-100">
                        <div class="label small text-muted">Hours</div>
                        <b-form-input
                            v-model.number="hours"
                            type="number"
                            placeholder="h"
                            min="0"
                            step="1" />
                    </div>
                    <div class="digit w-100">
                        <div class="label small text-muted">Minutes</div>
                        <b-form-input
                            v-model.number="minutes"
                            type="number"
                            placeholder="mm"
                            min="0"
                            step="1"
                            max="59" />
                    </div>
                    <div class="digit w-100">
                        <div class="label small text-muted">Seconds</div>
                        <b-form-input
                            v-model.number="seconds"
                            type="number"
                            placeholder="mm"
                            min="0"
                            step="1"
                            max="59" />
                    </div>
                </div>
            </div>
            <div class="flex-shrink-0">
                <b-button class="label-padding" :variant="customDuration ? 'primary' : 'secondary'" :disabled="!customDuration" @click="setCountdownFromNow(customDuration)">
                    <i class="fal fa-clock mr-1"></i> Set time
                </b-button>
            </div>
        </div>
    </div>
</template>

<script>
import { authenticatedRequest } from "@/utils/dashboard";
import AdvancedDateEditor from "@/components/website/dashboard/AdvancedDateEditor.vue";
import Countdown from "@/components/broadcast/Countdown.vue";
import { formatTime } from "../../../utils/content-utils";

export default {
    name: "BreakTimeControls",
    components: {
        Countdown,
        AdvancedDateEditor
    },
    props: {
        broadcast: {}
    },
    data: () => ({
        processing: false,
        manualProcessing: false,
        hours: 0,
        minutes: 0,
        seconds: 0
    }),
    computed: {
        customDuration() {
            return (this.hours * 60 * 60) + (this.minutes * 60) + this.seconds;
        },
        showLiveMatch() {
            if (!this.broadcast?.live_match?.start) return false;
            const now = new Date();
            const matchStart = new Date(this.broadcast.live_match.start);
            const diff = Math.floor((matchStart - now) / 1000);
            return diff > 2 * 60;
        }
    },
    methods: {
        formatTime,
        async setManualCountdownEnd(dateString) {
            this.manualProcessing = true;
            return await this.setCountdownEnd((new Date(dateString)).getTime());
        },
        async setCountdownFromNow(seconds) {
            return await this.setCountdownEnd(Date.now() + (seconds * 1000));
        },
        async setCountdownEnd(date) {
            this.processing = true;
            try {
                await authenticatedRequest("actions/update-broadcast", {
                    countdownEnd: date
                });
            } catch (e) {
                console.error(e);
            } finally {
                this.processing = false;
                this.manualProcessing = false;
            }
        }
    }
};
</script>

<style scoped>
.label {
    margin-bottom: .25em;
    height: 19px;
}

.label-padding {
    margin-top: 21px;
}

.date-editor:deep(.btn) {
    width: 100%;
}

.countdown-wrapper {
    font-size: 2em;
    line-height: 1;
}
</style>
