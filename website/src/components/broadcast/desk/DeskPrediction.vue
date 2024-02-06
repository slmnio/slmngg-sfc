<template>
    <div class="desk-guest-pred flex-center h-100">
        <div class="name" :style="eventTheme">
            <div class="industry-align">{{ guest.name }}</div>
        </div>
        <div class="desk-pred-holder">
            <transition name="pred-reveal">
                <div class="desk-prediction flex-center" :style="theme" :key="autoKey">
                    <div class="team" :class="{'event': !hasPredicted}" :style="logo"></div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import { logoBackground } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";

export default {
    name: "DeskPrediction",
    props: {
        guest: { required: true },
        event: { required: true }
    },
    computed: {
        hasPredicted() {
            return this.guest?.prediction_team?.id;
        },
        autoKey() {
            if (this.hasPredicted) {
                return this.guest.prediction_team.id;
            } else {
                return this.event.id;
            }
        },
        theme() {
            if (this.hasPredicted) {
                return logoBackground(this.guest.prediction_team.theme);
            }
            return {
                borderColor: this.event?.theme?.color_theme || this.event?.theme?.color_logo_background
            };
        },
        logo() {
            if (this.hasPredicted) {
                return resizedImage(this.guest.prediction_team.theme, ["default_logo", "small_logo"], "h-100");
            } else {
                return resizedImage(this.event.theme, ["default_logo", "small_logo"], "h-100");
            }
        },
        eventTheme() {
            return logoBackground(this.event.theme);
        }
    }
};
</script>

<style scoped>
    .desk-guest-pred {
        flex-direction: column;
        margin: 0 10px;
        max-width: 275px;
        flex-grow: 1;
        width: 100%;
    }
    .desk-pred-holder {
        position: relative;
        width: 100%;
        /*height: 100%;*/
        flex-grow: 1;
        flex-direction: column;
    }
    .desk-prediction {
        height: 100%;
        width: 100%;
        border-bottom: 6px solid transparent;
        flex-direction: column;
        background-color: white;
    }


    .team {
        width: 80%;
        flex-grow: 1;
        height: 100%;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        margin: 15px;
    }
    .team.event {
        opacity: 0.8;
    }

    .name {
        font-size: 1.75em;
        font-weight: bold;
        text-transform: uppercase;
        width: 100%;
        text-align: center;
        padding: 2px 0;
    }

    .pred-reveal-enter-active, .pred-reveal-leave-active { transition: clip-path 300ms ease; overflow: hidden; position: absolute; }
    /*.pred-reveal-enter-active {*/
    /*    transition-delay: 100ms*/
    /*}*/
    /*.pred-reveal-enter-from { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); !* closed right *! }*/
    /*.pred-reveal-leave-to { clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%); !* closed left *! }*/
    .pred-reveal-enter-from { clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%) /* closed bottom */ }
    .pred-reveal-leave-to { clip-path: polygon(0 0, 100% 0%, 100% 0%, 0% 0%) /* closed top */ }
    .pred-reveal-enter-to, .pred-reveal-leave-from { clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); /* open */ }
</style>
