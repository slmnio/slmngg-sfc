<template>
    <div>
        <div class="mt-2" v-b-modal.token>
            <b-button>
                <i class="fas fa-fw fa-lock"></i> Token
            </b-button>
        </div>
        <b-modal hide-footer ref="modal" id="token" title="SLMN.gg Token">
            <p>
                This token can be used for our Companion module or while using the API in another way.<br>
            </p>

            <p>
                The token gives <strong>full access to SLMN.gg</strong> so you <strong>must keep it safe</strong>.
            </p>

            <b-form-checkbox v-model="hasAccepted">
                I will keep my token safe
            </b-form-checkbox>

            <b-button v-if="token" class="mt-2" @click="copyToken" :disabled="!hasAccepted">
                <i :class="`fas fa-fw ${recentlyCopied ? 'fa-clipboard-check' : 'fa-copy'}`"></i> Copy token
            </b-button>

            <p class="mt-2" v-else>
                <i class="fas fa-exclamation-triangle mr-2"></i> You are not logged in.
            </p>


        </b-modal>
    </div>
</template>


<script>
import { BButton, BModal, VBModal, BFormCheckbox } from "bootstrap-vue";

export default {
    name: "TokenModal",
    components: { BModal, BButton, BFormCheckbox },
    directives: { BModal: VBModal },
    props: {
        broadcast: Object
    },
    data: () => ({
        hasAccepted: false,
        recentlyCopied: false
    }),
    computed: {
        token() {
            return this.$root.auth.token;
        }
    },
    methods: {
        copyToken() {
            navigator.clipboard.writeText(this.token);
            this.recentlyCopied = true;
            setTimeout(() => {
                this.recentlyCopied = false;
            }, 1500);
        }
    }
};

</script>

