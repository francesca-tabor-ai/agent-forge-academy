---
title: "Module 2: AI Personas & Intent Clusters"
description: "Who AI Is Answering For - Map real AI personas that drive recommendations and replace audience segments with intent-led models"
module: "2"
order: 2
---

# Module 2: AI Personas & Intent Clusters

**Duration:** Week 2  
**Learning Objectives:**
- **Map Real**: Map real AI personas that drive recommendations
- **Replace Audience**: Replace audience segments with intent-led models
- **persona formation inside LLMs Understanding**: Understand persona formation inside LLMs
- **Identify Intent**: Identify intent escalation paths (research → comparison → decision)
- **pre-purchase Analysis**: Distinguish pre-purchase vs post-purchase AI intents
- **Analyze How**: Analyze how personas differ by model and surface

---

## Lesson 2.1: Persona Formation Inside LLMs

### What Are AI Personas?

AI personas are **synthetic user representations** that LLMs create to provide personalized recommendations. Unlike traditional audience segments (demographics, psychographics), AI personas are:

- **Dynamic:** Formed in real-time based on conversation
- **Contextual:** Adapt to user's current situation
- **Intent-Driven:** Focused on solving specific problems
- **Multi-Dimensional:** Combine multiple user characteristics

### How LLMs Create Personas

**1. Explicit Signals:**
- Direct statements: "I'm a beginner runner"
- Questions: "What's the best shoe for flat feet?"
- Preferences: "I prefer minimalist design"

**2. Implicit Signals:**
- Conversation history: Previous questions and answers
- Query complexity: Technical vs. simple language
- Context clues: Time of day, device type, location
- Behavioral patterns: Research depth, comparison frequency

**3. Inference:**
- LLMs infer characteristics from limited signals
- Build composite persona from multiple data points
- Update persona as conversation progresses
- Adapt recommendations to inferred persona

### Example: Persona Formation

**Conversation:**
```
User: "I need running shoes for my first marathon"
AI Inference:
  - Experience level: Beginner (first marathon)
  - Goal: Completion, not speed
  - Need: Comfort, support, durability
  - Budget: Likely mid-range (not premium, not budget)
  - Timeline: Training period (3-6 months away)

Persona: "First-time marathon runner seeking comfortable, supportive shoes for training and race day"
```

**Recommendation Adaptation:**
- Focus on comfort and support (not speed)
- Recommend durable options (training + race)
- Suggest mid-range price points
- Include training advice (not just product)

### Persona vs. Traditional Audience Segments

**Traditional Segments:**
- Demographics: Age, gender, income, location
- Psychographics: Interests, values, lifestyle
- Behavioral: Purchase history, website visits
- Static: Defined once, updated periodically

**AI Personas:**
- Intent-based: What problem are they solving?
- Contextual: What's their current situation?
- Dynamic: Evolves with conversation
- Real-time: Formed and updated instantly

**Key Difference:**
- Segments = Who they are
- Personas = What they need right now

---

## Lesson 2.2: Intent Escalation Paths

### The Intent Journey

Users don't jump straight to purchase. They progress through intent stages:

**Stage 1: Awareness**
- User realizes they have a need
- Begins exploring options
- Seeks general information
- Intent: "What exists?"

**Stage 2: Research**
- User learns about options
- Compares features, benefits
- Seeks expert opinions
- Intent: "What should I know?"

**Stage 3: Consideration**
- User narrows options
- Compares specific products
- Evaluates trade-offs
- Intent: "Which is best for me?"

**Stage 4: Decision**
- User is ready to purchase
- Seeks final validation
- Looks for best deal
- Intent: "Where should I buy?"

**Stage 5: Purchase**
- User completes transaction
- May seek post-purchase support
- Intent: "How do I use this?"

### How AI Detects Intent Stage

**Research Stage Signals:**
- Broad questions: "What are the best running shoes?"
- General queries: "Types of running shoes"
- Educational language: "How do I choose?"
- Multiple exploratory questions

