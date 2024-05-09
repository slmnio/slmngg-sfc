<template>
    <div>
        <h2>
            Setting up our Scene Collection
        </h2>

        <p>
            We use a custom OBS Scene Collection for our observers that enable us to show player cams, team logos, and sync our feeds.
        </p>

        <h3>Get a customized OBS Scene Collection</h3>

        <p>
            Visit our <a href="/tools/obs-scene-collections" target="_blank">tools page</a> to download the latest version of our OBS Scene Collection.
            <br>
            Choose a client name (usually your username) and pick the <strong>"Observing"</strong> profile.
            Pick the keybinds you want to use for switching between different players and download the file.
        </p>

        <h3>
            Import it into OBS
        </h3>

        <p>
            Open OBS and go to <strong>Scene Collection > Import</strong>. Select the file you downloaded and press <strong>Import</strong>.
            <br>
            Open the <strong>Scene Collection</strong> dropdown and select the profile you just imported.
        </p>

        <h3>Selecting your Cable</h3>
        <p>
            In the <strong>Observing Scene</strong>, double click on the <strong>Overwatch Audio Cable</strong> source.
            <br>
            Choose the <strong>CABLE Input (VB-Audio Virtual Cable)</strong> you installed earlier.
        </p>

        <h3>
            Testing it out
        </h3>

        <p>
            Launch Overwatch and make sure you can see it fully fill the screen in OBS. There should be no black bars or window borders.
            <br>
            If you see black bars, you may need to adjust the <strong>Overwatch source</strong> settings or change your <strong>Overwatch resolution</strong>.
        </p>

        <b-alert :model-value="true">You should be able to <strong>see Overwatch's audio levels</strong> for the source in the <strong>OBS Audio Mixer</strong>.</b-alert>

        <p>
            At this point you can test out streaming to our server. You can stream to it at any time if you need to test your connection.
        </p>
    </div>
</template>

<script>
export default {
    name: "GuideObsSetup",
};
</script>
