<template>
    <BApp>
        <div id="slmngg-app">
            <router-view />
        </div>
    </BApp>
</template>

<style scoped>
    #slmngg-app {
        background: transparent;
    }
    body {
        background-color: #202020;
    }
</style>
<script setup lang="ts">
import {BApp} from "bootstrap-vue-next";
</script>
