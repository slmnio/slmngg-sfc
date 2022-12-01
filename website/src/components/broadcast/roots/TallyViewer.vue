<template>
    <div class="tally-block" v-bind:class="{ preview: state === 'preview', active: state === 'active' }"
         @click="showProducerInfo = !showProducerInfo">
        <div class="d-flex flex-column align-items-center">
            <div class="state">
                {{ state.toLocaleUpperCase() }}
            </div>
            <div class="metadata d-flex flex-column align-items-center">
                <div>
                    <span v-if="number || selfObserverNumber">{{ number || selfObserverNumber }} &middot; </span>
                    <span>{{ client.name }}</span>
                </div>
                <div class="prod-info flex-center" v-if="producer && showProducerInfo">
                    <div class="prod-name">Producer: {{ producer.name }}</div>
                    <div class="prod-scenes">
                        <div class="prod-program">{{ producerProgramScene }}</div>
                        <div class="prod-preview">{{ producerPreviewScene }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";

export default {
    name: "TallyViewer",
    props: ["client", "scene"],
    sockets: {
        tally_change({ state, number }) {
            this.state = state;
            this.number = number;
        },
        prod_preview_program_change(data) {
            console.log(data);
            this.producerClientKey = data.clientSource;
            this.producerPreviewScene = data.previewScene;
            this.producerProgramScene = data.programScene;

            if (this.targetsMe(this.producerPreviewScene)) {
                this.state = "preview";
            } else if (this.targetsMe(this.producerProgramScene)) {
                this.state = "active";
            } else {
                this.state = "inactive";
            }
        }
    },
    computed: {
        producer() {
            if (!this.producerClientKey) return null;
            return ReactiveRoot(`client-${this.producerClientKey}`);
        },
        liveMatch() {
            const matchID = this.client?.broadcast?.live_match?.[0];
            if (!matchID) return null;
            return ReactiveRoot(matchID, {
                player_relationships: ReactiveArray("player_relationships")
            });
        },
        selfObserverNumber() {
            return (this.liveMatch?.player_relationships || []).filter(rel => rel.singular_name === "Observer").findIndex(rel => rel.player?.[0] === this.client?.staff?.[0]) + 1;
        }
    },
    methods: {
        async getWakeLock() {
            this.wakeLock = await navigator.wakeLock.request();
            this.wakeLock.addEventListener("release", () => {
                console.log("Screen Wake Lock released:", this.wakeLock.released);
            });
            console.log("Screen Wake Lock released:", this.wakeLock.released);
        },
        targetsMe(sceneName) {
            const number = this.number || this.selfObserverNumber;
            if (!number) return false;
            return ["Obs", "Game"].some(str => sceneName.toLowerCase().includes(str.toLowerCase())) && sceneName.includes(number.toString());
        }

    },
    async mounted() {
        if ("wakeLock" in navigator) {
            // screen will stay on in supported browsers
            await this.getWakeLock();
            document.addEventListener("visibilitychange", async () => {
                if (this.wakeLock !== null && document.visibilityState === "visible") {
                    await this.getWakeLock();
                }
            });
        }
    },
    data: () => ({
        state: "inactive",
        number: null,
        wakeLock: null,
        producerClientKey: null,
        producerPreviewScene: null,
        producerProgramScene: null,
        showProducerInfo: true,

        noBroadcastStyle: true,
        noStinger: true
    }),
    metaInfo() {
        return {
            title: `Tally Viewer | ${this.client?.name || this.client?.key || ""}`
        };
    }
};
</script>

<style scoped>
.tally-block {
  height: 100vh;
  width: 100vw;
  background-color: #000000;
  color: #ffffff;
  display: grid;
  place-items: center;
  font-size: 5em;
  transition: background-color 0.2s ease;
  font-family: "SLMN-Industry", "Industry", sans-serif;
}

.state {
  font-size: .75em;
}

.metadata {
  font-size: .3em;
}

@media (min-width: 700px) {
  .state {
    font-size: 1.25em;
  }

  .metadata {
    font-size: .75em;
  }
}


.tally-block.preview {
  background-color: #00ff00;
  color: #000000;
}

.tally-block.active,
.tally-block.program {
  background-color: #ff0000;
}

.prod-info {
    flex-direction: column;
    text-align: center;
    font-size: 0.4em;
    background-color: rgba(32,32,32,0.5);
    color: white;
    padding: .5em 1em;
    margin-top: 2em;
}

.prod-name {
    font-weight: bold;
    margin-bottom: .2em;
}
.prod-scenes {
    display: flex;
    flex-direction: column;
    font-size: 0.8em;
    width: 100%;
}
.prod-scenes div {
    border: 1px solid rgba(255,255,255,0.5);
    padding: 0.1em .5em;
    margin: 0.1em;
    background-color: black;
}

.prod-scenes .prod-preview {
    color: lime;
    border-color: lime;
    border-radius: .1em;
}
.prod-scenes .prod-program {
    color: #ff4646;
    border-color: #ff0000;
    border-radius: .1em;
}

</style>
