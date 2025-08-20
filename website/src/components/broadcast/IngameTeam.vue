<template>
    <!--    <transition name="ingame-team-anim">-->
    <ThemeTransition
        v-if="loaded"
        class="ingame-team-holder"
        :class="{'right': right, 'left': !right, 'has-player-names': !!playerNames?.length}"
        :duration="500"
        :use-fit-content="true"
        :active="active"
        :theme="_theme"
        :start="right ? 'left' : 'right'"
        :end="right ? 'right' : 'left'"
        clip-slot
        :clip-delay="500">
        <div :key="team.id" class="ingame-team default-thing clip-target" :style="style" :class="{ 'extend-map-icon': extendIcons && mapAttack }">
            <div v-if="texture" class="texture-holder position-absolute w-100 h-100">
                <div class="ingame-texture">
                    <img :src="texture" alt="">
                </div>
            </div>
            <div v-if="displayedHeroBans" class="ingame-hero-bans">
                <div class="bans-text">
                    <div class="bans-text-rotate">
                        <span class="industry-align bans-text-basic">{{ displayedHeroBans.length === 1 ? 'BAN' : 'BANS' }}</span>
                        <span class="industry-align bans-text-space">&nbsp;</span>
                        <span v-if="heroBansDisplayMode === 'on ingame teams (asymmetric)' && team?.code" class="industry-align bans-text-for">
                            <span class="bans-team-for-text">FOR</span>
                            <span class="industry-align bans-text-for-space">&nbsp;</span>
                            <span class="bans-team-for-code">{{ team?.code }}</span>
                        </span>
                    </div>
                </div>
                <div v-for="hero in displayedHeroBans" :key="hero.id" class="hero-ban flex-center">
                    <div class="hero-image bg-center" :style="resizedImage(hero, ['icon', 'main_image'], 's-100')"></div>
                </div>
            </div>
            <div v-if="smallText" class="flex-center team-small-text">
                <transition name="fade" mode="out-in">
                    <span v-if="smallText" :key="smallText">
                        {{ smallText }}
                    </span>
                </transition>
            </div>
            <Squeezable class="flex-center team-name" :align="right ? 'left' : 'right'">
                <span v-if="!codes" class="industry-align team-sub-name">{{ team.name }}</span>
                <span v-if="!codes && team.subtitle" class="industry-align team-sub-subtitle">{{ team.subtitle }}</span>
                <span v-if="codes" class="industry-align team-sub-code">{{ team.code }}</span>
            </Squeezable>
            <div v-if="teamLogo" class="flex-center team-logo-holder flex-center" :style="colorLogoHolder ? logoBackground(_theme) : {}" :data-clh="colorLogoHolder">
                <div class="team-logo bg-center" :style="teamLogo"></div>
            </div>
            <transition name="score">
                <div v-if="!hideScores && !useDots" class="flex-center team-score">
                    <transition name="fade" mode="out-in">
                        <span :key="score || '0'" class="industry-align">{{ score || '0' }}</span>
                    </transition>
                </div>
            </transition>
            <transition name="score">
                <div v-if="!hideScores && useDots" class="flex-center team-dots">
                    <div
                        v-for="(dot, i) in dots"
                        :key="i"
                        class="dot"
                        :class="{'active': dot.active}"
                        :style="dot.active ? teamSlice : {}"></div>
                </div>
            </transition>
            <div class="team-alt-slice" :style="teamSlice"></div>
            <transition name="slide" mode="out-in">
                <div v-if="mapAttack" class="attack-holder">
                    <transition name="attack" mode="out-in">
                        <div :key="mapAttack" class="attack" :class="`icon-${mapAttack}`"></div>
                    </transition>
                </div>
            </transition>


            <transition name="fly-in">
                <div v-if="active && eventInfo?.length" class="event-info event-fly-in">
                    <squeezable>
                        <div class="event-info-text industry-align">
                            <div v-for="(item, i) in eventInfo" :key="item" class="text" :style="{order: i * 2}">
                                {{ item }}
                            </div>
                            <div v-for="(item, i) in eventInfo" :key="i" class="dash" :style="{order: (i * 2) + 1}">
                                -
                            </div>
                        </div>
                    </squeezable>
                </div>
                <IngameMaps v-else-if="active && showEventMaps" class="event-maps event-fly-in" :match="match" :broadcast="broadcast" />
            </transition>
        </div>
        <transition name="clip-swipe-down">
            <div v-if="playerNames?.length" class="player-names">
                <div v-for="guest in playerNames" :key="guest.id" class="player">
                    <transition name="fade">
                        <span :key="guest?.name">{{ guest?.name }}</span>
                    </transition>
                </div>
            </div>
        </transition>
    </ThemeTransition>
