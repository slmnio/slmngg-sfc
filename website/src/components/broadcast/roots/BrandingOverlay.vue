<template>
    <div class="branding-overlay w-100 h-100 position-absolute p-4">
        <div class="row row-top mb-4" v-if="highlightTeam">
            <div class="team-code">
                <div class="industry-align">{{ highlightTeam.code }}</div>
            </div>
            <div class="team-name flex-grow-1 text-right font-weight-bold">
                <div class="industry-align">{{ highlightTeam.name }}</div>
            </div>
        </div>
        <div class="row flex-grow-1">
            <div class="left w-75 px-2">
                <div class="big-logo w-100 h-100 flex-center" :style="teamBG">
                    <transition name="fade" mode="out-in">
                        <div class="logo-inner bg-center" :style="focusedLogoCSS" :key="focusedLogoCSS.backgroundImage"></div>
                    </transition>
                </div>
            </div>
            <div class="right w-25 px-2 d-flex flex-column">
                <div class="sister mb-3 text-uppercase d-flex align-items-center" v-if="sister" :style="logoBackground1(sister)">
                    <div class="sister-logo flex-center mx-2">
                        <div class="logo-inner bg-center" :style="resizedImage(sister.theme, ['default_logo', 'default_wordmark', 'small_logo'], 'h-100')"></div>
                    </div>
                    <div class="sister-text ml-1">
                        <div class="industry-align">Sister team</div>
                        <div class="industry-align font-weight-bold">{{ sister.name }}</div>
                    </div>
                </div>
                <div class="designers mb-3 px-2 py-3 text-center" :style="teamBG" v-if="designers">
                    <div class="industry-align">Designed by: {{ designers }}</div>
                </div>
                <div class="logos flex-grow-1 d-flex flex-column mb-3">
                    <div class="logo-holder w-100 flex-grow-1 my-2 flex-center" v-for="logo in logos" :key="logo.key" :style="teamBG">
                        <div class="logo-inner bg-center" :style="bg(resizedAttachment(logo.item, 'orig'))"></div>
                    </div>
                </div>
                <div class="colors d-flex">
                    <div class="swatch flex-grow-1 h-100 mx-2" v-for="color in colors" :key="color.value" :style="{ backgroundColor: color.value }"></div>
                </div>
            </div>
        </div>
        <div class="event-logo-holder position-absolute d-none flex-center" v-if="broadcast.event && broadcast.event.theme">
            <div class="logo-inner bg-center w-100 h-100" :style="resizedImage(broadcast.event.theme, ['default_logo'], 'orig')"></div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { logoBackground1 } from "@/utils/theme-styles";
import { bg, resizedAttachment, resizedImage } from "@/utils/images";

function cleanKey(key) {
    return key.replace(/_/g, " ");
}

export default {
    name: "BrandingOverlay",
    props: ["broadcast"],
    methods: { resizedAttachment, logoBackground1, resizedImage, bg },
    data: () => ({
        logoI: 0
    }),
    computed: {
        highlightTeam() {
            if (!this.broadcast?.highlight_team?.length) return null;
            return ReactiveRoot(this.broadcast.highlight_team[0], {
                theme: ReactiveThing("theme"),
                brand_designers: ReactiveArray("brand_designers"),
                sister_teams: ReactiveArray("sister_teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        sister() {
            if (!this.highlightTeam?.sister_teams) return null;
            return this.highlightTeam.sister_teams[0];
        },
        teamBG() {
            return logoBackground1(this.highlightTeam);
        },
        logos() {
            if (!this.highlightTeam?.theme) return [];
            const theme = this.highlightTeam.theme;
            return ["small_logo", "default_logo", "default_wordmark"].map(key => ({ key, item: theme[key] }))
                .filter(s => s.item).map(s => ({ ...s, item: s.item[0] }));
        },
        bigLogos() {
            return this.logos.filter(logo => logo.key !== "small_logo");
        },
        eventLogo() {
            if (!this.broadcast?.event?.theme) return {};
            return resizedImage(this.broadcast.event.theme, ["default_logo"], "h-200");
        },
        colors() {
            if (!this.highlightTeam?.theme) return [];
            const attrs = Object.entries(this.highlightTeam.theme);
            const colors = [];

            attrs.forEach(([key, val]) => {
                if (!key.startsWith("color_")) return;
                const u = colors.find(c => c.value === val);
                key = cleanKey(key.replace("color_", ""));
                if (u) {
                    u.name += ", " + key;
                } else {
                    colors.push({ name: key, value: val });
                }
            });

            return colors;
        },
        designers() {
            if (!this.highlightTeam?.brand_designers) return "";
            return this.highlightTeam.brand_designers.map(p => p.name).join(", ");
        },
        focusedLogoCSS() {
            return bg(resizedAttachment(this.bigLogos[this.logoI]?.item));
        }
    },
    mounted() {
        setInterval(() => {
            this.logoI++;
            if (this.logoI >= this.bigLogos.length) this.logoI = 0;
        }, 8000);
    },
    metaInfo() {
        return {
            title: `Branding | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .branding-overlay {
        font-family: "SLMN-Industry", "Industry", sans-serif;
        color: white;
        display: flex;
        flex-direction: column;
    }
    .row {
        margin: 0;
    }
    .row-top {
        font-size: 8em;
        text-transform: uppercase;
        line-height: 1;
    }
    .logo-inner {
        width: 90%;
        height: 90%;
        background-size: contain;
    }
    .logos > .logo-holder:first-child {
        margin-top: 0 !important;
    }
    .logos > .logo-holder:last-child {
        margin-bottom: 0 !important;
    }
    .colors {
        margin: 0 -.5rem;
        height: 1.5rem;
    }
    .designers {
        font-weight: bold;
        text-transform: uppercase;
        font-size: 1.5em;
        line-height: 1;
    }
    .big-logo {
        border-bottom: 1.5rem solid transparent;
    }
    .logos > .logo-holder, .designers, .sister {
        border-right: 0.5rem solid transparent;
        border-left: 0.5rem solid transparent;
    }
    .sister-logo {
        width: 100px;
        height: 100px;
    }
    .sister {
        font-size: 1.75rem;
        line-height: 1;
    }
    .event-logo-holder {
        width: 10rem;
        height: 5rem;
        display: initial !important;
        bottom: 3.5rem;
        left: 3rem;
    }
</style>
