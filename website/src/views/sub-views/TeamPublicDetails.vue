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
                <td class="role" :title="player.role" v-b-tooltip><RoleIcon :role="player.role" /></td>
                <td>
                    <i v-if="player.is_captain" class="fas fa-user-crown mr-2 text-warning" title="Captain" v-b-tooltip></i>
                    <router-link v-if="player.id" :to="url('player', player)">{{ player?.name }}</router-link>
                    <span v-else>{{ player?.name }}</span>
                </td>
                <td><CopyTextButton v-if="player?.discord_tag">{{ player?.discord_tag }}</CopyTextButton></td>
                <td><CopyTextButton v-if="player?.battletag">{{ player?.battletag }}</CopyTextButton></td>
            </tr>
            <tr class="spacer" v-if="team?.staff?.length">
                <td colspan="4"></td>
            </tr>
            <tr v-for="staff in team.staff" :key="staff.id">
                <td class="role" :title="staff.staff_role || 'Staff'" v-b-tooltip><RoleIcon :role="staff.staff_role || 'Staff'" /></td>
                <td>{{ staff?.name }}</td>
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
            let players = this.team?.players;
            if (!players?.length && this.team.limited_players?.length) {
                players = this.team.limited_players.filter(p => p.name && p.role !== "Staff").map(p => ({ ...p, limited: true, is_captain: p.captain || p.is_captain }));
            }
            return (players || []).map(player => ({
                ...player,
                is_captain: player.is_captain || this.isCaptain(player)
            })).sort((a, b) => {
                if (a.is_captain === b.is_captain) return 0;
                if (a.is_captain) return -1;
                if (b.is_captain) return 1;
            });
        },
        staff() {
            if (this.team?.staff?.length) return this.team.staff;
            return this.team.limited_players.filter(p => p.name && p.role === "Staff").map(p => ({ ...p, limited: true }));
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
