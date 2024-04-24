<template>
    <div class="container event-rosters">
        <h2>Team details</h2>
        <table class="table table-bordered table-dark table-sm">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Pronouns</th>
                    <th>Pronunciation</th>
                    <th class="wide"><i class="fab fa-twitter fa-fw"></i> Twitter</th>
                    <th class="wide"><i class="fab fa-discord fa-fw"></i> Discord tag</th>
                    <th class="wide"><i class="fab fa-battle-net fa-fw"></i> Battletag</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="player in people" :key="player.id">
                    <td class="wide">
                        <span v-for="role in player.is" :key="role" v-b-tooltip="role" v-html="getRoleSVG(role)" class="mr-1"></span>
                        <LinkedPlayers :players="[player]"/>
                    </td>
                    <td class="wide">{{ player.pronouns }}</td>
                    <td>{{ player.pronunciation }}</td>
                    <td class="wide"><TwitterLink :thing="player" /></td>
                    <td class="wide">{{ player.discord_tag }}</td>
                    <td class="wide">{{ player.battletag }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import TwitterLink from "@/components/website/TwitterLink";
import LinkedPlayers from "@/components/website/LinkedPlayers";
import { getRoleSVG } from "@/utils/content-utils";

export default {
    name: "TeamDetails",
    props: ["team"],
    components: { LinkedPlayers, TwitterLink },
    computed: {
        _team() {
            if (!this.team) return [];
            return ReactiveRoot(this.team.id, {
                theme: ReactiveThing("theme"),
                players: ReactiveArray("players"),
                staff: ReactiveArray("staff"),
                captains: ReactiveArray("captains")
            });
        },
        people() {
            return [
                ...this._team?.owners || [],
                ...this._team?.captains || [],
                ...this._team?.staff || [],
                ...this._team?.players || []
            ].filter((player, index, array) => {
                return array.findIndex(p => p.id === player.id) === index;
            }).map(person => {
                const roles = [];

                if ((this._team.owners || []).find(x => x.id === person.id)) roles.push("Owner");
                if ((this._team.captains || []).find(x => x.id === person.id)) roles.push("Captain");
                if ((this._team.staff || []).find(x => x.id === person.id)) {
                    if (person.staff_role) {
                        roles.push(person.staff_role);
                    } else {
                        roles.push("Staff");
                    }
                }

                return {
                    ...person,
                    is: roles
                };
            });
        }
    },
    methods: {
        getRoleSVG
    }
};
</script>

<style scoped>
    .wide {
        white-space: nowrap;
    }
</style>
