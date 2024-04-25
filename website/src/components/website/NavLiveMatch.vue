<template>
    <router-link active-class="active" class="live-match-link" :to="url('match', match)" v-if="shouldShow">
        <MatchThumbnail class="live-thumbnail" :match="match"/>
<!--        <span>🔴 LIVE: {{ eventText }} {{ match.round || match.name }}</span>-->
    </router-link>
</template>

<script>
import { url } from "../../utils/content-utils";
import MatchThumbnail from "@/components/website/match/MatchThumbnail";

export default {
    name: "NavLiveMatch",
    components: { MatchThumbnail },
    props: ["match"],
    methods: {
        url
    },
    computed: {
        eventText() {
            if (!this.match.event) return null;
            if (this.match.event.short) {
                return this.match.event.short + ": ";
            }
            return null;
        },
        shouldShow() {
            if (!this.match?.id) return false;
            if (!this.match?.event?.id) return false;
            return true;
            // return this.match.live;
        }
    }
};
</script>

<style scoped>
    .live-thumbnail {
        width: 110px;
        min-width: 110px;
        height: 50px !important;
        margin-bottom: 5px;
    }
    .live-thumbnail:deep(.match-thumbnail-logo) {
        width: calc(100% - 8px) !important;
        height: calc(100% - 8px) !important;
    }
</style>
