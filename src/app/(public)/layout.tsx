import * as React from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";

export default function PublicPagesLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
