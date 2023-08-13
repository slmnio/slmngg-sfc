<template>
    <div class="caster flex-center flex-column" :style="themeColor">
        <div class="caster-cam-box flex-center" :style="{borderColor}" :class="align">
            <CasterCam class="caster-cam-wrapper" :guest="liveGuestData" :disableVideo="disableVideo" :color="color"
            :event="event" />
        </div>
        <transition name="fade">
            <div class="caster-lower flex-center" :key="`${name}-${twitter}-${lowerType}`" :class="{'cl-traditional': lowerType === 'traditional'}">
                <div class="caster-name flex-center">
                    <div class="c-name industry-align">{{ name }}</div>
                    <div class="c-twitter industry-align" v-if="twitter">{{ twitter }}</div>
                    <div class="c-pronouns industry-align" v-if="pronouns && showPronouns && !pronounsOnNewline">{{ pronouns }}</div>
                    <div class="c-pronouns industry-align" v-if="pronouns && showPronouns && pronounsOnNewline" v-html="breakUp(pronouns)"></div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import CasterCam from "@/components/broadcast/desk/CasterCam";

export default {
    name: "Caster",
    props: ["caster", "guest", "color", "disableVideo", "event", "showPronouns", "pronounsOnNewline"],
    components: { CasterCam },
    computed: {
        align() {
            const alignSettings = (this.guest.align || []);
            const aligns = [];
            if (alignSettings.indexOf("Right") !== -1) aligns.push("align-right");
            if (alignSettings.indexOf("Left") !== -1) aligns.push("align-left");
            return aligns;
        },
        borderColor() {
            const theme = this.event?.theme;
            if (!theme) return;
            const desk = (theme.desk_colors || "").trim().split(/[\n,]/g).filter(col => col);
            console.log({ desk, theme, default: (theme.color_logo_background ? theme.color_logo_accent : theme.color_text_on_theme) || theme.color_alt });
            if (!desk?.length) {
                // no desk set, this.color is default
                return (theme.color_logo_background ? theme.color_logo_accent : theme.color_text_on_theme) || theme.color_alt;
            }

            return this.color;
        },
        player() {
            return this.caster || this.guest.player;
        },
        pronouns() {
            return this.player?.pronouns || this.guest?.pronouns;
        },
        twitter() {
            if (this.guest?.manual && this.guest?.twitter) return this.guest?.twitter;
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
        },
        lowerType() {
            if ((this.$root.broadcast?.broadcast_settings || []).includes("Cams lower: traditional")) return "traditional";
            return "normal";
        }
    },
    methods: {
        breakUp(text) {
            if (!text) return null;
            return text.split("/").join("<br>");
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

        --caster-width: 810px;
        --caster-height: 570px;
        max-width: var(--caster-width);
        transition: max-width .4s ease, min-width .4s ease;
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
        flex-direction: column;
        transition: color .5s ease;
    }

    .c-twitter {
        font-size: 0.8em;
        margin-bottom: .15em;
    }

    .c-pronouns {
        font-size: 0.8em;
        margin-bottom: .15em;
    }

    .caster-cam-box {
        position: relative;
    }
    .caster-cam-wrapper {
        width: calc(var(--caster-height) * (16 / 9));
        height: 100%;
        position: absolute;
    }

    .caster-lower.cl-traditional {
        bottom: 4px;
        width: calc(100% - 20px);
        min-height: auto;
    }
    .caster:first-child .caster-lower.cl-traditional,
    .caster:last-child .caster-lower.cl-traditional {
        width: calc(100% - 10px);
    }

    .caster-lower.cl-traditional .caster-name {
        box-shadow: none;
        width: 100%;
        padding: 10px 15px;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
    }


    .caster-lower.cl-traditional .c-name,
    .caster-lower.cl-traditional .c-twitter,
    .caster-lower.cl-traditional .c-pronouns {
        text-align: center;
        margin: 0 20px;
    }

    .caster-lower.cl-traditional .c-pronouns {
        order: -1;
    }

    /*.caster-lower.cl-traditional .c-name { text-align: left; }*/
    /*.caster-lower.cl-traditional .c-twitter { text-align: right; }*/

    .caster-cam-box.align-right { justify-content: flex-end; }
    .caster-cam-box.align-left { justify-content: flex-start; }
</style>
