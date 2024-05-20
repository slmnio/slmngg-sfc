<template>
    <div class="container">
        <LearnTitleChip style="font-size: 1.5em;" subtitle="Beta" />

        <p>
            Welcome to SLMN.GG Learn! This is a list of all resources we use for running our productions.
        </p>

        <h2>Guides</h2>

        <ul>
            <li>
                <router-link :to="{ name: 'observing-tech-guide' }">Observer Tech Guide</router-link>
            </li>
            <li>
                <router-link :to="{ name: 'overwatch-settings' }">Overwatch Settings Guide</router-link>
            </li>
            <li style="opacity: 0.8">
                SLMN.GG Companion Module Guide (coming soon)
                <!-- <router-link :to="{ name: 'companion-module' }">SLMN.GG Companion Module Guide</router-link> -->
            </li>
        </ul>


        <h2>Tools</h2>

        <ul>
            <li>
                <router-link :to="{ name: 'overwatch-settings-switcher' }">Overwatch Settings Switcher</router-link>
            </li>
            <li>
                <router-link :to="{ name: 'obs-scene-collections' }">OBS Scene Collections</router-link>
            </li>
            <li>
                <router-link :to="{ name: 'bracket-creator' }">Bracket Creator</router-link>
            </li>
            <li>
                <router-link :to="{ name: 'twitch-auth' }">Connect Twitch channel to SLMN.GG</router-link>
            </li>
        </ul>

        <h2>Reference</h2>
        <ul>
            <li>
                <router-link :to="{ name: 'broadcast-routes' }">Broadcast Routes</router-link>
            </li>
            <li>
                <router-link :to="{ name: 'standings' }">Standings</router-link>
            </li>
        </ul>


        <h2>Quick Links</h2>

        <ul>
            <li>
                <a href="https://borpa.business" target="_blank">List of active SRT feeds <i class="fas fa-external-link ml-1"></i></a>
            </li>
        </ul>
    </div>
</template>
<script>

import LearnTitleChip from "@/components/website/guide/LearnTitleChip.vue";

export default {
    name: "Learn",
    components: {LearnTitleChip}
};
</script>
