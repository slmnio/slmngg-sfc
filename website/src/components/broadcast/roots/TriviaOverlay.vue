<template>
    <div class="f-col">
        <div class="qt-row">
            <div class="question-container">{{ activeQuestion?.question }}</div>
            <div class="timer-container">{{ counterLabel }}</div>
        </div>
        <div class="answers-container">
            <div v-for="option in options" :key="option.q" :class="{'correct': (state === 'answer' && option.c)}">
                {{ option.q }}
            </div>
        </div>
    </div>
</template>
<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { resizedImage } from "@/utils/images";
import { logoBackground1 } from "@/utils/theme-styles";
import { useInterval } from "@vueuse/core";

export default {
    name: "TriviaOverlay",
    props: {
        broadcast: {},
    },
    data: () => ({
        activeQuestionIndex: 0,

        state: "question",

        // Counter
        counterRunning: false,
        resetCounter: () => {},
    }),
    computed: {
        questions() {
            return ReactiveRoot(this.broadcast, {
                trivia: ReactiveArray("trivia"),
            }).trivia?.filter((x) => x.active);
        },
        activeQuestion() {
            if (!this.questions?.length) return null;
            return this.questions[this.activeQuestionIndex];
        },
        triviaSettings() {
            if (!this.broadcast.trivia_settings) return null;
            return JSON.parse(this.broadcast.trivia_settings);
        },
        counterLabel() {
            if (!this.triviaSettings) return 0;
            if (this.state === "question")
                return this.triviaSettings.timePerQuestion - this.counter.value;
            else return this.triviaSettings.timePerAnswer - this.counter.value;
        },
        options() {
            if (!this.activeQuestion) return [];
            return this.activeQuestion.options
                .split("\n")
                .map((option) => ({
                    q: option,
                    c: option === this.activeQuestion.answer,
                }));
        },
    },
    methods: {
        intervalCalled() {
            console.log(this.state, this.counter, this.triviaSettings);
            if (
                this.state === "question" &&
                this.counter.value > this.triviaSettings.timePerQuestion
            ) {
                this.state = "answer";
                this.resetCounter();
            } else if (
                this.state === "answer" &&
                this.counter.value > this.triviaSettings.timePerAnswer
            ) {
                this.state = "question";
                if (
                    this.activeQuestionIndex < this.triviaSettings.questions &&
                    this.activeQuestionIndex !== this.questions.length - 1
                ) {
                    this.activeQuestionIndex += 1;
                    this.resetCounter();
                }
            }
        },
    },
    mounted() {
        const { counter, isActive, reset } = useInterval(1000, { controls: true, callback: this.intervalCalled });
        this.counter = counter;
        this.counterRunning = isActive;
        this.resetCounter = reset;
    },
};
</script>
<style>
.qt-row {
    display: flex;
    justify-content: center;
    align-items: flex-center;
    width: 100%;
}

.correct {
    background-color: green;
}

.answers-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
}
</style>
