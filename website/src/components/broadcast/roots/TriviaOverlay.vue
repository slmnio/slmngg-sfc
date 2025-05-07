<template>
    <div class="trivia-overlay-holder">
        <GenericOverlay
            class="trivia-overlay"
            :class="{
                'content-question': !!activeQuestion?.question_content
            }"
            body-color="transparent !important"
            no-bottom="true"
            clear-bottom-style="true"
            no-bottom-animate="true"
            :broadcast="broadcast">
            <template #title>
                <div v-if="activeQuestion?.question" class="trivia-question-title w-100 d-flex">
                    <transition name="fade" mode="out-in">
                        <div :key="activeQuestion?.question" class="question-text flex-center f-col">
                            <div class="question-title">{{ activeQuestion?.question }}</div>
                            <div class="question-subtitle subtitle-text">{{ activeQuestion?.subtitle }}</div>
                        </div>
                    </transition>
                    <div class="timer-container flex-center">
                        <div
                            class="timer-circle flex-center text-center"
                            :style="{
                                backgroundColor: borderColor,
                                background: `conic-gradient(${themeColor?.backgroundColor} ${state === 'question' ? ((1-counterPercentage) * 100) : 100}%, 0, ${themeColor?.borderColor})`
                            }">
                            <div class="timer-circle-inner flex-center" :style="themeColor">
                                <div class="timer-circle-text industry-align">{{ counterLabel }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <transition name="fade" mode="out-in">
                <div :key="activeQuestion?.question" class="trivia-container d-flex w-100 h-100">
                    <div class="trivia-content d-flex w-100 h-100">
                        <div
                            class="answers-container w-100 h-100"
                            :class="{
                                'use-column': activeQuestion?.question_content
                            }">
                            <div
                                v-for="option in options"
                                :key="option.q"
                                class="flex-center flex-column default-thing option"
                                :style="{
                                    ...themeColor,
                                    backgroundColor: state === 'answer' && option.c ? 'green' : themeColor.backgroundColor
                                }"
                                :class="{ correct: state === 'answer' && option.c }"
                            >
                                <div class="c-name f-col flex-center text-center industry-align">
                                    <div class="option-q">{{ option.q }}</div>
                                    <transition name="answer-reveal">
                                        <div v-if="state === 'answer' && option.v" class="option-v">
                                            {{ option.v }}
                                        </div>
                                    </transition>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div v-if="questionContent" class="question-content-holder h-100">
                        <transition name="fade" mode="out-in">
                            <div
                                v-if="questionContent.type === 'image'"
                                :key="`image-${questionContent.url}`"
                                class="image-content w-100 h-100 full bg-center"
                                :style="{
                                    ...bg(questionContent.url),
                                    borderColor }">
                            </div>
                            <div
                                v-else-if="questionContent.type === 'video'"
                                :key="`video-${questionContent.url}`"
                                class="video-content w-100 h-100 full flex-center">
                                <video :src="questionContent.url" loop autoplay muted></video>
                            </div>
                        </transition>
                    </div>
                </div>
            </transition>
        </GenericOverlay>
    </div>
</template>
<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { useInterval } from "@vueuse/core";
import { calculateStandings } from "@/utils/standings";
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay.vue";
import { bg, getNewURL } from "@/utils/images.js";
import { themeBackground } from "@/utils/theme-styles.js";

