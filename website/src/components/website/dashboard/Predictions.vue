<template>
    <div class="d-flex gap-2">
        <b-button-group>
            <b-button :disabled="processing" variant="success" @click="createPred({ type: 'match' })"><i class="fas fa-fw fa-plus-hexagon mr-1"></i>Create Match</b-button>
            <b-button :disabled="processing" variant="light" @click="resolvePred({ type: 'match' })"><i class="fas fa-fw fa-hand-holding-usd mr-1"></i>Resolve</b-button>
        </b-button-group>
        <b-button-group>
            <b-button :disabled="processing" variant="success" @click="createPred({ type: 'map' })"><i class="fas fa-fw fa-plus-hexagon mr-1"></i>Create Map</b-button>
            <b-button :disabled="processing" variant="light" @click="resolvePred({ type: 'map' })"><i class="fas fa-fw fa-hand-holding-usd mr-1"></i>Resolve</b-button>
        </b-button-group>
        <b-button-group>
            <b-button :disabled="processing" class="text-light" variant="outline-secondary" @click="lockPred"><i class="fas fa-fw fa-lock mr-1"></i>Lock</b-button>
            <b-button :disabled="processing" variant="danger" @click="cancelPred"><i class="fas fa-fw fa-times-hexagon mr-1"></i>Cancel</b-button>
        </b-button-group>
    </div>
</template>

<script>
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "Predictions",
    props: ["client"],
    data: () => ({
        processing: false
    }),
    methods: {
        async createPred({ type }) {
            this.processing = true;
            try {
                await authenticatedRequest("actions/manage-prediction", {
                    predictionAction: "create",
                    predictionType: type,
                    autoLockAfter: type === "map" ? 180 : 300
                });
            } finally {
                this.processing = false;
            }
        },
        async lockPred() {
            this.processing = true;
            try {
                await authenticatedRequest("actions/manage-prediction", {
                    predictionAction: "lock",
                    predictionType: "match"
                });
            } finally {
                this.processing = false;
            }
        },
        async resolvePred({ type }) {
            this.processing = true;
            try {
                await authenticatedRequest("actions/manage-prediction", {
                    predictionAction: "resolve",
                    predictionType: type
                });
            } finally {
                this.processing = false;
            }
        },
        async cancelPred() {
            this.processing = true;
            try {
                await authenticatedRequest("actions/manage-prediction", {
                    predictionAction: "cancel"
                });
            } finally {
                this.processing = false;
            }
        }
    }
};
</script>

<style scoped>
    .label-button {
        pointer-events: none;
    }
</style>
