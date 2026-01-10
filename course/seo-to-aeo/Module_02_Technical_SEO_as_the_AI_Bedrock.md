# Module 2: Technical SEO as the AI Bedrock

## Overview

While the search landscape is changing, the technical foundations of SEO remain critical—but they now serve a different purpose. This module explores how traditional technical SEO elements like E-E-A-T, structured data, and crawl directives form the bedrock for AI visibility.

## Learning Objectives

- Implement E-E-A-T as a credibility algorithm for AI systems
- Use structured data to provide ground truth and prevent hallucinations
- Master robots.txt and llms.txt for AI agent access control

---

## Lesson 2.1: E-E-A-T as the Credibility Algorithm

### What is E-E-A-T?

E-E-A-T stands for:
- **Experience**: First-hand, lived experience with the topic
- **Expertise**: Demonstrated knowledge and skill
- **Authoritativeness**: Recognition as a trusted source
- **Trustworthiness**: Reliability and accuracy

### From Human Signal to Machine API

In traditional SEO, E-E-A-T was a ranking signal for human evaluators. In the AI era, it becomes an **API for human trust** that machines use to verify information.

### How AI Models Use E-E-A-T

AI systems evaluate credibility by:

1. **Experience signals**:
   - First-person narratives
   - Case studies with specific details
   - Real-world examples and applications

2. **Expertise indicators**:
   - Author credentials and qualifications
   - Industry recognition and awards
   - Depth of technical knowledge demonstrated

3. **Authoritativeness markers**:
   - Domain authority and backlinks
   - Citations from other authoritative sources
   - Industry leadership and thought leadership

4. **Trustworthiness factors**:
   - Transparent sourcing and citations
   - Factual accuracy and corrections
   - Clear conflict of interest disclosures

### Implementing E-E-A-T for AI

#### 1. Author Attribution

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "author": {
    "@type": "Person",
    "name": "Jane Smith",
    "jobTitle": "Senior Data Scientist",
    "worksFor": {
      "@type": "Organization",
      "name": "Tech Corp"
    },
    "sameAs": [
      "https://linkedin.com/in/janesmith",
      "https://twitter.com/janesmith"
    ]
  }
}
</script>
```

#### 2. Experience Documentation

- Include specific dates, locations, and outcomes
- Provide before/after comparisons
- Share lessons learned and mistakes made
- Use first-person language when appropriate

#### 3. Expertise Demonstration

- Show your work: calculations, methodologies, code
- Reference industry standards and frameworks
- Compare your approach to alternatives
- Acknowledge limitations and edge cases

#### 4. Authority Building

- Get cited by other authoritative sources
- Participate in industry discussions
- Publish original research and data
- Build a track record of accurate predictions

### Measuring E-E-A-T Impact

Track:
- **Citation frequency**: How often you're cited in AI responses
- **Attribution quality**: Whether your expertise is recognized
- **Hallucination rate**: How often AI misrepresents your content

### Key Takeaways

- E-E-A-T is now a machine-readable credibility API
- Structured data makes E-E-A-T signals explicit
- AI models use E-E-A-T to determine citation worthiness

---

## Lesson 2.2: Structured Data (Schema.org)

### Why Structured Data Matters for AI

Structured data provides **ground truth**—explicit, machine-readable facts that:

1. **Prevent hallucinations**: Clear facts reduce AI errors
2. **Establish entity authority**: Define your brand, products, and expertise
3. **Enable relationship mapping**: Show connections between entities
4. **Improve extraction accuracy**: Make it easy for AI to parse information

### Core Schema Types for AI Visibility

#### 1. Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "Clear description of what you do",
  "foundingDate": "2020-01-01",
  "founders": [
    {
      "@type": "Person",
      "name": "Founder Name"
    }
  ],
  "sameAs": [
    "https://linkedin.com/company/yourcompany",
    "https://twitter.com/yourcompany"
  ]
}
```

#### 2. Product Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Detailed product description",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "1234"
  }
}
```

#### 3. Article/BlogPosting Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-20",
  "publisher": {
    "@type": "Organization",
    "name": "Publisher Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
```

