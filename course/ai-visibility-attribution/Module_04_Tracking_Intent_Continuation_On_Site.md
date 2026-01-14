---
title: "Module 4: Tracking Intent Continuation On-Site"
description: "Measure whether the site resolves the intent AI created and distinguish curiosity from qualified demand"
module: "4"
order: 4
---

# Module 4: Tracking Intent Continuation On-Site

**Did the Conversation Continue?**

**Duration:** Week 4  
**Learning Objectives:**
- Measure whether the site resolves the intent AI created
- Distinguish curiosity from qualified demand
- Understand landing-state vs AI-prompt alignment
- Track question continuation signals
- Identify engagement patterns unique to AI-referred users

---

## Lesson 4.1: Landing-State vs AI-Prompt Alignment

### The Alignment Problem

When users arrive from AI, they have specific questions or needs. Your landing page may or may not address those needs directly.

#### Scenario: Misalignment

**AI Conversation:**
```
User: "What's the best CRM for remote teams?"
AI: "For remote teams, consider tools with strong collaboration 
     features, video integration, and mobile access. HubSpot offers 
     these features with a free tier..."
```

**User Clicks Through → Lands On:**
- Generic homepage
- Product overview page
- Pricing page

**Problem:**
- Landing page doesn't address "remote teams" specifically
- User has to search for relevant information
- Intent may not be resolved
- Higher bounce risk

#### Scenario: Alignment

**AI Conversation:**
```
User: "What's the best CRM for remote teams?"
AI: "HubSpot offers strong collaboration features for remote teams..."
```

**User Clicks Through → Lands On:**
- Dedicated "CRM for Remote Teams" page
- Content addresses remote team needs
- Features highlighted match AI conversation

**Result:**
- Intent immediately addressed
- Lower bounce rate
- Higher engagement
- Better conversion probability

### Measuring Alignment

**Alignment Score Components:**
1. **Keyword Alignment:** Landing page keywords match AI prompt keywords
2. **Topic Alignment:** Landing page topic matches AI conversation topic
3. **Feature Alignment:** Landing page features match AI-recommended features
4. **Intent Alignment:** Landing page intent matches user's intent level

**Calculation:**
```
Alignment Score = 
  (Keyword Match × 0.3) +
  (Topic Match × 0.3) +
  (Feature Match × 0.2) +
  (Intent Match × 0.2)

Score Range: 0-100
High Alignment: 70-100
Medium Alignment: 40-69
Low Alignment: 0-39
```

### Real-World Example

**AI Prompt:** "Best email marketing tools for e-commerce"

**Landing Page A (Low Alignment):**
- Generic email marketing page
- No e-commerce mention
- Alignment Score: 35

**Landing Page B (High Alignment):**
- "Email Marketing for E-commerce" dedicated page
- E-commerce features highlighted
- Case studies from e-commerce brands
- Alignment Score: 85

**Expected Impact:**
- Landing Page A: 60% bounce rate, 2% conversion
- Landing Page B: 25% bounce rate, 8% conversion

---

## Lesson 4.2: Question Continuation Signals

### What Are Question Continuation Signals?

When users arrive from AI with a question, they may continue asking that question on your site. These signals indicate intent continuation.

#### Signal 1: On-Site Search Queries

**What It Indicates:**
- User searches for terms related to AI conversation
- Intent is being pursued on-site
- Question is continuing

**Example:**
```
AI Conversation: "Best project management tools for agencies"
On-Site Search: "project management for agencies"
Signal: Strong continuation
```

**Measurement:**
```
Continuation Rate = 
  AI-Originated Sessions with On-Site Search / 
  Total AI-Originated Sessions

Benchmark: 15-25% continuation rate
```

#### Signal 2: FAQ Page Visits

**What It Indicates:**
- User seeks answers to specific questions
- FAQ content addresses AI-raised questions
- Intent is being resolved

**Example:**
```
AI Conversation: "How does HubSpot pricing work?"
On-Site Behavior: Visits pricing FAQ page
Signal: Question continuation
```

**Measurement:**
```
FAQ Engagement Rate = 
  AI-Originated Sessions Visiting FAQ / 
  Total AI-Originated Sessions

Benchmark: 10-20% FAQ engagement
```

#### Signal 3: Content Deep Dives

**What It Indicates:**
- User reads detailed content
- Content addresses AI questions
- Intent is being explored deeply

**Example:**
```
AI Conversation: "What features does Notion have?"
On-Site Behavior: Reads "Complete Feature Guide" (5 min read)
Signal: Deep intent continuation
```

**Measurement:**
```
Deep Dive Rate = 
  AI-Originated Sessions with 3+ min content engagement / 
  Total AI-Originated Sessions

Benchmark: 20-30% deep dive rate
```

