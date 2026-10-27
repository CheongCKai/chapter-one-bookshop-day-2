import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules", "coverage", ".github/skills/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["public/**/*.js"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        Map: "readonly",
      },
    },
  },
);
