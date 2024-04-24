<template>
    <div class="hero-card d-flex flex-column flex-center" v-if="hero">
        <div class="hero-top h-100 flex-center flex-column">
            <div class="hero-card-title d-flex flex-column flex-center">Favorite Hero</div>
            <div class="hero-name py-2 d-flex flex-row text-center flex-center fw-bold">
                <span v-if="roleIcon" class="hero-icon" v-html="roleIcon"></span>
                <span class="hero-real-name">{{ heroName }}</span>
            </div>
            <div class="hero-role d-flex flex-row text-center">{{ heroRole }}</div>
        </div>
        <div class="hero-portrait d-flex flex-row flex-center" v-if="heroPortraitURL">
            <img :src="heroPortraitURL"/>
        </div>
    </div>
</template>

<script>

import { getRoleSVG } from "@/utils/content-utils";

export default {
    name: "PlayerHero",
    props: ["hero"],
    computed: {
        heroName() {
            return this.hero?.name || null;
        },
        heroRole() {
            if (!this.hero?.name) return null;
            return this.hero.role;
        },
        roleIcon() {
            return getRoleSVG(this.heroRole);
        },

        heroPortraitURL() {
            return this.hero?.main_image?.[0]?.url;
        }
    },
    methods: {
        getRoleSVG
    }


};
</script>

<style scoped>
    .hero-top {
        flex-grow: 1;
    }
    .hero-card-title {
        font-size: 1.5em;
    }
    .hero-name {
        font-size: 3em;
        line-height: 1;
    }

    .hero-role {
        font-size: 1.2em;
    }

    .hero-icon {
        margin-right: 0.05em;
        height: 1em;
        width: 1em;
    }
    .hero-icon >>> svg {
        vertical-align: text-bottom;
    }

    .hero-portrait {
        height: 547px;
        width: 296px;
    }

</style>
