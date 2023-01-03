<template>
    <div class="container">
        <b-form-select class="my-1" name="banner" id="" v-model="bannerID" :options="bannerTemplateOptions" />
        <b-form-select class="my-1" name="customTheme" id="" v-model="customThemeID" :options="playerThings" />

        <div class="canvas-wrapper my-3">
            <canvas width="1500" height="500" class="banner" ref="canvas"></canvas>
        </div>

        <b-button v-if="customTheme && png" class="no-link-style d-inline-block" :download="filename" target="_blank" :href="png" variant="success">
            <i class="fa-fw fas fa-save"></i> Save
        </b-button>
    </div>
</template>

<script>
import { AllBanners } from "@/utils/banners";
import { resizedImageNoWrap } from "@/utils/images";
import { BButton, BFormSelect } from "bootstrap-vue";
import { sortEvents, sortTeams } from "@/utils/sorts";

export default {
    name: "PlayerBannerCreator",
    props: ["player"],
    components: {
        BButton, BFormSelect
    },
    data: () => ({
        bannerID: null,
        customThemeID: null,
        png: null
    }),
    computed: {
        selectedBanner() {
            return AllBanners[this.bannerID] || null;
        },
        customTheme() {
            for (const group of (this.playerThings || [])) {
                for (const item of (group.options || [])) {
                    if (item.id === this.customThemeID) return item;
                }
            }
            return null;
        },
        bannerTemplateOptions() {
            return [
                { value: null, disabled: true, text: "Choose a banner style" },
                ...AllBanners.map((banner, i) => ({ value: i, text: banner.name }))
            ];
        },
        playerThings() {
            let teams = [
                ...this.player.member_of || [],
                ...this.player.captain_of || [],
                ...this.player.team_staff || [],
                ...this.player.brands_designed || []
            ];
            let events = [
                ...this.player.event_staff || [],
                ...this.player.event_brands_designed || []
            ];

            (this.player.player_relationships || []).forEach(rel => {
                if (rel.teams) {
                    teams = [...teams, ...rel.teams];
                }
                if (rel.events) {
                    events = [...events, ...rel.events];
                }
            });

            return [
                { value: null, disabled: true, text: "Choose a theme" },
                { label: "Teams", options: teams.filter((i, p, a) => a.map(x => x.id).indexOf(i.id) === p).sort(sortTeams).map((t) => ({ ...t, text: t.name, value: t.id })) },
                { label: "Events", options: events.filter((i, p, a) => a.map(x => x.id).indexOf(i.id) === p).sort(sortEvents).map((e) => ({ ...e, text: e.name, value: e.id })) }
            ];
        },
        filename() {
            if (!this.customTheme) return null;
            const code = this.customTheme.code ||
                this.customTheme.short ||
                this.customTheme.name;
            return `${code} ${this.player?.name || "Gamer"} Banner.png`;
        }
    },
    watch: {
        customTheme: {
            deep: true,
            async handler() {
                console.log("watch custom");
                this.png = await this.createBanner();
            }
        },
        selectedBanner: {
            deep: true,
            async handler() {
                console.log("watch custom");
                this.png = await this.createBanner();
            }
        }
    },
    methods: {
        async createBanner() {
            console.log(this.selectedBanner);
            if (this.selectedBanner && this.customTheme) {
                this.selectedBanner.customize({
                    text: this.player?.name || "Gamer",
                    background: this.customTheme?.theme?.color_logo_background || "#111111",
                    accent: this.customTheme?.theme?.color_logo_accent || "#66D9FF",
                    textColor: this.customTheme?.theme?.color_text_on_logo_background,
                    logo: resizedImageNoWrap(this.customTheme?.theme, ["default_logo"], "h-150")
                });
                return await this.selectedBanner.drawImage(this.$refs.canvas);
                // return this.$refs.canvas.toDataURL("image/png"); ;
            }
            return null;
        }
    },
    beforeDestroy() {
        if (this.$refs.canvas) {
            const context = this.$refs.canvas.getContext("2d");
            context.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
        }
    }
};
</script>

<style scoped>
    .banner {
        /*width: 1500px;*/
        /*height: 500px;*/

        width: 600px;
        /*height: 200px;*/
        width: 100%;
        aspect-ratio: 3 / 1;

        background-color: #333;

        border-radius: .25em;
    }

    /*.canvas-wrapper:before {*/
    /*    background-image: url(https://i.imgur.com/ldgmZqE.png);*/
    /*    content: " ";*/
    /*    width: 600px;*/
    /*    height: 500px;*/
    /*    position: absolute;*/
    /*    top: -51px;*/
    /*    left: 0;*/
    /*    background-repeat: no-repeat;*/
    /*}*/
    /*.canvas-wrapper {*/
    /*    position: relative;*/
    /*    margin-top: 50px;*/
    /*}*/
</style>
