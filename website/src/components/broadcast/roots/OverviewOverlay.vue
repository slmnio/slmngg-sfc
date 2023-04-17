<template>
    <div class="overview-overlay">
        <div class="part part-desk-match">
            <DeskMatch class="desk-match" :matchID="matchID" :_match="virtualMatch"/>
        </div>
        <div class="part part-map-display flex-grow-1">
            <MapDisplay :broadcast="broadcast" use-transitions="true" :virtual-match="virtualMatch" />
        </div>
    </div>
</template>

<script>
import MapDisplay from "@/components/broadcast/MapDisplay";
import DeskMatch from "@/components/broadcast/desk/DeskMatch";
export default {
    name: "OverviewOverlay",
    components: { DeskMatch, MapDisplay },
    props: ["broadcast", "virtualMatch"],
    computed: {
        matchID() {
            if (this.virtualMatch) return null;
            if (!this.broadcast?.live_match) return null;
            return this.broadcast.live_match[0];
        }
    },
    metaInfo() {
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

.desk-match >>> .team-name,
.desk-match >>> .match-vs,
.desk-match >>> .team-logo-holder {
    height: 120px !important;
}
.part-map-display >>> .map-lower {
    padding: 10px;
}
</style>
