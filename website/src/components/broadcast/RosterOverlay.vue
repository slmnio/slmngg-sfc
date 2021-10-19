<template>
    <GenericOverlay class="roster-overlay" :title="title || 'Rosters'" :accent-color="accentColor" body-color="transparent">
        <div class="team" v-for="team in teams" v-bind:key="team.id">
            <div class="team-top flex-center" :style="themeColor(team)">
                <div class="team-name flex-center">{{ team.name }}</div>
                <div class="team-icon-holder flex-center">
                    <div class="team-icon bg-center" :style="icon(team)"></div>
                </div>
            </div>
            <div class="team-roster flex-center flex-column overlay--bg w-100" :style="{ fontSize: rosterFontSize(team) }">
                <div class="player" v-for="player in team.players" v-bind:key="player.id">
                    {{ player.name }}
                </div>
            </div>
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { cssImage } from "@/utils/content-utils";

export default {
    name: "RosterOverlay",
    components: { GenericOverlay },
    props: ["broadcast", "title"],
    computed: {
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
            return ReactiveRoot(this.broadcast.event.id, {
                theme: ReactiveThing("theme")
            });
        },
        match() {
            if (!this.broadcast || !this.broadcast.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players")
                })
            });
        },
        teams() {
            if (!this.match) return [];
            return this.match.teams;
        },
        accentColor() {
            if (!this.event || !this.event.theme) return null;
            return this.event.theme.color_theme;
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
            return cssImage("backgroundImage", team.theme, ["default_logo", "default_wordmark"], 250);
        },
        rosterFontSize(team) {
            const players = team?.players?.length;
            if (!players) return "";

            function clamp(number, min, max) {
                return Math.max(min, Math.min(number, max));
            }
            return clamp(350 / players, 16, 64) + "px";
        }
    }
};
</script>

<style scoped>
.team {
    width: 100%;
    height: 100%;
    height: calc(100% + 80px);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background: #222;
    margin: -40px;
}

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

.team-roster {
    flex-grow: 1;
    font-size: 48px;
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

.player {
    transform: translate(0, -0.0925em);
}
</style>
