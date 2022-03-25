<template>
    <div class="desk-graphics-overlay">
        <BroadcastBackground class="pos-overlay bg" :broadcast="broadcast" />
        <ThemeTransition :duration="400" :inner-delay="150" class="pos-overlay stinger-transition" :active="stingerActive" :theme="theme" :border-width="0" start="right" end="right">
            <div class="stinger w-100 h-100">
                <theme-logo class="stinger-event-logo w-100 h-100" :theme="theme" logo-size="w-1080" border-width="0" icon-padding="200px" />
            </div>
        </ThemeTransition>
        <div class="desk-graphics-display">
            <transition name="dg" mode="out-in" :duration="1000" @enter="() => sting(false)" @leave="() => sting(true)">
                <div class="desk-graphics-part desk-graphics-sponsors" key="Sponsors"
                     v-if="show === 'Sponsors'">
                    <Sponsors class="h-100 w-100" :sponsors="sponsors" size="h-1080" mode="out-in"></Sponsors>
                </div>
                <div class="desk-graphics-part desk-graphics-event-logo" key="Event Logo" v-if="show === 'Event Logo'">
                    <theme-logo class="event-logo w-100 h-100" :theme="theme" logo-size="w-1080" border-width="0" icon-padding="200px" />
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import BroadcastBackground from "@/components/broadcast/BroadcastBackground";
import Sponsors from "@/components/broadcast/Sponsors";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import ThemeTransition from "@/components/broadcast/ThemeTransition";
import ThemeLogo from "@/components/website/ThemeLogo";
export default {
    name: "DeskGraphicsOverlay",
    components: { ThemeTransition, Sponsors, BroadcastBackground, ThemeLogo },
    props: ["broadcast"],
    data: () => ({
        stingerActive: false
    }),
    computed: {
        broadcastData() {
            if (!this.broadcast?.id) return {};
            return ReactiveRoot(this.broadcast.id, {
                desk_graphics_sponsors: ReactiveArray("desk_graphics_sponsors"),
                sponsors: ReactiveArray("sponsors"),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        theme() {
            return this.broadcastData?.event?.theme;
        },
        show() {
            return this.broadcast?.desk_graphics_display || "Sponsors";
        },
        sponsors() {
            return this.broadcastData?.desk_graphics_sponsors || this.broadcastData?.sponsors;
        }
    },
    methods: {
        sting(shouldSting) {
            this.stingerActive = shouldSting;
        }
    }
};
</script>

<style scoped>
    .desk-graphics-overlay {
        width: 100vw;
        height: 100vh;
    }
    .desk-graphics-display, .desk-graphics-part {
        width: 100%;
        height: 100%;
    }
    .pos-overlay {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        left: 0;
    }
    .bg { z-index: -1 }
    .stinger-transition { z-index: 1000; }

    .desk-graphics-sponsors >>> .sponsors-holder { height: 100%; }
    .desk-graphics-sponsors >>> .break-sponsor, .event-logo { background-color: transparent !important; }
    .desk-graphics-sponsors >>> .break-sponsors { padding: 5% !important; }

    .stinger-event-logo {
        animation: zoom 1.5s forwards;
    }

    @keyframes zoom {
        0% { transform: scale(0.75); }
        100% { transform: scale(1); }
    }
</style>
