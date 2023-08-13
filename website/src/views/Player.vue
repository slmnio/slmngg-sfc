<template>
    <div>
        <div class="container">
            <div class="top d-flex flex-wrap">
                <div class="player-left">
                    <div class="player-top d-flex">
                        <div class="player-icon profile-picture-theme bg-center default-thing" v-if="profilePictureTheme?.backgroundImage" :style="profilePictureTheme"></div>
                        <!--                    <div class="player-icon bg-center default-thing" v-else-if="player.overwatch_icon" :style="bg(player.overwatch_icon)"></div>-->
                        <div class="player-name">
                            {{ player.name }}
                            <i class="fas fa-badge-check mr-3" v-if="player.verified"></i>
                            <span class="mini-label pronouns-display ml-1" v-if="player.pronouns">{{ player.pronouns | pronounsFilter }}</span>
                            <!--                        <router-link class="no-link-style d-inline" :to="subLink('participation')">-->
                            <!--                            <span class="mini-label participation-points" v-if="participationPoints">{{ participationPoints }} pts</span>-->
                            <!--                        </router-link>-->
                        </div>
                    </div>
                    <div class="player-socials" v-if="player.socials" :style="{ marginLeft: profilePictureTheme?.backgroundImage ? '84px' : '16px'}">
                        <Social class="ct-active" :social="social" v-for="social in player.socials" :key="social.id"/>
                    </div>
                </div>
                <div class="spacer flex-grow-1"></div>
                <div class="trophy-cabinet d-flex" v-if="trophies?.length">
                    <div class="trophy flex-center flex-column justify-content-start" v-for="trophy in trophies" :key="trophy.id">
                        <div class="trophy-team-icon" :title="`${trophy.trophy_tier} Winner`" v-b-tooltip>
                            <i class="fas fa-trophy-alt" v-if="trophy.trophy_tier === 'Championship'"></i>
                            <i class="fas fa-medal" v-if="trophy.trophy_tier === 'Tournament'"></i>
                        </div>
                        <router-link :to="url('team', trophy.team)">
                            <theme-logo logo-size="s-100" :theme="trophy.team.theme" class="trophy-team-logo" border-width="6px" />
                        </router-link>
                        <div class="trophy-team-text">
                            {{ trophy.short ?? trophy.name }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <SubPageNav>
            <li class="nav-item"><router-link class="nav-link" :to="subLink('')">Overview</router-link></li>
            <li class="nav-item" v-if="player.casts"><router-link class="nav-link" :to="subLink('casts')">Casts</router-link></li>
            <li class="nav-item" v-if="player.news"><router-link class="nav-link" :to="subLink('news')">News</router-link></li>
            <li class="nav-item" v-if="player.brands_designed"><router-link class="nav-link" :to="subLink('brands')">Brands</router-link></li>
            <li class="nav-item" v-if="hasMatchPlayerRelationships"><router-link class="nav-link" :to="subLink('matches')">Matches</router-link></li>
            <li class="nav-item" v-if="player.member_of && player.member_of.some(t => t.matches)"><router-link class="nav-link" :to="subLink('played-matches')">Played Match VODs</router-link></li>
            <li class="nav-item" v-if="player.member_of && player.member_of.some(t => t.matches)"><router-link class="nav-link" :to="subLink('match-stats')">Match Stats</router-link></li>
            <li class="nav-item"><router-link class="nav-link" :to="subLink('banner')">Banner Creator</router-link></li>
        </SubPageNav>
        <router-view :player="{...player, participationEvents, participationPoints }"></router-view>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import Social from "@/components/website/Social";
import SubPageNav from "@/components/website/SubPageNav";
import { pronounsFilter, url } from "@/utils/content-utils";
// import { sortEvents } from "@/utils/sorts";
import { bg, resizedImage } from "@/utils/images";
import { logoBackground } from "@/utils/theme-styles";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import { sortEvents } from "@/utils/sorts";

export default {
    name: "Player",
    props: ["id"],
    components: {
        ThemeLogo,
        Social,
        SubPageNav
    },
    methods: {
        url,
        logoBackground,
        resizedImage,
        bg,
        subLink(page) {
            return `/player/${this.player.id}/${page}`;
        }
    },
    computed: {
        player () {
            return ReactiveRoot(this.id, {
                member_of: ReactiveArray("member_of", {
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    }),
                    theme: ReactiveThing("theme"),
                    accolades: ReactiveArray("accolades", {
                        event: ReactiveThing("event", {
                            theme: ReactiveThing("theme")
                        })
                    })
                }),
                owned_teams: ReactiveArray("owned_teams", {
                    event: ReactiveThing("event"),
                    theme: ReactiveThing("theme")
                }),
                captain_of: ReactiveArray("captain_of", {
                    event: ReactiveThing("event"),
                    theme: ReactiveThing("theme")
                }),
                event_staff: ReactiveArray("event_staff", {
                    theme: ReactiveThing("theme")
                }),
                casted_events: ReactiveArray("casted_events", {
                    theme: ReactiveThing("theme")
                }),
                team_staff: ReactiveArray("team_staff", {
                    event: ReactiveThing("event"),
                    theme: ReactiveThing("theme")
                }),
                accolades: ReactiveArray("accolades", {
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                }),
                brands_designed: ReactiveArray("brands_designed", {
                    event: ReactiveThing("event"),
                    theme: ReactiveThing("theme")
                }),
                event_brands_designed: ReactiveArray("event_brands_designed", {
                    theme: ReactiveThing("theme")
                }),
                socials: ReactiveArray("socials"),
                player_relationships: ReactiveArray("player_relationships", {
                    events: ReactiveArray("events", {
                        theme: ReactiveThing("theme")
                    }),
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    })
                    // matches: ReactiveArray("matches")
                })
            });
        },
        profilePictureTheme() {
            if (!this.player?.profile_picture_theme?.[0]) return {};
            const theme = ReactiveRoot(this.player.profile_picture_theme?.[0]);
            return {
                ...logoBackground(theme),
                ...resizedImage(theme, ["default_logo", "small_logo", "default_wordmark"], "s-100")
            };
        },
        hasMatchPlayerRelationships() {
            if (!this.player?.player_relationships) return false;
            return this.player.player_relationships.some(rel => !!rel.matches);
        },
        trophies() {
            if (!this.player?.name) return [];
            return [
                // team things
                ...(this.player.member_of ? [].concat(...this.player.member_of.map(e => (e.accolades || []).filter(a => a?.show_for_players).map(a => ({ ...a, team: e }))).filter(Boolean)) : []),
                ...(this.player.accolades ? this.player.accolades.filter(a => a?.show_for_players && a?.teams?.length === 1).map(a => ({ ...a, team: a.teams?.[0] })) : [])
            ].filter(accolade => accolade.trophy_tier).sort((a, b) => {
                const TierPriority = ["Championship", "Tournament"];
                const tierIndexes = [a, b].map(x => TierPriority.indexOf(x.trophy_tier));
                const tierCompare = tierIndexes[0] - tierIndexes[1];
                if (tierCompare !== 0) return tierCompare;
                return sortEvents(b.event, a.event);
            });
        },
        participationEvents() {
            const events = (this.player.member_of || []).map(team => team?.event).filter(f => f?.participation_points);
            const uniqueEvents = new Map();
            events.forEach(ev => {
                if (uniqueEvents.has(ev.id)) return;
                uniqueEvents.set(ev.id, ev);
            });
            return [...uniqueEvents.values()].sort(sortEvents).reverse();
        },
        participationPoints() {
            return (this.participationEvents).map(e => e.participation_points).filter(f => f).reduce((c, v) => c + v, 0);
        }
    },
    metaInfo() {
        return {
            title: this.player.name
        };
    },
    filters: {
        pronounsFilter
    }
};

</script>

<style scoped>
.player-top {
    align-items: center;
}

.player-icon {
    width: 64px;
    height: 64px;
    margin-top: 6px;
    flex-shrink: 0;
}
.profile-picture-theme {
    background-size: 50px;
    border-radius: 2px;
}

.player-name {
    font-size: 64px;
    margin-left: 12px;
}

.player-socials {
    margin-top: -12px;
    margin-bottom: 12px;
}

@media (max-width: 575px) {
    .player-name {
        font-size: 48px;
    }
}

.mini-label {
    font-size: .25em;
    vertical-align: 1em;
    background-color: rgba(255, 255, 255, 0.1);
    color: rgb(255, 255, 255);
    padding: .25em .5em;
    border-bottom: 2px solid rgba(255,255,255,0.2);
    white-space: nowrap;
    margin-right: .5em;
}
.trophy {
    width: 60px;
    margin: 0 4px;
    text-align: center;
}
.trophy-team-logo {
    width: 60px;
    height: 60px;
    background-size: 90%;
}
.trophy-team-text {
    font-size: 11px;
    line-height: 1;
    margin-top: 4px;
    color: rgba(255,255,255,0.8)
}
.trophy-team-icon {
    margin-bottom: 4px
}
</style>