<!--    </transition>-->
</template>

<script>
import { getNewURL, resizedImage } from "@/utils/images";
import Squeezable from "@/components/broadcast/Squeezable.vue";
import ThemeTransition from "@/components/broadcast/ThemeTransition.vue";
import { logoBackground } from "@/utils/theme-styles";
import { autoRecord } from "@/utils/content-utils";
import IngameMaps from "@/components/broadcast/IngameMaps.vue";

export default {
    name: "IngameTeam",
    components: { IngameMaps, Squeezable, ThemeTransition },
    props: ["team", "active", "right", "score", "hideScores", "width", "codes", "event", "autoSmall", "theme", "mapAttack", "extendIcons", "useDots", "firstTo", "colorLogoHolder", "eventInfo", "showEventMaps", "match", "broadcast", "playerNames", "heroBansDisplayMode"],
    data: () => ({
        textureData: {
            url: null,
            svg: null,
            loading: false
        },
        show: true
    }),
    computed: {
        dots() {
            const _dots = [];
            for (let i = 1; i <= (this.firstTo || 2); i++) {
                console.log(this.score, i);
                if (this.score >= i) {
                    _dots.push({ active: true });
                } else {
                    _dots.push({ active: false });
                }
            }
            return _dots;
        },
        _theme() {
            return this.theme || this.team.theme;
        },
        record() {
            if (this.autoSmall?.show !== "record") return null;
            const stage = this.autoSmall?.stage;
            if (!stage) return null;
            return autoRecord(this.team, stage);
        },
        smallText() {
            if (this.team?.small_overlay_text) return this.team.small_overlay_text;
            if (this.autoSmall) {
                return this.record;
            }
            return null;
        },
        texture() {
            const texture = this.event?.broadcast_texture?.[0];
            if (!texture) return null;
            console.log("texture data", texture);
            if (this.textureData.loading) return null;
            const textureURL = getNewURL(texture, "orig");

            if (this.textureData.url !== textureURL) {
                return this.loadSVG(textureURL);
            }
            // console.log(texture);
            return "data:image/svg+xml;base64," + btoa(this.textureData.svg.replace(/#696969/g, this.svgColor).trim());
            // return texture;
        },
        loaded() {
            if (this._theme === undefined && this.team.has_theme === 0) return true;
            return this.team && this._theme && !this._theme.__loading;
        },
        style() {
            if (!this._theme) {
                return {
                    ...this.teamWidthCSS
                };
            }
            return {
                backgroundColor: this._theme.color_logo_background || this._theme.color_theme,
                color: this._theme.color_text_on_logo_background || this._theme.color_text_on_theme,
                ...this.teamWidthCSS
            };
        },
        svgColor() {
            if (this.team?.theme?.color_alt) return this._theme.color_alt;

            if (this.style?.backgroundColor === this.teamSlice?.backgroundColor) {
                return this.style?.color;
            }
            return this.teamSlice?.backgroundColor || this.style?.color;
        },
        teamSlice() {
            if (!this._theme) return {};
            let color = this._theme.color_accent;
            if (!color || color.toLowerCase() === "#ffffff") color = this._theme.color_logo_accent;
            if (!color || color.toLowerCase() === "#ffffff") color = this._theme.color_theme;
            return {
                backgroundColor: color
            };
        },
        teamLogo() {
            return resizedImage(this._theme, ["small_logo", "default_logo"], "h-80");
        },
        teamWidth() {
            return this.width || 567;
        },
        teamWidthCSS() {
            if (!this.teamWidth) return {};
            return { width: `calc(${this.teamWidth}px + var(--team-expand, 0px) - var(--side-margins, 0px))` };
        },
        displayedHeroBans() {
            if (!this.match?.id) return null;
            if (!this.heroBansDisplayMode?.includes("on ingame teams")) return null;

            const maps = (this.match?.maps || []).map((map, i) => ({
                ...map,
                number: map.number || i + 1
            })).filter(map => !map.banner);

            let thisTeamNum = (this.match?.teams || []).findIndex(t => t.id === this.team.id);
            if (this.heroBansDisplayMode === "on ingame teams (asymmetric)") {
                // team 1 bans affect team 2 etc
                // i.e. flip
                thisTeamNum = +!thisTeamNum;
            }
            const currentMap = maps.find(map => !(map.draw || map.winner)) || maps[maps.length - 1];
            if (!currentMap) return null;
            return [currentMap.team_1_bans || [], currentMap.team_2_bans || []]?.[thisTeamNum];
        }
    },
    methods: {
        resizedImage,
        logoBackground,
        async loadSVG(url) {
            console.log("Load SVG", url);
            this.textureData.loading = true;
            this.textureData.url = url;
            const data = await fetch(url).then(res => res.text());
            // console.log(data);
            this.textureData.svg = data;
            this.textureData.loading = false;
        }
    }, //,
    // watch: {
    //     style() {
    //         if (this.$el && this.$el.querySelector) {
    //             // console.log("tick", this.$el.querySelector(".team-name"));
    //         }
    //     },
    //     loaded() {
    //         console.log("load", this.loaded);
    //     },
    //     team() {
    //         if (this.$el && this.$el.querySelector) {
    //             // console.log("team watch");
    //             updateWidth(this.$el, this.teamWidth);
    //         }
    //     }
    // },
    mounted() {
        setInterval(() => {
            // this.show = !this.show;
        }, 2500);
    }
};

// function updateWidth(vueEl, fullWidth) {
//     const holder = vueEl.querySelector(".team-name");
//     const bigHolder = vueEl.querySelector(".ingame-team");
//     const span = holder.querySelector("span");
//     // console.log(vueEl.getBoundingClientRect());
//
//     // console.log(holder, internal, span);
//
//     // const el = vueEl.querySelector(".team-name");
//     // const text = el.children[0]; // target the .team-name > span.industry-align for width checking
//
//     holder.style.transform = "none";
//     // holder.style.width = "auto";
//     requestAnimationFrame(() => {
//         let diff = 0;
//         [...bigHolder.children].map(el => {
//             if (["team-name", "texture-holder"].some(cl => el.classList.contains(cl))) return;
//             // console.log(el);
//             if (el) diff += el.getBoundingClientRect().width;
//         });
//         diff += 32; // extra padding
//
//         // const target = 530 - (smallText);
//         const target = fullWidth - diff;
//         // const target = 0;
//         const width = span.getBoundingClientRect().width;
//         // console.log(diff, target, width);
//
//         if (width > target) {
//             const scale = target / width;
//             holder.style.transform = `scaleX(${scale})`;
//             holder.style.setProperty("--scaleX", scale);
//             // holder.style.width = `${scale * 100}%`;
//         }
//     });
// }

</script>

<style scoped>
    .ingame-team {
        display: flex;

        --team-expand: 0px;
        width: calc(567px + var(--team-expand));

        /* from .top-overlay  */
        height: var(--team-height, 48px);

        transition: background-color .2s, border-color .2s, color .2s, width 200ms ease;
    }
    .ingame-team-holder {
        position: absolute;
        top: calc(12px - (var(--team-height, 48px) - 48px));
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
        position: relative;
    }

    .team-score {
        background-color: white;
        color: black;

        font-weight: bold;
        font-size: 42px;
        width: 48px;
        flex-shrink: 0;
    }
    span.industry-align {
        transform: var(--overlay-line-height-adjust, translate(0, -0.0925em));
        --translate-y: -0.0925em;
    }

    .ingame-team-anim-enter-active, .ingame-team-anim-leave-active {
        transition: all .5s cubic-bezier(0, 0, 0.55, 1);
    }
    .ingame-team-anim-enter-to, .ingame-team-anim-leave-from {
        max-width: 700px;
    }
    .ingame-team-anim-enter-from, .ingame-team-anim-leave-to {
        max-width: 0;
    }

    .team-logo-holder {
        width: 48px;
        flex-shrink: 0;
        margin: 0 12px 0 0;
    }
    .team-name {
        margin: 0 12px 0 24px;
    }
    .ingame-team-holder.right .team-logo-holder {
        margin: 0 0 0 12px;
    }
    .ingame-team-holder.right .team-name {
        margin: 0 24px 0 12px;
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
    .score-enter-to, .score-leave-from { max-width: var(--team-height); }
    .score-enter-from, .score-leave-to { max-width: 0; }

    .ingame-team.default-thing {
        background-color: #373737;
        color: white;
        border-color: #5F5F5F
    }

    .ingame-texture {
        position: absolute;
        width: 70% !important;
        height: 100% !important;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.6;
        -webkit-mask-image: -webkit-gradient(linear, 15% 0%, 50% 0%, from(rgba(0,0,0,1)), to(rgba(0,0,0,0.15)));
    }
    .ingame-team-holder.right .ingame-texture {
        transform: scaleX(-1);
        right: 0;
    }
    .ingame-texture img {
        height: 100%;
    }

    .attack-holder {
        background-color: white;
        color: white;
    }
    .attack {
        background-color: #222;
        width: var(--team-height);
        height: var(--team-height);
        display: flex;
        align-items: center;
        justify-content: center;
        background-position: center;
        background-size: 36px;
        background-repeat: no-repeat;
    }
    .ingame-team.extend-map-icon {
        --team-expand: var(--team-height);
    }

    .icon-atk { background-image: url("https://media.slmn.io/atk.png"); }
    .icon-def { background-image: url("https://media.slmn.io/def.png"); }
    .slide-enter-active, .slide-leave-active {
        transition: all 200ms ease .2s;
        overflow: hidden;
    }
    .slide-enter-from, .slide-leave-to {
        width: 0;
    }
    .slide-enter-to, .slide-leave-from {
        width: var(--team-height);
    }
    .attack-enter-active, .attack-leave-active { transition: all 200ms ease; }

    .attack-enter-from { clip-path: polygon(0 0, 100% 0, 100% 0, 0 0); }
    .attack-enter-to, .attack-leave-from { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
    .attack-leave-to { clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%); }

    .dot {
        border: 1px solid #222;
        background-color: #333;
        width: 1.5em;
        height: .8em;
        margin: 0 2px;
    }
    .dot.active {
        background-color: white;
    }

    .event-fly-in {
        position: absolute;
        bottom: 100%;
        background-color: rgba(0,0,0,0.75);
        color: white;
        width: calc(100% - var(--team-expand));
        left: 0;
        margin-bottom: 4px;
        transition: width 200ms ease;
        height: 31px;
    }
    .event-fly-in .event-info-text {
        height: 31px;
        padding: 0 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        font-size: 20px;
        text-transform: uppercase;
        min-width: 100%;
    }
    .event-info .event-info-text * {
        transform: none !important;
    }
    .event-info .dash {
        margin: 0 0.5em;
    }
    .dash:last-of-type {
        display: none;
    }

    .fly-in-enter-active {
        transition: all .75s ease 1.5s, width 200ms ease;
    }
    .fly-in-enter-from {
        transform: translate(0, -40px);
    }
    .fly-in-enter-to {
        transform: translate(0, 0);
    }

    .fly-in-leave-active {
        transition: opacity .3s ease, width 200ms ease;
    }
    .fly-in-leave-to {
        opacity: 0;
    }

    .event-maps {
        left: auto;
        right: 0;
    }

    .player-names {
        display: flex;
    }
    .player-names .player {
        text-align: center;
        flex: 1;
    }


    .clip-swipe-down-enter-active,
    .clip-swipe-down-leave-active {
        transition: clip-path 200ms ease, max-height 200ms ease;
    }

    .clip-swipe-down-enter-to,
    .clip-swipe-down-leave-from {
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
        max-height: var(--height, 50vh);
    }
    .clip-swipe-down-enter-from,
    .clip-swipe-down-leave-to {
        clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
        max-height: 0;
    }

    .ingame-hero-bans {
        display: flex;
    }
    .hero-ban {
        width: var(--team-height);
        height: var(--team-height);
        background-color: var(--danger);
    }
    .bans-text {
        background-color: var(--danger);
        color: white;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        width: 1.5em;
        line-height: 1;
    }
    .bans-text-rotate {
        transform: rotate(-90deg);
    }
    .right .bans-text-rotate {
        transform: rotate(90deg);
    }
    .right .bans-text {
        order: 10;
    }
    .hero-image {
        width: 90%;
        height: 90%;
        border-radius: .5em;
    }
</style>
