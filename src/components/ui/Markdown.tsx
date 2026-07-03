import { Fragment, type ReactNode } from "react";

/**
 * Minimal, dependency-free Markdown renderer — enough for the assistant and
 * template generators (headings, lists, tables, code blocks, bold/italic/code,
 * links). Not a full CommonMark implementation; it covers what we emit.
 */
function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Order matters: code first so ** inside code isn't parsed.
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(<Fragment key={`${keyBase}-t${i}`}>{text.slice(last, m.index)}</Fragment>);
    const token = m[0];
    if (token.startsWith("`")) {
      nodes.push(<code key={`${keyBase}-c${i}`}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={`${keyBase}-b${i}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={`${keyBase}-i${i}`}>{token.slice(1, -1)}</em>);
    } else {
      const mm = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (mm) {
        nodes.push(
          <a key={`${keyBase}-a${i}`} href={mm[2]} target="_blank" rel="noreferrer">
            {mm[1]}
          </a>,
        );
      }
    }
    last = m.index + token.length;
    i++;
  }
  if (last < text.length) nodes.push(<Fragment key={`${keyBase}-tend`}>{text.slice(last)}</Fragment>);
  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trim().startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // closing fence
      blocks.push(
        <pre key={key++}>
          <code>{buf.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Table (header row + separator + body)
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|/.test(lines[i + 1])) {
      const header = line.split("|").map((c) => c.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").map((c) => c.trim()).filter((_, idx, arr) => !(idx === 0 && arr[0] === "") ));
        i++;
      }
      blocks.push(
        <table key={key++}>
          <thead>
            <tr>{header.map((h, hi) => <th key={hi}>{inline(h, `h${key}-${hi}`)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => <td key={ci}>{inline(c, `r${key}-${ri}-${ci}`)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const content = inline(h[2], `hd${key}`);
      blocks.push(
        level === 1 ? <h1 key={key++}>{content}</h1> : level === 2 ? <h2 key={key++}>{content}</h2> : <h3 key={key++}>{content}</h3>,
      );
      i++;
      continue;
    }

    // Lists (unordered / ordered)
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ""));
        i++;
      }
      const li = items.map((it, ii) => <li key={ii}>{inline(it, `li${key}-${ii}`)}</li>);
      blocks.push(ordered ? <ol key={key++}>{li}</ol> : <ul key={key++}>{li}</ul>);
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (consume consecutive non-empty, non-special lines)
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3})\s/.test(lines[i]) &&
      !/^\s*([-*]|\d+\.)\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith("```")
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(<p key={key++}>{inline(para.join(" "), `p${key}`)}</p>);
  }

  return <div className="prose-universe text-sm text-ink">{blocks}</div>;
}
