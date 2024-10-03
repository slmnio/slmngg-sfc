<template>
    <span class="parent" @click="copyText">
        <span ref="copy"><slot></slot></span><i v-if="!noIcon" :class="`ml-1 fas fa-fw ${recentlyCopied ? 'fa-clipboard-check' : 'fa-copy'} ${alwaysShowIcon ? 'always-show' : ''}`"></i>
    </span>
</template>

<script>

export default {
    name: "CopyTextButton",
    props: ["content", "noIcon", "alwaysShowIcon"],
    data: () => ({
        recentlyCopied: false
    }),
    methods: {
        copyText() {
            navigator.clipboard.writeText(this.content || this.$refs.copy.innerText);
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
    position: relative;
}

i {
    opacity: 0;
    transition: opacity .1s ease-in-out;
    position: absolute;
    margin-left: .5em;
    line-height: 100%;
    top: 0.2em;
}
.parent:hover > i {
    opacity: 100%;
}
i.always-show {
    opacity: 1;
}
</style>
