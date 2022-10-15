<template>
    <GenericOverlay :title="title || (stageTitle ? `Standings: ${stageTitle}` : 'Standings')">
        <Standings class="standings" :event="event" :stage="_stage" :tie-text="standingsSettings && standingsSettings.tieText" />
    </GenericOverlay>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import Standings from "@/components/broadcast/Standings";

export default {
    name: "StandingsOverlay",
    components: { GenericOverlay, Standings },
    props: ["broadcast", "title", "stage"],
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
        _stage() {
            return this.stage || this.broadcast?.current_stage;
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
        standingsSettings() {
            return (this.blocks?.standings || []).find(s => s.group === this._stage);
        },
        stageTitle() {
            return this.standingsSettings?.short || this.standingsSettings?.title || this._stage;
        }
    },
    metaInfo() {
        return {
            title: `Standings ${this._stage || ""} | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .standings >>> .team-name {
        color: inherit !important;
    }
</style>
