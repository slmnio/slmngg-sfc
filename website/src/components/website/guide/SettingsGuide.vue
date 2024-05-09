<template>
    <div>
        <h2>{{ title }}</h2>
        <div v-for="tab in tabs" :key="tab.title" class="mb-2">
            <h3>{{ tab.title }} Tab</h3>

            <b-alert v-if="tab.alert" variant="warning" :model-value="true">
                {{ tab.alert }}
            </b-alert>

            <div v-for="setting in tab.settings">
                <b class="mr-1">
                    <i v-if="setting.type === 'file'" class="fa fa-file mx-1"></i>
                    <i v-else-if="setting.type === 'account'" class="fa fa-user mx-1"></i>
                    <i v-else class="fa fa-question mx-1"></i>
                    {{ setting.title }}
                    <i
                        v-if="setting.automated === 'advanced'"
                        v-b-tooltip="'Only available on the advanced profile'"
                        class="fa fa-sparkles mx-1"></i>
                    <i
                        v-else-if="setting.automated === 'basic'"
                        v-b-tooltip="'Available on all profiles'"
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
    props: {
        tabs: {
            type: Array,
            required: true
        },
        title: {
            type: String,
            required: true
        }
    }
};
</script>
