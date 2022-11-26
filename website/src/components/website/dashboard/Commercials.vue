<template>
    <div class="mt-2">
        <b-button-group>
            <b-button class="label-button"><i class="fas fa-fw fa-dollar-sign"></i> Start Commercial</b-button>
            <b-button @click="commercial(30)">30s</b-button>
            <b-button @click="commercial(60)">1m</b-button>
            <b-button @click="commercial(90)">1m30</b-button>
            <b-button @click="commercial(120)">2m</b-button>
            <b-button @click="commercial(150)">2m30</b-button>
            <b-button @click="commercial(180)">3m</b-button>
        </b-button-group>

    </div>
</template>

<script>
import { startCommercial } from "@/utils/dashboard";
import { BButton, BButtonGroup } from "bootstrap-vue";

export default {
    name: "Commercials",
    props: ["client"],
    components: { BButton, BButtonGroup },
    methods: {
        async commercial(commercialDuration) {
            await startCommercial(this.$root.auth, "self", commercialDuration);
        }
    }
};
</script>

<style scoped>
.label-button {
    pointer-events: none;
}
</style>
