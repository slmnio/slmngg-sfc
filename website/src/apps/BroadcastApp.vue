<template>
    <StingerWrap :theme="broadcast.event && broadcast.event.theme" :active="active" :should-use="useBuiltInStingers">
        <div class="broadcast-app" :class="broadcastClass">
            <!--        <div style="font-size: 5em; color: black">{{ $root.activeScene }}</div>-->
            <router-view id="overlay" :class="bodyClass" :broadcast="broadcast" :client="client" :title="title" :top="top" :active="active"
                         :animation-active="animationActive" :full="full" @prodUpdate="(x) => prodUpdate(x)" ref="overlay"/>

            <BroadcastBackground class="force-background" v-if="backgroundIndex" :broadcast="broadcast" :index="backgroundIndex" />

            <v-style v-if="broadcast && broadcast.event && !noBroadcastStyle">
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
import BroadcastBackground from "@/components/broadcast/BroadcastBackground.vue";

function getComponentName(route) {
    try {
        return route.matched[route.matched.length - 1]?.components?.default?.name;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export default {
    name: "BroadcastApp",
    props: ["id", "title", "top", "code", "client", "noAnimation", "noStinger", "bodyClass", "full", "clientName", "backgroundIndex"],
    components: {
        BroadcastBackground,
        StingerWrap
    },
    data: () => ({
        active: false,
        animationActive: true,
        obs: null,
        lastProdData: null,
        isActive: null,
        isVisible: null
    }),
    computed: {
        broadcastClass() {
            const classes = [];
            if (this.noAnimation) classes.push("broadcast--no-anim");
            if (this.active) classes.push("broadcast--active");
            if (this.animationActive) classes.push("broadcast--animation-active");

            return classes.join(" ");
        },
        broadcast() {
            return ReactiveRoot(this.id || `broadcast-${this.code}`, {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                other_broadcasts: ReactiveArray("other_broadcasts"),
                headlines: ReactiveArray("headlines"),
                highlight_media: ReactiveThing("highlight_media"),
                highlight_hero: ReactiveThing("highlight_hero")
            });
        },
        haltAnimations() {
            return this.noAnimation || (this.broadcast?.broadcast_settings || []).includes("No animations");
        },
        useBuiltInStingers() {
            // console.log("use", this.noStinger, this.broadcast?.broadcast_settings);
            if (this.noStinger || this.$refs.overlay?.noStinger) return false;
            return (this.broadcast?.broadcast_settings || []).includes("Use built-in stingers");
        },
        noBroadcastStyle() {
            return this.$refs.overlay?.noBroadcastStyle;
        },
        sendingProdData() {
            const componentName = getComponentName(this.$router.currentRoute);
            return {
                clientName: this.clientName,
                component: componentName,
                path: this.$router.currentRoute.path,
                fullPath: this.$router.currentRoute.fullPath,
                active: this.isActive,
                visible: this.isVisible,
                data: {
                    ...this.$refs.overlay?.prodData,
                    ...this.lastProdData
                }
            };
        },
        broadcastKey() {
            return this.code || this.broadcast?.key;
        }
    },
    methods: {
        prodUpdate(data) {
            if (this.$socket?.client) {
                this.lastProdData = data;
                this.$socket.client.emit("prod-update", this.sendingProdData);
            }
        }
    },
    mounted () {
        console.log("overlay app mounted", this.id);
        this.prodUpdate();

        if (this.haltAnimations) {
            this.active = true;
        } else {
            window.addEventListener("obsSourceActiveChanged", (e) => {
                this.active = e.detail.active;
            });
            // document.body.addEventListener("click", () => {
            //     this.active = !this.active;
            // });
        }
        if (this.broadcastKey) {
            console.log("loading with broadcastKey");
            this.$socket.client.emit("prod-broadcast-join", this.broadcastKey);
        }


        window.addEventListener("obsSourceActiveChanged", (e) => {
            this.isActive = e.detail.active;
        });
        window.addEventListener("obsSourceVisibleChanged", (e) => {
            this.isVisible = e.detail.visible;
        });
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
        },
        sendingProdData: {
            deep: true,
            handler() {
                this.prodUpdate();
            }
        },
        broadcastKey(newCode) {
            console.log(newCode);
            this.$socket.client.emit("prod-broadcast-join", newCode);
        }
    },
    beforeCreate () {
        document.body.className = "overlay";
    },
    sockets: {
        send_prod_update() {
            if (!this.lastProdData) this.prodUpdate();
        },
        prod_button_reload() {
            document.location.reload();
        }
    }
};
</script>

<style>
    .broadcast-app, #overlay, body.overlay {
        overflow: hidden;
        font-family: "SLMN-Industry", "Industry", sans-serif;
    }
    body.overlay #slmngg-app {
        padding-bottom: 0 !important;
    }
    body.overlay {
        --overlay-line-height-adjust: translate(0, -0.0925em);
    }
</style>
<style scoped>
    .force-background {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: -1;
    }
</style>
