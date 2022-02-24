<template>
    <tr v-bind:key="player.id">
        <td class="draft--name"><router-link :to="url('player', player)">{{ player.name }} <i class="fas fa-badge-check" v-if="player.verified"></i></router-link></td>
        <td class="draft--highest-rank" v-if="game === 'Valorant'">{{ player._draftData && player._draftData.highest_rank }}</td>
        <td class="draft--current-rank" v-if="game === 'Valorant'">{{ player._draftData && player._draftData.current_rank }}</td>
        <td class="draft--sr" v-if="game === 'Overwatch' && player.rating" v-b-tooltip.top="player.rating.note">{{ player.rating.level }}</td>
        <td v-else-if="game === 'Overwatch'"></td>
        <td class="draft--role" v-if="game === 'Overwatch'" v-b-tooltip.top="extendedRole">
            <div class="player-role flex-center" v-html="getSVG(player.role)"></div>
        </td>
        <td class="draft--heroes" v-if="hasDraftData && settings.heroes">
            <div class="player-heroes" v-if="player.heroes" v-b-tooltip.hover.top="player.heroes && player.heroes.join(', ')">
                <HeroIcon v-for="hero in player.heroes" :hero="hero" v-bind:key="hero" />
            </div>
        </td>
        <td v-if="settings.slmn_events">
            <PlayerDraftTeamInfo v-for="team in teams" :team="team" v-bind:key="team.id"/>
        </td>
        <td v-if="hasDraftData && settings.info_for_captains" class="info-for-captains">{{  player.info_for_captains }}</td>
        <td v-if="settings.custom_notes">
            <div class="custom-note" @click="doNote">
                {{ (notes && notes.notes) || '--' }}
            </div>
        </td>
        <td class="draft--controls">
            <b-button-group>
                <b-button size="sm" v-b-tooltip.left="'Set note'" variant="primary" class="text-dark" @click="doNote()"><i class="fas fa-fw fa-user-edit"></i></b-button>
                <b-button size="sm" v-b-tooltip.left="tag === 'starred' ? 'Unstar' : 'Star'" variant="warning" @click="setNote('starred')"><i class="fas fa-fw fa-star"></i></b-button>
                <b-button size="sm" v-b-tooltip.right="tag === 'ignored' ? 'Unignore' : 'Ignore'" variant="danger" @click="setNote('ignored')"><i class="fas fa-fw fa-ban"></i></b-button>
            </b-button-group>
        </td>
    </tr>
</template>

<script>
import HeroIcon from "@/components/website/HeroIcon";
import { getRoleSVG, url } from "@/utils/content-utils";
import { BButton, BButtonGroup } from "bootstrap-vue";
import store from "@/thing-store";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import PlayerDraftTeamInfo from "@/components/website/draft/PlayerDraftTeamInfo";
import { sortEvents } from "@/utils/sorts";

export default {
    name: "PlayerDraftRow",
    props: ["player", "hasDraftData", "settings", "game"],
    components: { PlayerDraftTeamInfo, HeroIcon, BButton, BButtonGroup },
    data: () => ({
        customNote: ""
    }),
    methods: {
        url,
        getSVG: getRoleSVG,
        getHeroIcons(heroes) {
            if (!heroes) return "";
            console.log(heroes);
            return heroes.map(hero => `https://media.slmn.io/heroes/${hero}_icon_pink.png`).map(url => `<img class="hero-icon" src="${url}">`).join("");
        },
        setNote(tag, note) {
            console.log(tag, note, this.tag);
            if (this.tag === tag) tag = null;
            store.commit("setPlayerDraftNotes", { playerID: this.player.id, tag, notes: note });
        },
        doNote() {
            const text = prompt(`Set ${this.player.name}'s custom note`, this.notes?.notes);
            this.setNote(undefined, text);
        }
    },
    computed: {
        notes() {
            return store.getters.getNotes(this.player.id);
        },
        tag() {
            return this.notes?.tag;
        },
        _player() {
            if (!this.player?.id) return {};
            return ReactiveRoot(this.player.id, {
                member_of: ReactiveArray("member_of", {
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                })
            });
        },
        teams() {
            if (!this._player?.member_of) return [];
            return this._player.member_of.slice().filter(event => event.game === this.game).sort(sortEvents);
        },
        extendedRole() {
            if (!this.player?.draft_data) return null;
            try {
                const draftData = JSON.parse(this.player.draft_data);
                return draftData.role;
            } catch (e) { return null; }
        }
    }
};
</script>

<style scoped>

.player-role {
    width: 100%;
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
    width: calc(24px * 4);
}
.player-heroes::-webkit-scrollbar  {
    display: none;  /* Safari and Chrome */
}
td.info-for-captains {
    font-size: .85em;
    white-space: pre-wrap;
}

a { font-weight: bold; }
.table-warning a {
    color: black !important;
}
.table-danger a {
    color: white !important;
}
.draft-buttons {
    white-space: nowrap;
}
.draft-buttons .btn {
    padding: .1rem .35rem;
}

.draft--name { width: 7em; }
.draft--sr { width: 3.5em; text-align: center; }
.draft--role { width: 3.5em; text-align: center; }
.draft--controls { width: 5em; text-align: center; }
.draft--highest-rank, .draft--current-rank { width: 6em; text-align: center; }
</style>

<style>
.player-heroes img.hero-icon {
    height: 24px;
    filter: brightness(0) invert();
}
.table-warning .player-heroes img.hero-icon  {
    filter: brightness(0);
}
</style>
