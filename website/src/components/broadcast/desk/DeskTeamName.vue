<template>
    <div class="team-name-holder d-flex align-items-center">
        <div class="team-name flex-center w-100" :style="bg">
            <span class="industry-align">{{ team.name }}</span>
        </div>
    </div>
</template>

<script>
import { logoBackground1 } from "@/utils/theme-styles";

export default {
    name: "DeskTeamName",
    props: ["team"],
    computed: {
        bg() { return logoBackground1(this.team); }
    }
};
</script>

<style scoped>
.team-name-holder {
    width: 100%;
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
    border-bottom: 6px solid transparent;
    width: 100%;
}
</style>
