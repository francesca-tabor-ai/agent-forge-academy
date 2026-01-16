# Course Image URLs Configuration

This file contains all course tracks (categories) and industries where you can add image URLs.

## Priority Rules

1. **Track images** take priority over industry images
2. **EXCEPTION**: `Healthcare` and `Finance` industries take priority over tracks
3. Fallback order:
   - Per-course `imageUrl` (if set)
   - Industry image (Healthcare/Finance prioritized, then others)
   - Track image
   - Default fallback image

---

## TRACKS (Categories)

Tracks take priority over industries (except Healthcare and Finance).

### AI Search & Visibility
```
Image URL: https://fueled.com/wp-content/uploads/2025/07/AI-Brand-Visibility-Header.webp?w=1920
```

### Agentic Systems
```
Image URL: https://cdn.mos.cms.futurecdn.net/8L4whkBm9JWJDnEd7XSd8B.jpg
```

### Shopping & E-Commerce
```
Image URL: https://www.mirakl.com/_ipx/w_3840,q_100/https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png?url=https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png&w=3840&q=100
```

### Media & Content Ops
```
Image URL: https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png
```

### Trust & Regulation
```
Image URL: https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg
```

### ML Engineering
```
Image URL: https://www.databricks.com/sites/default/files/styles/max_1000x1000/public/2025-12/machine-learning-engineering-complete-guide-building-production-ml-systems-og-image.png?itok=mhHGdHwy&v=1765535043
```

### Vibe Engineering
```
Image URL: https://www.windowsnoticias.com/wp-content/uploads/2025/04/0_vOaWDgTmVpMfi9ws.png
```

### Platform Engineering
```
Image URL: https://8allocate.com/wp-content/uploads/2024/01/The-Future-of-Software-Engineering_-Predictions-for-2024.jpg
```

### GTM & Revenue Operations
```
Image URL: https://wp.sfdcdigital.com/en-us/wp-content/uploads/sites/4/2024/08/revenue-ops.jpg?w=1024
```

---

## INDUSTRIES

### Priority Industries (Take Priority Over Tracks)

#### Finance
```
Image URL: https://www.esri.com/about/newsroom/app/uploads/2022/03/is-spatial-finance-coming-to-your-company-wherenext-article-wide-1920x1080-1.jpg
```

#### Healthcare
```
Image URL: https://www.sutherlandglobal.com/wp-content/uploads/sites/2/AI-in-Healthcare-859x507-1.jpg
```

### Standard Industries (Tracks Take Priority)

#### E-commerce
```
Image URL: https://cdn.shopify.com/s/files/1/0070/7032/articles/Header_7512ee53-c680-44d7-abc2-21ef61095558.png?v=1764713881
```

#### SaaS
```
Image URL: https://500apps.com/images/blog/saas-apps.png?v=1677747568403012820
```

#### Trust & Regulation
```
Image URL: https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg
```

#### Media & Content
```
Image URL: https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png
```

---

## Default Fallback

If no track or industry image is found:
```
Image URL: https://wallpaperaccess.com/full/340554.png
```

---

## Notes

- All image URLs should be absolute URLs (starting with `http://` or `https://`) or relative paths from the public directory (starting with `/`)
- For local images, place them in `public/images/tracks/` or `public/course-covers/industry/`
- To update images, simply replace the URL in the `Image URL:` field above
- After updating, the changes will be reflected in:
  - `lib/utils/course-image-resolver.ts` (for tracks)
  - `lib/courseCovers.ts` (for industries)
