<template>
    <div class="gfx-controller">
        <table class="table table-bordered table-sm table-dark mb-0">
            <tr>
                <th>GFX #</th>
                <th>Name</th>
                <th>Type</th>
                <th>Title</th>
                <th>Matrix</th>
                <th></th>
            </tr>
            <tr v-for="(gfx, i) in broadcast?.gfx" :key="gfx.id">
                <td>{{ i+1 }}</td>
                <td>{{ gfx.name }}</td>
                <td>{{ gfx.type }}</td>
                <td>{{ gfx.title }}</td>
                <td class="button-matrix">
                    <b-button-group>
                        <b-button size="sm" v-for="num in buttonNumbers" :key="num"
                                  :disabled="processing"
                                  @click="setGfxIndex(gfx.id, num)"
                                  :pressed="i === num" :variant="i === num ? 'primary' : 'secondary'">
                            {{ num + 1 }}
                        </b-button>
                    </b-button-group>
                </td>
                <td>
                    <router-link :to="`/client/${client.key}/gfx/${i+1}`" target="_blank">
                        <i class="fas fa-external-link"></i>
                    </router-link>
                </td>
            </tr>
        </table>
    </div>
</template>
<script>
import { BButton, BButtonGroup } from "bootstrap-vue";
import { updateGfxIndex } from "@/utils/dashboard";

export default {
    name: "GFXController",
    components: { BButtonGroup, BButton },
    data: () => ({
        buttonCount: 6,
        processing: false
    }),
    computed: {
        buttonNumbers() {
            return Array.from(Array(this.buttonCount).keys());
        }
    },
    props: {
        broadcast: {},
        client: {}
    },
    methods: {
        async setGfxIndex(id, num) {
            this.processing = true;
            try {
                await updateGfxIndex(this.$root.auth, id, num);
            } finally {
                this.processing = false;
            }
        }
    }
};
</script>
