<template>
    <div class="container">
        <h3>Usage</h3>
        <p>As explained in the <router-link :to="{'name': 'solo-overlay-setup'}">setup</router-link>, the solo overlay is controlled by interacting with the browser source.</p>
        <p>By clicking the buttons in the menu module, you can control every aspect of the overlay.</p>

        <h3>Set teams</h3>
        <p>Choosing <kbd>Set Team 1</kbd> or <kbd>Set Team 2</kbd> will let you set the teams of your match. Use the <kbd>Next</kbd> button to cycle through pages of teams.</p>
        <p>If the teams swap sides, you don't need to go searching for them, just use the <kbd>Flip Teams</kbd> button.</p>
        <img alt="Screenshot of the solo overlay showing teams selection" class="guide-image" :src="soloSetTeams">

        <h3 class="mt-3">Set scores</h3>
        <p>Choosing <kbd>Scores</kbd> gives you control over the match score. You can click on the middle <kbd>First to 3</kbd> button to change the maximum score.</p>
        <img alt="Screenshot of the solo overlay showing changing scores" class="guide-image" :src="soloScores">

        <h3 class="mt-3">Set middle text</h3>
        <p>If you're using the normal ingame overlay, you can also set some text for the middle of the screen.</p>
        <img alt="Screenshot of the solo overlay showing the middle text being changed" class="guide-image" :src="soloMiddle">

        <h3 class="mt-3">Other modules</h3>
        <p>There are some other modules that are available for people who want to make more complex shows. You can add more modules to your overlay URL by comma separating them (eg <code>?modules=stacked,desk,rosters</code>)</p>
        <ul>
            <li><code class="mr-1">stacked</code>- The player-focused overlay that shows a simplified version of the overlay.</li>
            <li><code class="mr-1">desk</code>- A lower third that shows the teams and scores.</li>
            <li><code class="mr-1">rosters</code>- A fullscreen rosters overlay, using SLMN.GG data from the teams you select.</li>
            <li><code class="mr-1">break</code>- A fullscreen break overlay. A new timer option will be available in the menu for you to set break timers.</li>
            <li><code class="mr-1">overview</code>- A fullscreen overview overlay. It shows all of the maps of the match so far. New options in the menu will let you set maps and winners.</li>
        </ul>

        <b-alert :model-value="true" variant="warning">
            <b>If you add more modules, you may need to adjust your overlay height and cropping.</b>
            <p class="mb-0">The menu shows what you should set as your browser source's height in the <kbd>Overlay Height</kbd> display.</p>
            <p class="mb-0">Also, changing your overlay height may require you to update cropping across your sources. Give them a check and use the <kbd>Show Guides</kbd> button if you need help.</p>
        </b-alert>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";

import soloSetTeams from "@/assets/guide/solo/solo-set-teams.png";
import soloScores from "@/assets/guide/solo/solo-scores.png";
import soloMiddle from "@/assets/guide/solo/solo-middle.png";

export default {
    name: "SoloOverlayGuideUsage",
    data: () => ({
        selectedBroadcast: null,
        soloSetTeams,
        soloScores,
        soloMiddle
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