**Consideration Stage Signals:**
- Specific comparisons: "Nike vs. Brooks for flat feet"
- Feature questions: "Does it have good arch support?"
- Price questions: "Is it worth the extra cost?"
- Narrowed focus: "Between these two options..."

**Decision Stage Signals:**
- Purchase language: "Where can I buy?"
- Urgency: "I need this by Friday"
- Final validation: "Is this the right choice?"
- Transaction-focused: "Best price", "Free shipping"

### Intent Escalation in AI Recommendations

**Early Stage (Research):**
```
Query: "What are the best running shoes?"
AI Recommendation:
  - Broad category overview
  - Multiple options with explanations
  - Educational content
  - No purchase pressure
```

**Mid Stage (Consideration):**
```
Query: "Nike Air Zoom vs. Brooks Ghost for long runs"
AI Recommendation:
  - Direct comparison
  - Specific features highlighted
  - Pros/cons for each
  - Contextual advice
```

**Late Stage (Decision):**
```
Query: "Where can I buy Brooks Ghost 15 with free shipping?"
AI Recommendation:
  - Specific product
  - Purchase options
  - Price comparison
  - Availability information
```

### Strategic Implications

**1. Different Recommendations for Different Stages:**
- Research: Educational, broad, informative
- Consideration: Comparative, specific, detailed
- Decision: Transactional, actionable, purchase-focused

**2. Different Bidding Strategies:**
- Research: Lower bid, broader intent
- Consideration: Medium bid, specific intent
- Decision: Higher bid, purchase intent

**3. Different Creative Requirements:**
- Research: Content, evidence, authority
- Consideration: Comparison, features, benefits
- Decision: Price, availability, purchase path

---

## Lesson 2.3: Pre-Purchase vs Post-Purchase AI Intents

### Pre-Purchase Intents

**Definition:** User is seeking information to make a purchase decision.

**Characteristics:**
- Forward-looking: Planning future purchase
- Information-seeking: Learning about options
- Comparison-focused: Evaluating alternatives
- Decision-oriented: Working toward purchase

**Common Pre-Purchase Intents:**
1. **Discovery:** "What products exist in this category?"
2. **Education:** "How do I choose the right product?"
3. **Comparison:** "Which product is better for my needs?"
4. **Validation:** "Is this the right choice?"
5. **Purchase:** "Where can I buy this?"

**AI Recommendation Focus:**
- Product information
- Feature comparisons
- Expert opinions
- User reviews
- Purchase options

### Post-Purchase Intents

**Definition:** User has already purchased and needs support or related products.

**Characteristics:**
- Backward-looking: Already made purchase
- Support-seeking: Need help using product
- Expansion-focused: Looking for related products
- Satisfaction-oriented: Ensuring good experience

**Common Post-Purchase Intents:**
1. **Setup/Installation:** "How do I set this up?"
2. **Usage:** "How do I use this feature?"
3. **Troubleshooting:** "Why isn't this working?"
4. **Optimization:** "How do I get the most out of this?"
5. **Accessories:** "What accessories do I need?"
6. **Upgrades:** "Should I upgrade to the newer model?"

**AI Recommendation Focus:**
- Support content
- Tutorials and guides
- Troubleshooting help
- Related products
- Upgrade options

### Strategic Differences

**Pre-Purchase Strategy:**
- **Goal:** Win the purchase
- **Focus:** Product features, benefits, comparisons
- **Bidding:** Higher bids for purchase intent
- **Creative:** Product-focused, purchase-oriented
- **Measurement:** Conversion rate, purchase value

**Post-Purchase Strategy:**
- **Goal:** Support and expand relationship
- **Focus:** Usage, support, related products
- **Bidding:** Lower bids, support-focused
- **Creative:** Helpful, educational, supportive
- **Measurement:** Engagement, satisfaction, lifetime value

### The Full Customer Journey

**Pre-Purchase → Purchase → Post-Purchase**

**Example: Running Shoes**
1. **Pre-Purchase:** "What are the best running shoes for flat feet?"
2. **Purchase:** "Where can I buy Brooks Beast 15?"
3. **Post-Purchase:** "How do I break in my new running shoes?"

