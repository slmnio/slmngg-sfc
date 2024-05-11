<template>
    <div class="cams-wrapper">
        <router-view
            id="overlay"
            :broadcast="broadcast"
            :title="title"
            :params="stringify(paramsWithDefaults)"
            :client="client"
        />
    </div>
</template>

<script>
export default {
    name: "CamsWrapper",
    props: ["broadcast", "title", "params", "client"],
    computed: {
        paramsWithDefaults() {
            const defaultParams = this.paramObject("bitrate=400");
            const broadcastParams = this.paramObject(this.broadcast?.cams_default_params);
            const localParams = this.paramObject(this.params);

            // Not sure if it should just use one set or have it cascade like this
            return {
                ...defaultParams,
                ...broadcastParams,
                ...localParams
            };
        }
    },
    methods: {
        paramObject(str) {
            if (typeof str === "string") str = str.split(",");
            const obj = {};
            if (!str) return {};
            str.forEach(item => {
                const [key, val] = item.split("=");
                if (!key) obj[key] = null;
                obj[key] = val;
            });
            return obj;
        },
        stringify(obj) {
            if (!obj) return "";
            return "&" + Object.entries(obj).map(item => item.filter(x => x).join("=")).join("&");
        }
    }
};
</script>

<style scoped>

</style>
