<template>
    <div class="thing-theme container">
        <ContentRow v-if="thing.brand_designers" :title="thing.brand_designers.length === 1 ? 'Brand designer' : 'Brand designers'">
            <ContentThing
                v-for="designer in thing.brand_designers"
                :key="designer.id"
                type="player"
                :text="designer.name"
                :thing="designer"
                :theme="thing.theme"
                :link-options="{ 'subPage': 'brands' }" />
        </ContentRow>

        <h3>Themes</h3>
        <div class="theme-collection mb-3">
            <div class="theme-bar default-thing" :style="mainTheme">
                <div class="text flex-center flex-grow-1 px-3">Theme</div>
                <contrast-badge class="contrast-badge" :contrast="calculateContrastHex(mainTheme.color, mainTheme.backgroundColor)" />
            </div>
            <div class="theme-bar default-thing" :style="logoBackground">
                <div class="text flex-center flex-grow-1 px-3">Logo Background</div>
                <contrast-badge class="contrast-badge" :contrast="calculateContrastHex(logoBackground.color, logoBackground.backgroundColor)" />
            </div>
        </div>


        <div v-if="colors.length" class="colors">
            <h3>Colors</h3>
            <div class="color-list mb-3">
                <div v-for="color in colors" :key="color.name" class="color">
                    <div class="color-swatch" :style="{backgroundColor: color.value}"></div>
                    <div class="color-name">{{ color.name }}: <CopyTextButton><code>{{ safeColor(color.value) }}</code></CopyTextButton> </div>
                </div>
            </div>


            <div class="fw-bold mb-2">Discord test</div>

            <div class="discord-list d-flex flex-column gap-1 mb-3">
                <div v-for="color in discordColors" :key="color.name" class="discord-test d-flex gap-2">
                    <contrast-badge class="contrast-badge" :contrast="color.contrast" />
                    <div class="color-test d-flex gap-2" :style="{color: color.value}">
                        <div>{{ thing?.name }}</div>
                        <div class="fw-bold">{{ thing?.name }}</div>
                    </div>
                    <div class="color-name"><CopyTextButton><code>{{ safeColor(color.value) }}</code></CopyTextButton></div>
                    <div v-if="safeColor(theme.color_theme_on_dark || theme.color_theme) === safeColor(color.value)" class="color-chosen">
                        <i class="fas fa-arrow-left mr-1"></i> Currently active
                    </div>
                </div>
            </div>

            <div class="fw-bold mb-2">Color matrix</div>
            <div class="color-matrix d-flex flex-column gap-1 mb-3">
                <div v-for="color in colorMatrix" :key="color.background" class="discord-test d-flex gap-2">
                    <div class="color-test d-flex gap-2">
                        <div class="hex-swatch" style="min-width: 6em">
                            <copy-text-button :no-icon="true">{{ safeColor(color.background) }}</copy-text-button>
                        </div>
                        <div v-for="text in color.colors" :key="text.value" class="hex-swatch d-flex justify-content-between gap-1" :style="{ backgroundColor: color.background, color: text.value }">
                            <div class="color-hex text-center flex-grow-1">
                                <copy-text-button :no-icon="true">{{ safeColor(text.value) }}</copy-text-button>
                            </div>
                            <contrast-badge class="contrast-badge" :contrast="text.contrast" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <b-form-checkbox v-model="removeHashInHex" switch>Remove hash from hex codes</b-form-checkbox>
            </div>
        </div>


        <!--        <h3>Hero</h3>-->
        <!--        <div class="heroes d-flex">-->
        <!--            <RecoloredHero :show-controls="true" class="recolored-hero" v-for="hero in heroes" :theme="theme" :hero="hero" :key="hero.id"></RecoloredHero>-->
        <!--        </div>-->
        <!--        <HeroColorControls :theme="theme"></HeroColorControls>-->
        <h3 v-if="logos.length">Logos</h3>
        <div v-if="logos.length" class="logo-list mb-3">
            <div v-for="logo in logos" :key="logo.key" class="logo-holder flex-center" :style="logoBackground">
                <a :href="logo.image" target="_blank" class="bg-center logo" :style="bg(logo.image)"></a>
                <div class="logo-name">{{ logo.key }}</div>
            </div>
        </div>

        <h3 v-if="theme && theme.id">Generated images</h3>
        <div v-if="theme && theme.id" class="logo-list mb-3">
            <div class="logo-holder square-logo-holder flex-center" :style="logoBackground">
                <a :href="dataServerURL(`theme.png?id=${theme.id}&size=500&padding=20`)" target="_blank" class="bg-center square-logo logo" :style="bg(dataServerURL(`theme.png?id=${theme.id}&size=500&padding=20`))"></a>
            </div>
            <div class="logo-holder circle-logo-holder flex-center" :style="logoBackground">
                <a :href="dataServerURL(`theme.png?id=${theme.id}&size=500&padding=30`)" target="_blank" class="bg-center square-logo logo" :style="bg(dataServerURL(`theme.png?id=${theme.id}&size=500&padding=30`))"></a>
            </div>
        </div>


        <div v-if="team" class="team-specific">
            <h3>Ingame overlay</h3>
            <div class="overlay-area ingame-overlay mb-3">
                <IngameTeam :team="team" :event="team.event" :active="true" />
            </div>

            <h3>Bracket</h3>
            <div class="overlay-area mb-3">
                <div class="bracket-match">
                    <BracketTeam :team="team" score="0" />
                </div>
            </div>

            <h3>Standings</h3>
            <div class="standings mb-3">
                <StandingsTeam :team="standingsData" />
            </div>
        </div>

        <div v-if="event && event.teams">
            <b-button class="no-link-style d-inline-block" :to="url('event', event, { subPage: 'brands'})">Team branding <i class="fas fa-chevron-right fa-fw"></i></b-button>
        </div>
    </div>
