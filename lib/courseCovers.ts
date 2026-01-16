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
  Default: "https://wallpaperaccess.com/full/340554.png",
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
