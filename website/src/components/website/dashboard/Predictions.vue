<template>
    <div>
        <b-button :disabled="processing" class="mr-1" variant="success" @click="createPred({ type: 'match' })"><i class="fas fa-fw fa-plus-hexagon mr-1"></i>Create Match Pred</b-button>
        <b-button :disabled="processing" class="mr-1" variant="success" @click="createPred({ type: 'map' })"><i class="fas fa-fw fa-plus-hexagon mr-1"></i>Create Map Pred</b-button>
        <b-button :disabled="processing" class="mr-1 text-light" variant="outline-secondary" @click="lockPred"><i class="fas fa-fw fa-lock mr-1"></i>Lock Pred</b-button>
        <b-button :disabled="processing" class="mr-1" variant="light" @click="resolvePred"><i class="fas fa-fw fa-hand-holding-usd mr-1"></i>Resolve Pred</b-button>
        <b-button :disabled="processing" class="mr-1" variant="danger" @click="cancelPred"><i class="fas fa-fw fa-times-hexagon mr-1"></i>Cancel Pred</b-button>
</div>
</template>

<script>
import { managePred } from "@/utils/dashboard";

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
                await managePred("self", "create", type);
            } finally {
                this.processing = false;
            }
        },
        async lockPred() {
            this.processing = true;
            try {
                await managePred("self", "lock");
            } finally {
                this.processing = false;
            }
        },
        async resolvePred() {
            this.processing = true;
            try {
                await managePred("self", "resolve");
            } finally {
                this.processing = false;
            }
        },
        async cancelPred() {
            this.processing = true;
            try {
                await managePred("self", "cancel");
            } finally {
                this.processing = false;
            }
        }
    }
};
</script>

<style scoped>

</style>
