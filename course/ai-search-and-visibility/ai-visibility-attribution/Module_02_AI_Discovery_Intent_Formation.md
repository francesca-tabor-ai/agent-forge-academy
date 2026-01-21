---
title: "Module 2: AI Discovery → Intent Formation"
description: "Map how AI-originated discovery influences decisions upstream and define what 'AI-assisted' really means"
module: "2"
order: 2
---

# Module 2: AI Discovery → Intent Formation

**What Happens Before the Visit**

**Duration:** Week 2  
**Learning Objectives:**
- **Map How**: Map how AI-originated discovery influences decisions upstream
- **Define What**: Define what "AI-assisted" really means
- **AI as advisor, comparator, and validator Understanding**: Understand AI as advisor, comparator, and validator
- **an AI Discovery Contribution Model Development**: Build an AI Discovery Contribution Model

---

## Lesson 2.1: AI as Advisor, Comparator, and Validator

### The Three Roles of AI in Discovery

AI plays three distinct roles in the buyer journey, each with different attribution implications:

#### 1. AI as Advisor

**What It Means:**
- User asks: "What should I consider when choosing X?"
- AI provides guidance, frameworks, criteria
- User learns what matters before evaluating options

**Example:**
```
User: "What features should I look for in a CRM?"
AI: "Key features include: contact management, pipeline tracking, 
     email integration, reporting, mobile access, and integrations 
     with your existing tools."
```

**Attribution Impact:**
- AI shapes the evaluation criteria
- Your product may not be mentioned
- But if you excel in those criteria, you benefit later
- **Attribution challenge:** How to credit AI for creating favorable evaluation framework?

#### 2. AI as Comparator

**What It Means:**
- User asks: "Compare X vs Y vs Z"
- AI provides side-by-side comparisons
- User sees your brand alongside competitors

**Example:**
```
User: "Compare HubSpot vs Salesforce vs Pipedrive"
AI: "HubSpot: Best for SMBs, free tier available, strong marketing 
     automation. Salesforce: Enterprise-focused, highly customizable, 
     expensive. Pipedrive: Sales-focused, simple interface, mid-range pricing."
```

**Attribution Impact:**
- Direct brand mention
- Positioning relative to competitors
- Inclusion/exclusion from consideration set
- **Attribution opportunity:** Can track if brand is mentioned, but not always if user clicks

#### 3. AI as Validator

**What It Means:**
- User already knows about your brand
- User asks: "Is X good?" or "Should I use X?"
- AI confirms or challenges the user's assumption

**Example:**
```
User: "Is Notion good for project management?"
AI: "Notion is excellent for knowledge management and documentation, 
     but may lack advanced project management features like Gantt 
     charts and resource allocation that tools like Asana offer."
```

**Attribution Impact:**
- Reinforces or weakens existing brand awareness
- Can tip the decision one way or another
- **Attribution challenge:** User may have already decided, AI just confirms

### Why This Classification Matters

Different AI roles require different attribution approaches:

- **Advisor:** Measure category-level influence, not brand-level
- **Comparator:** Measure brand inclusion rate and positioning
- **Validator:** Measure confirmation vs. challenge rate

---

## Lesson 2.2: Prompt Categories That Create Commercial Intent

### The Intent Formation Spectrum

Not all AI interactions create commercial intent. Understanding prompt categories helps identify which conversations matter for attribution.

#### Category 1: Research Prompts (Low Intent, High Volume)

**Examples:**
- "What is X?"
- "How does X work?"
- "Explain X to me"

**Intent Level:** Low (educational, exploratory)  
**Commercial Value:** Low (awareness only)  
**Attribution Priority:** Low

#### Category 2: Comparison Prompts (Medium Intent, Medium Volume)

**Examples:**
- "X vs Y"
- "Best X for Y"
- "X alternatives"

**Intent Level:** Medium (evaluating options)  
**Commercial Value:** Medium (consideration set)  
**Attribution Priority:** High

#### Category 3: Purchase Prompts (High Intent, Low Volume)

**Examples:**
- "Where to buy X"
- "X pricing"
- "X reviews"
- "Is X worth it?"

**Intent Level:** High (ready to buy)  
**Commercial Value:** High (near conversion)  
**Attribution Priority:** Critical

