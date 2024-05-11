<template>
    <div class="websocket-transmitter">
        <h1>Tally Transmitter</h1>
        <code>
            URL: {{ wsUrl }}<br>
            Password: {{ wsPassword }}
        </code>

        <div v-if="isConnected">
            <i class="fas fa-check-circle"></i> Connected
        </div>
        <div v-else class="text-center">
            <div>
                <i class="fas fa-wifi-slash"></i> Not Connected
            </div>
            <code v-if="obsError" class="error">
                Error: {{ obsError }}
            </code>
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

export default {
    name: "WebsocketTransmitter",
    props: ["client", "wsUrl", "wsPassword"],
    data: () => ({
        obsWs: null,
        isConnected: false,
        obsError: "",
        wsPreview: false,
        wsProgram: false,

        prodData: {
            minor: true
        },
        noStinger: true
    }),
    computed: {
        state() {
            if (this.isConnected) {
                return this.wsProgram ? "active" : this.wsPreview ? "preview" : "inactive";
            } else {
                return "inactive";
            }
        }
    },

    methods: {
        transmit() {
            socket.emit("obs_data_change", {
                clientName: this.client?.key,
                previewScene: this.wsPreview,
                programScene: this.wsProgram
            });
        },
        async connectWs() {
            if (this.isConnected) return;
            try {
                await this.obsWs.connect(this.wsUrl, this.wsPassword);
                await this.updateWsSceneData();
                this.isConnected = true;
                this.transmit();
                console.log("Connected to OBS Websocket");
            } catch (e) {
                this.obsError = e.message;
                console.error("Failed to connect to OBS WebSocket");
                console.error(e);
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
        }
    },
    async mounted() {
        this.obsWs = new OBSWebSocket();

        this.obsWs.on("Identified", () => {
            this.isConnected = true;
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

        setInterval(() => {
            this.connectWs();
        }, 1000);
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
    font-size: clamp(10px, 5vw, 25vh);
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

.error {
    font-size: 2.5em;
}
</style>
