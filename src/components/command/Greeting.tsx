"use client";
import { useEffect, useState } from "react";
import { greeting } from "@/lib/utils";

/** Time-aware greeting; rendered client-side to avoid hydration mismatch. */
export function Greeting({ name = "Biswajit" }: { name?: string }) {
  const [text, setText] = useState("Welcome");
  useEffect(() => setText(greeting()), []);
  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {text}, <span className="text-gradient">{name}</span>.
      </h1>
      <p className="mt-1.5 text-sm text-muted sm:text-base">What do you want to understand today?</p>
    </div>
  );
}
