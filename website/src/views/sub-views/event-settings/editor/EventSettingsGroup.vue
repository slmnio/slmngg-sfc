<template>
    <div class="event-settings-group d-flex flex-column">
        <div class="group-title px-2 py-1 fw-bold bg-dark dark-border d-flex justify-content-between" @click="open = !open">
            <div class="group-title-text">{{ title }}</div>
            <div><i class="fa fa-fw fa-chevron-left" :class="{ 'rotate': open }"></i></div>
        </div>
        <transition name="clip-swipe-down">
            <div v-show="open" class="group-content bg-dark px-3 dark-border">
                <slot></slot>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: "EventSettingsGroup",
    props: {
        title: String
    },
    data: () => ({
        open: true
    }),
};
</script>

<style scoped>
    .group-content {
        border-top: none;
    }
    .group-title {
        cursor: pointer;
    }

    .clip-swipe-down-enter-active,
    .clip-swipe-down-leave-active {
        transition: clip-path 200ms ease, max-height 200ms ease;
    }

    .clip-swipe-down-enter-to,
    .clip-swipe-down-leave-from {
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
        max-height: var(--height, 50vh);
    }
    .clip-swipe-down-enter-from,
    .clip-swipe-down-leave-to {
        clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
        max-height: 0;
    }
    .group-title i {
        transition: transform 200ms ease;
    }
    .group-title i.rotate {
        transform: rotate(-90deg);
    }
</style>
