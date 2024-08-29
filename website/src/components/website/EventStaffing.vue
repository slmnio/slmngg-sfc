<template>
    <div v-if="appearances.length" class="event-staffing">
        <!-- Table: staff vs roles, counts of staff in that role -->
        <table class="table table-sm table-dark table-hover table-bordered" :class="{'user-select-none': paint}">
            <thead>
                <tr>
                    <th class="px-1">Staff</th>
                    <th
                        v-for="role in roles"
                        :key="role"
                        :class="{'bg-primary': sort.by === role}"
                        class="px-1 cursor-pointer"
                        @click="setSort(role)">
                        <i v-if="sort.by === role && sort.asc" class="mr-1 fas fa-sort-amount-down fa-fw"></i>
                        <i v-if="sort.by === role && !sort.asc" class="mr-1 fas fa-sort-amount-up fa-fw"></i>
                        {{ role }}
                    </th>
                    <th :class="{'bg-primary': sort.by === 'Total'}" class="cursor-pointer" @click="setSort('Total')">
                        <i v-if="sort.by === 'Total' && sort.asc" class="mr-1 fas fa-sort-amount-down fa-fw"></i>
                        <i v-if="sort.by === 'Total' && !sort.asc" class="mr-1 fas fa-sort-amount-up fa-fw"></i>
                        <span v-b-tooltip="'Number of matches listed as staff'">Total</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="staff in appearances" :key="staff.id">
                    <td>
                        <LinkedPlayers :players="[staff.user]" />
                    </td>
                    <td
                        v-for="role in roles"
                        :key="role"
                        :class="{'ct-active': staff.listed_roles.indexOf(role) !== -1, 'highlighted': paint && highlighted[`${staff.id}-${role}`]}"
                        @mousedown="(e) => {paintMode = !!highlighted[`${staff.id}-${role}`]; highlight(e, { staff, role })}"
                        @mouseover="(e) => highlight(e, { staff, role })">
                        {{ staff.roles[role] || "-" }}
                    </td>
                    <td>{{ staff.matches.size }}</td>
                </tr>
            </tbody>
        </table>

        <CopyTextButton :no-icon="true" class="btn btn-dark" style="white-space: pre" :content="credits">Copy full event credits</CopyTextButton>

        <div class="w-100 mb-2 mt-2 d-flex flex-column gap-1 align-items-start">
            <b-form-checkbox v-model="paint" switch>Select relationships</b-form-checkbox>
            <b-form-checkbox v-if="paint" v-model="ignoreSet" switch>Ignore already set relationships</b-form-checkbox>
            <b-button-group v-if="paint">
                <b-button variant="primary" @click="highlightAll">Select all</b-button>
                <b-button variant="secondary" @click="highlightSome">Select above</b-button>
                <b-button variant="danger" @click="highlighted = {}">Empty all</b-button>
            </b-button-group>
            <b-form-checkbox v-if="paint" v-model="copyable" switch>Copyable relationships</b-form-checkbox>
        </div>
        <div v-if="paint" class="d-flex gap-2">
            <div class="w-100">
                <h3 class="text-center">Casters</h3>
                <b-form-textarea rows="20" class="bg-dark text-white border-secondary mt-2" :model-value="highlightedCasters" />
            </div>
            <div class="w-100">
                <h3 class="text-center">Player Relationships</h3>
                <b-form-textarea rows="20" class="bg-dark text-white border-secondary mt-2" :model-value="highlightedPlayerRelationships" />
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import LinkedPlayers from "@/components/website/LinkedPlayers";
import CopyTextButton from "@/components/website/CopyTextButton.vue";
import { PRODUCTION_HIERARCHY } from "@/utils/sorts";

