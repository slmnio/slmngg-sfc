<template>
    <div class="content-row d-flex">
        <div class="content-title font-weight-bold">{{ title }}</div>
        <div class="content-item-list">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "ContentRow",
    props: ["title"]
};
</script>

<style scoped>
.content-row {
    font-size: 1.25em;
}

.content-title {
    padding: .25em .5em;
    margin: .25em .5em;
}

.content-item-list {
    display: flex;
    flex-wrap: wrap;
}
</style>
