<template>
    <span class="parent" @click="copyText">
        <span ref="copy"><slot></slot></span> <i :class="`fas ${recentlyCopied ? 'fa-clipboard-check' : 'fa-clipboard'}`"></i>
    </span>
</template>

<script>

export default {
    name: "CopyTextButton",
    data: () => ({
        recentlyCopied: false
    }),
    methods: {
        copyText() {
            navigator.clipboard.writeText(this.$refs.copy.innerText);
            this.recentlyCopied = true;
            setTimeout(() => {
                this.recentlyCopied = false;
            }, 1000);
        }
    }
};
</script>

<style scoped>
.parent {
    cursor: pointer;
}

i {
    opacity: 0;
    transition: opacity .1s ease-in-out;
}
.parent:hover > i {
    opacity: 100%;
}
</style>
