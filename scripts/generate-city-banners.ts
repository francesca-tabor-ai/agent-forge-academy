#!/usr/bin/env tsx
/**
 * Generate city banners TypeScript file from content/cities.md
 * 
 * Parses the cities.md file and generates lib/cityBanners.generated.ts
 * Fails build if duplicate city keys exist
 * Warns in console if URL is blank
 */

import * as fs from 'fs';
import * as path from 'path';

interface CityEntry {
  cityKey: string;
  displayName: string;
  country: string;
  url: string | null;
  lineNumber: number;
}

const CITIES_MD_PATH = path.join(process.cwd(), 'content', 'cities.md');
const OUTPUT_PATH = path.join(process.cwd(), 'lib', 'cityBanners.generated.ts');

function parseCitiesMd(content: string): CityEntry[] {
  const lines = content.split('\n');
  const entries: CityEntry[] = [];
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;
    
    // Skip empty lines, headers, and comments
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('(') || trimmed.startsWith('*') === false) {
      continue;
    }

    // Parse format: * city-key | Display Name | Country | URL
    // Remove leading * and whitespace
    const withoutBullet = trimmed.replace(/^\*\s*/, '');
    
    // Split by pipe
    const parts = withoutBullet.split('|').map(p => p.trim());
    
    if (parts.length < 3) {
      console.warn(`⚠️  Skipping line ${lineNumber}: Invalid format (expected at least 3 parts)`);
      continue;
    }

    const cityKey = parts[0];
    const displayName = parts[1] || cityKey;
    const country = parts[2] || '';
    const url = parts[3] || null;

    if (!cityKey) {
      console.warn(`⚠️  Skipping line ${lineNumber}: Missing city key`);
      continue;
    }

    entries.push({
      cityKey,
      displayName,
      country,
      url: url && url.length > 0 ? url : null,
      lineNumber,
    });
  }

  return entries;
}

function checkDuplicates(entries: CityEntry[]): void {
  const seen = new Map<string, number[]>();
  
  for (const entry of entries) {
    const normalizedKey = entry.cityKey.toLowerCase();
    if (!seen.has(normalizedKey)) {
      seen.set(normalizedKey, []);
    }
    seen.get(normalizedKey)!.push(entry.lineNumber);
  }

  const duplicates: Array<{ key: string; lines: number[] }> = [];
  for (const [key, lines] of seen.entries()) {
    if (lines.length > 1) {
      duplicates.push({ key, lines });
    }
  }

  if (duplicates.length > 0) {
    console.error('\n❌ ERROR: Duplicate city keys found:');
    for (const dup of duplicates) {
      console.error(`   "${dup.key}" appears on lines: ${dup.lines.join(', ')}`);
    }
    console.error('\nBuild failed: Duplicate city keys must be resolved.\n');
    process.exit(1);
  }
}

function warnBlankUrls(entries: CityEntry[]): void {
  const blankUrls = entries.filter(e => !e.url);
  
  if (blankUrls.length > 0) {
    console.warn(`\n⚠️  Warning: ${blankUrls.length} cities have blank URLs:`);
    for (const entry of blankUrls) {
      console.warn(`   - ${entry.cityKey} (${entry.displayName}, ${entry.country}) - line ${entry.lineNumber}`);
    }
    console.warn('');
  }
}

function generateTypeScript(entries: CityEntry[]): string {
  const timestamp = new Date().toISOString();
  
  let output = `/**
 * City Banner Image Mapping (Generated)
 * 
 * This file is auto-generated from content/cities.md
 * DO NOT EDIT MANUALLY - changes will be overwritten
 * 
 * Generated at: ${timestamp}
 * Total cities: ${entries.length}
 */

/**
 * City-to-image URL mapping
 * Keys are normalized city names (lowercase, e.g., "london", "new-york")
 * Values are banner image URLs
 */
export const CITY_BANNER_MAP: Record<string, string> = {
`;

  // Sort entries by city key for consistent output
  const sorted = [...entries].sort((a, b) => a.cityKey.localeCompare(b.cityKey));
  
  for (const entry of sorted) {
    const comment = `  // ${entry.displayName}, ${entry.country}`;
    // Convert hyphenated key to space-separated for lookup (e.g., "new-york" -> "new york")
    // This matches the format used in parseLocation() which stores cities as "new york"
    const key = entry.cityKey.toLowerCase().replace(/-/g, ' ');
    
    if (entry.url) {
      // Escape single quotes in URL
      const escapedUrl = entry.url.replace(/'/g, "\\'");
      output += `  '${key}': '${escapedUrl}', ${comment}\n`;
    } else {
      // Skip cities without URLs (they'll use default banner)
      output += `  // '${key}': '', ${comment} (URL missing - will use default banner)\n`;
    }
  }

  output += `};\n`;

  return output;
}

async function main() {
  console.log('🏙️  Generating city banners from content/cities.md...\n');

  // Read cities.md
  if (!fs.existsSync(CITIES_MD_PATH)) {
    console.error(`❌ ERROR: File not found: ${CITIES_MD_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(CITIES_MD_PATH, 'utf-8');
  
  // Parse entries
  const entries = parseCitiesMd(content);
  
  if (entries.length === 0) {
    console.warn('⚠️  Warning: No city entries found in cities.md');
    return;
  }

  console.log(`✓ Parsed ${entries.length} city entries\n`);

  // Check for duplicates (fails build)
  checkDuplicates(entries);

  // Warn about blank URLs
  warnBlankUrls(entries);

  // Generate TypeScript file
  const generated = generateTypeScript(entries);
  
  // Ensure lib directory exists
  const libDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  // Write generated file
  fs.writeFileSync(OUTPUT_PATH, generated, 'utf-8');
  
  console.log(`✓ Generated: ${OUTPUT_PATH}`);
  console.log(`✓ Total cities: ${entries.length}`);
  console.log(`✓ Cities with URLs: ${entries.filter(e => e.url).length}`);
  console.log(`✓ Cities without URLs: ${entries.filter(e => !e.url).length}\n`);
}

main().catch((error) => {
  console.error('❌ Error generating city banners:', error);
  process.exit(1);
});