#### Signal 4: Comparison Tool Usage

**What It Indicates:**
- User compares options (continuing AI comparison)
- Evaluation is happening on-site
- Intent is progressing toward decision

**Example:**
```
AI Conversation: "Compare HubSpot vs Salesforce"
On-Site Behavior: Uses comparison tool
Signal: Comparison continuation
```

**Measurement:**
```
Comparison Tool Usage = 
  AI-Originated Sessions Using Comparison Tool / 
  Total AI-Originated Sessions

Benchmark: 5-15% comparison usage
```

### Combining Continuation Signals

**Intent Continuation Score:**
```
Continuation Score = 
  (On-Site Search × 0.3) +
  (FAQ Engagement × 0.2) +
  (Deep Dive × 0.3) +
  (Comparison Tool × 0.2)

Score Range: 0-100
High Continuation: 60-100
Medium Continuation: 30-59
Low Continuation: 0-29
```

---

## Lesson 4.3: Engagement Patterns Unique to AI-Referred Users

### How AI Users Behave Differently

AI-referred users exhibit distinct engagement patterns compared to other traffic sources.

#### Pattern 1: Faster Decision-Making

**Observation:**
- AI users convert faster than other channels
- Less time exploring, more time evaluating
- Pre-qualified by AI conversation

**Data:**
```
Average Time-to-Conversion:
- Organic Search: 14 days
- Paid Search: 10 days
- Social Media: 18 days
- AI-Originated: 7 days

AI Impact: 50% faster conversion
```

#### Pattern 2: Higher Engagement Quality

**Observation:**
- More pages per session
- Longer time on site
- Lower bounce rate
- Higher conversion rate

**Data:**
```
Engagement Metrics Comparison:

                Pages/Session  Time on Site  Bounce Rate  Conv Rate
Organic Search      2.5         1:30         55%          2.5%
Paid Search         3.0         2:00         45%          3.0%
Social Media        2.0         1:00         65%          1.5%
AI-Originated       4.2         3:15         25%          8.0%

AI Advantage: 2-4x better engagement
```

#### Pattern 3: Focused Exploration

**Observation:**
- AI users visit fewer, more relevant pages
- Less random browsing
- More targeted content consumption

**Example Journey:**
```
AI-Originated User:
1. Landing page (aligned with AI prompt)
2. Feature page (specific to AI question)
3. Pricing page (evaluation)
4. Sign-up (conversion)

Total: 4 pages, all relevant, 8 min session
```

**vs. Organic Search User:**
```
1. Homepage
2. About page
3. Blog (random article)
4. Products (browsing)
5. Features (finally relevant)
6. Exit

Total: 5 pages, mixed relevance, 12 min session, no conversion
```

#### Pattern 4: Question-Driven Navigation

**Observation:**
- AI users navigate based on questions
- FAQ pages highly visited
- Support content frequently accessed
- Help documentation engagement

**Data:**
```
Page Type Engagement (AI vs. Non-AI):

Page Type          AI Users    Non-AI Users
FAQ Pages          18%         5%
Support Docs       12%         3%
Feature Pages       25%        15%
Pricing Pages       30%        20%
Blog Posts          8%          25%

AI Pattern: Question-driven, less exploratory
```

### Why These Patterns Matter

**For Attribution:**
- Different engagement = different attribution value
- AI users are more valuable (higher conversion)
- Should receive higher attribution weight

**For Optimization:**
- Optimize for AI user patterns
- Create question-driven content
- Improve FAQ and support content
- Align landing pages with AI prompts

---

## Lesson 4.4: Drop-Off vs Resolution Indicators

### Understanding User Outcomes

When AI users arrive on-site, they either:
1. **Resolve their intent** (find what they need, convert)
2. **Drop off** (leave without resolution)

Distinguishing between these outcomes is critical for attribution.

#### Resolution Indicators

**Strong Resolution Signals:**
1. **Conversion:** User completes desired action
2. **Content Completion:** User reads full article/guide
3. **Tool Usage:** User uses interactive tool (calculator, comparison)
4. **Form Submission:** User submits contact form, demo request
5. **Account Creation:** User signs up for account

**Weak Resolution Signals:**
1. **Multiple Page Views:** User explores multiple pages
2. **Time on Site:** User spends significant time (>3 min)
3. **Return Visit:** User returns within attribution window
4. **Email Signup:** User subscribes to newsletter

#### Drop-Off Indicators

**Strong Drop-Off Signals:**
1. **Immediate Bounce:** User leaves within 10 seconds
2. **Single Page View:** User views only landing page
3. **No Engagement:** No clicks, scrolls, or interactions
4. **Exit to Competitor:** User clicks competitor link

