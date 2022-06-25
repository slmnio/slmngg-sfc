<template>
    <div class="container">
        <h1>Profile Page</h1>
        <b-alert v-model="showAlert" dismissible variant="danger">
            {{ errorMessage }}
        </b-alert>

        <b-form class="mt-4 opacity-changes" @submit="onSubmit" :class="{'low-opacity': submitting}">

            <b-form-group label="Name" label-cols="2">
                <div class="fake-input">{{ player.name }}</div>
            </b-form-group>
            <b-form-group label="Pronouns" label-cols="2">
                <b-form-select :options="pronouns" v-model="profile.pronouns"/>
            </b-form-group>
            <b-form-group label="Pronunciation" label-cols="2">
                <b-form-input v-model="profile.pronunciation" :state="profile.pronunciation && profile.pronunciation.length > 100 ? false : null "/>
                <b-form-invalid-feedback>Please keep your pronunciation to less than 100 characters.</b-form-invalid-feedback>
            </b-form-group>
            <hr>
            <b-form-group label="Overwatch Role" label-cols="2">
                <b-form-select :options="roles" v-model="profile.role"/>
            </b-form-group>
            <b-form-group label="Favourite Hero" label-cols="2" class="hero-form-group">
                <div class="hero-image mr-2" :style="heroImage"></div>
                <b-form-select :options="heroes" v-model="profile.favourite_hero" :disabled="heroes.length === 0" />
            </b-form-group>
            <div>
                <b-button type="submit" variant="success">
                    <span v-if="submitting"><i class="fa fa-spin fa-cog fa-fw"></i> Saving</span>
                    <span v-else>Save</span>
                </b-button>
            </div>
        </b-form>
    </div>
</template>

<script>
import { BAlert, BButton, BForm, BFormGroup, BFormInput, BFormInvalidFeedback, BFormSelect } from "bootstrap-vue";
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";
import { updateProfileData } from "@/utils/dashboard";
import { resizedImage } from "@/utils/images";

export default {
    name: "ProfilePage",
    components: { BForm, BFormGroup, BFormSelect, BButton, BFormInput, BAlert, BFormInvalidFeedback },
    computed: {
        player() {
            if (!this.$root.auth.user?.airtableID) return {};
            return ReactiveRoot(this.$root.auth.user.airtableID, {

            });
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
                    value: `rec${hero.id}`,
                    text: hero.name
                }))
            }));
        },
        activeFavouriteHero() {
            if (this.profile.favourite_hero) {
                return this._heroes.find(hero => `rec${hero.id}` === this.profile.favourite_hero);
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
            "Support",
            "Tank",
            "Flex"
        ],
        profile: {
            pronouns: null,
            pronunciation: null,
            role: null,
            favourite_hero: null
        },
        submitting: false,
        errorMessage: null,
        showAlert: false
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
        heroes(newHeroes, oldHeroes) {
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
    methods: {
        async onSubmit(e) {
            this.submitting = true;
            e.preventDefault();

            console.log("save", this.profile);
            const response = await updateProfileData(this.$root.auth, this.profile);

            if (response.error) {
                this.errorMessage = response.message;
                this.showAlert = true;
            } else {
                this.errorMessage = null;
                this.showAlert = false;
            }

            this.submitting = false;
            return false;
        },
        updateProfile(data) {
            Object.entries(this.profile).forEach(([key]) => {
                if (key === "favourite_hero" && data[key]?.[0]) data[key] = data[key][0];
                if (data[key] !== this.profile[key]) {
                    this.profile[key] = data[key] || null;
                }
            });
        }
    },
    mounted() {
        this.updateProfile(this.player);
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
        background-color: rgba(255,255,255,0.1)
    }
    .hero-form-group >>> .col {
        display: flex;
    }
    hr {
        border-color: rgba(255,255,255,0.1);
    }

</style>
