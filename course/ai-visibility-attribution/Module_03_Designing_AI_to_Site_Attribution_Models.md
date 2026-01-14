---
title: "Module 3: Designing AI-to-Site Attribution Models"
description: "Build attribution models that capture AI's influence and connect off-site AI interactions to on-site behavior"
module: "3"
order: 3
---

# Module 3: Designing AI-to-Site Attribution Models

**From Answer to Outcome**

**Duration:** Week 3  
**Learning Objectives:**
- Build attribution models that capture AI's influence
- Connect off-site AI interactions to on-site behavior
- Understand AI referral patterns (explicit, implicit, dark)
- Instrument AI-originated sessions
- Design tracking schema and data requirements

---

## Lesson 3.1: AI Referral Patterns (Explicit, Implicit, Dark)

### The Three Types of AI Referrals

Not all AI-originated traffic is easily identifiable. Understanding referral patterns helps you capture what's trackable and infer what's not.

#### 1. Explicit AI Referrals

**What It Means:**
- Direct referrer from AI platform
- Trackable in analytics
- Clear AI origin

**Examples:**
- ChatGPT web browsing (when enabled)
- Perplexity search results
- Claude web access
- Bing Chat with citations

**Tracking:**
```
Referrer: chat.openai.com
User-Agent: ChatGPT-User
UTM Parameters: Can be added
```

**Attribution:** Easy - direct tracking available

#### 2. Implicit AI Referrals

**What It Means:**
- User came from AI, but referrer is masked
- Appears as "direct" or "organic search"
- AI influence is hidden

**Examples:**
- User asks AI about your brand
- AI recommends your brand
- User types brand name directly (appears as "direct")
- User searches brand name (appears as "organic")

**Tracking:**
```
Referrer: (direct) or google.com
User-Agent: Standard browser
UTM Parameters: None
Signal: Branded search, direct navigation
```

**Attribution:** Medium - requires inference and pattern analysis

#### 3. Dark AI Referrals

**What It Means:**
- AI influence is completely invisible
- No trackable signal
- Intent formed off-platform, never clicks through

