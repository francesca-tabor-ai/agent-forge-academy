# Segment Subscriptions Configuration

This file contains all Stripe product and price IDs, pricing, and marketing copy for segment-based subscriptions.

## Format

Each entry follows the format:
```
segment_type | segment_key | display_name | stripe_product_id | stripe_monthly_price_id | stripe_annual_price_id | display_price_monthly | display_price_annual | currency | marketing_bullets
```

Where:
- `segment_type`: One of `track`, `industry`, or `role`
- `segment_key`: URL-friendly slug (e.g., "agentic-systems", "finance", "engineer")
- `display_name`: Human-readable display name (e.g., "Agentic Systems", "Finance", "Engineer")
- `stripe_product_id`: Stripe product ID (e.g., "prod_xxx")
- `stripe_monthly_price_id`: Stripe monthly recurring price ID (e.g., "price_month_xxx")
- `stripe_annual_price_id`: Stripe annual recurring price ID (e.g., "price_year_xxx")
- `display_price_monthly`: Display price for monthly billing (e.g., "£49/mo")
- `display_price_annual`: Display price for annual billing (e.g., "£490/yr")
- `currency`: Currency code (e.g., "GBP", "USD")
- `marketing_bullets`: Short marketing bullets separated by semicolons (e.g., "Build agents fast; ship workflows; eval + monitoring")

---

## TRACK SUBSCRIPTIONS

```
track | agentic-systems | Agentic Systems | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Build agents fast; ship workflows; eval + monitoring
track | ai-search-visibility | AI Search & Visibility | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Optimize AI search; improve visibility; ranking strategies
track | shopping-ecommerce | Shopping & E-Commerce | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Agentic commerce; shopping experiences; conversion optimization
track | media-content-ops | Media & Content Ops | prod_xxx | price_month_xxx | price_year_xxx | £39/mo | £390/yr | GBP | Content workflows; media automation; production pipelines
track | trust-regulation | Trust & Regulation | prod_xxx | price_month_xxx | price_year_xxx | £39/mo | £390/yr | GBP | AI safety; compliance; ethical AI; regulatory frameworks
track | ml-engineering | ML Engineering | prod_xxx | price_month_xxx | price_year_xxx | £59/mo | £590/yr | GBP | Production ML systems; model deployment; MLOps
track | vibe-engineering | Vibe Engineering | prod_xxx | price_month_xxx | price_year_xxx | £39/mo | £390/yr | GBP | User experience; product feel; emotional design
track | platform-engineering | Platform Engineering | prod_xxx | price_month_xxx | price_year_xxx | £59/mo | £590/yr | GBP | Infrastructure; platform design; developer experience
track | gtm-revenue-operations | GTM & Revenue Operations | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Go-to-market; revenue ops; sales automation
```

---

## INDUSTRY SUBSCRIPTIONS

```
industry | finance | Finance | prod_xxx | price_month_xxx | price_year_xxx | £59/mo | £590/yr | GBP | Financial AI; compliance; risk management; fintech solutions
industry | healthcare | Healthcare | prod_xxx | price_month_xxx | price_year_xxx | £59/mo | £590/yr | GBP | Healthcare AI; patient care; medical workflows; HIPAA compliance
industry | fintech | Fintech | prod_xxx | price_month_xxx | price_year_xxx | £59/mo | £590/yr | GBP | Fintech innovation; payment systems; financial products
industry | ecommerce | E-commerce | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | E-commerce AI; shopping experiences; conversion optimization
industry | saas | SaaS | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | SaaS products; subscription models; product-led growth
industry | marketplaces | Marketplaces | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Marketplace platforms; matching algorithms; two-sided networks
industry | media-publishing | Media & Publishing | prod_xxx | price_month_xxx | price_year_xxx | £39/mo | £390/yr | GBP | Content creation; publishing workflows; media automation
industry | devtools | DevTools | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Developer tools; engineering productivity; tooling
industry | legal-compliance | Legal & Compliance | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Legal tech; compliance automation; regulatory requirements
industry | retail-cpg | Retail / CPG | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Retail AI; consumer products; supply chain
industry | b2b-sales-revops | B2B Sales / RevOps | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | B2B sales; revenue operations; sales automation
```

---

## ROLE SUBSCRIPTIONS

```
role | engineer | Engineer | prod_xxx | price_month_xxx | price_year_xxx | £59/mo | £590/yr | GBP | Engineering skills; technical implementation; system design
role | tech-lead | Tech Lead | prod_xxx | price_month_xxx | price_year_xxx | £59/mo | £590/yr | GBP | Technical leadership; architecture; team management
role | pm | PM | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Product management; roadmap planning; feature development
role | founder | Founder | prod_xxx | price_month_xxx | price_year_xxx | £79/mo | £790/yr | GBP | Startup strategy; fundraising; company building
role | marketer | Marketer | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Marketing automation; campaign optimization; growth strategies
role | content-team | Content Team | prod_xxx | price_month_xxx | price_year_xxx | £39/mo | £390/yr | GBP | Content creation; editorial workflows; publishing
role | data-team | Data Team | prod_xxx | price_month_xxx | price_year_xxx | £59/mo | £590/yr | GBP | Data science; analytics; ML models
role | growth-team | Growth Team | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Growth strategies; experimentation; user acquisition
role | sales-team | Sales Team | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Sales automation; CRM optimization; revenue growth
role | cx-team | CX Team | prod_xxx | price_month_xxx | price_year_xxx | £49/mo | £490/yr | GBP | Customer experience; support automation; engagement
```

---

## Notes

### Stripe Setup

1. **Create Products**: For each segment, create a product in Stripe Dashboard
2. **Create Prices**: Create monthly and annual recurring prices for each product
3. **Update IDs**: Replace `prod_xxx`, `price_month_xxx`, and `price_year_xxx` with actual Stripe IDs
4. **Test Mode**: Use test mode IDs during development, then switch to live mode IDs

### Pricing Guidelines

- **Tracks**: £39-£59/month depending on track complexity
  - Premium tracks (ML Engineering, Platform Engineering): £59/mo
  - Standard tracks: £49/mo
  - Basic tracks (Media & Content Ops, Trust & Regulation, Vibe Engineering): £39/mo

- **Industries**: £39-£59/month depending on industry
  - Premium industries (Finance, Healthcare, Fintech): £59/mo
  - Standard industries: £49/mo
  - Basic industries (Media & Publishing): £39/mo

- **Roles**: £39-£79/month depending on role
  - Executive roles (Founder): £79/mo
  - Technical roles (Engineer, Tech Lead, Data Team): £59/mo
  - Standard roles: £49/mo
  - Basic roles (Content Team): £39/mo

### Annual Pricing

Annual prices are typically 10x monthly price (e.g., £49/mo = £490/yr), representing approximately 2 months free per year.

### Marketing Bullets

Keep bullets concise (3-5 words each) and action-oriented. Focus on key value propositions and outcomes.

### Maintenance

- Update this file whenever you create new Stripe products
- Keep Stripe IDs in sync with actual Stripe Dashboard
- Review pricing quarterly to ensure competitiveness
- Update marketing bullets based on customer feedback
