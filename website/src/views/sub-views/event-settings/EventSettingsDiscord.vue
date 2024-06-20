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
            <b-form-group label="Team settings" label-for="team-settings" label-cols="2">
                <div class="d-flex gap-2 align-items-start justify-content-between opacity-changes" :class="{'low-opacity': processing['creating'] }">
                    <b-form-checkbox-group v-model="selectedTeamSettings" stacked :options="teamSettingsOptions" />
                    <b-form-checkbox-group v-model="selectedRunSettings" stacked :options="runSettingsOptions" />
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
            <b-form-group label="Roles for team channels" label-cols="2" description="Add one role ID per line for roles that should have access to team text or voice channels">
                <div class="d-flex gap-2">
                    <div class="flex-grow-1">
                        <div class="m-2 font-weight-bold text-center">Team text channels</div>
                        <b-form-textarea v-model="textChannelRoles" />
                    </div>
                    <div class="flex-grow-1">
                        <div class="m-2 font-weight-bold text-center">Team voice channels</div>
                        <b-form-textarea v-model="voiceChannelRoles" />
                    </div>
                </div>
            </b-form-group>
        </div>

        <table class="table table-bordered table-dark table-sm">
            <thead>
                <tr>
                    <th></th>
                    <th>Team</th>
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
                    <td>
                        <CopyTextButton :content="`<@&${team._control.get('role_id')}>`">
                            {{ team._control.get("role_id") ?? "Not set" }}
                        </CopyTextButton>
                    </td>
                    <td>{{ team._control.get("text_channel_id") ?? "Not set" }}</td>
                    <td>{{ team._control.get("voice_channel_id") ?? "Not set" }}</td>
                    <td>
                        <ul>
                            <li v-for="(item, i) in fixes.filter(f => !['player_details_updated', 'discord_id_not_found'].includes(f.type) && f.teamID === `rec` + team.id)" :key="i">
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

export default {
    name: "EventSettingsDiscord",
    components: { EventSettingsFix, CopyTextButton, ThemeLogo },
    props: {
        event: {}
    },
    data: () => ({
        selectedGuildID: "",
        selectedTeamSettings: [],
        selectedRunSettings: [],

        fixes: [],
        textChannelRoles: "",
        voiceChannelRoles: "",

        processing: {},
        teamSettingsOptions: [
            { value: "create_roles", text: "Create roles" },
            { value: "create_text_channels", text: "Create text channels" },
            { value: "create_voice_channels", text: "Create voice channels" }
        ],
        runSettingsOptions: [
            { value: "update_roles", text: "Update roles" },
            { value: "delete_recreate_roles", text: "Delete & recreate roles" },
            { value: "delete_recreate_text_channels", text: "Delete & recreate text channels" },
            { value: "delete_recreate_voice_channels", text: "Delete & recreate voice channels" }
        ]
    }),
    computed: {
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
            });
        }
    },
    methods: {
        async setID() {
            this.processing["guild_id"] = true;
            const response = await authenticatedRequest("actions/set-event-guild", {
                eventID: this.event.id,
                guildID: this.selectedGuildID,
            });
            if (response.error) {
                console.error(response.error);
            }
            this.processing["guild_id"] = false;
        },
        async startProcessing() {
            this.processing["creating"] = true;
            this.fixes = [];
            const output = await authenticatedRequest("actions/create-event-discord-items", {
                eventID: this.event.id,
                guildID: this.selectedGuildID,
                teamSettings: this.selectedTeamSettings,
                runSettings: this.selectedRunSettings,
                settings: {
                    textChannelRoles: this.textChannelRoles,
                    voiceChannelRoles: this.voiceChannelRoles
                }
            });
            this.processing["creating"] = false;
            this.selectedRunSettings = [];

            if (!output?.error) {
                this.$notyf.success(output.data.status.replaceAll("\n", "<br>"));
                this.fixes = output.data.fixes;
                console.log("Fixes", output.data.fixes);
            }
        }
    },
    watch: {
        dataSelectedGuildId: {
            immediate: true,
            handler(id) {
                this.selectedGuildID = id;
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
</style>
