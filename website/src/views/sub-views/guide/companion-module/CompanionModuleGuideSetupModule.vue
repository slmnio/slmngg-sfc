<template>
    <div class="container">
        <section>
            <h2>Installing the SLMN.GG module</h2>
            <p>
                Whilst there are many hardware and software controls built directly into Companion, the SLMN.GG module is built separately. Therefore, we'll be installing this as a developer module, as if we were working on it.
            </p>
        </section>
        <section>
            <h2>Creating Developer Modules</h2>
            <p>First, navigate to your Companion program. You'll find it in your notification area in the bottom right of the taskbar.</p>
            <img :src="companionNotificationArea" class="rounded mb-3" alt="Screenshot showing Companion running in the notification area.">
            <p>Click on the cog wheel in the top right to enable developer modules.</p>
            <img :src="companionDeveloper" class="rounded mb-3" alt="Screenshot showing the red Companion main program, and the cog wheel in the top right..">
            <p>A new section will appear at the bottom for a path to your developer modules folder.</p>
            <p>Create a new folder for your developer modules to go in. This can be as simple as <b>Documents/Companion Modules</b>. Once you've made the folder, set it as the modules path here.</p>
        </section>
        <section>
            <h2>Installing the module</h2>
            <p>All of the code for the SLMN.GG Companion module is on <a href="https://github.com/slmnio/companion-module-slmngg" target="_blank"><i class="fab fa-fw fa-github"></i> GitHub</a>, and we'll use a batch file from there to install everything needed in one go.</p>
            <p>Download <a href="https://github.com/slmnio/companion-module-slmngg/blob/master/full-setup.bat" target="_blank">the full setup file</a> by pressing the <i class="fas fa-download"></i> Download button in the top right.</p>
            <p>This file does the following:</p>
            <ul>
                <li>
                    Installs <a href="https://git-scm.com/" target="_blank">Git</a>, a version control system, and
                    <a href="https://nodejs.org/en" target="_blank">Node.js</a>, a JavaScript runtime that the module runs on. Companion itself runs on Node, but since this is a developer module, we have to install our own.
                </li>
                <li>
                    Downloads and saves all of the module files to a new folder, and installs all dependencies.
                </li>
            </ul>
            <p>Move this file into your Companion Modules folder, then run it.</p>
            <p>Windows SmartScreen may stop you, since this is an uncommonly downloaded file and malicious batch files can do damage to your PC. Hit <b>More info</b> and <b>Run anyway</b> to bypass it.</p>
            <img class="rounded mb-3" :src="smartscreen" alt="Windows SmartScreen stopping the user from running a file">
            <p>You'll see some command prompt windows working hard.</p>
        </section>
        <section>
            <h2>Confirming installation</h2>
            <p>If the command prompt windows all closed normally, you're probably good to go!</p>
            <p>Go to the <b>Connections</b> page of the Companion web interface and search for <b>SLMN</b> in the <b>Add connection</b> panel. The SLMN.GG Controller should be listed. You can hit add and start playing with the module!</p>
            <img :src="companionInstalled" class="rounded mb-3">
        </section>
    </div>
</template>

<script>
import companionNotificationArea from "@/assets/guide/companion_notification_area.png";
import companionDeveloper from "@/assets/guide/companion_main_developer.png";
import smartscreen from "@/assets/guide/smartscreen.png";
import companionInstalled from "@/assets/guide/companion_slmn_installed.png";
export default {
    name: "CompanionModuleGuideSetupModule",
    data: function() {
        return {
            companionNotificationArea,
            companionDeveloper,
            smartscreen,
            companionInstalled
        };
    }
};
</script>
<style scoped>
img {
    max-width: 100%;
}
</style>
