<template>
    <div class="me-redirecter container">
        <h1 class="text-center"><LoadingIcon /></h1>
    </div>
</template>

<script>
import { isAuthenticated } from "@/utils/auth";
import LoadingIcon from "@/components/website/LoadingIcon";

export default {
    name: "Me",
    components: { LoadingIcon },
    props: ["subPage"],
    computed: {
        auth() { return this.$root.auth; }
    },
    watch: {
        auth: {
            deep: true,
            handler() {
                console.log("auth change");
                this.check();
            }
        }
    },
    methods: {
        check() {
            if (!isAuthenticated(this.$root)) return console.warn("Not authenticated");
            const playerID = this.$root.auth?.user?.airtableID;
            if (!playerID) return console.warn("No player ID to redirect to");
            return this.$router.replace({ path: `/player/${playerID}/${this.subPage || ""}` });
        }
    },
    beforeMount() {
        this.check();
    }
};
</script>

<style scoped>

</style>
