<template>
    <div v-if="displayMode === 'together' && bannedHeroes?.length" class="ingame-hero-bans overlay--bg d-flex flex-column">
        <div class="ban-title fw-bold text-center">BANNED</div>
        <div class="bans d-flex">
            <div v-for="hero in bannedHeroes" :key="hero.id" class="hero p-1">
                <div class="hero-image bg-center" :style="resizedImage(hero, ['icon', 'main_image'], 's-100')"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { resizedImage } from "@/utils/images.js";

export default {
    name: "IngameHeroBans",
    props: ["broadcast", "match", "displayMode"],
    computed: {
        currentMap() {
            const maps = (this.match?.maps || []).map((map, i) => ({
                ...map,
                number: map.number || i + 1
            })).filter(map => !map.banner);

            let currentMap = maps.find(map => !(map.draw || map.winner));

            return currentMap;
        },
        bannedHeroes() {
            return [
                ...(this.currentMap?.team_1_bans || []),
                ...(this.currentMap?.team_2_bans || []),
            ];
        }
    },
    methods: { resizedImage },
};
</script>

<style scoped>
    .ingame-hero-bans {
        position: absolute;
        top: 165px;
        background: white;
        border-bottom: 4px solid transparent;
    }
    .hero-image {
        --square: 50px;
        width: var(--square);
        height: var(--square);
        background-color: rgba(0,0,0,0.2);
        border-radius: .25em;
        border: 1px solid rgba(0,0,0,0.2);
    }
</style>
