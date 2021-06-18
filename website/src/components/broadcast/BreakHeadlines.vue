<template>
    <div class="break-headlines-holder">
        <div class="break-headlines d-flex" :style="borderCSS">
            <div class="title"><span class="industry-align">{{ title }}</span></div>
            <div class="headline">
                <transition name="headline">
                    <div class="industry-align headline-text" v-if="headline && headline.text" :key="headline.text">{{ headline.text }}</div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "BreakHeadlines",
    props: ["headlines", "title", "borderCSS"],
    data: () => ({
        headlineIndex: 0,
        nextInterval: 4000
    }),
    mounted() {
        // this.nextHeadline();
        setInterval(this.nextHeadline, 6000);
    },
    computed: {
        headline() {
            if (!this.headlines) return null;
            return this.headlines[this.headlineIndex] || this.headlines[0];
        }
    },
    methods: {
        nextHeadline() {
            this.headlineIndex++;
            if (this.headlineIndex >= (this.headlines || []).length) this.headlineIndex = 0;

            /*
            if (!this.headline?.text) {
                setTimeout(this.nextHeadline, 4000);
            } else {
                setTimeout(this.nextHeadline, this.headline.text.length * 100);
            }
            */
        }
    }
};
</script>

<style scoped>
    .break-headlines-holder {
        height: 0;
        width: 100%;
        font-size: 16px;
        padding-top: 1em;
    }
    .break-headlines {
        background-color: #333;
        border-bottom: 8px solid transparent;
    }
    .title {
        text-transform: uppercase;
        font-weight: bold;
        font-size: 2em;
        padding: 12px 24px;
        display: flex;
    }
    .headline {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.75em;
        font-weight: normal;
        position: relative;
        width: 100%;
        overflow: hidden;
    }
    .headline-text {
        width: 100%;
        white-space: nowrap;
        display: inline-flex;
    }

    .headline-enter-active, .headline-leave-active {
        transition: all 500ms ease;
        position: absolute;
    }
    .headline-leave-to {
        transform: translate(0, -2em);
    }
    .headline-enter {
        transform: translate(0, 2em);
    }
</style>
