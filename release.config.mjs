/*
TO Setup semantic release:

1. run
bun i -D semantic-release @semantic-release/changelog

2. copy ./release.config.mjs

3. copy ./.github/workflows/release.yml

4. npm pkg set scripts.prepack="npm run build"

5. goto https://github.com/${REPO}/settings/actions, allow actions write to workflows

6. set NPM_TOKEN in repo secrets

*/

/**
 * @type {import('semantic-release').GlobalConfig}
 */
const config = {
    branches: [
      "+([0-9])?(.{+([0-9]),x}).x",
      "main",
      "next",
      "next-major",
      { name: "beta", prerelease: true },
      { name: "alpha", prerelease: true },
    ],
    plugins: [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github",
    ],
  };

  export default config;
