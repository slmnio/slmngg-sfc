<template>
    <div v-if="stepData?.collect === 'choice'" class="flip-pick-ban-order w-100">
        <h3 v-if="iChoose" class="text-center">Choose Pick & Ban Order</h3>
        <h3 v-else-if="!iChoose" class="text-center">Other team is choosing</h3>
        <pre class="text-muted text-center">First pick decision: {{ stepData.actor.reason }}</pre>
        <div class="selectables d-flex gap-2" :class="{'low-opacity disabled': !iChoose}">
            <div v-for="teamNum in 2" :key="teamNum" class="selectable-container" :class="`team-${teamNum}`">
                <div class="selectable px-2" :class="{'selected': selectedTeam === teamNum}" @click="selectedTeam = teamNum">
                    <div class="select-title">Team {{ teamNum }}</div>
                    <div class="select-pick-ban py-2">
                        <div v-for="row in order" :key="row.num" class="flex-center">
                            <div v-if="row.team === teamNum" class="pick-ban-text w-100 px-2" :class="`${row.type}-style`">
                                {{ row.type }} {{ row.countOfType }}
                            </div>
                            <div v-else class="text-muted w-100 px-2">
                                -
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="iChoose" class="flex-center text-center mt-3">
            <b-button
                v-if="processing['choice']"
                size="lg"
                variant="primary"
                disabled>
                Sending <LoadingIcon />
            </b-button>
            <b-button
                v-else-if="selectedTeam"
                size="lg"
                variant="primary"
                @click="roomEmit?.('flip-pick-ban-order-choice', {
                    teamID: stepData.actor.teamID,
                    flip: controllingTeamNum === 0 ? (selectedTeam === 2) : (selectedTeam === 1)
                })">
                <span v-if="processing['flip-pick-ban-order-choice']"><LoadingIcon /></span>
                <span v-else>Confirm team {{ selectedTeam }}</span>
            </b-button>
            <b-button v-else size="lg" variant="secondary" disabled>Select a team</b-button>
        </div>
    </div>
</template>

<script>
import { cleanID } from "shared";
import { processPickBanOrder } from "@/utils/content-utils";
import { socket } from "@/socket.js";
import LoadingIcon from "@/components/website/LoadingIcon.vue";

export default {
    name: "FlipPickBanOrder",
    components: { LoadingIcon },
    props: ["match", "controllableTeams", "step", "stepData"],
    data: () => ({
        selectedTeam: null,
        processing: {},
        error: {}
    }),
    computed: {
        controllingTeamNum() {
            return (this.match.teams || []).findIndex(t => cleanID(t?.id || t) === cleanID(this.controllableTeams?.[0]?.id));
        },
        iChoose() {
            if (!this.stepData?.actor?.teamID) return;
            return (this.controllableTeams || [])?.length && this.controllableTeams.some(tID => cleanID(tID) === cleanID(this.stepData?.actor?.teamID));
        },
        order() {
            return processPickBanOrder(this.stepData?.rawPickBanOrder || this.match.pick_ban_order);
        }
    },
    methods: {
        async roomEmit(command, data) {
            console.log("sending room_command", cleanID(this.match.id), command, data);
            this.processing[command] = true;
            this.error[command] = null;
            // socket.emit("match_room:room_command", cleanID(this.id), event, data);
            try {
                socket.emit("match_room:room_command", cleanID(this.match.id), command, data, (err, response) => {
                    console.log("response", { err, response });

                    if (err || response.error) {
                        this.processing[command] = null;
                        this.error[command] = true;
                        this.$notyf.error(`${response?.errorMessage || response?.message || err?.message || err?.errorMessage || "This is taking longer than expected"}`);
                    } else {
                        this.processing[command] = null;
                        this.error[command] = false;
                    }
                });
            } catch (err) {
                // the server did not acknowledge the event in the given delay
                console.error("failed - timeout", err);
                this.processing[command] = false;
                this.error[command] = true;
            }
        }
    }
};
</script>

<style scoped>
    .selectable-container {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    .selectable-container.team-1 {
        align-items: flex-end;
        text-align: right;
    }
    .selectable-container.team-2 {
        align-items: flex-start;
        text-align: left;
    }
    .selectable {
        cursor: pointer;
        user-select: none;
        background-color: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: .25em;
        min-width: 8em;
    }
    .disabled {
        pointer-events: none;
    }
    .selectable:hover {
        background-color: rgba(255,255,255,0.1);
    }
    .selectable.selected {
        background-color: rgba(255,255,255,0.15);
        border: 1px solid rgba(255,255,255,0.2);
    }
    .selectable.selected:hover {
        background-color: rgba(255,255,255,0.175);
    }
    .select-title {
        font-weight: bold;
        text-transform: uppercase;
        font-size: 1.25em;
        text-align: center;
    }
    .ban-style {
        background-color: color-mix(in srgb,  var(--danger) 20%, transparent)
    }
    .pick-style {
        background-color: color-mix(in srgb,  var(--primary) 20%, transparent)
    }
    .protect-style {
        background-color: color-mix(in srgb,  var(--info) 20%, transparent)
    }
</style>
