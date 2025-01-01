<template>
    <div class="report-steps-top bg-dark w-100">
        <div v-if="title" class="steps-title">{{ title }}</div>
        <div v-if="steps?.length" class="steps d-flex gap-3 p-2">
            <div v-for="(step, i) in steps" :key="step.number" class="step d-flex flex-center flex-column gap-2 py-1" :class="`status-${step.status}`">
                <!--                <div class="step-num fw-bold">{{ step.number }}</div>-->
                <div class="step-icon-wrapper flex-center my-1">
                    <div class="step-icon-holder flex-center">
                        <div class="step-icon">
                            <i :class="`fa-fw ${step.icon}`"></i>
                        </div>
                    </div>
                    <div
                        v-if="i !== steps.length-1"
                        class="step-bar"
                        :class="`status-${step.status === 'complete' ? 'complete' : 'waiting'} ${i <= steps.length - 1 && steps[i+1]?.status === 'disabled' ? 'next-disabled': ''}`">
                    </div>
                </div>
                <div class="step-content flex-grow-1 text-center">
                    <div class="step-title fw-bold mb-1">{{ step.title }}</div>
                    <div class="step-description">{{ step.description }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ReportStepsTop",
    props: {
        steps: Array,
        title: String
    }
};
</script>

<style scoped>
    .report-steps-top {
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: .5em;
        overflow: hidden;
    }
    .steps-title {
        font-weight: bold;
        text-align: center;
        font-size: 1.75em;
        text-transform: uppercase;
        padding: 0.1em;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        background-color: rgba(255,255,255,0.05);
    }
    .step {
        flex: 1 0;
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
        background-color: var(--variant-background-color, #383b3f);
        color: var(--variant-color, #ffffff);
        width:  4em;
        height: 4em;
        border-radius: 50%;
        flex-shrink: 0;
        z-index: 1;
    }
    .step-icon-wrapper {
        position: relative;
        width: 100%;
    }

    .step-bar {
        position: absolute;
        height: 1em;
        width: 100%;
        left: 50%;
        background-color: #383b3f;
    }
    .status-complete .step-bar,
    .status-countered .step-bar {
        background-color: var(--variant-background-color, #383b3f);
    }
    .step-title {
        font-size: 1.25em;
        line-height: 1.1;
    }
    .step-description {
        font-size: 0.9em;
        line-height: 1.1;
    }

    /*.step.status-active {*/
    /*    --variant-background-color: var(--primary);*/
    /*}*/

    .step.status-active .step-icon-holder {
        border: .25em solid var(--primary);
    }

    .step.status-complete {
        --variant-background-color: var(--green);
    }
    .step.status-denied,
    .step.status-blocking {
        --variant-background-color: var(--red);
    }
    .step.status-countered {
        --variant-background-color: var(--yellow);
        --variant-color: var(--dark);
    }
    .step.status-disabled, .step.status-disabled .step-icon {
        --variant-background-color: #2c3034;
        color: rgba(255,255,255,0.5);
    }
    .step-bar.next-disabled {
        opacity: 0;
    }

    .step .step-icon i {
        transform: translateY(-0.1em)
    }
</style>
