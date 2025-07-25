<template>
    <div v-if="user && user.name" class="container-fluid container-lg">
        <div class="d-flex gap-2 justify-content-between align-items-start">
            <h1 class="text-md-start text-center">SLMN.GG Dashboard</h1>
            <div class="d-flex align-items-center gap-3">
                <TransmitterStreams v-bind="{ broadcast, client, liveMatch }" />
                <DashboardTransmitter :broadcast="broadcast" :client="client" />
            </div>
        </div>
        <div v-if="client && broadcast" class="client-broadcasts d-flex flex-wrap flex-column flex-md-row align-items-center">
            <div class="wrapper mb-2">
                <BroadcastSwitcher :client="client" />
                <router-link v-if="liveMatch" :to="url('detailed', liveMatch)">
                    <MatchThumbnail class="mini-thumbnail" :match="liveMatch" stripe-height="2px" />
                </router-link>
                <div v-if="!liveMatch" class="match-thumbnail-ghost default-thing mini-thumbnail"></div>
                <!--                <router-link class="text-white flex-center d-flex ml-2 no-link-style" :to="`/match/${liveMatch?.id}/editor`"><i class="fas fa-pencil"></i></router-link>-->
                <router-link v-if="broadcast?.event" :to="url('event', broadcast.event)">
                    <ThemeLogo class="event-thumbnail" :theme="broadcast?.event?.theme" logo-size="s-100" border-width="2px" />
                </router-link>
            </div>
            <div class="spacer flex-grow-1"></div>
            <div class="wrapper">
                <PreviewProgramDisplay :broadcast="broadcast" />
            </div>
            <div class="wrapper mb-2">
                <div class="clocks d-flex">
                    <DashboardClock title="Local" />
                    <DashboardClock title="Broadcast" :timezone="broadcast.timezone || 'America/New_York'" />
                </div>
            </div>
        </div>
        <div v-if="broadcast">
            <div class="broadcast-editor mb-2">
                <BroadcastEditor :broadcast="broadcast" />
            </div>
            <DashboardModule
                v-if="liveMatch?.id"
                title="Match Editor"
                icon-class="fas fa-pennant"
                class="broadcast-match-editor mb-2"
                start-opened>
                <MatchEditor :dashboard-view="true" :match="liveMatch" />
            </DashboardModule>
            <DashboardModule title="Desk Guests" icon-class="fas fa-users" class="desk-editor mb-2">
                <template v-if="deskGuestSource" #header>Desk guests pulled from: {{ deskGuestSource }}</template>
                <DeskEditor :broadcast="broadcast" />
            </DashboardModule>
            <DashboardModule class="mb-2" title="Desk Display" icon-class="far fa-comment-alt-dots">
                <DeskTextEditor :broadcast="broadcast" :show-draft-control-buttons="gameOverride?.showDraftControlButtons" />
            </DashboardModule>
            <DashboardModule v-if="broadcast?.gfx?.length" class="mb-2" title="GFX" icon-class="fas fa-palette">
                <GFXController :broadcast="broadcast" :client="client" />
            </DashboardModule>
            <DashboardModule
                v-if="bracketCount"
                title="Bracket Implications"
                icon-class="fas fa-sitemap"
                class="broadcast-bracket-editor mb-2">
                <BracketImplications :match="liveMatch" link-to-detailed-match show-resolve-button />
            </DashboardModule>
            <DashboardModule
                v-if="bracketCount"
                class="bracket-viewer mb-2"
                icon-class="fas fa-sitemap"
                :title="bracketCount === 1 ? 'Bracket' : 'Brackets'">
                <Bracket
                    v-for="bracket in bracketData"
                    :key="bracket.id"
                    class="row"
                    :scale="0.75"
                    :event="liveMatch.event"
                    :bracket="bracket" />
            </DashboardModule>
            <ScheduleEditor class="broadcast-schedule-editor mb-2" :broadcast="broadcast" />
            <DashboardModule v-if="liveMatch" class="mb-2" title="Broadcast Roles" icon-class="fas fa-users-class">
                <BroadcastRoles :broadcast="broadcast" :live-match="liveMatch" />
            </DashboardModule>
            <!--<DashboardModule v-if="liveMatch" class="mb-2" title="Trivia Controls" icon-class="fas fa-question">-->
            <!--    <TriviaController :broadcast="broadcast" :live-match="liveMatch" />-->
            <!--</DashboardModule>-->
            <DashboardModule
                v-if="broadcast && broadcast.channel"
                class="mb-2"
                title="Twitch Controls"
                icon-class="fas fa-wrench"
                content-class="">
                <template v-if="streamLink" #header>{{ streamLink }}</template>
                <div class="d-flex gap-2 flex-wrap flex-column p-2">
                    <Predictions v-if="liveMatch" :client="client" />
                    <Commercials v-if="hasPermission('Full broadcast permissions')" :client="client" />
                    <div class="d-flex gap-2 flex-wrap">
                        <b-button
                            variant="secondary"
                            :disabled="titleProcessing || !liveMatch || !canSetTitle"
                            :title="`Title will be set to: '${parsedTitle}'`"
                            @click="updateTitle">
                            <i class="fal fa-fw fa-wand-magic mr-1"></i>Update title<span v-if="titleAutomated"> (automated) <i
                                class="fas fa-sparkles"></i></span>
                        </b-button>
                        <b-button
                            variant="secondary"
                            @click="setMarker">
                            Set stream marker
                        </b-button>
                        <b-button
                            v-if="streamLink"
                            class="no-link-style d-inline-block"
                            variant="outline-secondary"
                            :href="`https://${streamLink}`"
                            target="_blank">
                            Stream <i class="fas fa-fw fa-external-link"></i>
                        </b-button>
                        <b-button
                            v-if="streamLink"
                            class="no-link-style d-inline-block"
                            variant="outline-secondary"
                            :href="`https://${streamLink}/chat`"
                            target="_blank">
                            <i class="fab mr-1 fa-twitch"></i> Chat <i class="fas fa-fw fa-external-link"></i>
                        </b-button>
                        <b-button
                            v-if="twitchChannelName"
                            class="no-link-style d-inline-block"
                            variant="outline-secondary"
                            :href="`https://dashboard.twitch.tv/u/${twitchChannelName}/stream-manager`"
                            target="_blank">
                            <i class="fab mr-1 fa-twitch"></i> Dashboard <i class="fas fa-fw fa-external-link"></i>
                        </b-button>
                    </div>
                </div>
            </DashboardModule>
            <DashboardModule
                v-if="useTeamComms"
                icon-class="fas fa-microphone"
                title="Team Comms Listen-In">
                <CommsControls :match="liveMatch" />
            </DashboardModule>
            <DashboardModule v-if="broadcast?.event" class="mb-2" icon-class="fas fa-paint-brush" title="Customisation">
                <BroadcastCustomisation :broadcast="broadcast" />
            </DashboardModule>
            <DashboardModule v-if="liveMatch?.teams?.length" class="mb-2" title="Player Cams" icon-class="fas fa-video">
                <PlayerCamsController :broadcast="broadcast" :match="liveMatch" />
            </DashboardModule>
        </div>
    </div>
