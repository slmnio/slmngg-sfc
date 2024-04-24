<template>
    <b-nav-item-dropdown class="logged-in-user" variant="dark" right>
        <template #button-content>
            <div class="avatar" :style="avatar"></div>
            <div class="name">{{ user.name }}</div>
        </template>
        <b-dropdown-item variant="dark" :to="url('player', { id: playerID })" active-class="active">Player page</b-dropdown-item>
        <b-dropdown-item variant="dark" :href="rootLinkExternal('/profile')" :to="rootLinkRouter('/profile')" active-class="active">Edit profile</b-dropdown-item>
        <b-dropdown-divider v-if="isProduction"></b-dropdown-divider>
        <b-dropdown-item v-if="isProduction" variant="dark" :href="rootLinkExternal('/dashboard')" :to="rootLinkRouter('/dashboard')" active-class="active">Dashboard</b-dropdown-item>
        <b-dropdown-item v-if="isProduction" variant="dark" v-b-modal.token-modal>Token</b-dropdown-item>
        <b-dropdown-item v-if="isProduction" variant="dark" to="/login">Re-auth</b-dropdown-item>
        <TokenModal />
    </b-nav-item-dropdown>
</template>

<script>
import { url } from "@/utils/content-utils.js";
import { isAuthenticated, isOnMainDomain } from "@/utils/auth";
import { getMainDomain } from "@/utils/fetch";
import { bg } from "@/utils/images";
import TokenModal from "@/components/website/dashboard/TokenModal.vue";
import { configureCompat } from "vue";
import { mapState, mapWritableState } from "pinia";
import { useAuthStore } from "@/stores/authStore";

configureCompat({
    MODE: 3
});

export default {
    name: "LoggedInUser",
    components: {
        TokenModal
    },
    computed: {
        ...mapWritableState(useAuthStore, ["user"]),
        ...mapState(useAuthStore, ["isProduction"]),
        playerID() {
            return this.user?.airtableID;
        },
        avatar() {
            return bg(this.user.avatar);
        }
    },
    methods: {
        url,

        /*
        * for simplicity's sake, I'm having any editable stuff on the root domain
        * these use either href or to for external/routable links
        * */
        rootLinkExternal(url) {
            return isOnMainDomain() ? null : getMainDomain() + url;
        },
        rootLinkRouter(url) {
            return isOnMainDomain() ? url : null;
        }

    }
};
</script>

<style scoped>
    .logged-in-user {
        display: flex !important;
    }
    .avatar {
        width: 2em;
        height: 2em;
        border-radius: 50%;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        margin: -0.5rem 0.5rem -0.5rem 0;
    }
    .logged-in-user:deep(.btn) {
        color: #ffffff80;
        text-transform: uppercase;
    }
    .logged-in-user:deep(.dropdown-toggle) {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
