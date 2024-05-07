<template>
    <div class="broadcast-editor d-flex flex-wrap align-items-center justify-content-center">
        <div class="area left-area">
            <div class="group">
                <div class="group-top">Flip Teams</div>
                <div class="group-bottom">
                    <b-button
                        class="quick-button"
                        :checked="match.flip_teams"
                        button
                        :variant="match.flip_teams ? 'primary' : 'secondary'"
                        :disabled="processing.flipTeams"
                        @click="toggleFlipTeams">
                        <i class="fas fa-exchange"></i>
                    </b-button>
                </div>
            </div>
            <div class="group map-attack">
                <div class="group-top">Attacker Side</div>
                <div class="group-bottom">
                    <b-button-group>
                        <BDropdown
                            right
                            split
                            class="quick-button"
                            variant="secondary"
                            :disabled="updateData?.mapAttack !== undefined"
                            :split-variant="{other: 'secondary', 'Left': 'primary', 'Right': 'danger', 'Both': 'warning'}[broadcast.map_attack || 'other']"
                            @click="autoAttack">
                            <template #button-content>
                                <div class="icon-stack">
                                    <i class="fa-fw" :class="sword(broadcast?.map_attack)"></i>
                                    <div v-if="broadcast.map_attack" class="icon-text industry-align">
                                        {{ broadcast.map_attack }}
                                    </div>
                                </div>
                            </template>
                            <b-dropdown-item-button
                                v-for="side in ['Left', 'Right', 'Both']"
                                :key="side"
                                size="sm"
                                :active="side === broadcast.map_attack"
                                :disabled="updateData?.mapAttack !== undefined"
                                @click="() => setAttack(side)">
                                <i class="fa-fw" :class="sword(side)"></i> {{ side }}
                            </b-dropdown-item-button>
                            <b-dropdown-item-button
                                size="sm"
                                :active="!broadcast.map_attack"
                                :disabled="updateData?.mapAttack !== undefined"
                                @click="() => setAttack(null)">
                                <i class="fa-fw" :class="sword(null)"></i> None
                            </b-dropdown-item-button>
                        </BDropdown>
                    </b-button-group>
                </div>
            </div>
            <div class="group map-attack">
                <div class="group-top">Map Win</div>
                <div class="group-bottom">
                    <b-button-group>
                        <b-button
                            v-for="(team, i) in mapWinButtonsTeams"
                            :key="team?.id"
                            class="quick-button"
                            :disabled="mapWinButtonsDisabled "
                            @click="mapWin((match?.flip_teams ? +!i : i)+1)">
                            <div class="icon-stack">
                                <ThemeLogo
                                    v-if="team?.theme"
                                    logo-size="w-50"
                                    :theme="team?.theme"
                                    border-width="0"
                                    class="team-icon"
                                    icon-padding="0" />
                                <div v-if="team" class="icon-text industry-align" :class="{'icon-text-code': !!team.code }">
                                    {{ team?.code || team?.name }}
                                </div>
                            </div>
                        </b-button>
                    </b-button-group>
                </div>
            </div>
            <!--            <div class="group">-->
            <!--                <div class="group-top">Player Cams</div>-->
            <!--                <div class="group-bottom">-->
            <!--                    <b-form-checkbox :checked="broadcast.show_cams" @change="(state) => togglePlayerCams(state)"-->
            <!--                                     :disabled="updateData?.playerCams !== undefined"-->
            <!--                                     button size="sm" :button-variant="broadcast.show_cams ? 'primary' : 'secondary'">-->
            <!--                        Show Cams-->
            <!--                    </b-form-checkbox>-->
            <!--                </div>-->
            <!--            </div>-->
        </div>
        <div class="spacer flex-grow-1"></div>
        <div class="area right-area">
            <div class="group text-end">
                <div class="group-top">Break match</div>
                <div class="group-bottom">
                    <b-button
                        class="quick-button"
                        :variant="broadcast.show_live_match ? 'primary' : 'secondary'"
                        :pressed="broadcast.show_live_match"
                        :disabled="updateData?.showLiveMatch !== undefined"
                        @click="() => setLiveMatchVisibility(!broadcast.show_live_match)">
                        <i class="fas fa-signal-stream"></i>
                    </b-button>
                </div>
            </div>
            <div class="group text-end">
                <div class="group-top">Twitch Title</div>
                <div class="group-bottom">
                    <div class="fake-btn-group">
                        <b-button class="quick-button" :disabled="processing?.twitchTitle" @click="setTwitchTitle">
                            <div class="icon-stack">
                                <i class="fal fa-wand-magic"></i>
                            </div>
                        </b-button>
                    </div>
                </div>
            </div>
            <div class="group text-end">
                <div class="group-top">Break Settings</div>
                <div class="group-bottom">
                    <div class="fake-btn-group">
                        <BreakDisplayMultiModal :broadcast="broadcast" />
                    </div>
                </div>
            </div>
            <div class="group text-end">
                <div class="group-top">Observers</div>
                <div class="group-bottom">
                    <ObserverSettingsModal :broadcast="broadcast" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { authenticatedRequest } from "@/utils/dashboard";
