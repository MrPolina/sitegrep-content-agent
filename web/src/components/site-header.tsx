"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Gallery" },
  { href: "/generate", label: "Generate" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-6 px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-6 rounded-md bg-foreground" aria-hidden />
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">Sitegrep</span>
            <span className="text-sm text-muted-foreground">
              · Content Agent
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Badge variant="outline" className="hidden font-mono text-[10px] sm:inline-flex">
          v0.2 · MVP
        </Badge>
      </div>
    </header>
  );
}
