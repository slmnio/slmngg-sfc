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
        <b-alert variant="warning" show>
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

        <p>
            Perspectives, health bars, move keys, etc.
            TODO LOL <!--TODO -->
        </p>
    </div>
</template>
<script>
import defaultCrosshair from "@/assets/guide/default_crosshair.png";
import { BAlert } from "bootstrap-vue";

export default {
    name: "OverwatchSettingsGuideControls",
    components: { BAlert },
    data: () => ({
        defaultCrosshair
    })
};
</script>
