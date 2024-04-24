<template>
    <div class="map d-flex position-relative" :class="{'next-map': map._next, 'map-dummy': map.dummy, 'drafted-map': draftedStyle, 'upcoming-map': draftedStyle && !complete && !map._next }">
        <div v-if="mapVideo" class="map-bg map-video w-100 h-100 bg-center" :class="{'grayscale': !!winnerBG || (map && map.draw) || (map && map.banner)}" :style="mapBackground">
            <video :src="mapVideo" autoplay muted loop></video>
        </div>
        <div v-else class="map-bg w-100 h-100 bg-center" :class="{'grayscale': !!winnerBG || (map && map.draw) || (map && map.banner)}" :style="mapBackground"></div>
        <div class="map-gel w-100 h-100 position-absolute" :style="winnerBG"></div>
        <div class="map-gel w-100 h-100 position-absolute draw-gel" v-if="map && map.draw"></div>
        <div class="map-gel w-100 h-100 position-absolute ban-gel flex-center" v-if="map && map.banner"></div>
        <div class="map-gel w-100 h-100 position-absolute upcoming-gel flex-center" v-if="draftedStyle && !complete && !map._next"></div>
        <div class="map-main d-flex flex-column h-100 w-100 position-absolute">
            <div v-if="!small">
                <div class="map-upper flex-center" :style="accent" v-if="map.picker || map.banner">
                    <ThemeLogo class="pick-ban-team" :theme="pickBanTheme" border-width="4px" logo-size="w-100"
                               icon-padding="2"/>
                    <div class="pick-ban-text" :style="pickBanBorder">{{
                            map.banner ? "Ban" : (map.picker ? "Pick" : "")
                        }}
                    </div>
                </div>
                <div class="map-upper-spacer" v-else></div>
            </div>
            <div class="map-top flex-grow-1 h-100 w-100 flex-center flex-column" v-if="!draftedStyle">
                <div class="map-logo-holder w-100 h-50 flex-center" v-if="winnerBG">
                    <div class="map-logo bg-center" :style="winnerLogo"></div>
                </div>
                <div class="gel-text" v-if="map && map.draw">DRAW</div>
                <div class="ban-icon-holder" v-if="map.banner">
                    <i class="ban-icon fas fa-ban"></i>
                </div>
                <div class="map-score flex-center" v-if="showMapScores && (map.score_1 || map.score_2)">
                    <div class="map-score">{{ map.score_1 }}</div>
                    <div class="map-dash">-</div>
                    <div class="map-score">{{ map.score_2 }}</div>
                </div>
            </div>
            <div class="map-lower flex-center flex-column" v-if="!draftedStyle" :style="accent">
                <div class="map-lower-name flex-center"><span class="industry-align">{{ name }}</span></div>
                <div class="map-lower-type" v-if="type"><span class="industry-align">{{ type }}</span></div>
            </div>

            <div class="map-draft-top flex-center" v-if="draftedStyle" :class="{'complete': complete, 'next': map._next, 'draw': map.draw}" :style="winnerBG">
                <div class="draft-map-data flex-grow-1 fw-bold">
                    <div class="draft-map-type">{{ map.mode || map.type?.[0] }}</div>
                    <div class="draft-map-name">{{ name }}</div>
                </div>
                <div class="draft-map-status">
                    <div class="status-complete flex-center flex-column" v-if="complete">
                        <div class="team-logo" :style="winnerLogo"></div>
                        <div class="map-score text-nowrap" v-if="map.score_1 || map.score_2">{{ teamLeadingScoresText }}</div>
                    </div>
                    <div class="status-up-next text-center flex-center" v-else-if="map._next">
                        <div class="text">UP NEXT</div>
                    </div>
                    <div class="status-up-later text-center flex-center" v-else>
                        <div class="text">MAP {{ map._number }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { logoBackground } from "@/utils/theme-styles";
import { bg, getNewURL, resizedImage } from "@/utils/images";
import ThemeLogo from "@/components/website/ThemeLogo";


export default {
    name: "MapSegment",
    props: ["broadcast", "map", "accentColor", "showMapVideo", "firstTo", "useShorterNames", "small", "draftedStyle"],
    components: {
        ThemeLogo
    },
    computed: {
        complete() {
            return this.map.winner || this.map.draw;
        },
        teamLeadingScoresText() {
            if (!(this.map?.score_1 || this.map?.score_2)) return "";
            if (this.map.score_1 > this.map.score_2) {
                return `${this.map.score_1} - ${this.map.score_2}`;
            } else {
                return `${this.map.score_2} - ${this.map.score_1}`;
            }
        },
        pickBanTheme() {
            return (this.map.banner || this.map.picker)?.theme;
        },
        pickBanBorder() {
            return {
                borderBottom: `4px solid ${this.pickBanTheme?.color_logo_accent || this.pickBanTheme?.color_accent || "rgba(255,255,255,0.2)"}`
            };
        },
        mapBackground() {
            console.log("background", this.map.name, { submap_big: this.map?.map?.big_image, submap_image: this.map?.map?.image, parent_big: this.map?.big_image, parent_image: this.map?.image });
            const image = (this.map?.map?.big_image || this.map?.map?.image || this.map?.big_image || this.map?.image)?.[0];
            if (!(image)) return {};

            try {
                return bg(image?.url || getNewURL(image, this.small ? "w-400" : "orig"));
            } catch (e) {
                return {};
            }
        },
        name() {
            if (!(this.map?.map?.name || this.map?.name)) return null;
            if (this.useShorterNames && this.map?.map?.shorter_name) return this.map.map.shorter_name;
            const topLevelName = typeof this.map?.name === "object" ? this.map?.name?.[0] : this.map?.name;
            return this.map?.map?.name || topLevelName;
        },
        showMapScores() {
            return (this.broadcast?.broadcast_settings || [])?.includes("Show map scores");
        },
        type() {
            if (!this.broadcast?.broadcast_settings?.includes("Show map modes text")) return null;
            // Do the map specific name first, then the map data first
            if (this.map?.mode) return this.map.mode; // Custom map instance text
            if (this.map?.type?.length) return this.map.type[0]; // Map data (.map.type is a rollup from Airtable)
            return this.map.mode;
        },
        accent() {
            if (!this.accentColor) return {};
            return {
                backgroundColor: this.accentColor.theme,
                color: this.accentColor.text_on_theme
            };
        },
        winnerBG() {
            if (!this.map?.winner?.theme) return null;
            return logoBackground(this.map.winner.theme);
        },
        winnerLogo() {
            if (!this.map?.winner?.theme) return {};
            const keys = ["default_logo", "small_logo"];
            if (this.firstTo && this.firstTo > 2) {
                keys.unshift("default_wordmark");
            }
            return resizedImage(this.map.winner.theme, keys, "w-400");
        },
        mapVideo() {
            if (!this.showMapVideo) return null;
            if (!this.map?.map?.video?.length) return null;

            if (!this.map._next && !this.broadcast?.broadcast_settings?.includes("Always show map videos")) {
                return null;
            }
            return getNewURL(this.map.map.video?.[0], "orig");
        }
    }
};
</script>

<style scoped>
    .map {
        flex-direction: column;
        margin: 0 12px;
        overflow: hidden;

        width: 0 !important;
        flex-grow: 2;
        transition: all 800ms ease;
    }
    .map-bg {
        background-size: cover;
    }
    .map-bg.grayscale {
        filter: grayscale(1);
    }
    .map-lower,
    .map-upper {
        font-size: 36px;
        text-align: center;
        padding: 10px 5px;
        line-height: 1;
        min-height: 120px;

        /* default */
        background-color: #333333;
        color: #ffffff;
    }
    .map-upper, .map-upper-spacer {
        font-size: 24px;
        min-height: 2em;
        padding: 0;
    }
    .pick-ban-text {
        padding: 10px 5px;
        width: 100%;
        text-align: center;
    }
    .map-lower-type {
        font-size: 0.6em;
        text-align: center;
        padding-top: 0.25em;
    }
    .map-main {
        z-index: 2;
    }
    .map-gel {
        opacity: 0.5;
    }
    .map-logo {
        width: 90%;
        height: 90%;
    }
    .map-gel.draw-gel {
        background-color: #555;
    }
    .gel-text {
        color: white;
        font-size: 60px;
    }

    .map-bg video {
        height: 100%;
        object-fit: cover;
        width: 100%;
    }

    .map-bg.map-video {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
    .pick-ban-team {
        width: 55px;
        height: 100%;
    }
    .ban-icon-holder {
        font-size: 4em;
    }
    .ban-icon {
        color: white;
        opacity: 0.75;
    }
    .map-score {
        font-size: 1.5em;
    }
    .map-dash {
        margin: 0 .2em;
    }

    .map.drafted-map .map-main {
        justify-content: center;
    }

    .map-draft-top {
        width: 100%;
        background: #444;
        color: white;
        padding: 0.5em 0.75em;
        font-size: 18px;
        height: 50%;
    }


    .draft-map-name {
        font-size: 1.75em;
        line-height: 1;
    }


    .draft-map-status {
        line-height: 1.25em;
    }

    .team-logo {
        width: 2.5em;
        height: 2.5em;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        margin-bottom: .75em;
    }
</style>