#### Category 4: Validation Prompts (Variable Intent, Medium Volume)

**Examples:**
- "Is X good?"
- "Should I use X?"
- "X pros and cons"

**Intent Level:** Variable (depends on context)  
**Commercial Value:** Variable (can tip decision)  
**Attribution Priority:** Medium-High

### Mapping Prompts to Attribution Value

```
Prompt Category | Intent Level | Attribution Weight | Tracking Priority
---------------|-------------|-------------------|------------------
Research | Low | 10% | Low
Comparison | Medium | 30% | High
Purchase | High | 50% | Critical
Validation | Variable | 20% | Medium
```

### Real-World Example: SaaS Purchase Journey

**Day 1: Research Prompt**
```
User: "What is a CRM?"
AI: [Educational explanation]
Attribution Value: 10% (awareness)
```

**Day 3: Comparison Prompt**
```
User: "Best CRM for small business"
AI: [Lists 5 options including your brand]
Attribution Value: 30% (consideration)
```

**Day 7: Validation Prompt**
```
User: "Is [Your Brand] good?"
AI: [Positive review, mentions strengths]
Attribution Value: 20% (validation)
```

**Day 10: Purchase Prompt**
```
User: "[Your Brand] pricing"
AI: [Pricing information]
Attribution Value: 50% (near conversion)
```

**Total AI Attribution:** 110% (can exceed 100% in multi-touch model)

---

## Lesson 2.3: Brand Inclusion vs Recommendation vs Exclusion

### The Three AI Positioning States

When AI mentions your brand, it can do so in three ways:

#### 1. Brand Inclusion

**What It Means:**
- Your brand is mentioned in a list
- No explicit recommendation
- Neutral positioning

**Example:**
```
User: "Best project management tools"
AI: "Popular options include Asana, Trello, Monday.com, 
     and ClickUp. Each has different strengths..."
```

**Attribution Value:** Medium  
**Conversion Probability:** Medium  
**Tracking:** Can detect brand mention, but not recommendation strength

#### 2. Brand Recommendation

**What It Means:**
- AI explicitly recommends your brand
- Positive positioning
- Clear preference

**Example:**
```
User: "Best CRM for startups"
AI: "For startups, I'd recommend HubSpot. It offers a generous 
     free tier, excellent onboarding, and scales as you grow..."
```

**Attribution Value:** High  
**Conversion Probability:** High  
**Tracking:** Can detect recommendation language, measure recommendation strength

#### 3. Brand Exclusion

**What It Means:**
- Your brand is not mentioned
- Competitors are mentioned instead
- Implicit exclusion from consideration

**Example:**
```
User: "Best CRM for enterprise"
AI: "For enterprise needs, Salesforce and Microsoft Dynamics 
     are the leading options..."
[Your brand not mentioned]
```

**Attribution Value:** Negative (opportunity cost)  
**Conversion Probability:** Low  
**Tracking:** Hard to track absence, but critical to measure

### Measuring Positioning Impact

**Inclusion Rate:**
```
Brand Mentions / Total Relevant Queries = Inclusion Rate
Example: 150 mentions / 1,000 queries = 15% inclusion rate
```

**Recommendation Rate:**
```
Explicit Recommendations / Total Brand Mentions = Recommendation Rate
Example: 30 recommendations / 150 mentions = 20% recommendation rate
```

**Exclusion Rate:**
```
Queries Where Competitors Mentioned But Not You / Total Queries = Exclusion Rate
Example: 200 exclusions / 1,000 queries = 20% exclusion rate
```

### Competitive Positioning Analysis

**Scenario: CRM Category**

| Brand | Inclusion Rate | Recommendation Rate | Exclusion Rate |
|-------|---------------|---------------------|----------------|
| HubSpot | 40% | 25% | 10% |
| Salesforce | 35% | 30% | 5% |
| Pipedrive | 20% | 15% | 30% |
| Your Brand | 15% | 10% | 40% |

**Insights:**
- Your brand has low inclusion, high exclusion
- Competitors dominate consideration set
- Recommendation rate is below average
- **Action:** Improve AI visibility to increase inclusion

---

## Lesson 2.4: Assist Depth vs Assist Frequency

### Understanding Assist Metrics

Two dimensions matter when measuring AI assistance:

