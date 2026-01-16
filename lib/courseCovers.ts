/**
 * Industry cover image mapping
 * Single source of truth for course card images by industry
 * 
 * Images should be placed in: public/course-covers/industry/
 */

export const INDUSTRY_COVERS: Record<string, string> = {
  Finance: "https://www.esri.com/about/newsroom/app/uploads/2022/03/is-spatial-finance-coming-to-your-company-wherenext-article-wide-1920x1080-1.jpg",
  "E-commerce": "https://cdn.shopify.com/s/files/1/0070/7032/articles/Header_7512ee53-c680-44d7-abc2-21ef61095558.png?v=1764713881",
  SaaS: "https://500apps.com/images/blog/saas-apps.png?v=1677747568403012820",
  Healthcare: "https://www.sutherlandglobal.com/wp-content/uploads/sites/2/AI-in-Healthcare-859x507-1.jpg",
  "Trust & Regulation": "https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg",
  "Media & Content": "https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png",
  Default: "/course-covers/industry/default.jpg",
};

/**
 * Track/Category cover image mapping
 * Maps course tracks (categories) to cover images
 */
export const TRACK_COVERS: Record<string, string> = {
  "AI Search & Visibility": "https://fueled.com/wp-content/uploads/2025/07/AI-Brand-Visibility-Header.webp?w=1920",
  "Agentic Systems": "https://cdn.mos.cms.futurecdn.net/8L4whkBm9JWJDnEd7XSd8B.jpg",
  "Shopping & E-Commerce": "https://www.mirakl.com/_ipx/w_3840,q_100/https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png?url=https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png&w=3840&q=100",
  "Media & Content Ops": "https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png",
  "Trust & Regulation": "https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg",
  "ML Engineering": "https://www.databricks.com/sites/default/files/styles/max_1000x1000/public/2025-12/machine-learning-engineering-complete-guide-building-production-ml-systems-og-image.png?itok=mhHGdHwy&v=1765535043",
  "Vibe Engineering": "https://www.windowsnoticias.com/wp-content/uploads/2025/04/0_vOaWDgTmVpMfi9ws.png",
  "Platform Engineering": "https://8allocate.com/wp-content/uploads/2024/01/The-Future-of-Software-Engineering_-Predictions-for-2024.jpg",
  "GTM & Revenue Operations": "https://wp.sfdcdigital.com/en-us/wp-content/uploads/sites/4/2024/08/revenue-ops.jpg?w=1024",
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
