<template>
    <div class="tally-dot">
        <div class="d-flex">
            <div class="dot" v-bind:class="{ preview: state === 'preview', active: state === 'active', 'unassigned': !observer }">{{ number }}</div>
            <div class="text">{{ observer || '' }}</div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "TallyDot",
    props: ["client", "number"],
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


            if (this.targetsMe(this.producerProgramScene)) {
                this.state = "active";
            } else if (this.targetsMe(this.producerPreviewScene)) {
                this.state = "preview";
            } else {
                this.state = "inactive";
            }
        }
    },
    methods: {
        targetsMe(sceneName) {
            const number = this.number || this.selfObserverNumber;
            if (!number) return false;
            return ["Obs", "Game"].some(str => sceneName.toLowerCase().includes(str.toLowerCase())) && sceneName.includes(number.toString());
        }
    },
    computed: {
        producer() {
            if (!this.producerClientKey) return null;
            return ReactiveRoot(`client-${this.producerClientKey}`);
        },
        observers() {
            return (this.liveMatch?.player_relationships || []).filter(rel => rel.singular_name === "Observer");
        },
        observer() {
            return this.observers[this.number - 1]?.player?.name;
        },
        liveMatch() {
            const matchID = this.client?.broadcast?.live_match?.[0];
            if (!matchID) return null;
            return ReactiveRoot(matchID, {
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                })
            });
        }
    },
    data: () => ({
        state: "inactive",
        wakeLock: null,
        producerClientKey: null,
        producerPreviewScene: null,
        producerProgramScene: null,

        noBroadcastStyle: true,
        noStinger: true
    }),
    metaInfo() {
        return {
            title: `Tally Dot #${this.number} | ${this.client?.name || this.client?.key || ""}`
        };
    }
};
</script>

<style scoped>
.tally-dot {
    color: white;
    display: flex;
    position: absolute;
    bottom: 0;
    left: 0;
    margin: .2em;
    font-size: 120px;
    justify-content: flex-start;
    align-items: flex-end;
}

.dot {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    text-align: center;
    font-weight: bold;
}

.text {
    font-weight: bold;
    margin-left: .2em;
    text-shadow: 4px 4px black, 0 0 4px black;
}

.dot {
    background-color: black;
    color: white;
}
.dot.unassigned {
    color: rgba(255,255,255,0.5);
}

.dot.preview {
    background-color: #00ff00;
    color: #000000;
}

.dot.active,
.dot.program {
    background-color: #ff0000;
}

</style>
