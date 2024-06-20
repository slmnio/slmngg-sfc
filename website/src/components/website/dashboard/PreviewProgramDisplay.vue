<template>
    <div v-if="producerPreviewScene" class="preview-program-display flex-center mb-2">
        <div class="display preview bg-dark px-2 mx-1">
            <div class="title">Preview</div>
            <div class="scene">{{ producerPreviewScene }}</div>
        </div>
        <div class="display program bg-dark px-2 mx-1">
            <div class="title">Program</div>
            <div class="scene">{{ producerProgramScene }}</div>
        </div>
    </div>
</template>

<script>
import { socket } from "@/socket";

export default {
    name: "PreviewProgramDisplay",
    props: {
        broadcast: Object
    },
    data: () => ({
        producerPreviewScene: null,
        producerProgramScene: null,
        broadcastKey: null
    }),
    methods: {
        tryJoin() {
            if (this.broadcast?.key) {
                if (this.broadcastKey === this.broadcast.key) return;

                socket.emit("prod-broadcast-join", this.broadcast.key);
            }

            this.broadcastKey = this.broadcast.key;
        }
    },
    watch: {
        broadcast: {
            deep: true,
            handler() {
                this.tryJoin();
            }
        }
    },
    sockets: {
        prod_preview_program_change(data) {
            if (data?.emitSource !== "broadcast") return; // only use broadcast data
            if ((!this.broadcast?.key) || data?.broadcastKey !== this.broadcast?.key) return; // only use this broadcast

            console.log(data, this.broadcast.key);
            this.producerClientKey = data.clientSource;
            this.producerPreviewScene = data.previewScene;
            this.producerProgramScene = data.programScene;
        }
    },
    mounted() {
        this.tryJoin();
    }
};
</script>

<style scoped>

    .display {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        padding: 2px;
        height: 48px;
        border: 1px solid rgba(255,255,255,0.2);
    }
    .title {
        font-size: 0.9em;
        line-height: 1;
        text-align: center;
    }
    .scene {
        font-size: 1.5em;
        font-variant-numeric: tabular-nums;
        font-weight: bold;
        line-height: 1;
    }

    .display.preview { border-color: lime; }
    .display.program { border-color: red; }
</style>
