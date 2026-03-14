import { defineQuery } from "next-sanity";

export const BLOG_POSTS_QUERY = defineQuery(`
  *[_type == "blogPost" && defined(slug.current)]
  | order(publishedAt desc){
    _id,
    title,
    excerpt,
    publishedAt,
    "slug": slug.current,
    coverImage{
      alt,
      asset->{
        _id,
        url,
        metadata {
          dimensions {
            width,
            height
          },
          lqip
        }
      },
      hotspot,
      crop
    }
  }
`);

export const BLOG_POST_SLUGS_QUERY = defineQuery(`
  *[_type == "blogPost" && defined(slug.current)]{
    "slug": slug.current
  }
`);

export const BLOG_POST_QUERY = defineQuery(`
  *[_type == "blogPost" && slug.current == $slug][0]{
    _id,
    title,
    excerpt,
    publishedAt,
    "slug": slug.current,
    coverImage{
      alt,
      asset->{
        _id,
        url,
        metadata {
          dimensions {
            width,
            height
          },
          lqip
        }
      },
      hotspot,
      crop
    },
    body[]{
      ...,
      _type == "image" => {
        alt,
        caption,
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height
            },
            lqip
          }
        },
        hotspot,
        crop
      }
    }
  }
`);

export const HOME_PAGE_FAQS_QUERY = defineQuery(`
  *[_type == "homePage"] | order(_updatedAt desc)[0]{
    _id,
    faqs[]{
      _key,
      "title": question,
      "copy": answer
    }
  }
`);

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0]{
    _id,
    siteTitle,
    siteDescription,
    seo {
      metaTitle,
      metaDescription,
      shareImage {
        alt,
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height
            },
            lqip
          }
        },
        hotspot,
        crop
      }
    }
  }
`);
