<template>
    <div class="theme-transition-tester">
        <div class="lower-third-area">
            <ThemeTransition class="lower-third" :active="active" :theme="theme">
                <div class="lower-third-text">Signups open now!</div>
            </ThemeTransition>
            <ThemeTransition class="lower-third" :active="active" :theme="theme" left="true">
                <div class="lower-third-text">Signups open now!</div>
            </ThemeTransition>
        </div>
    </div>
</template>

<script>
import ThemeTransition from "@/components/broadcast/ThemeTransition";
export default {
    name: "ThemeTransitionTester",
    components: { ThemeTransition },
    props: ["broadcast", "active"],
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
    .lower-third-area >>> .lower-third-text {
        font-size: 3em;
        padding: 0.25em .5em;
    }
</style>
