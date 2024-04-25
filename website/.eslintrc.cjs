require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
    root: true,
    "extends": [
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/eslint-config-standard-with-typescript"
    ],
    parserOptions: {
        ecmaVersion: "latest"
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "@typescript-eslint/indent": "off",
        "linebreak-style": [
            "error",
            "unix"
        ],
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
        "no-multiple-empty-lines": ["warn", { "max": 2 }],
        "no-trailing-spaces": ["warn"],
        "space-before-function-paren": "off",
        "no-throw-literal": "off",
        "vue/multi-word-component-names": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/space-before-function-paren": "off",
        "@typescript-eslint/strict-boolean-expressions": "off"
    }
};
