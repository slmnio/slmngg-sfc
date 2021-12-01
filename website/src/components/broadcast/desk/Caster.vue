<template>
    <div class="caster flex-center flex-column" :style="themeColor">
        <div class="caster-cam-box flex-center">
            <CasterCam class="caster-cam-wrapper" :guest="liveGuestData" :disableVideo="disableVideo" :color="color">
            </CasterCam>
        </div>
        <transition mode="out-in" name="fade">
            <div class="caster-lower flex-center" :key="`${name}-${twitter}`" v-if="name">
                <div class="caster-name flex-center flex-column">
                    <div class="c-name">{{ name }}</div>
                    <div class="c-twitter" v-if="twitter">
                        <!--                        <i class="fab fa-twitter fa-fw"></i> -->
                        {{ twitter }}</div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import CasterCam from "@/components/broadcast/desk/CasterCam";

export default {
    name: "Caster",
    props: ["caster", "guest", "color", "disableVideo"],
    components: { CasterCam },
    computed: {
        player() {
            return this.caster || this.guest.player;
        },
        twitter() {
            if (!this.player?.socials) return "";
            const twitter = this.player.socials.find(s => s.type === "Twitter");
            if (!twitter) return "";
            return twitter.name;
        },
        liveGuestData() {
            return this.caster?.live_guests || this.guest;
        },
        cam() {
            if (this.disableVideo) return false;
            if (!this.liveGuestData?.cam_code) return false;
            if (!this.liveGuestData.use_cam) return false;
            return this.liveGuestData.cam_code.includes("http") ? `${this.liveGuestData.cam_code}&z=04&mute` : `https://cams.prod.slmn.gg/?view=${this.liveGuestData.cam_code}&z=04&mute`;
        },
        name() {
            return this.caster?.name || this.guest?.name;
        },
        themeColor() {
            if (!this.color) return {};
            return {
                "--theme-color": this.color
            };
        }
    }
};
</script>

<style scoped>
    .caster {
        flex-grow: 1;
        padding: 0 10px;
        --theme-color: #2F2F30;
        position: relative;

        --caster-width: 800px;
        --caster-height: 570px;
        max-width: var(--caster-width);
        transition: max-width .4s ease;
    }

    .caster-cam-box {
        background-color: var(--theme-color);
        border-bottom: 6px solid var(--theme-color);
        transition: background-color 300ms, border-bottom-color 300ms;
        color: white;
        height: var(--caster-height);
        width: 100%;
        /*border-radius: 20px;*/
        overflow: hidden;
    }
    .caster-lower {
        position: absolute;
        bottom: 15px;
        min-height: 80px;
    }
    .caster-name {
        background-color: var(--theme-color);
        color: white;

        background-color: #fff;
        color: var(--theme-color);

        text-transform: uppercase;
        font-weight: bold;
        font-size: 32px;
        padding: 7px 20px;
        /*border-radius: 4px;*/
        line-height: 1;
        box-shadow: 0 0 4px 0 #00000080;
    }

    .c-twitter {
        font-size: 0.8em;
        margin-bottom: .15em;
    }
    .c-name {
        transform: translate(0, -.0925em);
    }

    .caster-cam-box {
        position: relative;
    }
    .caster-cam-wrapper {
        width: calc(var(--caster-height) * (16 / 9));
        height: 100%;
        position: absolute;
    }
</style>
