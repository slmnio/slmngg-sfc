<template>
    <div class="container">
        <div class="top d-flex">
            <ThemeLogo :theme="thing.theme"></ThemeLogo>
            <div class="thing-names">
                <div class="thing-name d-flex flex-column">
                    <div class="series-title font-weight-bold" v-if="type === 'event' && thing.series_name && thing.series_subtitle">
                        {{ thing.series_name }}
                    </div>
                    <div class="series-subtitle" v-if="type === 'event' && thing.series_name && thing.series_subtitle">
                        {{ thing.series_subtitle }}
                    </div>
                    <div class="series-name" v-else>{{ thing.name }}</div>
                </div>


                <div class="thing-lower" v-if="thing.event">from
                    <router-link :to="`/event/${thing.event.id}`">{{ thing.event.name }}</router-link>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/ThemeLogo";

export default {
    name: "ThingTop",
    props: ["thing", "type"],
    components: {
        ThemeLogo
    },
    created () {
        console.log(this.thing, this.type);
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
</style>
