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

        <p>
            We've been migrating over to showing player's crosshairs instead of a generic one. In this
            case, you can leave the crosshairs however you want them.
        </p>

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
            A lot of use use <InputImage type="kb" value="Ctrl" />  <InputImage type="kb" value="Shift" /><InputImage type="kb" value="Plus" />.
        </p>

        <h4>Spectate Options</h4>

        <table class="table table-sm table-dark table-hover table-bordered">
            <thead>
                <tr>
                    <th>Setting</th>
                    <th>Keyboard</th>
                    <th>Controller</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="option in options" :key="option.name">
                    <td>{{ option.name }}</td>
                    <td class="text-center">
                        <template v-if="option.keyboard_override">{{ option.keyboard_override }}</template>
                        <InputImage
                            v-for="button in option.keyboard"
                            v-else
                            :key="button"
                            type="kb"
                            :value="button" />
                    </td>
                    <td class="text-center">
                        <InputImage v-for="button in option.controller" :key="button" type="xbox" :value="button" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
import defaultCrosshair from "@/assets/guide/default_crosshair.png";
import InputImage from "@/components/website/guide/InputImage.vue";

export default {
    name: "OverwatchSettingsGuideControls",
    components: { InputImage },
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
                keyboard_override: "Scroll Down",
                controller: ["Dpad_Left"]
            },
            {
                name: "Increase Speed / Zoom In",
                keyboard: [],
                keyboard_override: "Scroll Up",
                controller: ["Dpad_Right"]
            }
        ]
    })
};
</script>
