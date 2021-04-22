<template>
    <router-link :to="url('match', match)" class="match no-link-style">
        <MatchThumbnail :match="match" />
        <div class="match-lower-text">{{ lowerText }}</div>
    </router-link>
</template>

<script>
import MatchThumbnail from "@/components/MatchThumbnail";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { url } from "@/utils/content-utils";

export default {
    name: "Match",
    props: ["id"],
    components: {
        MatchThumbnail
    },
    methods: { url },
    computed: {
        match() {
            return ReactiveRoot(this.id, {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        lowerText() {
            const text = [];
            let out = "";

            if (this.match?.event?.short) {
                out = this.match?.event?.short + ": ";
            }

            // sub_event: round
            // week_text: round
            // week
            //

            text.push(this.match?.week_text || "");
            text.push(this.match?.round || "");
            // text.push(this.match?.sub_event || ""); // round > sub_event
            text.push((this.match?.week && (!this.match?.week_text) && `Week ${this.match?.week}`) || ""); // basically regular season
            return out + text.filter((t, i, a) => !!t && a.indexOf(t) === i).join(" · ");
        }
    }
};
</script>

<style scoped>
    .match-lower-text {
        text-align: center;
        width: 100%;
        line-height: 1;
        padding: 4px 0;
    }
</style>
