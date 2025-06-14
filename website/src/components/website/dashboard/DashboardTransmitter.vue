<template>
    <div>
        <b-button v-b-modal.dashboard-transmitter-modal :variant="buttonVariant" class="dashboard-transmitter d-flex flex-column align-items-end rounded p-0 text-nowrap">
            <div class="title px-2 w-100 d-flex align-items-center justify-content-end gap-1">
                <div v-if="normalisedStreamStatus?.outputActive">
                    LIVE &middot;
                </div>
                <div>OBS Transmitter </div>
                <i class="fas fa-fw" :class="websocketConnected ? 'fa-wifi' : 'fa-wifi-slash'"></i>
            </div>
            <div class="content px-2 d-flex gap-2">
                <div v-if="normalisedStreamStatus?.outputActive" style="font-variant-numeric: tabular-nums">
                    {{ formatDuration(normalisedStreamStatus?.outputDuration / 1000) }}
                </div>
                <div v-if="twitchStream" class="twitch-stream px-1" :class="{'bg-warning text-dark': twitchStream?.matches === false }">
                    <i v-if="twitchStream.matches === false" class="fas fa-fw fa-exclamation"></i>
                    <i class="fab fa-fw fa-twitch"></i>
                    <span v-if="twitchStream.matches && twitchStream.broadcastChannel" class="px-1">/{{ twitchStream.broadcastChannel }}</span>
                    <span v-else-if="twitchStream.matches === false" class="px-1">Mismatch</span>
                </div>
                <div v-else-if="customServer">
                    <i class="fas fa-fw fa-signal-stream"></i>
                    {{ customServer?.recognisedServer || customServer?.server }}
                    {{ customServer?.recognisedID || customServer?.streamid }}
                </div>
                <div v-else-if="matchingStream">
                    Remote transmitter
                </div>
                <div v-else-if="!websocketConnected">
                    Not connected
                </div>
            </div>
            <websocket-transmitter
                v-if="useDashboardTransmitter"
                class="transmitter-view"
                :ws-password="transmitterPassword"
                :embedded="true"
                :ws-url="wsUrl"
                :client="client" />
        </b-button>

        <b-modal id="dashboard-transmitter-modal" ref="dashboard-transmitter-modal" title="OBS Websocket Transmitter" hide-footer>
            <b-form-checkbox v-model="useDashboardTransmitter" switch>Use dashboard transmitter</b-form-checkbox>

            <div v-if="matchingStream && !websocketConnected" class="bg-success p-2 rounded text-white my-2">
                <div class="mb-1 d-flex justify-content-between">
                    <div>Connected to remote transmitter</div>
                    <div class="bg-white text-success rounded px-2 fw-bold">{{ matchingStream?.clientName }}</div>
                </div>
                <div class="bg-white rounded text-dark p-1 px-2 fw-bold">
                    {{ [matchingStream?.scenes?.preview, matchingStream?.scenes?.program].filter(Boolean).join(" / ") }}
                </div>
            </div>
            <div class="d-flex flex-column gap-1 mt-2">
                <div class="fw-bold mb-1">Websocket settings</div>
                <b-form-group label-cols="3" label="URL & port">
                    <b-form-input v-model="transmitterUrl" />
                </b-form-group>
                <b-form-group label-cols="3" label="Password">
                    <b-form-input v-model="transmitterPassword" />
                </b-form-group>
            </div>

            <hr>
            <div>
                <table class="table table-bordered table-sm details-table">
                    <tbody>
                        <tr v-for="([key, val]) in Object.entries(customServer || {})" :key="key">
                            <td><span class="text-muted">server.</span>{{ key }}</td><td><copy-text-button>{{ val }}</copy-text-button></td>
                        </tr>
                        <tr v-for="([key, val]) in Object.entries(twitchStream || {})" :key="key">
                            <td><span class="text-muted">twitch.</span>{{ key }}</td><td><copy-text-button>{{ val }}</copy-text-button></td>
                        </tr>
                        <tr v-for="([key, val]) in Object.entries(normalisedStreamStatus || {})" :key="key">
                            <td><span class="text-muted">status.</span>{{ key }}</td>
                            <td><copy-text-button>{{ val }}</copy-text-button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </b-modal>
    </div>
</template>

