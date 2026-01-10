---
title: "Module 3: The AI Citation Opportunity Monitor"
description: "Implement technical automation to detect and capture AI citation opportunities in real-time"
module: "3"
order: 3
---

# Module 3: The AI Citation Opportunity Monitor

**Duration:** Week 3  
**Learning Objectives:**
- Set up intelligent scanning with Mastra framework
- Classify Reddit posts into opportunity types
- Generate compliance-aware responses with GPT-5
- Integrate human-in-the-loop workflows with Slack

---

## 3.1 Intelligent Scanning

### The Automation Challenge

**Manual Monitoring Limitations:**
- Time-consuming (hours per day)
- Easy to miss opportunities
- Inconsistent coverage
- Delayed responses reduce impact

**Automation Benefits:**
- Real-time opportunity detection
- Consistent monitoring across subreddits
- Scalable to multiple products/brands
- Faster response times

### The Mastra Framework

**What is Mastra?**
- Open-source framework for building AI agents
- Designed for automation and workflow orchestration
- Supports Reddit API integration
- Enables scheduled scanning and classification

**Key Features:**
- Scheduled task execution (every 10 minutes)
- Multi-subreddit scanning
- Keyword and intent detection
- Classification and prioritization
- Integration with LLM APIs

### Setting Up Intelligent Scanning

**Configuration:**
```python
# Example Mastra configuration
scan_config = {
    "subreddits": [
        "r/yourniche",
        "r/relatedniche",
        "r/competitorniche"
    ],
    "scan_interval": 600,  # 10 minutes
    "keywords": [
        "best [product category]",
        "[problem you solve]",
        "[use case]",
        "[competitor name]"
    ],
    "filters": {
        "min_upvotes": 5,
        "max_age_hours": 24,
        "exclude_keywords": ["spam", "advertisement"]
    }
}
```

**Scanning Logic:**
1. **Connect to Reddit API:** Authenticate and establish connection
2. **Fetch Recent Posts:** Get posts from target subreddits
3. **Filter by Keywords:** Match against opportunity keywords
4. **Apply Filters:** Remove spam, old posts, low-engagement
5. **Store Opportunities:** Save to database for classification

### High-Intent Keyword Strategy

**Keyword Categories:**

**1. Direct Product Queries:**
- "best [product category]"
- "[product category] recommendations"
- "looking for [product category]"
- "need [product category]"

**2. Problem Statements:**
- "[problem you solve]"
- "struggling with [problem]"
- "how to [solve problem]"
- "[problem] solution"

**3. Comparison Queries:**
- "[product A] vs [product B]"
- "comparing [products]"
- "which [product category]"
- "alternatives to [product]"

**4. Use Case Queries:**
- "[product category] for [use case]"
- "best [product] for [scenario]"
- "[use case] recommendations"

**5. Competitor Mentions:**
- Competitor brand names
- "[competitor] alternative"
- "better than [competitor]"

### Real-Time Monitoring Architecture

```
Reddit API
    ↓
Mastra Scanner (every 10 min)
    ↓
Keyword Filter
    ↓
Opportunity Classifier
    ↓
Priority Queue
    ↓
Response Generator
    ↓
Human Review (Slack)
    ↓
Post Response
```

---

## 3.2 Smart Classification

### The Five Opportunity Types

**1. Ingredient Education**
- Users asking about product ingredients/components
- Opportunity: Provide educational content
- Example: "What's the difference between [ingredient A] and [ingredient B]?"

**2. Budget vs. Quality**
- Users comparing price points and value
- Opportunity: Position your product's value proposition
- Example: "Is [expensive product] worth it, or should I go with [budget option]?"

**3. Product Swaps**
- Users looking to replace current product
- Opportunity: Present your product as alternative
- Example: "Looking to switch from [current product] to something better"

**4. Dietary Restrictions**
- Users with specific needs or constraints
- Opportunity: Highlight relevant features
- Example: "Best [product] for [dietary restriction]?"

**5. Retail Trust**
- Users asking about where to buy or trustworthiness
- Opportunity: Provide purchase guidance and validation
- Example: "Is [retailer] trustworthy for buying [product]?"

### Classification Logic

