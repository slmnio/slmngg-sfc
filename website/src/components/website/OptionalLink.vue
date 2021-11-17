<template>
    <router-link v-if="condition" :to="to || _url(...url)">
        <slot></slot>
    </router-link>
    <div v-else>
        <slot></slot>
    </div>
</template>

<script>
import { url } from "@/utils/content-utils";
export default {
    name: "OptionalLink",
    props: {
        condition: Boolean,
        to: String,
        url: Array
    },
    methods: {
        _url: url
    }
};
</script>
