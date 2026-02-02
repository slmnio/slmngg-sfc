<template>
    <div class="container team-public-details">
        <table class="table table-dark table-sm table-bordered">
            <thead>
                <tr v-if="players.length || team?.staff?.length">
                    <th></th>
                    <th>Name</th>
                    <th>Discord Tag</th>
                    <th>{{ gameOverride?.usernameText || 'Battletag' }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="player in players" :key="player.id">
                    <td class="role">
                        <RoleIcon v-b-tooltip class="details-role-icon flex-center" :role="player.role" :title="player.role" />
                    </td>
                    <td>
                        <i
                            v-if="player.is_captain"
                            v-b-tooltip
                            class="fas fa-fw fa-user-crown mr-1 text-warning"
                            :title="'Captain' + (player.highlight_role ? ', ' + player.highlight_role : '')"></i>
                        <i
                            v-else-if="player.highlight_role"
                            v-b-tooltip
                            class="fas fa-fw fa-star mr-1 text-warning"
                            :title="player.highlight_role"></i>
                        <router-link v-if="player.id" :to="url('player', player)">{{ player?.name }}</router-link>
                        <span v-else>{{ player?.name }}</span>
                    </td>
                    <td>
                        <CopyTextButton v-if="player?.discord_tag">{{ player?.discord_tag }}</CopyTextButton>
                    </td>
                    <td>
                        <CopyTextButton v-if="player?.[gameOverride?.usernameKey] || player?.battletag">{{ player?.[gameOverride?.usernameKey] || player?.battletag }}</CopyTextButton>
                    </td>
                </tr>
                <tr v-if="staff?.length" class="spacer" style="opacity: 0.5">
                    <td colspan="4"></td>
                </tr>
                <tr v-for="staff in staff" :key="staff.id">
                    <td class="role">
                        <RoleIcon v-b-tooltip :title="staff.staff_role || 'Staff'" class="flex-center" :role="staff.staff_role || 'Staff'" />
                    </td>
                    <td>
                        <i
                            v-if="staff.highlight_role"
                            v-b-tooltip
                            class="fas fa-fw fa-star mr-1 text-warning"
                            :title="staff.highlight_role"></i>

                        <router-link v-if="staff.id" :to="url('player', staff)">{{ staff?.name }}</router-link>
                        <span v-else>{{ staff?.name }}</span>
                    </td>
                    <td>
                        <CopyTextButton v-if="staff?.discord_tag">{{ staff?.discord_tag }}</CopyTextButton>
                    </td>
                    <td>
                        <CopyTextButton v-if="staff?.[gameOverride?.usernameKey] || staff?.battletag">{{ staff?.[gameOverride?.usernameKey] || staff?.battletag }}</CopyTextButton>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import RoleIcon from "@/components/website/RoleIcon.vue";
import CopyTextButton from "@/components/website/CopyTextButton.vue";
import { url } from "@/utils/content-utils";
import { GameOverrides } from "@/utils/games.js";

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
                return 0;
            });
        },
        staff() {
            let staff = this.team.staff;
            if (!staff?.length) staff = (this.team.limited_players || []).filter(p => p.name && p.role === "Staff").map(p => ({ ...p, limited: true }));
            return (staff || []).sort((a, b) => {
                if ((a.is_captain || a.highlight_role) === (b.is_captain || b.highlight_role)) return 0;
                if ((a.is_captain || a.highlight_role)) return -1;
                if ((b.is_captain || b.highlight_role)) return 1;
                return 0;
            });
        },
        gameOverride() {
            return GameOverrides[this.team?.event?.game];
        },
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

    .details-role-icon:deep(img) {
        object-fit: contain;
        width: 100%;
        height: 100%;
    }
</style>
