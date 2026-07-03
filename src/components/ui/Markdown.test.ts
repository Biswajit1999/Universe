import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "./Markdown";

describe("Markdown", () => {
  it("renders deep headings, display mathematics, and fenced diagrams", () => {
    const content = `#### Governing physics

$$r_s = \\frac{2GM}{c^2}$$

\`\`\`text
star ---> event horizon
\`\`\``;
    const html = renderToStaticMarkup(createElement(Markdown, { content }));

    expect(html).toContain("<h4>");
    expect(html).toContain("katex-display");
    expect(html).toContain("<pre>");
    expect(html).not.toContain("#### Governing physics");
  });
});
