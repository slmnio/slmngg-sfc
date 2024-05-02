<template>
    <div class="container" v-if="player && player.name">
        <h1>Profile Page</h1>
<!--        <b-alert v-model="showAlert" dismissible variant="danger">-->
<!--            {{ errorMessage }}-->
<!--        </b-alert>-->

        <b-form class="mt-4 opacity-changes" @submit="onSubmit" :class="{'low-opacity': submitting || isRestricted }">

            <b-form-group class="form-group" label="Name" label-cols-lg="2" label-cols-sm="3" label-cols="12">
                <div class="fake-input" v-b-tooltip.bottom="'To change your player name, send a message to #slmngg-requests or send in a ModMail.'">{{ player.name }}</div>
            </b-form-group>
            <b-form-group class="form-group" label="Battletag" label-cols-lg="2" label-cols-sm="3" label-cols="12">
                <div class="fake-input" v-b-tooltip.bottom="'To change your Battletag, send a message to #slmngg-requests or send in a ModMail.'">{{ player.battletag }}</div>
            </b-form-group>
            <b-form-group class="form-group" label="Pronouns" label-cols-lg="2" label-cols-sm="3" label-cols="12">
                <b-form-select :options="pronouns" v-model="profile.pronouns"/>
            </b-form-group>
            <b-form-group class="form-group" label="Pronunciation" label-cols-lg="2" label-cols-sm="3" label-cols="12">
                <b-form-input v-model="profile.pronunciation" :state="profile.pronunciation && profile.pronunciation.length > 100 ? false : null "/>
                <b-form-invalid-feedback>Please keep your pronunciation to less than 100 characters.</b-form-invalid-feedback>
            </b-form-group>
            <hr>
            <b-form-group class="form-group" label="Overwatch Role" label-cols-lg="2" label-cols-sm="3" label-cols="12">
                <b-form-select :options="roles" v-model="profile.role"/>
            </b-form-group>
            <b-form-group label="Favourite Hero" label-cols-lg="2" label-cols-sm="3" label-cols="12" class="image-form-group">
                <div class="w-100 d-flex gap-2">
                    <div class="hero-image" :style="heroImage"></div>
                    <b-form-select :options="heroes" v-model="profile.favourite_hero" :disabled="heroes.length === 0"/>
                </div>
            </b-form-group>
            <hr>
            <b-form-group label-cols-lg="2" label-cols-sm="3" label-cols="12" class="image-form-group">
                <template v-slot:label>
                    <b>Profile Picture</b>
                </template>
                <template v-slot:description>
                    <span class="text-white">You can set your profile picture to a team or event you were a part of.<br>Once you've saved, you can check your player page <router-link
                            :to="url('player', { id: player?.id })">here</router-link>.</span>
                </template>
                <div class="w-100 d-flex gap-2">
                    <div class="hero-image profile-theme" :style="profileTheme"></div>
                    <b-form-select :options="themesForProfile" v-model="profile.profile_picture_theme"></b-form-select>
                </div>
            </b-form-group>
            <div>
                <b-button type="submit" variant="success">
                    <span v-if="submitting"><i class="fa fa-spin fa-cog fa-fw"></i> Saving</span>
                    <span v-else-if="success"><i class="fa fa-check fa-fw"></i> Saved</span>
                    <span v-else>Save</span>
                </b-button>
            </div>
        </b-form>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { authenticatedRequest } from "@/utils/dashboard";
import { resizedImage } from "@/utils/images";
import { cleanID, getAssociatedThemeOptions, url } from "@/utils/content-utils";
import { logoBackground } from "@/utils/theme-styles";
import { mapWritableState } from "pinia";
import { useAuthStore } from "@/stores/authStore";

