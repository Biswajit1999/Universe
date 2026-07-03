import Link from "next/link";
import { ArrowRight, Telescope, FlaskConical, Share2, Sparkles } from "lucide-react";

/** Cinematic landing page → routes into the Command Center. */
export default function Landing() {
  return (
    <div className="relative">
      <section className="flex flex-col items-center py-10 text-center sm:py-16">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-edge px-3 py-1 text-xs text-muted">
          <Sparkles size={13} className="text-accent" /> Open-source · Jarvis for science
        </span>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          <span className="text-gradient">UNIVERSE</span>
          <br />
          The Living Scientific
          <br className="hidden sm:block" /> Operating System
        </h1>
        <p className="mt-5 max-w-xl text-sm text-muted sm:text-base">
          Say <em>&ldquo;Hey Universe&rdquo;</em> and explore live datasets, run simulations,
          generate research plans, draft your writing, and travel through connected knowledge
          worlds — all in one calm, cinematic command center.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/command"
            className="inline-flex items-center gap-2 rounded-xl bg-accent/20 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-accent/30"
          >
            Enter the Command Center <ArrowRight size={16} />
          </Link>
          <Link
            href="/worlds"
            className="inline-flex items-center gap-2 rounded-xl border border-edge px-5 py-3 text-sm font-medium text-ink transition hover:bg-white/5"
          >
            Browse Science Worlds
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
        {[
          { icon: Telescope, title: "Live data, honestly labelled", body: "NASA, arXiv and the Exoplanet Archive — with clear Demo / Live / Estimated / Simulated badges." },
          { icon: FlaskConical, title: "Simulate the what-ifs", body: "Transparent physics models: orbits, gravity, blackbody, transit depth, SNR, PID and thermal drift." },
          { icon: Share2, title: "Connected knowledge", body: "An interactive graph ties physics, astronomy, AI, biology and your own research together." },
        ].map((f) => (
          <div key={f.title} className="glass p-5">
            <f.icon size={22} className="text-accent" />
            <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
            <p className="mt-1 text-xs text-muted">{f.body}</p>
          </div>
        ))}
      </section>

      <p className="mt-10 text-center text-xs text-muted">
        Runs fully in <strong>Demo Mode</strong> with zero API keys. Add keys to go live.
      </p>
    </div>
  );
}