export default {
    name: "TriviaOverlay",
    components: { GenericOverlay },
    props: {
        broadcast: {},
        active: Boolean,
        animationActive: Boolean
    },
    data: () => ({
        activeQuestionIndex: 0,

        optionsCache: {},
        shownQuestions: new Set(),

        options: [],
        state: "question",

        // Counter
        counterRunning: false,
        resetCounter: () => {},
        stopTimer: () => {},
        resumeTimer: () => {},
    }),
    computed: {
        event() {
            return ReactiveRoot(this.broadcast.event, {
                theme: ReactiveThing("theme")
            });
        },
        questions() {
            return ReactiveRoot(this.broadcast, {
                trivia: ReactiveArray("trivia"),
            }).trivia?.filter((x) => x.active);
        },
        availableQuestions() {
            return (this.questions || []).filter((q) => !this.shownQuestions.has(q.id));
        },
        activeQuestion() {
            if (!this.availableQuestions?.length) return null;
            return this.availableQuestions[this.activeQuestionIndex] || this.availableQuestions[0];
        },
        questionContent() {
            // this needs to handle reveal content at some point
            // possibly also wrapped in some of the download + display logic
            const questionContent = this.activeQuestion?.question_content?.[0];
            const revealContent = this.activeQuestion?.reveal_content?.[0];
            const content = (this.state === "answer" ? revealContent : questionContent) || questionContent;
            if (!content) return null;
            return {
                type: content.type.split("/")[0],
                url: getNewURL(content, "orig")
            };
        },
        triviaSettings() {
            if (!this.broadcast.trivia_settings) return null;
            return JSON.parse(this.broadcast.trivia_settings);
        },
        counterLabel() {
            if (!this.triviaSettings) return 0;
            if (this.state === "question") {
                return Math.max(0, this.triviaSettings?.timePerQuestion - this.counter.value);
            } else {
                return Math.max(0, this.triviaSettings?.timePerAnswer - this.counter.value);
            }
        },
        counterPercentage() {
            if (!this.triviaSettings) return 0;
            if (this.state === "question") {
                return (Math.max(0, this.triviaSettings?.timePerQuestion - this.counter.value) / this.triviaSettings?.timePerQuestion);
            } else {
                return (Math.max(0, this.triviaSettings?.timePerAnswer - this.counter.value) / this.triviaSettings?.timePerAnswer);
            }
        },
        themeColor() {
            return {
                ...themeBackground(this.broadcast?.event?.theme),
                "--theme-color": this.broadcast?.event?.theme?.color_logo_background || this.broadcast?.event?.theme?.color_theme
            };
        },
        borderColor() {
            const theme = this.event?.theme;
            if (!theme) return;
            const desk = (theme.desk_colors || "").trim().split(/[\n,]/g).filter(col => col);
            if (!desk?.length) {
                // no desk set, this.color is default
                return (theme.color_logo_background ? theme.color_logo_accent : theme.color_text_on_theme) || theme.color_alt;
            }

            return this.color;
        },
        blocks() {
            if (!this.event?.blocks) return null;
            try {
                const blocks = JSON.parse(this.event.blocks);
                return blocks || null;
            } catch (e) {
                return null;
            }
        },
        allMatches() {
            if (!this.event?.matches) return [];
            return ReactiveArray("matches", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                maps: ReactiveArray("maps")
            })(this.event);
        },
    },
    methods: {
        bg,
        async getOptions() {
            if (!this.activeQuestion) return;
            console.log(this.optionsCache[this.activeQuestion.id]);
            if (this.optionsCache[this.activeQuestion.id]) return this.optionsCache[this.activeQuestion.id];
            if (this.activeQuestion.type === "Manual") {
                const opts = this.activeQuestion.options
                    .split("\n")
                    .map((option) => ({
                        q: option,
                        c: option === this.activeQuestion.answer,
                    }));
                this.options = opts;
                this.optionsCache[this.activeQuestion.id] = opts;
            } else {
                const [type, data] = this.activeQuestion.options.split("|");

                if (type === "api") {
                    const url = new URL(data);
                    if (!["api.dfns.lotu.dev", "localhost"].includes(url.host)) return;
                    const res = await fetch(url).then(async r => await r.json());
                    // Multiple requests can be fired, and they would all shuffle. This SHOULD prevent that
                    if (this.optionsCache[this.activeQuestion.id]) return this.optionsCache[this.activeQuestion.id];
                    const answer = this.activeQuestion.answer;
                    let cor_value;
                    if (answer === "max") {
                        cor_value = Math.max(...res.map(o => o.value));
                    } else {
                        cor_value = null;
                    }
                    const opts = this.shuffleArray(res.map((option) => ({
                        q: option.display_value,
                        c: option.value === cor_value,
                        v: option.value
                    })));
                    this.options = opts;
                    this.optionsCache[this.activeQuestion.id] = opts;
                } else if (type === "standings") {

                    const [standings_key, value_key] = data.split(";");
                    const standingSettings = this.standingsSettings(standings_key);
                    const matches = this.getMatches(standingSettings.group, standingSettings.groups);
                    if (!matches) return;
                    const { standings } = calculateStandings(matches, this.broadcast.event, null, false, standingSettings.sort, standingSettings);
                    const teams = [];
                    let standingsIdx = 0;
                    while (teams.length < 4) {
                        const group = standings[standingsIdx];
                        for (const team of group) {
                            teams.push({
                                q: team.name,
                                c: standingsIdx === 0,
                                v: team.standings[value_key]
                            });
                        }
                        standingsIdx += 1;
                    }
                    const opts = this.shuffleArray(teams);
                    this.options = opts;
                    this.optionsCache[this.activeQuestion.id] = opts;
                }
            }
        },
        intervalCalled() {
            if (this.state === "question" && this.counter.value > this.triviaSettings?.timePerQuestion) {
                this.state = "answer";
                this.resetCounter();
            } else if (this.state === "answer" && this.counter.value > this.triviaSettings?.timePerAnswer) {
                if (this.activeQuestionIndex < this.triviaSettings?.questions && this.activeQuestionIndex !== this.questions.length - 1) {
                    this.state = "question";
                    if (!this.shownQuestions.has(this.activeQuestion.id)) {
                        this.shownQuestions.add(this.activeQuestion.id);
                    }
                    this.activeQuestionIndex = Math.floor(Math.random() * this.availableQuestions.length);
                    this.resetCounter();
                } else {
                    // this.state = "finished";
                    this.stopTimer();
                }
            }
        },
        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },
        standingsSettings(key) {
            return (this.blocks?.standings || []).find(s =>
                s.group?.toLowerCase() === key.toLowerCase() || s.key?.toLowerCase() === key.toLowerCase()
            );
        },
        getMatches(group_key, groups) {
            if (!this.allMatches?.length) return [];
            if (groups) {
                return this.allMatches.filter(match => groups.some(stage => match.match_group && match.match_group.toLowerCase() === stage.toLowerCase()));
            } else if (group_key) {
                return this.allMatches.filter(match => match.match_group && match.match_group.toLowerCase() === group_key.toLowerCase());
            }
        }
    },
    watch: {
        activeQuestion: {
            deep: true,
            handler() {
                this.getOptions();
            }
        },
        allMatches: {
            deep: true,
            handler() {
                this.getOptions();
            }
        },
        animationActive: {
            immediate: true,
            handler(isActive) {
                if (isActive) {
                    console.log("active");
                    this.resetCounter?.();
                    this.activeQuestionIndex = 0;
                    this.state = "question";
                    this.resumeTimer?.();
                } else {
                    console.log("inactive");
                }
            }
        }
    },
    mounted() {
        const {
            counter,
            isActive,
            reset,
            pause,
            resume
        } = useInterval(1000, {
            controls: true,
            callback: this.intervalCalled,
        });
        this.counter = counter;
        this.counterRunning = isActive;
        this.resetCounter = reset;
        this.stopTimer = pause;
        this.resumeTimer = resume;
    },
};
</script>
<style scoped>
.qt-row {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.correct {
    background-color: green;
}


.answers-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    font-size: 6em;
}

