<template>
    <div class="generic-overlay flex-center flex-column">
        <TourneyBar class="st4-top" v-if="top === 'st4'" :broadcast="broadcast" left="Schedule" :right="title"/>
        <transition name="broadcast-mid-split">
            <div v-if="top !== 'st4'" class="generic-overlay-title overlay--bg flex-center" :style="{borderColor: accentColor}" v-show="$root.animationActive">
                <transition name="fade" mode="out-in">
                    <span class="industry-align" :key="title" v-bind:class="{'has-br': title.includes('\\n') }" v-html="nbr(title)"></span>
                </transition>
            </div>
        </transition>
        <transition name="broadcast-mid-split">
            <div class="generic-overlay-body overlay--bg flex-center" :style="{backgroundColor: bodyColor}" v-show="$root.animationActive">
                <slot></slot>
            </div>
        </transition>
    </div>
</template>

<script>
import TourneyBar from "@/components/broadcast/TourneyBar";
export default {
    name: "GenericOverlay",
    components: { TourneyBar },
    props: ["title", "accentColor", "bodyColor", "top", "broadcast"],
    methods: {
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        }
    }
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
.generic-overlay-title .has-br {
    font-size: 0.72em;
}

.broadcast-mid-split-enter-active {
    overflow: hidden;
    max-width: 100%;
    transition: all 800ms ease;
}
.broadcast-mid-split-leave-active {
    overflow: hidden;
    max-width: 100%;
    transition: opacity 0s;
}
.broadcast-mid-split-enter {
    /*clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);*/
    /*clip-path: polygon(0% 0%, 0% 100%, 0% 100%, 0% 0, 100% 0, 100% 100%, 100% 100%, 100% 0%);*/
    clip-path: polygon(50% 0, 50% 100%, 50% 100%, 50% 1%, 50% 0%, 50% 100%, 50% 100%, 50% 0);
}
.broadcast-mid-split-enter-to {
    /*clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);*/
    /*clip-path: polygon(0% 0%, 0% 100%, 50% 100%, 50% 0, 50% 0, 50% 100%, 100% 100%, 100% 0%); */
    clip-path: polygon(0% 0, 0% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 100% 100%, 100% 0);
}

.broadcast-mid-split-leave-to {
    opacity: 0;
}
.generic-overlay-body.broadcast-mid-split-enter-active {
    transition-delay: 200ms !important;
}
</style>
