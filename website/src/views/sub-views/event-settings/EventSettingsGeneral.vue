<template>
    <div class="event-settings-general">
        <pre>{{ blocks }}</pre>
    </div>
</template>

<script>
export default {
    name: "EventSettingsGeneral",
    props: {
        event: {}
    },
    computed: {
        blocks() {
            if (!this.event?.blocks) return null;
            try {
                const blocks = JSON.parse(this.event.blocks);
                return blocks || null;
            } catch (e) {
                return null;
            }
        }
    }
};
</script>

<style scoped>

</style>
