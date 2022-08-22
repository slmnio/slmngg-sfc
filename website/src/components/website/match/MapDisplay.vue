<template>
    <div :class="`map ${mapClass} ${condensed ? 'condensed' : ''} ${banned ? 'is-banned' : ''}`" v-if="showBannedMaps ? true : !banned">
        <div class="map-image default-thing" :style="imageCSS">
            <div class="map-color-overlay draw" v-if="map.draw"></div>
            <div class="map-color-overlay banned" v-if="banned"></div>
            <div class="map-color-overlay winner" v-if="winner" :style="logoBackground1(winner)"></div>

            <div class="map-winner-image bg-center" v-if="winner" :style="resizedImage(winner.theme, ['default_logo', 'small_logo'], 'h-90')"></div>
            <div class="map-insert-number" v-if="number && !condensed && !banned">{{ number }}</div>

            <div class="map-insert-text" v-if="banned && !condensed">BANNED</div>
            <div class="map-insert-text" v-if="map.draw && complete && !condensed">DRAW</div>
            <div class="map-insert-text" v-if="!complete && !condensed && !winner && mapClass === 'tiebreaker'">TIEBREAKER</div>
            <div class="map-insert-text" v-if="!complete && !condensed && !winner && mapClass === 'extra'">IF REQUIRED</div>
        </div>
        <div class="map-name">{{ name || '--' }}</div>
        <div class="map-scores" v-if="scores">{{ scores }}</div>
        <div class="map-pick" v-if="banText || pickText">{{ banText || pickText  || ''}}</div>
    </div>
</template>

<script>
import { cleanID } from "@/utils/content-utils";
import { logoBackground1, themeBackground } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";

export default {
    name: "MapDisplay",
    props: ["map", "theme", "match", "i", "condensed", "showBannedMaps"],
    computed: {
        mapClass() {
            if (!this.match) return "";
            if ((this.match.first_to * 2) - 1 === this.map.number) return "tiebreaker";
            if ((this.match.first_to * 2) - 1 < this.map.number) return "extra";
            return "required";
        },
        number() {
            return this.map?.number || this.i + 1;
        },
        winner() {
            return this.getTeamFromID(this.map.winner);
        },
        banned() {
            return this.map.banned || this.banned_by;
        },
        banned_by() {
            return this.getTeamFromID(this.map.banner);
        },
        picked_by() {
            return this.getTeamFromID(this.map.picker);
        },
        imageCSS() {
            let mapTheme = { color: "#ffffff" };
            if (!this.map?.image && this.theme) {
                mapTheme = themeBackground(this.theme);
            }
            return {
                ...resizedImage(this.map, ["image"], "h-160"),
                ...mapTheme
            };
        },
        complete() {
            if (!this.match) return false;
            return [this.match.score_1, this.match.score_2].some(s => s === this.match.first_to);
        },
        name() {
            try {
                if (this.condensed) return this.map.short_name[0];
                return this.map.name[0];
            } catch (e) { return ""; }
        },
        scores() {
            if (this.map.score_1 === undefined || this.map.score_2 === undefined) return null;
            return [this.map.score_1, this.map.score_2].join(" - ");
        },
        pickText() {
            if (!this.map?.picker) return null;
            return `picked by ${this.map.picker.code || this.map.picker.name}`;
        },
        banText() {
            if (!this.map?.banner) return null;
            return `banned by ${this.map.banner.code || this.map.banner.name}`;
        }
    },
    methods: {
        logoBackground1,
        resizedImage,
        getTeamFromID(id) {
            if (!id) return null;
            return (this.match.teams || []).find(t => t.id === cleanID(id));
        }
    }
};
</script>

<style scoped>
    .map {
        width: 160px;
        margin: 10px;
    }
    .map-image {
        padding-bottom: 56.25%;
        width: 100%;
        position: relative;
        background-size: cover;
        background-position: center;
    }
    .map-color-overlay {
        width: 100%;
        height: 100%;
        position: absolute;
        opacity: 0.7;
    }
    .map-color-overlay.draw {
        background-color: #555;
    }
    .map-color-overlay.banned {
        background-color: #555;
    }
    .map-winner-image {
        width: 80%;
        height: 80%;
        left: 10%;
        top: 10%;
        position: absolute;
    }
    .map-insert-number {
        position: absolute;
        right: 0;
        top: 0;
        padding: 0 6px;
        filter: drop-shadow(0px 0px 3px black);
        font-size: 20px;
        min-width: 25px;
    }
    .map-insert-text {
        position: absolute;
        bottom: 2px;
        width: 100%;
        text-align: center;
        font-size: 18px;
        filter: drop-shadow(0px 0px 3px black);
    }
    .map-name {
        line-height: 1;
        text-align: center;
        margin-top: 6px;
    }
    .map.condensed .map-name {
        font-size: 0.6em;
        margin-top: 3px;
    }
    .map-score {
        line-height: 1;
        text-align: center;
        margin-top: 6px;
    }

    .map-scores, .map-pick {
        line-height: 1;
        font-size: 0.85em;
        text-align: center;
        margin-top: 4px;
    }
    .map.condensed .map-scores,
    .map.condensed .map-pick {
        font-size: 0.6em;
        margin-top: 1px;
    }
</style>
