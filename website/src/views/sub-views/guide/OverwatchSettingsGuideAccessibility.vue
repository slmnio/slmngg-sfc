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
                {{ tab.endtext }}
            </p>
        </div>
    </div>
</template>
<script>
export default {
    name: "OverwatchSettingsGuideAccessibility",
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
