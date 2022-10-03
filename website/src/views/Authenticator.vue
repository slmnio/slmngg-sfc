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
import LoadingIcon from "@/components/website/LoadingIcon";
import { authenticateWithDiscord, getAuthNext } from "@/utils/auth";

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
            const next = getAuthNext(this.$root);

            if (next) {
                if (next.startsWith("http")) {
                    console.log("[auth]", "Redirecting to 'external' page");
                    window.location.replace(next);
                } else {
                    this.$router.replace(next);
                }
            } else {
                this.$router.push("/profile");
            }
        }
    }
};
</script>

<style scoped>

</style>
