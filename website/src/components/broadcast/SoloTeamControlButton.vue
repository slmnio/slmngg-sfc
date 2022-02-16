<template>
    <SoloControlButton :click="() => click()" :style="css">
        <ThemeLogo class="solo-team-logo" :theme="team.theme" border-width="0" />
        <div class="solo-team-code">{{ team.code || "---" }}</div>
    </SoloControlButton>
</template>

<script>
import SoloControlButton from "@/components/broadcast/SoloControlButton";
import { logoBackground1 } from "@/utils/theme-styles";
import ThemeLogo from "@/components/website/ThemeLogo";

export default {
    name: "SoloTeamControlButton",
    components: { ThemeLogo, SoloControlButton },
    props: {
        team: Object,
        click: Function
    },
    computed: {
        css() {
            return logoBackground1(this.team);
        }
    },
    mounted() {
        console.log(this.click);
    }
};
</script>

<style scoped>
    .solo-team-logo {
        height: 120px;
        width: 150px;
    }
</style>
