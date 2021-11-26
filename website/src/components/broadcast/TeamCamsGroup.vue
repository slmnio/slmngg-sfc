<template>
    <div class="team-cams-group" :style="theme">
        <div class="team-header">
            <div class="industry-align">{{ team.name }}</div>
        </div>
        <div class="team-guests d-flex">
            <div class="guest" v-for="guest in _guests" v-bind:key="guest.id">
                <CasterCam class="team-cam" :guest="guest" :extra-params="params" :event="event" />
                <div class="guest-name">{{ guest.name }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import CasterCam from "@/components/broadcast/CasterCam";
import { ReactiveArray } from "@/utils/reactive";
import { logoBackground1 } from "@/utils/theme-styles";

export default {
    name: "TeamCamsGroup",
    components: { CasterCam },
    props: ["team", "guests", "params", "event"],
    computed: {
        _guests() {
            return ReactiveArray("guests")({ guests: this.guests }).slice(0, 6);
        },
        theme() {
            return logoBackground1(this.team);
        }
    }
};
</script>

<style scoped>
    .team-cams-group {
        width: 900px;
        bottom: 20px;
        padding: 0 8px;
        border-top: 6px solid transparent;
    }
    .team-header {
        font-size: 3em;
        text-align: center;
        font-weight: bold;
        text-transform: uppercase;
    }
    .team-cam {
        width: 100%;
        height: 150px;
        overflow: hidden;
        position: relative;
    }
    .guest-name {
        overflow: hidden;
    }
    .team-guests .guest {
        width: calc((100% / 6) - 4px);
        margin: 0 2px;
        --caster-width: 375px;
    }
    .guest >>> .caster-avatar {
        transform: translate(0, 0);
    }
    .guest >>> .caster-bg,
    .guest >>> .caster-cam-wrapper {
        background-color: rgba(0,0,0,0.3)
    }
    .guest-name {
        text-align: center;
        font-size: 20px;
        line-height: 1;
        padding: 2px 0 4px 0;
        height: 2.5em;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;

    }
</style>
