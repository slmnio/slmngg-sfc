<template>
    <Sponsors class="sponsor-overlay" :sponsors="sponsorThemes"/>
</template>

<script>
import Sponsors from "@/components/broadcast/Sponsors";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
export default {
    name: "SponsorOverlay",
    components: { Sponsors },
    props: ["broadcast"],
    computed: {
        sponsorThemes() {
            if (!this.broadcast?.sponsors) return null;
            return ReactiveArray("sponsors", {
                theme: ReactiveThing("theme")
            })(this.broadcast);
        }
    },
    metaInfo() {
        return {
            title: `Sponsors | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .sponsor-overlay {
        padding: 0;
    }
    .sponsor-overlay >>> .sponsors-holder {
        height: 100vh;
    }
</style>