import ObserverSettingsModal from "@/components/website/dashboard/ObserverSettingsModal.vue";
import BreakDisplayMultiModal from "@/components/website/dashboard/BreakDisplayMultiModal.vue";
import ThemeLogo from "@/components/website/ThemeLogo.vue";

export default {
    name: "BroadcastEditor",
    components: {
        ThemeLogo,
        BreakDisplayMultiModal,
        ObserverSettingsModal
    },
    props: ["client"],
    data: () => ({
        updateData: { },
        broadcastUpdateTimeout: null,
        processing: {

        }
    }),
    computed: {
        broadcast() {
            return this.client.broadcast?.[0] || {};
        },
        match() {
            return this.broadcast?.live_match || {};
        },
        mapWinButtonsDisabled() {
            if (this.match?.first_to && [this.match?.score_1 || 0, this.match?.score_2 || 0].includes(this.match?.first_to)) return true;
            if (this.processing?.flipTeams || this.processing?.multiMapWin) return true;
            if (!this.match?.teams?.length) return true;
            return this.match?.teams?.length < 2 || (this.match?.teams || []).some(t => t.loading || !t.name);
        },
        mapWinButtonsTeams() {
            const teams = this.match?.teams || [];
            if (teams.length === 0) {
                return [null, null];
            } else if (teams.length === 1) {
                return [teams[0], null];
            }

            if (this.match?.flip_teams) {
                return [...teams].reverse();
            }
            return teams;
        }
    },
    methods: {
        async toggleFlipTeams() {
            try {
                this.processing.flipTeams = true;
                await authenticatedRequest("actions/toggle-flip-teams");
            } finally {
                this.processing.flipTeams = false;
            }
        },
        async advertiseBroadcast(state) {
            this.updateData.advertise = state;
            return await this.updateBroadcast();
        },
        async togglePlayerCams(state) {
            this.updateData.playerCams = state;
            return await this.updateBroadcast();
        },
        async setAttack(side) {
            const set = side === this.broadcast.map_attack ? null : side;
            this.updateData.mapAttack = set;
            return await this.updateBroadcast();
        },
        async autoAttack() {
            let nextAttackMode = null;
            if (!this.broadcast.map_attack) {
                nextAttackMode = "Right";
            } else if (this.broadcast.map_attack === "Right") {
                nextAttackMode = "Left";
            } else if (this.broadcast.map_attack === "Left") {
                nextAttackMode = "Right";
            } else if (this.broadcast.map_attack === "Both") {
                nextAttackMode = null;
            }

            this.updateData.mapAttack = nextAttackMode;
            return await this.updateBroadcast();
        },
        async setLiveMatchVisibility(visible) {
            this.updateData.showLiveMatch = visible;
            return await this.updateBroadcast();
        },
        async updateBroadcast() {
            if (this.broadcastUpdateTimeout) clearTimeout(this.broadcastUpdateTimeout);

            // this.broadcastUpdateTimeout = setTimeout(async () => {
            await authenticatedRequest("actions/update-broadcast", this.updateData);
            this.updateData = {};
            // }, 500);
        },
        sword(direction) {
            return {
                Both: "fas fa-swords",
                any: "far fa-swords",
                Right: "fas fa-sword fa-flip-horizontal",
                Left: "fas fa-sword"
            }[direction || "any"];
        },
        async mapWin(teamNum) {
            this.processing.multiMapWin = true;
            try {
                await authenticatedRequest("actions/multi-map-win", {
                    unsetMapAttack: true,
                    teamNum
                });
            } finally {
                this.processing.multiMapWin = false;
            }
        },
        async setTwitchTitle() {
            this.processing.twitchTitle = true;
            try {
                const response = await authenticatedRequest("actions/set-title");
                if (response.error) return; // handled by internal
                this.$notyf.success({
                    message: response.data,
                    duration: 20000
                });
            } finally {
                this.processing.twitchTitle = false;
            }
        }

    }
};
</script>

