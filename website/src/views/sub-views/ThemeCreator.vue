<template>
    <div class="theme-creator container d-flex flex-column gap-3">
        <h1>Theme Creator</h1>

        <div class="top-bar d-flex gap-3">
            <div ref="dropZoneRef" class="dropzone flex-center image-box image-box-size" :class="{'hovered': isOverDropZone}">
                <b-button variant="primary" type="button" @click="open">
                    Choose or drop file
                </b-button>
                <b-button size="sm" variant="danger" type="button" @click="emptyImages">
                    Reset creator
                </b-button>
            </div>

            <div class="files d-flex gap-3">
                <div
                    v-for="(blob, i) in blobs"
                    :key="blob.name"
                    class="file image-box-size"
                    :class="{'selected': selectedImageIndex === i}">
                    <img
                        class="blob-image image-box"
                        :src="blob.url"
                        alt=""
                        @click="selectedImageIndex = i">
                    <div class="image-options">
                        <b-button-group>
                            <!-- <b-button :variant="selectedImageIndex === i ? 'primary' : 'secondary'">-->
                            <!--     <i class="fas fa-star fa-fw"></i>-->
                            <!-- </b-button>-->
                        </b-button-group>
                        <b-button-group>
                            <b-button :variant="blob.isCropped ? 'success' : 'secondary'" @click="downloadFile(selectedImage)">
                                {{ blob.isCropped ? 'Cropped' : '' }} <i class="fas fa-download fa-fw"></i>
                            </b-button>
                        </b-button-group>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="selectedImage" class="image-crop-bar d-flex gap-3">
            <div class="image-section">
                <img :src="selectedImage.url" alt="">
            </div>
            <div class="color-selectors d-flex flex-column gap-2">
                <div class="basic-colors d-flex gap-2">
                    <div>Basic colours</div>
                    <div v-for="col in ['#000000', '#333333', '#CCCCCC', '#FFFFFF']" :key="col" class="color rounded" :style="{backgroundColor: col}"></div>
                </div>

                <b-form-checkbox v-model="removeHashInHex" switch>Remove hash from hex codes</b-form-checkbox>
                <div class="theme-eyedropper-container p-1">
                    <ThemeEyeDropper v-model="theme" title="Theme" />
                    <div class="description">A single colour that identifies the brand.</div>
                </div>
                <div class="theme-eyedropper-container p-1">
                    <div class="d-flex gap-2 flex-center">
                        <ThemeEyeDropper v-model="text_on_theme" title="Text on theme" />
                        <ContrastBadge class="contrast-badge px-2 rounded" :colors="[theme, text_on_theme]" />
                    </div>
                    <div class="description">Colour for text on the primary theme colour. Must pass contrast checks.</div>
                </div>

                <div class="theme-eyedropper-container p-1 mt-2">
                    <ThemeEyeDropper v-model="logo_background" title="Logo Background" />
                    <div class="description">Background colour for all theme logos. Should represent the brand if possible, preferring brand colours to white or black.</div>
                </div>
                <div class="theme-eyedropper-container p-1 mb-2">
                    <div class="d-flex gap-2 flex-center">
                        <ThemeEyeDropper v-model="text_on_logo_background" title="Text on Logo Background" />
                        <ContrastBadge class="contrast-badge px-2 rounded" :colors="[logo_background, text_on_logo_background]" />
                    </div>
                    <div class="description">Colour for text on the logo background colour. Must pass contrast checks.</div>
                </div>
                <div class="theme-eyedropper-container p-1">
                    <ThemeEyeDropper v-model="logo_accent" title="Logo Accent" />
                    <div class="description">Third colour used as an accent across components. Should be a brand colour, but cannot be the logo background color.</div>
                </div>

                <div class="d-flex">
                    <CopyTextButton
                        class="bg-secondary px-2 rounded"
                        :content="[theme, text_on_theme, logo_background, text_on_logo_background, logo_accent].join('\t')">
                        Copy all
                    </CopyTextButton>
                </div>

                <ThemeLogo
                    :theme="themeObject"
                    :custom-u-r-l="selectedImage?.url" />
            </div>
        </div>
        <!--        <div class="theme-testing d-flex gap-3 w-100">-->
        <!--            <div class="theme-combo">-->
        <!--                <div class="title">Single brand colour</div>-->
        <!--                <div class="flex-center">-->
        <!--                    <div class="one-color" :style="themeBackground(themeObject)"></div>-->
        <!--                </div>-->
        <!--            </div>-->
        <!--            <div class="theme-combo">-->
        <!--                <div class="title">Two-colour pair</div>-->
        <!--                <div class="two-color flex-center p-2 fw-bold" :style="themeBackground(themeObject)">-->
        <!--                    Team Name-->
        <!--                </div>-->
        <!--            </div>-->
        <!--            <div class="theme-combo">-->
        <!--                <div class="title">Logo on three-color set</div>-->
        <!--                <div class="three-color flex-center">-->
        <!--                    <ThemeLogo :theme="themeObject" :custom-u-r-l="selectedImage?.url" />-->
        <!--                </div>-->
        <!--            </div>-->
        <!--        </div>-->


        <ThingTheme
            :team="teamObject"
            :no-images="true" />
    </div>
