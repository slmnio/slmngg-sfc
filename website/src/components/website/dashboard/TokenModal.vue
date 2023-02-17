<template>
    <div>
        <div class="mt-2" v-b-modal.token>
            <b-button>
                <i class="fas fa-fw fa-lock"></i> Token
            </b-button>
        </div>
        <b-modal hide-footer ref="modal" id="token" title="SLMN.gg Token">
            <p>Your <b>SLMN.GG token</b> is used to identify you and perform requests on the site.</p>
            <p>You can use the token in our Companion module to make full use of the buttons.</p>

            <p><b>Please note:</b> Your token gives anyone who has it <b class="text-danger">full access to your account</b> on SLMN.GG, including any permissions you have to edit matches or broadcasts.</p>
            <p>You shouldn't share it with a third party. Only use it in programs you are running yourself.</p>

            <b-form-checkbox v-model="hasAccepted">
                I will keep my token safe
            </b-form-checkbox>

            <b-button v-if="token" class="mt-3" @click="copyToken" :disabled="!hasAccepted">
                <i :class="`fas fa-fw ${recentlyCopied ? 'fa-clipboard-check' : 'fa-copy'}`"></i> Copy token
            </b-button>
            <p class="mt-3" v-else>
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

