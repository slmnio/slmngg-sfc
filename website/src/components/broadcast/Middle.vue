<template>
    <div class="centerer" :class="{'tiny': tiny}" >
        <ThemeTransition :one-color="true" start="middle" end="middle" :theme="theme" :active="!!active"
                         :duration="400" :starting-delay="500" :inner-delay="300" :leaving-delay="0"
                         class="middle-holder flex-center" :use-fit-content="true" :clear-style-after-entered="true">
            <div class="middle" :style="middleBorderStyle">
                <transition name="fade" mode="out-in">
                    <div class="industry-align" :key="text">{{ text }}</div>
                </transition>
            </div>
        </ThemeTransition>
    </div>
</template>

<script>
import ThemeTransition from "@/components/broadcast/ThemeTransition.vue";

export default {
    name: "Middle",
    components: { ThemeTransition },
    props: ["text", "tiny", "active", "theme", "borders"],
    computed: {
        middleBorderStyle() {
            if (!this.borders?.length) return {};
            return {
                borderWidth: "0 6px",
                borderStyle: "solid",
                borderColor: "transparent",
                borderLeftColor: this.borders?.[0]?.backgroundColor,
                borderRightColor: this.borders?.[1]?.backgroundColor
            };
        }
    }
};
</script>

<style scoped>
.centerer {
    position: absolute;
    width: 100%;
    display: flex;
    justify-content: center;
    top: -12px;
    pointer-events: none;
    transition: all .2s ease-in-out;
}

.middle-holder {
    overflow: hidden;
    white-space: nowrap;
    width: 450px;
    border-radius: 4px;
}

.middle {
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    padding: .0em .5em;
    font-size: 24px;
    text-transform: uppercase;
    display: inline-flex;
    border-radius: 4px;
    transition: all .2s ease-in-out;
}

.mid-leave-active,
.mid-leave-active .middle-holder { transition: all .5s ease-in-out/* .5s*/; }

.mid-enter-active,
.mid-enter-active .middle-holder { transition: all .5s ease-in-out .25s; }

.mid-enter-to .middle-holder, .mid-leave .middle-holder { width: 450px; }
.mid-enter .middle-holder, .mid-leave-to .middle-holder { width: 0; }


.centerer.tiny {
    top: 3px;
}
.centerer.tiny .middle {
    font-size: 20px;
    padding: 0 .5em;
    line-height: 1.2em;
}

.centerer >>> .theme-transition-outer {
    border-radius: 4px !important;
    overflow: hidden;
}
.centerer >>> .theme-transition.end-middle.tt-enter-to .theme-transition-inner,
.centerer >>> .theme-transition.end-middle.tt-enter-to .theme-transition-outer {
    clip-path: polygon(0% 0%, 0% 110%, 50% 110%, 50% 0, 50% 0, 50% 110%, 100% 110%, 100% 0%) !important;
    /* this is a hack to avoid a subpixel issue at the bottom of the box */
    /* could be to do with 0.5 margins having a .5px adjustment */
}
</style>
