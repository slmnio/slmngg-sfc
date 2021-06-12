<template>
    <tr v-bind:key="player.id">
        <td><router-link :to="url('player', player)">{{ player.name }}</router-link></td>
        <td v-if="player.rating" v-b-tooltip.top="player.rating.note">{{ player.rating.level }}</td>
        <td v-else></td>
        <td>
            <div class="player-role flex-center" v-html="getSVG(player.role)"></div>
        </td>
        <td v-if="hasDraftData">
            <div class="player-heroes" v-if="player.heroes" v-b-tooltip.hover.top="player.heroes && player.heroes.join(', ')">
                <HeroIcon v-for="hero in player.heroes" :hero="hero" v-bind:key="hero" />
            </div>
        </td>
        <td v-if="hasDraftData" class="info-for-captains">{{  player.info_for_captains }}</td>
        <td v-if="!hasDraftData" class="notes">{{ player.notes }}</td>
    </tr>
</template>

<script>
import HeroIcon from "@/components/website/HeroIcon";
import { getRoleSVG, url } from "@/utils/content-utils";

export default {
    name: "PlayerDraftRow",
    props: ["player", "hasDraftData"],
    components: { HeroIcon },
    methods: {
        url,
        getSVG: getRoleSVG,
        getHeroIcons(heroes) {
            if (!heroes) return "";
            console.log(heroes);
            return heroes.map(hero => `https://media.slmn.io/heroes/${hero}_icon_pink.png`).map(url => `<img class="hero-icon" src="${url}">`).join("");
        }
    }
};
</script>

<style scoped>

.player-role {
    width: 1.5em;
    height: 1.5em;
}
.notes {
    white-space: pre-wrap;
}

.player-heroes {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    max-height: calc(24px * 2.25);
    overflow-y: scroll;

    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
}
.player-heroes::-webkit-scrollbar  {
    display: none;  /* Safari and Chrome */
}
td.info-for-captains {
    font-size: .85em;
    white-space: pre-wrap;
}
</style>

<style>
.player-heroes img.hero-icon {
    height: 24px;
    filter: brightness(0) invert();
}
</style>
