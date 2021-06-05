<template>
    <div class="draft-player" :style="background">
        <div class="player-name">{{ player.name }}</div>
        <div class="player-role flex-center" v-html="getSVG(player.role)"></div>
    </div>
</template>

<script>
import { logoBackground } from "@/utils/theme-styles";

export default {
    name: "DraftPlayer",
    props: {
        player: {},
        theme: {},
        asStaff: Boolean
    },
    computed: {
        background() { return logoBackground(this.theme); }
    },
    methods: {
        getSVG(name) {
            if (name === "Tank") {
                return `<svg id="role_tank" viewBox="0 0 64 64" width="100%" height="100%">
<path d="M51.4,24.1c0,3.1,0,6.2,0,9.3a4.7,4.7,0,0,1-.6,2.4A57.2,57.2,0,0,1,33.2,55.5a1.8,1.8,0,0,1-2.4,0A57.4,57.4,0,0,1,13.2,36a5.5,5.5,0,0,1-.7-2.8c0-5.8.1-11.7,0-17.5-.1-4.2,3.2-4.9,6.1-5.6A59.4,59.4,0,0,1,32.9,8C37.5,8,44.5,9.6,47,10.4s4.1,1.4,4.3,3.3.1,3.2.1,4.9,0,3.7,0,5.5Z"/>
</svg>`;
            }
            if (name === "DPS") {
                return `<svg id="role_offense" viewBox="0 0 64 64" width="100%" height="100%">
<rect class="cls-1" x="12" y="49.3" width="10.2" height="5.61"/>
<path class="cls-1" d="M22.2,19.1a10.2,10.2,0,0,0,0-1c-.8-6.9-5.1-9-5.1-9s-4.3,2.1-5.1,9c0,.3,0,1,0,1V45.4H22.2Z"/>
<rect class="cls-1" x="26.9" y="49.3" width="10.2" height="5.61"/>
<path class="cls-1" d="M37.1,19.1a10.2,10.2,0,0,0,0-1C36.3,11.2,32,9,32,9s-4.3,2.1-5.1,9c0,.3,0,1,0,1V45.4H37.1Z"/>
<rect class="cls-1" x="41.8" y="49.3" width="10.2" height="5.61"/>
<path class="cls-1" d="M52,19.1s0-.8,0-1c-.8-6.9-5.1-9-5.1-9s-4.3,2.1-5.1,9c0,.3,0,1,0,1V45.4H52Z"/>
</svg>`;
            }
            if (name === "Flex") {
                return `<svg id="role_flex" viewBox="0 0 64 64" width="100%" height="100%">
<path d="M18.55,32.89h0a13.17,13.17,0,0,1,1.77-5.17c.13-.23.5-.6.11-1a15.68,15.68,0,0,1-2.11-4.19.5.5,0,0,0-.89-.19A18.41,18.41,0,0,0,13,34.17h0a9.9,9.9,0,1,0,5.59-1.28Z"/>
<path d="M27,26.85a9.89,9.89,0,0,0,13.16-3h0A13.17,13.17,0,0,1,43.75,28c.13.23.27.73.81.6a15.68,15.68,0,0,1,4.68.28.5.5,0,0,0,.61-.67,18.41,18.41,0,0,0-8-9.82h0A9.9,9.9,0,1,0,27,26.85Z"/>
<path d="M54.73,37.87a9.89,9.89,0,0,0-17.52,9.18h0a13.17,13.17,0,0,1-5.37,1c-.27,0-.76-.14-.92.4a15.67,15.67,0,0,1-2.6,3.9.5.5,0,0,0,.27.87,18.41,18.41,0,0,0,12.51-2h0A9.9,9.9,0,0,0,54.73,37.87Z"/>
</svg>`;
            }
            if (name === "Support") {
                return `<svg id="role_support" viewBox="0 0 64 64" width="100%" height="100%">
<path d="M51.9,23.2H40.8V12.1A4.1,4.1,0,0,0,36.7,8H27.3a4.1,4.1,0,0,0-4.1,4.1V23.2H12.1A4.1,4.1,0,0,0,8,27.3v9.4a4.1,4.1,0,0,0,4.1,4.1H23.2V51.9A4.1,4.1,0,0,0,27.3,56h9.4a4.1,4.1,0,0,0,4.1-4.1V40.8H51.9A4.1,4.1,0,0,0,56,36.7V27.3A4.1,4.1,0,0,0,51.9,23.2Z"/>
</svg>`;
            }
            if (name === "Staff") return "<i class=\"fas fa-user-tie fa-fw\"></i>";
            if (name === "Staff") {
                return `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
 viewBox="0 0 25.916 25.916" style="enable-background:new 0 0 25.916 25.916;" xml:space="preserve">
<g>
<g>
<path d="M7.938,8.13c0.09,0.414,0.228,0.682,0.389,0.849c0.383,2.666,2.776,4.938,4.698,4.843
c2.445-0.12,4.178-2.755,4.567-4.843c0.161-0.166,0.316-0.521,0.409-0.938c0.104-0.479,0.216-1.201-0.072-1.583
c-0.017-0.02-0.127-0.121-0.146-0.138c0.275-0.992,0.879-2.762-0.625-4.353c-0.815-0.862-1.947-1.295-2.97-1.637
c-3.02-1.009-5.152,0.406-6.136,2.759C7.981,3.256,7.522,4.313,8.078,6.32C8.024,6.356,7.975,6.402,7.934,6.458
C7.645,6.839,7.833,7.651,7.938,8.13z"/>
<path d="M23.557,22.792c-0.084-1.835-0.188-4.743-1.791-7.122c0,0-0.457-0.623-1.541-1.037
c0,0-2.354-0.717-3.438-1.492l-0.495,0.339l0.055,3.218l-2.972,7.934c-0.065,0.174-0.231,0.289-0.416,0.289
s-0.351-0.115-0.416-0.289l-2.971-7.934c0,0,0.055-3.208,0.054-3.218c0.007,0.027-0.496-0.339-0.496-0.339
c-1.082,0.775-3.437,1.492-3.437,1.492c-1.084,0.414-1.541,1.037-1.541,1.037c-1.602,2.379-1.708,5.287-1.792,7.122
c-0.058,1.268,0.208,1.741,0.542,1.876c4.146,1.664,15.965,1.664,20.112,0C23.35,24.534,23.614,24.06,23.557,22.792z"/>
<path d="M13.065,14.847l-0.134,0.003c-0.432,0-0.868-0.084-1.296-0.232l1.178,1.803l-1.057,1.02
l1.088,6.607c0.009,0.057,0.058,0.098,0.116,0.098c0.057,0,0.106-0.041,0.116-0.098l1.088-6.607l-1.058-1.02l1.161-1.776
C13.888,14.756,13.487,14.83,13.065,14.847z"/>
</g>
</g></svg>`;
            }
            if (name === "Captain") return "<i class=\"fas fa-user-crown fa-fw\"></i>";
            if (name === "Manager") return "<i class=\"fas fa-clipboard-list fa-fw\"></i>";
            if (name === "Coach") return "<i class=\"fas fa-whistle fa-fw\"></i>";

            return "";
        }
    }
};
</script>

<style scoped>
    .draft-player {
        border-bottom: 2px solid transparent;
        font-size: 20px;
        width: calc(50% - 4px);
        margin: 0 2px 4px;
        padding: 2px 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
    }
    .player-name {
        flex-grow: 1;
    }
    .player-role {
        --size: 1.25em;
        height: var(--size);
        width: var(--size);
    }
</style>

<style>
  svg {
      color: currentColor;
      fill: currentColor;
  }
</style>