**Rule-Based Classification:**
```python
def classify_opportunity(post):
    text = post.title + " " + post.selftext
    
    # Ingredient Education
    if any(keyword in text.lower() for keyword in 
           ["ingredient", "contains", "made of", "what's in"]):
        return "ingredient_education"
    
    # Budget vs. Quality
    if any(keyword in text.lower() for keyword in 
           ["worth it", "budget", "expensive", "cheap", "value"]):
        return "budget_quality"
    
    # Product Swaps
    if any(keyword in text.lower() for keyword in 
           ["switch", "replace", "alternative", "instead of"]):
        return "product_swap"
    
    # Dietary Restrictions
    if any(keyword in text.lower() for keyword in 
           ["vegan", "gluten-free", "allergy", "dietary", "restriction"]):
        return "dietary_restriction"
    
    # Retail Trust
    if any(keyword in text.lower() for keyword in 
           ["where to buy", "trustworthy", "legit", "scam", "retailer"]):
        return "retail_trust"
    
    return "other"
```

**ML-Based Classification (Advanced):**
- Train classifier on labeled examples
- Use BERT or similar model
- Higher accuracy for complex cases
- Requires training data

### Priority Scoring

**Scoring Factors:**
- **Engagement:** Upvotes, comments, age
- **Intent Strength:** Keyword match quality
- **Opportunity Type:** Some types more valuable
- **Competitor Presence:** Are competitors already responding?

**Priority Calculation:**
```python
def calculate_priority(opportunity):
    score = 0
    
    # Engagement (0-40 points)
    score += min(opportunity.upvotes * 2, 20)
    score += min(opportunity.comments, 20)
    
    # Intent Strength (0-30 points)
    if opportunity.keyword_matches >= 3:
        score += 30
    elif opportunity.keyword_matches >= 2:
        score += 20
    else:
        score += 10
    
    # Opportunity Type (0-20 points)
    type_scores = {
        "product_swap": 20,
        "budget_quality": 18,
        "dietary_restriction": 15,
        "ingredient_education": 12,
        "retail_trust": 10
    }
    score += type_scores.get(opportunity.type, 0)
    
    # Competitor Presence (0-10 points)
    if not opportunity.has_competitor_response:
        score += 10
    
    return score
```

---

## 3.3 Compliance-Aware Response Generation

### The Compliance Challenge

**Reddit's Rules:**
- No promotional content without disclosure
- Must provide value beyond brand mention
- Cannot create fake accounts or reviews
- Must follow subreddit-specific rules

**Brand Requirements:**
- Maintain authentic voice
- Provide genuine value
- Avoid legal issues
- Protect brand reputation

### GPT-5 Response Generation

**Prompt Engineering:**
```python
response_prompt = f"""
You are a helpful expert in {product_category}. A Reddit user has 
asked: "{user_question}"

Generate 2-4 response options that:
1. Provide genuine value and answer the question
2. Follow Reddit's rules (no direct promotion)
3. Include subtle brand mention only if genuinely relevant
4. Use authentic, helpful tone
5. Include proper disclosure if mentioning brand

Context about our product:
- {product_features}
- {product_benefits}
- {target_use_cases}

Opportunity type: {opportunity_type}

Generate responses that would be helpful to the Reddit community.
"""
```

**Response Options Generation:**
- Generate 2-4 variations
- Different approaches (value-first, comparison, educational)
- Vary brand mention subtlety
- Test compliance with rules

**Example Generated Responses:**

**Option 1: Value-First (No Brand Mention)**
```
"I've been working with [product category] for 5 years. Here's what 
I recommend:

[Detailed helpful advice]

[Additional resources and tips]

Happy to answer follow-up questions!"
```

**Option 2: Subtle Brand Integration**
```
"Great question! I've tried several options. Here's my take:

[Helpful comparison]

I personally use [Your Product] for [specific use case] because 
[genuine reason]. It's not perfect - [honest limitation] - but 
works well for [scenario].

[More helpful advice]

Disclosure: I work in this industry but this is my honest opinion."
```

**Option 3: Educational Approach**
```
"Let me break down [topic] for you:

[Educational content]

[Detailed explanation]

[Resources and examples]

If you're interested, I can share more about [related topic]."
```

### Compliance Checking

**Automated Checks:**
- No direct promotional language
- Includes value beyond brand mention
- Proper disclosure if needed
- Follows subreddit rules
- Authentic tone

**Human Review Required For:**
- High-stakes opportunities
- Complex compliance questions
- New subreddits
- Sensitive topics

---

## 3.4 Human-in-the-Loop Workflows

### Why Human Review is Essential

**Automation Limitations:**
- Cannot fully understand context
- May miss nuanced compliance issues
- Lacks judgment for sensitive situations
- Cannot build relationships

**Human Value:**
- Final compliance check
- Context understanding
- Relationship building
- Quality assurance

