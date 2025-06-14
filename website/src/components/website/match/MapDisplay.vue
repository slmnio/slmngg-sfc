<template>
    <div v-if="showBannedMaps ? true : !banned" :class="`map ${mapClass} ${condensed ? 'condensed' : ''} ${banned ? 'is-banned' : ''}`">
        <div class="map-image default-thing" :style="imageCSS">
            <div v-if="map?.draw" class="map-color-overlay draw"></div>
            <div v-if="banned" class="map-color-overlay ban-icon-holder banned">
                <i class="ban-icon fas fa-ban"></i>
            </div>
            <div v-if="winner" class="map-color-overlay winner" :style="logoBackground1(winner)"></div>

            <div v-if="winner" class="map-winner-image bg-center" :style="resizedImage(winner.theme, ['default_logo', 'small_logo'], 'h-90')"></div>
            <div v-if="number && !condensed && !banned" class="map-insert-number">{{ number }}</div>

            <div v-if="banned && !condensed" class="map-insert-text">BANNED</div>
            <div v-if="map?.draw && complete && !condensed" class="map-insert-text">DRAW</div>
            <div v-if="!complete && !condensed && !winner && mapClass === 'tiebreaker'" class="map-insert-text">TIEBREAKER</div>
            <div v-if="!complete && !condensed && !winner && mapClass === 'extra'" class="map-insert-text">IF REQUIRED</div>
        </div>
        <div class="map-lower-text map-name">{{ name || '--' }}</div>
        <div v-if="scores" class="map-lower-text map-scores">{{ scores }}</div>
        <div v-if="!condensed && (banText || pickText)" class="map-lower-text map-pick">{{ banText || pickText || '' }}</div>
        <div v-if="!condensed && map?.replay_code" class="map-lower-text map-replay-code">
            <i v-b-tooltip="gameOverride?.lang?.replay_code || 'Replay Code'" class="fas fa-history fa-fw"></i> <CopyTextButton>{{ map.replay_code }}</CopyTextButton>
        </div>
        <div v-if="showSelfPicks && map.picker?.id === self?.id" class="map-self-pick">
            {{ self.code }} PICK
        </div>
        <div v-if="showPickBanHeroes" class="pick-ban-heroes">
            <div v-if="map?.team_1_picks?.length || map?.team_2_picks?.length" class="picks">
                <div class="team-group">
                    <div
                        v-for="hero in map.team_1_picks"
                        :key="hero.id"
                        v-b-tooltip="`${hero.name} picked by ${match?.teams?.[0]?.name || 'Team 1'}`"
                        class="hero bg-center hero-picked team-1"
                        :style="resizedImage(hero, ['icon'], 's-100')"></div>
                </div>
                <div class="team-group">
                    <div
                        v-for="hero in map.team_2_picks"
                        :key="hero.id"
                        v-b-tooltip="`${hero.name} picked by ${match?.teams?.[1]?.name || 'Team 2'}`"
                        class="hero bg-center hero-picked team-2"
                        :style="resizedImage(hero, ['icon'], 's-100')"></div>
                </div>
            </div>
            <div v-if="map?.team_1_bans?.length || map?.team_2_bans?.length" class="bans">
                <div class="team-group">
                    <div
                        v-for="hero in map.team_1_bans"
                        :key="hero.id"
                        v-b-tooltip="`${hero.name} banned by ${match?.teams?.[0]?.name || 'Team 1'}`"
                        class="hero bg-center hero-banned team-1"
                        :style="resizedImage(hero, ['icon'], 's-100')"></div>
                </div>
                <div class="team-group">
                    <div
                        v-for="hero in map.team_2_bans"
                        :key="hero.id"
                        v-b-tooltip="`${hero.name} banned by ${match?.teams?.[1]?.name || 'Team 2'}`"
                        class="hero bg-center hero-banned team-2"
                        :style="resizedImage(hero, ['icon'], 's-100')"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { cleanID } from "@/utils/content-utils";
import { logoBackground1, themeBackground } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";
import CopyTextButton from "@/components/website/CopyTextButton.vue";
import { GameOverrides } from "@/utils/games";

