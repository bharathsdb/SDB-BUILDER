import { mockBlogPosts } from "@/lib/api/mock-db";
import ClientPage from "./ClientPage";

export function generateStaticParams() {
  return mockBlogPosts.map((p) => ({
    slug: p.slug,
  }));
}

export default function Page() {
  return <ClientPage />;
}