**AI Recommendations Across Journey:**
- Pre-Purchase: Product recommendations, comparisons
- Purchase: Retailer recommendations, price comparisons
- Post-Purchase: Care guides, accessory recommendations, upgrade suggestions

---

## Lesson 2.4: How Personas Differ by Model and Surface

### Model-Specific Personas

**ChatGPT (OpenAI):**
- **Persona Style:** Conversational, helpful, educational
- **Recommendation Format:** Detailed explanations, pros/cons
- **Trust Signals:** Citations, expert opinions, data
- **Best For:** Research, education, complex decisions

**Claude (Anthropic):**
- **Persona Style:**: Thoughtful, balanced, nuanced
- **Recommendation Format:**: Comparative analysis, trade-offs
- **Trust Signals:**: Multiple perspectives, ethical considerations
- **Best For:**: Consideration, comparison, values-based decisions

**Perplexity:**
- **Persona Style:**: Research-focused, citation-heavy
- **Recommendation Format:**: Source-backed, data-driven
- **Trust Signals:**: Citations, recent data, expert sources
- **Best For:**: Research, validation, fact-checking

**Google AI Overviews:**
- **Persona Style:**: Quick, comprehensive, authoritative
- **Recommendation Format:**: Synthesized answers, top options
- **Trust Signals:**: Google authority, source citations
- **Best For:**: Quick research, top-of-funnel discovery

### Surface-Specific Personas

**Search Surface (Google, Bing):**
- **Persona:** Information seeker, researcher
- **Intent:** Find answers, learn, discover
- **Recommendation Style:** Quick, comprehensive, authoritative
- **Bidding Focus:** Top-of-funnel, broad intent

**Chat Surface (ChatGPT, Claude):**
- **Persona:** Conversational explorer, decision maker
- **Intent:** Discuss, compare, decide
- **Recommendation Style:** Detailed, conversational, personalized
- **Bidding Focus:** Mid-funnel, specific intent

**Shopping Surface (Amazon Rufus, Google Shopping):**
- **Persona:** Purchase-ready buyer
- **Intent:** Buy, compare prices, find deals
- **Recommendation Style:** Product-focused, transactional
- **Bidding Focus:** Bottom-of-funnel, purchase intent

**Voice Surface (Siri, Alexa):**
- **Persona:** Quick questioner, on-the-go user
- **Intent:** Quick answers, simple decisions
- **Recommendation Style:** Brief, actionable, voice-optimized
- **Bidding Focus:** Quick decisions, local intent

### Strategic Implications

**1. Model-Specific Strategies:**
- ChatGPT: Educational content, detailed comparisons
- Claude: Balanced perspectives, ethical considerations
- Perplexity: Source-backed content, recent data
- Google: Quick answers, top options

**2. Surface-Specific Strategies:**
- Search: Broad intent, top-of-funnel
- Chat: Conversational, mid-funnel
- Shopping: Transactional, bottom-of-funnel
- Voice: Quick, local, actionable

**3. Persona Adaptation:**
- Adapt recommendations to model persona
- Optimize for surface-specific behavior
- Adjust bidding by model and surface
- Customize creative for each environment

---

## Practical Exercise 2: AI Persona Map & Intent Cluster Hierarchy

### Objective
Create a comprehensive AI persona map and intent cluster hierarchy tied to revenue for your brand or client.

### Steps

#### Step 1: Persona Identification (90 minutes)
1. **Conversation Analysis:**
   - Review 50+ AI conversations about your category
   - Identify common persona patterns
   - Note persona characteristics (experience level, goals, constraints)
   - Document persona-specific language and questions

2. **Persona Documentation:**
   For each persona, document:
   - **Name:** Descriptive persona name
   - **Characteristics:** Experience, goals, constraints, preferences
   - **Language Patterns:** How they ask questions
   - **Intent Progression:** How they move through journey
   - **Recommendation Preferences:** What they value in recommendations

3. **Persona Validation:**
   - Test personas with real AI conversations
   - Verify persona accuracy
   - Refine based on findings
   - Prioritize personas by volume/value

