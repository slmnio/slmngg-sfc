<template>
    <div class="module">
        <div class="module-header bg-dark p-2 d-flex flex-center" @click="() => showDropdown = !showDropdown">
            <div class="text">
                <i class="fa-fw" :class="iconClass"></i>
                <b class="ml-2" v-if="title">{{ title }}</b>
                <span class="slot-dot" v-if="$slots.header"> • </span>
                <slot name="header"></slot>
            </div>
            <div class="spacer flex-grow-1"></div>
            <i class="fa fa-fw fa-chevron-left" :class="{ 'rotate': showDropdown }"></i>
        </div>
        <transition name="clip-swipe-down">
            <div class="module-content bg-dark" :class="(contentClass || '') + (noContentBorder ? ' no-border' : '')" :style="moduleContentCSS" v-show="showDropdown" ref="content">
                <slot v-if="loadDropdown"></slot>
            </div>
        </transition>
    </div>
</template>

<script>
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
        showDropdown: false,
        loadDropdown: false,
        contentHeight: 0
    }),
    computed: {
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
        const storeData = this.$store.getters.dashboardModuleIsVisible(this.title);
        if (storeData !== undefined) this.showDropdown = storeData;

        if (this.startOpened) this.showDropdown = true;
        this.loadDropdown = this.showDropdown;
    },
    watch: {
        showDropdown(isVisible) {
            this.$store.commit("setDashboardModuleVisibility", { moduleName: this.title, visible: isVisible });
            this.loadDropdown = true;

            this.$nextTick(() => {
                this.setHeight();
                setTimeout(() => {
                    this.setHeight();
                }, 250);
            });
        }
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

    .module-content >>> .table tr th:last-child,
    .module-content >>> .table tr td:last-child {
        border-right: none;
    }
    .module-content >>> .table tr th:first-child,
    .module-content >>> .table tr td:first-child {
        border-left: none;
    }

    .clip-swipe-down-enter-active,
    .clip-swipe-down-leave-active {
        transition: clip-path 200ms ease, max-height 200ms ease;
    }

    .clip-swipe-down-enter-to,
    .clip-swipe-down-leave {
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
        max-height: var(--height, 50vh);
    }
    .clip-swipe-down-enter,
    .clip-swipe-down-leave-to {
        clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
        max-height: 0;
    }
</style>