</template>

<script>
import IngameTeam from "@/components/broadcast/IngameTeam";
import BracketTeam from "@/components/website/bracket/BracketTeam";
import { logoBackground } from "@/utils/theme-styles";
import ContentRow from "@/components/website/ContentRow";
import ContentThing from "@/components/website/ContentThing";
import StandingsTeam from "@/components/broadcast/StandingsTeam";
import { bg, resizedImageNoWrap } from "@/utils/images";
import { getDataServerAddress } from "@/utils/fetch";
import CopyTextButton from "@/components/website/CopyTextButton";
import { calculateContrastHex, url } from "@/utils/content-utils";
import { mapWritableState } from "pinia";
import { useSettingsStore } from "@/stores/settingsStore";

function cleanKey(key) {
    return key.replace(/_/g, " ");
}

export default {
    name: "ThingTheme",
    components: { CopyTextButton, /* HeroColorControls, RecoloredHero, */ BracketTeam, IngameTeam, ContentRow, ContentThing, StandingsTeam },
    props: ["team", "event"],
    computed: {
        ...mapWritableState(useSettingsStore, ["removeHashInHex"]),
        // heroes() {
        //     return (ReactiveRoot("Heroes", {
        //         ids: ReactiveArray("ids")
        //     })?.ids || []).filter(h => h.recolor_base);
        // },
        thing() {
            return this.team || this.event;
        },
        standingsData() {
            return {
                ...this.team,
                standings: {
                    wins: 0, losses: 0, map_wins: 0, map_losses: 0, rank: 1, winrate: 0.5
                }
            };
        },
        theme() {
            if (!this.thing || this.thing.has_theme === 0 || !this.thing.theme?.id) return null;
            return this.thing.theme;
        },
        mainTheme() {
            if (!this.theme) return {};
            return {
                backgroundColor: this.theme.color_theme,
                color: this.theme.color_text_on_theme,
                borderColor: this.theme.color_alt || this.theme.color_accent
            };
        },
        logoBackground() {
            return logoBackground(this.theme);
        },
        colors() {
            if (!this.theme) return [];
            const attrs = Object.entries(this.theme);
            const colors = [];

            attrs.forEach(([key, val]) => {
                if (!key.startsWith("color_")) return;
                if (val) val = val.toUpperCase();
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
        logos() {
            if (!this.theme) return [];
            const keys = ["small_logo", "default_logo", "default_wordmark"];
            return keys.map(k => ({
                key: cleanKey(k),
                image: resizedImageNoWrap(this.theme, [k], "orig")
            })).filter(i => i.image);
        },
        discordColors() {
            return (this.colors || []).map(col => ({
                value: col.value,
                contrast: calculateContrastHex("#2c2e32", col.value)
            })).sort((a,b) => b.contrast - a.contrast);
        },
        colorMatrix() {
            const testColors = [...new Set([
                ...(this.colors || []).map(col => col.value),
                "#000000",
                "#FFFFFF"
            ])];
            return testColors.map(col1 => ({
                background: col1,
                colors: testColors.filter(col2 => col2 !== col1).filter(col2 => ![col1, col2].every(col => col === "#000000" || col === "#FFFFFF")).map(col2 => ({
                    value: col2,
                    contrast: calculateContrastHex(col1, col2)
                }))
            }));
        }
    },
    methods: {
        calculateContrastHex,
        bg,
        dataServerURL(path) {
            return `${getDataServerAddress()}/${path}`;
        },
        url,
        safeColor(col) {
            col = col.trim().toUpperCase();
            if (this.removeHashInHex) col = col.replace("#", "");
            return col;
        }
    }
};
</script>

<style scoped>
    .overlay-area {
        position: relative;
    }
    .bracket-match {
        width: 200px;
        display: flex;
        flex-direction: column;
    }
    .overlay-area.ingame-overlay {
        height: 60px;
        margin-top: -12px;
    }
    .theme-collection {
        display: flex;
    }
    .theme-bar {
        font-size: 1.25em;
        font-weight: bold;
        display: inline-flex;
        min-width: 13em;
        justify-content: space-between;
        text-transform: uppercase;
        margin-right: 12px;
        border-bottom-width: 4px;
        border-bottom-style: solid;
    }

    .theme-bar .text {
        padding-top: calc(1em / 8);
        padding-bottom: calc(1em / 8);
    }

    .color-swatch {
        width: 1em;
        height: 1em;
        margin-right: 4px;
        flex-shrink: 0;
    }
    .color-name {
        text-transform: uppercase;
    }
    .color-name code {
        margin-left: 4px;
    }
    .color {
        display: flex;
        align-items: center;
    }


    .logo-list {
        display: inline-flex;
    }
    .logo-holder {
        width: 200px;
        height: 160px;
        flex-direction: column;
        margin-right: 16px;
    }
    .logo-holder a {
        width: calc(100% - 8px);
        height: calc(100% - 32px);
        display: flex;
        justify-content: center;
    }
    img.logo {
        max-width: 100%;
    }
    .logo-name {
        text-transform: uppercase;
        font-weight: bold;
        padding: 2px 4px;
    }

    @media (max-width: 575px) {
        .theme-collection {
            flex-direction: column;
        }
        .theme-collection .theme-bar {
            margin: 6px 0;
        }
        .ingame-overlay {
            transform: scale(0.5);
            transform-origin: left;
        }
    }

    .standings {
        font-size: 24px;
        width: fit-content;
    }
    .standings:deep(.team-name) {
        margin-right: 32px;
        min-width: 250px;
    }

    .square-logo-holder,
    .circle-logo-holder {
        width: 160px;
        border-radius: 4px;
        overflow: hidden;
    }
    .circle-logo-holder {
        border-radius: 50%;
    }

    .square-logo-holder a,
    .circle-logo-holder a {
        width: 100%;
        height: 100%;
    }
    /*.recolored-hero {*/
    /*    width: 200px;*/
    /*}*/
    /*.recolored-hero:deep(.color-holder) {*/
    /*    height: 500px;*/
    /*}*/

    .discord-list .color-test {
        background-color: #2c2e32;
        padding: 0 0.25em;
    }

    .hex-swatch {
        min-width: 9em;
        text-align: center;
    }

    .contrast-badge {
        padding: 0 0.25em;
        min-width: 3em;
        font-size: .9em;
        line-height: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
    }

    .theme-bar .contrast-badge {
        font-size: .75em;
    }
</style>
