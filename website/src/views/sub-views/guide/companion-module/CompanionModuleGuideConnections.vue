<template>
    <div class="container">
        <section>
            <h2>Connecting to SLMN.GG</h2>
            <p>Your first step is connecting to the SLMN.GG data server, so you can receive data update and make changes.</p>
            <p>In your <b>Connections</b> list, click on your <b>SLMN.GG</b> connection to see its configuration.</p>
            <img :src="companionConfiguration" class="mb-3 rounded" alt="Screenshot of the default configuration of the SLMN.GG module, showing empty client key and token inputs">
            <p>Most of these options will stay as default, but you'll need to input your client key and token.</p>
        </section>
        <section>
            <h3>Client Key</h3>
            <p v-if="authClient?.key">Your client key is <b><copy-text-button>{{ authClient.key }}</copy-text-button></b>.</p>
            <p v-else>You can <router-link to="/login">login</router-link> to see your client key.</p>
            <p>
                Client keys identify you as a member of production staff across multiple broadcasts. If you change your broadcast on the <router-link to="/dashboard">dashboard</router-link>, the content of your
                <router-link :to="{'name':'obs-scene-collections'}">OBS scenes</router-link> or Companion buttons will change to follow. They are generally a lower case version of your username.
            </p>
        </section>
        <section>
            <h3>Token</h3>
            <p>You can grab your token from the dropdown in the top right<span v-if="!authClient"> once logged in</span>.</p>
            <p>As the modal explains, this token gives <b>full access</b> to your account including any permissions you have to edit matches, broadcasts or events. Be careful with it: don't show it on stream or send it to anyone else.</p>
            <img :src="tokenDropdown" class="mb-3 rounded" alt="Screenshot showing the dropdown for a logged-in user on SLMN.GG, pointing at the token option.">
        </section>
        <section>
            <h2>Setting up your Companion Buttons</h2>
            <p>You should now be ready to work on your Companion presets. You're connected to SLMN.GG and your Stream Deck is ready to go. Make sure to get your OBS connected through Companion so you can start to chain your actions together. Companion has some really strong functionality for working between different software and hardware.</p>
            <p>SLMN.GG has some presets to help you, including team side and attacker swaps, displays of team & event logos, and buttons to set map winners. The options are endless, and we'll continue to add new features from SLMN.GG to the Companion module.</p>
            <img :src="teamTheme" class="mb-3 rounded" alt="Screenshot from Companion showing map win buttons of two teams with colours and logos.">
        </section>
        <section>
            <h2>Ideas</h2>
            <h3>Automatic predictions</h3>
            <p>Companion has some awesome functionality, including Triggers. You can watch certain bits of data from OBS, SLMN.GG or anything else you connect and perform actions.</p>
            <img :src="companionMapsPrediction" class="mb-3 rounded" alt="Screenshot from Companion showing a Trigger when OBS has the scene Maps in program, triggering a Twitch map prediction through SLMN.GG">
            <p>For example, this trigger watches for the Maps scene to be in Program, then triggers a Twitch map prediction through SLMN.GG. If the channel you're broadcasting on has Twitch connected, it'll set up a new prediction automatically. In this example, there is a 30000ms delay (30s) to account for a stream delay. You could also resolve predictions on your map win buttons to make fully automatic Twitch predictions!</p>
            <h3>Simple Syncing</h3>
            <img :src="companionSync" class="mb-3 rounded" alt="Screenshot from a Companion page showing 6 observer inputs for synchronising, including buttons to set the remote feed, nudge and toggle buttons and SLMN.GG buttons to turn on and off the remote syncer">
            <p>What about this example of a sync page? This uses the SLMN.GG syncer button that turns on the remote sync scene on the observer's feeds, and OBS buttons to play and pause the incoming feed a few frames at a time to get them lined up perfectly.</p>
            <p>Additionally, the lowest row is a bank of buttons that sets the observers feed based on their key. The observers listed on a match are available in Companion variables and can be mixed with other data to perform these requests.</p>
            <p>
                <pre>{"inputName": "Observer 1 Remote Feed", "inputSettings": {"input": "srt://eu.borpa.business:10000?streamid=play/$(slmngg:staff_observer_1_code)&latency=500000"}}</pre>
            </p>
            <img :src="companionSetObserver" class="mb-3 rounded" alt="Screenshot from a Companion press action triggering a custom OBS command to set a remote feed with data from the SLMN.GG companion module.">
        </section>
    </div>
</template>

<script>
import companionConfiguration from "@/assets/guide/companion_slmngg_configuration.png";
import tokenDropdown from "@/assets/guide/token_dropdown.png";
import teamTheme from "@/assets/guide/companion_slmngg_team_theme.png";
import companionMapsPrediction from "@/assets/guide/companion_maps_prediction.png";
import companionSync from "@/assets/guide/companion_sync.png";
import companionSetObserver from "@/assets/guide/companion_set_observer.png";

import { mapState } from "pinia";
import { useAuthStore } from "@/stores/authStore";
import CopyTextButton from "@/components/website/CopyTextButton.vue";

export default {
    name: "CompanionModuleGuideSetupCompanion",
    components: { CopyTextButton },
    data: function() {
        return {
            companionConfiguration,
            tokenDropdown,
            teamTheme,
            companionMapsPrediction,
            companionSync,
            companionSetObserver
        };
    },
    computed: {
        ...mapState(useAuthStore, {authClient: "client"}),
    },
};
</script>
<style scoped>
img {
    max-width: 100%;
}
</style>
