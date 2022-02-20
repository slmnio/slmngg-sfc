<template>
    <div class="team d-flex align-items-center">
        <div class="team-logo-holder flex-shrink-0 flex-center" :style="bg">
            <div class="team-logo bg-center" :style="logo"></div>
        </div>
    </div>
</template>

<script>
import { logoBackground1 } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";

export default {
    name: "DeskTeam",
    props: ["team"],
    computed: {
        bg() { return logoBackground1(this.team); },
        logo() { return resizedImage(this.team.theme, ["default_wordmark", "default_logo"], "h-200"); }
    }
};
</script>

<style scoped>
    .team {
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
        color: #fff;
    }
    .team-name, .team-logo-holder {
        border-bottom: 6px solid transparent;
    }


    .team-logo-holder {
        width: 200px;
        height: 180px;
    }
</style>
