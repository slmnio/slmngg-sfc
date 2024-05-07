<template>
    <div class="logo-overlay h-100 w-100">
        <div class="logo-container h-100 w-100">
            <div v-for="sponsor in sponsors" :key="sponsor.id" class="logo h-100 flex-center">
                <div class="logo-inner bg-center" :style="resizedImage(sponsor, ['default_wordmark', 'default_logo'], 'orig')"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray } from "@/utils/reactive";
import { resizedImage } from "@/utils/images";

export default {
    name: "LogoAdOverlay",
    props: ["broadcast"],
    computed: {
        sponsors() {
            if (!this.broadcast) return [];
            if (this.broadcast?.persistent_sponsors?.length) {
                return ReactiveArray("persistent_sponsors")(this.broadcast);
            }
            if (this.broadcast?.sponsors?.length) {
                return ReactiveArray("sponsors")(this.broadcast);
            }
            return [];
        }
    },
    methods: {
        resizedImage
    },
    head() {
        return {
            title: `Logos | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .logo-overlay {
        color: white;
        position: absolute;
        top: 0;
    }
    .logo-container {
        display: flex;
        justify-content: space-evenly;
    }
    .logo {
        width: 33%;
        margin: 0 10px;
    }
    .logo-inner {
        width: 90%;
        height: 90%;
    }
</style>
