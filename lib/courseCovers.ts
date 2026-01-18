/**
 * Industry cover image mapping
 * Single source of truth for course card images by industry
 * 
 * Images should be placed in: public/course-covers/industry/
 * 
 * Priority: Local images (in /public) are preferred for performance and reliability.
 * External URLs are kept as fallback for industries that don't have local images yet.
 */

/**
 * Convert industry/track name to URL-friendly filename
 * e.g., "E-commerce" -> "e-commerce", "AI Search & Visibility" -> "ai-search-visibility"
 */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * External image URLs (fallback for industries without local images)
 */
const INDUSTRY_EXTERNAL_URLS: Record<string, string> = {
  Finance: "https://www.esri.com/about/newsroom/app/uploads/2022/03/is-spatial-finance-coming-to-your-company-wherenext-article-wide-1920x1080-1.jpg",
  "E-commerce": "https://cdn.shopify.com/s/files/1/0070/7032/articles/Header_7512ee53-c680-44d7-abc2-21ef61095558.png?v=1764713881",
  SaaS: "https://500apps.com/images/blog/saas-apps.png?v=1677747568403012820",
  Healthcare: "https://www.sutherlandglobal.com/wp-content/uploads/sites/2/AI-in-Healthcare-859x507-1.jpg",
  "Trust & Regulation": "https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg",
  "Media & Content": "https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png",
  "Media & Publishing": "https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png",
  "Legal & Compliance": "https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg",
  "B2B Sales / RevOps": "https://wp.sfdcdigital.com/en-us/wp-content/uploads/sites/4/2024/08/revenue-ops.jpg?w=1024",
  DevTools: "https://8allocate.com/wp-content/uploads/2024/01/The-Future-of-Software-Engineering_-Predictions-for-2024.jpg",
  "Retail / CPG": "https://cdn.shopify.com/s/files/1/0070/7032/articles/Header_7512ee53-c680-44d7-abc2-21ef61095558.png?v=1764713881",
  Marketplaces: "https://www.mirakl.com/_ipx/w_3840,q_100/https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png?url=https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png&w=3840&q=100",
};

/**
 * Industries that have local images available
 * Add industries here as local images are added to /public/course-covers/industry/
 */
const INDUSTRIES_WITH_LOCAL_IMAGES: Set<string> = new Set([
  // Priority industries (most common)
  'Finance',
  'Healthcare',
  // Top industries
  'E-commerce',
  'SaaS',
  'Media & Publishing',
  'DevTools',
  'Legal & Compliance',
]);

/**
 * Get industry cover image URL
 * Returns local path if available, otherwise external URL
 */
function getIndustryImageUrl(industry: string): string {
  // Check if we have a local image for this industry
  if (INDUSTRIES_WITH_LOCAL_IMAGES.has(industry)) {
    const slug = toSlug(industry);
    return `/course-covers/industry/${slug}.jpg`;
  }
  
  // Fallback to external URL
  return INDUSTRY_EXTERNAL_URLS[industry] || '/course-covers/industry/default.jpg';
}

/**
 * Industry cover image mapping
 * Uses local images when available, falls back to external URLs
 */
export const INDUSTRY_COVERS: Record<string, string> = {
  Finance: getIndustryImageUrl('Finance'),
  "E-commerce": getIndustryImageUrl('E-commerce'),
  SaaS: getIndustryImageUrl('SaaS'),
  Healthcare: getIndustryImageUrl('Healthcare'),
  "Trust & Regulation": getIndustryImageUrl('Trust & Regulation'),
  "Media & Content": getIndustryImageUrl('Media & Content'),
  "Media & Publishing": getIndustryImageUrl('Media & Publishing'),
  "Legal & Compliance": getIndustryImageUrl('Legal & Compliance'),
  "B2B Sales / RevOps": getIndustryImageUrl('B2B Sales / RevOps'),
  DevTools: getIndustryImageUrl('DevTools'),
  "Retail / CPG": getIndustryImageUrl('Retail / CPG'),
  Marketplaces: getIndustryImageUrl('Marketplaces'),
  Default: "/course-covers/industry/default.jpg",
};

/**
 * External image URLs for tracks (fallback for tracks without local images)
 */
