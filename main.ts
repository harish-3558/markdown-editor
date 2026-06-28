// ── main.ts ─────────────────────────────────────────────
// TypeScript Markdown Editor
// Every line is commented so it's easy to understand!
// ─────────────────────────────────────────────────────────

// Step 1: Grab our HTML elements from the page
const editor = document.getElementById("editor") as HTMLTextAreaElement;
const preview = document.getElementById("preview") as HTMLDivElement;
const wordCountEl = document.getElementById("word-count") as HTMLSpanElement;
const charCountEl = document.getElementById("char-count") as HTMLSpanElement;

// ── Markdown Parser ───────────────────────────────────────
// This function converts Markdown text → HTML
// It works line by line, checking what each line looks like

function parseMarkdown(text: string): string {
  const lines: string[] = text.split("\n"); // split text into individual lines
  let html: string = "";                    // we'll build our HTML here
  let i: number = 0;                        // current line index

  while (i < lines.length) {
    const line = lines[i];

    // ── Code block (``` ... ```) ──────────────────────────
    if (line.startsWith("```")) {
      let code = "";
      i++; // skip the opening ```
      while (i < lines.length && !lines[i].startsWith("```")) {
        code += escapeHtml(lines[i]) + "\n"; // collect code lines
        i++;
      }
      html += `<pre><code>${code}</code></pre>`;
      i++; // skip the closing ```
      continue;
    }

    // ── Horizontal rule (--- or ***) ─────────────────────
    if (/^[-*]{3,}$/.test(line.trim())) {
      html += "<hr>";
      i++;
      continue;
    }

    // ── Headings (# ## ###) ───────────────────────────────
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length; // count the # symbols
      const text = inlineFormat(headingMatch[2]);
      html += `<h${level}>${text}</h${level}>`;
      i++;
      continue;
    }

    // ── Blockquote (> text) ───────────────────────────────
    if (line.startsWith("> ")) {
      let quote = "";
      while (i < lines.length && lines[i].startsWith("> ")) {
        quote += lines[i].slice(2) + " "; // remove "> " prefix
        i++;
      }
      html += `<blockquote>${inlineFormat(quote.trim())}</blockquote>`;
      continue;
    }

    // ── Unordered list (- item or * item) ────────────────
    if (/^[-*+]\s/.test(line)) {
      html += "<ul>";
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        html += `<li>${inlineFormat(lines[i].slice(2))}</li>`;
        i++;
      }
      html += "</ul>";
      continue;
    }

    // ── Ordered list (1. item) ────────────────────────────
    if (/^\d+\.\s/.test(line)) {
      html += "<ol>";
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        html += `<li>${inlineFormat(lines[i].replace(/^\d+\.\s/, ""))}</li>`;
        i++;
      }
      html += "</ol>";
      continue;
    }

    // ── Table (| col | col |) ─────────────────────────────
    if (line.includes("|") && i + 1 < lines.length && /^[\s|:-]+$/.test(lines[i + 1])) {
      const headers = line.split("|").map((c) => c.trim()).filter(Boolean);
      html += "<table><thead><tr>";
      html += headers.map((h) => `<th>${inlineFormat(h)}</th>`).join("");
      html += "</tr></thead><tbody>";
      i += 2; // skip header row and separator row

      while (i < lines.length && lines[i].includes("|")) {
        const cells = lines[i].split("|").map((c) => c.trim()).filter(Boolean);
        html += "<tr>" + cells.map((c) => `<td>${inlineFormat(c)}</td>`).join("") + "</tr>";
        i++;
      }
      html += "</tbody></table>";
      continue;
    }

    // ── Blank line → skip ─────────────────────────────────
    if (line.trim() === "") {
      i++;
      continue;
    }

    // ── Paragraph (normal text) ───────────────────────────
    let paragraph = "";
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith(">") &&
      !lines[i].startsWith("```") &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      paragraph += lines[i] + " ";
      i++;
    }
    if (paragraph.trim()) {
      html += `<p>${inlineFormat(paragraph.trim())}</p>`;
    }
  }

  return html;
}

// ── Inline formatting ─────────────────────────────────────
// Handles: **bold**, *italic*, `code`, ~~strike~~, [link](url)
function inlineFormat(text: string): string {
  // Escape HTML first so < and > don't break the output
  text = escapeHtml(text);

  // Inline code: `code`
  text = text.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);

  // Bold + Italic: ***text***
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");

  // Bold: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Strikethrough: ~~text~~
  text = text.replace(/~~(.+?)?~~/g, "<del>$1</del>");

  // Link: [label](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return text;
}

// ── Escape HTML ───────────────────────────────────────────
// Prevents < > & from breaking the HTML output
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── Update stats (word + char count) ─────────────────────
function updateStats(text: string): void {
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;

  wordCountEl.textContent = `${words} word${words !== 1 ? "s" : ""}`;
  charCountEl.textContent = `${chars} character${chars !== 1 ? "s" : ""}`;
}

// ── The main event: listen for typing ────────────────────
// Every time the user types, we re-render the preview
editor.addEventListener("input", () => {
  const markdown = editor.value;
  preview.innerHTML = parseMarkdown(markdown); // render to preview
  updateStats(markdown);                        // update word/char count
});

// ── Load default example on page start ───────────────────
const defaultText = `# Hello, Markdown! 👋

Welcome to your **Markdown Editor**.

## What you can do

- Write *italic* and **bold** text
- Add \`inline code\` easily
- Create lists like this one!

## Code block

\`\`\`
function greet(name: string) {
  return "Hello, " + name;
}
\`\`\`

> This is a blockquote — great for quotes!

## Table

| Name  | Role     |
|-------|----------|
| Alice | Designer |
| Bob   | Dev      |

---

[Visit Markdown Guide](https://www.markdownguide.org)
`;

editor.value = defaultText;
preview.innerHTML = parseMarkdown(defaultText);
updateStats(defaultText);