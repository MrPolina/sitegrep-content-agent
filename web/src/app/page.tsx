import { SiteHeader } from "@/components/site-header";
import { Gallery } from "@/components/content/gallery";

export default function GalleryPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:py-14">
        <div className="space-y-2 pb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Опубликованные статьи
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Все статьи, сгенерированные агентом и опубликованные в GitHub.
            Источник — свежие материалы Google Search Central.
          </p>
        </div>

        <Gallery />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6 text-[11px] text-muted-foreground">
          <span>Sitegrep · Content Agent</span>
          <span className="font-mono">MVP — client-side mock</span>
        </div>
      </footer>
    </>
  );
}
