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
    name: "OverwatchSettingsGuideSocial",
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
