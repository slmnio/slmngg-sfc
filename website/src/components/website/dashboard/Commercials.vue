<template>
    <div class="mt-2">
        <b-button-group>
            <b-button class="label-button"><i class="fas fa-fw fa-dollar-sign"></i> Start Commercial</b-button>
            <b-button :disabled="processing" @click="commercial(30)">30s</b-button>
            <b-button :disabled="processing" @click="commercial(60)">1m</b-button>
            <b-button :disabled="processing" @click="commercial(90)">1m30s</b-button>
            <b-button :disabled="processing" @click="commercial(120)">2m</b-button>
            <b-button :disabled="processing" @click="commercial(150)">2m30s</b-button>
            <b-button :disabled="processing" @click="commercial(180)">3m</b-button>
        </b-button-group>
    </div>
</template>

<script>
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "Commercials",
    props: ["client"],
    data: () => ({
        processing: false
    }),
    methods: {
        async commercial(commercialDuration) {
            this.processing = true;
            try {
                await authenticatedRequest("actions/start-commercial", {
                    commercialDuration
                });
            } finally {
                this.processing = false;
            }
        }
    }
};
</script>

<style scoped>
.label-button {
    pointer-events: none;
}
</style>
