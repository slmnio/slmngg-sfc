<template>
    <b-button v-if="showResolveButton && bracket && isResolving" disabled class="resolve-button" :class="{'vertical': verticalButton}"
              variant="success"><i class="fas fa-magic fa-fw fa-spin"></i> Resolving Bracket...
    </b-button>
    <b-button v-else-if="showResolveButton && bracket && !isResolving" @click="clickResolveButton(bracket)"
              class="resolve-button" :class="{'vertical': verticalButton}" variant="success"><i class="fas fa-magic fa-fw"></i> Resolve Bracket
    </b-button>
</template>

<script>
import { resolveEntireBracket } from "@/utils/dashboard";
import { canEditMatch } from "@/utils/client-action-permissions";
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";
import { useAuthStore } from "@/stores/authStore";

export default {
    name: "BracketResolveButton",
    props: {
        bracket: Object,
        verticalButton: Boolean,
        showButton: Boolean
    },
    data: () => ({
        isResolving: false
    }),
    computed: {
        hydratedEvent() {
            if (!this.bracket?.events?.[0]) return null;
            return ReactiveRoot(this.bracket.events?.[0], {
                player_relationships: ReactiveArray("player_relationships")
            });
        },
        showResolveButton() {
            const { user } = useAuthStore();
            return canEditMatch(user, { event: this.hydratedEvent });
        }
    },
    methods: {
        async clickResolveButton(bracket) {
            const { user } = useAuthStore();
            if (!canEditMatch(user, { event: this.hydratedEvent })) {
                return this.$notyf.error("You don't have permission to resolve brackets");
            }
            this.isResolving = true;
            console.log(bracket);
            try {
                const { data } = await resolveEntireBracket(bracket.id);
                console.log(data);
                this.$notyf[data.hasError ? "error" : "success"](data.message);
            } finally {
                this.isResolving = false;
            }
        }
    }
};
</script>

<style scoped>
    .vertical {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        flex-direction: column;
    }

    .vertical i {
        font-size: 1.75em;
        margin: 0.25em 0;
    }
</style>