#### Step 2: Intent Cluster Mapping (90 minutes)
1. **Intent Identification:**
   - List all user intents in your category
   - Group similar intents into clusters
   - Identify intent types: research, comparison, decision, purchase
   - Map intents to personas

2. **Intent Hierarchy:**
   - Organize intents by stage (awareness → purchase)
   - Identify intent escalation paths
   - Map intents to revenue potential
   - Prioritize high-value intents

3. **Intent Documentation:**
   For each intent cluster, document:
   - **Intent Name:** Descriptive name
   - **Stage:** Awareness, research, consideration, decision, purchase
   - **Persona:** Which personas have this intent
   - **Revenue Potential:** High, medium, low
   - **Current Performance:** How well you serve this intent
   - **Competitive Position:** Your strength vs. competitors

#### Step 3: Revenue Mapping (60 minutes)
1. **Revenue Attribution:**
   - Map intents to revenue outcomes
   - Calculate revenue per intent cluster
   - Identify high-value intent clusters
   - Estimate potential revenue increase

2. **Gap Analysis:**
   - Identify intents with high revenue potential but low performance
   - Find persona-intent combinations you're missing
   - Calculate revenue opportunity
   - Prioritize gaps by revenue impact

3. **Strategic Prioritization:**
   - Rank intent clusters by revenue potential
   - Identify quick wins (high revenue, low effort)
   - Plan long-term investments (high revenue, high effort)
   - Allocate resources accordingly

#### Step 4: Map Creation (60 minutes)
Create two deliverables:

**1. AI Persona Map:**
   - Visual representation of personas
   - Persona characteristics and preferences
   - Persona-specific language patterns
   - Persona journey through intent stages

**2. Intent Cluster Hierarchy:**
   - Visual hierarchy of intent clusters
   - Intent stage progression
   - Revenue potential by intent
   - Persona-intent mapping
   - Competitive position by intent

### Deliverables
1. **AI Persona Map** (visual + documentation)
   - 5-8 personas documented
   - Persona characteristics and preferences
   - Persona journey maps
   - Persona-specific strategies

2. **Intent Cluster Hierarchy** (visual + documentation)
   - 10-15 intent clusters mapped
   - Intent stage progression
   - Revenue potential by intent
   - Persona-intent relationships
   - Strategic priorities

3. **Revenue Analysis** (spreadsheet + summary)
   - Revenue by intent cluster
   - Revenue opportunity analysis
   - Gap analysis and priorities
   - Resource allocation recommendations

### Evaluation Criteria
- **Completeness:** All personas and intents identified
- **Accuracy:** Personas reflect real AI conversations
- **Strategic Value:** Revenue mapping and priorities clear
- **Actionability:** Clear next steps and recommendations
- **Presentation:** Professional, visual, executive-ready

---

## Key Takeaways

- **AI personas are dynamic and intent-driven:**: Formed in real-time, adapt to conversation, focus on solving problems

- **Intent escalation follows predictable paths:**: Research → Consideration → Decision → Purchase

- **Pre-purchase and post-purchase intents require different strategies:**: Different goals, bidding, creative, measurement

- **Personas differ by model and surface:**: Adapt strategies to ChatGPT vs. Claude vs. Perplexity, Search vs. Chat vs. Shopping

- **Revenue mapping is critical:**: Prioritize intents and personas by revenue potential, not just volume

---

## Additional Resources

### Reading
- "AI Personas: The New Audience Segmentation" - Research Report
- "Intent Escalation in AI Recommendations" - White Paper
- "Model-Specific Persona Strategies" - Case Studies

### Tools
- AI Conversation Analysis Templates
- Persona Mapping Frameworks
- Intent Cluster Hierarchy Templates
- Revenue Attribution Models

### Next Steps
- Complete Exercise 2
- Review Module 3: Organic AI Recommendations as the Pre-Paid Signal
- Begin tracking organic AI recommendation share

---

**Ready for Module 3?**  
**[Continue to Organic AI Recommendations as the Pre-Paid Signal →](Module_03_Organic_AI_Recommendations_as_the_Pre_Paid_Signal.md)**
