<template>
    <div>
        <h2>Gameplay Settings</h2>
        <div v-for="tab in tabs" :key="tab.title">
            <h3>{{ tab.title }} Tab</h3>

            <div v-for="setting in tab.settings">
                <b class="mr-1">
                    <i v-if="setting.type === 'file'" class="fa fa-file mx-1"></i>
                    <i v-else-if="setting.type === 'account'" class="fa fa-user mx-1"></i>
                    <i v-else class="fa fa-question mx-1"></i>
                    {{ setting.title }}
                    <i v-b-tooltip="'Only available on the advanced profile'" v-if="setting.automated === 'advanced'"
                       class="fa fa-sparkles mx-1"></i>
                    <i v-b-tooltip="'Available on all profiles'" v-else-if="setting.automated === 'basic'"
                       class="fa fa-sparkles mx-1"></i>:
                </b>
                {{ setting.description }}
                <i v-if="setting.tooltip" v-b-tooltip="setting.tooltip" class="fa fa-question-circle mx-1"></i>
            </div>

            <p v-if="tab.endtext">
                {{tab.endtext}}
            </p>
        </div>
    </div>
</template>
<script>
export default {
    name: "OverwatchSettingsGuideGameplay",
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
                        description: "???"
                    },
                    {
                        title: "Show Capture Play of the Game UI",
                        description: "Off",
                        type: "account"
                    },
                    {
                        title: "Display System Clock",
                        description: "Off",
                        type: "account"
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
