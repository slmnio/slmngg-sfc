<template>
    <div class="caster-cam-wrapper flex-center">
        <iframe
            v-if="manualCamera ? useCam : (useCam || extendedIframeUse)"
            v-show="manualCamera || extendedIframeVisible"
            allow="autoplay;camera;microphone;fullscreen;picture-in-picture;display-capture;"
            :src="src"
            class="caster-frame"></iframe>
        <transition name="mid-split">
            <!--            <slot v-if="useCam ? !apiVisible : true">-->
            <div v-if="useCam ? !cameraIsOn : true" class="caster-bg flex-center" :style="{backgroundColor: color}">
                <div v-if="displayAvatar" class="caster-avatar" :class="{'event-fallback': displayAvatar?.eventFallback}" :style="displayAvatar"></div>
            </div>
            <!--            </slot>-->
        </transition>
    </div>
</template>

<script>
import { logoBackground, logoBackground1 } from "@/utils/theme-styles";
import { bg, resizedImage } from "@/utils/images";

export default {
    name: "CasterCam",
    props: ["guest", "disableVideo", "color", "extraParams", "fallbackAvatar", "event", "relayPrefix", "team", "hideIfNoCam"],
    data: () => ({
        iframe: null,
        apiVisible: false,
        // extend iframe timings so it hides under animations
        extendedIframeVisible: false,
        extendedIframeUse: false,
        testedAvatar: null,
        failed: []
    }),
    computed: {
        manualCamera() {
            return this.streamID?.includes("http");
        },
        cameraIsOn() {
            return this.manualCamera ? true : this.apiVisible;
        },
        useCam() {
            if (this.guest?.webcam?.includes("view=")) return true;
            if (this.disableVideo) return null;
            return this.guest?.use_cam || false;
        },
        streamID() {
            if (this.guest?.webcam) return this.guest.webcam;
            if (this.relayPrefix) return this.relayPrefix;
            return this.guest?.cam_code || this.guest?.discord_id || "";
        },
        streamCode() {
            if (this.streamID.includes("view=")) {
                const url = new URL(this.streamID);
                return url.searchParams.get("view");
            }
            return this.streamID;
        },
        src() {
            const vdoDomain = "https://webcam.slmn.gg";
            if (this.streamID.includes("http")) {
                // custom link
                return this.streamID + (this.extraParams || "");
            }
            return `${vdoDomain}/?view=${this.streamID}&${this.$root.defaults.camParams || "_"}&` + (this.extraParams || "");
        },
        themeAvatar() {
            return {
                ...logoBackground1(this.event),
                ...resizedImage(this.event?.theme, ["default_logo", "default_wordmark"], "h-200"),
                ...logoBackground(this.team?.theme),
                ...resizedImage(this.team?.theme, ["default_logo"], "h-200"),
                ...logoBackground(this.guest?.live_theme || this.guest?.theme),
                ...resizedImage(this.guest?.live_theme || this.guest?.theme, ["default_logo"], "h-200"),
                eventFallback: true
            };
        },
        displayAvatar() {
            return this.testedAvatar || this.themeAvatar;
        }
    },
    methods: {
        slowDisableCam() {
            this.apiVisible = false;
            setTimeout(() => {
                this.extendedIframeUse = false;
            }, 700);
        },
        async testImage(url) {
            if (this.failed.includes(url)) return null;
            try {
                const image = await fetch(url);
                if (!image.ok) this.failed.push(url);
                return image.ok ? url : null;
            } catch (e) {
                console.error(e);
            }
            return null;
        },
        async testAvatars() {
            if (!this.guest) this.testedAvatar = null;
            if (this.guest.avatar && await this.testImage(this.guest.avatar)) {
                this.testedAvatar = bg(this.guest.avatar);
            }
            if (this.fallbackAvatar && await this.testImage(this.fallbackAvatar)) {
                this.testedAvatar = bg(this.fallbackAvatar);
            }
        }
    },
    watch: {
        useCam(newCam, oldCam) {
            console.log({ newCam, oldCam });
            if (newCam) {
                this.extendedIframeUse = true;
            } else {
                this.slowDisableCam();
            }
        },
        cameraIsOn(isVisible) {
            this.$emit("cam_visible", isVisible);
            console.log("cam_visible", isVisible);
        },
        guest: {
            deep: true,
            immediate: true,
            handler() {
                this.testAvatars();
            }
        },
        fallbackAvatar: {
            immediate: true,
            handler() {
                this.testAvatars();
            }
        }
    },
    mounted() {
        window.addEventListener("message", (e) => {
            if (["vue-", "react-"].some(key => e.data?.source?.startsWith(key))) return;
            console.log("[global iframe]", e.data);
            const data = e.data;

            console.log("stream ID", this.streamCode, data.streamID);

            if (data.action === "new-video-track-added" && data.streamID === this.streamCode) {
                setTimeout(() => {
                    this.apiVisible = true;
                    this.extendedIframeVisible = true;
                }, 400);
                console.log("track added, loaded");
            }
            if (data.action === "end-view-connection" && data.value === this.streamCode) {
                this.slowDisableCam(); // we need it to stay open if they reconnect
                console.log("view dc, unloaded");
            }


            // if (data.action === "new-track-added" && data.value === true && data.streamID === this.streamID) {
            //     this.apiVisible = true;
            //     console.log("loaded!!");
            // }
        });
    }
};
</script>

