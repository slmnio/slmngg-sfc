<template>
    <div class="transmitter-streams">
        <b-button v-b-modal.streams-modal>
            <i class="fas fa-fw fa-broadcast-tower"></i>
        </b-button>
        <b-modal id="streams-modal" title="Streams" hide-footer>
            <table class="table table-bordered table-sm">
                <thead>
                    <tr>
                        <th>Client</th>
                        <th>Scenes</th>
                        <th>Uptime</th>
                        <th>Server</th>
                        <th>Pull link</th>
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
                    </tr>
                </tbody>
                <tbody>
                    <tr>
                        <td colspan="5" class="text-muted text-center">No transmitters connected</td>
                    </tr>
                </tbody>
            </table>
        </b-modal>
    </div>
</template>

<script lang="ts">
import { ReactiveRoot } from "@/utils/reactive.js";
import { formatDuration, recogniseRemoteServer } from "@/utils/content-utils.js";
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
        formatDuration
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
