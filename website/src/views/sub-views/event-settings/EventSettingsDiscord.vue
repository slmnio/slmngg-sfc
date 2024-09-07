<template>
    <div v-if="canEditEventSettings" class="event-settings">
        <!--        <h3>Discord Settings</h3>-->
        <div class="settings">
            <b-form-group
                label="Server"
                label-for="server-input"
                label-cols="2"
                class="opacity-changes"
                :class="{'low-opacity': processing['guild_id'] }">
                <div class="d-flex gap-2">
                    <b-form-select id="server-input" v-model="selectedGuildID" :options="availableGuilds" />
                    <b-button class="flex-shrink-0" variant="success" @click="setID"><i class="fas fa-save fa-fw"></i> Save</b-button>
                </div>
            </b-form-group>
        </div>
        <div class="settings">
            <b-form-group label="Run settings" label-cols="2">
                <div class="d-flex gap-2 align-items-start justify-content-between opacity-changes" :class="{'low-opacity': processing['creating'] }">
                    <div class="settings-group">
                        <div class="settings-title fw-bold">Team roles</div>
                        <b-form-checkbox-group v-model="runSelections.roles" stacked :options="runOptions.roles" />
                        <div v-if="['create_roles', 'edit_roles'].some(x => runSelections.roles.includes(x))" class="extra-settings">
                            <div class="mt-2">
                                <b-form-checkbox v-model="useRoleColorOverride" switch>
                                    Use role color override
                                </b-form-checkbox>

                                <div class="d-flex gap-1 mb-2">
                                    <b-form-input
                                        v-if="useRoleColorOverride"
                                        v-model="runSettings.roles.roleColorOverride"
                                        size="sm"
                                        type="color"
                                        placeholder="Role color">
                                        Role color override
                                    </b-form-input>
                                    <b-form-input
                                        v-if="useRoleColorOverride"
                                        v-model="runSettings.roles.roleColorOverride"
                                        size="sm"
                                        type="text"
                                        placeholder="Role color">
                                        Role color override
                                    </b-form-input>
                                </div>
                            </div>
                            <div>
                                <div>Role position (above selected)</div>
                                <b-form-select
                                    v-model="runSettings.roles.rolePosition"
                                    size="sm"
                                    placeholder="Choose roles"
                                    :options="rolePositionOptions" />
                            </div>
                            <!-- role hoist -->
                        </div>
                    </div>
                    <div class="settings-group">
                        <div class="settings-title fw-bold">Team channels</div>
                        <b-form-checkbox-group v-model="runSelections.textChannels" stacked :options="runOptions.textChannels" />

                        <div v-if="['create_text_channels', 'edit_text_channels'].some(x => runSelections.textChannels.includes(x))" class="permissions-settings">
                            <div class="mt-2">
                                <b-form-checkbox
                                    v-model="runSettings.textChannels.useTeamCategories">
                                    Split text channels by team category
                                </b-form-checkbox>
                            </div>
                        </div>
                        <div v-if="runSelections.textChannels.includes('update_text_channels_permissions') || runSelections.textChannels.includes('create_text_channels')" class="permissions-settings">
                            <div>
                                <div>Roles that can access team text channels</div>
                                <SettingsMultiselect
                                    v-model="runSettings.textChannels.accessRoleIDs"
                                    size="sm"
                                    placeholder="Choose roles"
                                    :options="roleOptions" />
                            </div>
                        </div>
                    </div>
                    <div class="settings-group">
                        <div class="settings-title fw-bold">Voice channels</div>
                        <b-form-checkbox-group v-model="runSelections.voiceChannels" stacked :options="runOptions.voiceChannels" />

                        <div v-if="['create_voice_channels', 'edit_voice_channels'].some(x => runSelections.voiceChannels.includes(x))" class="permissions-settings">
                            <div class="mt-2">
                                <b-form-checkbox
                                    v-model="runSettings.voiceChannels.useTeamCategories">
                                    Split voice channels by team category
                                </b-form-checkbox>
                            </div>
                        </div>
                        <div v-if="runSelections.voiceChannels.includes('update_voice_channels_permissions') || runSelections.voiceChannels.includes('create_voice_channels')" class="permissions-settings mt-2">
                            <div>
                                <div>Roles that can view team voice channels</div>
                                <SettingsMultiselect
                                    v-model="runSettings.voiceChannels.viewRoleIDs"
                                    size="sm"
                                    placeholder="Choose roles"
                                    :options="roleOptions" />
                            </div>
                            <div class="mt-1">
                                <div>Roles that can connect to team voice channels</div>
                                <SettingsMultiselect
                                    v-model="runSettings.voiceChannels.connectRoleIDs"
                                    size="sm"
                                    placeholder="Choose roles"
                                    :options="roleOptions" />
                            </div>
                        </div>
                    </div>
                    <!--                    <b-form-checkbox-group v-model="selectedTeamSettings" stacked :options="teamSettingsOptions" />-->
                    <!--                    <b-form-checkbox-group v-model="selectedRunSettings" stacked :options="runSettingsOptions" />-->
                </div>
                <div class="d-flex justify-content-end w-100 mt-3">
                    <b-button
                        class="flex-shrink-0 opacity-changes"
                        variant="info"
                        :class="{'low-opacity': processing['creating'] }"
                        :disabled="processing['creating']"
                        @click="startProcessing">
                        <i class="fas  fa-fw mr-1" :class="processing['creating'] ? 'fa-cog fa-spin': 'fa-cogs'"></i> Start processing
                    </b-button>
                </div>
            </b-form-group>
        </div>

        <table class="table table-bordered table-dark table-sm">
            <thead>
                <tr>
                    <th></th>
                    <th>Team</th>
                    <th v-if="anyTeamCategories">Category</th>
                    <th>Role</th>
                    <th>Text channel</th>
                    <th>Voice channel</th>
                    <th>Fixes</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="team in teams" :key="team.id">
                    <td style="width: 0">
                        <theme-logo
                            logo-size="w-50"
                            :theme="team.theme"
                            class="logo"
                            border-width="3px"
                            icon-padding="6px" />
                    </td>
                    <td>
                        <router-link :to="`/team/${team.id}`">{{ team.name }}</router-link>
                    </td>
                    <td v-if="anyTeamCategories">{{ team.team_category?.split(";")?.[1] || team.team_category }}</td>
                    <td>
                        <CopyTextButton v-if="team._control.get('role_id')" :content="`<@&${team._control.get('role_id')}>`">
                            {{ team._control.get("role_id") }}
                        </CopyTextButton>
                        <span v-else>Not set</span>
                    </td>
                    <td>
                        <CopyTextButton v-if="team._control.get('text_channel_id')" :content="`<#${team._control.get('text_channel_id')}>`">
                            {{ team._control.get("text_channel_id") }}
                        </CopyTextButton>
                        <span v-else>Not set</span>
                    </td>
                    <td>
                        <CopyTextButton v-if="team._control.get('voice_channel_id')" :content="`<#${team._control.get('voice_channel_id')}>`">
                            {{ team._control.get("voice_channel_id") }}
                        </CopyTextButton>
                        <span v-else>Not set</span>
                    </td>
                    <td>
                        <ul>
                            <li v-for="(item, i) in fixes.filter(f => !['player_details_updated'].includes(f.type) && f.teamID === `rec` + team.id)" :key="i">
                                <EventSettingsFix :item="item" :teams="teams" />
                            </li>
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { ReactiveRoot } from "@/utils/reactive";
import { MapObject } from "@/utils/map-object";
import { isEventStaffOrHasRole } from "@/utils/client-action-permissions";
import { authenticatedRequest } from "@/utils/dashboard";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import CopyTextButton from "@/components/website/CopyTextButton.vue";
import EventSettingsFix from "@/components/website/EventSettingsFix.vue";
import { useAuthStore } from "@/stores/authStore";
import { sortAlpha } from "@/utils/sorts";
import SettingsMultiselect from "@/views/sub-views/event-settings/SettingsMultiselect.vue";