**Examples:**
- User asks AI: "Best CRM for startups"
- AI recommends 3 options (you're not included)
- User chooses competitor
- You never see this user

**Tracking:**
```
Referrer: None (user never visited)
Signal: None (completely invisible)
Impact: Negative (exclusion from consideration)
```

**Attribution:** Hard - requires market-level analysis and competitive intelligence

### Measuring Each Pattern

**Explicit Referrals:**
```
Direct Measurement:
- Referrer tracking
- UTM parameters
- User-Agent analysis
- Conversion tracking
```

**Implicit Referrals:**
```
Inferred Measurement:
- Branded search volume analysis
- Direct traffic pattern analysis
- Time-to-conversion analysis
- User behavior pattern matching
```

**Dark Referrals:**
```
Market-Level Measurement:
- Competitive AI visibility analysis
- Market share analysis
- Lost opportunity estimation
- Brand mention tracking (if possible)
```

---

## Lesson 3.2: Instrumenting AI-Originated Sessions

### Technical Implementation

#### Step 1: Detect Explicit AI Referrers

**JavaScript Implementation:**
```javascript
function detectAIReferrer() {
  const referrer = document.referrer;
  const userAgent = navigator.userAgent;
  
  const aiReferrers = [
    'chat.openai.com',
    'chatgpt.com',
    'perplexity.ai',
    'claude.ai',
    'bing.com/chat',
    'bard.google.com'
  ];
  
  const aiUserAgents = [
    'ChatGPT',
    'Claude',
    'Perplexity',
    'BingChat'
  ];
  
  // Check referrer
  const isAIReferrer = aiReferrers.some(domain => 
    referrer.includes(domain)
  );
  
  // Check user agent
  const isAIUserAgent = aiUserAgents.some(agent => 
    userAgent.includes(agent)
  );
  
  return isAIReferrer || isAIUserAgent;
}
```

#### Step 2: Tag Implicit AI Sessions

**Pattern Detection:**
```javascript
function tagImplicitAISession() {
  // Check for branded search patterns
  const searchQuery = getSearchQuery(); // From URL params
  const isBrandedSearch = checkBrandedQuery(searchQuery);
  
  // Check for direct navigation after AI interaction window
  const isDirectAfterWindow = checkDirectNavigation();
  
  // Check for AI-shaped behavior
  const hasAIShapedBehavior = checkBehaviorPatterns();
  
  if (isBrandedSearch || isDirectAfterWindow || hasAIShapedBehavior) {
    return 'likely_ai_originated';
  }
  
  return 'unknown';
}
```

#### Step 3: Store AI Attribution Data

**Data Schema:**
```javascript
const aiAttributionData = {
  sessionId: 'abc123',
  timestamp: '2024-01-15T10:30:00Z',
  aiReferrerType: 'explicit' | 'implicit' | 'dark',
  aiPlatform: 'chatgpt' | 'claude' | 'perplexity' | 'unknown',
  aiInteractionType: 'comparison' | 'recommendation' | 'validation',
  brandMentioned: true | false,
  brandPosition: 'included' | 'recommended' | 'excluded',
  assistDepth: 0-100,
  assistFrequency: 1-10,
  intentLevel: 'low' | 'medium' | 'high',
  conversionEvent: 'view' | 'signup' | 'purchase',
  conversionValue: 0-100000
};
```

### Analytics Integration

#### Google Analytics 4

**Custom Dimensions:**
```
ai_referrer_type: explicit | implicit | dark
ai_platform: chatgpt | claude | perplexity | unknown
ai_interaction_type: comparison | recommendation | validation
brand_mentioned: true | false
intent_level: low | medium | high
```

**Event Tracking:**
```javascript
gtag('event', 'ai_originated_session', {
  'ai_referrer_type': aiReferrerType,
  'ai_platform': aiPlatform,
  'ai_interaction_type': aiInteractionType,
  'brand_mentioned': brandMentioned,
  'intent_level': intentLevel
});
```

#### Custom Attribution Platform

**Data Model:**
```sql
CREATE TABLE ai_attribution_sessions (
  session_id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  timestamp TIMESTAMP,
  ai_referrer_type VARCHAR(50),
  ai_platform VARCHAR(50),
  ai_interaction_type VARCHAR(50),
  brand_mentioned BOOLEAN,
  brand_position VARCHAR(50),
  assist_depth INTEGER,
  assist_frequency INTEGER,
  intent_level VARCHAR(50),
  conversion_event VARCHAR(50),
  conversion_value DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Lesson 3.3: Proxy Signals for AI Influence

### When Direct Tracking Isn't Possible

Many AI interactions can't be directly tracked. Proxy signals help infer AI influence when direct measurement isn't available.

#### Proxy Signal 1: Branded Search Surge

**What It Indicates:**
- Sudden increase in branded searches
- Often follows AI recommendations
- Users search after AI mentions brand

**Measurement:**
```
Baseline: Average branded searches per week
Surge: Increase above baseline
AI Influence Estimate: % of surge attributed to AI
```

**Example:**
```
Week 1-4: 1,000 branded searches/week (baseline)
Week 5: 1,500 branded searches/week (surge)
AI Influence: 500 searches (33% increase)
```

#### Proxy Signal 2: Direct Traffic Pattern Changes

**What It Indicates:**
- Increase in "direct" traffic
- Users type URL directly after AI recommendation
- No referrer, but AI-originated

**Measurement:**
```
Direct Traffic Growth: Month-over-month increase
AI Attribution: % of growth attributed to AI
Time Correlation: Match with AI visibility improvements
```

**Example:**
```
Month 1: 10,000 direct sessions
Month 2: 12,000 direct sessions (20% increase)
AI Visibility: Increased 30% in same period
AI Attribution: 60% of direct traffic growth (correlation)
```

#### Proxy Signal 3: Time-to-Conversion Compression

**What It Indicates:**
- Faster conversion after first touch
- AI pre-qualifies users
- Less research needed on-site

**Measurement:**
```
Average Time-to-Conversion: Days from first touch
AI-Influenced: Shorter time-to-conversion
Comparison: AI vs. non-AI sessions
```

**Example:**
```
Non-AI Sessions: 14 days average time-to-conversion
AI-Influenced Sessions: 7 days average time-to-conversion
AI Impact: 50% faster conversion (pre-qualification)
```

#### Proxy Signal 4: Engagement Quality Improvement

**What It Indicates:**
- Higher engagement from AI-originated users
- More qualified, less exploratory
- Better conversion rates

**Measurement:**
```
Engagement Metrics:
- Pages per session
- Time on site
- Bounce rate
- Conversion rate

AI vs. Non-AI Comparison
```

**Example:**
```
Non-AI Sessions:
- Pages per session: 2.5
- Time on site: 1:30
- Bounce rate: 60%
- Conversion rate: 2%

AI-Influenced Sessions:
- Pages per session: 4.2
- Time on site: 3:15
- Bounce rate: 35%
- Conversion rate: 8%

AI Impact: 4x conversion rate improvement
```

#### Proxy Signal 5: Query Pattern Analysis

**What It Indicates:**
- Specific query patterns suggest AI influence
- Comparison queries
- Validation queries
- Purchase-intent queries

**Measurement:**
```
Query Categories:
- "[Brand] vs [Competitor]" → Comparison (AI-influenced)
- "[Brand] reviews" → Validation (AI-influenced)
- "[Brand] pricing" → Purchase (AI-influenced)
- "[Brand]" → Direct (may be AI-influenced)
```

**Example:**
```
Total Branded Searches: 5,000/month
Comparison Queries: 500 (10%) → 80% AI-influenced = 400
Validation Queries: 300 (6%) → 70% AI-influenced = 210
Purchase Queries: 200 (4%) → 90% AI-influenced = 180
Direct Queries: 4,000 (80%) → 20% AI-influenced = 800

Total AI-Influenced: 1,590 (32% of branded searches)
```

### Combining Proxy Signals

**Multi-Signal Attribution Model:**
```
AI Influence Score = 
  (Branded Search Surge × 0.3) +
  (Direct Traffic Growth × 0.2) +
  (Time-to-Conversion Compression × 0.2) +
  (Engagement Quality × 0.2) +
  (Query Pattern × 0.1)

Example:
Branded Search: 0.8 (high surge)
Direct Traffic: 0.6 (moderate growth)
Time-to-Conversion: 0.9 (strong compression)
Engagement: 0.7 (good quality)
Query Pattern: 0.5 (moderate pattern)

AI Influence Score = 0.72 (72% confidence in AI influence)
```

---

## Lesson 3.4: Attribution Windows for AI-Shaped Demand

### Understanding Attribution Windows

Attribution windows define how long after an AI interaction you'll credit that interaction for a conversion.

#### Standard Attribution Windows

**Last-Click Window:**
- 1 day (immediate conversion)
- Problem: Misses AI influence that happens days/weeks before

**Multi-Touch Window:**
- 30 days (standard)
- Problem: May be too short for AI-shaped demand

**AI-Specific Window:**
- 60-90 days (extended)
- Rationale: AI shapes intent early, conversion happens later

### Why AI Needs Longer Windows

**The AI Intent Formation Timeline:**
```
Day -60: User asks AI: "What is X?" (awareness)
Day -45: User asks AI: "Best X for Y" (consideration)
Day -30: User asks AI: "X vs Y comparison" (evaluation)
Day -15: User asks AI: "Is X good?" (validation)
Day -7: User asks AI: "X pricing" (purchase intent)
Day 0: User converts
```

**Standard 30-Day Window:**
- Captures: Days -30 to 0
- Misses: Days -60 to -31 (early AI influence)
- **Attribution Gap:** 50% of AI influence missed

**Extended 90-Day Window:**
- Captures: Days -90 to 0
- Captures: Full AI journey
- **Complete Attribution:** All AI influence captured

### Window Selection by Use Case

**B2B SaaS (Long Sales Cycle):**
- Attribution Window: 90 days
- Rationale: 60-90 day sales cycles, multiple AI touchpoints

**B2C E-commerce (Short Sales Cycle):**
- Attribution Window: 30-60 days
- Rationale: Faster decisions, but AI still shapes early intent

**Marketplace (Variable):**
- Attribution Window: 60 days
- Rationale: Mixed purchase behaviors

**Travel (Planning Horizon):**
- Attribution Window: 180 days
- Rationale: Long planning periods, early research

### Implementing Attribution Windows

**Data Model:**
```sql
CREATE TABLE ai_attribution_touchpoints (
  touchpoint_id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  touchpoint_date TIMESTAMP,
  ai_platform VARCHAR(50),
  ai_interaction_type VARCHAR(50),
  attribution_weight DECIMAL(3,2),
  attribution_window_days INTEGER,
  conversion_date TIMESTAMP,
  conversion_value DECIMAL(10,2),
  is_attributed BOOLEAN
);

-- Attribution Logic
UPDATE ai_attribution_touchpoints
SET is_attributed = TRUE
WHERE conversion_date IS NOT NULL
  AND DATEDIFF(conversion_date, touchpoint_date) <= attribution_window_days;
```

**Attribution Calculation:**
```javascript
function calculateAIAttribution(touchpoints, conversionDate, windowDays) {
  const eligibleTouchpoints = touchpoints.filter(tp => {
    const daysDiff = (conversionDate - tp.date) / (1000 * 60 * 60 * 24);
    return daysDiff <= windowDays && daysDiff >= 0;
  });
  
  // Apply attribution weights
  const totalAttribution = eligibleTouchpoints.reduce((sum, tp) => {
    return sum + tp.attributionWeight;
  }, 0);
  
  return {
    touchpoints: eligibleTouchpoints,
    totalAttribution: totalAttribution,
    aiContribution: totalAttribution / (totalAttribution + nonAIContribution)
  };
}
```

---

## Practical Exercise 1: AI-to-Site Attribution Blueprint

### Objective
Design a complete attribution system that connects AI interactions to on-site behavior and conversions.

### Steps

#### Step 1: Map AI Referral Patterns (30 minutes)

1. **Identify Explicit Referrals:**
   - List AI platforms that can send direct referrers
   - Document referrer patterns
   - Create detection rules

2. **Identify Implicit Referrals:**
   - List patterns that suggest AI influence
   - Document proxy signals
   - Create inference rules

3. **Estimate Dark Referrals:**
   - Calculate market-level opportunity
   - Estimate exclusion impact
   - Document measurement limitations

#### Step 2: Design Tracking Schema (45 minutes)

1. **Define Data Model:**
   ```sql
   -- Create your data model
   -- Include: sessions, touchpoints, conversions, attribution
   ```

2. **Define Custom Dimensions:**
   - AI referrer type
   - AI platform
   - AI interaction type
   - Brand positioning
   - Intent level
   - Assist metrics

3. **Define Events:**
   - AI-originated session
   - AI touchpoint
   - AI-influenced conversion
   - AI attribution calculation

#### Step 3: Implement Detection Logic (60 minutes)

1. **Build Referrer Detection:**
   - Explicit AI referrer detection
   - User-Agent analysis
   - UTM parameter parsing

2. **Build Pattern Detection:**
   - Branded search detection
   - Direct traffic analysis
   - Query pattern matching
   - Behavior pattern analysis

3. **Build Attribution Logic:**
   - Attribution window application
   - Multi-touch attribution calculation
   - AI contribution scoring

#### Step 4: Create Measurement Plan (30 minutes)

1. **Define Data Collection:**
   - What data can you collect?
   - What data requires inference?
   - What data is unavailable?

2. **Define Attribution Rules:**
   - Attribution window length
   - Attribution weights
   - Multi-touch model

3. **Define Reporting:**
   - What metrics to report?
   - What dashboards to build?
   - What stakeholders to serve?

### Deliverables

1. **Referral Pattern Map:** Complete classification of AI referral types
2. **Tracking Schema:** Data model, dimensions, events
3. **Detection Implementation:** Code or pseudocode for detection logic
4. **Measurement Plan:** Data collection, attribution rules, reporting framework

### Evaluation Criteria

- **Completeness:** All referral patterns addressed
- **Accuracy:** Realistic detection and attribution logic
- **Implementability:** Can be built with available tools
- **Scalability:** Handles volume and complexity

---

## Practical Exercise 2: Tracking Schema and Data Requirements

### Objective
Define the complete data architecture needed for AI attribution.

### Steps

#### Step 1: Define Core Entities (30 minutes)

1. **Sessions:**
   - Session ID
   - User ID
   - Timestamp
   - Referrer
   - AI attribution flags

2. **Touchpoints:**
   - Touchpoint ID
   - Session ID
   - AI platform
   - Interaction type
   - Attribution weight

3. **Conversions:**
   - Conversion ID
   - Session ID
   - Conversion type
   - Conversion value
   - Timestamp

4. **Attribution:**
   - Attribution ID
   - Touchpoint IDs
   - Conversion ID
   - Attribution weights
   - AI contribution %

#### Step 2: Define Data Sources (30 minutes)

1. **On-Site Data:**
   - Web analytics (GA4, Adobe)
   - Custom tracking
   - Conversion tracking

2. **Off-Site Data:**
   - AI platform APIs (if available)
   - Search console data
   - Competitive intelligence

3. **Inferred Data:**
   - Proxy signal calculations
   - Pattern matching results
   - Market-level estimates

#### Step 3: Define Data Pipeline (30 minutes)

1. **Data Collection:**
   - Real-time tracking
   - Batch processing
   - API integrations

2. **Data Processing:**
   - Referrer detection
   - Pattern matching
   - Attribution calculation

3. **Data Storage:**
   - Raw data warehouse
   - Processed attribution data
   - Reporting database

#### Step 4: Define Data Quality (30 minutes)

1. **Completeness:**
   - What % of sessions can be attributed?
   - What % require inference?
   - What % are unknown?

2. **Accuracy:**
   - How confident in explicit referrals?
   - How confident in implicit referrals?
   - How to handle uncertainty?

3. **Timeliness:**
   - Real-time vs. batch processing
   - Reporting latency
   - Data freshness requirements

### Deliverables

1. **Data Model:** Complete schema with entities and relationships
2. **Data Sources Map:** All data sources and their purposes
3. **Data Pipeline Design:** Collection, processing, storage architecture
4. **Data Quality Framework:** Completeness, accuracy, timeliness metrics

---

## Key Takeaways

- **Three referral types:** Explicit (trackable), Implicit (inferred), Dark (invisible)
- **Instrumentation is critical:** Technical implementation enables measurement
- **Proxy signals fill gaps:** When direct tracking isn't possible, use inference
- **Attribution windows matter:** AI needs longer windows (60-90 days) than traditional channels
- **Data architecture is foundational:** Proper schema enables accurate attribution
- **Measurement requires multiple approaches:** Combine direct tracking, inference, and market analysis

---

## Additional Resources

### Reading
- "AI Attribution Technical Implementation" - Technical Guide
- "Proxy Signals for AI Influence" - Research Paper
- "Attribution Windows in the AI Era" - Industry Report

### Tools
- Google Analytics 4 (custom dimensions)
- Attribution platform APIs
- Data pipeline tools (Segment, mParticle)

### Next Steps
- Complete Exercise 1: AI-to-Site Attribution Blueprint
- Complete Exercise 2: Tracking Schema and Data Requirements
- Review Module 4: Tracking Intent Continuation On-Site

---

**Ready for Module 4?**  
**[Continue to Tracking Intent Continuation On-Site →](Module_04_Tracking_Intent_Continuation_On_Site.md)**
