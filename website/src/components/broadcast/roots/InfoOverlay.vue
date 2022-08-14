<template>
    <div class="info-overlay">
        <div class="info-side">
            <div class="team-text" :style="teamBG">
                <transition mode="out-in" name="fade">
                    <div class="industry-align" :key="title || broadcast.title" v-html="nbr( title || broadcast.title)"
                         v-bind:class="{'has-br': (title || broadcast.title || '').includes('\\n') }"></div>
                </transition>
            </div>
            <div class="event-logo bg-center" :style="eventLogo"></div>
        </div>
    </div>
</template>

<script>
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { logoBackground1 } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";

export default {
    name: "InfoOverlay",
    props: ["broadcast", "title"],
    computed: {
        highlightTeam() {
            if (!this.broadcast?.highlight_team?.length) return null;
            return ReactiveRoot(this.broadcast.highlight_team[0], {
                theme: ReactiveThing("theme")
            });
        },
        teamBG() {
            if (!this.highlightTeam?.has_theme) {
                if (!this.broadcast?.event?.theme) return {};
                return logoBackground1(this.broadcast.event);
            }

            return logoBackground1(this.highlightTeam);
        },
        eventLogo() {
            if (!this.broadcast?.event?.theme) return {};
            return resizedImage(this.broadcast.event.theme, ["default_logo"], "h-200");
        }
    },
    methods: {
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        }
    },
    metaInfo() {
        return {
            title: `Info "${this.title}" | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .info-overlay {
        font-family: 'Industry', 'SLMN-Industry', sans-serif;
    }

    .event-logo {
        width: 100px;
        height: 100px;
        position: absolute;
        margin-left: 10px;
    }

    .team-text {
        font-weight: bold;
        text-transform: uppercase;
        top: 0;

        font-size: 30px;

        padding-left: 125px;
        width: 100%;

        border-right: 6px solid #eee;
        background-color: #222;
        color: #eee;
        transition: all .3s ease;
        line-height: 1;
        padding-top: 4px;
        padding-bottom: 4px;
    }
    .info-side {
        position: absolute;
        height: 100px;
        width: 492px;

        display: flex;
        align-items: center;
    }

    .industry-align {
        /* this was slightly less than normal: -0.0075em */
        transform: var(--overlay-line-height-adjust, translate(0, -0.0925em));
    }
</style>
