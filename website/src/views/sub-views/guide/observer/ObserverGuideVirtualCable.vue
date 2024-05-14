<template>
    <div>
        <h2>Virtual Cable</h2>
        <p>
            By using a virtual cable, we can isolate your game audio and only push that to the stream.
        </p>


        <section>
            <h3>Download and Install the Virtual Audio Cable</h3>

            <video
                :src="cableInstall"
                autoplay
                loop
                muted
                height="328"></video>


            <p>
                Download <a href="https://vb-audio.com/Cable/" target="_blank">VB-Audio Cable</a> and extract the ZIP file.
                <br>
                Right-click on <code><strong>VBCABLE_Setup_x64.exe</strong></code> and choose <strong>Run as
                    administrator</strong>.
            </p>

            <b-alert :model-value="true" variant="warning">
                You <strong>must restart</strong> your computer after installing the Virtual Audio Cable.
            </b-alert>
        </section>

        <section>
            <h3>Routing Overwatch to the Virtual Audio Cable</h3>

            <p>
                We now need to route Overwatch's audio to the Virtual Audio Cable.
            </p>

            <b-alert :model-value="true" variant="warning">
                Open Overwatch before starting this section, so it shows in these menus.
            </b-alert>

            <p>
                Open your <strong>Sound Volume Mixer</strong> by <a href="ms-settings:apps-volume">clicking here</a>.
            </p>
            <p>
                Whilst Overwatch is running, expand the corresponding panel and change its Output to <strong>CABLE Input
                    (VB-Audio Virtual Cable)</strong>.<br>
                <strong>Make sure its volume is at 100%.</strong>
            </p>
            <video
                :src="win11AudioRoute"
                autoplay
                muted
                loop
                height="471"></video>


            <b-alert :model-value="true" variant="info">
                You should now no longer hear Overwatch through your speakers or headphones.
                If you do, double-check the settings above.
            </b-alert>
        </section>

        <section>
            <h3>Listening to the Virtual Audio Cable using your headphones</h3>

            <b-tabs content-class="mt-3">
                <b-tab title="Windows 10" active>
                    <p>
                        Open the <strong>Sound Control Panel</strong>. To do this, right-click on the speaker icon in your
                        taskbar and choose <strong>Sounds</strong>.
                    </p>
                </b-tab>
                <b-tab title="Windows 11">
                    <p>
                        Open the <strong>Sound Control Panel</strong>. To do this, open <a href="ms-settings:sound">Sound
                            Settings</a>, scroll to the bottom
                        and click <strong>"More sound settings"</strong>.
                    </p>
                </b-tab>
            </b-tabs>

            <p>
                In the <strong>Recording</strong> tab, find the <strong>CABLE Output</strong> device and head to its
                properties by right-clicking and choosing <strong>Properties</strong>.
            </p>

            <p>
                Navigate to the <strong>Listen</strong> tab, tick <strong>Listen to this device</strong> and choose your
                headphones device in the dropdown, then hit <strong>Apply</strong>.
            </p>

            <video
                :src="soundControl"
                autoplay
                muted
                loop
                height="471"></video>


            <b-alert class="mt-2" :model-value="true" variant="info">
                You should now be able to hear Overwatch again!
            </b-alert>
        </section>

        <section>
            <h3>Adjusting Overwatch volume</h3>

            <p>
                To adjust the volume of the game, <strong>don't alter the in-game volume</strong>. Instead, open <a href="ms-settings:apps-volume">your
                    volume mixer</a> and adjust
                the volume of the <strong>CABLE Output</strong>.
            </p>
        </section>
    </div>
</template>
<script>
import cableInstall from "@/assets/guide/cable_install.webm";
import win11AudioRoute from "@/assets/guide/win11_ow_audio_route.mp4";
import soundControl from "@/assets/guide/sound_control.mp4";

export default {
    name: "ObserverGuideVirtualCable",
    data() {
        return {
            cableInstall,
            win11AudioRoute,
            soundControl,
        };
    }
};
</script>

<style scoped>
section {
    margin-top: 1.5rem;
}

h3 {
    font-size: 1.3rem;
}
</style>
