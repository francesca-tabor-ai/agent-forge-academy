# Role Hero Images

This file contains hero image mappings for job roles (Best For).

## Format

Each entry follows the format: `role_key | display_name | image_url`

Where:
- `role_key`: URL-friendly slug (e.g., "engineer", "tech-lead", "pm")
- `display_name`: Human-readable display name (e.g., "Engineer", "Tech Lead", "PM")
- `image_url`: Full URL to the hero image or relative path from public directory

---

## Role Images

```
engineer | Engineer | 
tech-lead | Tech Lead | 
pm | PM | 
founder | Founder | 
marketer | Marketer | 
content-team | Content Team | 
data-team | Data Team | 
growth-team | Growth Team | 
sales-team | Sales Team | 
cx-team | CX Team | 
```

---

## Notes

- All image URLs should be absolute URLs (starting with `http://` or `https://`) or relative paths from the public directory (starting with `/`)
- For local images, place them in `public/landing/` directory
- If image_url is empty, the resolver will use the default fallback: `/landing/default-role.jpg`
- To update images, simply replace the URL in the format above
