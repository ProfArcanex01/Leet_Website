const fallbackProjectId = "e118pybb";
const fallbackDataset = "production";

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-14";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || fallbackDataset;

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || fallbackProjectId;

export const studioUrl = "/studio";

export const useCdn = process.env.NODE_ENV === "production";
