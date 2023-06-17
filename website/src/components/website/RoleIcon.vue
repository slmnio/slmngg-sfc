<template>
    <div class="role-icon" v-if="role && roleSVG" v-html="roleSVG"></div>
</template>

<script>
import { getRoleSVG } from "@/utils/content-utils";

export default {
    name: "RoleIcon",
    props: ["role"],
    computed: {
        roleSVG() {
            return getRoleSVG(this.role);
        }
    }
};
</script>

<style scoped>
    .role-icon {
        width: 1.25em;
        height: 1.25em;
        font-size: 1em;
        display: inline-flex;
    }
</style>
