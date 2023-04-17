<template>
    <div class="break-sponsors">

        <div class="sponsors-holder">
            <transition class="sponsors" name="spon-anim" :mode="mode || 'in-out'">
                <div class="break-sponsor flex-center" :style="bg(activeSponsor)"
                     :key="activeSponsor ? activeSponsor.id : 'empty'">
                    <div class="break-sponsor-logo bg-center" :style="logo(activeSponsor)"></div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import { resizedImage } from "@/utils/images";

export default {
    name: "Sponsors",
    props: ["sponsors", "size", "mode", "speed"],
    data: () => ({
        sponsorIndex: 0
    }),
    computed: {
        activeSponsor() {
            if (!this.sponsors) return null;
            return this.sponsors[this.sponsorIndex] || this.sponsors[0];
        }
    },
    methods: {
        bg(theme) {
            if (!theme) return null;
            return { backgroundColor: theme.color_logo_background || theme.color_theme };
        },
        logo (theme) {
            return resizedImage(theme, ["default_wordmark", "default_logo"], this.size || "h-150");
        },
        nextSponsor() {
            this.sponsorIndex++;
            if (this.sponsorIndex >= (this.sponsors || []).length) this.sponsorIndex = 0;
        }
    },
    mounted() {
        console.log(this.sponsors);
        setInterval(this.nextSponsor, this.speed || 10000);
    }
};
</script>

<style scoped>
    .break-sponsor {
        width: 100%;
        height: 100%;
        background: #333;
        position: absolute;
    }
    .break-sponsor-logo {
        width: calc(100% - 4em);
        height: calc(100% - 2em);
    }

    .break-sponsors {
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
    }
    .sponsors-holder {
        position: relative;
        height: 165px;
        width: 100%;
    }

    .spon-anim-enter-active,
    .spon-anim-leave-active {
        transition: all .5s ease;
        left: 0;
    }

    .spon-anim-enter, .spon-anim-leave-to {
        opacity: 0;
    }
    .spon-anim-enter-to, .spon-anim-leave {
        opacity: 1;
    }

</style>
