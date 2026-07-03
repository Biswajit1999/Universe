import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

function normalizeMath(content: string): string {
  return content
    .replace(/\$\$([^\n][\s\S]*?)\$\$/g, (_, math: string) => `\n$$\n${math.trim()}\n$$\n`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, math: string) => `\n$$\n${math.trim()}\n$$\n`)
    .replace(/\\\((.*?)\\\)/g, (_, math: string) => `$${math.trim()}$`);
}

/** Standards-based Markdown renderer with GFM tables, fenced code, and KaTeX. */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-universe text-sm text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {normalizeMath(content)}
      </ReactMarkdown>
    </div>
  );
}
