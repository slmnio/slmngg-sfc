<template>
    <div class="f-col">
        <div class="qt-row">
            <div class="question-container">{{ activeQuestion?.question }}</div>
            <div class="timer-container">{{ counterLabel }}</div>
        </div>
        <div class="answers-container" :style="themeColor">
            <div
                v-for="option in options"
                :key="option.q"
                class="caster-cam-box flex-center flex-column"
                :style="{ borderColor }"
                :class="{ correct: state === 'answer' && option.c }"
            >
                <div class="c-name">{{ option.q }}</div>
            </div>
        </div>
    </div>
</template>
<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { resizedImage } from "@/utils/images";
import { logoBackground1 } from "@/utils/theme-styles";
import { useInterval } from "@vueuse/core";
import { calculateStandings } from "@/utils/standings";

export default {
    name: "TriviaOverlay",
    props: {
        broadcast: {},
    },
    data: () => ({
        activeQuestionIndex: 0,

        options: [],
        state: "question",

        // Counter
        counterRunning: false,
        resetCounter: () => {},
        stopTimer: () => {},
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
            if (this.state === "question") return Math.max(0, this.triviaSettings?.timePerQuestion - this.counter.value);
            else return Math.max(0, this.triviaSettings?.timePerAnswer - this.counter.value);
        },
        themeColor() {
            return {
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
        async getOptions() {
            if (!this.activeQuestion) return;
            if (this.activeQuestion.type === "Manual") {
                this.options = this.activeQuestion.options
                    .split("\n")
                    .map((option) => ({
                        q: option,
                        c: option === this.activeQuestion.answer,
                    }));
            } else {
                const [type, data] = this.activeQuestion.options.split("|");
                if (type === "api") {
                    const url = new URL(data);
                    if (!["api.dfns.lotu.dev", "localhost"].includes(url.host)) return;
                    const res = await fetch(url).then(async r => await r.json());
                    const answer = this.activeQuestion.answer;
                    let cor_value;
                    if (answer === "max") {
                        cor_value = Math.max(...res.map(o => o.value));
                    } else {
                        cor_value = null;
                    }
                    this.options = this.shuffleArray(res.map((option) => ({
                        q: option.display_value,
                        c: option.value === cor_value
                    })));
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
                                c: standingsIdx === 0
                            });
                        }
                        standingsIdx += 1;
                    }
                    this.options = this.shuffleArray(teams);
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
                    this.activeQuestionIndex += 1;
                    this.resetCounter();
                } else {
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
        }
    },
    mounted() {
        const { counter, isActive, reset, pause } = useInterval(1000, {
            controls: true,
            callback: this.intervalCalled,
        });
        this.counter = counter;
        this.counterRunning = isActive;
        this.resetCounter = reset;
        this.stopTimer = pause;
    },
};
</script>
<style scoped>
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
    gap: 20px;
}

.caster {
    min-height: 200px;
    --internal-padding: 10px;
    flex-grow: 1;
    padding: 0 var(--internal-padding);
    --theme-color: #2f2f30;
    position: relative;

    --caster-width: 810px;
    --caster-height: 570px;
    max-width: var(--caster-width);
    transition: max-width 0.4s ease, min-width 0.4s ease, padding 0.4s ease;
}

.caster-cam-box {
    background-color: var(--theme-color);
    border-bottom: 6px solid var(--theme-color);
    transition: background-color 300ms, border-bottom-color 300ms,
        height 0.5s ease;
    color: white;
    height: var(--caster-height);
    width: 100%;
    /*border-radius: 20px;*/
    overflow: hidden;
}
.caster-lower {
    position: absolute;
    bottom: 15px;
    min-height: 80px;
}
.caster-name {
    background-color: var(--theme-color);
    color: white;

    background-color: #fff;
    color: var(--theme-color);

    text-transform: uppercase;
    font-weight: bold;
    font-size: 32px;
    padding: 7px 20px;
    /*border-radius: 4px;*/
    line-height: 1;
    box-shadow: 0 0 4px 0 #00000080;
    flex-direction: column;
    transition: color 0.5s ease;
}

.c-twitter {
    font-size: 0.8em;
    margin-bottom: 0.15em;
}

.c-pronouns {
    font-size: 0.8em;
    margin-bottom: 0.15em;
}

.caster-cam-box {
    position: relative;
}
.caster-cam-wrapper {
    width: calc(var(--caster-height) * (16 / 9));
    height: 100%;
    position: absolute;
}

.caster-lower.cl-traditional {
    bottom: 4px;
    width: calc(100% - calc(var(--internal-padding) * 2));
    min-height: auto;
}
.caster:first-child .caster-lower.cl-traditional,
.caster:last-child .caster-lower.cl-traditional {
    width: calc(100% - var(--internal-padding));
}

.caster-lower.cl-traditional .caster-name {
    box-shadow: none;
    width: 100%;
    padding: 10px 15px;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
}

.caster-lower.cl-traditional .c-name,
.caster-lower.cl-traditional .c-twitter,
.caster-lower.cl-traditional .c-pronouns {
    text-align: center;
    margin: 0 20px;
}

.caster-lower.cl-traditional .c-pronouns {
    order: -1;
}

/*.caster-lower.cl-traditional .c-name { text-align: left; }*/
/*.caster-lower.cl-traditional .c-twitter { text-align: right; }*/

.caster-cam-box.align-right {
    justify-content: flex-end;
}
.caster-cam-box.align-left {
    justify-content: flex-start;
}
</style>
