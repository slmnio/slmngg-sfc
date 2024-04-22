<template>
    <div>
        <h2>Introduction</h2>
        <p>
            This guide will walk you through the process of setting up your Overwatch settings to work with our
            production setup.
        </p>

        <h3><i class="fa fa-file mx-1"></i> File Settings</h3>

        <p>
            These settings are stored in a file on your computer and are kept between accounts.
        </p>

        <h4><i class="fa fa-sparkles mx-1"></i> Automatic Settings</h4>
        <p>
            We have a tool that can automatically load the file-based
            settings for you. It'll also automatically backup your current settings which you can restore at any time by
            visiting the tool again. Automatic settings are marked with <i class="fa fa-sparkles mx-1"></i>. <br>
            <a href="/tools/ow-settings" target="_blank">Automatic Settings Tool</a>
        </p>


        <h3><i class="fa fa-user mx-1"></i> Account Settings</h3>

        <p>
            These settings are stored on the Blizzard servers and are unique to each account. Because of this, it's useful
            to have a separate observer account that you can use to configure these settings. <br>
        </p>
    </div>

</template>
<script>
import { BButton } from "bootstrap-vue";
export default {
    components: {
        BButton
    },
    name: "OverwatchSettingsGuideIntro"
};
</script>
