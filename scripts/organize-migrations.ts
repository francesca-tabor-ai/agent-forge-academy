#!/usr/bin/env tsx
/**
 * Script to organize Supabase migrations into "migrated" and "to do" folders
 * 
 * Usage:
 *   1. Query your database to get applied migrations:
 *      SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;
 *   
 *   2. Save the results to a file (one version per line) or pass as argument
 *   
 *   3. Run this script:
 *      tsx scripts/organize-migrations.ts [applied-migrations.txt]
 *   
 *   Or provide versions as comma-separated list:
 *      tsx scripts/organize-migrations.ts --versions "20250107000001,20250107000002,..."
 */

import { readFileSync, readdirSync, statSync, renameSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');
const MIGRATED_DIR = join(MIGRATIONS_DIR, 'migrated');
const TODO_DIR = join(MIGRATIONS_DIR, 'to do');

interface MigrationFile {
  filename: string;
  version: string | null;
  fullPath: string;
}

function extractVersion(filename: string): string | null {
  // Extract version from filename like "20250107000001_create_profiles_table.sql"
  const match = filename.match(/^(\d{14})_/);
  return match ? match[1] : null;
}

function getAllMigrationFiles(): MigrationFile[] {
  const files: MigrationFile[] = [];
  
  if (!existsSync(MIGRATIONS_DIR)) {
    console.error(`❌ Migrations directory not found: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  const entries = readdirSync(MIGRATIONS_DIR);
  
  for (const entry of entries) {
    const fullPath = join(MIGRATIONS_DIR, entry);
    const stat = statSync(fullPath);
    
    // Skip directories and non-SQL files
    if (stat.isDirectory() || !entry.endsWith('.sql')) {
      continue;
    }
    
    const version = extractVersion(entry);
    files.push({
      filename: entry,
      version,
      fullPath,
    });
  }
  
  return files.sort((a, b) => {
    // Sort by version if available, otherwise by filename
    if (a.version && b.version) {
      return a.version.localeCompare(b.version);
    }
    return a.filename.localeCompare(b.filename);
  });
}

function loadAppliedMigrations(input?: string): Set<string> {
  const applied = new Set<string>();
  
  if (!input) {
    console.log('📋 No applied migrations provided. All files will be moved to "to do".');
    return applied;
  }
  
  // Check if it's a file path
  if (existsSync(input)) {
    const content = readFileSync(input, 'utf-8');
    content.split('\n').forEach(line => {
      const version = line.trim();
      if (version && /^\d{14}$/.test(version)) {
        applied.add(version);
      }
    });
    console.log(`✅ Loaded ${applied.size} applied migrations from file: ${input}`);
  } 
  // Check if it's a comma-separated list
  else if (input.includes(',')) {
    input.split(',').forEach(version => {
      const v = version.trim();
      if (v && /^\d{14}$/.test(v)) {
        applied.add(v);
      }
    });
    console.log(`✅ Loaded ${applied.size} applied migrations from comma-separated list`);
  }
  // Single version
  else if (/^\d{14}$/.test(input.trim())) {
    applied.add(input.trim());
    console.log(`✅ Loaded 1 applied migration version`);
  }
  
  return applied;
}

function ensureDirectories() {
  if (!existsSync(MIGRATED_DIR)) {
    mkdirSync(MIGRATED_DIR, { recursive: true });
    console.log(`📁 Created directory: migrated/`);
  }
  
  if (!existsSync(TODO_DIR)) {
    mkdirSync(TODO_DIR, { recursive: true });
    console.log(`📁 Created directory: to do/`);
  }
}

function organizeMigrations(appliedMigrations: Set<string>) {
  ensureDirectories();
  
  const files = getAllMigrationFiles();
  let migratedCount = 0;
  let todoCount = 0;
  const migrated: string[] = [];
  const todo: string[] = [];
  
  console.log(`\n🔍 Found ${files.length} migration files\n`);
  
  for (const file of files) {
    const isApplied = file.version ? appliedMigrations.has(file.version) : false;
    const targetDir = isApplied ? MIGRATED_DIR : TODO_DIR;
    const targetPath = join(targetDir, file.filename);
    
    // Skip if already in the correct location
    if (file.fullPath === targetPath) {
      continue;
    }
    
    try {
      renameSync(file.fullPath, targetPath);
      
      if (isApplied) {
        migratedCount++;
        migrated.push(file.filename);
        console.log(`✅ Moved to migrated/: ${file.filename}`);
      } else {
        todoCount++;
        todo.push(file.filename);
        console.log(`📝 Moved to to do/: ${file.filename}`);
      }
    } catch (error) {
      console.error(`❌ Failed to move ${file.filename}:`, error);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Migrated: ${migratedCount} files`);
  console.log(`   📝 To do: ${todoCount} files`);
  
  if (migrated.length > 0) {
    console.log(`\n✅ Migrated files:`);
    migrated.forEach(f => console.log(`   - ${f}`));
  }
  
  if (todo.length > 0) {
    console.log(`\n📝 Files to migrate:`);
    todo.forEach(f => console.log(`   - ${f}`));
  }
}

// Main execution
const args = process.argv.slice(2);
let input: string | undefined;

if (args.length > 0) {
  if (args[0] === '--versions' && args[1]) {
    input = args[1];
  } else {
    input = args[0];
  }
}

console.log('🚀 Organizing Supabase migrations...\n');
const appliedMigrations = loadAppliedMigrations(input);
organizeMigrations(appliedMigrations);
console.log('\n✨ Done!');