const TRACK_EXTERNAL_URLS: Record<string, string> = {
  "AI Search & Visibility": "https://fueled.com/wp-content/uploads/2025/07/AI-Brand-Visibility-Header.webp?w=1920",
  "Agentic Systems": "https://cdn.mos.cms.futurecdn.net/8L4whkBm9JWJDnEd7XSd8B.jpg",
  "Shopping & E-Commerce": "https://www.mirakl.com/_ipx/w_3840,q_100/https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png?url=https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png&w=3840&q=100",
  "Media & Content Ops": "https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png",
  "Trust & Regulation": "https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg",
  "ML Engineering": "https://www.databricks.com/sites/default/files/styles/max_1000x1000/public/2025-12/machine-learning-engineering-complete-guide-building-production-ml-systems-og-image.png?itok=mhHGdHwy&v=1765535043",
  "Vibe Engineering": "https://www.windowsnoticias.com/wp-content/uploads/2025/04/0_vOaWDgTmVpMfi9ws.png",
  "Platform Engineering": "https://8allocate.com/wp-content/uploads/2024/01/The-Future-of-Software-Engineering_-Predictions-for-2024.jpg",
  "GTM & Revenue Operations": "https://wp.sfdcdigital.com/en-us/wp-content/uploads/sites/4/2024/08/revenue-ops.jpg?w=1024",
  "Creative AI": "https://cached.imagescaler.hbpl.co.uk/resize/scaleWidth/815/cached.offlinehbpl.hbpl.co.uk/news/OMC/Human-creativity-v-machine-creativity-20180614032816356.jpg",
  "Audio & Voice": "https://media.bazaarvoice.com/Shutterstock_1159197631.png",
};

/**
 * Tracks that have local images available
 * Add tracks here as local images are added to /public/course-covers/track/
 */
const TRACKS_WITH_LOCAL_IMAGES: Set<string> = new Set([
  // All tracks should eventually have local images
  // For now, we'll use external URLs as fallback
  // Add tracks here as local images are added:
  // 'AI Search & Visibility',
  // 'Agentic Systems',
  // etc.
]);

/**
 * Get track cover image URL
 * Returns local path if available, otherwise external URL
 */
function getTrackImageUrl(track: string): string {
  // Check if we have a local image for this track
  if (TRACKS_WITH_LOCAL_IMAGES.has(track)) {
    const slug = toSlug(track);
    return `/course-covers/track/${slug}.jpg`;
  }
  
  // Fallback to external URL
  return TRACK_EXTERNAL_URLS[track] || '/course-covers/industry/default.jpg';
}

/**
 * Track/Category cover image mapping
 * Maps course tracks (categories) to cover images
 * Uses local images when available, falls back to external URLs
 */
export const TRACK_COVERS: Record<string, string> = {
  "AI Search & Visibility": getTrackImageUrl("AI Search & Visibility"),
  "Agentic Systems": getTrackImageUrl("Agentic Systems"),
  "Shopping & E-Commerce": getTrackImageUrl("Shopping & E-Commerce"),
  "Media & Content Ops": getTrackImageUrl("Media & Content Ops"),
  "Trust & Regulation": getTrackImageUrl("Trust & Regulation"),
  "ML Engineering": getTrackImageUrl("ML Engineering"),
  "Vibe Engineering": getTrackImageUrl("Vibe Engineering"),
  "Platform Engineering": getTrackImageUrl("Platform Engineering"),
  "GTM & Revenue Operations": getTrackImageUrl("GTM & Revenue Operations"),
  "Creative AI": getTrackImageUrl("Creative AI"),
  "Audio & Voice": getTrackImageUrl("Audio & Voice"),
};

/**
 * Get cover image for an industry
 * @param industry - Industry name (e.g., "Finance")
 * @returns Image URL for the industry, or default if not found
 */
export function getIndustryCover(industry: string | null | undefined): string {
  if (!industry) {
    return INDUSTRY_COVERS.Default;
  }
  return INDUSTRY_COVERS[industry] || INDUSTRY_COVERS.Default;
}

/**
 * Get cover image from industries array (uses first industry)
 * @param industries - Array of industry names
 * @returns Image URL for the first industry, or default if none found
 */
export function getCoverFromIndustries(industries: string[] | null | undefined): string {
  if (!industries || industries.length === 0) {
    return INDUSTRY_COVERS.Default;
  }
  return getIndustryCover(industries[0]);
}

/**
 * Course object interface for cover image resolution
 */
interface CourseForCover {
  industry?: string | null;
  industries?: string[] | null;
  track?: string | null;
  category?: string | null;
  metadata?: {
    category?: string | null;
    industries?: string[] | null;
  } | null;
}

/**
 * Get course cover image URL based on industry or track with fallback
 * Priority: course.industry -> course.track/category -> first industry from array -> default
 * 
 * @param course - Course object with industry, industries, track, category, or metadata
 * @returns Cover image URL for the course
 */
export function getCourseCover(course: CourseForCover | null | undefined): string {
  if (!course) {
    return INDUSTRY_COVERS.Default;
  }

  // Priority 1: Use course.industry (singular) if available
  if (course.industry) {
    const cover = getIndustryCover(course.industry);
    if (cover !== INDUSTRY_COVERS.Default) {
      return cover;
    }
  }

  // Priority 2: Use course.track or course.category (track fallback)
  const track = course.track || course.category || course.metadata?.category;
  if (track && TRACK_COVERS[track]) {
    return TRACK_COVERS[track];
  }

  // Priority 3: Use first industry from industries array
  const industries = course.industries || course.metadata?.industries;
  if (industries && industries.length > 0) {
    const cover = getCoverFromIndustries(industries);
    if (cover !== INDUSTRY_COVERS.Default) {
      return cover;
    }
  }

  // Priority 4: Default fallback
  return INDUSTRY_COVERS.Default;
}
