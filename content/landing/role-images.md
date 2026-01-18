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
advisor | Advisor | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
analyst | Analyst | https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80
architect | Architect | https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80
consultant | Consultant | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
data-scientist | Data Scientist | https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80
designer | Designer | https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1920&q=80
developer | Developer | https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80
director | Director | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
engineer | Engineer | https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80
executive | Executive | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
founder | Founder | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
leader | Leader | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
manager | Manager | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
marketer | Marketer | https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&q=80
officer | Officer | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
product-manager | Product Manager | https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80
specialist | Specialist | https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80
strategist | Strategist | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80
```

---

## Notes

- All image URLs should be absolute URLs (starting with `http://` or `https://`) or relative paths from the public directory (starting with `/`)
- For local images, place them in `public/landing/` directory
- If image_url is empty, the resolver will use the default fallback: `/landing/default-role.jpg`
- To update images, simply replace the URL in the format above
