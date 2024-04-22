<template>
    <div class="break-time-controls mb-3 d-flex flex-column gap-3">
        <div class="d-flex flex-center rounded flex-grow-1 countdown-wrapper mb-1">
            <Countdown :to="broadcast.countdown_end" />
        </div>
        <div class="d-flex gap-3 opacity-changes" :class="{'low-opacity': processing}">
            <div class="flex-grow-1 d-flex gap-3">
                <div class="stack">
                    <div class="label small text-muted">Manual end point</div>
                    <AdvancedDateEditor class="date-editor" :saved-time="broadcast.countdown_end"
                                        :is-processing="manualProcessing"
                                        @submit="(timeString) => setManualCountdownEnd(timeString)"></AdvancedDateEditor>
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
                <b-button class="label-padding" :variant="broadcast.countdown_end ? 'danger' : ''" @click="setCountdownEnd(null)" :disabled="!broadcast.countdown_end">
                    <i class="fal fa-times mr-1"></i>
                    Clear
                </b-button>
            </div>
        </div>
        <div class="d-flex gap-2 opacity-changes" :class="{'low-opacity': processing}">
            <div class="flex-grow-1">
                <div class="d-flex gap-1">
                    <div class="digit w-100">
                        <div class="label small text-muted">Hours</div>
                        <b-form-input type="number" placeholder="h" min="0" step="1"
                                      v-model.number="hours"></b-form-input>
                    </div>
                    <div class="digit w-100">
                        <div class="label small text-muted">Minutes</div>
                        <b-form-input type="number" placeholder="mm" min="0" step="1" max="59"
                                      v-model.number="minutes"></b-form-input>
                    </div>
                    <div class="digit w-100">
                        <div class="label small text-muted">Seconds</div>
                        <b-form-input type="number" placeholder="mm" min="0" step="1" max="59"
                                      v-model.number="seconds"></b-form-input>
                    </div>
                </div>
            </div>
            <div class="flex-shrink-0">
                <b-button class="label-padding" :variant="customDuration ? 'primary' : ''" @click="setCountdownFromNow(customDuration)" :disabled="!customDuration">
                    <i class="fal fa-clock mr-1"></i> Set time
                </b-button>
            </div>
        </div>
    </div>
</template>

<script>
import { BButton, BFormInput } from "bootstrap-vue";
import { updateBroadcastData } from "@/utils/dashboard";
import AdvancedDateEditor from "@/components/website/dashboard/AdvancedDateEditor.vue";
import Countdown from "@/components/broadcast/Countdown.vue";

export default {
    name: "BreakTimeControls",
    components: {
        Countdown,
        AdvancedDateEditor,
        BButton,
        BFormInput
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
        }
    },
    methods: {
        async setManualCountdownEnd(dateString) {
            this.manualProcessing = true;
            return this.setCountdownEnd((new Date(dateString)).getTime());
        },
        async setCountdownFromNow(seconds) {
            return this.setCountdownEnd(Date.now() + (seconds * 1000));
        },
        async setCountdownEnd(date) {
            this.processing = true;
            try {
                await updateBroadcastData(this.$root.auth, {
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
    margin-bottom: .15em;
    height: 19px;
}

.label-padding {
    margin-top: 21px;
}

.date-editor >>> .btn {
    width: 100%;
}

.countdown-wrapper {
    font-size: 2em;
    line-height: 1;
}

.opacity-changes {
    opacity: 1;
    transition: opacity .3s ease;
}
.low-opacity {
    opacity: 0.5;
    pointer-events: none;
    cursor: wait;
}
</style>
