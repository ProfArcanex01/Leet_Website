import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/lib/image";
import {
  BLOG_POST_QUERY,
  BLOG_POST_SLUGS_QUERY,
} from "@/sanity/lib/queries";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { PortableTextComponents } from "@portabletext/react";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leetgh.com";
const routePublishingSlug = "how-drivers-create-and-publish-a-route-on-leet";
const routePublishingScreenshots = [
  {
    src: "/images/blog/plan/IMG_1444.PNG",
    alt: "Leet driver plan screen showing a published commute template card.",
    caption: "Drivers start from the Plan screen, where saved commute templates can be published for the day.",
  },
  {
    src: "/images/blog/plan/IMG_1445.PNG",
    alt: "Leet create commute template form showing route path, schedule, seats, and price fields.",
    caption: "The template setup captures the route, schedule, available seats, and pricing for a regular commute.",
  },
  {
    src: "/images/blog/plan/IMG_1446.PNG",
    alt: "Leet create commute template form showing booking mode, publishing mode, payment methods, and return trip.",
    caption: "Drivers choose booking and publishing behavior, payment methods, and whether to add a return trip.",
  },
  {
    src: "/images/blog/plan/IMG_1447.PNG",
    alt: "Leet create commute template form showing booking mode and return trip options.",
    caption: "The final setup controls how the template becomes visible to passengers as a live trip.",
  },
] as const;

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?.url) {
        return null;
      }

      const width = value.asset.metadata?.dimensions?.width || 1200;
      const height = value.asset.metadata?.dimensions?.height || 800;

      return (
        <figure className="my-8 overflow-hidden rounded-[1.5rem] border border-[color:var(--stroke)] bg-[color:var(--paper)]/65">
          <div className="relative">
            <Image
              src={urlFor(value).width(1400).fit("max").auto("format").url()}
              alt={value.alt || ""}
              width={width}
              height={height}
              className="h-auto w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 900px"
              placeholder={value.asset.metadata?.lqip ? "blur" : "empty"}
              blurDataURL={value.asset.metadata?.lqip}
            />
          </div>
          {value.caption ? (
            <figcaption className="px-4 py-3 text-sm text-muted-foreground">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

async function getPost(slug: string, stega = true) {
  return client.fetch(
    BLOG_POST_QUERY,
    { slug },
    {
      stega,
      next: {
        revalidate: 60,
      },
    }
  );
}

export async function generateStaticParams() {
  const slugs =
    (await client.fetch(BLOG_POST_SLUGS_QUERY, {}, { stega: false, useCdn: false })) ||
    [];

  return slugs;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug, false);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      url: `${siteUrl}/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      images: post.coverImage?.asset?.url
        ? [
            {
              url: post.coverImage.asset.url,
              alt: post.coverImage.alt || post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage?.asset?.url
        ? [post.coverImage.asset.url]
        : ["/og-image.png"],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[color:var(--paper)]">
      <article>
        <section className="relative isolate overflow-hidden bg-[#0A0907]">
          <div className="mx-auto max-w-4xl px-6 pb-12 pt-10 md:px-12 md:pb-16 md:pt-14">
            <Link
              href="/blog"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/78 backdrop-blur-sm transition hover:bg-white/12 hover:text-white"
            >
              Back to blog
            </Link>
            <p className="mt-10 text-xs font-bold uppercase tracking-[0.24em] text-[#f0b48c]">
              {formatDate(post.publishedAt)}
            </p>
            <h1 className="mt-4 text-4xl text-white md:text-6xl">{post.title}</h1>
            <p className="mt-5 max-w-3xl text-base text-white/68 md:text-lg">
              {post.excerpt}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10 md:px-12 md:py-14">
          {post.coverImage?.asset?.url ? (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-white shadow-[0_18px_45px_rgba(21,19,15,0.08)]">
              <Image
                src={urlFor(post.coverImage).width(1400).height(788).url()}
                alt={post.coverImage.alt || post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 960px"
                placeholder={
                  post.coverImage.asset.metadata?.lqip ? "blur" : "empty"
                }
                blurDataURL={post.coverImage.asset.metadata?.lqip}
              />
            </div>
          ) : null}

          <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-white px-6 py-8 shadow-[0_18px_45px_rgba(21,19,15,0.06)] md:px-10 md:py-12">
            <div className="blog-prose mx-auto max-w-3xl">
              <PortableText value={post.body} components={portableTextComponents} />
            </div>

            {slug === routePublishingSlug ? (
              <div className="mx-auto mt-12 max-w-3xl border-t border-[color:var(--stroke)] pt-10">
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d46c2f]">
                    App Screens
                  </p>
                  <h2 className="mt-2 text-2xl text-foreground">
                    Plan Flow Screenshots
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    These screens show the exact in-app flow for creating a route
                    template and publishing it when the driver is ready.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {routePublishingScreenshots.map((image) => (
                    <figure
                      key={image.src}
                      className="overflow-hidden rounded-[1.5rem] border border-[color:var(--stroke)] bg-[color:var(--paper)]/60"
                    >
                      <div className="relative aspect-[9/16] bg-[#f7f1e7]">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 420px"
                        />
                      </div>
                      <figcaption className="px-4 py-3 text-sm text-muted-foreground">
                        {image.caption}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </article>
    </main>
  );
}
