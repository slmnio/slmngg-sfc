<template>
    <SettingsGuide title="Accessibility Settings" :tabs="tabs" />
</template>
<script>
import SettingsGuide from "@/components/website/guide/SettingsGuide.vue";

export default {
    name: "OverwatchSettingsGuideAccessibility",
    components: { SettingsGuide },
    data: () => ({
        tabs: [
            {
                title: "General",
                settings: [
                    {
                        title: "Camera Shake",
                        description: "Reduced",
                        type: "account"
                    },
                    {
                        title: "HUD Shake",
                        description: "Off",
                        type: "account"
                    }
                ]
            },
            {
                title: "Subtitles",
                settings: [
                    {
                        title: "Game Subtitles",
                        description: "None",
                        type: "account"
                    }
                ]
            },
            {
                title: "Color Blindness",
                settings: [
                    {
                        title: "Color Blind Filter",
                        description: "Off",
                        type: "account"
                    },
                    {
                        title: "Enemy UI Color",
                        description: "Red (Enemy Default)",
                        type: "account"
                    },
                    {
                        title: "Friendly UI Color",
                        description: "Blue (Friendly Default)",
                        type: "account"
                    },
                    {
                        title: "Group UI Color",
                        description: "Lawn Green (Group Default)",
                        type: "account"
                    },
                    {
                        title: "Alert UI Color",
                        description: "Tangerine (Alert Default)",
                        type: "account"
                    },
                    {
                        title: "Health Color",
                        description: "White (Health Default)",
                        type: "account"
                    },
                    {
                        title: "Armor Color",
                        description: "Orange (Armor Default)",
                        type: "account"
                    },
                    {
                        title: "Shield Color",
                        description: "Blue (Shield Default)",
                        type: "account"
                    },
                    {
                        title: "Overhealth Color",
                        description: "Green (Overhealth Default)",
                        type: "account"
                    }

                ]
            },
            {
                title: "Text to Speech",
                settings: [
                    {
                        title: "Enable Chat Text to Speech",
                        description: "Off",
                        type: "account"
                    },
                    {
                        title: "Speech to Text",
                        description: "Off",
                        type: "account"
                    }
                ]
            }
        ]
    })
};
</script>
