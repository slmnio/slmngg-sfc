<template>
    <div class="quad-tally-dot">
        <TallyDot :client="client" :align="align" class="mini-dot" :number="1" />
        <TallyDot :client="client" :align="align" class="mini-dot" :number="2" />
        <TallyDot :client="client" :align="align" class="mini-dot" :number="3" />
        <TallyDot :client="client" :align="align" class="mini-dot" :number="4" />
    </div>
</template>

<script>
import TallyDot from "@/components/broadcast/roots/TallyDot.vue";

export default {
    name: "QuadTallyDot",
    components: { TallyDot },
    props: ["client", "align"],
    data: () => ({
        noBroadcastStyle: true,
        noStinger: true
    })
};
</script>

<style scoped>
    .mini-dot {
        width: 100vw;
        height: 100vh;
        zoom: 0.5;
    }

    .mini-dot:nth-child(1) {
        bottom: auto;
        top: 0;
        left: 0;
        right: auto;
    }
    .mini-dot:nth-child(2) {
        bottom: auto;
        top: 0;
        left: auto;
        right: 0;
    }
    .mini-dot:nth-child(3) {
        bottom: 0;
        top: auto;
        left: 0;
        right: auto;
    }
    .mini-dot:nth-child(4) {
        bottom: 0;
        top: auto;
        left: auto;
        right: 0;
    }
</style>
