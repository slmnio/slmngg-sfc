<template>
    <div class="team-image-overlay">
        <div class="team-image" v-if="image?.url && (image?.type).includes('video')">
            <video :src="image.url" loop autoplay muted />
        </div>
        <div class="team-image" v-if="image?.url && (image?.type).includes('image')" :style="bg(image.url)"></div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { bg, resizedAttachment } from "@/utils/images";

export default {
    name: "TeamImageOverlay",
    methods: { bg },
    props: ["broadcast", "teamNum", "imageNum", "overrideURL"],
    computed: {
        match() {
            if (!this.broadcast?.live_match?.length) return null;
            return ReactiveRoot(this.broadcast?.live_match?.[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        team() {
            if (!this.match?.teams?.length) return null;
            return this.match.teams[this.teamNum - 1];
        },
        image() {
            if (this.overrideURL) {
                return {
                    type: "image",
                    url: this.overrideURL
                };
            }
            if (!this.team) return {};
            const attachment = this.team.images?.[this.imageNum - 1];
            console.log(attachment);
            return {
                ...attachment,
                url: resizedAttachment(attachment, "w-1920")
            };
        }
    },
    watch: {
        team: {
            deep: true,
            handler(team) {
                console.log("team change", this.$parent);
                this.$parent.updateTheme(team?.theme);
            }
        }
    }
};
</script>

<style scoped>
    .team-image {
        width: 100vw;
        height: 100vh;
        background-position: center;
        background-size: 1920px 1080px;
    }
</style>
