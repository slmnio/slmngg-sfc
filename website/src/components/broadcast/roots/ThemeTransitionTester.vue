<template>
    <div class="theme-transition-tester">
        <div class="lower-third-area flex-column">
            <div><ThemeTransition class="lower-third" :active="active" :theme="theme" start="left" end="left"
                                  start-inner-full="true" :duration="500" :inner-delay="250" :trigger-duration="1000" :trigger="true">
                <div class="lower-third-text">Signups open now! (inner start)</div>
            </ThemeTransition></div>

            <div><ThemeTransition class="lower-third" :active="active" :theme="theme">
                <div class="lower-third-text">Signups open now! (R)</div>
            </ThemeTransition></div>
            <div><ThemeTransition class="lower-third" :active="active" :theme="theme" left="true">
                <div class="lower-third-text">Signups open now! (L)</div>
            </ThemeTransition></div>
            <div><ThemeTransition class="lower-third" :active="active" :theme="theme" start="middle" end="middle">
                <div class="lower-third-text">Middle split!</div>
            </ThemeTransition></div>

            <div class="box">
                <div>squeeze:</div>
                <Squeezable>
                    <div class="box-text">hiii it's inner text</div>
                </Squeezable>
            </div>

        </div>
    </div>
</template>

<script>
import ThemeTransition from "@/components/broadcast/ThemeTransition";
import Squeezable from "@/components/broadcast/Squeezable.vue";
export default {
    name: "ThemeTransitionTester",
    components: { Squeezable, ThemeTransition },
    props: ["broadcast", "active"],
    data: () => ({
        noStinger: true
    }),
    computed: {
        theme() {
            return this.broadcast?.event?.theme;
        }
    }
};
</script>

<style scoped>
    .theme-transition-tester {
        height: 100vh;
    }
    .lower-third-area {
        position: absolute;
        bottom: 5%;
        left: 5%;
    }
    .lower-third-area:deep(.lower-third-text) {
        font-size: 3em;
        padding: 0.25em .5em;
    }
    .lower-third-area div {
        width: fit-content;
    }

    .box {
        display: flex;
        border: 1px solid;
        width: 10em !important;
        font-size: 2em;
    }

</style>
