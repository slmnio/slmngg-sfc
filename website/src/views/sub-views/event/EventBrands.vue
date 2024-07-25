<template>
    <div class="container event-brands">
        <div v-for="group in groupedTeams" :key="group.name">
            <h2 class="mb-3">
                <b-form-checkbox v-model="selectedGroupChecks[group.name]">{{ group.name }}</b-form-checkbox>
            </h2>
            <div class="row">
                <router-link v-for="team in group.teams" :key="team.id" :to="`/team/${team.id}/theme`" class="brand no-link-style ct-passive text-center col-xl-2 col-md-3 col-sm-6 mb-3">
                    <ThemeLogo class="brand-logo" :theme="team.theme" logo-size="w-200" border-width="6" />
                    <div class="theme-title py-1">{{ team.name }}</div>
                </router-link>
            </div>
        </div>


        <h2>Download center</h2>
        <b-button :variant="selectedTeams.length === 0 ? 'danger' : 'secondary'" size="sm" @click="selectAll">
            {{ selectedTeams.length }} team{{ selectedTeams.length === 1 ? "" : "s" }} selected
        </b-button>

        <div class="d-flex">
            <div class="download-selectors d-flex flex-column gap-2">
                <b-form-group
                    class="form-group"
                    label="Logo type"
                    label-cols-lg="2"
                    label-cols-sm="3"
                    :validated="!!download.logoType"
                    label-cols="12">
                    <b-form-select v-model="download.logoType" :options="logoTypes" />
                    <BFormInvalidFeedback :state="!(download.logoType && selectedTeams.length === 0)">
                        No teams are selected
                    </BFormInvalidFeedback>
                </b-form-group>
                <b-form-group
                    class="form-group"
                    label="Use fallbacks"
                    label-cols-lg="2"
                    label-cols-sm="3"
                    description="Uses a different logo if your selected logo type is not available, so every team has a logo downloaded."
                    label-cols="12">
                    <b-form-checkbox v-model="download.useFallbacks" size="lg" />
                </b-form-group>
                <b-form-group
                    class="form-group"
                    label="Theme background"
                    label-cols-lg="2"
                    label-cols-sm="3"
                    description="Creates a square image using the team's theme colours, placing the logo on top."
                    label-cols="12">
                    <b-form-checkbox v-model="download.useThemeBackground" size="lg" />
                </b-form-group>

                <b-form-group
                    v-if="!download.useThemeBackground"
                    class="form-group mb-3"
                    label="Original size"
                    label-cols-lg="2"
                    label-cols-sm="3"
                    description="Download the full size image stored, regardless of its size."
                    label-cols="12">
                    <b-form-checkbox v-model="download.downloadOrig" size="lg" />
                </b-form-group>

                <b-form-group
                    v-if="!download.downloadOrig || download.useThemeBackground"
                    class="form-group"
                    label="Image resizing"
                    label-cols-lg="2"
                    label-cols-sm="3"
                    :description="download.useThemeBackground ? `Size of the square theme image.` : `Choosing width or height will set that side to your input length, with the other side following the aspect ratio of the image. Choosing square will create a square image, scaling the image so it fits inside the square. All options may grow or shrink an image to match the request.`"
                    label-cols="12">
                    <div class="d-flex gap-2">
                        <b-form-input
                            v-model="download.resizingNum"
                            type="number"
                            placeholder="Size"
                            min="10"
                            invalid-feedback="Need a size"
                            max="3000"
                            :state="download.resizingNum>=10 && download.resizingNum <=3000"
                            step="1" />
                        <b-form-select
                            v-if="!download.useThemeBackground"
                            v-model="download.resizing"
                            :options="downloadOptions.resizing" />
                    </div>
                    <BFormInvalidFeedback :state="download.resizingNum>=10 && download.resizingNum <=3000">
                        Image size is required and must be between 10px and 3000px
                    </BFormInvalidFeedback>
                </b-form-group>
                <b-form-group
                    v-if="download.useThemeBackground"
                    class="form-group"
                    label="Image padding"
                    label-cols-lg="2"
                    label-cols-sm="3"
                    description="% of the image that is padding. 50% padding is 25% from all directions, and the logo itself is maximum 50% width/height"
                    label-cols="12">
                    <div class="d-flex gap-2">
                        <b-form-input
                            v-model="download.paddingNum"
                            type="number"
                            placeholder="Size"
                            :state="download.paddingNum>=0 && download.paddingNum < 100"
                            min="0"
                            max="99"
                            step="1" />
                    </div>
                    <BFormInvalidFeedback :state="download.paddingNum>=0 && download.paddingNum < 100">
                        Padding must be between 0-99%
                    </BFormInvalidFeedback>
                </b-form-group>
            </div>
            <div class="download-preview d-none d-lg-block">
                <h3>Preview</h3>
                <div class="preview-image">
                    <img v-if="previewImageURL" :src="previewImageURL">
                </div>
            </div>
        </div>

        <b-button variant="success" :disabled="!logoURLs?.length || downloadZipProcesing" @click="downloadImagesZip"><loading-icon v-if="downloadZipProcesing" /> Download as zip</b-button>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import { getDataServerAddress } from "@/utils/fetch";