**Weak Drop-Off Signals:**
1. **Short Session:** User leaves after 30-60 seconds
2. **Limited Exploration:** User views 1-2 pages
3. **No Conversion:** User doesn't complete action
4. **No Return:** User doesn't return within window

### Measuring Resolution vs. Drop-Off

**Resolution Rate:**
```
Resolution Rate = 
  AI-Originated Sessions with Resolution Indicators / 
  Total AI-Originated Sessions

Strong Resolution: Conversion, form submission, account creation
Weak Resolution: Content completion, tool usage, email signup

Benchmark: 40-60% resolution rate (strong + weak)
```

**Drop-Off Rate:**
```
Drop-Off Rate = 
  AI-Originated Sessions with Drop-Off Indicators / 
  Total AI-Originated Sessions

Strong Drop-Off: Immediate bounce, single page, no engagement
Weak Drop-Off: Short session, limited exploration, no conversion

Benchmark: 20-40% drop-off rate
```

### The Resolution Quality Spectrum

**High-Quality Resolution:**
- Conversion (purchase, signup, demo)
- Strong engagement (deep content, tool usage)
- Multiple touchpoints (returns, email engagement)

**Medium-Quality Resolution:**
- Content consumption (article read, video watched)
- Form submission (newsletter, download)
- Account creation (free tier)

**Low-Quality Resolution:**
- Minimal engagement (quick browse, 1-2 pages)
- No conversion
- No return visit

**No Resolution (Drop-Off):**
- Immediate bounce
- No engagement
- Exit to competitor

### Attribution Weighting by Resolution

**Attribution Model:**
```
High-Quality Resolution: 100% attribution weight
Medium-Quality Resolution: 50% attribution weight
Low-Quality Resolution: 25% attribution weight
Drop-Off: 0% attribution weight (or negative for learning)
```

---

## Practical Exercise 1: Intent Continuation Score

### Objective
Build a scoring system that measures whether on-site behavior continues the intent formed in AI conversations.

### Steps

#### Step 1: Define Continuation Signals (30 minutes)

1. **List On-Site Behaviors:**
   - On-site search queries
   - FAQ page visits
   - Content deep dives
   - Comparison tool usage
   - Feature page exploration
   - Support documentation access

2. **Categorize by Strength:**
   - Strong signals (high intent continuation)
   - Medium signals (moderate continuation)
   - Weak signals (low continuation)

3. **Assign Weights:**
   ```
   Signal | Weight | Rationale
   -------|-------|----------
   On-Site Search | 0.3 | Direct question continuation
   FAQ Engagement | 0.2 | Question resolution
   Deep Dive | 0.3 | Intent exploration
   Comparison Tool | 0.2 | Evaluation continuation
   ```

#### Step 2: Map AI Prompts to On-Site Behaviors (45 minutes)

1. **Create Prompt-Behavior Mapping:**
   ```
   AI Prompt Type | Expected On-Site Behavior | Continuation Signal
   --------------|---------------------------|-------------------
   "What is X?" | Educational content, FAQ | FAQ engagement
   "Best X for Y" | Feature pages, use cases | Feature exploration
   "X vs Y" | Comparison tool, pricing | Comparison usage
   "X pricing" | Pricing page, calculator | Pricing engagement
   ```

2. **Define Alignment Rules:**
   - How to match AI prompt to expected behavior?
   - What constitutes good alignment?
   - What indicates misalignment?

#### Step 3: Build Scoring Algorithm (45 minutes)

1. **Create Scoring Logic:**
   ```javascript
   function calculateIntentContinuationScore(session) {
     let score = 0;
     
     // On-site search (0-30 points)
     if (session.hasOnSiteSearch) {
       const searchAlignment = checkSearchAlignment(
         session.aiPrompt, 
         session.searchQuery
       );
       score += searchAlignment * 30;
     }
     
     // FAQ engagement (0-20 points)
     if (session.visitedFAQ) {
       const faqAlignment = checkFAQAlignment(
         session.aiPrompt,
         session.faqPage
       );
       score += faqAlignment * 20;
     }
     
     // Deep dive (0-30 points)
     if (session.contentEngagement > 3) {
       const contentAlignment = checkContentAlignment(
         session.aiPrompt,
         session.contentPages
       );
       score += contentAlignment * 30;
     }
     
     // Comparison tool (0-20 points)
     if (session.usedComparisonTool) {
       score += 20; // Direct continuation signal
     }
     
     return score; // 0-100
   }
   ```

2. **Define Score Thresholds:**
   - High continuation: 70-100
   - Medium continuation: 40-69
   - Low continuation: 0-39

#### Step 4: Test and Validate (30 minutes)

1. **Test with Sample Sessions:**
   - Select 20 AI-originated sessions
   - Calculate continuation scores
   - Compare to actual outcomes (conversion, engagement)

