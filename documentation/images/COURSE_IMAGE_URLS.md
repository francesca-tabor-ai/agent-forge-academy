# Course Image URLs Configuration

This file contains all course tracks (categories), industries, and roles with their hero image URLs.

## Image Usage Policy

- **Course Images**: Always use the **Track** image. Course cards and course detail pages display the track image.
- **Landing Pages**: Use **Industry** images for industry landing pages and **Role** images for role landing pages.

## Format

Each entry follows the format: `key | display | image_url`

Where:
- `key`: URL-friendly slug (e.g., "ai-search-visibility", "finance", "engineer")
- `display`: Human-readable display name (e.g., "AI Search & Visibility", "Finance", "Engineer")
- `image_url`: Full URL to the hero image

---

## TRACKS (Categories)

**Used for**: Course images (course cards, course detail pages)

Tracks are the primary source of images for courses. Every course displays its track image.

```
ai-search-visibility | AI Search & Visibility | https://fueled.com/wp-content/uploads/2025/07/AI-Brand-Visibility-Header.webp?w=1920
agentic-systems | Agentic Systems | https://cdn.mos.cms.futurecdn.net/8L4whkBm9JWJDnEd7XSd8B.jpg
shopping-ecommerce | Shopping & E-Commerce | https://www.mirakl.com/_ipx/w_3840,q_100/https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png?url=https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png&w=3840&q=100
media-content-ops | Media & Content Ops | https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png
trust-regulation | Trust & Regulation | https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg
ml-engineering | ML Engineering | https://www.databricks.com/sites/default/files/styles/max_1000x1000/public/2025-12/machine-learning-engineering-complete-guide-building-production-ml-systems-og-image.png?itok=mhHGdHwy&v=1765535043
vibe-engineering | Vibe Engineering | https://www.windowsnoticias.com/wp-content/uploads/2025/04/0_vOaWDgTmVpMfi9ws.png
platform-engineering | Platform Engineering | https://8allocate.com/wp-content/uploads/2024/01/The-Future-of-Software-Engineering_-Predictions-for-2024.jpg
gtm-revenue-operations | GTM & Revenue Operations | https://wp.sfdcdigital.com/en-us/wp-content/uploads/sites/4/2024/08/revenue-ops.jpg?w=1024
creative-ai | Creative AI | https://blogs-cdn.imagine.art/creative_ai_art_prompts_a67d64e4eb.png
audio-voice | Audio & Voice | https://media.bazaarvoice.com/Shutterstock_1159197631.png
predictions | Predictions | https://assets.newatlas.com/dims4/default/5a3e663/2147483647/strip/true/crop/6000x4000+0+0/resize/2880x1920!/format/webp/quality/90/?url=https%3A%2F%2Fnewatlas-brightspot.s3.amazonaws.com%2F25%2Fff%2F3f853d4a4583b0ef6008830f1a21%2Fdepositphotos-220004838-xl.jpg
```

---

## INDUSTRIES

**Used for**: Industry landing pages only (NOT for course images)

Industry images are displayed on industry landing pages (`/landing/industry/[slug]`). They are NOT used for course images - courses always use their track image.

```
finance | Finance | https://www.esri.com/about/newsroom/app/uploads/2022/03/is-spatial-finance-coming-to-your-company-wherenext-article-wide-1920x1080-1.jpg
healthcare | Healthcare | https://www.sutherlandglobal.com/wp-content/uploads/sites/2/AI-in-Healthcare-859x507-1.jpg
ecommerce | E-commerce | https://cdn.shopify.com/s/files/1/0070/7032/articles/Header_7512ee53-c680-44d7-abc2-21ef61095558.png?v=1764713881
saas | SaaS | https://500apps.com/images/blog/saas-apps.png?v=1677747568403012820
trust-regulation | Trust & Regulation | https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg
media-content | Media & Content | https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png
legal-compliance | Legal & Compliance | https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg
b2b-sales-revops | B2B Sales / RevOps | https://wp.sfdcdigital.com/en-us/wp-content/uploads/sites/4/2024/08/revenue-ops.jpg?w=1024
devtools | DevTools | https://8allocate.com/wp-content/uploads/2024/01/The-Future-of-Software-Engineering_-Predictions-for-2024.jpg
retail-cpg | Retail / CPG | https://cdn.shopify.com/s/files/1/0070/7032/articles/Header_7512ee53-c680-44d7-abc2-21ef61095558.png?v=1764713881
marketplaces | Marketplaces | https://www.mirakl.com/_ipx/w_3840,q_100/https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png?url=https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png&w=3840&q=100
media-publishing | Media & Publishing | https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png
```

---

## ROLES

**Used for**: Role landing pages only (NOT for course images)

Role images are displayed on role landing pages (`/landing/role/[slug]`). They are NOT used for course images - courses always use their track image.

```
engineer | Engineer | https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80
product-manager | Product Manager | https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80
data-scientist | Data Scientist | https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80
designer | Designer | https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1920&q=80
marketer | Marketer | https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&q=80
founder | Founder | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
analyst | Analyst | https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80
leader | Leader | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
director | Director | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
executive | Executive | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
manager | Manager | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
specialist | Specialist | https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80
consultant | Consultant | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
advisor | Advisor | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
officer | Officer | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
strategist | Strategist | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
developer | Developer | https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80
architect | Architect | https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80
```

---

## Default Fallback

If no track, industry, or role image is found:
```
default | Default | https://wallpaperaccess.com/full/340554.png
```

---

## Notes

- **Course Images**: Always use track images via `resolveCourseImageUrl()` or `getCourseCover()`
- **Landing Page Images**: Use industry/role images via `getIndustryHeroImage()` or `getRoleHeroImage()` from `lib/utils/hero-image-resolver.ts`
- All image URLs should be absolute URLs (starting with `http://` or `https://`) or relative paths from the public directory (starting with `/`)
- For local images, place them in `public/images/tracks/`, `public/images/industries/`, or `public/images/roles/`
- To update images, simply replace the URL in the format above
- The resolver automatically loads this file and provides functions to get hero images by slug

## Implementation

- Course image resolution: `lib/utils/course-image-resolver.ts` - always uses track images
- Landing page hero images: `lib/utils/hero-image-resolver.ts` - uses industry/role images