</template>

<script>
import { socket } from "@/socket";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { getFormatOptions, url } from "@/utils/content-utils";
import BroadcastSwitcher from "@/components/website/dashboard/BroadcastSwitcher";
import MatchThumbnail from "@/components/website/match/MatchThumbnail";
import MatchEditor from "@/components/website/dashboard/MatchEditor";
import { authenticatedRequest } from "@/utils/dashboard";
import Predictions from "@/components/website/dashboard/Predictions";
import CommsControls from "@/components/website/dashboard/CommsControls";
import Commercials from "@/components/website/dashboard/Commercials";
import BroadcastEditor from "@/components/website/dashboard/BroadcastEditor";
import ScheduleEditor from "@/components/website/dashboard/ScheduleEditor";
import DashboardClock from "@/components/website/dashboard/DashboardClock";
import DashboardModule from "@/components/website/dashboard/DashboardModule.vue";
import BracketImplications from "@/components/website/dashboard/BracketImplications.vue";
import PreviewProgramDisplay from "@/components/website/dashboard/PreviewProgramDisplay.vue";
import Bracket from "@/components/website/bracket/Bracket.vue";
import DeskEditor from "@/components/website/dashboard/DeskEditor.vue";
import DeskTextEditor from "@/components/website/dashboard/DeskTextEditor.vue";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import GFXController from "@/views/GFXController.vue";
import BroadcastRoles from "@/components/website/dashboard/BroadcastRoles.vue";
import { useAuthStore } from "@/stores/authStore";
import BroadcastCustomisation from "@/components/website/dashboard/BroadcastCustomisation.vue";
import PlayerCamsController from "@/components/website/dashboard/PlayerCamsController.vue";
import DashboardTransmitter from "@/components/website/dashboard/DashboardTransmitter.vue";
import TransmitterStreams from "@/components/website/dashboard/TransmitterStreams.vue";
import { GameOverrides } from "@/utils/games";
// import TriviaController from "@/components/website/dashboard/TriviaController.vue";

