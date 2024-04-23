<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import OBSWebSocket from "obs-websocket-js";

export default {
    name: "TallyTransmitter",
    props: ["client", "number", "useWs", "wsUrl", "wsPassword", "wsSceneNameOverride"],
    data: () => ({
        browserActive: false,
        browserVisible: false,
        obsWs: null,
        wsIsConnected: false,
        wsPreview: false,
        wsProgram: false,
        prodData: {
            minor: true
        },
        noStinger: true
    }),
    computed: {
        observers() {
            return ReactiveRoot(this.client.id, {
                broadcast: ReactiveThing("broadcast", {
                    live_match: ReactiveThing("live_match", {
                        player_relationships: ReactiveArray("player_relationships", {
                            player: ReactiveThing("player", {
                                clients: ReactiveThing("clients")
                            })
                        })
                    })
                })
            })?.broadcast?.live_match?.player_relationships?.filter(pr => pr?.singular_name === "Observer").map(pr => pr?.player?.clients?.key).filter(k => k) || [];
        },
        observer() {
            if (this.number) {
                // If the number is invalid there will be no observer and nothing will be transmitted
                // This way unused scenes can just be left as is without them messing anything up
                return this.observers?.[this.number - 1];
            } else {
                return this.client.key;
            }
        },
        state() {
            if (this.wsIsConnected) {
                return this.wsProgram ? "active" : this.wsPreview ? "preview" : "inactive";
            } else {
                return this.browserActive ? "active" : this.browserVisible ? "preview" : "inactive";
            }
        },
        wsSceneName() {
            if (this.wsSceneNameOverride) {
                return this.wsSceneNameOverride;
            } else if (this.number) {
                return `Ingame ${this.number}`;
            } else {
                return undefined;
            }
        }
    },

    methods: {
        transmit() {
            this.$socket.client.emit("tally_change", {
                clientName: this.observer,
                state: this.state,
                number: this.number
            });
        },
        async connectWs() {
            if (this.wsIsConnected || !this.useWs) return;
            try {
                await this.obsWs.connect(this.wsUrl, this.wsPassword);
                await this.updateWsSceneData();
                this.wsIsConnected = true;
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
            this.wsProgram = programScene === this.wsSceneName;
            this.wsPreview = previewScene === this.wsSceneName;
            console.log(`OBS Websocket: Program Scene: ${programScene}, Preview Scene: ${previewScene}`);
        }
    },
    async mounted() {
        this.obsWs = new OBSWebSocket();

        this.obsWs.on("ConnectionOpened", () => {
            this.wsIsConnected = true;
        });

        this.obsWs.on("ConnectionClosed", () => {
            this.wsIsConnected = false;
        });

        this.obsWs.on("CurrentProgramSceneChanged", async () => {
            await this.updateWsSceneData();
            this.transmit();
        });
        this.obsWs.on("CurrentPreviewSceneChanged", async () => {
            await this.updateWsSceneData();
            this.transmit();
        });


        window.addEventListener("obsSourceActiveChanged", (e) => {
            if (!this.observer) return;
            this.browserActive = e.detail.active;
            this.transmit();
        });

        window.addEventListener("obsSourceVisibleChanged", (e) => {
            if (!this.observer) return;
            this.browserVisible = e.detail.visible;
            this.transmit();
        });

        setInterval(() => {
            this.connectWs();
        }, 1000);
    },
    head() {
        return {
            title: `Tally Transmitter #${this.number} | ${this.client?.name || this.client?.key || ""}`
        };
    }
};
</script>