#### 4. FAQPage Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is your return policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer a 30-day return policy..."
      }
    }
  ]
}
```

### Best Practices

1. **Use JSON-LD format**: Preferred by Google and AI systems
2. **Place in `<head>`**: Load early for crawlers
3. **Keep it accurate**: Structured data must match page content
4. **Update regularly**: Keep dates and information current
5. **Test thoroughly**: Use Google's Rich Results Test

### Entity-Level Authority

Structured data helps establish **entity-level authority**:

- Your brand becomes a recognized entity
- Products are clearly defined and categorized
- Authors gain individual authority
- Relationships between entities are explicit

### Preventing Hallucinations

Clear structured data reduces AI errors by:

- Providing explicit facts instead of requiring inference
- Establishing canonical information about your brand
- Creating a single source of truth for key attributes
- Enabling fact-checking against your structured data

### Key Takeaways

- Structured data is ground truth for AI systems
- JSON-LD is the preferred format
- Entity-level authority comes from comprehensive schema markup

---

## Lesson 2.3: Speaking the Machine's Language

### robots.txt: The Traditional Gatekeeper

**Purpose**: Control which bots can access which parts of your site

**Format**:
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /
```

### The Emerging llms.txt Standard

**Purpose**: A "smart sitemap" specifically for AI agents

**Location**: `https://yourdomain.com/llms.txt`

**Format**:
```
# llms.txt - AI Agent Instructions

# Site Information
Site: https://example.com
Description: Leading provider of AI solutions

# Permissions
Allow: /blog/
Allow: /products/
Disallow: /admin/
Disallow: /private/

# Key Entities
Entity: Company Name
Entity: Product Line
Entity: Key Expert

# Preferred Content
Priority: /blog/technical-guides/
Priority: /products/specifications/

# Contact
Contact: ai@example.com
```

### Key Differences

| Feature | robots.txt | llms.txt |
|---------|-----------|----------|
| Purpose | Access control | AI agent guidance |
| Format | Simple directives | Structured metadata |
| Entities | Not included | Explicitly defined |
| Priorities | Not supported | Content prioritization |
| Contact | Not included | AI team contact |

### Implementing Both

You need **both** files:

1. **robots.txt**: Traditional bot control (still used by search engines)
2. **llms.txt**: AI agent guidance (emerging standard)

### Best Practices

#### robots.txt
- Allow AI crawlers (GPTBot, ClaudeBot, CCBot)
- Block only truly private areas
- Use specific user-agent rules when needed
- Test with Google Search Console

#### llms.txt
- Provide clear site description
- List key entities and topics
- Prioritize high-value content
- Include contact for AI team questions
- Keep it updated as content changes

### Access Control Strategy

**Public content** (allow all):
- Blog posts and articles
- Product pages
- About and company information
- Public resources

**Semi-private** (selective access):
- Gated content (may require authentication)
- Beta features
- Partner resources

**Private** (block all):
- Admin panels
- User account pages
- Internal tools
- Sensitive data

### Monitoring Crawl Activity

Track which bots access your content:

1. **Server logs**: Monitor user-agent strings
2. **Analytics**: Set up custom tracking for AI bots
3. **Crawl reports**: Use tools to identify AI crawler patterns
4. **Access patterns**: Understand what content AI bots prioritize

### Key Takeaways

- robots.txt controls access; llms.txt provides guidance
- Allow AI crawlers to access your public content
- Use llms.txt to help AI agents understand your site structure
- Monitor crawl activity to optimize for AI visibility

---

## Module Summary

Technical SEO fundamentals form the bedrock for AI visibility:

1. **E-E-A-T** provides the credibility algorithm that AI systems use
2. **Structured data** offers ground truth that prevents hallucinations
3. **robots.txt and llms.txt** control access and guide AI agents

These technical foundations enable the optimization strategies covered in the next modules. Without proper technical SEO, advanced AEO and GEO tactics won't be effective.