export default {
    name: "EventSettingsDiscord",
    components: { EventSettingsFix, CopyTextButton, ThemeLogo, SettingsMultiselect },
    props: {
        event: {}
    },
    data: () => ({
        selectedGuildID: "",
        fixes: [],

        processing: {},
        useRoleColorOverride: false,

        runSelections: {
            roles: [],
            textChannels: [],
            voiceChannels: []
        },
        runSettings: {
            textChannels: {
                accessRoleIDs: [],
                useTeamCategories: false
            },
            voiceChannels: {
                viewRoleIDs: [],
                connectRoleIDs: [],
                useTeamCategories: false
            },
            roles: {
                rolePosition: null,
                roleColorOverride: null
            }
        },
        roleData: null
    }),
    computed: {
        runOptions() {


            let roles = [
                { value: "delete_roles", text: "Delete roles" },
            ];
            if (this.runSelections.roles.includes("delete_roles")) {
                roles.unshift({ value: "create_roles", text: "Recreate roles" });
            } else {
                roles.unshift({ value: "create_roles", text: "Create roles" });
            }
            if (!this.runSelections.roles.includes("delete_roles") || this.runSelections.roles.includes("create_roles") ) {
                roles = [
                    ...roles,
                    { value: "edit_roles", text: "Update role (name/color/icon)" },
                    { value: "assign_roles", text: "Give team members roles" },
                    { value: "unassign_roles", text: "Remove unknown users from roles" },
                ];
            }


            let textChannels = [
                { value: "delete_text_channels", text: "Delete text channels" },
            ];
            if (this.runSelections.textChannels.includes("delete_text_channels")) {
                textChannels.unshift({ value: "create_text_channels", text: "Recreate text channels" });
            } else {
                textChannels.unshift({ value: "create_text_channels", text: "Create text channels" });
            }
            if (!this.runSelections.textChannels.includes("delete_text_channels") || this.runSelections.textChannels.includes("create_text_channels") ) {
                textChannels = [
                    ...textChannels,
                    { value: "edit_text_channels", text: "Update channel (name/category)" },
                    { value: "update_text_channels_permissions", text: "Update permissions" }
                ];
            }

            let voiceChannels = [
                { value: "delete_voice_channels", text: "Delete voice channels" },
            ];
            if (this.runSelections.voiceChannels.includes("delete_voice_channels")) {
                voiceChannels.unshift({ value: "create_voice_channels", text: "Recreate voice channels" });
            } else {
                voiceChannels.unshift({ value: "create_voice_channels", text: "Create voice channels" });
            }
            if (!this.runSelections.voiceChannels.includes("delete_voice_channels") || this.runSelections.voiceChannels.includes("create_voice_channels") ) {
                voiceChannels = [
                    ...voiceChannels,
                    { value: "edit_voice_channels", text: "Update channel (name/category)" },
                    { value: "update_voice_channels_permissions", text: "Update permissions" }
                ];
            }

            return {
                roles,
                textChannels,
                voiceChannels
            };
        },
        canEditEventSettings() {
            const { isAuthenticated, user } = useAuthStore();
            if (!isAuthenticated) return false;
            return isEventStaffOrHasRole(user, { event: this.event, websiteRoles: ["Can edit any event"] });
        },
        availableGuilds() {
            return [
                { text: "No server", value: null },
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
        teams() {
            if (!this.event?.teams?.length) return [];
            return (this.event?.teams || []).map(t => {
                const control = new MapObject(t?.discord_control || "");
                return {
                    ...t,
                    _control: control
                };
            }).sort((a,b) => {
                if (a.team_category && b.team_category) {
                    const [aIdx, bIdx] = [a,b].map(x => x.team_category.split(";")[0]);
                    if (aIdx !== bIdx) {
                        if (aIdx < bIdx) return -1;
                        if (aIdx > bIdx) return 1;
                    }
                }
                return sortAlpha(a,b, "name");
            });
        },
        anyTeamCategories() {
            return this.teams.some(t => t.team_category);
        },
        roleOptions() {
            return (this.roleData || []).map(role => ({
                text: role.name,
                value: role.id,
                style: {
                    "--role-color": this.getHex(role.color)
                }
            }));
        },
        rolePositionOptions() {
            return (this.roleData || []).map((role, i) => {

                const isTopMost = i === this.roleData.findIndex(r => r.rawPosition === role.rawPosition);
                return {
                    text: `${isTopMost ? " " : "↑ "}${role.name} (${role.rawPosition})`,
                    value: role.rawPosition,
                    style: {
                        "--role-color": this.getHex(role.color)
                    },
                    disabled: !isTopMost
                };
            });
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
        async startProcessing() {
            this.processing["creating"] = true;
            try {
                this.fixes = [];
                const output = await authenticatedRequest("actions/create-event-discord-items", {
                    eventID: this.event?._original_data_id || this.event?.id,
                    guildID: this.selectedGuildID,

                    actions: [
                        ...this.runSelections.roles,
                        ...this.runSelections.textChannels,
                        ...this.runSelections.voiceChannels,
                    ],
                    settings: this.runSettings
                });
                this.selectedRunSettings = [];

                if (!output?.error) {
                    this.$notyf.success(output.data.status.replaceAll("\n", "<br>"));
                    this.fixes = output.data.fixes;
                    console.log("Fixes", output.data.fixes);
                }
            } finally {
                this.processing["creating"] = false;
                this.roleData = await this.getGuildRoleData();
            }
        },
        async getGuildRoleData() {
            const { data, error } = await authenticatedRequest("actions/get-discord-server-data", {
                eventID: this.event?._original_data_id || this.event?.id,
            });
            return (data || []).sort((a,b) => b.rawPosition - a.rawPosition);
        },
        getHex(colorNum) {
            if (!colorNum) return null;
            return "#" + colorNum.toString(16).padStart(6, "0");
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
                if (!this.roleData && newID) {
                    this.roleData = await this.getGuildRoleData();
                }
            }
        },
        useRoleColorOverride: {
            immediate: true,
            handler() {
                this.runSettings.roles.roleColorOverride = null;
            }
        }
    }
};
</script>

<style scoped>
    .event-settings {
        display: flex;
        flex-direction: column;
        gap: 1em;
    }
    .logo {
        height: 1.5em;
        width: 2em;
    }
    ul {
        margin-bottom: 0 !important;
    }

    .settings:deep(.multiselect__tags) {
        background-color: #313338;
        color: white;
    }

    .settings:deep(.multiselect__tags-wrap) {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        gap: 2px;
    }
    .settings:deep(.multiselect__input) {
        background-color: transparent !important;
        color: white;
    }

    .settings:deep(.settings-multiselect .badge) {
        border: 2px solid var(--role-color, #99aab5);
        background-color: #313338 !important;
        color: var(--role-color, white) !important;
        border-radius: 1em;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
</style>
