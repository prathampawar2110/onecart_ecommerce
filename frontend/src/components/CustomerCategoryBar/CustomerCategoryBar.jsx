"use client";

import { usePathname } from "next/navigation";
import CategoryBar from "@/components/CategoryBar/CategoryBar";

export default function CustomerCategoryBar() {
  const pathname = usePathname();

  // Show CategoryBar only on Home and Search pages
  const shouldShow =
    pathname === "/" ||
    pathname === "/search";

  if (!shouldShow) {
    return null;
  }

  return <CategoryBar />;
}   