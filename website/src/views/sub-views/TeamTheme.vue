<template>
    <div class="team-theme container">

        <ContentRow v-if="team.brand_designers" :title="team.brand_designers.length === 1 ? 'Brand designer' : 'Brand designers'">
            <ContentThing type="player" :text="designer.name" :thing="designer" :theme="team.theme" v-for="designer in team.brand_designers" v-bind:key="designer.id"></ContentThing>
        </ContentRow>

        <h3>Themes</h3>
        <div class="theme-collection mb-3">
            <div class="theme-bar default-thing" :style="mainTheme">
                Theme
            </div>
            <div class="theme-bar default-thing" :style="logoBackground">
                Logo Background
            </div>
        </div>


        <h3 v-if="colors.length">Colors</h3>
        <div v-if="colors.length" class="color-list mb-3">
            <div class="color" v-for="color in colors" v-bind:key="color.name">
                <div class="color-swatch" :style="{backgroundColor: color.value}"></div>
                <div class="color-name">{{ color.name }}: <code>{{ color.value }}</code></div>
            </div>
        </div>

        <h3 v-if="logos.length">Logos</h3>
        <div v-if="logos.length" class="logo-list mb-3">
            <div class="logo-holder flex-center" v-for="logo in logos" v-bind:key="logo.key" :style="logoBackground">
                <a :href="logo.image" target="_blank" class="bg-center logo" :style="{backgroundImage: `url(${logo.image})`}"></a>
                <div class="logo-name">{{ logo.key }}</div>
            </div>
        </div>

        <h3>Ingame overlay</h3>
        <div class="overlay-area ingame-overlay mb-3">
            <IngameTeam :team="team" :event="team.event" />
        </div>

        <h3>Bracket</h3>
        <div class="overlay-area mb-3">
            <div class="bracket-match">
                <BracketTeam :team="team" score="0"/>
            </div>
        </div>

        <h3>Standings</h3>
        <div class="standings mb-3">
            <StandingsTeam :team="standingsData" />
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
import { resizedImageNoWrap } from "@/utils/images";

function cleanKey(key) {
    return key.replace(/_/g, " ");
}

export default {
    name: "TeamTheme",
    components: { BracketTeam, IngameTeam, ContentRow, ContentThing, StandingsTeam },
    props: ["team"],
    computed: {
        standingsData() {
            return {
                ...this.team,
                standings: {
                    wins: 0, losses: 0, map_wins: 0, map_losses: 0, rank: 1, winrate: 0.5
                }
            };
        },
        theme() {
            if (!this.team || this.team.has_theme === 0 || !this.team.theme?.id) return null;
            return this.team.theme;
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
        padding: 2px 6px;
        display: inline-flex;
        min-width: 12em;
        justify-content: center;
        text-transform: uppercase;
        margin-right: 12px;
        border-bottom-width: 4px;
        border-bottom-style: solid;
    }

    .color-swatch {
        width: 1em;
        height: 1em;
        margin-right: 4px;
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
    .standings >>> .team-name {
        margin-right: 32px;
        min-width: 250px;
    }
</style>