</template>

<script>
import { Image } from "image-js";
import { ref } from "vue";
import { useDropZone, useFileDialog  } from "@vueuse/core";
import ThemeEyeDropper from "@/components/ThemeEyeDropper.vue";
import { logoBackground, themeBackground } from "@/utils/theme-styles.js";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import ContrastBadge from "@/components/website/ContrastBadge.vue";
import { mapWritableState } from "pinia";
import { useSettingsStore } from "@/stores/settingsStore.ts";
import { calculateContrastHex } from "@/utils/content-utils.js";
import ThingTheme from "@/views/sub-views/ThingTheme.vue";
import CopyTextButton from "@/components/website/CopyTextButton.vue";

export default {
    name: "ThemeCreator",
    components: { CopyTextButton, ThingTheme, ContrastBadge, ThemeEyeDropper },
    setup() {
        const loadedFiles = ref([]);
        const dropZoneRef = ref();
        const selectedImageIndex = ref(-1);
        console.log(dropZoneRef);

        async function addFiles(newFiles) {
            for (const newFile of newFiles) {
                const { isCropped, croppedImage } = await cropImage(newFile);

                loadedFiles.value.push({
                    isCropped,
                    file: croppedImage,
                    name: newFile.name
                });

            }
            selectedImageIndex.value = loadedFiles.value.length - 1;
        }

        function onDrop(files) {
            // called when files are dropped on zone
            console.log(files);
            addFiles(files);
        }

        const { isOverDropZone } = useDropZone(dropZoneRef, {
            onDrop,
            // specify the types of data to be received.
            dataTypes: ["image/png"],
            // control multi-file drop
            multiple: true,
            // whether to prevent default behavior for unhandled events
            preventDefaultForUnhandled: false,
        });

        const { files, open, reset, onCancel, onChange } = useFileDialog({
            accept: "image/png", // Set to accept only image files
            directory: false, // Select directories instead of files if set true
        });

        onChange((files) => {
            addFiles(files);
        });

        const output = ref();

        async function cropImage(file) {
            console.log("crop img");
            const image = await Image.load(await file.arrayBuffer());
            console.log("crop", image);

            const cropped = image.cropAlpha({ threshold: 1 });
            console.log("cropped", cropped, cropped.width, cropped.height);
            console.log(output);
            return {
                isCropped: cropped.width !== image.width || cropped.height !== image.height,
                croppedImage: await cropped.toBlob("image/png", 1)
            };
        }

        return { isOverDropZone, dropZoneRef, output, loadedFiles, open, selectedImageIndex };
    },
    data: () => ({
        theme: "",
        text_on_theme: "",
        logo_background: "",
        text_on_logo_background: "",
        logo_accent: "",
    }),

    computed: {
        ...mapWritableState(useSettingsStore, ["removeHashInHex"]),
        blobs() {
            return this.loadedFiles.map(file => {
                console.log("blobs file", file);
                return {
                    ...file,
                    url: URL.createObjectURL(file.file)
                };
            });
        },
        selectedImage() {
            if (this.selectedImageIndex === -1) return null;
            return this.blobs[this.selectedImageIndex];
        },
        themeObject() {
            return {
                color_theme: this.theme,
                color_text_on_theme: this.text_on_theme,
                color_logo_background: this.logo_background,
                color_text_on_logo_background: this.text_on_logo_background,
                color_logo_accent: this.logo_accent,
                id: "theme-creator",
                ...(this.selectedImage?.url ? {
                    default_logo: [{
                        custom_url: this.selectedImage?.url,
                        id: "theme-creator"
                    }]
                }: {} )
            };
        },
        teamObject() {
            return {
                name: "Team Name",
                code: "TN",
                theme: this.themeObject
            };
        }
    },
    methods: {
        logoBackground,
        themeBackground,
        downloadFile(image) {
            console.log("image download file", image);
            const a = document.createElement("a");
            a.href = image.url;
            if (image.isCropped) {
                a.download = image.name.replace(".png", "_cropped.png");
            } else {
                a.download = image.name;
            }
            a.click();
        },
        emptyImages() {
            this.blobs.forEach(file => {
                console.log("revoke url", file.url);
                URL.revokeObjectURL(file.url);
            });
            this.loadedFiles = [];
            this.selectedImageIndex = -1;

            this.theme = "";
            this.text_on_theme = "";
            this.logo_background = "";
            this.text_on_logo_background = "";
            this.logo_accent = "";
        }
    },
    watch: {
        theme(color) {
            console.log("theme change", color);
            if (!this.text_on_theme) {
                this.text_on_theme = calculateContrastHex(color, "#FFFFFF") > calculateContrastHex(color, "#000000") ? "#FFFFFF": "#000000";
            }
            if (!this.logo_background) {
                this.logo_background = color;
            }
        },
        text_on_theme(color) {
            console.log("text_on_theme change", color);
            if (!this.logo_accent) {
                this.logo_accent = color;
            }
            if (this.theme === this.logo_background) {
                this.text_on_logo_background = color;
            }
        },
        color_logo_background(color) {
            console.log("color_logo_background change", color);
            if (!this.text_on_logo_background) {
                this.text_on_logo_background = calculateContrastHex(color, "#FFFFFF") > calculateContrastHex(color, "#000000") ? "#FFFFFF": "#000000";
            }
        },
    }
};
</script>

