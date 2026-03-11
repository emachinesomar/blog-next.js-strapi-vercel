import type { Core } from "@strapi/strapi";
import { articlesData } from "./articles-data";

export const seedApp = async ({ strapi }: { strapi: Core.Strapi }) => {
  try {
    const articleCount = await strapi
      .documents("api::article.article")
      .count({});

    if (articleCount === 0) {
      strapi.log.info("Seeding articles...");

      for (const article of articlesData) {
        await strapi.documents("api::article.article").create({
          data: {
            ...article,
            publishDate: new Date(article.publishDate).toISOString(),
          },
          status: "published",
        });
      }

      strapi.log.info("Articles seeded successfully.");
    } else {
      strapi.log.info("Articles already exist, skipping seed.");
    }
  } catch (error) {
    strapi.log.error("Failed to seed articles:", error);
  }
};
