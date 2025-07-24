<template>
    <div class="transmitter-streams">
        <b-button v-b-modal.streams-modal>
            <i class="fas fa-fw fa-broadcast-tower"></i>
        </b-button>
        <b-modal id="streams-modal" title="Streams" hide-footer :style="{'--bs-modal-width': '800px'}">
            <table class="table table-bordered table-sm">
                <thead>
                    <tr>
                        <th>Client</th>
                        <th>Scenes</th>
                        <th>Uptime</th>
                        <th>Server</th>
                        <th>Pull link</th>
                        <th>Settings</th>
                    </tr>
                </thead>
                <tbody v-if="streams.length">
                    <tr v-for="stream in streams" :key="stream.socket">
                        <td :class="{'text-danger fw-bold': stream.status?.outputActive}">{{ stream.clientName }}</td>
                        <td>
                            <div v-if="stream.scenes?.preview" class="scene-preview">PVW: {{ stream.scenes?.preview }}</div>
                            <div v-if="stream.scenes?.program" class="scene-program">PGM: {{ stream.scenes?.program }}</div>
                        </td>
                        <td style="font-variant-numeric: tabular-nums">{{ stream.status?.outputDuration && formatDuration(stream.status?.outputDuration / 1000) }}</td>
                        <td>{{ stream?.recognisedServer || stream.settings?.service }}</td>
                        <td>
                            <copy-text-button v-if="stream?.recognisedPullLink" :content="stream?.recognisedPullLink" :always-show-icon="true">Copy</copy-text-button>
                        </td>
                        <td>
                            <div v-if="resolution(stream)">{{ resolution(stream) }}</div>
                            <div v-if="stream?.settings?.output_settings?.video_encoder">Encoder: <span class="text-monospace">{{ stream?.settings?.output_settings?.video_encoder }}</span></div>
                            <div v-if="stream?.settings?.stream_delay_enabled">{{ stream?.settings?.stream_delay_seconds }}s delay</div>
                        </td>
                    </tr>
                </tbody>
                <tbody v-else>
                    <tr>
                        <td colspan="5" class="text-muted text-center">No transmitters connected</td>
                    </tr>
                </tbody>
            </table>
        </b-modal>
    </div>
</template>

<script>
import { ReactiveRoot } from "@/utils/reactive";
import { formatDuration, recogniseRemoteServer } from "@/utils/content-utils";
import CopyTextButton from "@/components/website/CopyTextButton.vue";

export default {
    name: "TransmitterStreams",
    components: {CopyTextButton},
    props: ["broadcast", "client", "liveMatch"],
    computed: {
        streams() {
            return ((ReactiveRoot("special:streams"))?.streams || []).map(stream => ({
                ...stream,
                ...recogniseRemoteServer(stream?.settings?.url)
            }));
        }
    },
    methods: {
        formatDuration,
        resolution(stream) {
            const res = ["outputWidth", "outputHeight", "fpsNumerator"].map(x => stream?.settings?.video_settings?.[x]).filter(Boolean);
            if (res.length === 3) return `${res[0]}x${res[1]} ${res[2]}fps`;
            return null;
        }
    },
};
</script>

<style scoped>
    .scene-preview {
        color: black;
    }
    .scene-program {
        color: red;
    }

    .scene-preview, .scene-program {
        font-size: 0.75em;
        vertical-align: middle;
    }
</style>
