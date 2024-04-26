<template>
    <div class="bug-overlay">
        <div class="bug-holder" :style="broadcastMargin">
            <ThemeTransition :theme="theme" :active="animationActive" start="right" end="right" :border-width="6" border="right" :duration="400" :inner-delay="200" use-fit-content :starting-delay="250">
                <div class="bug" :class="{'small': small}">
                    <div class="bug-logo bg-center" :style="eventLogo"></div>
                    <div class="bug-text" :class="{'has-br': title.includes('\\n')}">
                        <div class="industry-align" v-html="nbr(title)"></div>
                    </div>
                </div>
            </ThemeTransition>
        </div>
    </div>
</template>
<script>
import { resizedImage } from "@/utils/images";
import ThemeTransition from "@/components/broadcast/ThemeTransition.vue";

export default {
    name: "BugOverlay",
    components: { ThemeTransition },
    props: ["broadcast", "title", "animationActive", "small"],
    computed: {
        theme() {
            return this.broadcast.event?.theme;
        },
        eventLogo() {
            if (!this.broadcast?.event?.theme) return {};
            return resizedImage(this.broadcast.event.theme, ["default_logo"], "h-200");
        },
        broadcastMargin() {
            if (!this.broadcast) return { "--broadcast-margin-px": "0px" };
            return { "--broadcast-margin-px": `${(this.broadcast.margin * 55)}px` };
        }
    },
    methods: {
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        }
    }
};
</script>
<style scoped>

.bug-overlay {
    font-family: 'Industry', 'SLMN-Industry', sans-serif;
}
.bug-logo {
    width: 1.4em;
    margin-left: 10px;
    min-height: 1.6em;
}

.bug {
    display: flex;
    display: flex;
    width: fit-content;
    font-size: 64px;
}
.bug.small {
    font-size: 48px;
}
.bug-holder {
    position: absolute;
    left: 0;
    top: calc(170px + var(--broadcast-margin-px));
}

.bug-text {
    font-size: 1em;
    font-weight: bold;
    text-transform: uppercase;
    padding: 0.2em 0.5em;
    line-height: 1;
    display: flex;
    align-items: center;
}
.bug-text.has-br {
    font-size: 0.6em;
}

</style>