.answers-container.use-column {
    grid-template-columns: 1fr;
    font-size: 4.5em;
}

.timer-container {
    width: 2em;
    flex-shrink: 0;
}

.trivia-overlay:deep(.g-title-wrapper) {
    height: 13em;
    transition: height .5s ease-in-out;
}

.trivia-overlay.content-question:deep(.g-title-wrapper) {
    /*height: 600px;*/
}

.trivia-overlay:deep(.g-title) {
    padding: 0 0.1em;
}

.question-title {
    font-size: 0.8em;
}

.option, .image-content {
    border-bottom: 8px solid;
}

.trivia-content {
    flex-shrink: 1;
}

.question-content-holder {
    width: 50%;
    flex-shrink: 0;
}

.question-text {
    flex-grow: 1;
    width: 100%;
}

.question-content-holder .image-content {
    background-size: cover;
}

.trivia-question-title {
    position: relative;
    gap: 0.1em;
}

.trivia-container {
    gap: 20px;
}

.timer-circle {
    background-color: white;
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
}

.timer-circle-inner {
    font-size: 0.75em;
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
}

.trivia-overlay {
    padding: 60px 180px;
}

.option-v {
    font-size: 0.75em;
    height: 1.5em;
    display: flex;
    justify-content: center;
    align-items: center;
}

.answer-reveal-enter-active, .answer-reveal-leave-active {
    transition: height 500ms ease, opacity 500ms ease;
    overflow: hidden
}

.answer-reveal-enter-from, .answer-reveal-leave-to {
    height: 0;
    opacity: 0;
}

.answer-reveal-enter-to, .answer-reveal-leave-from {
    height: 1.5em;
    opacity: 1;
}
</style>
