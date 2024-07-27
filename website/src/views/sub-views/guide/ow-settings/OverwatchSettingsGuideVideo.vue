<template>
    <SettingsGuide title="Video Settings" :tabs="tabs" />
</template>
<script>
import SettingsGuide from "@/components/website/guide/SettingsGuide.vue";
export default {
    name: "OverwatchSettingsGuideVideo",
    components: {
        SettingsGuide
    },
    data: () => ({
        tabs: [
            {
                title: "Video",
                settings: [
                    {
                        title: "Display Mode",
                        description: "Borderless Windowed",
                        type: "file",
                        automated: "advanced",
                        tooltip: "Reduces performance a bit. Without this, you can't alt-tab out of the game without it showing on stream."
                    },
                    {
                        title: "Field of View",
                        description: "103",
                        type: "file",
                        automated: false
                    },
                    {
                        title: "Aspect Ratio",
                        description: "16:9",
                        type: "file",
                        automated: false
                    },
                    {
                        title: "Dynamic Render Scale",
                        description: "Off",
                        type: "file",
                        automated: "advanced"
                    },
                    {
                        title: "Render Scale",
                        description: "Custom",
                        type: "file",
                        automated: "advanced"
                    },
                    {
                        title: "In-Game Resolution",
                        description: "100%",
                        type: "file",
                        automated: false
                    },
                    {
                        title: "Frame Rate",
                        description: "Custom",
                        type: "file",
                        automated: "advanced"
                    },
                    {
                        title: "Maximum Frame Rate",
                        description: "63",
                        type: "file",
                        automated: "advanced",
                        tooltip: "Ensures that the game doesn't use too much CPU. You can set this higher if your PC can handle it."
                    },
                    {
                        title: "V-Sync",
                        description: "Off",
                        type: "file",
                        automated: "advanced"
                    },
                    {
                        title: "Triple Buffering",
                        description: "Off",
                        type: "file",
                        automated: "advanced"
                    },
                    {
                        title: "Reduce Buffering",
                        description: "On",
                        type: "file",
                        automated: "advanced"
                    },
                    {
                        title: "HDR",
                        description: "Off",
                        type: "file",
                        automated: "basic"
                    }
                ]
            },
            {
                title: "Graphics Quality",
                settings: [
                    {
                        title: "Antialias Quality",
                        description: "Medium or Higher",
                        type: "file",
                        automated: "advanced"
                    },
                    {
                        title: "Texture Quality",
                        description: "High",
                        type: "file",
                        automated: "advanced"
                    }
                ],
                endtext: "Other settings should be set to a level that your PC can handle."
            },
            {
                title: "Details",
                settings: [
                    {
                        title: "Display Performance Stats",
                        description: "Off",
                        type: "file",
                        automated: "basic"
                    },
                    {
                        title: "Display System Clock",
                        description: "Off",
                        type: "file",
                        automated: "basic"
                    }
                ]
            },
            {
                title: "Broadcast Margins",
                alert: "Broadcast Margins are an important setting that can only be changed in the settings file. The tool will automatically set these for you.",
                settings: [
                    {
                        title: "Broadcast Margin Top",
                        description: "0.5",
                        type: "file",
                        automated: "basic"
                    },
                    {
                        title: "Broadcast Margin Bottom",
                        description: "0",
                        type: "file",
                        automated: "basic"
                    },
                    {
                        title: "Broadcast Margin Left",
                        description: "0",
                        type: "file",
                        automated: "basic"
                    },
                    {
                        title: "Broadcast Margin Right",
                        description: "0",
                        type: "file",
                        automated: "basic"
                    }
                ]
            }
        ]
    })
};
</script>
