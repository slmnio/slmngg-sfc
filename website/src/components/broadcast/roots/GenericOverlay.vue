<template>
    <div class="generic-overlay flex-center flex-column">
        <TourneyBar class="st4-top" v-if="top === 'st4'" :broadcast="broadcast" left="Schedule" :right="title"/>
        <div v-else class="generic-overlay-title overlay--bg flex-center" :style="{borderColor: accentColor}">
            <transition name="fade" mode="out-in">
                <span class="industry-align">{{ title }}</span>
            </transition>
        </div>
        <div class="generic-overlay-body overlay--bg flex-center" :style="{backgroundColor: bodyColor}">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import TourneyBar from "@/components/broadcast/TourneyBar";
export default {
    name: "GenericOverlay",
    components: { TourneyBar },
    props: ["title", "accentColor", "bodyColor", "top", "broadcast"]
};
</script>

<style scoped>

.generic-overlay {
    position: absolute;
    overflow: hidden;
    background: transparent;
    background-color: transparent;

    height: 100%;
    width: 100%;
    color: white;
    font-family: "Industry", "SLMN-Industry", sans-serif;

    padding: 60px 320px;
}


.schedule-overlay .generic-overlay-body {
    padding: 0;
}

.generic-overlay-title, .generic-overlay-body {
    background-color: #222;
}
.generic-overlay-title {
    height: 160px;
    width: 100%;
    background-color: #222;
    font-size: 96px;
    font-weight: bold;
    text-transform: uppercase;
    flex-shrink: 0;
    line-height: 1;
    text-align: center;
    border-bottom: 8px solid transparent;
}
.generic-overlay-body {
    margin-top: 60px;
    flex-grow: 1;
    height: 0;
    width: 100%;
    padding: 40px;
}

span.industry-align {
    transform: translate(0, -.0925em);
}
.st4-top {
    margin: 20px 0;
}
</style>
