<template>
    <div class="container">
        <h3>Overview</h3>
        <p>The solo overlay is controlled by using the OBS browser source interact feature. By right clicking on any browser source in OBS, you can click on anything, just like your browser.</p>
        <p>We split different parts of the overlay up so it can be cropped in OBS. We can reuse the browser source all over OBS with different cropping points.</p>

        <h3>Interacting with the browser source</h3>
        <p>By right clicking the browser source in the source list or on the canvas, you can choose <kbd>Interact</kbd> to bring up a new controllable window.</p>

        <img alt="Screenshot of an OBS Browser Source properties screen" class="guide-image" :src="obsInteractSource">

        <p>The solo overlay is built from multiple modules and contains a menu section filled with buttons. You can control the whole overlay just by clicking these buttons.</p>
        <p>As part of setup, choose the menu button <kbd>Show Guides</kbd> so we can show the modules more clearly. Each module be highlighted in a box as shown:</p>

        <img alt="Screenshot of the solo overlay with Show Guides enabled, showing the module details and OBS cropping instructions" class="guide-image" :src="soloShowGuides">

        <p>Each module shows how tall it is (in brackets) and what you need to put into the OBS transform window to crop it correctly.</p>

        <h3>Cropping the overlay</h3>

        <p>
            To open the OBS transform editor, either select it by clicking and press <kbd>Ctrl+E</kbd>, or right click and select <kbd>Transform > Edit Transform</kbd>.
        </p>

        <p>Use the values from the black box of the module you want to crop to. For this example, we're cropping to the <code>ingame-stacked</code> module on the bottom.</p>

        <img alt="Screenshot of the OBS transform editor with the cropping section highlighted" class="guide-image" :src="obsTransform">

        <p>Now that your module is cropped properly, interact with the browser source again and press <kbd>Hide Guides</kbd>.</p>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";

import obsInteractSource from "@/assets/guide/solo/OBS-interact-source.png";
import obsTransform from "@/assets/guide/solo/OBS-tranform-window.png";
import soloShowGuides from "@/assets/guide/solo/solo-show-guides.png";

export default {
    name: "SoloOverlayGuideSetup",
    data: () => ({
        selectedBroadcast: null,
        obsInteractSource,
        obsTransform,
        soloShowGuides
    }),
    computed: {
        broadcasts() {
            return ReactiveRoot("special:solo-broadcasts", {
                "broadcasts": ReactiveArray("broadcasts", {
                    "event": ReactiveThing("event", {
                        "theme": ReactiveThing("theme")
                    })
                })
            })?.broadcasts;
        },
        overlayURL() {
            if (!this.selectedBroadcast?.key) return null;
            return `https://slmn.gg/broadcast/${this.selectedBroadcast?.key}/solo?modules=stacked`;
        }
    },
};
</script>
