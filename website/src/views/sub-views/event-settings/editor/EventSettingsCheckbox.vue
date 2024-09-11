<template>
    <b-form-checkbox v-model="checked" switch><slot></slot></b-form-checkbox>
</template>

<script>
export default {
    name: "EventSettingsCheckbox",
    props: {
        title: String,
        active: Boolean
    },
    emits: ["update:active"],
    data: () => ({
        checked: null
    }),
    watch: {
        checked: {
            immediate: true,
            handler(val) {
                if (val === null) return;
                this.$emit("update:active", val);
            }
        },
        active: {
            immediate: true,
            handler(val) {
                if (val === null) return;
                this.checked = val;
            }
        }
    }
};
</script>
