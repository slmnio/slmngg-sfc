<template>
    <SettingsGuide title="Gameplay Settings" :tabs="tabs" />
</template>
<script>
import SettingsGuide from "@/components/website/guide/SettingsGuide.vue";

export default {
    name: "OverwatchSettingsGuideSocial",
    components: { SettingsGuide },
    data: () => ({
        tabs: [
            {
                title: "Privacy",
                settings: [
                    {
                        title: "Display Friend Request Notifications",
                        description: "Off",
                        type: "account"
                    },
                    {
                        title: "Display Friend Notifications",
                        description: "Off",
                        type: "account"
                    }
                ]
            },
            {
                title: "Text Chat",
                settings: [
                    {
                        title: "Match Text Chat",
                        description: "On",
                        type: "account"
                    },
                    {
                        title: "Match Chat Filter",
                        description: "Friendly",
                        type: "account"
                    },
                    {
                        title: "Team Chat Filter",
                        description: "Friendly",
                        type: "account"
                    },
                    {
                        title: "Party Chat Filter",
                        description: "Friendly",
                        type: "account"
                    },
                    {
                        title: "Whisper Chat Filter",
                        description: "Friendly",
                        type: "account"
                    }
                ]
            }

        ]
    })
};
</script>
