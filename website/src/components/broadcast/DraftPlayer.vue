<template>
    <div
        v-if="player && !player.dummy"
        :class="{'highlight': highlight}"
        class="draft-player"
        :style="background"
        :data-player-id="player && player.id || 'empty'">
        <Squeezable class="player-name">
            <div>{{ player.name }}</div>
        </Squeezable>
        <div v-if="showIcon" class="player-role flex-center" v-html="getSVG(player.role)"></div>
        <div v-if="badge" class="player-badge">
            <ThemeLogo class="badge-logo" :theme="badge && badge.theme" icon-padding="0.2em" logo-size="w-50" />
        </div>
    </div>
    <div
        v-else
        class="draft-player dummy"
        :style="background"
        :class="{'highlight': highlight}">
        <div class="player-name">dummy</div>
    </div>
</template>

<script>
import { logoBackground } from "@/utils/theme-styles";
import { getRoleSVG } from "@/utils/content-utils";
import ThemeLogo from "@/components/website/ThemeLogo";
import Squeezable from "@/components/broadcast/Squeezable.vue";

export default {
    name: "DraftPlayer",
    components: { Squeezable, ThemeLogo },
    props: {
        player: {},
        theme: {},
        asStaff: Boolean,
        showIcon: Boolean,
        badge: { },
        highlight: Boolean
    },
    computed: {
        background() {
            return logoBackground(this.theme);
        }
    },
    methods: {
        getSVG: getRoleSVG
    }
};
</script>

<style scoped>
    .draft-player {
        border-bottom: 2px solid transparent;
        font-size: 20px;
        width: calc(50% - 4px);
        margin: 0 0 2px;
        padding: 1px 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
        opacity: 1;
        transition: opacity 200ms ease;
    }
    .player-name {
        flex-grow: 1;
    }
    .player-role {
        --size: 1.25em;
        height: var(--size);
        width: var(--size);
    }
    .draft-player.dummy {
        opacity: 0.6;
    }
    .draft-player.dummy .player-name {
        opacity: 0;
    }
    .player-badge .badge-logo {
        width: 1.6em;
        height: 1.4em;
        border-bottom-width: .15em !important;
    }
</style>

<style>
  svg {
      color: currentColor;
      fill: currentColor;
  }
</style>
