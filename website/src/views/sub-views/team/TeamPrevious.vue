<template>
    <div class="container">
        <div class="row">
            <b-form-checkbox v-model="showDuplicates">Show duplicates</b-form-checkbox>

            <table class="table table-bordered table-dark table-sm previous-table">
                <thead>
                    <tr>
                        <th></th>
                        <th v-for="player in players" :key="player.id" class="text-center">
                            <router-link :to="url('player', player)">{{ player?.name }}</router-link>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in matrix" :key="p.player.id">
                        <th class="text-right align-middle">
                            <router-link :to="url('player', p?.player)">{{ p?.player?.name }}</router-link>
                        </th>
                        <td v-for="(t, i) in p?.teammates" :key="i" :class="{'self': t.self, 'duplicate': t.duplicate}">
                            <div class="shared-team-logos">
                                <ContentThing
                                    v-for="sharedTeam in t?.teams"
                                    :key="sharedTeam?.id"
                                    class="shared-team-logo"
                                    :thing="sharedTeam"
                                    :theme="sharedTeam?.theme"
                                    :show-logo="true"
                                    type="team"
                                    :text="`${sharedTeam?.name || ''}${sharedTeam?.event?.name ? `\n(${sharedTeam?.event?.short || sharedTeam?.event?.name || ''})` : ''}`"
                                />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>

import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import ContentThing from "@/components/website/ContentThing.vue";
import { url } from "@/utils/content-utils";

export default {
    name: "TeamPrevious",
    components: { ContentThing },
    props: ["team"],
    data: () => ({
        showDuplicates: false
    }),
    computed: {
        players() {
            return ReactiveRoot(this.team?.id, {
                "players": ReactiveArray("players", {
                    "member_of": ReactiveArray("member_of", {
                        "theme": ReactiveThing("theme"),
                        "event": ReactiveThing("event")
                    })
                })
            })?.players;
        },
        matrix() {
            const complete = new Set();

            return (this.players || []).map(player => {
                return {
                    player,
                    teammates: (this.players || []).map(teammate => {
                        if (player?.id === teammate?.id) return { self: true };
                        if (!this.showDuplicates && complete.has([teammate?.id, player?.id].sort().join("-"))) return { duplicate: true };
                        complete.add([teammate?.id, player?.id].sort().join("-"));
                        const thisGame = this.team?.event?.game;
                        const teams = (teammate?.member_of || []).filter(team => (thisGame ? team?.event?.game === thisGame : true) && !team.minor_team && team.id !== this.team?.id && (player?.member_of || []).some(t => t.id === team.id));

                        return {
                            teammate,
                            teams
                        };
                    })
                };
            });
        }
    },
    methods: { url }
};
</script>

<style scoped>
    .shared-team-logos {
        display: flex;
        flex-wrap: wrap;
    }

    td.self {
        background-color: rgb(52 58 64 / 50%);
    }

    td.duplicate {
        background-color: rgb(52 58 64 / 50%);
    }
    .previous-table {
        table-layout: fixed;
    }
    .content-thing:deep(.link-text) {
        line-height: 1;
        transform: var(--overlay-line-height-adjust, translate(0, -0.0925em));
        --translate-y: -0.0925em;
        align-items: center;
    }
    .content-thing:deep(.icon-internal) {
        flex-shrink: 0;
    }
    .content-thing:deep(.name) {
        white-space: pre-line;
    }
</style>
