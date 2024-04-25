<template>
    <GenericOverlay class="multi-standings-overlay" :title="title || 'Standings'" :full="full">
        <div class="all-standings-holder">
            <div class="standings-holder" v-for="standings in standingsGroups" :key="standings.title">
                <Standings :event="event" :stage="standings.group" :use-codes="useCodes" :override-show-columns="showColumns"
                           :tie-text="standings && standings.tieText" :title="standings.short || standings.title"></Standings>

                <!--            event: Object,-->
                <!--            stage: String,-->
                <!--            title: String,-->
                <!--            tieText: String,-->
                <!--            showMapDiff: Boolean-->
            </div>
        </div>
    </GenericOverlay>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import Standings from "@/components/broadcast/Standings";

export default {
    name: "MultiStandingsOverlay",
    components: { GenericOverlay, Standings },
    props: ["broadcast", "title", "stageCodes", "showColumns", "useCodes", "full"],
    computed: {
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
            return ReactiveRoot(this.broadcast.event.id, {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        blocks() {
            if (!this.event || !this.event.blocks) return null;
            try {
                const blocks = JSON.parse(this.event.blocks);
                return blocks || null;
            } catch (e) {
                return null;
            }
        },
        standingsGroups() {
            if (!this.stageCodes?.length) return this.blocks?.standings;
            return (this.blocks?.standings || []).filter(standings => this.stageCodes.some(code => standings.group === code || standings.key === code));
        }
    },
    head() {
        return {
            title: `Multi Standings ${this.stageCodes} | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .standings:deep(.team-name) {
        color: inherit !important;
    }
    .all-standings-holder {
        display: flex;
        justify-content: space-around;
        align-items: flex-start;
        width: 100%;
    }
    .standings:deep(.standings-header .team-name) {
        margin-right: 1.5em;
    }
</style>