<style scoped>
    iframe {
        border: none;
        width: 100%;
        height: 100%;
    }

    .mid-split-enter-active, .mid-split-leave-active {
        --x1: 0.39;
        --y1: 0.58;
        --x2: 0.57;
        --y2: 1;

        --originalCurve: cubic-bezier(var(--x1), var(--y1), var(--x2), var(--y2));

        /* Reversed values */
        --x1-r: calc(1 - var(--x2));
        --y1-r: calc(1 - var(--y2));
        --x2-r: calc(1 - var(--x1));
        --y2-r: calc(1 - var(--y1));

        --reversedCurve: cubic-bezier(var(--x1-r), var(--y1-r), var(--x2-r), var(--y2-r));
    }

    .mid-split-enter-active {
        overflow: hidden;
        max-width: 100%;
        transition: all 400ms var(--reversedCurve) 250ms !important;
    }
    .mid-split-leave-active {
        overflow: hidden;
        max-width: 100%;
        transition: all 400ms var(--originalCurve) 250ms !important;
    }
    .mid-split-enter-from, .mid-split-leave-to {
        /*clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);*/
        clip-path: polygon(0% 0%, 0% 100%, 0% 100%, 0% 0, 100% 0, 100% 100%, 100% 100%, 100% 0%);
    }
    .mid-split-enter-to, .mid-split-leave-from {
        /*clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);*/
        clip-path: polygon(0% 0%, 0% 100%, 50% 100%, 50% 0, 50% 0, 50% 100%, 100% 100%, 100% 0%);
    }


    .caster-bg {
        width: 100%;
        /*width: min(var(--caster-width), 100%);*/ /* I think OBS has a problem with this */
        height: 100%;
        position: absolute;
        top: 0;
        transition: background-color .5s ease;
    }
    .caster-avatar {
        width: calc(var(--caster-width) * 0.3);
        height: calc(var(--caster-width) * 0.3);
        position: absolute;
        border-radius: 50%;
        box-shadow: 0 0 8px 0 black;
        background-size: cover;
        background-position: center;
        transform: translate(0, -10%);
        transition: all .4s ease;
    }

    .caster-frame {
        --oversize: 5%;
        width: calc(100% + var(--oversize));
        height: calc(100% + var(--oversize));
        position: absolute;
        left: calc(var(--oversize) * -0.5);
        top: calc(var(--oversize) * -0.5);
    }
    .caster-cam-wrapper, .caster-bg {
        background-color: rgba(0,0,0,1);
    }
    .caster-avatar.event-fallback {
        background-size: 60%;
        background-repeat: no-repeat;
        background-position: center;
    }
</style>
