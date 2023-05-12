<template>
    <div class="guest-editor">
        {{ value }}
        <b-form-input></b-form-input>
    </div>
</template>

<script>
import { BFormInput } from "bootstrap-vue";

export default {
    name: "GuestEditor",
    components: { BFormInput },
    props: {
        value: {}
    }
};
</script>

<style scoped>

</style>
