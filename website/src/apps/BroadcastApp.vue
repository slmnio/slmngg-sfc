<template>
    <StingerWrap :theme="broadcast.event && broadcast.event.theme" :active="active" :should-use="useBuiltInStingers">
        <div class="broadcast-app"
             :class="{'broadcast--no-anim': noAnimation, 'broadcast--active': active, 'broadcast--animation-active': animationActive}">
            <!--        <div style="font-size: 5em; color: black">{{ $root.activeScene }}</div>-->
            <router-view id="overlay" :broadcast="broadcast" :client="client" :title="title" :top="top" :active="active"
                         :animation-active="animationActive"/>
            <v-style v-if="broadcast && broadcast.event">
                {{ broadcast.event.broadcast_css }}

                :root {
                --broadcast-transition-offset: {{ broadcast.transition_offset || 0 }}ms;
                }
            </v-style>
        </div>
    </StingerWrap>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import StingerWrap from "@/components/broadcast/StingerWrap";

export default {
    name: "BroadcastApp",
    props: ["id", "title", "top", "code", "client", "noAnimation", "noStinger"],
    components: {
        StingerWrap
    },
    data: () => ({
        active: false,
        animationActive: true,
        obs: null
    }),
    computed: {
        broadcast() {
            return ReactiveRoot(this.id || `broadcast-${this.code}`, {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                other_broadcasts: ReactiveArray("other_broadcasts"),
                headlines: ReactiveArray("headlines"),
                highlight_media: ReactiveThing("highlight_media")
            });
        },
        haltAnimations() {
            return this.noAnimation || (this.broadcast?.broadcast_settings || []).includes("No animations");
        },
        useBuiltInStingers() {
            console.log("use", this.noStinger, this.broadcast?.broadcast_settings);
            if (this.noStinger) return false;
            return (this.broadcast?.broadcast_settings || []).includes("Use built-in stingers");
        }
    },
    mounted () {
        console.log("overlay app mounted", this.id);

        if (this.haltAnimations) {
            this.active = true;
        } else {
            window.addEventListener("obsSourceActiveChanged", (e) => {
                this.active = e.detail.active;
            });
            document.body.addEventListener("click", () => {
                this.active = !this.active;
            });
        }
    },
    watch: {
        active(isActive) {
            if (this.haltAnimations) return;

            window.obsstudio?.getCurrentScene((scene) => {
                this.$root.activeScene = scene;
            });

            if (isActive) {
                this.animationActive = false;
                this.$root.animationActive = false;

                setTimeout(() => {
                    requestAnimationFrame(() => {
                        this.animationActive = true;
                        this.$root.animationActive = true;
                    });
                }, this.broadcast?.transition_offset || 0);
            }
        },
        broadcast() {
            this.$root.broadcast = this.broadcast;
        }
    },
    beforeCreate () {
        document.body.className = "overlay";
    }
};
</script>

<style>
    .broadcast-app, #overlay, body.overlay {
        overflow: hidden;
    }
    body.overlay #slmngg-app {
        padding-bottom: 0 !important;
    }
</style>
