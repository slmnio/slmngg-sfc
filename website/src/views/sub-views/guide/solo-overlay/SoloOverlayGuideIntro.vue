<template>
    <div class="container">
        <p>
            The <b>SLMN.GG Solo Overlay</b> is a small all-in-one overlay used for external or player streams.
        </p>
        <p>
            The idea is to give people access to the broadcast overlays and data from SLMN.GG without giving them full access to edit everything. We use some OBS features that make it easy for you to control your own overlay fully independently.
        </p>
        <p>
            This guide will walk you through how to install and operate the solo overlay.
        </p>

        <img class="guide-image" :src="soloOverlayExample" alt="Screenshot of the context menu of a browser source in OBS with the option 'Interact' highlighted">
    </div>
</template>

<script>
import soloOverlayExample from "@/assets/guide/solo/solo-overlay-shown.png";

export default {
    name: "SoloOverlayGuideIntro",
    data: () => ({
        soloOverlayExample
    }),
};
</script>