#### 1. Assist Depth

**Definition:** How much AI helps in a single interaction

**Shallow Assist:**
- Brief mention
- Minimal detail
- Low influence on decision

**Example:**
```
User: "Best email marketing tools"
AI: "Mailchimp, SendGrid, and ConvertKit are popular options."
[Your brand: Mailchimp - shallow mention]
```

**Deep Assist:**
- Detailed explanation
- Multiple points covered
- Strong influence on decision

**Example:**
```
User: "Best email marketing tools"
AI: "Mailchimp is excellent for beginners with its drag-and-drop 
     editor and free tier for up to 2,000 contacts. It offers 
     automation workflows, A/B testing, and integrates with 
     major e-commerce platforms. The pricing starts at $10/month 
     for the Essentials plan..."
[Your brand: Mailchimp - deep assist]
```

#### 2. Assist Frequency

**Definition:** How often AI assists across multiple interactions

**Single Assist:**
- One AI interaction
- User converts
- Simple attribution

**Multiple Assists:**
- Several AI interactions over time
- Cumulative influence
- Complex attribution

**Example Journey:**
```
Day 1: AI mentions brand (shallow)
Day 3: AI compares brand vs competitor (medium depth)
Day 5: AI recommends brand (deep)
Day 7: AI validates brand choice (medium depth)
Day 10: User converts
```

### The Assist Matrix

```
                Shallow Assist    Deep Assist
Single Assist   Low Value         Medium Value
Multiple Assists Medium Value      High Value
```

**Attribution Weighting:**
- Shallow + Single: 10%
- Shallow + Multiple: 20%
- Deep + Single: 30%
- Deep + Multiple: 50%

### Measuring Assist Metrics

**Assist Depth Score:**
```
Factors:
- Word count in AI response about your brand
- Number of features/benefits mentioned
- Specificity of information
- Recommendation strength

Score: 0-100 (shallow to deep)
```

**Assist Frequency:**
```
Count: Number of AI interactions mentioning your brand
Timeframe: Within attribution window (e.g., 30 days)
Frequency: Interactions per user journey
```

**Combined Metric:**
```
Assist Impact = (Assist Depth × 0.6) + (Assist Frequency × 0.4)
Example: (70 depth × 0.6) + (3 interactions × 0.4) = 42 + 1.2 = 43.2
```

---

## Practical Exercise 1: AI Discovery Contribution Model

### Objective
Build a framework to measure how AI discovery contributes to intent formation.

### Steps

#### Step 1: Define AI Interaction Types (30 minutes)

1. **Create Interaction Taxonomy:**
   ```
   Interaction Type | Description | Intent Level | Attribution Weight
   ----------------|-------------|-------------|-------------------
   Research | Educational queries | Low | 10%
   Comparison | Evaluating options | Medium | 30%
   Purchase | Ready to buy | High | 50%
   Validation | Confirming decision | Variable | 20%
   ```

2. **Define Brand Positioning States:**
   - Inclusion: Brand mentioned neutrally
   - Recommendation: Brand explicitly recommended
   - Exclusion: Brand not mentioned (competitors are)

3. **Define Assist Metrics:**
   - Depth: Shallow (0-30), Medium (31-70), Deep (71-100)
   - Frequency: Single, Multiple (2-3), Frequent (4+)

#### Step 2: Map User Journey Stages (30 minutes)

1. **Create Journey Framework:**
   ```
   Stage | AI Role | Typical Prompts | Attribution Weight
   ------|---------|----------------|-------------------
   Awareness | Advisor | "What is X?" | 10%
   Consideration | Comparator | "X vs Y" | 30%
   Evaluation | Validator | "Is X good?" | 20%
   Purchase | Recommender | "X pricing" | 50%
   ```

2. **Identify Stage Transitions:**
   - What moves users from one stage to another?
   - How does AI influence transitions?
   - What signals indicate stage progression?

#### Step 3: Build Attribution Model (45 minutes)

1. **Create Multi-Touch Attribution Rules:**
   ```
   First AI Touch: 30% weight
   Middle AI Touch: 20% weight
   Last AI Touch: 50% weight
   
   Depth Multiplier:
   - Shallow: ×0.5
   - Medium: ×1.0
   - Deep: ×1.5
   
   Frequency Multiplier:
   - Single: ×1.0
   - Multiple: ×1.2
   - Frequent: ×1.5
   ```

