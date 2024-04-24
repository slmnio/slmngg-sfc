require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
    root: true,
    "extends": [
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/eslint-config-standard"
    ],
    parserOptions: {
        ecmaVersion: "latest"
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unused-vars": [
            "warn"
        ],
        "no-multiple-empty-lines": ["warn", { "max": 2 }],
        "no-trailing-spaces": ["warn"],
        "space-before-function-paren": "off",
        "no-throw-literal": "off",
        "vue/multi-word-component-names": "off"
    }
};
