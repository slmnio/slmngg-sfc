<template>
    <div v-if="_contrast !== Infinity && !isNaN(_contrast)" class="contrast-badge" :style="score?.style" :title="score?.text">
        {{ isNaN(_contrast) ? _contrast : _contrast.toFixed(2) }}
    </div>
</template>

<script>

import { calculateContrastHex } from "@/utils/content-utils";

export default {
    name: "ContrastBadge",
    props: ["contrast", "colors"],
    computed: {
        _contrast() {
            return this.contrast ?? calculateContrastHex(...this.colors);
        },
        score() {
            if (this._contrast < 3) {
                return {
                    text: "Fail",
                    style: {
                        backgroundColor: "#dc3545",
                        color: "white"
                    }
                };
            }
            if (this._contrast < 4.5) {
                return {
                    text: "AA Large",
                    style: {
                        backgroundColor: "#fd7e14",
                        color: "white"
                    }
                };
            }
            if (this._contrast < 7.0) {
                return {
                    text: "AA",
                    style: {
                        backgroundColor: "#8ba728",
                        color: "white"
                    }
                };
            }
            if (this._contrast >= 7.0) {
                return {
                    text: "AAA",
                    style: {
                        backgroundColor: "#28a745",
                        color: "white"
                    }
                };
            }
            return {
                text: "?",
                style: {
                    backgroundColor: "#222222",
                    color: "white"
                }
            };
        }
    }
};
</script>

<style scoped>

</style>
