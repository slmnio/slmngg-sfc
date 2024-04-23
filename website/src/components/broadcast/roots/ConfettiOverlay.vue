<template>
    <div></div>
</template>
<script>
import VueConfetti from "vue-confetti";
import { ReactiveRoot } from "@/utils/reactive";
import Vue from "vue";
Vue.use(VueConfetti);

export default {
    props: ["themeId", "theme"],
    name: "ConfettiOverlay",
    data: () => ({
        confettiStarted: false,
        confettiDisabled: false,
        noStinger: true,
        prodData: {
            minor: true
        }
    }),
    beforeUnmount() {
        this.stopConfetti();
    },
    methods: {
        startOrUpdateConfetti() {
            if (this.confettiDisabled) return;
            if (!this.confettiStarted) {
                console.log("start confetti");
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
        },
        stopConfetti() {
            console.log("stopping confetti");
            this.confettiStarted = false;
            this.$confetti.stop();
        }
    },
    watch: {
        confettiColors: {
            handler() {
                console.log("confetti color change", this.confettiColors);
                if (this.confettiColors.length === 0) return this.stopConfetti();
                this.startOrUpdateConfetti();
            },
            immediate: true,
            deep: true
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
            this.stopConfetti();
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
