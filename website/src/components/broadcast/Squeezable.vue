<template>
    <div ref="big" class="squeezable" :style="{'--content-scale': allowedContentScale, '--content-transform-origin': (align || 'left')}" @click="updateWidth()">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: "Squeezable",
    props: {
        align: String,
        allowStretch: Boolean,
        disabled: Boolean
    },
    data: () => ({
        contentScale: 1,
        elementObserver: null
    }),
    computed: {
        allowedContentScale() {
            if (!this.isActive) return 1;

            if (this.contentScale > 1) {
                return this.allowStretch ? this.contentScale : 1;
            }
            return this.contentScale;
        },
        isActive() {
            return !this.disabled;
        }
    },
    methods: {
        updateWidth(isAfterTick) {
            const big = this.$refs.big;
            const small = this.$el?.children?.[0];
            // console.log({ big, small });

            if (!big?.getBoundingClientRect || !small?.getBoundingClientRect) return;

            const boxSize = big.getBoundingClientRect().width;
            const contentSize = small.getBoundingClientRect().width;
            const contentScale = boxSize / contentSize;
            // console.log(contentScale, this.contentScale);
            this.contentScale = contentScale * this.allowedContentScale;
            if (isNaN(this.contentScale) || this.contentScale === Infinity) {
                this.contentScale = 1;
            }

            if (!isAfterTick) this.$nextTick(() => this.updateWidth(true));
        },
        observerUpdate(...a) {
            // console.log("observer update", a);
            this.updateWidth();
        }
    },
    mounted() {
        this.elementObserver = new ResizeObserver(this.observerUpdate);
        this.elementObserver.observe(this.$refs.big);

        const mutationObserver = new MutationObserver((...a) => {
            // console.log("mutation", a);
            this.$nextTick(() => {
                this.updateWidth(true);
            });
        });
        mutationObserver.observe(this.$refs.big, {
            subtree: true,
            childList: true
        });
        this.updateWidth();
    }
};
</script>

<style scoped>
    .squeezable {
        white-space: nowrap;
        flex-wrap: nowrap;
        overflow: hidden;
    }
    .squeezable>*, .squeezable:deep(*) {
        width: fit-content;
        transform:
            scaleX(var(--content-scale, 1))
            translateY(var(--translate-y, 0)) !important;
        transform-origin: var(--content-transform-origin, left) !important;
    }
</style>
