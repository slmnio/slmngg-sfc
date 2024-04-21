<template>
    <div>
        <h2>Video Settings</h2>
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
    name: "OverwatchSettingsGuideVideo",
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
                        description: "Off"
                    },
                    {
                        title: "Triple Buffering",
                        description: "Off"
                    },
                    {
                        title: "Reduce Buffering",
                        description: "On",
                        type: "file",
                        automated: "advanced"
                    },
                    {
                        title: "HDR",
                        description: "Off"
                    }
                ]
            },
            {
                title: "Graphics Quality",
                settings: [
                    {
                        title: "Antialias Quality",
                        description: "Medium or Higher"
                    },
                    {
                        title: "Texture Quality",
                        description: "High"
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
            }
        ]
    })
};
</script>
