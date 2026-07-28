import { mockProjects } from "@/lib/api/mock-db";
import ClientPage from "./ClientPage";

export function generateStaticParams() {
  return mockProjects.map((p) => ({
    id: p.id,
  }));
}

export default function Page() {
  return <ClientPage />;
}
