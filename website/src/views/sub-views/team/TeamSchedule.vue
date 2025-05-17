<template>
    <div class="container">
        <div class="schedule-title">
            <h2 class="text-center">Schedule</h2>

            <div class="d-flex w-100 flex-column align-items-end gap-1 top-right-settings">
                <b-dropdown auto-close="outside">
                    <template #button-content>
                        <i class="fas fa-cog fa-fw mr-1"></i>
                        <span class="d-none d-lg-inline-block" style="line-height:1">Settings & Sync</span>
                    </template>
                    <div class="dropdown-content d-flex flex-column align-items-end gap-3 p-3" style="min-width: min(100vw, 300px)">
                        <TimezoneSwapper align="left" :inline="true" />
                        <AddToCalendar :team="team" />
                    </div>
                </b-dropdown>
            </div>
        </div>


        <div class="w-100">
            <ScheduleMatch
                v-for="match in matches"
                :key="match.id"
                :match="match"
                :event="hydratedEvent"
                :left-team="team"
                :show-editor-button="showEditorButton" />
        </div>
    </div>
</template>

<script>
import ScheduleMatch from "@/components/website/schedule/ScheduleMatch.vue";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";
import { canEditMatch } from "@/utils/client-action-permissions";
import { useAuthStore } from "@/stores/authStore";
import TimezoneSwapper from "@/components/website/schedule/TimezoneSwapper.vue";
import AddToCalendar from "@/components/website/AddToCalendar.vue";

export default {
    name: "TeamMatches",
    components: {
        AddToCalendar,
        TimezoneSwapper,
        ScheduleMatch
    },
    props: ["team"],
    computed: {
        matches() {
            if (!this.team?.matches?.length) return [];
            return ReactiveArray("matches", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                maps: ReactiveArray("maps")
            })(this.team).sort(sortMatches);
        },
        hydratedEvent() {
            if (!this.team?.event) return null;
            return ReactiveRoot(this.team.event.id, {
                player_relationships: ReactiveArray("player_relationships")
            });
        },
        showEditorButton() {
            const { player } = useAuthStore();
            return canEditMatch(player, { event: this.hydratedEvent });
        }
    }
};
</script>

<style scoped>
    .top-right-settings {
        position: absolute;
        top: 0;
        right: 0;
    }
    .schedule-title {
        position: relative;
    }
    .dropdown-content {
        margin: -.5em 0;
    }
</style>
