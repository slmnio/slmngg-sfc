<template>
    <div class="draft-team-top default-thing" :style="background">
        <div class="team-logo-holder flex-center">
            <div class="team-logo bg-center" :style="logo"></div>
        </div>
        <div class="team-name-holder">
            <div class="team-name">{{ team.name }}</div>
        </div>
    </div>
</template>

<script>
import { logoBackground1 } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";

export default {
    name: "DraftTeam",
    props: ["team"],
    computed: {
        background() { return logoBackground1(this.team); },
        logo() {
            return resizedImage(this.team.theme, ["default_wordmark", "default_logo", "small_logo"], "w-200");
        }
    }
};
</script>

<style scoped>
    .team-name-holder {
        margin-top: 10px;
        padding-bottom: 10px;
    }
    .team-name {
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        padding: 4px 8px;
        line-height: 1;
        min-height: 2.5em;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }
    .team-logo-holder {
        height: 180px;
        padding-top: 10px;
    }
    .team-logo {
        width: calc(100% - 20px);
        height: calc(100% - 20px);
    }
</style>