### Slack Integration

**Workflow Design:**
```
Opportunity Detected
    ↓
Slack Alert with:
- Post link
- Classification
- Priority score
- Generated responses
- One-click action buttons
    ↓
Human Review (2-5 min)
    ↓
Approve/Edit/Reject
    ↓
If Approved → Post to Reddit
```

**Slack Message Format:**
```
🚨 New Citation Opportunity

📊 Priority: High (85/100)
🏷️ Type: Product Swap
📍 Subreddit: r/yourniche
👤 User: u/username

📝 Original Post:
"[Post title and excerpt]"

💬 Generated Responses:
[Option 1]
[Option 2]
[Option 3]

⚡ Actions:
[Approve Option 1] [Approve Option 2] [Approve Option 3]
[Edit Response] [Reject] [View Full Post]
```

### One-Click Actions

**Approve Options:**
- Approve Option 1/2/3/4
- Posts immediately to Reddit
- Logs action for tracking
- Sends confirmation

**Edit Response:**
- Opens edit interface
- Allows human modification
- Maintains compliance checks
- Re-submits for approval

**Reject:**
- Marks opportunity as rejected
- Records reason (optional)
- Learns from rejections
- Improves future generation

**View Full Post:**
- Opens Reddit thread
- Provides full context
- Enables informed decision

### Response Time Optimization

**SLA Targets:**
- High priority: Respond within 1 hour
- Medium priority: Respond within 4 hours
- Low priority: Respond within 24 hours

**Automation Helps:**
- Immediate detection
- Pre-generated responses
- Quick human review
- Fast posting

### Tracking and Analytics

**Metrics to Track:**
- Opportunities detected per day
- Response time
- Approval rate
- Engagement on responses
- Citation rate in AI platforms

**Dashboard:**
- Daily opportunity summary
- Response performance
- Top performing responses
- Improvement areas

---

## 3.5 Key Takeaways

**Intelligent Scanning:**
- Use Mastra framework for automation
- Scan every 10 minutes for real-time detection
- Focus on high-intent keywords
- Filter for quality opportunities

**Smart Classification:**
- Five opportunity types: Ingredient Education, Budget vs. Quality, Product Swaps, Dietary Restrictions, Retail Trust
- Use rule-based or ML classification
- Prioritize by engagement, intent, and type

**Compliance-Aware Generation:**
- Use GPT-5 to generate multiple response options
- Ensure value-first approach
- Include proper disclosure
- Maintain authentic tone

**Human-in-the-Loop:**
- Slack integration for review workflow
- One-click approval actions
- 2-5 minute review time
- Essential for quality and compliance

---

## Exercise 3: Build Your Citation Monitoring System

**Objective:** Set up an automated citation opportunity monitoring system

**Requirements:**
1. **Setup Mastra Framework:**
   - Install and configure Mastra
   - Set up Reddit API connection
   - Configure scanning schedule

2. **Define Scanning Parameters:**
   - Identify 5-10 target subreddits
   - Create keyword list (20+ keywords)
   - Set up filters (min upvotes, max age, etc.)

3. **Implement Classification:**
   - Create classification logic for 5 opportunity types
   - Build priority scoring system
   - Test on sample posts

4. **Response Generation:**
   - Set up GPT-5 API connection
   - Create response generation prompts
   - Generate 2-4 response options per opportunity

5. **Slack Integration:**
   - Set up Slack webhook
   - Create alert message format
   - Implement one-click actions
   - Test workflow end-to-end

**Deliverables:**
- Working automation system (code repository)
- Configuration documentation (2 pages)
- Testing results (1 page)
- Workflow diagram (1 page)

**Evaluation Criteria:**
- System functionality (30%)
- Classification accuracy (25%)
- Response quality (25%)
- Integration completeness (20%)

**Time Estimate:** 4-5 hours

---

## Additional Resources

**Readings:**
- "Mastra Framework Documentation" - Technical guide
- "Reddit API Best Practices" - Integration guide
- "GPT-5 Prompt Engineering" - Response generation
- "Slack Workflow Automation" - Integration patterns

**Tools to Explore:**
- Mastra framework
- Reddit API
- OpenAI GPT-5 API
- Slack API and webhooks

**Next Module Preview:**
Module 4 will teach you how to protect your brand from negative sentiment training data and avoid reputation crises through ethical design and crisis management.

---

**Module 3 Complete** ✓  
**Next:** Module 4 - Risk Mitigation & Ethical Design