2. **Calculate AI Contribution Score:**
   ```
   For each AI interaction:
   Base Weight × Depth Multiplier × Frequency Multiplier = Contribution
   
   Example:
   First touch (30%) × Deep (1.5) × Multiple (1.2) = 54% contribution
   Last touch (50%) × Medium (1.0) × Single (1.0) = 50% contribution
   
   Total AI Contribution: 104% (can exceed 100%)
   ```

3. **Account for Non-AI Touchpoints:**
   - What other channels contribute?
   - How to weight AI vs. non-AI?
   - What's the total attribution?

#### Step 4: Create Measurement Framework (30 minutes)

1. **Define Data Requirements:**
   - What AI signals can you collect?
   - What intent data is available?
   - What conversion data exists?

2. **Identify Tracking Gaps:**
   - What can't you measure today?
   - What proxies can you use?
   - What assumptions are needed?

3. **Build Scoring System:**
   - How to score AI interactions?
   - How to aggregate scores?
   - How to report results?

### Deliverables

1. **AI Interaction Taxonomy:** Complete classification system
2. **Journey Mapping Framework:** Stage definitions and transitions
3. **Attribution Model:** Rules, weights, and calculations
4. **Measurement Framework:** Data requirements and tracking plan

### Evaluation Criteria

- **Completeness:** All interaction types covered
- **Accuracy:** Realistic attribution weights
- **Actionability:** Can be implemented with available data
- **Flexibility:** Adaptable to different use cases

---

## Practical Exercise 2: Intent Formation Framework by Use Case

### Objective
Create intent formation frameworks for different business models (B2B, B2C, Marketplace, etc.)

### Steps

#### Step 1: Define Use Case (15 minutes)

Choose a use case:
- B2B SaaS
- B2C E-commerce
- Marketplace
- Travel
- Healthcare
- Other: __________

#### Step 2: Map Intent Formation Journey (45 minutes)

1. **Identify Key Questions Users Ask:**
   - What do they research?
   - What do they compare?
   - What do they validate?
   - What triggers purchase?

2. **Map AI's Role at Each Stage:**
   ```
   Stage | User Question | AI Response Type | Brand Impact
   ------|---------------|------------------|-------------
   [Stage] | [Question] | [Response] | [Impact]
   ```

3. **Define Intent Signals:**
   - What indicates intent formation?
   - What shows progression?
   - What predicts conversion?

#### Step 3: Create Use Case-Specific Attribution Model (30 minutes)

1. **Adjust Attribution Weights:**
   - How does this use case differ from generic model?
   - What stages matter most?
   - What interactions are most valuable?

2. **Define Success Metrics:**
   - What outcomes matter?
   - How to measure success?
   - What benchmarks to use?

### Deliverables

1. **Use Case Journey Map:** Complete intent formation framework
2. **Custom Attribution Model:** Use case-specific weights and rules
3. **Success Metrics:** Defined KPIs and benchmarks

---

## Key Takeaways

- **AI plays three roles:**: Advisor, Comparator, Validator - each requires different attribution
- **Prompt categories matter:**: Research, Comparison, Purchase, Validation have different intent levels
- **Brand positioning varies:**: Inclusion, Recommendation, Exclusion have different conversion probabilities
- **Assist depth and frequency both matter:**: Deep, frequent assists drive highest conversion
- **Intent forms over time:**: Multiple AI interactions create cumulative influence
- **Use cases differ:**: B2B, B2C, and other models require custom frameworks

---

## Additional Resources

### Reading
- "AI and Consumer Decision-Making" - Research Study
- "Intent Formation in the AI Era" - White Paper
- "Prompt Classification for Attribution" - Industry Guide

### Tools
- AI conversation analysis tools
- Intent signal detection scripts
- Attribution modeling platforms

### Next Steps
- Complete Exercise 1: AI Discovery Contribution Model
- Complete Exercise 2: Intent Formation Framework
- Review Module 3: Designing AI-to-Site Attribution Models

---

**Ready for Module 3?**  
**[Continue to Designing AI-to-Site Attribution Models →](Module_03_Designing_AI_to_Site_Attribution_Models.md)**
