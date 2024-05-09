<template>
    <div>
        <h2>Automatic Settings Tool</h2>
        <p>
            This tool will automatically apply some settings
        </p>

        <ToolOWProfile />
    </div>
</template>

<script>
import ToolOWProfile from "@/components/website/guide/ToolOWProfile.vue";

export default {
    name: "OverwatchSettingsGuideTool",
    components: { ToolOWProfile }
};
</script>
