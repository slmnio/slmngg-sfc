<template>
    <div class="generic-overlay flex-center flex-column">
        <div class="generic-overlay-title flex-center" :style="{borderColor: accentColor}">
            <span class="industry-align">{{ title }}</span>
        </div>
        <div class="generic-overlay-body flex-center" :style="{backgroundColor: bodyColor}">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "GenericOverlay",
    props: ["title", "accentColor", "bodyColor"]
};
</script>

<style scoped>

.generic-overlay {
    position: absolute;
    overflow: hidden;
    background: transparent;
    background-color: transparent;

    height: 100%;
    width: 100%;
    color: white;
    font-family: "Industry", "SLMN-Industry", sans-serif;

    padding: 60px 320px;
}


.schedule-overlay .generic-overlay-body {
    padding: 0;
}

.generic-overlay-title, .generic-overlay-body {
    background-color: #222;
}
.generic-overlay-title {
    height: 160px;
    width: 100%;
    background-color: #222;
    font-size: 96px;
    font-weight: bold;
    text-transform: uppercase;
    flex-shrink: 0;
    line-height: 1;
    text-align: center;
    border-bottom: 8px solid transparent;
}
.generic-overlay-body {
    margin-top: 60px;
    flex-grow: 1;
    height: 0;
    width: 100%;
    padding: 40px;
}

span.industry-align {
    transform: translate(0, -.0925em);
}
</style>
