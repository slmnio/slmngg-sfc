<template>
    <div class="container">
        <h1>Give our systems access to a twitch account</h1>
        <b-form-group label="Enabled features" v-slot="{ ariaDescribedby }">
            <b-form-checkbox-group
                id="checkbox-group-1"
                v-model="selected"
                :options="options"
                :aria-describedby="ariaDescribedby"
                stacked
            ></b-form-checkbox-group>
        </b-form-group>

        <a :href="twitchAuthURL" class="btn btn-dark" :class="{'disabled': selected.length === 0}">Authorize</a>

    </div>
</template>

<script>
import { BFormCheckboxGroup, BFormGroup } from "bootstrap-vue";
export default {
    name: "TwitchAuthScopeSelector",
    components: {
        BFormGroup,
        BFormCheckboxGroup
    },
    data: () => ({
        selected: [], // Must be an array reference!
        options: [
            {
                text: "Predictions (channel:manage:predictions channel:read:predictions)",
                value: "channel:manage:predictions channel:read:predictions"
            },
            {
                text: "Title/Game (channel:manage:broadcast)",
                value: "channel:manage:broadcast"
            },
            {
                text: "Ads (channel:edit:commercial)",
                value: "channel:edit:commercial"
            },
            {
                text: "Stream Key (channel:read:stream_key)",
                value: "channel:read:stream_key"
            }
        ]
    }),
    computed: {
        twitchAuthURL() {
            return `${import.meta.env.VITE_DATA_SERVER}/twitch_auth/${this.selected.join(" ")}`;
        }
    }
};
</script>
