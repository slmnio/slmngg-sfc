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
                                <div>Role color settings</div>
                                <b-form-select v-model="runSettings.roles.changeColors" :options="changeColorOptions" size="sm" />
                                <div class="d-flex gap-1 mb-2 mt-1">
                                    <b-form-input
                                        v-if="runSettings.roles.changeColors === 'override'"
                                        v-model="runSettings.roles.roleColorOverride"
                                        size="sm"
                                        type="color"
                                        placeholder="Role color">
                                        Role color override
                                    </b-form-input>
                                    <b-form-input
                                        v-if="runSettings.roles.changeColors === 'override'"
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
                            <div>
                                <div class="mt-2">Role pinging</div>
                                <b-form-select
                                    v-model="runSettings.roles.pingable"
                                    size="sm"
                                    placeholder="Choose roles"
                                    :options="swapCreateOptions(roleMentionableSettings, runSelections.roles.includes('create_roles'), false)" />

                                <div class="mt-2">Role hoist</div>
                                <b-form-select
                                    v-model="runSettings.roles.hoist"
                                    size="sm"
                                    placeholder="Choose roles"
                                    :options="swapCreateOptions(roleHoistSettings, runSelections.roles.includes('create_roles'), false)" />
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
                <div class="d-flex gap-2 align-items-start justify-content-between opacity-changes mt-3" :class="{'low-opacity': processing['creating'] }">
                    <div class="settings-group">
                        <div class="settings-title fw-bold">Team emoji</div>
                        <b-form-checkbox-group v-model="runSelections.teamEmoji" stacked :options="runOptions.teamEmoji" />
                        <div v-if="['create_team_emoji', 'edit_team_emoji'].some(x => runSelections.teamEmoji.includes(x))" class="extra-settings">
                            <div class="mt-2">
                                <div>Emoji name format</div>
                                <b-form-input v-model="runSettings.teamEmoji.format" size="sm" placeholder="Emoji name format" />
                                <span v-for="option in emojiFormatOptions" :key="option" class="mr-1" @click="runSettings.teamEmoji.format += `${runSettings.teamEmoji.format.length ? '_' : ''}{${option}}`">{{ `\{${option}\}` }}</span>
                                <div v-if="teams?.length">Example from random team: {{ randomTeam?.name }}:  <code>{{ generateEmojiName(randomTeam) }}</code></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-flex gap-2 align-items-start justify-content-between opacity-changes mt-3" :class="{'low-opacity': processing['creating'] }">
                    <div class="settings-group">
                        <div class="settings-title fw-bold">Custom roles</div>
                        <div class="custom-role-container d-flex gap-2 py-1 flex-wrap">
                            <div v-for="(role, i) in runSettings.customRoles" :key="i" class="custom-role bg-dark p-2 rounded">
                                <div class="role-name">
                                    <b-form-input v-model="role.name" size="sm" placeholder="Custom role name" />
                                </div>
                                <div class="role-id pt-1">
                                    <b-form-input v-model="role.roleID" size="sm" placeholder="Role ID" style="font-family: monospace" />
                                </div>
                                <div class="role-options">
                                    <div class="role-options-title" style="font-style: italic">Team positions</div>
                                    <b-form-checkbox-group v-model="role.teamRoles" class="ml-2" stacked :options="runOptions.customRoleOptions.teamRoles" />
                                </div>
                                <div v-if="anyTeamCategories" class="role-options">
                                    <div class="role-options-title" style="font-style: italic">Categories</div>
                                    <b-form-checkbox-group v-model="role.teamCategories" class="ml-2" stacked :options="teamCategories" />
                                </div>
                                <b-button class="mt-1" variant="danger" size="sm" @click="runSettings.customRoles.splice(i, 1)"><i class="fas fa-trash fa-fw"></i> Remove</b-button>
                            </div>
                        </div>
                        <b-button variant="success" size="sm" @click="runSettings.customRoles.push({ teamRoles: ['player', 'staff', 'captain'], teamCategories: [...teamCategories], name: 'Custom role', roleID: null })"><i class="fas fa-plus fa-fw"></i> Add custom role</b-button>
                    </div>
                </div>
                <div class="d-flex justify-content-end w-100 mt-3 gap-3 align-items-center">
                    <div v-if="liveRunData?.text" class="text-monospace">
                        {{ liveRunData?.text }}
                    </div>
                    <div v-if="liveRunData.bar" class="bar-wrapper gap-1">
                        <div class="bar-text">{{ liveRunData.bar?.current }} /  {{ liveRunData.bar?.total }}</div>
                        <b-progress striped animated class="w-100" :value="(liveRunData.bar?.current / liveRunData.bar?.total) * 100" />
                    </div>
                    <b-button
                        class="flex-shrink-0 opacity-changes"
                        variant="info"
                        :class="{'low-opacity': processing['creating'] }"
                        :disabled="processing['creating']"
                        @click="startProcessing">
                        <i class="fas fa-fw mr-1" :class="processing['creating'] ? 'fa-cog fa-spin': 'fa-cogs'"></i> Start processing
                    </b-button>
                </div>
            </b-form-group>
        </div>

        <b-form-checkbox v-model="testDiscordColors" switch>Test Discord role colors</b-form-checkbox>
        <table class="table table-bordered table-dark table-sm">
            <thead>
                <tr>
                    <th></th>
                    <th>Team</th>
                    <th v-if="anyTeamCategories">Category</th>
                    <th>Role</th>
                    <th>Text channel</th>
                    <th>Voice channel</th>
                    <th v-if="['create_team_emoji', 'edit_team_emoji'].some(x => runSelections.teamEmoji.includes(x))">
                        Emoji name
                    </th>
                    <th>Emoji</th>
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
                    <td :class="testDiscordColors ? 'test-discord' : ''">
                        <router-link :to="`/team/${team.id}`" :style="!testDiscordColors ? {} : {color: (team?.theme?.color_theme_on_dark || team?.theme?.color_theme)}">{{ team.name }}</router-link>
                        <router-link v-if="testDiscordColors" :to="`/team/${team.id}/theme`">
                            <contrast-badge class="contrast-badge" :colors="['#2c2e32', team?.theme?.color_theme_on_dark || team?.theme?.color_theme]" />
                        </router-link>
                    </td>
                    <td v-if="anyTeamCategories">{{ team.team_category?.split(";")?.[1] || team.team_category }}</td>
                    <td>
                        <CopyTextButton v-if="team._control.get('role_id')" class="snowflake" :content="`<@&${team._control.get('role_id')}>`">
                            {{ team._control.get("role_id") }}
                        </CopyTextButton>
                        <span v-else>Not set</span>
                    </td>
                    <td>
                        <CopyTextButton v-if="team._control.get('text_channel_id')" class="snowflake" :content="`<#${team._control.get('text_channel_id')}>`">
                            {{ team._control.get("text_channel_id") }}
                        </CopyTextButton>
                        <span v-else>Not set</span>
                    </td>
                    <td>
                        <CopyTextButton v-if="team._control.get('voice_channel_id')" class="snowflake" :content="`<#${team._control.get('voice_channel_id')}>`">
                            {{ team._control.get("voice_channel_id") }}
                        </CopyTextButton>
                        <span v-else>Not set</span>
                    </td>
                    <td v-if="['create_team_emoji', 'edit_team_emoji'].some(x => runSelections.teamEmoji.includes(x))">
                        <code>{{ generateEmojiName(team) }}</code>
                    </td>
                    <td>
                        <CopyTextButton v-if="team._control.get('emoji_id')" class="snowflake" :content="team._control.get('emoji_id')">
                            {{ team._control.get("emoji_id") }}
                        </CopyTextButton>
                        <span v-else>Not set</span>
                    </td>
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

        <div v-if="teams?.length">
            <h3>Copying</h3>
            <div v-if="anyTeamCategories" class="mb-2">
                <b-form-checkbox-group v-model="copyCategories" :options="teamCategories" stacked />
            </div>
            <b-button-group>
                <b-button variant="primary" @click="copy(copyTeams.map(t => t?._control?.get('role_id')).filter(Boolean).map(id => `<@&${id}>`).join(' '))">Copy roles</b-button>
                <b-button variant="primary" @click="copy(copyTeams.map(t => t?._control?.get('text_channel_id')).filter(Boolean).map(id => `<#${id}>`).join('\n'))">Copy text channels</b-button>
                <b-button variant="primary" @click="copy(copyTeams.map(t => t?._control?.get('voice_channel_id')).filter(Boolean).map(id => `<#${id}>`).join('\n'))">Copy voice channels</b-button>
            </b-button-group>
        </div>


        <textarea v-if="fixes?.length" rows="15" class="bg-dark text-white font-monospace p-2 rounded" :value="fixText"></textarea>
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
import { cleanID } from "@/utils/content-utils";
import ContrastBadge from "@/components/website/ContrastBadge.vue";

