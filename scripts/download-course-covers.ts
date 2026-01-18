/**
 * Script to download and optimize course cover images
 * 
 * This script downloads images from external URLs and saves them
 * to the appropriate local directories with proper naming.
 * 
 * Usage:
 *   npx tsx scripts/download-course-covers.ts
 * 
 * Requirements:
 *   - Node.js with fetch support (Node 18+)
 *   - Image optimization: Install sharp for better results
 *     npm install --save-dev sharp
 */

import fs from 'fs';
import path from 'path';

// Configuration
const BASE_DIR = path.join(process.cwd(), 'public', 'course-covers');
const INDUSTRY_DIR = path.join(BASE_DIR, 'industry');
const TRACK_DIR = path.join(BASE_DIR, 'track');

// Industry images to download
const INDUSTRY_IMAGES: Record<string, string> = {
  'finance': 'https://www.esri.com/about/newsroom/app/uploads/2022/03/is-spatial-finance-coming-to-your-company-wherenext-article-wide-1920x1080-1.jpg',
  'healthcare': 'https://www.sutherlandglobal.com/wp-content/uploads/sites/2/AI-in-Healthcare-859x507-1.jpg',
  'e-commerce': 'https://cdn.shopify.com/s/files/1/0070/7032/articles/Header_7512ee53-c680-44d7-abc2-21ef61095558.png?v=1764713881',
  'saas': 'https://500apps.com/images/blog/saas-apps.png?v=1677747568403012820',
  'media-and-publishing': 'https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png',
  'devtools': 'https://8allocate.com/wp-content/uploads/2024/01/The-Future-of-Software-Engineering_-Predictions-for-2024.jpg',
  'legal-and-compliance': 'https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg',
};

// Track images to download
const TRACK_IMAGES: Record<string, string> = {
  'ai-search-and-visibility': 'https://fueled.com/wp-content/uploads/2025/07/AI-Brand-Visibility-Header.webp?w=1920',
  'agentic-systems': 'https://cdn.mos.cms.futurecdn.net/8L4whkBm9JWJDnEd7XSd8B.jpg',
  'shopping-and-e-commerce': 'https://www.mirakl.com/_ipx/w_3840,q_100/https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png?url=https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png&w=3840&q=100',
  'media-and-content-ops': 'https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png',
  'trust-and-regulation': 'https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg',
  'ml-engineering': 'https://www.databricks.com/sites/default/files/styles/max_1000x1000/public/2025-12/machine-learning-engineering-complete-guide-building-production-ml-systems-og-image.png?itok=mhHGdHwy&v=1765535043',
  'vibe-engineering': 'https://www.windowsnoticias.com/wp-content/uploads/2025/04/0_vOaWDgTmVpMfi9ws.png',
  'platform-engineering': 'https://8allocate.com/wp-content/uploads/2024/01/The-Future-of-Software-Engineering_-Predictions-for-2024.jpg',
  'gtm-and-revenue-operations': 'https://wp.sfdcdigital.com/en-us/wp-content/uploads/sites/4/2024/08/revenue-ops.jpg?w=1024',
  'creative-ai': 'https://cached.imagescaler.hbpl.co.uk/resize/scaleWidth/815/cached.offlinehbpl.hbpl.co.uk/news/OMC/Human-creativity-v-machine-creativity-20180614032816356.jpg',
  'audio-and-voice': 'https://media.bazaarvoice.com/Shutterstock_1159197631.png',
};

/**
 * Download an image from URL and save to file
 */
async function downloadImage(url: string, filePath: string): Promise<void> {
  try {
    console.log(`Downloading: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✓ Saved: ${filePath} (${sizeKB} KB)`);
  } catch (error) {
    console.error(`✗ Failed to download ${url}:`, error);
    throw error;
  }
}

/**
 * Ensure directory exists
 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting course cover image download...\n');
  
  // Ensure directories exist
  ensureDir(INDUSTRY_DIR);
  ensureDir(TRACK_DIR);
  
  // Download industry images
  console.log('\n📁 Downloading industry images...');
  for (const [filename, url] of Object.entries(INDUSTRY_IMAGES)) {
    const filePath = path.join(INDUSTRY_DIR, `${filename}.jpg`);
    
    // Skip if already exists
    if (fs.existsSync(filePath)) {
      console.log(`⏭  Skipping ${filename}.jpg (already exists)`);
      continue;
    }
    
    try {
      await downloadImage(url, filePath);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to download ${filename}:`, error);
    }
  }
  
  // Download track images
  console.log('\n📁 Downloading track images...');
  for (const [filename, url] of Object.entries(TRACK_IMAGES)) {
    const filePath = path.join(TRACK_DIR, `${filename}.jpg`);
    
    // Skip if already exists
    if (fs.existsSync(filePath)) {
      console.log(`⏭  Skipping ${filename}.jpg (already exists)`);
      continue;
    }
    
    try {
      await downloadImage(url, filePath);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to download ${filename}:`, error);
    }
  }
  
  console.log('\n✅ Download complete!');
  console.log('\n⚠️  Note: Downloaded images may need optimization.');
  console.log('   - Resize to 1920x1080px if needed');
  console.log('   - Optimize file size to < 500KB');
  console.log('   - Use tools like Squoosh (https://squoosh.app/) or ImageMagick');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { downloadImage, ensureDir };
