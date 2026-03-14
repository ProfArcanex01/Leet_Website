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
          </div>
        </section>
      </article>
    </main>
  );
}
