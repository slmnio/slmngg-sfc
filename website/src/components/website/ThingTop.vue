<template>
    <div class="container">
        <div class="top d-flex">
            <router-link :to="themeURL">
                <ThemeLogo class="top-theme-logo" :theme="thing.theme" logo-size="w-200"/>
            </router-link>
            <div class="thing-names">
                <div class="thing-name d-flex flex-column">
                    <h3 class="subtitle m-0" v-if="type === 'team' && thing.subtitle">{{ thing.subtitle }}</h3>

                    <div class="series-title fw-bold" v-if="type === 'event' && thing.series_name && thing.series_subtitle">
                        {{ thing.series_name }}
                    </div>
                    <div class="series-subtitle" v-if="type === 'event' && thing.series_name && thing.series_subtitle">
                        {{ thing.series_subtitle }}
                    </div>
                    <div class="series-name" v-else>{{ thing.name }}</div>
                </div>


                <div class="thing-lower" v-if="thing.event">
                    <span>{{ thing.type_description || 'from'}}&nbsp;</span>
                    <router-link class="ct-active" :to="url('event', thing.event)">{{ thing.event.name }}</router-link>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import { url } from "@/utils/content-utils";

export default {
    name: "ThingTop",
    props: ["thing", "type", "themeURL"],
    components: {
        ThemeLogo
    },
    methods: {
        url
    }
};
</script>

<style scoped>
.top .thing-names {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    margin-bottom: 10px;
    margin-left: 32px;
    line-height: 1;
}

.top .thing-name {
    font-size: 4em;
    margin-bottom: 4px;
}

.top .thing-lower {
    margin-top: 6px;
    font-size: 20px;
    margin-bottom: 3px;
}

@media (max-width: 767px) {
    .top {
        flex-direction: column;
    }
    .top-theme-logo {
        width: 100%;
    }
    .top .thing-names {
        text-align: center;
        align-items: center;
        margin-left: 0;
        margin-top: 8px;
    }
}
</style>
