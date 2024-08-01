<template>
    <div class="event-match-editor d-flex flex-column gap-4">
        <MatchEditor :match="match" />
        <BracketImplications class="dark-border" :match="match" show-resolve-button />
        <div class="d-flex flex-column gap-2 align-items-end">
            <b-form-select
                v-model="selectedBroadcastID"
                :options="broadcastOptions"
                size="sm"
                class="w-auto" />
            <BroadcastRoles v-if="selectedBroadcast" class="w-100" :live-match="match" :broadcast="selectedBroadcast" />
        </div>
    </div>
</template>

<script>
import MatchEditor from "@/components/website/dashboard/MatchEditor.vue";
import BracketImplications from "@/components/website/dashboard/BracketImplications.vue";
import BroadcastRoles from "@/components/website/dashboard/BroadcastRoles.vue";

export default {
    name: "EventMatchEditor",
    components: { BroadcastRoles, BracketImplications, MatchEditor },
    props: ["match"],
    data: () => ({
        selectedBroadcastID: null
    }),
    computed: {
        broadcastOptions() {
            return (this.match?.event?.broadcasts || []).map(b => ({
                text: b.relative_name || b.name,
                value: b.id
            }));
        },
        selectedBroadcast() {
            if (!this.selectedBroadcastID) return null;
            return (this.match?.event?.broadcasts || []).find(b => b.id === this.selectedBroadcastID);
        }
    },
    watch: {
        broadcastOptions: {
            immediate: true,
            deep: true,
            handler(broadcastOptions) {
                if (broadcastOptions?.length && !this.selectedBroadcastID) {
                    this.selectedBroadcastID = broadcastOptions?.[0]?.value;
                }
            }
        }
    }
};
</script>

<style scoped>
    .dark-border {
        border: 1px solid #454d55;
    }
</style>
