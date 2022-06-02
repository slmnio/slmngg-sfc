<template>
    <router-link :to="url('player', { id: playerID })" class="logged-in-user nav-link" active-class="active">
        <div class="avatar" :style="avatar"></div>
        <div class="name">{{ user.name }}</div>
    </router-link>
</template>

<script>
import { url } from "@/utils/content-utils.js";

export default {
    name: "LoggedInUser",
    computed: {
        user() {
            return this.$root.auth.user;
        },
        playerID() {
            return this.user?.airtableID;
        },
        avatar() {
            return {
                backgroundImage: `url(${this.user.avatar})`
            };
        }
    },
    methods: {
        url
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
</style>
