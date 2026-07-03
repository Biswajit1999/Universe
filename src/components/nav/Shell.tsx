"use client";
/**
 * App shell: fixed sidebar on desktop, slide-in drawer on mobile, and a top
 * bar with the Demo/Live pill + theme toggle. Wraps every page's content.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Radio, Moon, Sun } from "lucide-react";
import { NAV_ITEMS } from "@/lib/data/nav";
import { Icon } from "./icons";
import { useSettings } from "@/lib/state/settings";
import { cn } from "@/lib/utils";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== "/command" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
              active
                ? "bg-accent/15 text-ink"
                : "text-muted hover:bg-white/5 hover:text-ink",
            )}
          >
            <Icon name={item.icon} size={17} className={active ? "text-accent" : ""} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ModePill() {
  const { demoMode, setDemoMode } = useSettings();
  return (
    <button
      onClick={() => setDemoMode(!demoMode)}
      title="Toggle Demo / Live data mode"
      className="flex items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 text-xs font-medium transition hover:bg-white/5"
    >
      <Radio size={13} className={demoMode ? "text-sky-300" : "text-emerald-300"} />
      {demoMode ? "Demo Mode" : "Live Mode"}
    </button>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useSettings();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full border border-edge p-2 transition hover:bg-white/5"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-edge px-4 py-5 lg:flex">
        <Link href="/command" className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge bg-accent/10">
            <span className="text-gradient text-lg font-bold">U</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">UNIVERSE</p>
            <p className="text-[10px] text-muted">Scientific OS</p>
          </div>
        </Link>
        <NavLinks />
        <div className="mt-auto px-2 pt-4 text-[10px] text-muted">
          <p>Open-source MVP · v0.1</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn("fixed inset-0 z-50 lg:hidden", drawer ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!drawer}
      >
        <div
          className={cn("absolute inset-0 bg-black/50 transition-opacity", drawer ? "opacity-100" : "opacity-0")}
          onClick={() => setDrawer(false)}
        />
        <aside
          className={cn(
            "glass-strong absolute left-0 top-0 h-full w-72 border-r border-edge px-4 py-5 transition-transform duration-300",
            drawer ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="text-gradient text-lg font-bold">UNIVERSE</span>
            <button onClick={() => setDrawer(false)} aria-label="Close menu" className="rounded-md p-1 hover:bg-white/5">
              <X size={20} />
            </button>
          </div>
          <NavLinks onNavigate={() => setDrawer(false)} />
        </aside>
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-edge bg-bg/70 px-4 py-3 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawer(true)}
              aria-label="Open menu"
              className="rounded-md p-1.5 hover:bg-white/5 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <Link href="/command" className="text-gradient text-base font-bold lg:hidden">
              UNIVERSE
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ModePill />
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-edge px-4 py-4 text-center text-[11px] text-muted">
          UNIVERSE · The Living Scientific Operating System · Data labelled Demo / Live / Estimated / Simulated ·{" "}
          <Link href="/settings" className="underline">
            Science disclaimer
          </Link>
        </footer>
      </div>
    </div>
  );
}
