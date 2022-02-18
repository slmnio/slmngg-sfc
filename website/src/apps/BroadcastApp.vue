<template>
    <div class="broadcast-app">
<!--        <div style="font-size: 5em; color: black">{{ $root.activeScene }}</div>-->
        <router-view id="overlay" :broadcast="broadcast" :client="client" :title="title" :top="top" :active="active" :animation-active="animationActive" />
        <v-style v-if="broadcast && broadcast.event">
            {{ broadcast.event.broadcast_css }}
        </v-style>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "BroadcastApp",
    props: ["id", "title", "top", "code", "client", "noAnimation"],
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
