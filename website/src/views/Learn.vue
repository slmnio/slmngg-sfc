<template>
    <div class="container">
        <h1>SLMN.GG Learn</h1>

        <p>
            Welcome to SLMN.GG Learn! This is a list of all resources we use for running our productions.
        </p>

        <h2>Guides</h2>

        <ul>
            <li>
                <router-link to="/learn/guides/observing-tech">Observer Tech Guide</router-link>
            </li>
            <li>
                <router-link to="/learn/guides/ow-settings">Overwatch Settings Guide</router-link>
            </li>
            <li>
                <router-link to="/learn/guides/companion-module">SLMN.GG Companion Module</router-link>
            </li>
        </ul>

        <h2>Tools</h2>

        <ul>
            <li>
                <router-link to="/tools/ow-settings">Overwatch Settings Switcher</router-link>
            </li>
            <li>
                <router-link to="/tools/obs-scene-collections">OBS Scene Collections</router-link>
            </li>
            <li>
                <router-link to="/tools/broadcast-routes">Broadcast Routes</router-link>
            </li>
            <li>
                <router-link to="/tools/standings">Standings</router-link>
            </li>
            <li>
                <router-link to="/tools/bracket-creator">Bracket Creator</router-link>
            </li>
            <li>
                <router-link to="/tools/twitch-auth">Connect Twitch channel to SLMN.GG</router-link>
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
<script lang="ts">

export default {
    name: "Learn"
};
</script>
