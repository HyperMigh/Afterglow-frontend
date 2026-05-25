import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import prettier from "@vue/eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "*.min.js"]
  },
  js.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2022
      },
      parserOptions: {
        parser: undefined
      }
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-debugger": "warn",
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "warn",
      "vue/component-api-style": ["error", ["script-setup", "composition"]],
      "vue/html-self-closing": [
        "error",
        {
          html: { void: "always", normal: "always", component: "always" }
        }
      ]
    }
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module"
      }
    }
  },
  {
    files: ["vite.config.js", "eslint.config.js"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  prettier
];
