<template>
<div>
    <button @click="createPred">Create Pred</button>
    <button @click="lockPred">Lock Pred</button>
    <button @click="resolvePred">Resolve Pred</button>
    <button @click="cancelPred">Cancel Pred</button>
</div>
</template>

<script>
import { managePred } from "@/utils/dashboard";

export default {
    name: "Predictions",
    props: ["client"],
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
