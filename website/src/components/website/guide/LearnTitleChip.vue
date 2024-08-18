<template>
    <div class="learn-header d-flex mb-2">
        <router-link to="/learn" class="learn-title">
            <div class="industry-align">SLMN.GG {{ title || 'Learn' }}</div>
        </router-link>
        <div v-if="subtitle" class="learn-subtitle">
            <div class="industry-align">{{ subtitle }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: "LearnTitleChip",
    props: ["title", "subtitle"]
};
</script>

<style scoped>
.learn-header {
    font-size: 1.25em;
    font-weight: bold;
    text-transform: uppercase;
}

.learn-header>* {
    line-height: 1;
    padding: .25em .5em;
    background-color: rgba(255,255,255,0.2);
}

.learn-title {
    background-color: var(--theme);
    color: #222;
}
.learn-title:hover {
    color: #222;
}
</style>
