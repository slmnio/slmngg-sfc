import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";


export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs["flat/strongly-recommended"],
    {
        ignores: [
            "server/src/_deprecated/**/*",
            "website/dist/**/*",
            "website/components.d.ts",
            "website/vite.config.mjs"
        ]
    },
    {
        plugins: {
            'typescript-eslint': tseslint.plugin,
        },
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
                project: 'website/tsconfig.json',
                extraFileExtensions: ['.vue'],
                sourceType: 'module',
            },
        },
        files: [
            "website/**/*.ts"
        ]
    },
    {
        files: [
            "**/*.vue",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs",
            "**/*.ts",
            "**/*.tsx",
            "**/*.cts",
            "**/*.mts"
        ],
        languageOptions: {
            ecmaVersion: "latest",
        }
    },
    {
        files: ["server/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.node,
            }
        },
        rules: {
            "@typescript-eslint/no-var-requires": "off",
        }
    },
    {
        files: ["**/*.js", "**/*.vue", "**/*.ts"],
        rules: {
            "linebreak-style": [
                "error",
                "unix"
            ],

            "indent": [
                "error",
                4
            ],
            "@typescript-eslint/indent": "off",

            "quotes": [
                "error",
                "double"
            ],
            "@typescript-eslint/quotes": "off",

            "semi": [
                "error",
                "always"
            ],
            "@typescript-eslint/semi": "off",

            "no-unused-vars": [
                "warn"
            ],
            "@typescript-eslint/no-unused-vars": "off",

            "no-empty": "warn",

            "no-multiple-empty-lines": ["warn", { "max": 2 }],
            "no-trailing-spaces": ["warn"],
            "space-before-function-paren": "off",
            "no-throw-literal": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/space-before-function-paren": "off",
            "@typescript-eslint/return-await": "off",

            // useful if we ts-ify everything, but not now
            "@typescript-eslint/strict-boolean-expressions": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/restrict-plus-operands": "off",
            "@typescript-eslint/promise-function-async": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "vue/block-lang": "off",

            // good to go through eventually
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/no-implied-eval": "off",

            // vue specific stuff
            "vue/multi-word-component-names": "off",
            "vue/html-indent": ["error", 4],
            "vue/max-attributes-per-line": ["error", {
                "singleline": {
                    "max": 4
                },
                "multiline": {
                    "max": 1
                }
            }],
            "vue/singleline-html-element-content-newline": "off",
            "vue/require-prop-types": "off",
            "vue/require-default-prop": "off",
            "vue/html-closing-bracket-newline": "off",
            "vue/html-self-closing": ["error", {
                "html": {
                    "void": "never",
                    "normal": "never",
                    "component": "always"
                },
                "svg": "always",
                "math": "always"
            }],
            "vue/attributes-order": "error",
            "vue/order-in-components": ["error", {
                "order": [
                    "el",
                    "name",
                    "key",
                    "parent",
                    "functional",
                    ["delimiters", "comments"],
                    ["components", "directives", "filters"],
                    "extends",
                    "mixins",
                    ["provide", "inject"],
                    "ROUTER_GUARDS",
                    "layout",
                    "middleware",
                    "validate",
                    "scrollToTop",
                    "transition",
                    "loading",
                    "inheritAttrs",
                    "model",
                    ["props", "propsData"],
                    "emits",
                    "setup",
                    "asyncData",
                    "data",
                    "fetch",
                    "computed",
                    "methods",
                    "watch",
                    "sockets",
                    "watchQuery",
                    "LIFECYCLE_HOOKS",
                    ["template", "render"],
                    "renderError",
                    "head",
                ]
            }]
        },
        languageOptions: {
            ecmaVersion: "latest"
        }
    }
];
