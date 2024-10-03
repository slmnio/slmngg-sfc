<template>
    <div class="websocket-transmitter">
        <h1>Tally Transmitter</h1>
        <code>
            URL: {{ wsUrl }}<br>
            Password: {{ wsPassword }}
        </code>


        <div v-if="isConnected">
            <i class="fas fa-check-circle"></i> Websocket connected
        </div>
        <div v-else class="text-center">
            <div>
                <i class="fas fa-wifi-slash"></i> Not Connected
            </div>
            <code v-if="obsError" class="error text-danger">
                Error: {{ obsError }}
            </code>
        </div>

        <div v-if="customServer" class="flex-center flex-column gap-1">
            <div v-if="customServer?.recognisedServer"><i class="fas fa-fw fa-rss"></i> {{ customServer.recognisedServer }}</div>
            <div v-else-if="customServer?.server"><i class="fas fa-fw fa-rss"></i> {{ customServer.server }}</div>
            <div v-if="customServer?.recognisedID"><i class="fas fa-fw fa-tag"></i> {{ customServer.recognisedID }}</div>
            <div v-if="websocketStreamStatus?.outputActive" class="broadcast-live mt-2">
                <div class="industry-align px-3 fw-bold d-flex gap-3">
                    <div>LIVE</div>
                    <div style="font-variant-numeric: tabular-nums">
                        {{ formatDuration(websocketStreamStatus?.outputDuration / 1000) }}
                    </div>
                </div>
            </div>
        </div>


        <div v-if="isProducer" class="flex-center gap-1">
            <div><b>Producer</b> - sending tally data</div>
        </div>


        <div class="prod-scenes">
            <div v-if="wsPreview" class="prod-preview">{{ wsPreview }}</div>
            <div v-if="wsProgram" class="prod-program">{{ wsProgram }}</div>
        </div>
    </div>
</template>
<script>
import { socket } from "@/socket";
import OBSWebSocket from "obs-websocket-js";
import { mapWritableState } from "pinia";
import { useStatusStore } from "@/stores/statusStore";
import { formatDuration, recogniseRemoteServer } from "@/utils/content-utils.js";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";

