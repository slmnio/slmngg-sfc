<template>
    <div class="bug-overlay">
        <div class="bug-holder" :style="broadcastMargin" :class="`animate-${animate || 'left'}`">
            <ThemeTransition
                :theme="themeObject?.theme"
                :active="animationActive"
                :start="animate || 'right'"
                :end="animate || 'right'"
                :border-width="6"
                :border="animate || 'right'"
                :duration="400"
                :inner-delay="200"
                use-fit-content
                :starting-delay="250">
                <div class="bug" :class="{'small': small}">
                    <div class="bug-logo flex-center">
                        <div class="bug-logo-inner bg-center" :style="eventLogo"></div>
                    </div>
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
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { useStatusStore } from "@/stores/statusStore";

export default {
    name: "BugOverlay",
    components: { ThemeTransition },
    props: ["broadcast", "title", "animationActive", "small", "teamNum", "animate"],
    computed: {
        match() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        themeObject() {
            if ([1, "1", "left"].includes(this.teamNum)) {
                return this.match?.teams?.[0];
            }
            if ([2, "2", "right", "alt"].includes(this.teamNum)) {
                return this.match?.teams?.[1];
            }
            if ([3, "3", "highlight", "highlighted"].includes(this.teamNum)) {
                return ReactiveRoot(this.broadcast.id, {
                    highlight_team: ReactiveThing("highlight_team", {
                        theme: ReactiveThing("theme")
                    })
                })?.highlight_team;
            }
            return this.broadcast?.event;
        },
        eventLogo() {
            if (!this.themeObject?.theme) return {};
            return resizedImage(this.themeObject.theme, ["default_logo"], "h-200");
        },
        broadcastMargin() {
            if (!this.broadcast) return { "--broadcast-margin-px": "0px" };
            return { "--broadcast-margin-px": `${Math.floor(this.broadcast.margin * 55)}px` };
        }
    },
    methods: {
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        }
    },
    watch: {
        themeObject: {
            deep: true,
            handler(themeObject) {
                useStatusStore().customStingerTheme = themeObject?.theme;
            }
        },
    }
};
</script>
<style scoped>

.bug-overlay {
    font-family: 'Industry', 'SLMN-Industry', sans-serif;
}
.bug-logo {
    width: 1.4em;
    margin-left: .1em;
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
.bug-holder.animate-left {
    left: auto;
    right: 0;
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

.bug-logo-inner {
    width: 90%;
    height: 80%;
}
</style>
