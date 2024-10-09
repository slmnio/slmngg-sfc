<template>
    <div class="container">
        <section>
            <h2>Setting up Companion</h2>
            <p>
                <a href="https://user.bitfocus.io/download/companion" target="_blank">Download and install Companion</a>
                from Bitfocus' website. You'll need to create a free user account to get to their downloads. Choose the
                most recent Stable version of Companion.
            </p>
            <img class="rounded mb-3" :src="companionDownloads" alt="Screenshot of Companion's download page.">

            <p>
                The setup process of Companion is pretty simple, just follow the wizard's questions.
            </p>
        </section>

        <section>
            <h2>Connecting your Stream Deck</h2>
            <p>
                There are two ways to connect Companion to your Stream Deck, either letting Companion directly connect, or by passing through the Elgato Stream Deck app.
            </p>
            <p>
                If you already use your Stream Deck through the Elgato app, you may want to pass through the Companion buttons so you can continue to use your presets. Otherwise, let Companion directly connect. Companion is able to handle most tasks that the Stream Deck app can, and has lots more integration with production hardware and software.
            </p>

            <b-tabs content-class="mt-3">
                <b-tab title="Direct connection" active>
                    <p>Make sure the Elgato Stream Deck app is closed and launch Companion.</p>
                    <p>Click <b>Launch GUI</b> and you'll be taken to the web interface.</p>
                    <img class="rounded mb-3" :src="companionMain" alt="Screenshot of Companion's main page, showing a Launch GUI button.">
                    <p>Head to the <b>Surfaces</b> tab. If you don't see your Stream Deck, press <b>Rescan USB</b>.</p>
                    <img class="rounded mb-3" :src="companionSurfaces" alt="Screenshot of Companion's surfaces page from the web interface, showing connected a Stream Deck.">
                    <p>You should see your devices connected and showing Companion's buttons.</p>
                </b-tab>
                <b-tab title="With the Elgato Stream Deck app">
                    <!-- TODO: need someone using companion & stream deck here -->
                    <p>If you wish to use the Elgato Stream Deck app, you have two options:</p>
                    <ul>
                        <li>You can use the app to change between profiles, with a dedicated Companion profile.</li>
                        <li>You can set up a dedicated Companion page, using the Companion plugin and pass through the buttons that way.</li>
                    </ul>
                </b-tab>
            </b-tabs>
        </section>
    </div>
</template>

<script>
import companionDownloads from "@/assets/guide/companion_downloads.png";
import companionMain from "@/assets/guide/companion_main_gui.png";
import companionSurfaces from "@/assets/guide/companion_surfaces.png";

export default {
    name: "CompanionModuleGuideSetupCompanion",
    data: function() {
        return {
            companionDownloads,
            companionMain,
            companionSurfaces
        };
    }
};
</script>
<style scoped>
img {
    max-width: 100%;
}
</style>
