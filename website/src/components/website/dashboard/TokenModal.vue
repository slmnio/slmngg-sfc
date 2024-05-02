<template>
    <b-modal hide-footer id="token-modal" title="SLMN.gg Token" ref="modal" @show="reset()">
        <p>Your <b>SLMN.GG token</b> is used to identify you and perform requests on the site.</p>
        <p>You can use the token in our Companion module to make full use of the buttons.</p>

        <p><b>Please note:</b> Your token gives anyone who has it <b class="text-danger">full access to your account</b> on SLMN.GG, including any permissions you have to edit matches or broadcasts.</p>
        <p>You shouldn't share it with a third party. Only use it in programs you are running yourself.</p>

        <b-form-checkbox v-model="hasAccepted">
            I will keep my token safe
        </b-form-checkbox>

        <div class="buttons d-flex mt-3 gap-2">
            <b-button v-if="token" @click="copyToken" :disabled="!hasAccepted" variant="primary">
                <i :class="`fas fa-fw ${recentlyCopied ? 'fa-clipboard-check' : 'fa-copy'}`"></i> Copy token
            </b-button>
            <p v-else>
                <i class="fas fa-exclamation-triangle mr-2"></i> You are not logged in.
            </p>
            <b-button href="http://localhost:8000/connections" variant="dark" class="text-white" target="_blank" v-b-modal.token-modal>
                <i class="fas fa-computer-speaker mr-2"></i>
                Companion
                <i class="ml-2 fas fa-external-link"></i>
            </b-button>
        </div>


    </b-modal>
</template>

<script>
import { mapState } from "pinia";
import { useAuthStore } from "@/stores/authStore";

export default {
    name: "TokenModal",
    props: {
        broadcast: Object
    },
    data: () => ({
        hasAccepted: false,
        recentlyCopied: false
    }),
    computed: {
        ...mapState(useAuthStore, ["token"])
    },
    methods: {
        reset() {
            this.hasAccepted = false;
            this.recentlyCopied = false;
        },
        copyToken() {
            navigator.clipboard.writeText(this.token);
            this.recentlyCopied = true;
            setTimeout(() => {
                this.recentlyCopied = false;
            }, 500);
        }
    }
};

</script>
<style scoped>
    .buttons {
        justify-content: space-between;
    }
</style>
