<template>
    <div class="container team-composition">
        <h2>Approved team composition</h2>


        <table class="table table-bordered table-dark table-sm">
            <thead>
                <tr v-if="category">
                    <th class="text-center" colspan="100">{{ category }}</th>
                </tr>
                <tr>
                    <th v-if="hasFeederEvents" class="text-center"><span v-b-tooltip="'Feeder event eligibility'"><i class="far fa-star"></i></span></th>
                    <th>Name</th>
                    <th class="wide"><i class="fab fa-discord fa-fw"></i> Discord tag</th>
                    <th class="wide"><i class="fab fa-battle-net fa-fw"></i> Battletag</th>
                    <th v-if="showMainRole">Main Role</th>
                    <th v-if="showEligibleRoles">Eligible Roles</th>
                    <th v-if="showSingleSR">SR</th>
                    <th v-if="showRoleSR">Tank SR</th>
                    <th v-if="showRoleSR">DPS SR</th>
                    <th v-if="showRoleSR">Support SR</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="player in players" :key="player.id">
                    <td v-if="hasFeederEvents" class="text-center">
                        <span v-b-tooltip="player.feederEligible ? 'Played in feeder events' : 'Did not play in feeder events'"><i v-if="player.feederEligible" class="fas fa-star"></i></span>
                    </td>
                    <td>
                        <span v-if="isCaptain(player)" v-b-tooltip="'Captain'" class="mr-1" v-html="getRoleSVG('Captain')"></span>
                        <span v-if="isStaff(player)" v-b-tooltip="'Staff'" class="mr-1" v-html="getRoleSVG('Staff')"></span>
                        <LinkedPlayers :players="[player]" />
                    </td>
                    <td>
                        <CopyTextButton v-if="player.discord_tag">{{ player.discord_tag }}</CopyTextButton>
                    </td>
                    <td>
                        <CopyTextButton v-if="player.battletag">{{ player.battletag }}</CopyTextButton>
                    </td>
                    <td v-if="showMainRole">
                        <div class="role-icons">
                            <role-icon :role="player.thisEventSignupData ? player.thisEventSignupData.main_role : player.role" />
                        </div>
                    </td>
                    <td v-if="showEligibleRoles" style="vertical-align: middle">
                        <div class="role-icons d-flex">
                            <role-icon
                                v-for="role in ((player.thisEventSignupData ? player.thisEventSignupData.eligible_roles : player.eligible_roles) || []).sort(sortRoles)"
                                :key="role"
                                v-b-tooltip="role"
                                :role="role"
                                class="role" />
                        </div>
                    </td>
                    <td v-if="showSingleSR">{{ player.thisEventSignupData ? player.thisEventSignupData.sr : player.manual_sr }}</td>
                    <td v-if="showRoleSR">{{ player.thisEventSignupData ? player.thisEventSignupData.tank_sr : player.composition_tank_sr }}</td>
                    <td v-if="showRoleSR">{{ player.thisEventSignupData ? player.thisEventSignupData.dps_sr :player.composition_dps_sr }}</td>
                    <td v-if="showRoleSR">{{ player.thisEventSignupData ? player.thisEventSignupData.support_sr : player.composition_support_sr }}</td>
                </tr>
            </tbody>
        </table>

        <div class="w-100 d-flex flex-wrap justify-content-center gap-2 align-items-center text-center">
            <div v-if="compositionText" class="flex-grow-1 text-start mb-3">{{ compositionText }}</div>
            <a v-if="useCalculator" class="btn btn-light text-dark fw-bold" target="_blank" :href="`https://slmn.io/calc?custom=${encodeURIComponent(dataString)}&category=${encodeURIComponent(category)}`">SLMN Calculator <i class="fas fa-chevron-right ml-2 fa-fw"></i></a>
            <a v-if="cta" class="btn btn-light text-dark fw-bold" target="_blank" :href="ctaLink(team)">{{ ctaText }} <i class="fas fa-fw fa-external-link ml-1"></i></a>
        </div>


        <div v-if="people?.length" class="mt-3">
            <h2>Team captains & staff</h2>
            <table class="table table-bordered table-dark table-sm w-auto">
                <thead>
                    <tr>
                        <th colspan="2">Roles</th>
                        <th>Name</th>
                        <th><i class="fab fa-discord fa-fw"></i> Discord tag</th>
                        <th><i class="fab fa-battle-net fa-fw"></i> Battletag</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="player in people" :key="player.id">
                        <td>
                            <span
                                v-for="role in player.is"
                                :key="role"
                                v-b-tooltip="role"
                                class="mr-1"
                                v-html="getRoleSVG(role)"></span>
                        </td>
                        <td>
                            {{ niceJoin(player.is) }}
                        </td>
                        <td class="wide">
                            <LinkedPlayers :players="[player]" />
                        </td>
                        <td><CopyTextButton v-if="player.discord_tag">{{ player.discord_tag }}</CopyTextButton></td>
                        <td><CopyTextButton v-if="player.battletag">{{ player.battletag }}</CopyTextButton></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import LinkedPlayers from "@/components/website/LinkedPlayers.vue";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { cleanID, getRoleSVG } from "@/utils/content-utils";
