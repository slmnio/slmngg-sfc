<template>
    <div v-if="user && user.name" class="container">
        <h1 class="text-md-start text-center">SLMN.GG Dashboard</h1>
        <div v-if="client && client.broadcast" class="client-broadcasts d-flex flex-wrap flex-column flex-md-row align-items-center">
            <div class="wrapper mb-2">
                <BroadcastSwitcher :broadcasts="client.broadcast" />
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
        <div v-if="client && client.broadcast" class="broadcast-editor mb-2">
            <BroadcastEditor :client="client" />
        </div>
        <DashboardModule
            v-if="liveMatch?.id"
            title="Match Editor"
            icon-class="fas fa-pennant"
            class="broadcast-match-editor mb-2"
            start-opened>
            <MatchEditor :hide-match-extras="true" :match="liveMatch" />
        </DashboardModule>
        <DashboardModule title="Desk Guests" icon-class="fas fa-users" class="desk-editor mb-2">
            <template v-if="deskGuestSource" #header>Desk guests pulled from: {{ deskGuestSource }}</template>
            <DeskEditor :broadcast="broadcast" />
        </DashboardModule>
        <DashboardModule class="mb-2" title="Desk Display" icon-class="far fa-comment-alt-dots">
            <DeskTextEditor :broadcast="broadcast" />
        </DashboardModule>
        <DashboardModule v-if="broadcast?.gfx?.length" class="mb-2" title="GFX" icon-class="fas fa-palette">
            <GFXController :broadcast="broadcast" :client="client" />
        </DashboardModule>
        <DashboardModule v-if="bracketCount" title="Bracket Implications" icon-class="fas fa-sitemap" class="broadcast-bracket-editor mb-2">
            <BracketImplications :match="liveMatch" link-to-detailed-match show-resolve-button />
        </DashboardModule>
        <DashboardModule v-if="bracketCount" class="bracket-viewer mb-2" icon-class="fas fa-sitemap" :title="bracketCount === 1 ? 'Bracket' : 'Brackets'">
            <Bracket
                v-for="bracket in bracketData"
                :key="bracket.id"
                :scale="0.75"
                :event="liveMatch.event"
                :bracket="bracket" />
        </DashboardModule>
        <ScheduleEditor class="broadcast-schedule-editor mb-2" :broadcast="broadcast" />
        <DashboardModule v-if="liveMatch" class="mb-2" title="Broadcast Roles" icon-class="fas fa-users-class">
            <BroadcastRoles :broadcast="broadcast" :live-match="liveMatch" />
        </DashboardModule>
        <DashboardModule
            v-if="broadcast && broadcast.channel"
            class="mb-2"
            title="Twitch Controls"
            icon-class="fas fa-wrench"
            content-class="p-2">
            <template v-if="streamLink" #header>{{ streamLink }}</template>
            <Predictions v-if="liveMatch" :client="client" />
            <Commercials v-if="hasPermission('Full broadcast permissions')" :client="client" />
            <div class="mt-2">
                <b-button
                    v-b-tooltip.top
                    variant="secondary"
                    :disabled="titleProcessing || !liveMatch || !broadcast?.title_format"
                    :title="`Title will be set to: '${parsedTitle}'`"
                    @click="updateTitle">
                    <i class="fal fa-fw fa-wand-magic mr-1"></i>Update title<span v-if="titleAutomated"> (automated) <i class="fas fa-sparkles"></i></span>
                </b-button>
                <b-button
                    v-if="streamLink"
                    class="ml-2 no-link-style d-inline-block"
                    variant="outline-secondary"
                    :href="`https://${streamLink}`"
                    target="_blank">
                    Stream <i class="fas fa-fw fa-external-link"></i>
                </b-button>
                <b-button
                    v-if="streamLink"
                    class="ml-2 no-link-style d-inline-block"
                    variant="outline-secondary"
                    :href="`https://${streamLink}/chat`"
                    target="_blank">
                    <i class="fab mr-1 fa-twitch"></i> Chat <i class="fas fa-fw fa-external-link"></i>
                </b-button>
                <b-button
                    v-if="twitchChannelName"
                    class="ml-2 no-link-style d-inline-block"
                    variant="outline-secondary"
                    :href="`https://dashboard.twitch.tv/u/${twitchChannelName}`"
                    target="_blank">
                    <i class="fab mr-1 fa-twitch"></i> Dashboard <i class="fas fa-fw fa-external-link"></i>
                </b-button>
            </div>
        </DashboardModule>
        <DashboardModule v-if="useTeamComms" class="mb-2" icon-class="fas fa-microphone" title="Team Comms Listen-In">
            <CommsControls :match="liveMatch" />
        </DashboardModule>
    </div>
</template>

<script>
import { socket } from "@/socket";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { url } from "@/utils/content-utils";
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

export default {
    name: "Dashboard",
    components: { GFXController, BroadcastRoles, ThemeLogo, DeskTextEditor, DeskEditor, Bracket, PreviewProgramDisplay, BracketImplications, DashboardModule, DashboardClock, ScheduleEditor, BroadcastEditor, CommsControls, Commercials, Predictions, MatchEditor, MatchThumbnail, BroadcastSwitcher },
    data: () => ({
        titleProcessing: false
    }),
    computed: {
        user() {
            const { user } = useAuthStore();
            if (!user?.airtableID) return {};
            return ReactiveRoot(user.airtableID, {
                clients: ReactiveArray("clients", {
                    broadcast: ReactiveArray("broadcast", {
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
                    })
                }) // TODO: make this just client
            });
        },
        titleAutomated() {
            const settings = this.broadcast?.automation_settings || [];
            return settings.includes("Set title when live match changes");
        },
        client() {
            const client = this.user?.clients?.[0];
            if (!client?.broadcast) return {};
            return client;
        },
        broadcast() {
            return this.client?.broadcast?.[0];
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

            const formatOptions = {
                event: event.name,
                event_name: event.name,
                event_long: event.name,
                event_short: event.short,

                team_1_code: this.liveMatch?.teams?.[0]?.code,
                team_1_name: this.liveMatch?.teams?.[0]?.name,
                team_2_code: this.liveMatch?.teams?.[1]?.code,
                team_2_name: this.liveMatch?.teams?.[1]?.name,

                match_custom_name: this.liveMatch?.custom_name,
                match_sub_event: this.liveMatch?.sub_event,
                match_group: this.liveMatch?.match_group,
                match_round: this.liveMatch?.round,
                match_number: this.liveMatch?.match_number,
                match_week_text: this.liveMatch?.week_text,
                match_week_number: this.liveMatch?.week,
                match_day: this.liveMatch?.day,
                match_first_to: this.liveMatch?.first_to
            };

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


    .bracket-viewer:deep(.module-content::-webkit-scrollbar-track) {
        border-radius: 4px;
        background-color: transparent;
    }

    .bracket-viewer:deep(.module-content::-webkit-scrollbar) {
        width: 6px;
        height: 6px;
        background-color: transparent;
    }

    .bracket-viewer:deep(.module-content::-webkit-scrollbar-thumb) {
        border-radius: 4px;
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
        background-color: #222;
        transition: background-color 300ms ease;
    }

    .bracket-viewer:deep(.module-content:hover::-webkit-scrollbar-thumb),
    .bracket-viewer:deep(.module-content:active::-webkit-scrollbar-thumb) {
        background-color: #333;
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
