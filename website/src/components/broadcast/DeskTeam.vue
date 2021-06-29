<template>
    <div class="team d-flex align-items-center">
        <div class="team-logo-holder flex-shrink-0 flex-center" :style="bg">
            <div class="team-logo bg-center" :style="logo"></div>
        </div>
        <div class="team-name flex-center w-100" :style="bg">
            <span class="industry-align">{{ team.name }}</span>
        </div>
    </div>
</template>

<script>
import { logoBackground1 } from "@/utils/theme-styles";
import { cssImage } from "@/utils/content-utils";

export default {
    name: "DeskTeam",
    props: ["team"],
    computed: {
        bg() { return logoBackground1(this.team); },
        logo() { return cssImage("backgroundImage", this.team.theme, ["default_wordmark", "default_logo"], null, false); }
    }
};
</script>

<style scoped>
    .team {
        width: 100%;
        flex-grow: 1;
    }
    .team-logo-holder {
        width:  160px;
        height: 150px;
        /*border-radius: 20px;*/
    }
    .team-logo {
        --size: 90%;
        width: var(--size);
        height: var(--size);
    }
    .team:nth-of-type(2) {
        flex-direction: row-reverse;
        text-align: right;
    }
    .team-name {
        font-size: 46px;
        text-transform: uppercase;
        font-weight: bold;
        padding: 0 20px;
        text-align: center;
        line-height: 1;
        height: 110px;
    }
    .team-name, .team-logo-holder {
        border-bottom: 6px solid transparent;
    }
</style>
