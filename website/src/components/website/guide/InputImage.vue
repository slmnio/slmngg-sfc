<template>
    <img
        v-if="type === 'kb'"
        :src="`/assets/input_icons/knb/dark/${value}_Key_Dark.png`"
        height="35">
    <img
        v-else-if="type === 'xbox'"
        :src="`/assets/input_icons/xbox/XboxSeriesX_${value}.png`"
        height="35">
</template>

<script>
export default {
    name: "InputImage",
    props: ["type", "value"]
};
</script>
