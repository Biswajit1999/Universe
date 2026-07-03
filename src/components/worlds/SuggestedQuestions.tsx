"use client";
import { MessageCircleQuestion } from "lucide-react";
import { askUniverse } from "@/lib/utils";

export function SuggestedQuestions({ questions, worldName }: { questions: string[]; worldName: string }) {
  return (
    <div className="glass p-5">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <MessageCircleQuestion size={15} className="text-accent" /> Suggested questions
      </h3>
      <ul className="space-y-2">
        {questions.map((q) => (
          <li key={q}>
            <button
              onClick={() => askUniverse(q, `${worldName} world`)}
              className="text-left text-xs text-muted transition hover:text-accent"
            >
              → {q}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
