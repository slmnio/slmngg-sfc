<template>
    <div class="broadcast-app">
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
    props: ["id", "title", "top", "code", "client"],
    data: () => ({
        active: false,
        animationActive: true
    }),
    computed: {
        broadcast() {
            return ReactiveRoot(this.id || `broadcast-${this.code}`, {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                other_broadcasts: ReactiveArray("other_broadcasts"),
                headlines: ReactiveArray("headlines")
            });
        }
    },
    mounted () {
        console.log("overlay app mounted", this.id);
        // let css = document.createElement('style');;
        // css.innerText = this.event.
        window.addEventListener("obsSourceActiveChanged", (e) => {
            this.active = e.detail.active;
        });

        document.body.addEventListener("click", () => {
            this.active = !this.active;
        });
    },
    watch: {
        active(isActive) {
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
