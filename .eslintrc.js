module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:vue/essential",
        "@vue/standard",
        "prettier",
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
        parser: "babel-eslint",
    },
    rules: {
        "no-unused-vars": ["warn"],
        "no-multiple-empty-lines": ["warn", { max: 2 }],
        "no-trailing-spaces": ["warn"],
        "space-before-function-paren": "off",
    },
};
