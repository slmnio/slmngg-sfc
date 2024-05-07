<template>
    <router-link :to="url('match', match)" class="match no-link-style ct-passive">
        <MatchThumbnail :match="match" />
        <div v-if="lowerText" class="match-lower-text">{{ lowerText }}</div>
        <div v-else class="match-lower-text">&nbsp;</div>
    </router-link>
</template>

<script>
import MatchThumbnail from "@/components/website/match/MatchThumbnail";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { getMatchContext, url } from "@/utils/content-utils";

export default {
    name: "Match",
    components: {
        MatchThumbnail
    },
    props: ["id", "hydratedMatch"],
    computed: {
        match() {
            return this.hydratedMatch || ReactiveRoot(this.id, {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        lowerText() {
            if (this.match?.special_event && this.match?.custom_name) {
                const start = (this.match?.event?.short || this.match?.event?.name || "");
                return start ? `${start}: ${this.match.custom_name}` : this.match.custom_name;
            }
            return getMatchContext(this.match);
        }
    },
    methods: { url }
};
</script>

<style scoped>
    .match-lower-text {
        text-align: center;
        width: 100%;
        line-height: 1;
        padding: 4px 0;
        padding-top: calc(4px + 3%) !important;
    }
</style>
