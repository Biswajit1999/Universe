import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WORLDS, DEEP_WORLDS } from "@/lib/data/worlds";
import { Icon } from "@/components/nav/icons";

export const metadata = { title: "Science Worlds · UNIVERSE" };

export default function WorldsHub() {
  return (
    <div>
      <PageHeader
        eyebrow="Explore"
        title="Science Worlds"
        description="Ten interconnected domains. Four have deep interactive pages in this MVP (Astronomy, Physics, Mathematics, AI); the rest open a rich overview with live-data and simulation modules."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WORLDS.map((w) => (
          <Link
            key={w.slug}
            href={`/worlds/${w.slug}`}
            className="glass group relative flex flex-col gap-3 p-5 transition hover:border-accent/40"
          >
            <div className="flex items-center justify-between">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl border"
                style={{ borderColor: `${w.color}55`, background: `${w.color}18` }}
              >
                <Icon name={w.icon} size={22} />
              </div>
              <div className="flex items-center gap-1.5">
                {DEEP_WORLDS.has(w.slug) && (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">
                    Deep
                  </span>
                )}
                <ArrowUpRight size={16} className="text-muted transition group-hover:text-accent" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold">{w.name}</h3>
              <p className="text-xs text-accent">{w.tagline}</p>
            </div>
            <p className="line-clamp-3 text-xs text-muted">{w.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
