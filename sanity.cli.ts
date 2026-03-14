import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "e118pybb",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  },
  typegen: {
    enabled: true,
    path: "./src/**/*.{ts,tsx}",
    schema: "./schema.json",
    generates: "./sanity.types.ts",
  },
});
