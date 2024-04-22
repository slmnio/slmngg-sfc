<template>
    <div class="tally-dot" :class="{ preview: state === 'preview', active: state === 'active', 'unassigned': !observer, 'align-left': align === 'left', 'align-right': align === 'right' }">
        <div class="d-flex dot-content">
            <div class="dot" :class="{ preview: state === 'preview', active: state === 'active', 'unassigned': !observer }">
                <span class="industry-align">{{ number }}</span>
            </div>
            <div class="text d-flex">
                <span class="name">{{ observerName || '' }}</span>
                <span class="team-cams mx-3">
                    <span class="team" v-for="team in teamCams" :key="team">{{ team.slice(-1) }}</span>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "TallyDot",
    props: ["client", "number", "align"],
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
            const observerNumber = this.number || this.selfObserverNumber;
            if (!observerNumber) return false;
            return ["Obs", "Game"].some(str => sceneName.toLowerCase().includes(str.toLowerCase())) && sceneName.includes(observerNumber.toString());
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
            return this.observers[this.number - 1];
        },
        observerName() {
            return this.observer?.player?.name;
        },
        liveMatch() {
            const matchID = this.client?.broadcast?.live_match?.[0];
            if (!matchID) return null;
            return ReactiveRoot(matchID, {
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player", {
                        clients: ReactiveThing("clients")
                    })
                })
            });
        },
        teamCams() {
            return this.observer?.player?.clients?.cams || [];
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
    border: .2em solid transparent;
    padding: .2em;
    font-size: 120px;
    justify-content: flex-start;
    align-items: flex-end;
}
.tally-dot.align-right {
    justify-content: flex-end;
    left: auto;
    right: 0;
}
.tally-dot.align-right .dot-content,
.tally-dot.align-right .text {
    flex-direction: row-reverse;
}
.tally-dot.active {
    border-color: rgba(255,0,0,0.5);
}
.tally-dot.preview {
    border-color: rgba(0,255,0,0.5);
}

.dot {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    text-align: center;
    font-weight: bold;

    line-height: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 6px solid #222;
}

.text {
    font-weight: bold;
    margin: 0 .2em;
    text-shadow: 8px 8px black, 0 0 8px black;
}

.dot {
    background-color: black;
    color: white;
    font-size: 1.25em;
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

.team-cams .team {
    background-color: black;
    font-size: 0.4em;
    padding:  0 0.25em;
    margin-left: 0.1em;
    line-height: 1;
}

.team-cams {
    margin-left: .1em;
}

</style>
