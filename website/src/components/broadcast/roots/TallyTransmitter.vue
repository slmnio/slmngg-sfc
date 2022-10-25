<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "TallyTransmitter",
    props: ["client", "number"],
    data: () => ({
        active: false,
        visible: false,
        scene: "",
        prodData: {
            minor: true
        },
        noStinger: true
    }),
    computed: {
        state() {
            if (this.active) {
                return "active";
            } else if (this.visible) {
                return "preview";
            } else {
                return "inactive";
            }
        },
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
        }
    },

    methods: {
        transmit() {
            this.$socket.client.emit("tally_change", {
                clientName: this.observer,
                state: this.state,
                sceneName: this.scene,
                number: this.number
            });
        },
        transmitState() {
            if (window.obsstudio) {
                window.obsstudio.getCurrentScene((scene) => {
                    this.scene = scene?.name;
                    this.transmit();
                });
            } else {
                this.transmit();
            }
        }
    },
    mounted() {
        window.addEventListener("obsSourceActiveChanged", (e) => {
            if (!this.observer) return;
            this.active = e.detail.active;
            this.transmitState();
        });

        window.addEventListener("obsSourceVisibleChanged", (e) => {
            if (!this.observer) return;
            this.visible = e.detail.visible;
            this.transmitState();
        });
    },
    metaInfo() {
        return {
            title: `Tally Transmitter #${this.number} | ${this.client?.name || this.client?.key || ""}`
        };
    }
};
</script>
