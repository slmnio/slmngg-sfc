<template>
    <a
        v-if="social.approved"
        :href="social.url"
        class="social-link"
        target="_blank"
        :title="social.name">
        <BlueskyIcon v-if="social.type === 'Bluesky'" />
        <i v-else :class="icon"></i>
    </a>
</template>

<script>
import BlueskyIcon from "@/assets/BlueskyIcon";

export default {
    name: "Social",
    components: { BlueskyIcon },
    props: ["social"],
    computed: {
        icon() {
            return {
                Twitter: "fab fa-twitter",
                Twitch: "fab fa-twitch",
                YouTube: "fab fa-youtube",
                Discord: "fab fa-discord",
                Merch: "fas fa-shopping-bag",
                Liquipedia: "fas fa-horse-head"
            }[this.social.type];
        }
    }
};
</script>

<style scoped>
    .social-link {
        margin-right: 6px;
        font-size: 24px;
    }
</style>