export default {
    name: "Dashboard",
    components: { TransmitterStreams, /* TriviaController, */ DashboardTransmitter, PlayerCamsController, BroadcastCustomisation, GFXController, BroadcastRoles, ThemeLogo, DeskTextEditor, DeskEditor, Bracket, PreviewProgramDisplay, BracketImplications, DashboardModule, DashboardClock, ScheduleEditor, BroadcastEditor, CommsControls, Commercials, Predictions, MatchEditor, MatchThumbnail, BroadcastSwitcher },
    data: () => ({
        titleProcessing: false
    }),
    computed: {
        gameOverride() {
            if (this.liveMatch?.game || this.broadcast?.event?.game) return GameOverrides[this.liveMatch?.game || this.broadcast?.event?.game];
            return null;
        },
        user() {
            const { user } = useAuthStore();
            if (!user?.airtableID) return {};
            return ReactiveRoot(user.airtableID, {
                clients: ReactiveArray("clients", {
                    broadcast: ReactiveThing("broadcast", {
                        event: ReactiveThing("event", {
                            theme: ReactiveThing("theme")
                        })
                    })
                })
            });
        },
        titleAutomated() {
            const settings = this.broadcast?.automation_settings || [];
            return settings.includes("Set title when live match changes");
        },
        canSetTitle() {
            if (this.liveMatch?.special_event) return this.broadcast?.special_title_format || this.broadcast?.title_format;
            return this.broadcast?.title_format;
        },
        client() {
            const client = this.user?.clients?.[0];
            if (!client?.broadcast) return {};
            return client;
        },
        broadcast() {
            if (!this.client?.broadcast?.id) return null;
            return ReactiveRoot(this.client?.broadcast?.id, {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                theme_override: ReactiveThing("theme_override"),
                live_match: ReactiveThing("live_match", {
                    maps: ReactiveArray("maps", {
                        map: ReactiveThing("map"),
                        winner: ReactiveThing("winner"),
                        banner: ReactiveThing("banner"),
                        picker: ReactiveThing("picker")
                    }),
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    }),
                    event: ReactiveThing("event", {
                        broadcasts: ReactiveThing("broadcasts"),
                        theme: ReactiveThing("theme")
                    })
                }),
                gfx: ReactiveArray("gfx")
            });
        },
        streamLink() {
            return this.broadcast?.stream_link || (this.broadcast?.channel_username?.[0] ? `twitch.tv/${this.broadcast?.channel_username?.[0]}` : null);
        },
        twitchChannelName() {
            return this.broadcast?.channel_username?.[0] || (this.broadcast?.stream_link ? this.broadcast?.stream_link.split("/").pop() : null);
        },
        liveMatch() {
            return this.broadcast?.live_match;
        },
        useTeamComms() {
            return (this.broadcast?.broadcast_settings || []).includes("Connect for team comms");
        },
        bracketCount() {
            return this.liveMatch?.brackets?.length;
        },
        bracketData() {
            const brackets = ReactiveArray("brackets", {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                ordered_matches: ReactiveArray("ordered_matches", {
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    })
                })
            })(this.liveMatch);
            if (brackets.length === 1) return brackets;
            return brackets.filter(b => !b.hide_bracket);
        },
        deskGuestSource() {
            if (this.broadcast?.guests) {
                return "Broadcast › Guests";
            } else if (this.broadcast?.manual_guests) {
                return "Broadcast › Manual Guests";
            } else if (this.liveMatch?.casters) {
                return "Broadcast › Live Match › Casters";
            }
            return null;
        },
        parsedTitle() {
            if (!this.broadcast?.title_format || !this.liveMatch) return null;
            const event = this.broadcast?.event || this.liveMatch?.event;
            if (!event) return null;

            const formatOptions = getFormatOptions(event, this.liveMatch);

            let newTitle = this.broadcast.title_format;

            Object.entries(formatOptions).forEach(([key, val]) => {
                newTitle = newTitle.replace(`{${key}}`, val || "");
            });
            newTitle = newTitle.trim();

            return newTitle;
        }
    },
    methods: {
        url,
        async updateTitle() {
            this.titleProcessing = true;
            try {
                const response = await authenticatedRequest("actions/set-title");
                if (response.error) return; // handled by internal
                this.$notyf.success({
                    message: response.data,
                    duration: 20000
                });
            } finally {
                this.titleProcessing = false;
            }
        },
        async setMarker() {
            const markerText = prompt("Set a marker");
            if (!markerText) return;
            const response = await authenticatedRequest("actions/set-marker", {
                text: markerText
            });
            if (response.error) return; // handled by internal
            this.$notyf.success({
                message: response.data,
                duration: 10000
            });
        },
        hasPermission(permission) {
            return (this.user.website_settings || []).includes(permission);
        }
    },
    watch: {
        client(oldClient, newClient) {
            if (!this.client?.key) return;
            if (oldClient?.key === newClient?.key) return;
            console.log("prod-join", this.client?.key);
            socket.emit("prod-join", this.client?.key);
        }
    },
    head: () => ({
        title: "Dashboard"
    })
};
</script>

<style scoped>
    .mini-thumbnail {
        height: 46px;
        width: 90px;
        margin-left: 10px;
    }
    .event-thumbnail {
        height: 48px;
        width: 48px;
        margin-left: 10px;
    }
    .match-thumbnail-ghost {
        height: 48px;
        border-bottom-width: 2px;
        border-bottom-style: solid;
    }
    .bracket-viewer:deep(.module-content .bracket) {
        padding: 10px 20px 0px 20px;
    }
    .bracket-viewer:deep(.module-content) {
        overflow-x: scroll;
    }

    .clocks .dashboard-clock:first-child {
        margin-left: 0;
    }
    .clocks .dashboard-clock:last-child {
        margin-right: 0;
    }

    .wrapper {
        display: flex;
    }
</style>
