<template>
  <div>
    <h2>Virtual Cable</h2>
    <p>
      By using a virtual cable, we can isolate your game audio and only push that to the stream.
    </p>

    <h3>Download and Install the Virtual Audio Cable</h3>
    <ul>
      <li>
        Download VB-Audio <a href="https://vb-audio.com/Cable/" target="_blank">here</a>
      </li>
      <li>
        Extract the downloaded ZIP file
      </li>
      <li>
        Right-click on <strong>VBCABLE_Setup_x64.exe</strong> and choose <strong>Run as administrator</strong>
      </li>
      <li>
        Click Install Driver
      </li>
      <li>
        <strong>Restart your computer</strong>
      </li>
    </ul>
    <p>
    </p>

    <div>
      <video :src="cableInstall" autoplay loop muted height="300"></video>
    </div>

    <h3>Routing Overwatch to the Virtual Audio Cable</h3>
    <b-tabs content-class="mt-3">
      <b-tab title="Windows 10" active>
        <b-alert show variant="warning">
          Open Overwatch before starting this section, so it shows in these menus
        </b-alert>
        <p>
          Open your <strong>App volume device preferences</strong> panel.
          You can find this by searching "app volume" in Windows search,
          or by navigating to Settings > System > Sound > App volume device preferences (bottom of the window)
        </p>
        <p>
          Whilst Overwatch is running, change its Output to <strong>CABLE Input (VB-Audio Virtual Cable)</strong>, and
          <strong>ensure its volume is at 100%</strong>. You probably won't hear the game anymore.
        </p>
      </b-tab>
      <b-tab title="Windows 11">
        <b-alert show variant="warning">
          Open Overwatch before starting this section, so it shows in these menus
        </b-alert>
        <p>
          Open your <strong>Sound Volume Mixer</strong>.
          You can find it by searching "sound mixer" in Windows search,
          or by navigating to Settings > System > Sound > Volume Mixer (bottom of the window)
        </p>
        <p>
          Whilst Overwatch is running, expand the corresponding panel and change its Output to <strong>CABLE Input
          (VB-Audio Virtual Cable)</strong>, and <strong>ensure its volume is at 100%</strong>. You probably won't hear
          the game anymore.
        </p>
      </b-tab>
    </b-tabs>

    <h3>Listening to the Virtual Audio Cable using your headphones</h3>
  </div>
</template>
<script>
import cableInstall from "@/assets/guide/cable_install.webm";
import { BAlert, BTab, BTabs } from "bootstrap-vue";

export default {
    name: "Guide",
    data() {
        return {
            cableInstall
        };
    },
    components: {
        BTabs,
        BAlert,
        BTab
    }
};
</script>

<style scoped>
h3 {
    font-size: 1.3rem;
}
</style>
