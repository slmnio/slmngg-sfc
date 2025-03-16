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
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";

import soloSetTeams from "@/assets/guide/solo/solo-set-teams.png";
import soloScores from "@/assets/guide/solo/solo-scores.png";

export default {
    name: "SoloOverlayGuideUsage",
    data: () => ({
        selectedBroadcast: null,
        soloSetTeams,
        soloScores
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
