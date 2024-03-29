/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...require("@local/eslint-config/generate-workspace-config.cjs")(__dirname),
  overrides: [
    {
      files: ["src/app.ts"],
      rules: {
        "no-console": "off",
      },
    },
    {
      files: ["src/dev.tsx"],
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          { devDependencies: true },
        ],
      },
    },
  ],
};