export default {
    name: "EventStaffing",
    components: { CopyTextButton, LinkedPlayers },
    props: ["event"],
    data: () => ({
        sort: {
            by: "Total",
            asc: true
        },
        highlighted: {},
        paint: false,
        paintMode: null,
        ignoreSet: false,
        copyable: true
    }),
    computed: {
        matches() {
            if (!this.event?.matches?.length) return [];
            return ReactiveArray("matches", {
                casters: ReactiveArray("casters"),
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player", {
                        // this is silly to add for performance
                        player_relationships: ReactiveArray("player_relationships")
                    })
                })
            })(this.event);
        },
        roles() {
            const roles = [];
            this.appearances.forEach(staff => {
                Object.keys(staff.roles).forEach(roleText => {
                    if (!roles.includes(roleText)) roles.push(roleText);
                });
            });
            return roles.sort((a, b) => {
                const [ha, hb] = [a, b].map(x => PRODUCTION_HIERARCHY.indexOf(x));
                if (ha === hb) {
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                }
                if (ha === -1) return 1;
                if (hb === -1) return -1;
                return ha - hb;
            });
        },
        staff() {
            const staff = [];
            function addToStaff(playerObj, id, name, role, matchID) {
                let player = staff.find(s => s.id === id);
                if (!player) {
                    staff.push({ id, name, roles: {}, matches: new Set(), user: { id, name }, player: playerObj });
                    player = staff[staff.length - 1];
                }
                if (!player.roles[role]) {
                    player.roles[role] = 0;
                }
                player.roles[role]++;
                player.matches.add(matchID);
            }

            this.matches.forEach(match => {
                (match.casters || []).forEach(caster => {
                    if (caster?.id) addToStaff(caster, caster.id, caster.name, "Caster", match.id);
                });
                (match.player_relationships || []).forEach(pr => {
                    if (pr?.player?.id) addToStaff(pr.player, pr.player.id, pr.player.name, pr.singular_name, match.id);
                });
            });
            return staff;
        },
        appearances() {
            return [...this.staff].sort((a, b) => {
                if (this.sort.by === "Total") {
                    return (b.matches.size - a.matches.size) * (this.sort.asc ? 1 : -1);
                } else {
                    return ((b.roles[this.sort.by] || 0) - (a.roles[this.sort.by] || 0)) * (this.sort.asc ? 1 : -1);
                }
            }).map(s => {
                s.listed_roles = Object.keys(s.roles).filter(role => this.isListedOnEvent(s.id, role));
                return s;
            });
        },
        eventRelationships() {
            return ReactiveThing("event", {
                player_relationships: ReactiveArray("player_relationships")
            })({ event: this.event.id });
        },
        credits() {
            const groups = [];

            this.staff.forEach(player => {
                if (!player.roles) return;
                Object.entries(player.roles).forEach(([roleName, matchCount]) => {
                    let group = groups.find(g => g.meta?.singular_name === roleName);
                    if (!group) {
                        groups.push({
                            meta: {
                                singular_name: roleName
                            },
                            items: []
                        });
                        group = groups[groups.length - 1];
                        if (!group.meta?.plural_name && roleName === "Caster") {
                            group.meta.plural_name = "Casters";
                        } else if (!group.meta?.plural_name) {
                            group.meta.plural_name = player?.player?.player_relationships?.find(r => r.singular_name === roleName)?.plural_name;
                        }
                    }
                    group.items.push(player?.player || player?.user);
                });
            });


            return groups.filter(g => g.items?.length).map(group => [
                (group.items?.length === 1 ? group.meta.singular_name + ": " : group.meta.plural_name + ":"),
                group.items?.map(p => p.name + (p.twitter_link ? " " + p.twitter_link : "")).join("\n")
            ].join("\n")).join("\n\n");
        },
        highlightedCasters() {
            return Object.values(this.highlighted).filter(Boolean).filter(({ staff, role }) => role === "Caster" && (this.ignoreSet ? staff.listed_roles.indexOf(role) === -1 : true)).map(({ staff }) => staff.name).join(this.copyable ? ", " : "\n");
        },
        highlightedPlayerRelationships() {
            return Object.values(this.highlighted).filter(Boolean)
                .filter(({ staff, role }) => role !== "Caster" && (this.ignoreSet ? staff.listed_roles.indexOf(role) === -1 : true))
                .sort((a, b) => {
                    const [ha, hb] = [a, b].map(({role}) => PRODUCTION_HIERARCHY.indexOf(role));
                    if (ha === hb) {
                        if (a.staff?.name < b.staff?.name) return -1;
                        if (a.staff?.name > b.staff?.name) return 1;
                        return 0;
                    }
                    if (ha === -1) return 1;
                    if (hb === -1) return -1;
                    return ha - hb;
                })
                .map(({ staff, role }) => `${role}: ${staff.name}`).join(this.copyable ? ", " : "\n");
        }
    },
    methods: {
        isListedOnEvent(playerID, role) {
            // using rec + ids here
            if (role === "Caster") {
                return this.eventRelationships?.casters?.length && this.eventRelationships.casters.includes("rec" + playerID);
            }
            if (!this.eventRelationships?.player_relationships?.length) return false;
            const rel = this.eventRelationships.player_relationships.find(r => r.player?.[0] && r.player[0] === "rec" + playerID && r.singular_name === role);
            return !!rel;
        },
        setSort(key) {
            if (this.sort.by === key) {
                this.sort.asc = !this.sort.asc;
            } else {
                this.sort.by = key;
                this.sort.asc = true;
            }
        },
        highlight(event, { staff, role }) {
            if (!this.paint) return;
            if (event.buttons !== 1) return;
            if (!staff.roles[role]) return;

            const key = [staff.id, role].join("-");
            if (this.paintMode === true) {
                this.highlighted[key] = null;
            } else {
                this.highlighted[key] = { staff, role };
            }
            console.log(staff, role, this.highlighted);
        },
        highlightAll(min) {
            this.appearances.map(staff => {
                this.roles.forEach(role => {
                    if (staff.roles[role] >= (min || 1)) {
                        const key = [staff.id, role].join("-");
                        this.highlighted[key] = { staff, role };
                    }
                });
            });
        },
        highlightSome() {
            const min = prompt("Select all relationships with this many games or above");
            if (!min) return;
            this.highlightAll(min);
        }
    }
};
</script>

<style scoped>
    td.ct-active {
        color: var(--theme-active, #66d9ff) !important;
    }
    .cursor-pointer {
        cursor: pointer;
        user-select: none;
    }
    .highlighted,
    tr:hover .highlighted {
        --bs-table-bg-state: var(--primary) !important;
    }
    .highlighted.ct-active,
    tr:hover .highlighted.ct-active {
        --bs-table-bg-state: var(--light) !important;
        color: var(--dark) !important;
    }
</style>
