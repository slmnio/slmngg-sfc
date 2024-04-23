import createVuePlugin from "@vitejs/plugin-vue";
import dns from "dns";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import Components from "unplugin-vue-components/vite";
import { BootstrapVueNextResolver } from "unplugin-vue-components/resolvers";

// make sure we use localhost instead of 127.0.0.1
dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        createVuePlugin({
            template: {
                compilerOptions: {
                    compatConfig: {
                        MODE: 3
                    }
                }
            }
        }),
        Components({
            resolvers: [BootstrapVueNextResolver()]
        })
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            vue: "@vue/compat"
        },
        extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
    }
});
