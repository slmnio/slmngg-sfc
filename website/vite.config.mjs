import createVuePlugin from "@vitejs/plugin-vue";
import dns from "dns";
import { fileURLToPath, URL } from "url";
import { defineConfig, loadEnv } from "vite";
import Components from "unplugin-vue-components/vite";
import {BootstrapVueNextResolver} from 'bootstrap-vue-next'
import vueDevTools from 'vite-plugin-vue-devtools'


// make sure we use localhost instead of 127.0.0.1
dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    return {
        plugins: [
            createVuePlugin(),
            vueDevTools({ launchEditor: "webstorm" }),
            Components({
                resolvers: [BootstrapVueNextResolver()]
            })
        ],
        build: {
            assetsInlineLimit: 0,
        },
        experimental: {
            renderBuiltUrl(filename) {
                const assetBase = (env?.VITE_BASE_URL || "") + "/";
                return assetBase + filename;
            },
        },
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
            extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
        },
        define: {
            __VUE_PROD_DEVTOOLS__: ["local", "staging"].includes(mode)
        },
        esbuild: {
            supported: {
                "top-level-await": true
            }
        }
    };
});
