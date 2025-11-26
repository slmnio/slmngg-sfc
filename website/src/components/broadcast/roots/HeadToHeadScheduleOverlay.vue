<template>
    <GenericOverlay class="head-to-head-schedule-overlay" :title="title || 'Head to Head'" :subtitle="subtitle || `Across all ${broadcast?.event?.name || ''} matches`">
        <transition-group class="break-col break-schedule w-100" name="a--match" tag="div">
            <BreakMatch
                v-for="match in matches"
                :key="match.id"
                class="head-to-head-match"
                :timezone="broadcast.timezone"
                :match="match"
                :expanded="true"
                :live="true"
                :style="{'--auto-font-size': `${Math.min(48, 192 / matches.length)}px`}"
                :schedule-text="getMatchScheduleText(match)"
                :theme-color="themeColor" />
        </transition-group>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay.vue";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { formatText } from "@/utils/content-utils";
import { cleanID } from "shared";
import BreakMatch from "@/components/broadcast/break/BreakMatch.vue";
import { themeBackground1 } from "@/utils/theme-styles";
import { sortMatches } from "@/utils/sorts";

export default {
    name: "HeadToHeadScheduleOverlay",
    components: { BreakMatch, GenericOverlay },
    props: ["broadcast", "title", "subtitle"],
    computed: {
        liveMatch() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast?.live_match?.[0], {
                teams: ReactiveArray("teams", {
                    "theme": ReactiveThing("theme")
                })
            });
        },
        matches() {
            if (!this.liveMatch?.teams?.length) return [];
            const matches = ReactiveArray("matches", {
                "teams": ReactiveArray("teams", {
                    "theme": ReactiveThing("theme")
                })
            })(this.broadcast?.event || {}) || [];


            return matches.filter(match => match.id && match?.teams?.length && (match?.teams || []).every(t => (this.liveMatch?.teams || []).some(lt => {
                return cleanID(lt?.id || lt) === cleanID(t?.id || t);
            }))).sort(sortMatches).map(match => {
                if (cleanID(match?.teams?.[0]?.id) === cleanID(this.liveMatch?.teams?.[0]?.id)) {
                    // no flip
                } else if (cleanID(match?.teams?.[0]?.id) === cleanID(this.liveMatch?.teams?.[1]?.id)) {
                    // flip

                    return {
                        ...match,
                        score_1: match.score_2,
                        score_2: match.score_1,
                        teams: (structuredClone(match.teams)).reverse()
                    };
                }


                return match;
            });
        },
        themeColor() {
            if (!this.broadcast?.event?.theme) return {};
            return themeBackground1(this.broadcast.event);
        }
    },
    methods: {
        formatText,
        getMatchScheduleText(match) {
            if (this.broadcast?.head_to_head_schedule_text_format) {
                return formatText(this.broadcast.head_to_head_schedule_text_format, this.broadcast?.event, match);
            }
            return [match?.sub_event, match?.round].filter(Boolean).join(" - ");
        }
    }
};
</script>

<style scoped>

</style>