export default {
    name: "ProfilePage",
    computed: {
        ...mapWritableState(useAuthStore, ["auth"]),
        player() {
            if (!this.auth.user?.airtableID) return {};
            return ReactiveRoot(this.auth.user.airtableID, {
                member_of: ReactiveArray("member_of", {
                    theme: ReactiveThing("theme")
                }),
                captain_of: ReactiveArray("captain_of", {
                    theme: ReactiveThing("theme")
                }),
                team_staff: ReactiveArray("team_staff", {
                    theme: ReactiveThing("theme")
                }),
                brands_designed: ReactiveArray("brands_designed", {
                    theme: ReactiveThing("theme")
                }),
                owned_teams: ReactiveArray("owned_teams", {
                    theme: ReactiveThing("theme")
                }),
                event_staff: ReactiveArray("event_staff", {
                    theme: ReactiveThing("theme")
                }),
                event_brands_designed: ReactiveArray("event_brands_designed", {
                    theme: ReactiveThing("theme")
                }),
                casted_events: ReactiveArray("casted_events", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        themesForProfile() {
            return getAssociatedThemeOptions(this.player, (item) => item.theme?.id);
        },
        profileTheme() {
            if (!this.profile?.profile_picture_theme) return {};
            const theme = ReactiveRoot(this.profile.profile_picture_theme);
            return {
                ...logoBackground(theme),
                ...resizedImage(theme, ["default_logo", "small_logo", "default_wordmark"], "s-100")
            };
        },
        isRestricted() {
            return this.player?.website_settings?.includes("No profile editing");
        },
        _heroes() {
            const heroes = ReactiveRoot("Heroes", {
                ids: ReactiveArray("ids")
            })?.ids;

            if (!heroes?.length) return [];

            return heroes.filter(hero => hero.game === "Overwatch")
                .sort((a, b) => {
                    if (a.role > b.role) return -1;
                    if (a.role < b.role) return 1;
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
        },
        heroes() {
            if (!this._heroes?.length) return [];
            const groups = {
                DPS: [],
                Tank: [],
                Support: []
            };
            this._heroes.forEach(hero => {
                if (groups[hero.role]) groups[hero.role].push(hero);
            });

            return Object.entries(groups).map(([groupName, group]) => ({
                label: groupName,
                options: group.map(hero => ({
                    value: hero.id,
                    text: hero.name
                }))
            }));
        },
        activeFavouriteHero() {
            if (this.profile.favourite_hero) {
                return this._heroes.find(hero => hero.id === this.profile.favourite_hero);
            }
            return null;
        },
        heroImage() {
            if (!this.activeFavouriteHero?.main_image) return {};
            return resizedImage(this.activeFavouriteHero, ["main_image"], "h-76");
        }
    },
    data: () => ({
        pronouns: [
            "he/him",
            "she/her",
            "they/them",
            "he/they",
            "she/they",
            "any"
        ],
        roles: [
            "DPS",
            "Tank",
            "Support",
            "Flex"
        ],
        profile: {
            pronouns: null,
            pronunciation: null,
            role: null,
            favourite_hero: null,
            profile_picture_theme: null
        },
        submitting: false,
        errorMessage: null,
        showAlert: false,
        success: null,
        successShowTimeout: null
    }),
    watch: {
        player: {
            deep: true,
            handler(newPlayer, oldPlayer) {
                if (oldPlayer.name) console.warn("player data update", newPlayer);

                /*
                TODO: handle data from slmn.gg changing things here. either show a warning, restrict access,
                      maybe filter to see if anything important for this specific page has been changed,
                      then alert or restrict
                 */

                this.updateProfile(newPlayer);
            }
        },
        heroes: {
            deep: true,
            handler(newHeroes, oldHeroes) {
                if (newHeroes.length && JSON.stringify(newHeroes) !== JSON.stringify(oldHeroes)) {
                    const favHero = this.profile.favourite_hero;
                    if (favHero) {
                        this.profile.favourite_hero = null;
                        requestAnimationFrame(() => {
                            this.profile.favourite_hero = favHero;
                        });
                    }
                }
            }
        },
        isRestricted(restricted) {
            if (restricted) {
                this.errorMessage = "You are restricted from editing your profile.";
                this.showAlert = true;
            }
        }
    },
    methods: {
        url,
        async onSubmit(e) {
            this.submitting = true;
            e.preventDefault();

            console.log("save", this.profile);
            const response = await authenticatedRequest("actions/update-profile-data", {
                profileData: this.profile
            });

            if (response.error) {
                this.errorMessage = response.errorMessage;
                this.showAlert = true;
            } else {
                this.errorMessage = null;
                this.showAlert = false;
                this.success = true;
                if (this.successShowTimeout) clearTimeout(this.successShowTimeout);
                this.successShowTimeout = setTimeout(() => {
                    this.success = null;
                }, 3000);
            }

            this.submitting = false;
            return false;
        },
        updateProfile(data) {
            Object.entries(this.profile).forEach(([key]) => {
                if (["favourite_hero", "profile_picture_theme"].includes(key) && data[key]?.[0] && data[key]?.[0]?.startsWith("rec")) {
                    data[key] = cleanID(data[key][0]);
                }
                if (data[key] !== this.profile[key]) {
                    this.profile[key] = data[key] || null;
                }
            });
        }
    },
    mounted() {
        this.updateProfile(this.player);
        if (this.isRestricted) {
            this.errorMessage = "You are restricted from editing your profile.";
            this.showAlert = true;
        }
    }
};
</script>

<style scoped>
    .fake-input {
        height: 2em;
        display: flex;
        align-items: center;
        font-size: 1.2em;
        background-color: rgba(255,255,255,0.02);
        border-radius: .25rem;
        padding: 0 .5em;
        cursor: not-allowed;
    }
    .opacity-changes {
        opacity: 1;
        transition: opacity .3s ease;
    }
    .low-opacity {
        opacity: 0.5;
        pointer-events: none;
        cursor: wait;
    }


    .hero-image {
        display: flex;
        height: 38px;
        width: 41px;
        background-position-x: center;
        background-repeat: no-repeat;
        flex-shrink: 0;
        border-radius: 4px;
        background-color: rgba(255,255,255,0.1);
        background-size: 100%;
    }
    .profile-theme {
        background-size: 70%;
        background-position: center;
        width: 38px;
    }
    hr {
        border-color: rgba(255,255,255,0.1);
    }
    .form-group {
        margin-bottom: 0.5em;
    }
    .image-form-group:deep(.custom-select) {
        width: auto;
        flex-grow: 1;
    }
    .image-form-group:deep(small) {
        width: 100%;
    }
</style>
