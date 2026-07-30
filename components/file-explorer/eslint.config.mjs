import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

// Standalone flat config for this subpackage. It intentionally does NOT
// extend the root app's eslint.config.mjs: that config pulls in
// @next/eslint-plugin-next, whose rules (e.g. no-html-link-for-pages)
// assume a Next.js app directory structure that doesn't exist here. Without
// a local config, ESLint's flat-config lookup walks up to the root config
// and those Next-specific rules fail. See FILE_EXPLORER_ABSTRACTION.md for
// why this package isn't (yet) a fully standalone build target.
const eslintConfig = [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "storybook-static/**",
      "**/*.stories.tsx",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      // This rule (added in eslint-plugin-react-hooks v7, targeting the
      // React Compiler / concurrent-rendering era) flags the standard
      // "load data on mount via useEffect + setState" pattern used
      // throughout this codebase (see app/page.tsx, app/tier-list/[id]/page.tsx,
      // etc. at the repo root, which aren't linted by this stricter
      // plugin version). Adopting it here would require a data-fetching
      // library rewrite that's out of scope for this package; see
      // FILE_EXPLORER_ABSTRACTION.md for the package's current status.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