async function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}
export default {
    name: "WebsocketTransmitter",
    props: ["client", "wsUrl", "wsPassword"],
    data: () => ({
        obsWs: null,
        isConnected: false,
        isConnecting: false,
        obsError: "",
        wsPreview: false,
        wsProgram: false,
        pulseInterval: null,

        prodData: {
            minor: true
        },
        noStinger: true
    }),
    computed: {
        ...mapWritableState(useStatusStore, ["websocketConnected", "websocketStreamSettings", "websocketStreamStatus"]),
        state() {
            if (this.isConnected) {
                return this.wsProgram ? "active" : this.wsPreview ? "preview" : "inactive";
            } else {
                return "inactive";
            }
        },
        customServer() {
            const serverUrl = this.websocketStreamSettings?.server;
            if (!serverUrl || serverUrl === "auto" || this.websocketStreamSettings.streamServiceType === "rtmp_custom") return;
            try {
                return recogniseRemoteServer(serverUrl);
            } catch (e) {
                console.warn(e);
                return null;
            }
        },
        liveMatch() {
            const matchID = this.client?.broadcast?.live_match?.[0];
            if (!matchID) return null;
            return ReactiveRoot(matchID, {
                player_relationships: ReactiveArray("player_relationships")
            });
        },
        isProducer() {
            return this.liveMatch?.player_relationships.some(rel => rel.singular_name === "Producer" && rel.player?.[0] === this.client?.staff?.[0]);
        }
    },

    methods: {
        formatDuration,
        transmit() {
            if (this.isProducer) {
                socket.emit("obs_data_change", {
                    clientName: this.client?.key,
                    previewScene: this.wsPreview,
                    programScene: this.wsProgram
                });
            }
            this.sendStreamStatus(this.websocketStreamStatus, this.websocketStreamSettings);
        },
        async connectWs() {
            if (!this.obsWs) return;
            if (this.isConnected) return;
            if (this.isConnecting) return;
            try {
                this.isConnecting = true;
                console.log("[OBSWS] Connecting with", this.wsUrl, this.wsPassword, this.isConnecting);
                this.clearDataCheckTimer();
                await this.obsWs.connect(this.wsUrl, this.wsPassword);
                await this.updateWsSceneData();
                this.isConnected = true;
                this.transmit();
                console.log("Connected to OBS Websocket");
            } catch (e) {
                this.obsError = e.message;
                console.error("Failed to connect to OBS WebSocket");
                console.error(e);
            } finally {
                await wait(100);
                this.isConnecting = false;
            }
        },
        async updateWsSceneData() {
            const [programSceneResponse, previewSceneResponse] = await this.obsWs.callBatch([
                {
                    requestType: "GetCurrentProgramScene"
                },
                {
                    requestType: "GetCurrentPreviewScene"
                }
            ]);
            const programScene = programSceneResponse?.responseData?.currentProgramSceneName;
            const previewScene = previewSceneResponse?.responseData?.currentPreviewSceneName;
            this.wsProgram = programScene;
            this.wsPreview = previewScene;
            console.log(`OBS Websocket: Program Scene: ${programScene}, Preview Scene: ${previewScene}`);
        },
        async getOutputData() {
            const items = await this.obsWs.callBatch([
                {
                    requestType: "GetStreamServiceSettings"
                },
                {
                    requestType: "GetStreamStatus"
                }
            ]);

            const [streamSettings, streamStatus] = items;
            if (streamSettings?.requestStatus?.code === 100) {
                // good
                this.websocketStreamSettings = streamSettings?.responseData?.streamServiceSettings;
                this.websocketStreamStatus = streamStatus?.responseData;
            }

            console.log("OBSWS", items);


        },
        async getStreamData() {
            try {
                const streamStatus = await this.obsWs.call("GetStreamStatus");
                console.log("OBSWS Stream status", streamStatus);

                this.websocketStreamStatus = streamStatus;

            } catch (e) {
                console.warn("Error getting stream status", e);
            }
        },
        clearDataCheckTimer() {
            if (this.dataCheckInterval) {
                clearInterval(this.dataCheckInterval);
            }
        },
        startDataCheckTimer() {
            this.dataCheckInterval = setInterval(this.getStreamData, 1000);
        },
        sendStreamStatus(status, settings) {
            socket.emit("obs_stream_status", {
                clientName: this.client?.key,
                status,
                settings: {
                    service: settings?.service || "Custom",
                    url: settings?.server,
                    channelID: settings?.service === "Twitch" ? (settings?.key?.split("_") || [])?.[1]  : null
                },
                scenes: {
                    preview: this.wsPreview,
                    program: this.wsProgram,
                }
            });

        }
    },
    watch: {
        isConnected: {
            immediate: true,
            handler(status) {
                this.websocketConnected = status;
                if (!status) {
                    this.websocketStreamSettings = null;
                    this.websocketStreamStatus = null;
                }
            }
        },
        "websocketStreamStatus.outputActive": {
            immediate: true,
            handler(live, oldData) {
                if (live === oldData) return;
                console.log("OBSWS", "Stream live", live);
                if (live) {
                    this.startDataCheckTimer();
                } else {
                    this.clearDataCheckTimer();
                }
            }
        },
        wsUrl: {
            immediate: true,
            handler(url) {
                this.connectWs();
            }
        },
        wsPassword: {
            immediate: true,
            handler(password) {
                this.connectWs();
            }
        },
        websocketStreamStatus: {
            immediate: true,
            deep: true,
            handler(status) {
                this.sendStreamStatus(status, this.websocketStreamSettings);
            }
        },
        websocketStreamSettings: {
            immediate: true,
            deep: true,
            handler(settings) {
                this.sendStreamStatus(this.websocketStreamStatus, settings);
            }
        }
    },
    async mounted() {
        this.obsWs = new OBSWebSocket();

        this.obsWs.on("Identified", () => {
            this.isConnected = true;
            this.getOutputData();
        });

        this.obsWs.on("ConnectionClosed", (error) => {
            this.obsError = error.message;
            this.isConnected = false;
        });

        this.obsWs.on("CurrentProgramSceneChanged", async () => {
            await this.updateWsSceneData();
            this.transmit();
        });
        this.obsWs.on("CurrentPreviewSceneChanged", async () => {
            await this.updateWsSceneData();
            this.transmit();
        });

        this.obsWs.on("CurrentProfileChanged", async(state) => {
            await this.updateWsSceneData();
            await this.getOutputData();
        });
        this.obsWs.on("StreamStateChanged", async(state) => {
            await this.getOutputData();
        });
        this.obsWs.on("RecordStateChanged", async(state) => {
            await this.getOutputData();
        });

        this.connectWs();
        this.pulseInterval = setInterval(() => {
            this.connectWs();
        }, 2000);
    },
    beforeUnmount() {
        this.clearDataCheckTimer();
        clearInterval(this.pulseInterval);
        this.websocketStreamSettings = null;
        this.websocketStreamStatus = null;
        this.websocketConnected = null;
        socket.emit("obs_disconnect", { clientName: this.client?.key });
        this.obsWs.disconnect();
    },
    head() {
        return {
            title: `Websocket Transmitter | ${this.client?.name || this.client?.key || ""}`
        };
    }
};
</script>
<style scoped>
h1 {
    font-size: 2em;
}

.websocket-transmitter {
    height: 100vh;
    width: 100vw;
    background-color: #000000;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: clamp(20px, 3vw, 25vh);
    font-family: "SLMN-Industry", "Industry", sans-serif;
}

.prod-scenes {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    flex-grow: 1;
    font-weight: bold;
    width: 80vw;
}

.prod-scenes div {
    border: 3px solid rgba(255, 255, 255, 0.5);
    padding: 0.2em .25em;
    margin: 0 0.25em;
    background-color: black;
    width: 100%;
    line-height: 1.2;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.prod-scenes .prod-preview {
    color: lime;
    border-color: lime;
    border-radius: .2em;
}

.prod-scenes .prod-program {
    color: #ff4646;
    border-color: #ff0000;
    border-radius: .2em;
}

.broadcast-live {
    border: 2px solid white;
    border-radius: .2em;
}
</style>
