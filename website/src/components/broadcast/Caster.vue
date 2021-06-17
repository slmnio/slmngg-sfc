<template>
    <div class="caster flex-center flex-column" >
        <div class="caster-cam-box flex-center">
            <transition mode="out-in" name="fade">
                <div class="caster-cam-wrapper" v-if="cam">
                    <iframe class="caster-frame" :src="cam"></iframe>
                </div>
            </transition>
            <transition mode="out-in" name="fade">
                <div class="caster-bg flex-center" v-if="!cam">
                    <div class="caster-avatar" :style="avatar"></div>
                </div>
            </transition>
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
export default {
    name: "Caster",
    props: ["caster", "guest"],
    computed: {
        player() {
            return this.caster || this.guest.player;
        },
        twitter() {
            if (!this.player.socials) return "";
            const twitter = this.player.socials.find(s => s.type === "Twitter");
            if (!twitter) return "";
            return twitter.name;
        },
        liveGuestData() {
            return this.caster?.live_guests || this.guest;
        },
        cam() {
            console.log(this.liveGuestData);
            if (!this.liveGuestData) return false;
            if (!this.liveGuestData.use_cam) return false;
            return this.liveGuestData.cam_code.includes("http") ? `${this.liveGuestData.cam_code}&z=04&mute` : `https://feeds.production.slmn.io/?view=${this.liveGuestData.cam_code}&z=04&mute`;
        },
        avatar() {
            if (!this.liveGuestData) return {};
            return { backgroundImage: `url(${this.liveGuestData.avatar})` };
        },
        name() {
            return this.caster?.name || this.guest?.name;
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
    }

    .caster:nth-child(3n-2) { --theme-color: #2644F7; }
    .caster:nth-child(3n-1) { --theme-color: #00af75; }
    .caster:nth-child(3n) { --theme-color: #1E555C; }

    .caster-cam-box {
        background-color: var(--theme-color);
        border-bottom: 6px solid var(--theme-color);
        color: white;
        height: var(--caster-height);
        width: 100%;
        border-radius: 20px;
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
        border-radius: 10px;
        line-height: 1;
    }

    .c-twitter {
        font-size: 0.8em;
        margin-bottom: .15em;
    }
    .c-name {
        transform: translate(0, -.0925em);
    }

    iframe {
        border: none;
        width: 100%;
        height: 100%;
    }
    .caster-cam-box {
        position: relative;
    }
    .caster-cam-wrapper {
        width: calc(var(--caster-height) * (16 / 9));
        height: 100%;
        position: absolute;
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
        background-color: rgba(0,0,0,0.5);
    }
    .caster-bg {
        width: 100%;
        height: 100%;
    }
    .caster-avatar {
        width: calc(var(--caster-width) * 0.3);
        height: calc(var(--caster-width) * 0.3);
        position: absolute;
        border-radius: 50%;
        box-shadow: 0 0 8px 0 black;
        background-size: cover;
        transform: translate(0, -10%)
    }
</style>