<style scoped>
    .image-box-size {
        width: 15em;
        height: 10em;
    }
    .image-box {
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: .5em;
    }
    .selected .image-box,
    .image-box.hovered {
        border: 1px solid rgba(255,255,255,0.5);
    }
    .file.image-box-size {
        display: flex;
        flex-direction: column;
    }


    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .image-crop-bar .image-section {
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: .5em;
        width: 50%;
        flex-shrink: 0;
    }

    .title {
        font-weight: bold;
        width: 100%;
        text-align: center;
        font-size: 1.25em;
        margin: 0.5em 0;
    }

    .theme-combo {
        flex-grow: 1;
    }
    .theme-eyedropper-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
    }
    .contrast-badge {
        font-weight: bold;
    }
    .description {
        opacity: 0.5;
    }
    .one-color {
        width: 4em;
        height: 4em;
        border-radius: 50%;
    }

    .basic-colors {
        align-items: center;
    }
    .basic-colors .color {
        width: 2em;
        height: 1.75em;
    }

    img.blob-image {
        flex-grow: 1;
        height: 0;
        margin-bottom: .5em;
        cursor: pointer;
    }
    .image-options {
        display: flex;
        justify-content: space-between;
    }
    .dropzone {
        flex-direction: column;
        gap: .5em;
    }
</style>
