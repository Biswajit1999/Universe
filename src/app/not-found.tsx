import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-gradient">404</p>
      <h1 className="mt-4 text-xl font-semibold">Lost in space</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        This coordinate isn&apos;t on the star chart. Head back to the Command Center to reorient.
      </p>
      <Link href="/command" className="mt-6 rounded-lg bg-accent/20 px-5 py-2.5 text-sm font-semibold hover:bg-accent/30">
        Return to Command Center
      </Link>
    </div>
  );
}
