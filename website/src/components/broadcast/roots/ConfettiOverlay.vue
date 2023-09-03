<template>
    <div></div>
</template>
<script>
import VueConfetti from "vue-confetti";
import { ReactiveRoot } from "@/utils/reactive";
import Vue from "vue";
Vue.use(VueConfetti);

export default {
    props: ["themeId", "theme", "active", "animationActive"],
    name: "ConfettiOverlay",
    data: () => ({
        confettiStarted: false,
        confettiDisabled: false,
        noStinger: true,
        prodData: {
            minor: true
        }
    }),
    methods: {
        startOrUpdateConfetti() {
            if (this.confettiDisabled) return;
            console.log("start confetti");
            if (!this.confettiStarted) {
                this.$confetti.start({
                    particles: [
                        {
                            type: "circle"
                        }
                    ],
                    defaultColors: this.confettiColors
                });
                this.confettiStarted = true;
            } else {
                this.$confetti.update({
                    particles: [
                        {
                            type: "circle"
                        }
                    ],
                    defaultColors: this.confettiColors
                });
            }
        }
    },
    watch: {
        confettiColors: {
            handler() {
                if (this.confettiColors.length === 0) return;
                this.startOrUpdateConfetti();
            },
            immediate: true
        },
        animationActive: {
            handler(isActive) {
                console.log("active", isActive);
                if (!isActive) return;
                if (this.confettiColors.length === 0) return;
                this.startOrUpdateConfetti();
            },
            immediate: true
        }
    },
    computed: {
        themeData() {
            return this.theme || ReactiveRoot(this.themeId);
        },
        confettiColors() {
            return Array.from(new Set(
                [
                    this.themeData?.color_theme,
                    this.themeData?.color_logo_background,
                    this.themeData?.color_logo_accent,
                    this.themeData?.color_accent,
                    this.themeData?.color_alt
                ].filter(Boolean))
            );
        }
    },
    metaInfo() {
        return {
            title: `Confetti | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    },
    sockets: {
        stop_confetti() {
            console.log("confetti stop");
            this.confettiStarted = false;
            this.$confetti.stop();
        },
        disable_confetti() {
            this.confettiDisabled = true;
        },
        enable_confetti() {
            this.confettiDisabled = false;
        }
    }
};
</script>

<style scoped>

</style>
