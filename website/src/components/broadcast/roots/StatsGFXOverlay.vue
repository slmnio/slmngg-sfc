<template>
    <div class="stats-gfx-overlay">
        <GenericOverlay v-if="overlayType === 'generic'" :title="title" :broadcast="broadcast" :subtitle="subtitle">
            <GFXLeaderboard v-if="statsType === 'Leaderboard'" :gfx="gfx" :broadcast="broadcast" />
            <!--  TeamLeaderboard v-else-if="gfx.teams" -->
        </GenericOverlay>
    </div>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay.vue";
import GFXLeaderboard from "@/components/broadcast/stats-gfx/GFXLeaderboard.vue";

export default {
    name: "StatsGFXOverlay",
    components: { GFXLeaderboard, GenericOverlay },
    props: {
        gfx: Object,
        broadcast: Object,
        client: Object,
        title: String,
        subtitle: String,
        markdown: String,
    },
    computed: {
        statsType() {
            const gfxType = this.gfx?.type;

            const start = "Stats: ";
            if (gfxType.startsWith(start)) {
                return gfxType.slice(start.length);
            }
            return null;
        },
        overlayType() {
            if (!this.statsType) return null;
            const map = {
                "generic": ["Leaderboard"]
            };
            return Object.entries(map).find(([key, options]) => options.includes(this.statsType))?.[0];
        }
    },
};
</script>

<style scoped>

</style>