<script>
import { mapWritableState } from "pinia";
import { useSettingsStore } from "@/stores/settingsStore";
import { useStatusStore } from "@/stores/statusStore";
import WebsocketTransmitter from "@/components/broadcast/roots/WebsocketTransmitter.vue";
import { formatDuration, recogniseRemoteServer } from "@/utils/content-utils";
import CopyTextButton from "@/components/website/CopyTextButton.vue";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "DashboardTransmitter",
    components: { CopyTextButton, WebsocketTransmitter },
    props: ["broadcast", "client"],
    computed: {
        ...mapWritableState(useSettingsStore, ["transmitterPassword", "transmitterUrl", "useDashboardTransmitter"]),
        ...mapWritableState(useStatusStore, ["websocketConnected", "websocketStreamSettings", "websocketStreamStatus"]),
        streams(){
            return ((ReactiveRoot("special:streams"))?.streams || []).map(stream => ({
                ...stream,
                ...recogniseRemoteServer(stream?.settings?.url)
            }));
        },
        matchingStream() {
            return this.streams.find(s => s.clientName === this.client?.key);
        },
        normalisedStreamSettings() {
            return this.websocketConnected ? this.websocketStreamSettings : this.matchingStream?.settings;
        },
        normalisedStreamStatus() {
            return this.websocketConnected ? this.websocketStreamStatus : this.matchingStream?.status;
        },
        wsUrl() {
            return this.transmitterUrl?.startsWith("ws://") ? this.transmitterUrl : "ws://" + this.transmitterUrl;
        },
        twitchStream() {
            let id;

            if (this.websocketConnected) {
                const key = this.websocketStreamSettings?.key;
                if (!key || this.websocketStreamSettings?.service !== "Twitch") return;
                const [live, channelID, streamKey] = key.split("_");
                if (live !== "live") return;
                id = channelID;
            } else if (this.matchingStream) {
                if (this.matchingStream?.settings?.service !== "Twitch") return;
                id = this.matchingStream?.settings?.channelID;
            }

            const activeChannelID = this.broadcast?.channel_id?.[0];
            if (!id) return null;

            if (id === "sub") {
                return {
                    matches: null,
                    id
                };
            }

            if (id === activeChannelID) {
                return {
                    matches: true,
                    id,
                    broadcastChannelID: activeChannelID,
                    broadcastChannel: this.broadcast?.channel_username?.[0]
                };
            } else if (activeChannelID && id !== activeChannelID) {
                return {
                    matches: false,
                    id,
                    broadcastChannelID: activeChannelID,
                    broadcastChannel: this.broadcast?.channel_username?.[0]
                };
            } else {
                return {
                    matches: null,
                    id
                };
            }
        },
        customServer() {
            if (this.websocketConnected) {
                const serverUrl = this.websocketStreamSettings?.server;
                if (!serverUrl || serverUrl === "auto" || this.websocketStreamSettings.streamServiceType === "rtmp_custom") return;
                try {
                    return recogniseRemoteServer(serverUrl);
                } catch (e) {
                    console.warn(e);
                    return null;
                }
            } else {
                const serverUrl = this.matchingStream?.settings?.url;
                if (!serverUrl) return;
                try {
                    return recogniseRemoteServer(serverUrl);
                } catch (e) {
                    console.warn(e);
                    return null;
                }
            }
        },
        buttonVariant() {
            if (this.normalisedStreamStatus?.outputActive) return "danger";
            if (this.websocketConnected) return "primary";
            if (this.matchingStream) return "success";
            return "secondary";
        },
        liveMatch() {
            const client = ReactiveRoot(this.client?.id, {
                "broadcast": ReactiveThing("broadcast", {
                    "live_match": ReactiveThing("live_match", {
                        "player_relationships": ReactiveArray("player_relationships")
                    })
                })
            });
            return client?.broadcast?.live_match;
        },
        isProducer() {
            return (this.liveMatch?.player_relationships || []).some(rel => rel?.singular_name === "Producer" && rel?.player?.[0] === this.client?.staff?.[0]);
        }
    },
    methods: {
        formatDuration
    },
    watch: {
        "normalisedStreamStatus.outputActive": {
            immediate: true,
            async handler(isLive, old) {
                if (old === isLive) return console.warn("[Output automation]", "Same as before");
                if (this.twitchStream?.matches !== true) return console.warn("[Output automation]", "Not matching Twitch stream");
                if (!this.isProducer) return console.warn("[Output automation]", "Not producer");

                if (isLive === this.broadcast?.advertise) return console.warn("[Output automation]", "Already advertising");

                try {
                    if (this.processingAdvertise) return;
                    this.processingAdvertise = true;
                    await authenticatedRequest("actions/update-broadcast", {
                        advertise: isLive
                    });
                    if ((this.broadcast?.broadcast_settings || []).includes("Set title when going live")) {
                        if (isLive) {
                            await authenticatedRequest("actions/set-title");
                            this.$notyf.success("Detected going live - setting title & advertise");
                        }
                    } else {
                        if (isLive) {
                            this.$notyf.success("Detected going live - turning on advertise");
                        } else {
                            this.$notyf.success("Detected going offline - turning off advertise");
                        }
                    }
                } finally {
                    this.processingAdvertise = false;
                }
            }
        }
    }
};
</script>

<style scoped>
    .title {
        font-weight: bold;
        font-size: .85em;
        border-bottom: 1px solid rgba(0,0,0,0.2);
    }
    .transmitter-view {
        width: 0px;
        height: 0px;
        overflow: hidden;
    }

    .details-table {
        font-family: monospace;
        font-size: .8em;
    }
</style>
