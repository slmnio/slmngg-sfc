<template>
    <div class="container">
        <b-form-select class="my-1" name="banner" id="" v-model="bannerID" :options="bannerTemplateOptions" />
        <b-form-select class="my-1" name="customTheme" id="" v-model="customThemeID" :options="playerThings" />
        <b-form-select class="my-1" name="customText" id="" v-model="customText" :options="textOptions" />

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
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "PlayerBannerCreator",
    props: ["player"],
    components: {
        BButton, BFormSelect
    },
    data: () => ({
        bannerID: 1,
        customThemeID: null,
        customText: null,
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
                ...this.player.brands_designed || [],
                ...this.player.owned_teams || []
            ];
            let events = [
                ...this.player.event_staff || [],
                ...this.player.event_brands_designed || [],
                ...this.player.casted_events || []
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
        customThemeAccolades: function () {
            if (!this.customTheme) return [];
            if (this.customTheme.__tableName === "Teams") {
                const team = ReactiveRoot(this.customTheme.id, {
                    accolades: ReactiveArray("accolades"),
                    event: ReactiveThing("event", {
                        accolades: ReactiveArray("accolades")
                    })
                });

                const teamAccolades = (team.accolades || []);// .filter(acc => acc.teams.includes(t => t.id === this.customTheme.id));
                const playerAccolades = (this.player?.accolades || []).filter(acc =>
                    (acc.event?.id === team.event.id || (acc.teams || []).includes(t => t.id === team.id))
                );

                return [
                    ...teamAccolades,
                    ...playerAccolades
                ].map(a => a.player_text || a.name);
            } else if (this.customTheme.__tableName === "Events") {
                return [];
            }
            return [];
        },
        textOptions() {
            if (!this.customTheme) return [];
            const options = [];

            if (this.customTheme.__tableName === "Teams") {
                // team player relationships
                // team staff/captain/owner
                // team accolades
                // player team.event accolades

                if ((this.player.owned_teams || []).find(t => t.id === this.customTheme.id)) {
                    options.push("Team Owner");
                }
                if ((this.player.captain_of || []).find(t => t.id === this.customTheme.id)) {
                    options.push("Team Captain");
                }
                if ((this.player.team_staff || []).find(t => t.id === this.customTheme.id)) {
                    options.push("Team Staff");
                }
                if ((this.player.brands_designed || []).find(t => t.id === this.customTheme.id)) {
                    options.push("Brand Designer");
                }

                const rels = (this.player.player_relationships || []).filter(rel => (rel.teams || []).find(t => t.id === this.customTheme.id));

                return [
                    { value: null, text: "No text" },
                    ...options,
                    ...rels.map(r => r.singular_name),
                    ...this.customThemeAccolades
                ];
            } else if (this.customTheme.__tableName === "Events") {
                // player_relationships
                // event_staff
                if ((this.player.event_staff || []).find(e => e.id === this.customTheme.id)) {
                    options.push("Event Staff");
                }
                if ((this.player.event_brands_designed || []).find(e => e.id === this.customTheme.id)) {
                    options.push("Event Brand Designer");
                }
                if ((this.player.casted_events || []).find(e => e.id === this.customTheme.id)) {
                    options.push("Caster");
                }

                const rels = (this.player.player_relationships || []).filter(rel => (rel.events || []).find(e => e.id === this.customTheme.id));
                console.log(this.player.player_relationships, rels);

                return [
                    { value: null, text: "No text" },
                    ...options,
                    ...rels.map(r => r.singular_name),
                    ...this.customThemeAccolades
                ];
            }
            return options;
        },
        filename() {
            if (!this.customTheme) return null;
            const code = this.customTheme.code ||
                this.customTheme.short ||
                this.customTheme.name;
            return `${code} ${this.customText ? this.customText + " " : ""}${this.player?.name || "Gamer"} Banner.png`;
        }
    },
    watch: {
        customTheme: {
            deep: true,
            async handler() {
                this.png = await this.createBanner();
                this.customText = null;
            }
        },
        selectedBanner: {
            deep: true,
            async handler() {
                this.png = await this.createBanner();
            }
        },
        async customText() {
            this.png = await this.createBanner();
        }
    },
    methods: {
        async createBanner() {
            if (this.selectedBanner && this.customTheme) {
                this.selectedBanner.customize({
                    text: this.player?.name || "Gamer",
                    background: this.customTheme?.theme?.color_logo_background || "#111111",
                    accent: this.customTheme?.theme?.color_logo_accent || "#66D9FF",
                    textColor: this.customTheme?.theme?.color_text_on_logo_background,
                    logo: resizedImageNoWrap(this.customTheme?.theme, ["default_logo"], "h-150"),
                    subtitle: this.customText
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
