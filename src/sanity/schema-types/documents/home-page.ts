import { DocumentIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      initialValue: "Homepage",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [defineArrayMember({ type: "faqItem" })],
      validation: (rule) => rule.max(12),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "faqs.0.question",
    },
    prepare(selection) {
      return {
        title: selection.title || "Homepage",
        subtitle: selection.subtitle
          ? `FAQ starts with: ${selection.subtitle}`
          : "No FAQs added yet",
      };
    },
  },
});
