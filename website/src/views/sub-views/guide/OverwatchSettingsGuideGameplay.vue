<template>
    <SettingsGuide title="Gameplay Settings" :tabs="tabs" />
</template>
<script>
import SettingsGuide from "@/components/website/guide/SettingsGuide.vue";

export default {
    name: "OverwatchSettingsGuideGameplay",
    components: { SettingsGuide },
    data: () => ({
        tabs: [
            {
                title: "General",
                settings: [
                    {
                        title: "Enable Workshop Inspector",
                        description: "On",
                        type: "account",
                        tooltip: "Used for stats"
                    },
                    {
                        title: "Enable Workshop Inspector Log File",
                        description: "On",
                        type: "account",
                        tooltip: "Used for stats"
                    }
                ]
            },
            {
                title: "HUD",
                settings: [
                    {
                        title: "Kill Feed Display",
                        description: "On",
                        type: "account"
                    },
                    {
                        title: "Play Sound When Enemy Eliminated",
                        description: "Off",
                        type: "account"
                    },
                    {
                        title: "Play Sound When Teammate Eliminated",
                        description: "Off",
                        type: "account"
                    },
                    {
                        title: "Snap Death Camera to Killer",
                        description: "Off",
                        type: "account"
                    },
                    {
                        title: "Achievement Display",
                        description: "Neither",
                        type: "account"
                    },
                    {
                        title: "Tips Display",
                        description: "Off",
                        type: "account"
                    },
                    {
                        title: "In-Game Challenge UI Notifications",
                        description: "Off",
                        type: "account"
                    },
                    {
                        title: "Show Capture Play of the Game UI",
                        description: "Off",
                        type: "account"
                    },
                    {
                        title: "Display System Clock",
                        description: "Off",
                        type: "file",
                        automated: "basic"
                    },
                    {
                        title: "Ability Timer Ring Opacity",
                        description: "100%",
                        type: "account"
                    },
                    {
                        title: "Player Outline Strength",
                        description: "100%",
                        type: "account"
                    },
                    {
                        title: "Waypoint Opacity",
                        description: "100%",
                        type: "account"
                    },
                    {
                        title: "Respawn Icon Opacity",
                        description: "100%",
                        type: "account"
                    }
                ]
            }
        ]
    })
};
</script>
