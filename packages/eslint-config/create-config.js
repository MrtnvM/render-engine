import antfu from "@antfu/eslint-config";
import { globalIgnores } from "eslint/config";

export default function createConfig(options, ...userConfigs) {
  return antfu(
    {
      type: "app",
      typescript: true,
      formatters: true,
      stylistic: {
        indent: 2,
        semi: true,
        quotes: "double",
      },
      ...options,
    },
    {
      rules: {
        "ts/consistent-type-definitions": ["off"],
        "ts/method-signature-style": ["off"],
        "antfu/no-top-level-await": ["off"],
        "node/prefer-global/process": ["off"],
        "node/no-process-env": ["error"],
        "perfectionist/sort-exports": ["off"],
        "perfectionist/sort-objects": ["off"],
        "perfectionist/sort-keys": ["off"],
        "perfectionist/sort-classes": ["off"],
        "perfectionist/sort-imports": ["off"],
        "perfectionist/sort-interfaces": ["off"],
        "perfectionist/sort-enums": ["off"],
        "perfectionist/sort-types": ["off"],
        "perfectionist/sort-type-aliases": ["off"],
        "perfectionist/sort-type-imports": ["off"],
        "perfectionist/sort-named-imports": ["off"],
        "perfectionist/sort-type-exports": ["off"],
        "perfectionist/sort-named-exports": ["off"],
        "style/indent-binary-ops": ["off"],
        "unicorn/filename-case": [
          "error",
          {
            case: "kebabCase",
            ignore: ["README.md", "CLAUDE.md"],
          },
        ],
        "style/operator-linebreak": ["off"],
        "style/arrow-parens": ["error", "always"],
        "no-console": ["off"],
        "format/prettier": ["off"],
        "antfu/if-newline": ["off"],
        "style/brace-style": ["off"],
      },
    },
    globalIgnores(["**/migrations/**/*.json", "**/migrations/**/*.sql"]),
    ...userConfigs,
  );
}
