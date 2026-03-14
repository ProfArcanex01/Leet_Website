import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId, studioUrl } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schema-types";

export default defineConfig({
  name: "default",
  title: "Leet Sanity Studio",
  basePath: studioUrl,
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
