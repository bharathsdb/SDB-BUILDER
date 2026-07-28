"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";
import { mockBlogPosts, type BlogPost } from "@/lib/api/mock-db";

const allCategories = Array.from(new Set(mockBlogPosts.map((p) => p.category)));

const categoryColors: Record<string, string> = {
  Technology: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  Design: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  Business: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  Sustainability: "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
};

export default function BlogPage() {
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const filtered = mockBlogPosts.filter((post) => {
    if (activeCategory && post.category !== activeCategory) return false;
    if (search && !post.title.toLowerCase().includes(search.toLowerCase()) && !post.excerpt.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const featured = filtered[0];

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="info" className="mb-4">Blog</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">PlanCraftAI Blog</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                Insights, tutorials, and stories from the world of AI-powered architectural design.
              </p>
            </motion.div>
          </div>

          {/* Search & Filters */}
          <div className="mb-8 space-y-4">
            <div className="max-w-md">
              <Input
                icon={<Search className="w-4 h-4" />}
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-500 mr-1">Categories:</span>
              <button
                onClick={() => setActiveCategory(null)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  !activeCategory
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                All
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    activeCategory === cat
                      ? "bg-primary text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Post */}
          {featured && !activeCategory && !search && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-12"
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all group">
                <Link href={`/blog/${featured.slug}`}>
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-video md:aspect-auto bg-slate-200 dark:bg-slate-800 relative overflow-hidden min-h-[250px] flex items-center justify-center">
                      <div className="text-slate-400">
                        <svg className="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <span className="text-white font-semibold">Read Article</span>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <Badge variant="info" className="mb-3 self-start">{featured.category}</Badge>
                      <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">{featured.title}</h2>
                      <p className="text-slate-500 dark:text-slate-400 mb-4">{featured.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          {featured.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {featured.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {featured.readTime} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            </motion.div>
          )}

          {/* Post Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {(search || activeCategory ? filtered : mockBlogPosts).map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-500 mb-2">No articles found</h3>
              <p className="text-slate-400 mb-4">Try a different search or filter.</p>
              <Button variant="secondary" onClick={() => { setSearch(""); setActiveCategory(null); }}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Subscribe */}
          <div className="text-center">
            <Card className="max-w-xl mx-auto">
              <CardContent className="py-8">
                <h2 className="text-xl font-bold mb-2">Stay Updated</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Get the latest articles delivered to your inbox.</p>
                <div className="flex gap-2 max-w-md mx-auto">
                  <Input placeholder="your@email.com" className="flex-1" />
                  <Button>Subscribe</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="group h-full overflow-hidden hover:shadow-xl transition-all hover:border-primary/30">
        <div className="aspect-video bg-slate-200 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
          <svg className="w-12 h-12 opacity-20 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
        </div>
        <CardContent>
          <Badge variant="info" className="mb-2">{post.category}</Badge>
          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime} min read
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
