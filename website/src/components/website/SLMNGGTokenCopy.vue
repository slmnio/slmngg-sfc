<template>
    <div class="container">
        <h1>API Token</h1>
        <p>
            This token can be used for our Companion module or while using the API in another way.<br>
            <strong>Don't share it token with anyone else and don't show it on stream.</strong>
        </p>
        <code v-if="token" class="token">
            <CopyTextButton>{{token}}</CopyTextButton>
        </code>
        <p v-else>
            <i class="fas fa-exclamation-triangle mr-2"></i> You are not logged in.
        </p>
    </div>
</template>

<script>
import CopyTextButton from "@/components/website/CopyTextButton.vue";
export default {
    name: "SLMNGGTokenCopy",
    components: { CopyTextButton },
    computed: {
        token() {
            return this.$root.auth.token;
        }
    }
};
</script>

<style scoped>
.token {
    background: #333;
    color: #333;
    display: inline-flex;
    border-radius: 5px;
    padding: .1rem .3rem;
    align-items: center;
    font-size: 1rem;
}
.token:hover, .token:focus-within {
    color: #fff
}
</style>
