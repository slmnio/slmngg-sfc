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
                        <th colspan="2">Scenes</th>
                        <th>Uptime</th>
                        <th>Server</th>
                        <th>Pull link</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="stream in streams" :key="stream.socket">
                        <td :class="{'text-danger fw-bold': stream.status?.outputActive}">{{ stream.clientName }}</td>
                        <td class="scene-preview">{{ stream.scenes?.preview }}</td>
                        <td class="scene-program">{{ stream.scenes?.program }}</td>
                        <td>{{ stream.status?.outputDuration && formatDuration(stream.status?.outputDuration / 1000) }}</td>
                        <td>{{ stream?.recognisedServer || stream.settings?.service }}</td>
                        <td>
                            <copy-text-button :content="stream?.recognisedPullLink" :always-show-icon="true">Copy</copy-text-button>
                        </td>
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
        border-top: 1px solid lime;
        border-bottom: 1px solid lime;
    }
    .scene-program {
        border-top: 1px solid red;
        border-bottom: 1px solid red;
    }
</style>
