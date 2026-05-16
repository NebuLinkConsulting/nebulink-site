import fs from 'fs-extra';
import path from 'path';
import TurndownService from 'turndown';

const SOURCE_DIR = './src/content/insights';
const DEST_DIR = './src/content/insights';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '*'
});

async function runMigration() {
  try {
    const files = await fs.readdir(SOURCE_DIR);
    // Grab absolutely everything except actual .md files or hidden folders
    const filesToConvert = files.filter(file => !file.endsWith('.md') && !file.startsWith('.'));

    console.log(`📡 Found ${filesToConvert.length} raw files. Forcing database conversion...`);

    for (const file of filesToConvert) {
      const filePath = path.join(SOURCE_DIR, file);
      const htmlContent = await fs.readFile(filePath, 'utf-8');

      // Clean up the front numbers and weird symbols for a crisp URL slug
      let cleanSlug = file
        .replace(/^[0-9]+[\.\-_]*/, '') // Strips out the Substack number strings at the front
        .replace(/\.[^/.]+$/, "")       // Strips out any weird trailing extensions
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-');  // Normalizes characters for safe URLs

      // Create a readable title from the slug
      const standardTitle = cleanSlug
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      const markdownBody = turndownService.turndown(htmlContent);

      const frontmatter = `---
title: "${standardTitle}"
date: "May 16, 2026"
tag: "Space Intelligence"
excerpt: "Strategic intelligence analysis briefing retrieved from core database archives."
---

`;

      const finalContent = frontmatter + markdownBody;
      const destinationPath = path.join(DEST_DIR, `${cleanSlug}.md`);

      await fs.writeFile(destinationPath, finalContent, 'utf-8');
      await fs.remove(filePath); // Purges the old weird file format

      console.log(`✅ Converted & Normalized: ${cleanSlug}.md`);
    }

    console.log('🏁 Batch conversion success! All files normalized to standard .md paths.');
  } catch (error) {
    console.error('❌ Migration engine failure:', error);
  }
}

runMigration();