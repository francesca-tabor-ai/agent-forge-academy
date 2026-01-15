/**
 * Industry cover image mapping
 * Single source of truth for course card images by industry
 * 
 * Images should be placed in: public/course-covers/industry/
 */

export const INDUSTRY_COVERS: Record<string, string> = {
  Finance: "https://www.esri.com/about/newsroom/app/uploads/2022/03/is-spatial-finance-coming-to-your-company-wherenext-article-wide-1920x1080-1.jpg",
  "E-commerce": "/course-covers/industry/ecommerce.jpg",
  SaaS: "/course-covers/industry/saas.jpg",
  Healthcare: "https://www.sutherlandglobal.com/wp-content/uploads/sites/2/AI-in-Healthcare-859x507-1.jpg",
  "Trust & Regulation": "https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg",
  "Media & Content": "https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png",
  Default: "/images/tracks/default.jpg",
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
