<template>
    <div class="control-button" v-bind:class="elClass" @click="() => click()" :style="css">
        <span><slot></slot></span>
    </div>
</template>

<script>
export default {
    name: "SoloControlButton",
    props: {
        left: Boolean,
        right: Boolean,
        rotate: Boolean,
        noclick: Boolean,
        click: Function,
        color: String
    },
    computed: {
        css() {
            if (!this.color) return {};
            return {
                backgroundColor: this.color
            };
        },
        elClass() {
            return {
                "control-slice": this.left || this.right,
                "control-left": this.left,
                "control-right": this.right,
                rotate: this.rotate,
                noclick: this.noclick
            };
        }
    }
};
</script>

<style scoped>
    .control-button {
        width: 200px;
        height: 200px;

        display: flex;
        justify-content: center;
        align-items: center;

        font-size: 3em;
        line-height: 1.2;
        text-align: center;
        font-weight: bold;
        text-transform: uppercase;

        background-color: #f12c2c;

        opacity: 0.8;

        cursor: pointer;
        /*user-select: none;*/
    }
    .control-button span {
        pointer-events: none;
        user-select: none
    }
    .control-button.noclick {
        cursor: default;
        opacity: 0.7;
        background-color: white;
    }
    .control-button:not(.noclick):hover {
        opacity: 1;
    }

    .control-button.control-slice {
        width: 60px;
        font-size: 2em;
    }
    .control-button.control-left.rotate span {
        transform: rotate(-90deg);
    }
    .control-button.control-right.rotate span {
        transform: rotate(90deg);
    }
    .control-button.score {
        background-color: #ccc;
        font-size: 6em;
    }
    .control-button.score span {
        transform: translate(0, -0.09em);
    }
    .control-button.score.is-score {
        background-color: var(--theme, red);
    }
</style>
