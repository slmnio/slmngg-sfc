<template>
    <div class="action-card step-action action-container text-left opacity-changes bg-dark">
        <div v-if="title" class="action-title fw-bold h5 mb-0" :class="`bg-${titleVariant || 'dark'}`">
            {{ title }}
        </div>
        <div v-if="$slots.default" class="action-content">
            <slot name="default"></slot>
        </div>
        <div v-if="$slots.footer" class="action-footer">
            <slot name="footer"></slot>
        </div>
        <div v-else-if="$slots['footer-right']" class="action-footer action-footer-right">
            <slot name="footer-right"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "ActionCard",
    props: {
        title: String,
        titleVariant: String
    }
};
</script>

<style scoped>
    @import "@/views/sub-views/match-editors.css";
    .action-footer-right {
        justify-content: flex-end;
    }
</style>