import RoleIcon from "@/components/website/RoleIcon.vue";
import CopyTextButton from "@/components/website/CopyTextButton.vue";
import { sortRoles } from "@/utils/sorts";

export default {
    name: "TeamComposition",
    components: { CopyTextButton, RoleIcon, LinkedPlayers },
    props: ["team"],
    computed: {
        showMainRole() {
            return this.players.some(p => {
                if (p.thisEventSignupData) {
                    if (p.thisEventSignupData.main_role) return true;
                } else {
                    if (p.role) return true;
                }
            });
        },
        showEligibleRoles() {
            return this.players.some(p => {
                if (p.thisEventSignupData) {
                    if (p.thisEventSignupData.eligible_roles) return true;
                } else {
                    if (p.eligible_roles) return true;
                }
            });
        },
        showRoleSR() {
            return this.players.some(p => {
                if (p.thisEventSignupData) {
                    if (p.thisEventSignupData.tank_sr || p.thisEventSignupData.dps_sr || p.thisEventSignupData.support_sr) return true;
                } else {
                    if (p.composition_tank_sr || p.composition_dps_sr || p.composition_support_sr) return true;
                }
            });
        },
        showSingleSR() {
            return this.players.some(p => {
                if (p.thisEventSignupData) {
                    if (p.thisEventSignupData.sr) return true;
                } else {
                    if (p.manual_sr) return true;
                }
            });
        },
        eventSettings() {
            if (!this.team?.event?.blocks) return null;
            try {
                return JSON.parse(this.team?.event.blocks);
            } catch (e) {
                return null;
            }
        },
        compositionText() {
            return this.eventSettings?.composition?.text;
        },
        useCalculator() {
            return this.eventSettings?.composition?.useCalculator;
        },
        cta() {
            return this.eventSettings?.composition?.ctaLink;
        },
        ctaText() {
            return this.eventSettings?.composition?.ctaText;
        },
        category() {
            if (!this.team?.team_category) return null;
            const split = this.team.team_category.split(";");
            if (split.length === 2) {
                return split[1];
            }
            return split[0];
        },
        dataString() {
            const data = [];
            this.players.forEach(p => {
                data.push([p.name, p.composition_tank_sr || "", p.composition_dps_sr || "", p.composition_support_sr || "", !this.hasFeederEvents ? 0 : p.feederEligible ? 1 : 2].join(","));
            });

            return data.join(";");
        },
        feederEvents() {
            return this.team?.event?.feeder_events || [];
        },
        hasFeederEvents() {
            return !!this.feederEvents?.length;
        },
        playerData() {
            if (!this.team?.players?.length) return [];
            return ReactiveArray("players", {
                signup_data: ReactiveArray("signup_data"),
                member_of: ReactiveArray("member_of", {
                    event: ReactiveThing("event")
                })
            })({ players: (this.team?.players || []) });
        },
        players() {
            return this.playerData.map(p => {
                let feederEligible = false;

                if (p.member_of?.length) {
                    feederEligible = p.member_of.some(team => team?.event?.id && this.feederEvents.some(event => event.id === team.event?.id));
                }

                const thisEventSignupData = (p.signup_data || []).find(data => cleanID(data?.event?.[0]) === cleanID(this.team?.event?.id));

                return {
                    ...p,
                    feederEligible,
                    thisEventSignupData
                };
            });
        },
        people() {
            return [
                ...this.team?.owners || [],
                ...this.team?.captains || [],
                ...this.team?.staff || [],
            ].filter((player, index, array) => {
                return array.findIndex(p => p.id === player.id) === index;
            }).map(person => {
                const roles = [];

                if ((this.team.owners || []).find(x => cleanID(x?.id) === cleanID(person.id))) roles.push("Owner");
                if ((this.team.captains || []).find(x => cleanID(x?.id) === cleanID(person.id))) roles.push("Captain");
                if ((this.team.staff || []).find(x => cleanID(x?.id) === cleanID(person.id))) {
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
        sortRoles,
        isCaptain(player) {
            if (!player?.id || !this.team?.captains?.length) return false;
            return !!((this.team.captains || []).find(p => cleanID(p.id) === cleanID(player.id)));
        },
        isStaff(player) {
            if (!player?.id || !this.team?.staff?.length) return false;
            return !!((this.team.staff || []).find(p => cleanID(p.id) === cleanID(player.id)));
        },
        getRoleSVG,
        ctaLink(team) {
            return this.cta.replace("{team_id}", team.id).replace("{team_name}", team.name).replace("{event_id}", this.team?.event?.id);
        },
        niceJoin(array) {
            const arr = [...array];
            if (arr.length > 1) {
                const last = arr.pop();
                return arr.join(", ") + " and " + last;
            }
            return arr[0];
        },
    }
};
</script>

<style scoped>
    .role-icons {
        font-size: 18px;
    }

    .table.w-auto td,
    .table.w-auto th {
        padding: 0.25em 0.5em;
    }
</style>
