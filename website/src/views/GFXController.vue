<template>
    <div class="gfx-controller">
        <table class="table table-bordered table-sm table-dark mb-0 border-no-top">
            <thead>
                <tr>
                    <th>GFX #</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Matrix</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(gfx, i) in broadcast?.gfx" :key="gfx.id">
                    <td>{{ i + 1 }}</td>
                    <td>{{ gfx.name }}</td>
                    <td>{{ gfx.type }}</td>
                    <td>{{ gfx.title }}</td>
                    <td class="button-matrix">
                        <b-button-group>
                            <b-button
                                v-for="num in buttonNumbers"
                                :key="num"
                                size="sm"
                                :disabled="processing"
                                :pressed="i === num"
                                :variant="i === num ? 'primary' : 'secondary'"
                                @click="setGfxIndex(gfx.id, num)">
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
            </tbody>
        </table>
    </div>
</template>
<script>
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "GFXController",
    props: {
        broadcast: {},
        client: {}
    },
    data: () => ({
        buttonCount: 6,
        processing: false
    }),
    computed: {
        buttonNumbers() {
            return Array.from(Array(this.buttonCount).keys());
        }
    },
    methods: {
        async setGfxIndex(id, num) {
            this.processing = true;
            try {
                await authenticatedRequest("actions/update-gfx-index", {
                    gfxID: id,
                    index: num
                });
            } finally {
                this.processing = false;
            }
        }
    }
};
</script>