import { downloadZip } from "client-zip";
import LoadingIcon from "@/components/website/LoadingIcon.vue";

export default {
    name: "EventBrands",
    components: { LoadingIcon, ThemeLogo },
    props: ["event"],
    data: () => ({
        selectedGroupChecks: {},
        downloadZipProcesing: false,

        download: {
            logoType: "default_logo",
            resizing: "s",
            resizingNum: 500,
            paddingNum: 20
        },
        downloadOptions: {
            resizing: [
                {
                    value: null,
                    text: "Choose a resize type",
                    disabled: true
                },
                {
                    value: "s",
                    text: "Square"
                },
                {
                    value: "w",
                    text: "Width"
                },
                {
                    value: "h",
                    text: "Height"
                }
            ]
        }
    }),
    computed: {
        logoTypes() {

            const counts = {
                "default_logo": 0,
                "wordmark_logo": 0,
                "small_logo": 0,
            };

            this.selectedTeams.forEach(team => {
                if (!team?.theme) return;
                Object.keys(counts).forEach(key => {
                    if (team.theme?.[key]) counts[key]++;
                });
            });

            return [
                {
                    value: null,
                    text: "Choose a logo type",
                    disabled: true
                },
                ...Object.entries(counts).map(([key, count]) => ({
                    value: key,
                    text: `${key.split("_")[0]} (${count})`
                }))
            ];

        },
        selectedGroupNames() {
            return Object.entries(this.selectedGroupChecks || {}).filter(([name, selected]) => selected).map(([name]) => name);
        },
        selectedGroups() {
            return this.selectedGroupNames.map(name => this.groupedTeams.find(g => g.name === name));
        },
        selectedTeams() {
            return this.selectedGroups.map(g => g.teams).flat();
        },
        formats() {

            let fileFormat = getDataServerAddress();
            let filenameFormat = "";
            if (this.download.useThemeBackground) {
                console.log("theme background", this.download);
                if (!this.download.resizingNum) return [];
                console.log("theme background 2");
                fileFormat += `/theme.png?size=${this.download.resizingNum}&padding=${this.download.paddingNum || 0}`;
                filenameFormat += `theme-${this.download.resizingNum}-p${this.download.paddingNum || 0}-`;
            } else {
                fileFormat += "/image.png";
                filenameFormat += "image-";
                if (this.download.downloadOrig) {
                    fileFormat += "?size=orig";
                    filenameFormat += "orig-";
                } else {
                    if (!this.download.resizing || !this.download.resizingNum) return [];
                    const resizeCode = `${this.download.resizing}-${this.download.resizingNum}`;
                    fileFormat += `?size=${resizeCode}`;
                    filenameFormat += `${resizeCode}-`;
                }
            }
            return {
                fileFormat,
                filenameFormat
            };
        },
        logoURLs() {
            const urls = [];
            if (!this.download.logoType) return [];

            this.selectedTeams.forEach(team => {
                if (!team?.theme) return;
                const { fileFormat, filenameFormat } = this.formats;

                let att = team.theme?.[this.download.logoType]?.[0];
                let teamLogoType;

                if (att) {
                    teamLogoType = `${this.download.logoType.split("_")[0]}`;
                }
                if (!att && this.download.useFallbacks) {
                    att = team.theme?.default_logo?.[0];
                    teamLogoType = "default";
                }

                if (att) {
                    console.log(att);
                    if (this.download.useThemeBackground) {
                        urls.push({
                            filename: `${filenameFormat}${team.code || ""}-${teamLogoType}-${att.id}.${att.fileExtension}`.replace(/-+/g, "-"),
                            url: `${fileFormat}&type=${teamLogoType}&id=${team.theme.id}`
                        });
                    } else {
                        urls.push({
                            filename: `${filenameFormat}${team.code || ""}-${teamLogoType}-${att.id}.${att.fileExtension}`.replace(/-+/g, "-"),
                            url: `${fileFormat}&id=${att.id}`
                        });
                    }
                }
            });

            return urls;
        },
        previewImageURL() {
            if (!this.logoURLs?.length) return null;
            return this.logoURLs?.[Math.floor(Math.random() * this.logoURLs.length)]?.url;
        },
        groupedTeams() {
            if (!(this.event?.teams?.length)) return null;
            const categories = [];
            this.event.teams.forEach(team => {
                let categoryName = team.team_category;
                let categoryPosition = null;

                if (!categoryName) {
                    // default to other group
                    categoryName = "-1;Other";
                }

                if (categoryName.includes(";")) {
                    // custom ordering
                    categoryName = categoryName.split(";");
                    categoryPosition = parseInt(categoryName.shift());
                    categoryName = categoryName.join(" ");
                }

                if (!categories.find(category => category.name === categoryName)) {
                    categories.push({ name: categoryName, teams: [], position: categoryPosition });
                }

                categories.find(category => category.name === categoryName).teams.push(team);
            });
            return categories.sort((a, b) => {
                if (a.position === b.position) {
                    return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
                }
                return a.position - b.position;
            });
        }
    },
    methods: {
        async downloadImagesZip() {
            if (!this.logoURLs?.length) return null;
            this.downloadZipProcesing = true;
            const { filenameFormat } = this.formats;
            try {
                const images = await Promise.all(
                    this.logoURLs.map(l => new Promise((resolve, reject) =>
                        fetch(l.url).then(image => {
                            resolve({
                                input: image,
                                name: l.filename
                            });
                        }).catch(reject)
                    )));

                console.log(images);
                const blob = await downloadZip(images).blob();
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `logos-${(this.event.short || this.event.name).toLowerCase().replaceAll(" ", "-")}-${filenameFormat}.zip`.replace(/-+/g,"-").replace("-.zip",".zip");
                link.click();
                link.remove();
            } catch (e) {
                console.error(e);
            } finally {
                this.downloadZipProcesing = false;
            }
        },
        selectAll() {
            this.selectedGroupChecks = {};
            this.groupedTeams.forEach(group => this.selectedGroupChecks[group.name] = true);
        }
    },
    head() {
        return {
            title: "Brands"
        };
    }
};
</script>

<style scoped>
    .brand-logo {
        height: 120px;
        width: 100%;
    }
    .brand-logo:deep(.icon) {
        width: calc(100% - 36px) !important;
    }
    .theme-title {
        line-height: 1;
    }
    .event-brands:deep(.form-check input) {
        font-size: 0.9em !important;
    }
    .form-group:deep(.row) {
        width: 100%;
    }
    .form-group:deep(small.form-text) {
        display: block;
    }

    .preview-image img {
        max-width: 400px;
        max-height: 500px;
        border: 1px solid white;
    }

    .download-preview {
        width: 400px;
        flex-shrink: 0;
    }

</style>
