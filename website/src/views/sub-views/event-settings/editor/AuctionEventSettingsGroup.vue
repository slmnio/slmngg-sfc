<template>
    <EventSettingsGroup
        class="w-100"
        title="Auction"
        always-active>
        <div class="d-flex flex-column gap-2">
            <b-form-group
                label="Public"
                description="Show a link to the auction on the event page."
                label-cols="2"
                content-cols="10">
                <event-settings-checkbox
                    :active="auctionData?.public"
                    @update:active="val => updateData('public', val)" />
            </b-form-group>

            <table class="table table-sm table-dark table-bordered">
                <tbody>
                    <tr><th colspan="3">General</th></tr>
                    <tr>
                        <td>Players per team</td>
                        <td>
                            <b-form-input
                                v-model="auctionData.each_team"
                                size="sm"
                                number
                                @update:model-value="(val) => isNaN(val) ? auctionData.each_team = 0 : {}" />
                        </td>
                        <td class="small">
                            Teams of {{ auctionData.each_team }}
                        </td>
                    </tr>
                    <tr>
                        <td>Starting amount</td>
                        <td>
                            <b-form-input
                                v-model="auctionData.starting"
                                size="sm"
                                number
                                @update:model-value="(val) => isNaN(val) ? auctionData.starting = 0 : {}" />
                        </td>
                        <td class="small">{{ money(auctionData.starting) }} total (starts with {{ money(auctionData.starting - (Math.max(0, auctionData.each_team - 1) * auctionData.money.unlockAfterSigning)) }})</td>
                    </tr>
                    <tr>
                        <td>Player unlock</td>
                        <td>
                            <b-form-input
                                v-model="auctionData.money.unlockAfterSigning"
                                size="sm"
                                number
                                @update:model-value="(val) => isNaN(val) ? auctionData.money.unlockAfterSigning = 0 : {}" />
                        </td>
                        <td class="small">{{ money(auctionData.money.unlockAfterSigning) }} locked per player, {{ money(Math.max(0, auctionData.each_team - 1) * auctionData.money.unlockAfterSigning) }} locked at start</td>
                    </tr>
                    <tr><th colspan="3">Timing</th></tr>
                    <tr>
                        <td>Pre-auction</td>
                        <td>
                            <b-form-input
                                v-model="auctionData.time.preAuction"
                                size="sm"
                                number
                                @update:model-value="(val) => isNaN(val) ? auctionData.time.preAuction = 0 : {}" />
                        </td>
                        <td class="small">After player selected, before bids are open.</td>
                    </tr>
                    <tr>
                        <td>After intial bid</td>
                        <td>
                            <b-form-input
                                v-model="auctionData.time.afterInitialBid"
                                size="sm"
                                number
                                @update:model-value="(val) => isNaN(val) ? auctionData.time.afterInitialBid = 0 : {}" />
                        </td>
                        <td class="small">Auction timer after first bid.</td>
                    </tr>
                    <tr>
                        <td>After other bids</td>
                        <td>
                            <b-form-input
                                v-model="auctionData.time.afterSubsequentBids"
                                size="sm"
                                number
                                @update:model-value="(val) => isNaN(val) ? auctionData.time.afterSubsequentBids = 0 : {}" />
                        </td>
                        <td class="small">Auction timer after other bids.</td>
                    </tr>
                    <tr>
                        <td>Post auction</td>
                        <td>
                            <b-form-input
                                v-model="auctionData.time.postAuction"
                                size="sm"
                                number
                                @update:model-value="(val) => isNaN(val) ? auctionData.time.postAuction = 0 : {}" />
                        </td>
                        <td class="small">After player has been signed, before next player can be selected.</td>
                    </tr>
                    <tr><th colspan="3">Bidding</th></tr>
                    <tr>
                        <td>Starting bids</td>
                        <td>
                            <b-form-input
                                v-model="auctionData.money.defaultStartingBid"
                                size="sm"
                                number
                                @update:model-value="(val) => isNaN(val) ? auctionData.money.defaultStartingBid = 0 : {}" />
                        </td>
                        <td class="small">Minimum starting bid.</td>
                    </tr>
                    <tr>
                        <td>Minimum bid</td>
                        <td>
                            <b-form-input
                                v-model="auctionData.money.minimumBidIncrement"
                                size="sm"
                                number
                                @update:model-value="(val) => isNaN(val) ? auctionData.money.minimumBidIncrement = 0 : {}" />
                        </td>
                        <td class="small">Minimum bid increment (at least +{{ money(auctionData.money.minimumBidIncrement) }} above current bid).</td>
                    </tr>
                    <tr>
                        <td>Maximum bid</td>
                        <td>
                            <b-form-input
                                v-model="auctionData.money.maximumBidIncrement"
                                size="sm"
                                number
                                @update:model-value="(val) => isNaN(val) ? auctionData.money.maximumBidIncrement = 0 : {}" />
                        </td>
                        <td class="small">Maximum bid increment (at most +{{ money(auctionData.money.maximumBidIncrement) }} above current bid).</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EventSettingsGroup>
</template>

<script>
import EventSettingsCheckbox from "@/views/sub-views/event-settings/editor/EventSettingsCheckbox.vue";
import EventSettingsGroup from "@/views/sub-views/event-settings/editor/EventSettingsGroup.vue";
import { money } from "@/utils/content-utils";

export default {
    name: "AuctionEventSettingsGroup",
    components: {EventSettingsGroup, EventSettingsCheckbox},
    props: {
        modelValue: Object,
        event: Object,
        allSettings: Object
    },
    emits: ["update:modelValue"],
    data: () => ({
        auctionData: {},
    }),
    methods: {
        money,
        updateData(field, value) {
            if (this.auctionData) {
                this.auctionData[field] = value;
            } else {
                this.auctionData = {
                    [field]: value
                };
            }
        }
    },
    watch: {
        modelValue: {
            immediate: true,
            deep: true,
            handler(data) {
                if (JSON.stringify(data) === JSON.stringify(this.auctionData)) return;
                this.auctionData = data || {
                    money: {},
                    time: {}
                };

            }
        },
        auctionData: {
            immediate: true,
            deep: true,
            handler(data) {
                this.$emit("update:modelValue", {
                    ...data,
                });
            }
        }
    }
};
</script>

<style scoped>

</style>
