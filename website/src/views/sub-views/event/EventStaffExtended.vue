<template>
    <div class="container">
        <div class="my-2 mx-3 d-flex justify-content-between align-items-center">
            <h2>Staff</h2>
            <b-button variant="light" class="text-dark" :to="subLink('staff')">List view</b-button>
        </div>
        <EventStaffing :event="event" />
    </div>
</template>
<script>
import EventStaffing from "@/components/website/EventStaffing.vue";
import { url } from "@/utils/content-utils";

export default {
    name: "EventStaffExtended",
    components: { EventStaffing },
    props: {
        event: {},
        isMinisite: Boolean
    },
    methods: {
        subLink(page) {
            if (this.isMinisite) {
                return `/${page}`;
            }
            return `/event/${this.event.id}/${page}`;
        }
    }
};
</script>

<style scoped>

</style>
