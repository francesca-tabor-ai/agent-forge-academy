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

// Fix duplicate text patterns
function fixDuplicatesInLine(line) {
  // Pattern: **text**: **text**: **text** -> **text**
  const boldPattern = /(\*\*[^*]+\*\*):\s*\1:\s*\1/;
  const match = line.match(boldPattern);
  if (match) {
    // Replace the entire pattern with just the first occurrence
    return line.replace(boldPattern, "$1");
  }
  return line;
}

const files = CONTENT_DIRS.flatMap((d) => {
  const fullPath = path.join(ROOT, d);
  return walk(fullPath);
});

console.log(`Scanning ${files.length} markdown files for duplicates to fix...\n`);

let fixedCount = 0;
const fixedFiles = [];

for (const file of files) {
  const relativePath = path.relative(ROOT, file);
  try {
    const raw = fs.readFileSync(file, "utf8");
    const lines = raw.split(/\r?\n/);
    let fileModified = false;
    const fixedLines = lines.map((line) => {
      const fixed = fixDuplicatesInLine(line);
      if (fixed !== line) {
        fileModified = true;
        fixedCount++;
      }
      return fixed;
    });

    if (fileModified) {
      fs.writeFileSync(file, fixedLines.join("\n"), "utf8");
      fixedFiles.push(relativePath);
      console.log(`✅ Fixed duplicates in: ${relativePath}`);
    }
  } catch (err) {
    console.error(`❌ Error processing ${relativePath}:`, err.message);
  }
}

console.log(`\n✅ Done. Fixed ${fixedCount} duplicate line(s) across ${fixedFiles.length} file(s).`);
if (fixedFiles.length > 0) {
  console.log("\nFixed files:");
  fixedFiles.forEach((f) => console.log(`  - ${f}`));
}
