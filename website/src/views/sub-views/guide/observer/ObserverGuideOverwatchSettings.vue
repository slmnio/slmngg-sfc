<template>
    <div>
        <h2>
            Configuring Overwatch
        </h2>
        <p>
            The last step is configuring your Overwatch settings. We have
            <router-link :to="{ name: 'overwatch-settings' }">a separate guide for this</router-link>.
        </p>

        <h3>
            Using the Settings
        </h3>

        <p>
            During the settings setup you set a hotkey to <strong>Show Health Bars</strong>. You need to press this hotkey
            <strong>at the start of every match</strong>, but only after the popup at the bottom of the screen has disappeared.
        </p>
    </div>
</template>
<script>
export default {
    name: "ObserverGuideOverwatchSettings"
};
</script>
