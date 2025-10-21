<template>
    <StingerWrap :theme="stingerThemeOverride && overrideTheme || broadcast.event && broadcast.event.theme" :active="active" :should-use="useBuiltInStingers" :text="stingerText">
        <div class="broadcast-app" :class="broadcastClass">
            <!--        <div style="font-size: 5em; color: black">{{ $root.activeScene }}</div>-->
            <router-view
                id="overlay"
                v-slot="{ Component }"
                :class="bodyClass"
                :broadcast="broadcast"
                :client="client"
                :title="title"
                :subtitle="subtitle"
                :top="top"
                :active="active"
                :animation-active="animationActive"
                :full="full"
                @prod-update="(x) => prodUpdate(x)">
                <component :is="Component" ref="overlay" />
            </router-view>

            <BroadcastBackground v-if="backgroundIndex" class="force-background" :broadcast="broadcast" :index="backgroundIndex" />

            <v-style v-if="broadcast && broadcast.event && !noBroadcastStyle">
                {{ broadcast.event.broadcast_css }}
                :root {
                --broadcast-transition-offset: {{ broadcast.transition_offset || 0 }}ms;
                }
            </v-style>
            <v-style v-if="broadcast && broadcast.broadcast_css && !noBroadcastStyle">
                {{ broadcast.broadcast_css }}
            </v-style>
        </div>
    </StingerWrap>
</template>

<script>
import { socket } from "@/socket";

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
    components: {
        BroadcastBackground,
        StingerWrap
    },
    props: ["id", "title", "subtitle", "top", "code", "client", "noAnimation", "noStinger", "bodyClass", "full", "clientName", "backgroundIndex", "stingerText", "stingerThemeOverride"],
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
            const broadcast = ReactiveRoot(this.id || `broadcast-${this.code}`, {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                theme_override: ReactiveThing("theme_override"),
                gfx: ReactiveArray("gfx"),
                other_broadcasts: ReactiveArray("other_broadcasts"),
                headlines: ReactiveArray("headlines"),
                highlight_media: ReactiveThing("highlight_media"),
                highlight_hero: ReactiveThing("highlight_hero")
            });
            if (broadcast?.event?.id && broadcast?.theme_override?.id) {
                return {
                    ...broadcast,
                    event: {
                        ...broadcast.event,
                        theme: broadcast.theme_override
                    }
                };
            }
            return broadcast;
        },
        overrideTheme() {
            return ReactiveRoot(this.stingerThemeOverride);
        },
        haltAnimations() {
            return this.noAnimation || (this.broadcast?.broadcast_settings || []).includes("No animations");
        },
        useBuiltInStingers() {
            console.log("use", this.noStinger, this.broadcast?.broadcast_settings, this.$refs.overlay);
            if (this.noStinger || this.$refs.overlay?.noStinger) return false;
            return (this.broadcast?.broadcast_settings || []).includes("Use built-in stingers");
        },
        noBroadcastStyle() {
            return this.$refs.overlay?.noBroadcastStyle;
        },
        sendingProdData() {
            const componentName = getComponentName(this.$router.currentRoute.value);
            return {
                clientName: this.clientName,
                component: componentName,
                path: this.$router.currentRoute.value.path,
                fullPath: this.$router.currentRoute.value.fullPath,
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
            if (socket) {
                this.lastProdData = data;
                socket.emit("prod-update", this.sendingProdData);
            }
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
        },
        sendingProdData: {
            deep: true,
            handler() {
                this.prodUpdate();
            }
        },
        broadcastKey(newCode) {
            socket.emit("prod-broadcast-join", newCode);
        }
    },
    sockets: {
        connect() {
            socket.emit("prod-broadcast-join", this.broadcastKey);
        },
        send_prod_update() {
            this.prodUpdate();
        },
        prod_button_reload() {
            document.location.reload();
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
            document.body.addEventListener("click", () => {
                this.active = !this.active;
            });
        }
        if (this.broadcastKey) {
            console.log("loading with broadcastKey");
            socket.emit("prod-broadcast-join", this.broadcastKey);
        }


        window.addEventListener("obsSourceActiveChanged", (e) => {
            this.isActive = e.detail.active;
        });
        window.addEventListener("obsSourceVisibleChanged", (e) => {
            this.isVisible = e.detail.visible;
        });
    },
    beforeCreate () {
        document.body.className = "overlay";
    }
};
</script>

<style>
    .broadcast-app, #overlay, body.overlay {
        overflow: hidden;
        font-family: "SLMN-Industry", "Industry", sans-serif;
        width: 100vw;
        height: 100vh;
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
        top: 0;
        left: 0;
    }
</style>