export default {
    name: "EventSettingsDiscord",
    components: { ContrastBadge, EventSettingsFix, CopyTextButton, ThemeLogo, SettingsMultiselect },
    props: {
        event: {}
    },
    data: () => ({
        testDiscordColors: false,
        selectedGuildID: "",
        fixes: [],

        copyCategories: [],

        processing: {},

        runSelections: {
            roles: [],
            textChannels: [],
            voiceChannels: [],
            teamEmoji: []
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
                roleColorOverride: null,
                pingable: null,
                hoist: null,
                changeColors: null
            },
            teamEmoji: {
                format: "{event_short}_{team_name}"
            },
            customRoles: []
        },
        roleData: null,
        runOutput: null,
        emojiFormatOptions: [
            "team_id",
            "team_code",
            "team_name",
            "team_category",
            "event_id",
            "event_name",
            "event_short"
        ],
        roleHoistSettings: [
            {  value: null, text: "Don't change hoist setting" },
            {  value: true, text: "Display role members separately from other users" },
            {  value: false, text: "Don't display role members separately" },
        ],
        roleMentionableSettings: [
            {  value: null, text: "Don't change pingable setting" },
            {  value: true, text: "Turn role pings on" },
            {  value: false, text: "Turn role pings off" },
        ]
    }),
    computed: {
        changeColorOptions() {
            if (this.runSelections.roles.includes("create_roles")) {
                return [
                    { value: null, text: "Use team colors" },
                    { value: "override", text: "Use color override" },
                ];
            } else {
                return [
                    { value: null, text: "Don't change role colors" },
                    { value: "team", text: "Update team colors" },
                    { value: "override", text: "Update with color override" },
                ];
            }
        },
        randomTeam() {
            if (!this.teams?.length) return null;
            return this.teams?.[Math.floor(Math.random() * this.teams.length)];
        },
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
                    { value: "edit_roles", text: "Update role (name/icon)" },
                    { value: "assign_roles", text: "Give team members roles" },
                    { value: "assign_custom_roles", text: "Give custom roles" },
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

            let teamEmoji = [
                { value: "delete_team_emoji", text: "Delete team emoji" },
            ];
            if (this.runSelections.teamEmoji.includes("delete_team_emoji")) {
                teamEmoji.unshift({ value: "create_team_emoji", text: "Recreate team emoji" });
            } else {
                teamEmoji.unshift({ value: "create_team_emoji", text: "Create team emoji" });
            }
            if (!(this.runSelections.teamEmoji.includes("delete_team_emoji") || this.runSelections.teamEmoji.includes("create_team_emoji"))) {
                teamEmoji.push({ value: "edit_team_emoji", text: "Edit team emoji names" });
            }

            const customRoleOptions = {
                teamRoles: [
                    { value: "player", text: "Players" },
                    { value: "staff", text: "Staff" },
                    { value: "captain", text: "Captains" },
                ]
            };

            return {
                roles,
                textChannels,
                voiceChannels,
                teamEmoji,
                customRoleOptions
            };
        },
        canEditEventSettings() {
            const { isAuthenticated, user } = useAuthStore();
            if (!isAuthenticated) return false;
            return isEventStaffOrHasRole(user, this.event, ["Can edit any event"]);
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
                    const [aIdx, bIdx] = [a,b].map(x => x.team_category?.split(";")[0]);
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
        teamCategories() {
            return this.teams.map(t => {
                const cat = t.team_category?.split(";");
                return !cat ? null : cat.pop().trim();
            }).filter((v,i,a) => a.indexOf(v) === i);
        },
        copyTeams() {
            return this.teams.filter(t => {
                const cat = t.team_category?.split(";");
                const catCompare = !cat ? null : cat.pop();
                if (!catCompare) return false;
                return this.copyCategories.includes(catCompare);
            });
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
            const roles = (this.roleData || []).map((role, i) => {
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
            if (roles.length) {
                return [
                    { value: null, text: "Don't change role positions" },
                    ...roles,
                ];
            }
            return [];
        },
        fixText() {
            console.log(JSON.stringify(this.fixes));
            return (this.teams || []).map(team => {
                const teamFixes = (this.fixes || []).filter(f => ["player_discord_not_found"].includes(f.type) && f.teamID === "rec" + team.id);
                if (!teamFixes?.length) return null;
                return `- ${team?.name}\n` + teamFixes.map(item => {
                    const fixPlayer = ReactiveRoot(item?.playerID);
                    // console.log(item?.type, item, fixPlayer);
                    if (!fixPlayer?.name) return null;
                    return `  - [${fixPlayer?.name}](<https://slmn.gg/player/${cleanID(fixPlayer?.id)}>)` + (item.discordTag ? ` (\`${item.discordTag}\`)` : "") + (item.discordID ? ` (id: \`${item.discordID}\` <@${item.discordID}>)` : "");
                }).filter(Boolean).join("\n");
            }).filter(Boolean).join("\n");
        },
        liveRunData() {
            if (!this.event?.id) return null;
            return ReactiveRoot(`create-event-discord-items-${cleanID(this.event?._original_data_id || this.event?.id)}`);
        }
    },
    methods: {
        swapCreateOptions(options, createActionPresent, defaultBool) {
            if (!createActionPresent) return options;
            return options.filter(opt => opt.value !== null).map(opt => {
                if (opt.value === defaultBool) {
                    return {
                        ...opt,
                        value: null
                    };
                }
                return opt;
            });
        },
        generateEmojiName(team) {
            return (this.runSettings.teamEmoji.format || "")
                .replaceAll("{team_id}", team?.id || "")
                .replaceAll("{team_code}", team?.code || "")
                .replaceAll("{team_name}", team?.name || "")
                .replaceAll("{team_category}", (team?.team_category?.includes(";") ? team.team_category.split(";")?.[1] : team?.team_category) || "")
                .replaceAll("{event_id}", this.event?.id || "")
                .replaceAll("{event_name}", this.event?.name || "")
                .replaceAll("{event_short}", this.event?.short || "")
                .replaceAll(/[^a-zA-Z0-9_]/g, "")
                .slice(0, 32);
        },
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
                        ...this.runSelections.teamEmoji,
                    ],
                    settings: this.runSettings
                });

                if (!output?.error) {
                    this.$notyf.success(output.data.status.replaceAll("\n", "<br>"));
                    this.runOutput = output.data;
                }
            } catch (e) {
                console.error(e);
            } finally {
                this.processing["creating"] = false;
                this.roleData = (await this.getGuildRoleData()) || [];
            }
        },
        async getGuildRoleData() {
            const { data, error } = await authenticatedRequest("actions/get-discord-server-data", {
                eventID: this.event?._original_data_id || this.event?.id,
                dataType: "roles"
            });
            return (data || []).sort((a,b) => b.rawPosition - a.rawPosition);
        },
        getHex(colorNum) {
            if (!colorNum) return null;
            return "#" + colorNum.toString(16).padStart(6, "0");
        },
        async copy(text) {
            await navigator.clipboard.writeText(text);
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
        },
        "liveRunData.working": {
            immediate: true,
            handler(isRunning) {
                this.processing["creating"] = isRunning;
            }
        },
        "liveRunData.output": {
            immediate: true,
            deep: true,
            handler(data) {
                this.runOutput = data;
            }
        },
        runOutput: {
            immediate: true,
            deep: true,
            handler(data) {
                this.fixes = data?.fixes || [];
            }
        },
        teamCategories: {
            immediate: true,
            deep: true,
            handler(cats) {
                this.copyCategories = cats;
            }
        },
        "event.discord_control": {
            immediate: true,
            deep: true,
            handler(discordControl) {
                const control = new MapObject(discordControl);
                this.runSettings.customRoles = JSON.parse(control.get("custom_roles") || "[]");
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
    .bar-wrapper {
        width: 5em;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .bar-text {
        line-height: 1;
    }
    .snowflake {
        font-family: monospace;
        font-size: 0.7em;
        vertical-align: text-top;
    }
    td.test-discord {
        background-color: #2c2e32;
    }
    .contrast-badge {
        display: inline-block;
        float: right;
        padding: 0 0.25em;
        font-weight: bold;
        min-width: 3em;
        text-align: center;
        font-size: 0.8em;
    }
</style>
