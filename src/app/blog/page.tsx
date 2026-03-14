import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { BLOG_POSTS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leetgh.com";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read Leet updates, commute guides, pricing explainers, and safety stories for passengers and drivers in Ghana.",
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/blog`,
    title: "Leet Blog",
    description:
      "Commute stories, product updates, route insights, and safety explainers for passengers and drivers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Leet Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leet Blog",
    description:
      "Commute stories, product updates, route insights, and safety explainers for passengers and drivers.",
    images: ["/og-image.png"],
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function BlogPage() {
  const posts =
    (await client.fetch(
      BLOG_POSTS_QUERY,
      {},
      {
        next: {
          revalidate: 60,
        },
      }
    )) || [];

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <main className="min-h-screen bg-[color:var(--paper)]">
      <section className="relative isolate overflow-hidden bg-[#0A0907]">
        <div
          className="pointer-events-none absolute -left-24 top-0 h-[360px] w-[360px] rounded-full opacity-40 orb-1"
          style={{
            background:
              "radial-gradient(circle, rgba(224,108,44,0.32) 0%, transparent 72%)",
          }}
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-6 pb-18 pt-10 md:px-12 md:pb-22 md:pt-14">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/78 backdrop-blur-sm transition hover:bg-white/12 hover:text-white"
          >
            Leet
          </Link>
          <div className="mt-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f0b48c]">
              Leet Blog
            </p>
            <h1 className="mt-3 text-4xl text-white md:text-6xl">
              Commute stories, product updates, and route insights.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/68 md:text-lg">
              A clean publishing surface for your website today and a reusable
              content source for your mobile app later.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 md:px-12 md:py-18">
        {featuredPost ? (
          <div>
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-white shadow-[0_18px_45px_rgba(21,19,15,0.08)]"
            >
              {featuredPost.coverImage?.asset?.url ? (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={urlFor(featuredPost.coverImage).width(1200).height(750).url()}
                    alt={featuredPost.coverImage.alt || featuredPost.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    placeholder={
                      featuredPost.coverImage.asset.metadata?.lqip ? "blur" : "empty"
                    }
                    blurDataURL={featuredPost.coverImage.asset.metadata?.lqip}
                  />
                </div>
              ) : null}
              <div className="space-y-4 p-6 md:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--accent)]">
                  Featured Post
                </p>
                <h2 className="text-3xl text-[color:var(--ink)]">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {featuredPost.excerpt}
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                  {formatDate(featuredPost.publishedAt)}
                </p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[color:var(--stroke)] bg-white/60 p-10 text-center shadow-[0_18px_45px_rgba(21,19,15,0.04)]">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--accent)]">
              No posts yet
            </p>
            <h2 className="mt-3 text-3xl text-[color:var(--ink)]">
              Publish your first article in Sanity Studio.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
              Open <span className="font-semibold text-[color:var(--ink)]">/studio</span>,
              create a blog post, publish it, and it will appear here.
            </p>
          </div>
        )}

        {otherPosts.length ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {otherPosts.map((post: any) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-[1.75rem] border border-[color:var(--stroke)] bg-white shadow-[0_14px_34px_rgba(21,19,15,0.06)]"
              >
                {post.coverImage?.asset?.url ? (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={urlFor(post.coverImage).width(900).height(506).url()}
                      alt={post.coverImage.alt || post.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      placeholder={
                        post.coverImage.asset.metadata?.lqip ? "blur" : "empty"
                      }
                      blurDataURL={post.coverImage.asset.metadata?.lqip}
                    />
                  </div>
                ) : null}
                <div className="space-y-3 p-6">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                    {formatDate(post.publishedAt)}
                  </p>
                  <h3 className="text-2xl text-[color:var(--ink)]">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
