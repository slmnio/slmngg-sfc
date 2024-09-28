<template>
    <div v-if="canEditEventSettings" class="event-settings-discord-logging event-settings">
        <div class="settings mb-4">
            <b-form-group
                label="Server"
                label-for="server-input"
                label-cols="2"
                class="opacity-changes"
                :class="{'low-opacity': processing['guild_id'] }">
                <div class="d-flex gap-2">
                    <b-form-select id="server-input" v-model="selectedGuildID" :options="availableGuilds" />
                    <b-button class="flex-shrink-0" variant="success" @click="setID">
                        <i class="fas fa-save fa-fw"></i>
                        Set server
                    </b-button>
                </div>
            </b-form-group>
        </div>

        <h3>Logging</h3>
        <div class="logging settings-group d-flex flex-column gap-4">
            <div class="d-flex flex-column gap-1">
                <b-form-group
                    label="Public roster changes"
                    label-cols="2"
                    description="A public message when someone is added to or removed from teams.">
                    <b-form-select
                        v-model="logging.publicRosterChanges"
                        :options="[{value:null,text:'Do not log'},...(channelData||[])]" />
                </b-form-group>
                <b-form-group
                    label="Hide non-staff roster changes"
                    label-cols="2"
                    description="Don't log any changes about team members who aren't players.">
                    <b-form-checkbox
                        v-model="logging.hideNonStaffRosterChanges" />
                </b-form-group>
                <b-form-group
                    disabled
                    label="Match time changes"
                    label-cols="2"
                    description="A public message when the start time of a match changes.">
                    <b-form-select
                        v-model="logging.matchTimeChanges"
                        :options="[{value:null,text:'Do not log'},...(channelData||[])]" />
                </b-form-group>
                <b-form-group
                    label="Captain notifications"
                    label-cols="2"
                    description="A message in a captains channel notifying teams that a score needs approval">
                    <b-form-select
                        v-model="logging.captainNotifications"
                        :options="[{value:null,text:'Do not log'},...(channelData||[])]" />
                </b-form-group>
                <b-form-group
                    disabled
                    label="Post-match reports"
                    label-cols="2"
                    description="A public message with match details once a match has been completed.">
                    <b-form-select
                        v-model="logging.postMatchReports"
                        :options="[{value:null,text:'Do not log'},...(channelData||[])]" />
                </b-form-group>
            </div>
            <div class="d-flex flex-column gap-2">
                <b-form-group
                    label="Staff score report notifications"
                    label-cols="2"
                    description="A staff message prompting staff approval of a score report.">
                    <b-form-select
                        v-model="logging.staffScoreReport"
                        :options="[{value:null,text:'Do not log'},...(channelData||[])]" />
                </b-form-group>
                <b-form-group
                    label="Score report completions"
                    label-cols="2"
                    description="A staff message detailing a completed score report.">
                    <b-form-select
                        v-model="logging.staffCompletedScoreReport"
                        :options="[{value:null,text:'Do not log'},...(channelData||[])]" />
                </b-form-group>
            </div>
        </div>

        <div class="d-flex justify-content-end">
            <b-button variant="success" :disabled="processing.save" @click="saveToEvent">
                <i class="fas fa-save fa-fw"></i>
                Save logging channels
            </b-button>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from "@/stores/authStore.ts";
import { isEventStaffOrHasRole } from "@/utils/client-action-permissions.js";
import { ReactiveRoot } from "@/utils/reactive.js";
import { authenticatedRequest } from "@/utils/dashboard.ts";
import { MapObject } from "@/utils/map-object.js";

