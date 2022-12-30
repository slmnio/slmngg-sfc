<template>
    <b-button v-if="showResolveButton && bracket && isResolving" disabled class="resolve-button" :class="{'vertical': verticalButton}"
              variant="success"><i class="fas fa-magic fa-fw fa-spin"></i> Resolving Bracket...
    </b-button>
    <b-button v-else-if="showResolveButton && bracket && !isResolving" @click="clickResolveButton(bracket)"
              class="resolve-button" :class="{'vertical': verticalButton}" variant="success"><i class="fas fa-magic fa-fw"></i> Resolve Bracket
    </b-button>
</template>

<script>
import { isAuthenticated } from "@/utils/auth";
import { resolveEntireBracket } from "@/utils/dashboard";
import { BButton } from "bootstrap-vue";

export default {
    name: "BracketResolveButton",
    props: {
        bracket: Object,
        verticalButton: Boolean
    },
    components: { BButton },
    data: () => ({
        isResolving: false
    }),
    computed: {
        showResolveButton() {
            if (!isAuthenticated(this.$root)) return false;
            return this.$root.auth?.user?.website_settings?.includes("Can edit any match");
        }
    },
    methods: {
        async clickResolveButton(bracket) {
            if (!this.$root.auth?.user?.website_settings?.includes("Can edit any match")) {
                return this.$notyf.error("You don't have permission to resolve brackets");
            }
            this.isResolving = true;
            console.log(bracket);
            try {
                const { data } = await resolveEntireBracket(this.$root.auth, bracket.id);
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