<style scoped>
    .broadcast-editor {
        gap: .5em;
        margin-bottom: 1em;
    }
    .area {
        display: flex;
        gap: .5em;
    }
    .right-area {
        margin-left: auto;
    }
    .group-top {
        font-size: 0.7em;
        text-transform: uppercase;
        font-weight: bold;
        margin-bottom: 0.25em;
        text-align: center;
    }
    .map-attack .btn {
        outline: none !important;
        box-shadow: none !important;
    }

    .fake-btn-group {
        position: relative;
        display: inline-flex;
        vertical-align: middle;
    }
    .fake-btn-group div:not(:first-child):deep(.btn) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
    .fake-btn-group div:not(:last-child):deep(.btn) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .btn.quick-button,
    .btn-group.quick-button:deep(.btn),
    .broadcast-editor:deep(.btn.quick-button),
    .broadcast-editor:deep(.btn-group.quick-button .btn) {
        font-size: 30px;
        width: 2.5em;
        height: 2.5em;
        position: relative;
        padding: 0.1em .1em;
    }
    .btn-group.quick-button:deep(.btn+.btn.dropdown-toggle),
    .broadcast-editor:deep(.btn-group.quick-button .btn+.btn.dropdown-toggle) {
        width: 1.5em;
        font-size: 20px;
        height: 3.75em;
    }
    .btn-group.quick-button.no-main-button .btn:not(.dropdown-toggle),
    .broadcast-editor:deep(.btn-group.quick-button.no-main-button .btn:not(.dropdown-toggle)) {
        display: none;
    }
    .btn-group.quick-button:deep(.btn+.btn),
    .broadcast-editor:deep(.btn-group.quick-button .btn+.btn),
    .btn-group .btn.quick-button+.btn.quick-button,
    .broadcast-editor:deep(.btn-group .btn.quick-button+.btn.quick-button) {
        border-left: 1px solid rgba(0, 0, 0, 0.2);
    }

    .icon-stack,
    .broadcast-editor:deep(.icon-stack) {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .icon-stack .icon-text,
    .broadcast-editor:deep(.icon-stack .icon-text)  {
        text-transform: uppercase;
        font-weight: bold;
        font-size: .5em;
        line-height: 1;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 2px;
        height: 24px;
    }
    .icon-stack .icon-text-code,
    .broadcast-editor:deep(.icon-stack .icon-text-code)  {
        text-transform: uppercase;
        font-weight: bold;
        font-size: .66em;
        line-height: 1;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .icon-stack i,
    .broadcast-editor:deep(.icon-stack i) {
        height: 1.25em;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .icon-stack .team-icon,
    .broadcast-editor:deep(.icon-stack .team-icon){
        height: 1.25em;
        width: 1.25em;
        border: none !important;
        background-color: transparent !important;
    }

    .quick-button .top-describer-button,
    .broadcast-editor:deep(.quick-button .top-describer-button) {
        position: absolute;
        font-size: .4em;
        top: .33em;
        right: .33em;
        opacity: 0.7;
    }
</style>