export default {
    name: "EventSettingsDiscordLogging",
    props: {
        event: {}
    },
    data: () => ({
        processing: {},
        selectedGuildID: "",
        channelData: null,
        logging: {
            publicRosterChanges: null,
            matchTimeChanges: null,
            postMatchReports: null,
            captainNotifications: null,

            staffScoreReport: null,
            staffCompletedScoreReport: null,

            hideNonStaffRosterChanges: false
        }
    }),
    computed: {
        canEditEventSettings() {
            const {
                isAuthenticated,
                user
            } = useAuthStore();
            if (!isAuthenticated) return false;
            return isEventStaffOrHasRole(user, {
                event: this.event,
                websiteRoles: ["Can edit any event"]
            });
        },
        availableGuilds() {
            return [
                {
                    text: "No server",
                    value: null
                },
                ...(ReactiveRoot("discord-guilds")?.guilds || []).map(guild => ({
                    text: guild.name,
                    value: guild.id
                }))
            ];
        },
        dataSelectedGuildId() {
            if (!this.event?.discord_control) return null;
            const control = new MapObject(this.event?.discord_control);
            return control.get("guild_id") || null;
        },
        blocks() {
            if (!this.event?.blocks) return null;
            try {
                const blocks = JSON.parse(this.event.blocks);
                return blocks || null;
            } catch (e) {
                return null;
            }
        },
        editedBlocks() {
            return {
                ...(this.blocks || {}),
                logging: {
                    ...this.logging
                }
            };
        }
    },
    methods: {
        async setID() {
            this.processing["guild_id"] = true;
            const response = await authenticatedRequest("actions/set-event-guild", {
                eventID: this.event?._original_data_id || this.event?.id,
                guildID: this.selectedGuildID,
            });
            if (response.error) {
                console.error(response.error);
            } else {
                this.$notyf.success("Discord server set to event");
            }
            this.processing["guild_id"] = false;
        },
        async getGuildChannelData() {
            const {
                data,
                error
            } = await authenticatedRequest("actions/get-discord-server-data", {
                eventID: this.event?._original_data_id || this.event?.id,
                dataType: "channels"
            });

            const groups = {};

            data.filter(c => [0, 4].includes(c.type)).forEach(channel => {
                if (channel.type === 0) {
                    if (!groups[channel.parentId || "Text channels"]) {
                        groups[channel.parentId || "Text channels"] = {
                            parent: null,
                            channels: []
                        };
                    }
                    groups[channel.parentId || "Text channels"].channels.push(channel);
                }
                if (channel.type === 4) {
                    if (!groups[channel.id]) {
                        groups[channel.id] = {
                            parent: null,
                            channels: []
                        };
                    }
                    groups[channel.id].parent = channel;
                }
            });

            return Object.entries(groups)
                .filter(([parentId, group]) => group.channels.length)
                .sort((a, b) => a[1].parent?.rawPosition - b[1].parent?.rawPosition)
                .map(([parentId, group]) => ({
                    label: group.parent?.name || parentId,
                    options: group.channels.sort((a, b) => a.rawPosition - b.rawPosition).map(channel => ({
                        value: channel.id,
                        text: channel.name
                    }))
                }));
        },
        async saveToEvent() {
            try {
                this.processing.save = true;
                const response = await authenticatedRequest("actions/set-event-settings", {
                    eventID: this.event?.id,
                    settings: JSON.stringify(this.editedBlocks)
                });
                if (response.error) return;
                this.$notyf.success("Saved event settings");
            } catch (e) {
                console.error(e);
            } finally {
                this.processing.save = false;
            }
        }
    },
    watch: {
        dataSelectedGuildId: {
            immediate: true,
            async handler(newID, oldID) {
                this.selectedGuildID = newID;
                if (newID && oldID && (newID !== oldID)) {
                    this.roleData = null;
                }
                if (!this.channelData && newID) {
                    this.channelData = await this.getGuildChannelData();
                }
            }
        },
        blocks: {
            deep: true,
            handler(blocks) {
                if (!blocks?.logging) return;
                Object.entries(blocks.logging).forEach(([key, val]) => {
                    if (this.logging[key] !== undefined) {
                        this.logging[key] = val;
                    }
                });
            }
        }
    },
};
</script>

<style scoped>

</style>
