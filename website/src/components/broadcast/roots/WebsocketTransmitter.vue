<template>
    <div class="websocket-transmitter">
        <ul>
            <li>wsUrl: {{ wsUrl }}</li>
            <li>wsPassword: {{ wsPassword }}</li>
            <li>isConnected: {{ isConnected }}</li>
            <li>wsPreview: {{ wsPreview }}</li>
            <li>wsProgram: {{ wsProgram }}</li>
        </ul>
    </div>
</template>
<script>
import OBSWebSocket from "obs-websocket-js";

export default {
    name: "WebsocketTransmitter",
    props: ["client", "wsUrl", "wsPassword", "wsSceneNameOverride"],
    data: () => ({
        obsWs: null,
        isConnected: false,
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
        },
        wsSceneName() {
            if (this.wsSceneNameOverride) {
                return this.wsSceneNameOverride;
            } else {
                return undefined;
            }
        }
    },

    methods: {
        transmit() {
            this.$socket.client.emit("obs_data_change", {
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

        this.obsWs.on("ConnectionOpened", () => {
            this.isConnected = true;
        });

        this.obsWs.on("ConnectionClosed", () => {
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
    metaInfo() {
        return {
            title: `Websocket Transmitter | ${this.client?.name || this.client?.key || ""}`
        };
    }
};
</script>
<style scoped>
    .websocket-transmitter {
        font-size: 3em;
    }
</style>
