<template>
    <div class="container">
        <LearnTitleChip title="Tools" subtitle="Overwatch Settings Switcher" />
        <p>
            You'll need some specific Overwatch settings to make sure our stream looks consistent and professional.
            This tool can automatically load some of the settings for you.
        </p>

        <h3>Automatic Overwatch Settings</h3>
        <ToolOWProfile />
    </div>
</template>

<script setup>
import { useHead } from "@unhead/vue";
import ToolOWProfile from "@/components/website/guide/ToolOWProfile.vue";
import LearnTitleChip from "@/components/website/guide/LearnTitleChip.vue";

useHead({
    title: "Overwatch Settings Switcher"
});
</script>
