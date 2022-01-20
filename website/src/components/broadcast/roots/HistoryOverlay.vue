<template>
    <GenericOverlay class="history-overlay" :broadcast="broadcast" :title="title || 'Match History'" body-color="transparent !important">
        <div class="team" v-for="team in teams" v-bind:key="team.id">
            <div class="team-top flex-center" :style="themeColor(team)">
                <div class="team-name flex-center">{{ team.name }}</div>
                <div class="team-icon-holder flex-center">
                    <div class="team-icon bg-center" :style="icon(team)"></div>
                </div>
            </div>
            <TeamMatchHistory class="team-roster flex-center flex-column overlay--bg w-100" :team="team" :match="match" :max="max" />
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { cssImage } from "@/utils/content-utils";
import TeamMatchHistory from "@/components/broadcast/TeamMatchHistory";

export default {
    name: "HistoryOverlay",
    props: ["broadcast", "title", "max"],
    components: {
        TeamMatchHistory,
        GenericOverlay
    },
    computed: {
        match() {
            if (!this.broadcast || !this.broadcast.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players"),
                    matches: ReactiveArray("matches", {
                        teams: ReactiveArray("teams", {
                            theme: ReactiveThing("theme")
                        }),
                        maps: ReactiveArray("maps", {
                            map: ReactiveThing("map")
                        })
                    })
                })
            });
        },
        teams() {
            if (!this.match) return [];
            return this.match.teams;
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
</style>
