<template>
    <div class="module">
        <div class="module-header bg-dark p-2 d-flex flex-center" @click="() => showDropdown = !showDropdown">
            <div class="text">
                <i class="fa-fw" :class="iconClass"></i>
                <b v-if="title" class="ml-2">{{ title }}</b>
                <span v-if="$slots.header" class="slot-dot"> • </span>
                <slot name="header"></slot>
            </div>
            <div class="spacer flex-grow-1"></div>
            <i class="fa fa-fw fa-chevron-left" :class="{ 'rotate': showDropdown }"></i>
        </div>
        <transition name="clip-swipe-down">
            <div
                v-show="showDropdown"
                ref="content"
                class="module-content bg-dark dark-scrollbar"
                :class="(contentClass || '') + (noContentBorder ? ' no-border' : '')"
                :style="moduleContentCSS">
                <slot v-if="loadDropdown"></slot>
            </div>
        </transition>
    </div>
</template>

<script>
import { useSettingsStore } from "@/stores/settingsStore";
import { mapWritableState } from "pinia";

export default {
    name: "DashboardModule",
    props: {
        iconClass: String,
        contentClass: String,
        title: String,
        startOpened: Boolean,
        noContentBorder: Boolean
    },
    data: () => ({
        loadDropdown: false,
        contentHeight: 0
    }),
    computed: {
        ...mapWritableState(useSettingsStore, ["openDashboardModules"]),
        showDropdown: {
            get() {
                const visible = this.openDashboardModules?.[this.title];
                if (visible !== undefined) {
                    return visible;
                }
                return this.startOpened;
            },
            set(visible) {
                this.openDashboardModules[this.title] = visible;

                this.loadDropdown = true;

                this.$nextTick(() => {
                    this.setHeight();
                    setTimeout(() => {
                        this.setHeight();
                    }, 250);
                });
            }
        },
        moduleContentCSS() {
            if (this.contentHeight <= 50) return {};
            return {
                "--height": `${this.contentHeight}px`
            };
        }
    },
    methods: {
        setHeight() {
            const height = this.$refs.content?.getBoundingClientRect()?.height;
            console.log(height);
            if (height > 50) this.contentHeight = height;
        }
    },
    created() {
        this.loadDropdown = this.showDropdown;
    }
};
</script>

<style scoped>
    .module-header {
        border: 1px solid #454d55;
        cursor: pointer;
        user-select: none;
    }
    .module-header i {
        transition: transform 200ms ease;
    }
    .module-header i.rotate {
        transform: rotate(-90deg);
    }
    .module-content {
        border: 1px solid #454d55;
        border-top: none;
    }
    .module-content.no-border {
        border: none;
    }

    .module-content:deep(.table tr th:last-child),
    .module-content:deep(.table tr td:last-child) {
        border-right: none;
    }
    .module-content:deep(.table tr th:first-child),
    .module-content:deep(.table tr td:first-child) {
        border-left: none;
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
</style>
