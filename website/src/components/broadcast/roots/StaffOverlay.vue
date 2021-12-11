<template>
    <GenericOverlay class="staff-overlay" :title="title || 'Staff'">
        <div class="staff-holder">
            <div class="staff-name m-2" v-for="person in staff" v-bind:key="person">
                {{ person }}
            </div>
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";

export default {
    name: "StaffOverlay",
    components: { GenericOverlay },
    props: ["broadcast", "title"],
    computed: {
        event() {
            return this.broadcast?.event;
        },
        staff() {
            const data = ReactiveThing("data", {
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                }),
                staff: ReactiveArray("staff"),
                matches: ReactiveArray("matches", {
                    player_relationships: ReactiveArray("player_relationships", {
                        player: ReactiveThing("player")
                    }),
                    casters: ReactiveArray("casters")
                })
            })({ data: this.event });

            let staff = [];

            data.player_relationships?.forEach(rel => {
                staff.push(rel?.player?.name);
            });
            data.staff?.forEach(player => {
                staff.push(player?.name);
            });
            data.matches?.forEach(match => {
                match.player_relationships?.forEach(rel => {
                    staff.push(rel?.player?.name);
                });
                match.casters?.forEach(player => {
                    staff.push(player.name);
                });
            });

            staff = [...new Set(staff.filter(s => s))].sort((a, b) => {
                const [xa, xb] = [a, b].map(x => x.toLowerCase());
                if (xa > xb) return 1;
                if (xa < xb) return -1;
                return 0;
            });

            console.log(data, staff);

            return staff;
        }
    }
};
</script>

<style scoped>
    .staff-holder {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        font-size: 36px;
    }
</style>
