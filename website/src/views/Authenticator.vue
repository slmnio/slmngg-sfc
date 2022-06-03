<template>
    <div class="container text-center" v-if="!errorMessage">
        <h1 v-if="$root.auth.user">Hello {{ $root.authUser.name || $root.auth.user.name }}!</h1>
        <h1 v-else><LoadingIcon/> Authenticating</h1>
    </div>
    <div class="container text-center" v-else>
        <h1>Authentication error</h1>
        <h3>{{ errorMessage }}</h3>
    </div>
</template>

<script>
import { getDataServerAddress } from "@/utils/fetch";
import LoadingIcon from "@/components/website/LoadingIcon";
import { authenticateWithDiscord } from "@/utils/auth";

export default {
    name: "Authenticator",
    components: { LoadingIcon },
    props: ["code"],
    data: () => ({
        loading: true,
        errorMessage: null
    }),
    async mounted() {
        const authResult = await authenticateWithDiscord(this.$root, this.code);
        this.loading = false;

        if (authResult.error) {
            this.errorMessage = authResult.errorMessage;
        } else {
            this.$router.push("/dashboard"); // TODO: add previous route to storage
        }
    }
};
</script>

<style scoped>

</style>
