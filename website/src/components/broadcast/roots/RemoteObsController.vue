<template>
    <div class="remote-obs-controller">
        <div class="box">
            <h2>SLMN.GG OBS Remote Controller</h2>
            <p>Websocket URL: {{ wsUrl || 'n/a'  }}</p>
            <p>Websocket Password: {{ wsPassword || 'n/a' }}</p>
            <p>status: {{ isConnected ? "Connected" : "Not connected" }}</p>
            <p v-if="obsError">Error: {{ obsError }}</p>
            <pre class="text-info" v-if="latestData">{{ JSON.stringify(latestData, null, 2) }}</pre>
        </div>
    </div>
</template>
<script>
import OBSWebSocket from "obs-websocket-js";

function jsonify(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return str;
    }
}

export default {
    name: "RemoteObsController",
    props: ["client", "wsUrl", "wsPassword"],
    data: () => ({
        connectInterval: null,
        obsWs: null,
        isConnected: false,
        obsError: "",
        latestData: null,

        prodData: {
            minor: true,
            forHumans: true
        },
        noStinger: true
    }),
    methods: {
        async connectWs() {
            if (this.isConnected) return { connected: true };
            console.log("attempting connection");
            try {
                await this.obsWs.connect(this.wsUrl, this.wsPassword);
                this.isConnected = true;
                console.log("Connected to OBS Websocket");
            } catch (e) {
                this.obsError = e.message;
                console.error("Failed to connect to OBS WebSocket", { ...e });
            }
        },
        async wsLoop() {
            const data = await this.connectWs();
            if (!data?.connected) return this.wsLoop();
        },
        async sendOBSData() {
            const results = await this.obsWs.callBatch([
                {
                    requestType: "GetSceneList"
                },
                {
                    requestType: "GetInputList"
                }
            ]);
            console.log("Sending remote data");
            this.$socket.client.emit("prod_trigger", "obs_remote_data", {
                results: results.map(r => r.responseData)
            });
        }
    },
    async mounted() {
        this.obsWs = new OBSWebSocket();

        this.obsWs.on("Identified", () => {
            this.isConnected = true;
            this.sendOBSData();
        });

        this.obsWs.on("ConnectionClosed", (error) => {
            this.obsError = error.message;
            this.isConnected = false;
            this.wsLoop();
        });

        if (this.connectInterval) clearInterval(this.connectInterval);

        return this.wsLoop();

        // this.connectInterval = setInterval(() => {
        //     this.connectWs();
        // }, 1000);
    },
    beforeDestroy() {
        if (this.connectInterval) clearInterval(this.connectInterval);
    },
    metaInfo() {
        return {
            title: `Remote Controller | ${this.client?.name || this.client?.key || ""}`
        };
    },
    sockets: {
        async obs_remote_control(socketData) {
            const { request, data } = jsonify(socketData);
            console.log("prod trigger data", request, data);
            if (this.isConnected && this.obsWs) {
                this.latestData = { request, data };

                if (data?.sceneName && data?.sceneItemName) {
                    const { sceneItemId } = await this.obsWs.call("GetSceneItemId", { sceneName: data.sceneName, sourceName: data.sceneItemName });
                    data.sceneItemId = sceneItemId;
                }

                this.obsWs.call(request, data);
            }
        },
        request_obs_remote_control_update() {
            this.sendOBSData();
        }
    }
};
</script>
<style scoped>
    .remote-obs-controller, #overlay.remote-obs-controller {
        font-family: monospace !important;
        width: 100vw;
        height: 100vh;
        background-color: black;
        color: white;
        padding: 2em;
    }
</style>
