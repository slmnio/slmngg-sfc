<template>
    <div>
        <h2>Control Settings</h2>
        <h3>Crosshair</h3>

        <p>
            Your crosshair <strong>must be the default one on all heroes</strong>. Ideally, restore the default
            crosshair settings for all heroes.
            The generic crosshair looks like this, but some heroes have a different default crosshair.
        </p>

        <img class="mb-2" :src="defaultCrosshair" width="600">


        <h3>Suggested Controls</h3>
        <b-alert variant="warning" :model-value="true">
            All of this is personal preference, these are just some of the suggested keybinds that work for us.
        </b-alert>

        <h4>Controller</h4>

        <p>
            Okay, this one is really up to you. Check out this <a
                href="https://youtu.be/54lkPoLOmok?t=50">Broadcast.gg Tutorial</a> for what the options do.
        </p>

        <h4>Lobby Shortcuts</h4>

        <p>
            Under Interface, set yourself a keybind for pausing the game. It should be something memorable, but not
            something you'll hit by accident.
            A lot of use use <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>=</kbd> or <kbd>Pause</kbd>.
        </p>

        <h4>Spectate Options</h4>

        <div v-for="option in options">
            {{ option.name }}
            <img
                v-for="button in option.keyboard"
                :src="`/assets/input_icons/knb/dark/${button}_Key_Dark.png`"
                height="35">
            <img
                v-for="button in option.controller"
                :src="`/assets/input_icons/xbox/XboxSeriesX_${button}.png`"
                height="35">
        </div>
    </div>
</template>
<script>
import defaultCrosshair from "@/assets/guide/default_crosshair.png";

export default {
    name: "OverwatchSettingsGuideControls",
    data: () => ({
        defaultCrosshair,
        options: [
            {
                name: "Spectate Toggle Overlay",
                keyboard: ["Ctrl", "I"],
                controller: ["X"]
            },
            {
                name: "Spectate Toggle 3p",
                keyboard: ["Space"],
                controller: ["A"]
            },
            {
                name: "Show Objective Markers",
                keyboard: ["R"],
                controller: ["Y"]
            },
            {
                name: "Spectate Target Under Reticle",
                keyboard: ["Mouse_Right"],
                controller: ["B"]
            },
            {
                name: "Show Health Bars",
                keyboard: ["H"],
                controller: ["Dpad_Up"]
            },
            {
                name: "Modify FOV",
                keyboard: [],
                controller: ["Dpad_Down"]
            },
            {
                name: "Move Fast",
                keyboard: ["Shift"],
                controller: ["RT"]
            },
            {
                name: "Move Slow",
                keyboard: ["Ctrl"],
                controller: ["LT"]
            },
            {
                name: "Move Down",
                keyboard: ["Q"],
                controller: ["LB"]
            },
            {
                name: "Move Up",
                keyboard: ["E"],
                controller: ["RB"]
            },
            {
                name: "Decrease Speed / Zoom Out",
                keyboard: [],
                controller: ["Dpad_Left"]
            },
            {
                name: "Increase Speed / Zoom In",
                keyboard: [],
                controller: ["Dpad_Right"]
            }
        ]
    })
};
</script>
