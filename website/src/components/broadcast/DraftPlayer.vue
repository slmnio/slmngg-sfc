<template>
    <div class="draft-player" v-if="player && !player.dummy" :style="background">
        <div class="player-name">{{ player.name }}</div>
        <div class="player-role flex-center" v-if="showIcon" v-html="getSVG(player.role)"></div>
    </div>
    <div class="draft-player dummy" v-else :style="background">
        <div class="player-name">dummy</div>
    </div>
</template>

<script>
import { logoBackground } from "@/utils/theme-styles";
import { getRoleSVG } from "@/utils/content-utils";

export default {
    name: "DraftPlayer",
    props: {
        player: {},
        theme: {},
        asStaff: Boolean,
        showIcon: Boolean
    },
    computed: {
        background() { return logoBackground(this.theme); }
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
        margin: 0 2px 2px;
        padding: 1px 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
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
</style>

<style>
  svg {
      color: currentColor;
      fill: currentColor;
  }
</style>
