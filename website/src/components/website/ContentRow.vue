<template>
    <div class="content-row d-flex">
        <div class="content-title fw-bold" v-if="title">{{ title }}</div>
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
    margin-bottom: 8px;
}

.content-title {
    padding: .25em .5em;
    margin: .25em .5em;
    flex-shrink: 0;
}

.content-item-list {
    display: flex;
    flex-wrap: wrap;
}

@media (max-width: 767px) {
    .content-row {
        flex-direction: column;
    }
}
</style>