export default {
    name: "MapDisplay",
    components: { CopyTextButton },
    props: ["map", "theme", "match", "i", "condensed", "showBannedMaps", "showSelfPicks", "showPickBanHeroes", "self"],
    computed: {
        mapClass() {
            if (!this.match) return "";
            if ((this.match.first_to * 2) - 1 === this.map.number) return "tiebreaker";
            if ((this.match.first_to * 2) - 1 < this.map.number) return "extra";
            return "required";
        },
        number() {
            return this.map?.number || this.i + 1;
        },
        winner() {
            return this.getTeamFromID(this.map?.winner);
        },
        banned() {
            return this.map?.banned || this.banned_by;
        },
        banned_by() {
            return this.getTeamFromID(this.map?.banner);
        },
        picked_by() {
            return this.getTeamFromID(this.map?.picker);
        },
        imageCSS() {
            let mapTheme = { color: "#ffffff" };
            if (!(this.map?.map?.image || this.map?.image) && this.theme) {
                mapTheme = themeBackground(this.theme);
            }
            return {
                ...resizedImage((this.map?.map || this.map), ["image"], "h-160"),
                ...mapTheme
            };
        },
        complete() {
            if (!this.match) return false;
            return [this.match?.score_1, this.match?.score_2].some(s => s === this.match.first_to);
        },
        name() {
            console.log(this.map);
            try {
                if (this.condensed) return this.map.map?.short_name || this.map.short_name[0];
                return this.map.map?.name || this.map.name[0];
            } catch (e) { return ""; }
        },
        scores() {
            if (this.map?.score_1 == null || this.map?.score_2 == null) return null;
            return [this.map.score_1, this.map.score_2].join(" - ");
        },
        pickText() {
            if (!this.map?.picker) return null;
            return `picked by ${this.map.picker.code || this.map.picker.name}`;
        },
        banText() {
            if (!this.map?.banner) return null;
            return `banned by ${this.map.banner.code || this.map.banner.name}`;
        },
        gameOverride() {
            return GameOverrides[this.match?.event?.game];
        },
    },
    methods: {
        logoBackground1,
        resizedImage,
        getTeamFromID(id) {
            if (!id) return null;
            return (this.match.teams || []).find(t => t.id === cleanID(id));
        }
    }
};
</script>

<style scoped>
    .map {
        width: 160px;
        margin: 10px;
        position: relative;
    }
    .map-image {
        padding-bottom: 56.25%;
        width: 100%;
        position: relative;
        background-size: cover;
        background-position: center;
    }
    .map-color-overlay {
        width: 100%;
        height: 100%;
        position: absolute;
        opacity: 0.7;
    }
    .map-color-overlay.draw {
        background-color: #555;
    }
    .map-color-overlay.banned {
        background-color: #555;
    }
    .map-winner-image {
        width: 80%;
        height: 80%;
        left: 10%;
        top: 10%;
        position: absolute;
    }
    .map-insert-number {
        position: absolute;
        right: 0;
        top: 0;
        padding: 0 6px;
        filter: drop-shadow(0px 0px 3px black);
        font-size: 20px;
        min-width: 25px;
    }
    .map-insert-text {
        position: absolute;
        bottom: 2px;
        width: 100%;
        text-align: center;
        font-size: 18px;
        filter: drop-shadow(0px 0px 3px black);
    }
    .map-score {
        line-height: 1;
        text-align: center;
        margin-top: 6px;
    }

    .map-lower-text {
        line-height: 1;
        font-size: 0.85em;
        text-align: center;
        margin-top: 4px;
    }
    .map.condensed .map-lower-text {
        font-size: 0.6em;
        margin-top: 1px;
    }

    .map-replay-code {
        margin-top: 5px;
    }

    .map-name {
        line-height: 1;
        text-align: center;
        margin-top: 6px;
        font-size: 1em;
    }
    .map.condensed .map-name {
        font-size: 0.6em;
        margin-top: 3px;
    }
    .map-self-pick {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        text-align: center;
        background-color: rgba(0,0,0,0.8);
        font-size: 0.55em;
        font-weight: bold;
    }

    .pick-ban-heroes {
        margin-top: .5rem;
        gap: .5em;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
    }

    .team-group, .picks, .bans {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
    }

    .picks, .bans {
        gap: .25em;
    }

    .bans .team-group {
        background-color: var(--danger);
        padding: .125em;
        border-radius: .25em;
    }
    .picks .team-group {
        background-color: var(--primary);
        padding: .125em;
        border-radius: .25em;
    }

    .hero {
        width: 30px;
        height: 30px;
    }
    .ban-icon-holder {
        display: flex;
        justify-content: center;
        font-size: 5em;
        align-items: center;
        color: rgba(255, 255, 255, 0.25);
        overflow: hidden;
    }
</style>
