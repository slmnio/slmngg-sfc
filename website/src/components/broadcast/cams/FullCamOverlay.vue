<template>
    <div class="full-cam-overlay" :class="{'show-name': showName, 'show-socials': showSocials}" :style="defaultStyles">
        <Caster class="full-cam-caster w-100 h-100" v-if="cam" :guest="cam" :event="event"></Caster>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import Caster from "@/components/broadcast/desk/Caster";

export default {
    name: "FullCamOverlay",
    props: ["broadcast", "number", "showName", "showSocials"],
    components: { Caster },
    computed: {
        cams() {
            if (!this.broadcast?.full_cams) return [];
            return ReactiveArray("full_cams", {
                player: ReactiveThing("player", {
                    socials: ReactiveArray("socials")
                })
            })(this.broadcast);
        },
        cam() {
            if (this.number > this.cams.length) return null;
            return this.cams[this.number - 1];
        },
        event() {
            return this.broadcast?.event || null;
        },
        defaultStyles() {
            if (!this.event?.theme?.color_theme) return {};
            return {
                "--event": this.event.theme.color_theme
            };
        }
    },
    metaInfo() {
        return {
            title: `Full Cam #${this.number} | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .full-cam-overlay {
        width: 100vw;
        height: 100vh;
    }
    .full-cam-caster {
        --caster-width: 100vw;
        --caster-height: 100vh;
        padding: 0 !important;
    }

    .full-cam-caster >>> .caster-lower {
        width: 100% !important;
        bottom: 0 !important;
    }
    .full-cam-caster >>> .caster-cam-box {
        border-bottom: none;
    }
    .full-cam-caster >>> .caster-name {
        font-size: 5vh;
        padding: .25em .5em !important;
    }

    .full-cam-overlay:not(.show-name) >>> .caster-lower,
    .full-cam-overlay:not(.show-socials) >>> .c-twitter {
        display: none !important;
    }
    .full-cam-overlay:not(.show-name) >>> .caster-avatar {
        transform: translate(0, 0);
    }
    .full-cam-overlay >>> .caster-cam-wrapper,
    .full-cam-overlay >>> .caster-bg {
        background-color: var(--event) !important;
    }
</style>
