<template>
    <router-link :to="url(this.page, this.thing)" class="quick-switcher-result d-flex p-2 mb-1" @click.native="click"
        :class="{'selected': selected}" @mouseenter.native="hover">
        <ThemeLogo class="logo" :theme="thing.theme" border-width="4px" icon-padding="10%" :logo-size="50" />
        <div class="name ml-2">
            <div class="industry-align">{{ thing.name }}</div>
        </div>
    </router-link>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import { url } from "@/utils/content-utils";

export default {
    name: "QuickSwitcherResult",
    components: { ThemeLogo },
    props: ["thing", "selected", "index"],
    computed: {
        page() {
            if (!this.thing.__tableName) return null;
            if (this.thing.__tableName === "Events") return "event";
            if (this.thing.__tableName === "Teams") return "team";

            return null;
        }
    },
    methods: {
        url,
        click() {
            this.$parent.close();
        },
        hover() {
            this.$parent.childHover(this.index);
        }
    }
};
</script>

<style scoped>
    .quick-switcher-result {
        align-items: center;
        font-size: 24px;
        color: black !important;
        border-radius: 5px;
        border: 1px solid transparent;
    }
    .quick-switcher-result.selected {
        background-color: rgba(0,0,0,0.1);
        border-color: #ccc;
    }
    .logo {
        width: 50px;
        height: 40px;
        background-color: #373737;
        border-color: #5F5F5F;
    }
</style>
