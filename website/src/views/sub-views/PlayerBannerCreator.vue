<template>
    <div class="container">
        <h3>Banner Creator for {{ player.name }}</h3>

        <select name="banner" id="" v-model="banner">
            <option v-for="b in bannerTemplates" v-bind:key="b.name" :value="b">{{ b.name }}</option>
        </select>
        <select name="customTheme" id="" v-model="customTheme">
            <option v-for="b in playerThings" v-bind:key="b.name" :value="b">{{ b.name }}</option>
        </select>
        <hr>

        <div class="canvas-wrapper">
            <canvas width="1500" height="500" class="banner"></canvas>
        </div>
        {{ customBanner }}
    </div>
</template>

<script>
import { AllBanners } from "@/utils/banners";

export default {
    name: "PlayerBannerCreator",
    props: ["player"],
    data: () => ({
        canvas: null,
        banner: null,
        customTheme: null
    }),
    computed: {
        bannerTemplates() {
            return AllBanners;
        },
        playerThings() {
            return [
                ...this.player.member_of || [],
                ...this.player.captain_of || [],
                ...this.player.team_staff || [],
                ...this.player.event_staff || []
            ].filter((i, p, a) => a.map(x => x.id).indexOf(i.id) === p);
        },
        customBanner() {
            if (this.banner) {
                this.banner.customize({
                    text: this.player?.name || "Gamer",
                    background: this.customTheme?.theme?.color_logo_background || "#111111",
                    accent: this.customTheme?.theme?.color_logo_accent || "#66D9FF",
                    textColor: this.customTheme?.theme?.color_text_on_logo_background,
                    logo: this.customTheme?.theme?.default_logo?.[0]?.url
                });
                this.banner.drawImage(this.canvas);
            }
            return "";
        }
    },
    mounted() {
        this.canvas = document.querySelector("canvas");
    }
};
</script>

<style scoped>
    .banner {
        width: 1500px;
        height: 500px;

        width: 600px; height: 200px;
    }

    .canvas-wrapper:before {
        background-image: url(https://i.imgur.com/ldgmZqE.png);
        content: " ";
        width: 600px;
        height: 500px;
        position: absolute;
        top: -51px;
        left: 0;
        background-repeat: no-repeat;
    }
    .canvas-wrapper {
        position: relative;
        margin-top: 50px;
    }
</style>