2. **Validate Scoring:**
   - Do high scores correlate with conversions?
   - Do low scores correlate with drop-offs?
   - Adjust weights if needed

### Deliverables

1. **Continuation Signal Framework:** Complete list of signals and weights
2. **Prompt-Behavior Mapping:** AI prompts mapped to expected behaviors
3. **Scoring Algorithm:** Complete implementation or pseudocode
4. **Validation Results:** Test results and score adjustments

### Evaluation Criteria

- **Completeness:** All relevant signals included
- **Accuracy:** Scores correlate with outcomes
- **Actionability:** Can be implemented and used
- **Flexibility:** Adaptable to different use cases

---

## Practical Exercise 2: On-Site Intent Instrumentation Plan

### Objective
Design the technical implementation for tracking intent continuation on-site.

### Steps

#### Step 1: Define Tracking Requirements (30 minutes)

1. **List Data Points to Track:**
   - On-site search queries
   - Page views and sequence
   - Time on page
   - Scroll depth
   - Click events
   - Form submissions
   - Tool usage

2. **Define Event Schema:**
   ```javascript
   {
     event: 'intent_continuation',
     session_id: 'abc123',
     user_id: 'user456',
     ai_prompt: 'best CRM for startups',
     ai_platform: 'chatgpt',
     on_site_behavior: {
       search_queries: ['CRM pricing', 'startup features'],
       pages_visited: ['/features', '/pricing'],
       time_on_site: 245,
       engagement_score: 75
     },
     continuation_score: 72,
     timestamp: '2024-01-15T10:30:00Z'
   }
   ```

#### Step 2: Design Implementation (45 minutes)

1. **Choose Tracking Method:**
   - Google Analytics 4 events
   - Custom analytics platform
   - DataLayer pushes
   - Server-side tracking

2. **Create Tracking Code:**
   ```javascript
   // Example: Track on-site search
   function trackOnSiteSearch(query) {
     gtag('event', 'intent_continuation_search', {
       'search_query': query,
       'ai_prompt': getAIPrompt(),
       'continuation_signal': 'on_site_search',
       'session_id': getSessionId()
     });
   }
   
   // Example: Track FAQ engagement
   function trackFAQEngagement(faqPage) {
     gtag('event', 'intent_continuation_faq', {
       'faq_page': faqPage,
       'ai_prompt': getAIPrompt(),
       'continuation_signal': 'faq_engagement',
       'session_id': getSessionId()
     });
   }
   ```

3. **Define Data Collection Points:**
   - Where to implement tracking?
   - What triggers events?
   - How to store data?

#### Step 3: Create Measurement Dashboard (30 minutes)

1. **Define Key Metrics:**
   - Intent continuation rate
   - Continuation score distribution
   - Resolution vs. drop-off rates
   - Alignment scores

2. **Design Dashboard Views:**
   - Overview: Overall continuation metrics
   - By AI Platform: Platform-specific patterns
   - By Prompt Type: Prompt-specific behaviors
   - By Landing Page: Page-specific performance

#### Step 4: Plan Rollout (15 minutes)

1. **Phased Implementation:**
   - Phase 1: Basic tracking (search, page views)
   - Phase 2: Advanced tracking (engagement, tools)
   - Phase 3: Scoring and reporting

2. **Success Criteria:**
   - What % of sessions can be scored?
   - What data quality is acceptable?
   - What reporting latency is acceptable?

### Deliverables

1. **Tracking Requirements:** Complete data points and schema
2. **Implementation Design:** Technical approach and code examples
3. **Dashboard Design:** Metrics and visualization plan
4. **Rollout Plan:** Phased implementation approach

---

## Key Takeaways

- **Alignment matters:** Landing pages must match AI prompts for intent continuation
- **Continuation signals exist:** On-site search, FAQ, deep dives indicate intent continuation
- **AI users behave differently:** Faster, more focused, higher quality engagement
- **Resolution vs. drop-off:** Distinguish successful intent resolution from abandonment
- **Scoring enables measurement:** Intent continuation scores quantify on-site success
- **Instrumentation is required:** Technical implementation enables tracking

---

## Additional Resources

### Reading
- "Intent Continuation in AI-Driven Journeys" - Research Paper
- "On-Site Behavior Patterns for AI Users" - Case Study
- "Landing Page Alignment for AI Traffic" - Best Practices Guide

### Tools
- Google Analytics 4 (custom events)
- Heat mapping tools (Hotjar, Crazy Egg)
- Session recording tools

### Next Steps
- Complete Exercise 1: Intent Continuation Score
- Complete Exercise 2: On-Site Intent Instrumentation Plan
- Review Module 5: Measuring Qualified Demand

---

**Ready for Module 5?**  
**[Continue to Measuring Qualified Demand →](Module_05_Measuring_Qualified_Demand.md)**
