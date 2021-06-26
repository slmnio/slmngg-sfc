<template>
    <div class="info-overlay">
        <div class="info-side">
            <div class="team-text" :style="teamBG">
                <transition mode="out-in" name="fade">
                    <div class="industry-align" :key="broadcast.title">{{ broadcast.title }}</div>
                </transition>
            </div>
            <div class="event-logo bg-center" :style="eventLogo"></div>
        </div>
    </div>
</template>

<script>
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { logoBackground1 } from "@/utils/theme-styles";
import { cssImage } from "@/utils/content-utils";

export default {
    name: "InfoOverlay",
    props: ["broadcast"],
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
            return cssImage("backgroundImage", this.broadcast.event.theme, ["default_logo"], 200);
        }
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
    }
    .info-side {
        position: absolute;
        height: 100px;
        width: 492px;

        display: flex;
        align-items: center;
    }

    .industry-align { transform: translate(0, -0.075em); }
</style>
