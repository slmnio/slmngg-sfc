<template>
    <SettingsGuide title="Sound Settings" :tabs="tabs" />
</template>
<script>
import SettingsGuide from "@/components/website/guide/SettingsGuide.vue";

export default {
    name: "OverwatchSettingsGuideSound",
    components: { SettingsGuide },
    data: () => ({
        tabs: [
            {
                title: "General",
                settings: [
                    {
                        title: "Master Volume",
                        description: "100%",
                        type: "file",
                        automated: "basic"
                    },
                    {
                        title: "Sound Effects Volume",
                        description: "100%",
                        type: "file",
                        automated: "basic"
                    },
                    {
                        title: "Music Volume",
                        description: "69%",
                        type: "file",
                        automated: "basic"
                    },
                    {
                        title: "In-Game Voice Volume",
                        description: "100%",
                        type: "file",
                        automated: "basic"
                    },
                    {
                        title: "Spatial Audio",
                        description: "System Settings",
                        type: "file",
                        automated: "basic"
                    },
                    {
                        title: "Audio Mix",
                        description: "Headphones",
                        type: "file",
                        automated: "basic"
                    },
                    {
                        title: "Play Sound when Enemy eliminated",
                        description: "Off",
                        type: "account"
                    },
                    {
                        title: "Play Sound when Teammate eliminated",
                        description: "Off",
                        type: "account"
                    }
                ]
            }
        ]
    })
};
</script>
