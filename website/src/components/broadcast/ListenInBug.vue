<template>
    <div class="listen-in" :style="themeBackground1(team)">
        <div class="team-logo-square">
            <ThemeLogo border-width="0px" class="team-logo" :theme="team.theme"></ThemeLogo>
        </div>
        <div class="text">{{ text || "Listen In" }}</div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import { themeBackground1 } from "@/utils/theme-styles";

export default {
    name: "ListenInBug",
    components: { ThemeLogo },
    props: ["team", "text"],
    methods: {
        themeBackground1
    }
};
</script>

<style scoped>
    .listen-in {
        display: flex;
        font-size: 32px;
        border-bottom: 4px solid transparent;
        padding-top: 2px;
    }
    .listen-in .team-logo {
        height: 100%;
        width: 64px;
    }
    .listen-in .text {
        padding: 2px 8px;
        text-transform: uppercase;
    }
</style>
