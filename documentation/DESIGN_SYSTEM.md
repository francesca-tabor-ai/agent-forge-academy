# AI Growth Hub Design System

## Color Palette

### Primary Brand Colors

**Brand Dark (#0b131a)**: Dark navy/charcoal
- **Use**: Backgrounds, structure, text on light backgrounds
- **Tailwind**: `bg-brand-dark`, `text-brand-dark`
- **Hex**: `#0b131a`

**Brand Light (#0580e8)**: Bright blue
- **Use**: Primary CTAs, buttons, accents, links
- **Tailwind**: `bg-brand-light`, `text-brand-light`
- **Hex**: `#0580e8`

**Brand Yellow (#c0ff60)**: Lime yellow
- **Use**: Highlights, hover states, interactive elements
- **Tailwind**: `bg-brand-yellow`, `text-brand-yellow`
- **Hex**: `#c0ff60`

### Opacity Variants

**Brand Dark:**
- `brand-dark/5` - Subtle backgrounds
- `brand-dark/10` - Light overlays
- `brand-dark/70` - Muted text

**Brand Light:**
- `brand-light/90` - Button hover states
- `brand-light/10` - Light overlays
- `brand-light/20` - Subtle backgrounds

## Typography

### Font Families

**Headings — Playfair Display (serif)**
- **Usage**: All h1, h2, h3, h4, h5, h6 elements
- **Tailwind**: `font-playfair`
- **Google Fonts**: "Playfair Display"

**Body & UI — Nunito (sans-serif)**
- **Usage**: Body text, buttons, navigation, forms
- **Tailwind**: `font-sans` (default)
- **Google Fonts**: Nunito
- **Fallback**: `-apple-system, BlinkMacSystemFont, system-ui, sans-serif`

### Font Weights

- **Light** (`font-light`) — Default body
- **Medium** (`font-medium`) — Navigation, labels
- **Semibold** (`font-semibold`) — Buttons, emphasis
- **Bold** (`font-bold`) — Headings

## Component Styles

### Buttons

**Primary Button** (`.btn-primary`):
```css
Background: bg-brand-light
Text: White
Padding: px-8 py-3
Border radius: rounded-lg
Hover: Scale 105%, shadow, slight opacity change
Transition: duration-200
```

**Secondary Button** (`.btn-secondary`):
```css
Background: White
Text: text-brand-light
Border: border-2 border-brand-light
Hover: Light background tint, scale 105%
Transition: duration-200
```

### Navigation

**Nav Link** (`.nav-link`):
```css
Text: text-gray-400
Hover: text-brand-yellow
Padding: px-3 py-2
Transition: duration-200
```

**Active Nav Link** (`.nav-link-active`):
```css
Text: White
Hover: text-brand-yellow
```

### Links

Default links (not buttons): Hover to `text-brand-yellow`
Transition: `duration-200`

## Animations & Transitions

### Custom Animations

- **fade-in**: Fade in over 0.5s
- **slide-up**: Slide up 20px with fade (0.5s)
- **slide-down**: Slide down 10px with fade (0.3s)

### Transition Timing

- **Standard**: `duration-200` (200ms)
- **Smooth scrolling**: Enabled on html element

### Hover Effects

- **Buttons**: Scale 105% + shadow
- **Links**: Color change to brand yellow
- Smooth transitions on interactive elements

## Design Principles

1. **Clean, modern, trustworthy**
2. **Strong contrast for accessibility**
3. **Subtle motion and depth for a premium feel**
4. **Production-ready, not cookie-cutter**

## Layout & Spacing

### Container

- **Max width**: `max-w-7xl` (1280px)
- **Padding**: `px-4 sm:px-6 lg:px-8`

### Common Spacing

- **Section padding**: `pt-24 pb-12` (page sections)
- **Card padding**: `p-6` (standard cards)
- **Gap spacing**: `gap-4`, `gap-6`, `gap-8` (grids/flex)

### Backgrounds

- **Light sections**: `bg-brand-dark/5`
- **Dark sections**: `bg-brand-dark`
- **Cards**: `bg-white` with `shadow-sm` or `shadow-md`

## Icons & Imagery

### Icons

- **Library**: Lucide React (`lucide-react`)
- **Style**: Consistent line icons
- **Size**: Typically `w-4 h-4`, `w-5 h-5`, `w-6 h-6`

### Images

- **Source**: Unsplash (valid URLs only)
- **Usage**: Hero backgrounds, cards, profiles
- **No local downloads** — link to URLs directly

## Responsive Design

### Breakpoints (Tailwind defaults)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Common Patterns

- **Mobile-first approach**
- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Flex**: `flex-col md:flex-row`
- **Text**: Responsive sizing with Tailwind utilities

## Accessibility

- High contrast between text and backgrounds
- Smooth scrolling enabled
- Transitions for interactive feedback
- Semantic HTML structure

## Code Examples

### Primary Button
```tsx
<button className="btn-primary">Get Started</button>
```

### Secondary Button
```tsx
<button className="btn-secondary">Learn More</button>
```

### Heading
```tsx
<h1 className="text-4xl font-bold text-brand-dark font-playfair">
  Page Title
</h1>
```

### Body Text
```tsx
<p className="text-brand-dark/70">
  Body content goes here
</p>
```

### Card
```tsx
<div className="bg-white rounded-lg shadow-sm p-6">
  Card content
</div>
```

---

These guidelines ensure consistency across the application.

