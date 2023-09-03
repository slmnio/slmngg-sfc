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
        noStinger: true,
        prodData: {
            minor: true
        }
    }),
    watch: {
        confettiColors: {
            handler() {
                if (this.confettiColors.length === 0) return;
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
                [this.themeData?.color_theme, this.themeData?.color_logo_background, this.themeData?.color_logo_accent]
                    .filter(
                        Boolean
                    )));
        }
    },
    metaInfo() {
        return {
            title: `Confetti | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>

</style>
