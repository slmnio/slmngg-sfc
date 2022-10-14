<template>
<div>
    <b-button class="mr-1" variant="success" @click="createPred"><i class="fas fa-fw fa-plus-hexagon mr-1"></i>Create Pred</b-button>
    <b-button class="mr-1" variant="dark" @click="lockPred"><i class="fas fa-fw fa-lock mr-1"></i>Lock Pred</b-button>
    <b-button class="mr-1" variant="light" @click="resolvePred"><i class="fas fa-fw fa-hand-holding-usd mr-1"></i>Resolve Pred</b-button>
    <b-button class="mr-1" variant="danger" @click="cancelPred"><i class="fas fa-fw fa-times-hexagon mr-1"></i>Cancel Pred</b-button>
</div>
</template>

<script>
import { managePred } from "@/utils/dashboard";
import { BButton } from "bootstrap-vue";

export default {
    name: "Predictions",
    props: ["client"],
    components: { BButton },
    methods: {
        async createPred() {
            await managePred(this.$root.auth, "self", "create");
        },
        async lockPred() {
            await managePred(this.$root.auth, "self", "lock");
        },
        async resolvePred() {
            await managePred(this.$root.auth, "self", "resolve");
        },
        async cancelPred() {
            await managePred(this.$root.auth, "self", "cancel");
        }
    }
};
</script>

<style scoped>

</style>
