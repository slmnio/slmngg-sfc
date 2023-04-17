<template>
    <div class="empty-stinger-overlay"></div>
</template>

<script>
export default {
    name: "EmptyStingerOverlay",
    data: () => ({
        prodData: {
            minor: true
        }
    }),
    metaInfo() {
        return {
            title: `Empty Stinger | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>

</style>
