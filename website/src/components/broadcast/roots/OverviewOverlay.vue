<template>
    <div class="overview-overlay">
        <div class="part part-desk-match" :class="{'live-desk flex-center': useLiveDesk}">
            <DeskMatch class="desk-match w-100" :matchID="matchID" :_match="virtualMatch" :broadcast="useLiveDesk ? broadcast : null" />
        </div>
        <div class="part part-map-display flex-grow-1">
            <MapDisplay :broadcast="broadcast" use-transitions="true" :virtual-match="virtualMatch" :no-map-videos="noMapVideos" />
        </div>
    </div>
</template>

<script>
import MapDisplay from "@/components/broadcast/BroadcastMapDisplay";
import DeskMatch from "@/components/broadcast/desk/DeskMatch";
export default {
    name: "OverviewOverlay",
    components: { DeskMatch, MapDisplay },
    props: ["broadcast", "virtualMatch", "noMapVideos", "useLiveDesk"],
    computed: {
        matchID() {
            if (this.virtualMatch) return null;
            if (!this.broadcast?.live_match) return null;
            return this.broadcast.live_match[0];
        }
    },
    head() {
        return {
            title: `Overview | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>

.overview-overlay {
    position: absolute;
    overflow: hidden;
    background: transparent;
    background-color: transparent;

    height: 100%;
    width: 100%;
    color: white;
    font-family: "SLMN-Industry", "Industry", sans-serif;

    padding: 60px 100px;

    display: flex;
    flex-direction: column;
}
.part + .part {
    padding-top: 60px;
}

.desk-match:deep(.team-name),
.desk-match:deep(.match-vs),
.desk-match:deep(.team-logo-holder) {
    height: 120px !important;
}
.part-map-display:deep(.map-lower) {
    padding: 10px;
}
.part-desk-match.live-desk {
    height: 140px;
}
</style>
