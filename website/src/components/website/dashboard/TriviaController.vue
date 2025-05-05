<template>
    <div class="trivia-controller">
        <div class="flex-grow-1">Total questions in system: 10 Bla: ?/</div>
        <div class="flex-grow-1 f-col">
            <b-form-input
                v-model="numQuestions"
                class="opacity-changes disabled-low-opacity"
                type="text"
                placeholder="# of questions"
                @keydown.ctrl.enter="saveData({ mode: 'show' })"
            />
            <b-form-input
                v-model="timePerQuestion"
                class="opacity-changes disabled-low-opacity"
                type="text"
                placeholder="seconds per question"
                @keydown.ctrl.enter="saveData({ mode: 'show' })"
            />
            <b-form-input
                v-model="timePerAnswer"
                class="opacity-changes disabled-low-opacity"
                type="text"
                placeholder="seconds per answer"
                @keydown.ctrl.enter="saveData({ mode: 'show' })"
            />
            <div class="f-row">
                Show manual questions
                <b-form-checkbox v-model="showManuals" class="mx-2" />
            </div>
            Total time: {{ totalTime }} seconds
            <b-button class="flex-shrink-0" @click="saveSettings()">Save</b-button>
        </div>
    </div>
</template>
<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "TriviaController",
    props: {
        broadcast: {},
        liveMatch: {},
    },
    data: () => ({
        showManuals: true,
        numQuestions: 10,
        timePerQuestion: 20,
        timePerAnswer: 10,
    }),
    computed: {
        totalTime() {
            return (
                this.numQuestions * (this.timePerQuestion + this.timePerAnswer)
            );
        },
    },
    methods: {
        saveSettings() {
        }
    },
};
</script>

<style>
.trivia-controller {
    display: flex;
    justify-content: center;
    align-items: flex-center;
    width: 100%;
}
</style>
