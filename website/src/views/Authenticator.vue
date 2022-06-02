<template>
    <div class="container text-center" v-if="!errorMessage">
        <h1 v-if="$root.auth.user">Hello {{ $root.auth.user.name }}!</h1>
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

export default {
    name: "Authenticator",
    components: { LoadingIcon },
    props: ["code"],
    data: () => ({
        loading: true,
        errorMessage: null
    }),
    async mounted() {
        console.log("ZOOM DISCORD TIME");

        const code = this.code;

        if (!code) {
            console.error("No code");
            this.errorMessage = "Stale Discord request";
            return;
        }

        const authenticationRequest = await fetch(`${getDataServerAddress()}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code
            })
        }).then(res => res.json());

        console.log("Discord user", authenticationRequest);


        if (authenticationRequest.error) {
            console.warn("Authentication error:", authenticationRequest.for_a_developer);

            this.errorMessage = authenticationRequest.message;
            return;
        }

        this.$root.auth.token = authenticationRequest.token;
        this.$root.auth.user = authenticationRequest.user;
        this.$root.auth.authorized = true;
        setTimeout(() => {
            this.$router.push("/"); // TODO: add previous route to storage
        }, 2000);
    }
};
</script>

<style scoped>

</style>
