import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// Course markdown files are in the course/ directory
const CONTENT_DIRS = ["course"];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(p, out);
      } else if (entry.isFile() && p.endsWith(".md")) {
        out.push(p);
      }
    }
  } catch (err) {
    // Skip directories we can't read
    if (err.code !== "EACCES") console.error(`Error reading ${dir}:`, err.message);
  }
  return out;
}

function normalize(s) {
  return s
    .replace(/\s+/g, " ")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim();
}

// Detect repeated phrases like "X: X: X" or exact sentence repeats in a line
function findRepeatsInLine(line) {
  const n = normalize(line);
  if (n.length < 40) return null;

  // Case 1: "foo: foo: foo" style repeats (most common pattern)
  // Handle both with and without markdown bold markers
  const parts = n.split(":").map((p) => normalize(p)).filter(Boolean);
  if (parts.length >= 3) {
    const head = parts[0];
    // Check if all parts after the first are the same as the first
    const repeats = parts.slice(1).every((p) => p === head);
    if (repeats) {
      return { type: "colon-repeat", snippet: head, original: line };
    }
  }

  // Case 1b: Handle markdown bold pattern: **text**: **text**: **text**
  const boldPattern = /\*\*([^*]+)\*\*:\s*\*\*([^*]+)\*\*:\s*\*\*([^*]+)\*\*/;
  const boldMatch = line.match(boldPattern);
  if (boldMatch) {
    const [, part1, part2, part3] = boldMatch;
    const n1 = normalize(part1);
    const n2 = normalize(part2);
    const n3 = normalize(part3);
    if (n1 === n2 && n2 === n3 && n1.length >= 20) {
      return { type: "bold-colon-repeat", snippet: part1, original: line };
    }
  }

  // Case 2: same sentence repeated multiple times
  // Split into chunks by punctuation and see if any chunk repeats >= 3 times
  const chunks = n
    .split(/[.!?]/)
    .map((c) => normalize(c))
    .filter((c) => c.length >= 25);
  const counts = new Map();
  for (const c of chunks) counts.set(c, (counts.get(c) || 0) + 1);
  for (const [c, ct] of counts.entries()) {
    if (ct >= 3) {
      return { type: "sentence-repeat", snippet: c, original: line };
    }
  }

  // Case 3: repeated substring pattern
  // If line is largely made of a repeated segment (rough heuristic)
  for (let len = 30; len <= 120; len += 10) {
    const seg = n.slice(0, len);
    if (seg.length < 30) continue;
    const occurrences = n.split(seg).length - 1;
    if (occurrences >= 3) {
      return { type: "substring-repeat", snippet: seg, original: line };
    }
  }

  return null;
}

const files = CONTENT_DIRS.flatMap((d) => {
  const fullPath = path.join(ROOT, d);
  return walk(fullPath);
});

console.log(`Scanning ${files.length} markdown files in course/ directory...\n`);

let issues = 0;
const issuesByFile = new Map();

for (const file of files) {
  const relativePath = path.relative(ROOT, file);
  try {
    const raw = fs.readFileSync(file, "utf8");
    const lines = raw.split(/\r?\n/);

    lines.forEach((line, i) => {
      const hit = findRepeatsInLine(line);
      if (hit) {
        issues++;
        if (!issuesByFile.has(relativePath)) {
          issuesByFile.set(relativePath, []);
        }
        issuesByFile.get(relativePath).push({
          lineNum: i + 1,
          type: hit.type,
          snippet: hit.snippet,
          original: hit.original,
        });
      }
    });
  } catch (err) {
    console.error(`Error reading ${relativePath}:`, err.message);
  }
}

// Print results grouped by file
for (const [file, fileIssues] of issuesByFile.entries()) {
  console.log(`\n📄 ${file}`);
  for (const issue of fileIssues) {
    console.log(
      `  Line ${issue.lineNum} [${issue.type}]:\n    → ${issue.original.trim().slice(0, 200)}${issue.original.trim().length > 200 ? "…" : ""}`
    );
    console.log(`    → snippet: ${issue.snippet.slice(0, 120)}${issue.snippet.length > 120 ? "…" : ""}`);
  }
}

console.log(`\n✅ Done. Found ${issues} potential duplicate-text issue(s) across ${issuesByFile.size} file(s).`);
process.exitCode = issues ? 1 : 0;
