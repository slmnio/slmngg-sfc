<template>
    <div class="tally-block" v-bind:class="{ preview: state === 'preview', active: state === 'active' }">
        <div class="d-flex flex-column align-items-center">
            <div class="state">
                {{ state.toLocaleUpperCase() }}
            </div>
            <div class="metadata d-flex flex-column align-items-center">
                <div class="scene-name d-none">{{ sceneName }}</div>
                <div>
                    <span v-if="number">{{ number }} &middot; </span>
                    <span>{{ client.name }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "TallyViewer",
    props: ["client"],
    sockets: {
        tally_change({ state, number, sceneName }) {
            this.state = state;
            this.number = number;
            this.sceneName = sceneName;
        }
    },
    methods: {
        async getWakeLock() {
            this.wakeLock = await navigator.wakeLock.request();
            this.wakeLock.addEventListener("release", () => {
                console.log("Screen Wake Lock released:", this.wakeLock.released);
            });
            console.log("Screen Wake Lock released:", this.wakeLock.released);
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
        state: "disconnected",
        sceneName: "N/A",
        number: null,
        wakeLock: null,
        noBroadcastStyle: true
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

.tally-block.active {
  background-color: #ff0000;
}
</style>
