<template>
    <div class="container team-public-details">
        <table class="table table-dark table-sm table-bordered">
            <tr v-if="players.length || team?.staff?.length">
                <th></th>
                <th>Name</th>
                <th>Discord Tag</th>
                <th>Battletag</th>
            </tr>
            <tr v-for="player in players" :key="player.id">
                <td class="role" :title="player.role" v-b-tooltip><RoleIcon class="flex-center" :role="player.role" /></td>
                <td>
                    <i v-if="player.is_captain" class="fas fa-fw fa-user-crown mr-1 text-warning" :title="'Captain' + (player.highlight_role ? ', ' + player.highlight_role : '')" v-b-tooltip></i>
                    <i v-else-if="player.highlight_role" class="fas fa-fw fa-star mr-1 text-warning" :title="player.highlight_role" v-b-tooltip></i>
                    <router-link v-if="player.id" :to="url('player', player)">{{ player?.name }}</router-link>
                    <span v-else>{{ player?.name }}</span>
                </td>
                <td><CopyTextButton v-if="player?.discord_tag">{{ player?.discord_tag }}</CopyTextButton></td>
                <td><CopyTextButton v-if="player?.battletag">{{ player?.battletag }}</CopyTextButton></td>
            </tr>
            <tr class="spacer" v-if="staff?.length">
                <td colspan="4"></td>
            </tr>
            <tr v-for="staff in staff" :key="staff.id">
                <td class="role" :title="staff.staff_role || 'Staff'" v-b-tooltip><RoleIcon class="flex-center" :role="staff.staff_role || 'Staff'" /></td>
                <td>
                    <i v-if="staff.highlight_role" class="fas fa-fw fa-star mr-1 text-warning" :title="staff.highlight_role" v-b-tooltip></i>
                    {{ staff?.name }}
                </td>
                <td><CopyTextButton v-if="staff?.discord_tag">{{ staff?.discord_tag }}</CopyTextButton></td>
                <td><CopyTextButton v-if="staff?.battletag">{{ staff?.battletag }}</CopyTextButton></td>
            </tr>
        </table>
    </div>
</template>

<script>
import RoleIcon from "@/components/website/RoleIcon.vue";
import CopyTextButton from "@/components/website/CopyTextButton.vue";
import { url } from "@/utils/content-utils";

export default {
    name: "TeamPublicDetails",
    components: { CopyTextButton, RoleIcon },
    props: {
        team: Object
    },
    computed: {
        players() {
            let players = (this.team?.players || []).filter(p => !p.__loading && p.id);
            if (!players?.length && this.team.limited_players?.length) {
                players = this.team.limited_players.filter(p => p.name && p.role !== "Staff").map(p => ({ ...p, limited: true, is_captain: p.captain || p.is_captain }));
            }
            return (players || []).map(player => ({
                ...player,
                is_captain: player.is_captain || this.isCaptain(player)
            })).sort((a, b) => {
                if (a.is_captain && !b.is_captain) return -1;
                if (b.is_captain && !a.is_captain) return 1;

                // return 1;
                if (a.highlight_role && !b.highlight_role) return -1;
                if (b.highlight_role && !a.highlight_role) return 1;
            });
        },
        staff() {
            let staff = this.team.staff;
            if (!staff?.length) staff = (this.team.limited_players || []).filter(p => p.name && p.role === "Staff").map(p => ({ ...p, limited: true }));
            return (staff || []).sort((a, b) => {
                if ((a.is_captain || a.highlight_role) === (b.is_captain || b.highlight_role)) return 0;
                if ((a.is_captain || a.highlight_role)) return -1;
                if ((b.is_captain || b.highlight_role)) return 1;
            });
        }
    },
    methods: {
        url,
        isCaptain(player) {
            if (!player?.id || !this.team?.captains) return false;
            return (this.team.captains.map(c => c.id).includes(player.id));
        }
    }
};
</script>

<style scoped>
    td.role {
        width: 1em;
        vertical-align: middle;
        line-height: 1;
    }
</style>
