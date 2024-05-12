<template>
    <div class="team-picker">
        <div class="title flex-center text-center">{{ title }}</div>
        <div class="options d-flex">
            <div class="option option-none" :class="{'selected': !choice}" :style="{order: 2}" @click="setTeam(null)">
                <div class="team-logo none flex-center">
                    <span class="none-text">None</span>
                </div>
            </div>
            <div
                v-for="(team, i) in teams"
                :key="team.id"
                class="option option-team"
                :style="{ order: (i * 2) + 1}"
                :class="{'selected': choice === team.id }"
                @click="setTeam(team.id)">
                <ThemeLogo
                    logo-size="w-50"
                    class="team-logo"
                    icon-padding=".5em"
                    border-width=".25em"
                    :theme="team && team.theme" />
            </div>
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
export default {
    name: "TeamPicker",
    components: { ThemeLogo },
    model: {
        prop: "choice",
        event: "change"
    },
    props: ["title", "teams", "choice"],
    methods: {
        setTeam(id) {
            this.$emit("change", id);
        }
    }
};
</script>

<style scoped>
    .title {
        margin-bottom: 0.25em;
    }
    .option {
        cursor: pointer;
    }
    .option .team-logo {
        width: 2.5em;
        height: 2.5em;
        margin: 0 .25em;
        border-bottom-width: .25em;
        border-bottom-style: solid;
        transition: all 100ms ease-in-out;
        background-color: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.4);
        color: rgb(255, 255, 255);
    }
    .none-text {
        font-size: 0.8em;
    }
    .option:not(.selected) .team-logo {
        filter: saturate(0) contrast(0.4) brightness(0.8);
        opacity: 0.6;
    }
    .option.selected .team-logo {
        border-bottom-width: .5em !important;
    }
</style>
