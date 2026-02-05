#!/usr/bin/env node
/* eslint-disable no-undef */

/**
 * Script to update sitemap.xml with current date
 * This runs automatically during the build process
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sitemapPath = join(__dirname, '../public/sitemap.xml');

try {
  // Read current sitemap
  let sitemap = readFileSync(sitemapPath, 'utf-8');

  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  // Update lastmod date
  sitemap = sitemap.replace(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/,
    `<lastmod>${currentDate}</lastmod>`
  );

  // Write updated sitemap
  writeFileSync(sitemapPath, sitemap, 'utf-8');

  console.log(`✅ Sitemap updated with date: ${currentDate}`);
  process.exit(0);
} catch (error) {
  console.error('❌ Error updating sitemap:', error.message);
  process.exit(1);
}
