<template>
    <div class="event-settings container">
        <h2>Event Settings</h2>

        <SubPageNav>
            <li class="nav-item">
                <router-link class="nav-link" :to="subLink('')">General</router-link>
            </li>
            <li class="nav-item">
                <router-link class="nav-link" :to="subLink('discord')">Discord</router-link>
            </li>
            <li class="nav-item">
                <router-link class="nav-link" :to="subLink('signups')">Signups</router-link>
            </li>
        </SubPageNav>

        <router-view :event="event" :is-minisite="isMinisite" />
    </div>
</template>

<script>
import SubPageNav from "@/components/website/SubPageNav.vue";

export default {
    name: "EventSettings",
    components: { SubPageNav },
    props: {
        event: {},
        isMinisite: Boolean
    },
    methods: {
        subLink(page) {
            if (this.isMinisite) {
                return `/settings/${page}`;
            }
            return `/event/${this.event.id}/settings/${page}`;
        },
    }
};
</script>

<style scoped>

</style>
