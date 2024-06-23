<template>
    <div class="container">
        <LearnTitleChip title="Tools" subtitle="Twitch Authentication" />

        <b-form-group v-slot="{ ariaDescribedby }" label="Enabled features">
            <b-form-checkbox-group
                id="checkbox-group-1"
                v-model="selected"
                :options="options"
                :aria-describedby="ariaDescribedby"
                stacked
            />
        </b-form-group>

        <b-button variant="primary" class="text-white mt-2" :href="twitchAuthURL" :class="{'disabled': selected.length === 0}">Authorize</b-button>
    </div>
</template>

<script>
import LearnTitleChip from "@/components/website/guide/LearnTitleChip.vue";
import { getDataServerAddress } from "@/utils/fetch";

export default {
    name: "TwitchAuthScopeSelector",
    components: { LearnTitleChip },
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
            return `${getDataServerAddress()}/twitch_auth/${this.selected.join(" ")}`;
        }
    },
    mounted() {
        this.selected = this.options.map(opt => opt.value);
    }
};
</script>
