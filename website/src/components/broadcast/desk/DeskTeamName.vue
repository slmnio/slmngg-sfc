<template>
    <div class="team-name-holder d-flex align-items-center">
        <div class="team-name flex-center w-100" :style="bg">
            <span class="industry-align team-sub-name">{{ team.name }}</span>
            <span v-if="smallText" class="industry-align d-none small-overlay-text">({{ smallText }})</span>
        </div>
    </div>
</template>

<script>
import { logoBackground1 } from "@/utils/theme-styles";
import { autoRecord } from "@/utils/content-utils";

export default {
    name: "DeskTeamName",
    props: ["broadcast", "team", "match"],
    computed: {
        bg() {
            return logoBackground1(this.team);
        },
        smallText() {
            let text;
            if ((this.broadcast?.broadcast_settings || [])?.includes("Show match records ingame")) {
                console.log("auto small text", this.team, this.team.matches);
                text = autoRecord(this.team, this.broadcast?.current_stage || this.match?.match_group);
            }
            return this.team.small_overlay_text || text;
        }
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
    background-color: #373737; /* basic, overriden by bg() */
    color: #fff;
    border-bottom: 6px solid transparent;
    width: 100%;
}
</style>
