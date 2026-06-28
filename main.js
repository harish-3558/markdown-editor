// ── main.js ─────────────────────────────────────────────
// Plain JavaScript Markdown Editor
// Works directly in the browser — no TypeScript needed!
// ─────────────────────────────────────────────────────────

// Step 1: Grab our HTML elements from the page
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const wordCountEl = document.getElementById("word-count");
const charCountEl = document.getElementById("char-count");

// ── Escape HTML ───────────────────────────────────────────
// Prevents < > & from breaking the HTML output
// Uses browser's built-in escaping — handles ALL special characters
function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ── Inline formatting ─────────────────────────────────────
// Handles: **bold**, *italic*, `code`, ~~strike~~, [link](url)
function inlineFormat(text) {
  text = escapeHtml(text);
  text = text.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  text = text.replace(/~~(.+?)~~/g, "<del>$1</del>");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return text;
}

// ── Check if a line starts a special block ────────────────
// This is the KEY fix — we use this to stop the paragraph
// loop from getting stuck on lines starting with # or other
// special Markdown characters
function isSpecialLine(line) {
  return (
    line.startsWith("#") ||
    line.startsWith(">") ||
    line.startsWith("```") ||
    /^[-*+]\s/.test(line) ||
    /^\d+\.\s/.test(line) ||
    /^[-*]{3,}$/.test(line.trim())
  );
}

// ── Markdown Parser ───────────────────────────────────────
// Converts Markdown text → HTML, line by line
function parseMarkdown(text) {
  const lines = text.split("\n");
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Code block (``` ... ```) ──────────────────────────
    if (line.startsWith("```")) {
      let code = "";
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code += escapeHtml(lines[i]) + "\n";
        i++;
      }
      html += `<pre><code>${code}</code></pre>`;
      i++;
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
      const level = headingMatch[1].length;
      html += `<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`;
      i++;
      continue;
    }

    // ── Heading with no space after # (just # alone) ──────
    // Fixes freeze when user types # and nothing after it yet
    if (/^#{1,6}$/.test(line.trim())) {
      html += `<h1></h1>`;
      i++;
      continue;
    }

    // ── Blockquote (> text) ───────────────────────────────
    if (line.startsWith("> ")) {
      let quote = "";
      while (i < lines.length && lines[i].startsWith("> ")) {
        quote += lines[i].slice(2) + " ";
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
      i += 2;
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
    // FIX: always increment i inside the loop to prevent infinite loop
    let paragraph = "";
    while (i < lines.length && lines[i].trim() !== "" && !isSpecialLine(lines[i])) {
      paragraph += lines[i] + " ";
      i++; // ← this MUST always run, otherwise infinite loop!
    }
    if (paragraph.trim()) {
      html += `<p>${inlineFormat(paragraph.trim())}</p>`;
    } else {
      i++; // ← safety: always move forward even if nothing matched
    }
  }

  return html;
}

// ── Update stats (word + char count) ─────────────────────
function updateStats(text) {
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  wordCountEl.textContent = `${words} word${words !== 1 ? "s" : ""}`;
  charCountEl.textContent = `${chars} character${chars !== 1 ? "s" : ""}`;
}

// ── Listen for typing ─────────────────────────────────────
editor.addEventListener("input", () => {
  const markdown = editor.value;
  preview.innerHTML = parseMarkdown(markdown);
  updateStats(markdown);
});

// ── Default example text ──────────────────────────────────
const defaultText = `# Hello, Markdown! 👋

Welcome to your **Markdown Editor**.

## What you can do

- Write *italic* and **bold** text
- Add \`inline code\` easily
- Create lists like this one!

## Code block

\`\`\`
function greet(name) {
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