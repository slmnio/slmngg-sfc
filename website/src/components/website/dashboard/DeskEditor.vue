<template>
    <div class="desk-editor">
        <table class="table table-bordered table-sm table-dark mb-0 opacity-changes border-no-top" :class="{'low-opacity': processing }">
            <thead>
                <tr v-if="manualGuests?.length">
                    <th>Name</th>
                    <th>Avatar</th>
                    <th>Webcam link</th>
                    <th>Twitter handle</th>
                    <th>Pronouns</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(guest, i) in manualGuests" :key="i" class="guest-row">
                    <td>
                        <b-form-input
                            v-model="manualGuests[i].name"
                            type="text"
                            placeholder="Guest name"
                            :state="!manualGuests[i]?.name ? false : checkInputKeyMatches(manualGuests[i], 'name')" />
                        <b-form-invalid-feedback>
                            {{
                                manualGuests[i]?.name ? "Name must be distinguishable from other inputs" : "Name is required"
                            }}
                        </b-form-invalid-feedback>
                    </td>
                    <td>
                        <div class="d-flex">
                            <div
                                class="avatar-preview rounded-circle mr-1 bg-center flex-shrink-0"
                                :style="{'backgroundImage': manualGuests[i]?.avatar && `url(${manualGuests[i]?.avatar})`}"></div>
                            <div>
                                <b-form-input
                                    v-model="manualGuests[i].avatar"
                                    type="text"
                                    placeholder="https://i.imgur.com/HHvEClX.png"
                                    :state="checkInputKeyMatches(manualGuests[i], 'avatar')" />
                                <b-form-invalid-feedback>Avatars must be valid links</b-form-invalid-feedback>
                            </div>
                        </div>
                    </td>
                    <td>
                        <b-form-input
                            v-model="manualGuests[i].webcam"
                            type="text"
                            placeholder="https://vdo.ninja/?view=SLMN"
                            :state="checkInputKeyMatches(manualGuests[i], 'webcam')" />
                        <b-form-invalid-feedback>Webcams must be valid VDO.Ninja view links</b-form-invalid-feedback>
                    </td>
                    <td>
                        <b-form-input
                            v-model="manualGuests[i].twitter"
                            type="text"
                            placeholder="@slmnio"
                            :state="checkInputKeyMatches(manualGuests[i], 'twitter')" />
                        <b-form-invalid-feedback>Twitter handles must start with @</b-form-invalid-feedback>
                    </td>
                    <td>
                        <b-form-input
                            v-model="manualGuests[i].pronouns"
                            type="text"
                            placeholder="he/him"
                            :state="checkInputKeyMatches(manualGuests[i], 'pronouns')" />
                        <b-form-invalid-feedback>Pronouns must contain "/"</b-form-invalid-feedback>
                    </td>
                    <td>
                        <b-button variant="danger" @click="confirmRemoveGuest(i)">
                            <i class="fas fa-trash"></i>
                        </b-button>
                    </td>
                </tr>
                <tr v-if="!manualGuests?.length">
                    <td class="text-center" colspan="5">
                        <i>No manual guests listed</i>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="p-2 w-100 d-flex">
            <b-button variant="secondary" @click="addGuest">
                <i class="fas fa-fw fa-plus"></i> Add guest
            </b-button>
            <div class="spacer flex-grow-1"></div>
            <b-button :disabled="processing" class="ml-2" :variant="saveData === lastSavedData ? 'secondary' : 'success'" @click="saveGuests">
                <i class="fas fa-fw" :class="{'fa-save': !processing, 'fa-pulse fa-spinner': processing}"></i> Save guests
            </b-button>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { createGuestObject, getGuestString } from "@/utils/content-utils";
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "DeskEditor",
    props: {
        broadcast: {}
    },
    data: () => ({
        processing: false,
        manualGuests: [],
        lastLoadedManualGuests: [],
        lastSavedData: null
    }),
    computed: {
        guests() {
            if (!this.broadcast?.guests) return [];
            return ReactiveArray("guests", {
                player: ReactiveThing("player", {
                    socials: ReactiveArray("socials")
                }),
                theme: ReactiveThing("theme"),
                prediction_team: ReactiveThing("prediction_team", {
                    theme: ReactiveThing("theme")
                })
            })(this.broadcast);
        },
        saveData() {
            return this.manualGuests.map(guest => getGuestString(guest)).join("\n");
        }
    },
    methods: {
        addGuest() {
            this.manualGuests.push({});
        },
        checkInputKeyMatches(guest, key) {
            if (!guest?.[key]) return null;
            const tempGuest = createGuestObject(getGuestString(guest));
            console.log(guest[key], tempGuest[key], tempGuest[key] === guest[key]);
            return tempGuest[key]?.trim() === guest[key]?.trim();
        },
        confirmRemoveGuest(i) {
            if (this.manualGuests?.[i]?.name) {
                const okay = window.confirm(`Remove guest "${this.manualGuests?.[i]?.name}"?`);
                if (!okay) return;
            }
            this.manualGuests.splice(i, 1);
        },
        async saveGuests() {
            this.processing = true;
            this.lastSavedData = this.saveData;

            try {
                const response = await authenticatedRequest("actions/update-broadcast", {
                    manualGuests: this.saveData
                });
                if (!response.error) {
                    this.$notyf.success("Updated guests");
                }
            } finally {
                this.processing = false;
            }
        }
    },
    watch: {
        broadcast: {
            deep: true,
            immediate: true,
            handler(newData) {
                if (newData?.manual_guests && JSON.stringify(newData?.manual_guests) !== JSON.stringify(this.lastLoadedManualGuests)) {
                    this.manualGuests = newData.manual_guests.split("\n").map(e => createGuestObject(e));
                    this.lastLoadedManualGuests = newData.manual_guests.split("\n").map(e => createGuestObject(e));
                    this.lastSavedData = newData.manual_guests.replaceAll(",", "|");
                }
            }
        }
    }
};
</script>

<style scoped>
    .guest-row:deep(.invalid-feedback) {
        color: #ff6473;
    }
    ::placeholder {
        color: rgba(0,0,0,0.3);
    }
    .avatar-preview {
        width: 2.375em;
        height: 2.375em;
        background-color: rgba(255,255,255,0.2);
    }
    .opacity-changes {
        opacity: 1;
        transition: opacity .3s ease;
    }
    .low-opacity {
        opacity: 0.5;
        pointer-events: none;
        user-select: none;
        cursor: wait;
    }
</style>
