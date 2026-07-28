"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User, Tag } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui";
import { mockBlogPosts } from "@/lib/api/mock-db";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const post = mockBlogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <PublicLayout>
        <div className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto max-w-3xl px-4 md:px-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Link href="/blog" className="text-primary hover:underline">Back to blog</Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <article className="container mx-auto max-w-3xl px-4 md:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <Badge variant="info" className="mb-4">{post.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTime} min read
            </span>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{post.excerpt}</p>
            <div className="mt-8 p-6 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 italic">
                Full article content coming soon. Stay tuned for updates!
              </p>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-slate-400" />
                {post.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </PublicLayout>
  );
}
