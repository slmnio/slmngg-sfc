<template>
    <div class="container mb-2">
        <ul class="nav sub-page-nav nav-pills">
            <slot></slot>
        </ul>
    </div>
</template>

<script>
export default {
    name: "SubPageNav"
};
</script>

<style scoped>
    .sub-page-nav:deep(.nav-link:not(.themed))  {
        color: var(--theme-passive, #ffffff);
    }
    .sub-page-nav .nav-link.router-link-exact-active {
        color: var(--theme);
    }
    .sub-page-nav:deep(.nav-link.active) ,
    .sub-page-nav:deep(.nav-link.router-link-exact-active) ,
    .sub-page-nav:deep(.nav-link:not(.themed):hover)   {
        color: var(--theme-active, #66D9FF);
    }
</style>
