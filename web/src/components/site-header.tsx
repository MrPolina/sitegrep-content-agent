import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="size-6 rounded-md bg-foreground" aria-hidden />
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">Sitegrep</span>
            <span className="text-sm text-muted-foreground">
              · Content Agent
            </span>
          </div>
        </div>
        <Badge variant="outline" className="font-mono text-[10px]">
          v0.2 · MVP
        </Badge>
      </div>
    </header>
  );
}
