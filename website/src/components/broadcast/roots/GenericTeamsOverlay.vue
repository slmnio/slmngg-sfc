<template>
    <GenericOverlay :title="title" body-color="transparent !important" no-bottom="true" no-bottom-animate="true">
        <ThemeTransition
            v-for="(team, i) in teams"
            :key="team.id"
            class="team w-100 h-100"
            :border-width="0"
            :theme="team.theme"
            :active="animationActive === undefined ? $root.animationActive : animationActive"
            :left="i === 0"
            :starting-delay="200"
            :inner-delay="200"
            :duration="600"
            :one-color="true">
            <div class="team-inner">
                <slot name="full" :team="team">
                    <slot name="top" :team="team">
                        <div class="team-top flex-center" :style="themeColor(team)">
                            <div class="team-name flex-center"><slot name="top-name">{{ team.name }}</slot></div>
                            <div class="team-icon-holder flex-center">
                                <div class="team-icon bg-center" :style="icon(team)"></div>
                            </div>
                        </div>
                    </slot>

                    <div class="team-bottom flex-center flex-grow-1 w-100">
                        <slot name="team-content" :team="team"></slot>
                    </div>
                </slot>
            </div>
        </ThemeTransition>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay.vue";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import ThemeTransition from "@/components/broadcast/ThemeTransition.vue";
import { resizedImage } from "@/utils/images";

export default {
    name: "GenericTeamsOverlay",
    components: {
        ThemeTransition,
        GenericOverlay
    },
    props: ["broadcast", "animationActive", "title", "matchSchema"],
    computed: {
        match() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], this.matchSchema ?? {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players"),
                    staff: ReactiveArray("staff")
                })
            });
        },
        teams() {
            if (!this.match) return [];
            return (this.match.teams || []);
        }
    },
    methods: {
        themeColor(team) {
            if (!team.theme) return {};
            return {
                backgroundColor: team.theme.color_logo_background || team.theme.color_theme,
                borderColor: team.theme.color_logo_accent || team.theme.color_accent,
                color: team.theme.color_text_on_logo_background || team.theme.color_text_on_theme
            };
        },
        icon(team) {
            if (!team.theme) return {};
            return resizedImage(team.theme, ["default_logo", "default_wordmark"], "h-250");
        }
    }
};
</script>

<style scoped>


.team:first-child {
    margin-right: 20px;
}

.team:last-child {
    margin-left: 20px;
}

.team-top {
    font-size: 64px;
    height: 3em;
    width: 100%;
    border-bottom: 8px solid transparent;
    flex-shrink: 0;
}
.team-name {
    line-height: 1;
    text-align: center;
    font-weight: bold;
    flex-grow: 1;
    z-index: 1;
    padding: 0 20px;
}

.team-icon-holder {
    /*width: 2em;*/
    /*height: 2em;*/
    flex-shrink: 0;
    opacity: 0.2;
    top: 0;
    overflow: hidden;
}
.team-icon {
    --pad: 0px;
    width:  calc(100% - var(--pad));
    height: calc(100% - var(--pad));
    background-size: cover;
    filter: blur(6px)
}


.team-name, .team-icon-holder {
    position: absolute;
    width: 100%;
    height: 100%;
}

.team-top {
    position: relative;
}
.team-inner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: #222;
    color: white;
    border-bottom: 8px solid transparent;
}


</style>
