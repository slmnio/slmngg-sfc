<template>
    <router-link active-class="active" class="nav-link nav-link-match" :to="url('match', match)" v-if="shouldShow">
        🔴 LIVE: {{ eventText }} {{ match.round || match.name }}
    </router-link>
</template>

<script>
import { url } from "../../utils/content-utils";

export default {
    name: "NavLiveMatch",
    props: ["match"],
    methods: {
        url
    },
    computed: {
        eventText() {
            if (!this.match.event) return null;
            if (this.match.event.short) {
                return this.match.event.short + ": ";
            }
            return null;
        },
        shouldShow() {
            if (!this.match?.id) return false;
            if (!this.match?.event?.id) return false;
            if (!this.match.event.short) return false;
            return this.match.live;
        }
    }
};
</script>

<style scoped>

</style>
