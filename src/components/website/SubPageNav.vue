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
    .sub-page-nav .nav-link.router-link-exact-active {
        color: var(--alt);
    }
</style>
