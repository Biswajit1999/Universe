/**
 * Writing Studio template engine — deterministic document generators.
 * Each generator takes structured fields and returns clean Markdown that the
 * user can copy, download, save to the Vault, or refine with the assistant.
 */

export interface WritingInput {
  topic: string;
  recipient: string;
  yourName: string;
  context: string;
}

export interface WritingToolDef {
  id: string;
  name: string;
  desc: string;
  needsRecipient: boolean;
  generate: (i: WritingInput) => string;
}

const sig = (i: WritingInput) => i.yourName || "Biswajit Jana";
const topic = (i: WritingInput) => i.topic || "[topic]";
const rec = (i: WritingInput) => i.recipient || "[Name]";
const ctx = (i: WritingInput) => i.context.trim();

export const WRITING_TOOLS: WritingToolDef[] = [
  {
    id: "research-email",
    name: "Research Email",
    desc: "Contact a researcher about their work",
    needsRecipient: true,
    generate: (i) => `**Subject:** Question regarding your work on ${topic(i)}

Dear Dr. ${rec(i)},

I recently read your work on ${topic(i)} and found the approach compelling${ctx(i) ? `, particularly ${ctx(i)}` : ""}.

I am currently working on a related problem and had a specific question: [state your question in one or two sentences — the more concrete, the more likely a reply].

If you have a few minutes to point me toward the right reference or share a brief thought, I would be very grateful. I am happy to share my own analysis in return.

Thank you for your time.

Best regards,
${sig(i)}`,
  },
  {
    id: "phd-enquiry",
    name: "PhD Enquiry",
    desc: "Approach a potential supervisor",
    needsRecipient: true,
    generate: (i) => `**Subject:** Prospective PhD student — interest in ${topic(i)}

Dear Professor ${rec(i)},

I am writing to ask whether you anticipate taking on PhD students in the coming cycle. My background is in ${ctx(i) || "[your degree/field, key skills]"}, and my interests align closely with your group's work on ${topic(i)}.

Two things I have done that are relevant:
1. [Concrete project #1 — one line, with a link if public]
2. [Concrete project #2 — one line, with a link if public]

I have attached my CV. If it would be useful, I can also send a one-page research statement outlining a direction I would be excited to pursue within your group.

Thank you for considering this — I understand how many such emails you receive, and I have tried to keep this one short.

Kind regards,
${sig(i)}`,
  },
  {
    id: "supervisor-update",
    name: "Supervisor Update",
    desc: "Weekly progress report",
    needsRecipient: true,
    generate: (i) => `**Subject:** Progress update — ${topic(i)}

Hi ${rec(i)},

Quick update on ${topic(i)}:

**Done this week**
- ${ctx(i) || "[Key result or milestone — lead with the most important]"}
- [Second item]

**Blocked / uncertain**
- [The one thing you most need input on — phrase it as a decision to make]

**Next week**
- [Top priority]
- [Second priority]

Happy to discuss any of this in our next meeting — the blocked item is the most time-sensitive.

Best,
${sig(i)}`,
  },
  {
    id: "linkedin",
    name: "LinkedIn Post",
    desc: "Share a project or result publicly",
    needsRecipient: false,
    generate: (i) => `🔭 ${topic(i)} — what I learned building it

${ctx(i) || "[One-sentence hook: the surprising thing you found or built.]"}

The three things that mattered:
1. [Insight one — specific, not generic]
2. [Insight two]
3. [The mistake you'd tell others to avoid]

Everything is open source — link in the comments. If you're working on something similar, I'd genuinely like to compare notes.

#OpenScience #Engineering #DataScience`,
  },
  {
    id: "readme",
    name: "GitHub README",
    desc: "Professional README skeleton",
    needsRecipient: false,
    generate: (i) => `# ${topic(i)}

> ${ctx(i) || "One sentence: what this does and for whom."}

## Features
- [Feature 1 — lead with the strongest]
- [Feature 2]
- [Feature 3]

## Quick start
\`\`\`bash
git clone https://github.com/<user>/${topic(i).toLowerCase().replace(/[^a-z0-9]+/g, "-")}
cd ${topic(i).toLowerCase().replace(/[^a-z0-9]+/g, "-")}
# install & run
\`\`\`

## How it works
[Two or three sentences on the architecture. A diagram is worth adding here.]

## Roadmap
- [ ] [Next milestone]
- [ ] [After that]

## Contributing
Issues and PRs welcome — see CONTRIBUTING.md.

## License
MIT © ${sig(i)}`,
  },
  {
    id: "abstract",
    name: "Paper Abstract",
    desc: "Structured scientific abstract",
    needsRecipient: false,
    generate: (i) => `**Abstract — ${topic(i)}**

*Context.* ${ctx(i) || "[Why this problem matters — one sentence.]"}

*Aims.* We investigate ${topic(i).toLowerCase()}, asking specifically [the narrow question].

*Methods.* We use [data] and apply [method], validating against [test].

*Results.* We find [main result with a number and an uncertainty]. This is robust to [key systematic check].

*Conclusions.* [What this changes for the field, one sentence.] All code and data products are publicly available.`,
  },
  {
    id: "project-desc",
    name: "Project Description",
    desc: "For portfolios, applications, grant forms",
    needsRecipient: false,
    generate: (i) => `**${topic(i)}**

${ctx(i) || "[Opening: the problem in plain language, two sentences.]"}

This project delivers [the concrete artefact: a pipeline / analysis / tool] built with [key technologies]. The central technical challenge was [the hard part], solved by [your approach].

**Impact:** [Who uses it or could; what it enables; any numbers — stars, users, accuracy.]

**Role:** Sole developer/researcher — design, implementation, analysis, and documentation.`,
  },
  {
    id: "grant-idea",
    name: "Grant / Proposal Idea",
    desc: "One-page proposal sketch",
    needsRecipient: false,
    generate: (i) => `# Proposal sketch — ${topic(i)}

**Problem.** ${ctx(i) || "[The gap: what cannot currently be done, and why it matters.]"}

**Objective.** Within [timeframe], deliver [concrete, measurable outcome].

**Approach.**
1. [Work package 1 — months 1–3]
2. [Work package 2 — months 4–8]
3. [Validation + open release — months 9–12]

**Why now / why us.** [Recent enabler — new dataset, new method — plus your specific proof of capability.]

**Deliverables.** Open-source software, a public dataset/catalogue, and one peer-reviewed publication.

**Budget outline.** [Personnel, compute, travel — keep to three lines.]`,
  },
  {
    id: "public-explainer",
    name: "Public Explainer",
    desc: "Explain science to a general audience",
    needsRecipient: false,
    generate: (i) => `# ${topic(i)}, explained simply

${ctx(i) || `Imagine trying to understand ${topic(i).toLowerCase()} without any jargon. Here's the honest version.`}

**The one-sentence version:** [The core idea, no jargon, no hedging.]

**Why anyone cares:** [The consequence for ordinary life or for big questions.]

**The clever bit:** [The insight or trick that makes it work — this is where the wonder lives.]

**What we still don't know:** [One open question — honesty builds trust.]

*Rule of thumb used here: every sentence should survive being read aloud to a curious 14-year-old.*`,
  },
  {
    id: "formal-rewrite",
    name: "Formal Rewrite",
    desc: "Rewrite rough text professionally",
    needsRecipient: false,
    generate: (i) => {
      const raw = ctx(i);
      if (!raw) {
        return `Paste the rough text into the **Context** box and regenerate — this tool restructures it into a formal register.

*Template applied:* greeting → purpose in sentence one → supporting detail → explicit request or next step → courteous close.`;
      }
      return `**Formal version (template pass — refine with the assistant for full rewriting):**

Dear ${rec(i)},

I am writing regarding ${topic(i) || "the matter below"}. ${raw.charAt(0).toUpperCase() + raw.slice(1).replace(/\bi\b/g, "I")}

Please let me know if any further information would be helpful. I would appreciate your guidance on the next step.

Yours sincerely,
${sig(i)}

*Note: this is a structural template pass. Connect a Gemini key for true sentence-level rewriting via the assistant.*`;
    },
  },
];
