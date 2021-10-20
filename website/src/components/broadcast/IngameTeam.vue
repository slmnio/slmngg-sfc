<template>
<!--    <transition name="ingame-team-anim">-->
        <div class="ingame-team-holder" v-if="loaded" v-bind:class="{'right': right, 'left': !right}">
            <div class="ingame-team default-thing" :style="style" :key="team.id">
                <div class="flex-center team-small-text" v-if="team.small_overlay_text">
                    <span class="industry-align">{{ team.small_overlay_text }}</span>
                </div>
                <div class="flex-center team-name">
                    <span class="industry-align team-sub-name" v-if="!codes">{{ team.name }}</span>
                    <span class="industry-align team-sub-subtitle" v-if="!codes && team.subtitle">{{ team.subtitle }}</span>
                    <span class="industry-align team-sub-code" v-if="codes">{{ team.code }}</span>
                </div>
                <div class="flex-center team-logo-holder flex-center" v-if="teamLogo">
                    <div class="team-logo bg-center" :style="teamLogo"></div>
                </div>
                <transition name="score">
                    <div class="flex-center team-score" v-if="!hideScores">
                        <span class="industry-align">{{ score || '0' }}</span>
                    </div>
                </transition>
                <div class="team-alt-slice" :style="teamSlice"></div>
            </div>
        </div>
<!--    </transition>-->
</template>

<script>
import { cssImage } from "@/utils/content-utils";

export default {
    name: "IngameTeam",
    props: ["team", "right", "score", "hideScores", "width", "codes"],
    computed: {
        loaded() {
            if (this.team.theme === undefined && this.team.has_theme === 0) return true;
            return this.team && this.team.theme && !this.team.theme.__loading;
        },
        style() {
            if (!this.team.theme) return {};
            return {
                backgroundColor: this.team.theme.color_logo_background || this.team.theme.color_theme,
                color: this.team.theme.color_text_on_logo_background || this.team.theme.color_text_on_theme,
                ...this.teamWidthCSS
            };
        },
        teamSlice() {
            if (!this.team.theme) return {};
            return {
                backgroundColor: this.team.theme.color_accent || this.team.theme.color_logo_accent || this.team.theme.color_theme
            };
        },
        teamLogo() {
            const i = cssImage("backgroundImage", this.team.theme, ["small_logo", "default_logo"], 70);
            if (!i.backgroundImage) return null;
            return i;
        },
        teamWidth() {
            return this.width || 690;
        },
        teamWidthCSS() {
            if (!this.teamWidth) return {};
            return { width: `${this.teamWidth}px` };
        }
    },
    watch: {
        style() {
            if (this.$el && this.$el.querySelector) {
                console.log("tick", this.$el.querySelector(".team-name"));
            }
        },
        loaded() {
            console.log("load", this.loaded);
        },
        team() {
            if (this.$el && this.$el.querySelector) {
                console.log("team watch");
                updateWidth(this.$el, this.teamWidth);
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            if (this.$el && this.$el.querySelector) {
                console.log("mount - tick");
                updateWidth(this.$el, this.teamWidth);
            }
        });
    }
};

function updateWidth(vueEl, fullWidth) {
    const holder = vueEl.querySelector(".team-name");
    const bigHolder = vueEl.querySelector(".ingame-team");
    const span = holder.querySelector("span");
    console.log(vueEl.getBoundingClientRect());

    // console.log(holder, internal, span);

    // const el = vueEl.querySelector(".team-name");
    // const text = el.children[0]; // target the .team-name > span.industry-align for width checking

    holder.style.transform = "none";
    // holder.style.width = "auto";
    requestAnimationFrame(() => {
        let diff = 0;
        [...bigHolder.children].map(el => {
            if (["team-name"].some(cl => el.classList.contains(cl))) return;
            console.log(el);
            diff += el.getBoundingClientRect().width;
        });
        diff += 32; // extra padding

        // const target = 530 - (smallText);
        const target = fullWidth - diff;
        // const target = 0;
        const width = span.getBoundingClientRect().width;
        console.log(diff, target, width);

        if (width > target) {
            const scale = target / width;
            holder.style.transform = `scaleX(${scale})`;
            holder.style.setProperty("--scaleX", scale);
            // holder.style.width = `${scale * 100}%`;
        }
    });
}

</script>

<style scoped>
    .ingame-team {
        width: 690px;
        height: 48px;

        display: flex;
    }
    .ingame-team-holder {
        position: absolute;
        overflow: hidden;
        top: 12px;
        display: flex;
        justify-content: flex-end;
    }
    .ingame-team-holder.right {
        right: 0;
        justify-content: flex-start;
    }


    .ingame-team-holder.right .ingame-team {
        flex-direction: row-reverse;
    }

    .team-name {
        flex-grow: 1;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 32px;

        display: flex;
        justify-content: flex-end;

        /*padding: 0 20px;*/
        transform-origin: right;

        /*min-width: 572px;*/
        width: 0;
    }
    .team-name span, .team-name {
        white-space: nowrap;
        /*overflow: hidden;*/
        /*text-overflow: ellipsis;*/
    }
    .team-name.squish {
        transition: transform .2s ease;
        --scale: 0.9;

        transform: scaleX(var(--scale));
        width: calc(100% * var(--scale));
    }

    .team-alt-slice {
        width: 6px;
        height: 100%;
        display: flex;
        flex-shrink: 0;
    }

    .ingame-team-holder.right .team-name {
        justify-content: flex-start;
        transform-origin: left;
    }

    .team-small-text {
        font-size: 24px;
        padding: 0 16px;
        white-space: nowrap;
    }

    .team-score {
        background-color: white;
        color: black;

        font-weight: bold;
        font-size: 42px;
        width: 48px;
        flex-shrink: 0;
        letter-spacing: -3px;
    }
    span.industry-align {
        transform: translate(0, -.0925em);
    }

    .ingame-team-anim-enter-active, .ingame-team-anim-leave-active {
        transition: all .5s cubic-bezier(0, 0, 0.55, 1);
    }
    .ingame-team-anim-enter-to, .ingame-team-anim-leave {
        max-width: 700px;
    }
    .ingame-team-anim-enter, .ingame-team-anim-leave-to {
        max-width: 0;
    }

    .team-logo-holder {
        width: 48px;
        flex-shrink: 0;
        margin: 0 12px 0 0;
    }
    .team-name {
        margin: 0 12px 0 0;
    }
    .ingame-team-holder.right .team-logo-holder {
        margin: 0 0 0 12px;
    }
    .ingame-team-holder.right .team-name {
        margin: 0 0 0 12px;
    }

    .team-logo {
        width: 100%;
        height: calc(100% - 8px);
        margin: 4px;
        box-sizing: border-box;
    }

    /*.team-score {*/
    /*    max-width: 0;*/
    /*    overflow: hidden;*/
    /*    transition: max-width .3s;*/
    /*    !* max-width: 48px; *!*/
    /*}*/

    .score-enter-active, .score-leave-active { overflow: hidden; transition: max-width .3s; }
    .score-enter-to, .score-leave { max-width: 48px; }
    .score-enter, .score-leave-to { max-width: 0; }
</style>
