---
title: "Module 5: Root-Cause Analysis & Diagnostics"
description: "Why did this happen? Diagnosing root causes, not just symptoms"
module: "5"
order: 5
---

# Module 5: Root-Cause Analysis & Diagnostics

**Duration:** Week 5  
**Theme:** *Why did this happen?*

**Learning Objectives:**
- Distinguish diagnostic analytics from descriptive analytics
- Apply drill-down strategies effectively
- Use segmentation and slicing for diagnosis
- Understand correlation vs causation (at analyst level)
- Write clear analytical narratives

---

## 5.1 Diagnostic Analytics vs Descriptive Analytics

### Introduction

Not all analytics are created equal. Understanding the difference between descriptive and diagnostic analytics helps you move from "what happened" to "why it happened."

### Descriptive Analytics

**Definition:** Analytics that describe what happened.

**Characteristics:**
- Summarizes past events
- Answers "what" questions
- Reports on metrics
- Historical focus

**Examples:**
- "Revenue was $1M last month"
- "We had 10,000 users"
- "Conversion rate was 3%"

**Limitations:**
- Doesn't explain why
- Doesn't predict future
- Doesn't suggest actions

### Diagnostic Analytics

**Definition:** Analytics that explain why something happened.

**Characteristics:**
- Investigates causes
- Answers "why" questions
- Identifies root causes
- Action-oriented

**Examples:**
- "Revenue dropped because new user acquisition decreased 40%"
- "User growth slowed due to increased churn in month 2"
- "Conversion rate improved because we fixed checkout flow"

**Benefits:**
- Explains causes
- Enables action
- Prevents recurrence
- Builds understanding

### The Diagnostic Process

```
1. Observe: Something changed (descriptive)
   ↓
2. Hypothesize: Why might this have happened?
   ↓
3. Investigate: Test hypotheses with data
   ↓
4. Identify: Root cause(s)
   ↓
5. Validate: Confirm with evidence
   ↓
6. Communicate: Explain findings
```

### When to Use Each

**Use Descriptive Analytics When:**
- Reporting on status
- Tracking KPIs
- Providing context
- Building dashboards

**Use Diagnostic Analytics When:**
- Something unexpected happened
- Need to understand cause
- Planning interventions
- Preventing recurrence

### Example: Revenue Drop

**Descriptive:**
- "Revenue dropped 15% this month"

**Diagnostic:**
- "Revenue dropped 15% because:
  1. New customer acquisition decreased 30%
  2. Average order value decreased 10%
  3. Customer retention remained stable
  Root cause: Marketing channel changes reduced qualified traffic"

---

## 5.2 Drill-Down Strategies

### Introduction

Drill-down is the process of moving from high-level metrics to detailed data to understand what's driving changes. Effective drill-down strategies help you find root causes efficiently.

### The Drill-Down Framework

**Level 1: Overall Metric**
- High-level view
- Example: Total revenue

**Level 2: Dimensions**
- Break down by category
- Example: Revenue by product, region, channel

**Level 3: Time Patterns**
- Look at trends
- Example: Revenue by day, week, month

**Level 4: Individual Records**
- Specific examples
- Example: Individual transactions, users

### Dimension-Based Drill-Down

**Strategy:** Break down metrics by relevant dimensions to find where changes occurred.

**Dimensions to Consider:**
- Product/Category
- Geography/Region
- Customer Segment
- Channel/Source
- Time Period
- User Type (new vs returning)

**Example: Revenue Drop Investigation**

```
Level 1: Total revenue ↓ 15%
    ↓
Level 2: Revenue by channel
    - Organic: ↓ 5%
    - Paid: ↓ 25%  ← Problem here
    - Direct: ↓ 10%
    ↓
Level 3: Paid channel by campaign
    - Campaign A: ↓ 40%  ← Root cause
    - Campaign B: ↓ 10%
    - Campaign C: Stable
    ↓
Level 4: Campaign A details
    - Budget reduced
    - Quality score dropped
    - Competitor entered market
```

### Time-Based Drill-Down

**Strategy:** Examine when changes occurred to identify triggers.

**Time Granularities:**
- Year → Quarter → Month → Week → Day → Hour

**Example: Conversion Rate Drop**

```
Level 1: Monthly conversion rate ↓ 10%
    ↓
Level 2: Weekly conversion rate
    - Week 1: Stable
    - Week 2: Stable
    - Week 3: ↓ 15%  ← When it started
    - Week 4: ↓ 12%
    ↓
Level 3: Daily conversion rate (Week 3)
    - Monday: Stable
    - Tuesday: ↓ 20%  ← Specific day
    - Rest of week: ↓ 10%
    ↓
Level 4: Hourly (Tuesday)
    - 2 PM: ↓ 30%  ← Specific time
    - Investigation: Site update deployed at 2 PM
```

### Cohort-Based Drill-Down

**Strategy:** Compare different user cohorts to identify segment-specific issues.

**Cohort Types:**
- Signup date cohorts
- Acquisition channel cohorts
- Product version cohorts
- Geographic cohorts

**Example: Retention Drop**

```
Level 1: Overall retention ↓ 5%
    ↓
Level 2: Retention by signup cohort
    - Jan cohort: Stable
    - Feb cohort: ↓ 10%  ← Problem cohort
    - Mar cohort: Stable
    ↓
Level 3: Feb cohort by acquisition channel
    - Organic: Stable
    - Paid: ↓ 15%  ← Problem channel
    ↓
Level 4: Paid Feb cohort details
    - Campaign changed messaging
    - Onboarding flow changed
    - Root cause: Messaging mismatch
```

### Best Practices

1. **Start Broad, Go Narrow:** Begin with overall metric, then drill down
2. **Use Multiple Dimensions:** Don't stop at first dimension
3. **Compare to Baseline:** Always compare to previous period or similar segments
4. **Document Findings:** Track what you've checked
5. **Stop When You Find Root Cause:** Don't over-drill

---

## 5.3 Segmentation & Slicing

### Introduction

Segmentation and slicing are powerful diagnostic tools. They help identify which groups are driving changes and reveal patterns that aren't visible in aggregate data.

### What is Segmentation?

**Definition:** Dividing data into groups based on shared characteristics.

**Purpose:**
- Identify which segments are driving changes
- Understand segment-specific behavior
- Target interventions effectively

### Common Segmentation Dimensions

**User Segments:**
- New vs returning users
- Free vs paid users
- Active vs inactive users
- High-value vs low-value users

**Product Segments:**
- Product categories
- Product tiers
- Feature usage
- Price points

**Behavioral Segments:**
- Engagement level
- Usage frequency
- Feature adoption
- Purchase behavior

**Geographic Segments:**
- Country/region
- City
- Time zone
- Language

### Segmentation Analysis Process

**Step 1: Identify Key Segments**
- Which segments are most relevant?
- What segments might explain the change?

**Step 2: Calculate Metrics by Segment**
- Apply same metric to each segment
- Compare segments to each other
- Compare segments to baseline

**Step 3: Identify Anomalies**
- Which segments changed most?
- Which segments are outliers?
- Are changes consistent across segments?

**Step 4: Investigate Anomalies**
- Why did this segment change?
- What's different about this segment?
- Is this the root cause?

### Example: Conversion Rate Investigation

**Overall:** Conversion rate ↓ 10%

**Segmentation Analysis:**

| Segment | Baseline | Current | Change |
|---------|----------|---------|--------|
| New Users | 5% | 3% | ↓ 40% |
| Returning Users | 8% | 8% | Stable |
| Mobile | 4% | 2% | ↓ 50% |
| Desktop | 6% | 6% | Stable |
| US | 5% | 4% | ↓ 20% |
| International | 5% | 5% | Stable |

**Findings:**
- New users on mobile driving the drop
- Returning users and desktop stable
- US new mobile users specifically affected

**Root Cause Hypothesis:** Mobile checkout flow issue affecting new users in US

### Slicing

**Definition:** Examining data from multiple angles simultaneously.

**Purpose:**
- Find interactions between dimensions
- Identify complex patterns
- Avoid missing important factors

### Multi-Dimensional Slicing

**Example: Revenue Analysis**

Slice by:
- Product × Channel
- Customer Segment × Time Period
- Geography × Product Category

**Revenue by Product × Channel:**

| Product | Organic | Paid | Direct | Total |
|---------|---------|------|--------|-------|
| Product A | $100K | $50K | $30K | $180K |
| Product B | $80K | $120K | $20K | $220K |
| Product C | $60K | $40K | $100K | $200K |

**Insights:**
- Product A: Strong organic, weak paid
- Product B: Paid-driven
- Product C: Direct-driven

### Statistical Significance

**Important:** When segmenting, ensure differences are statistically significant, not just noise.

**Considerations:**
- Sample size per segment
- Confidence intervals
- P-values for differences
- Effect size (not just significance)

---

## 5.4 Correlation vs Causation

### Introduction

One of the most common mistakes in analytics is confusing correlation with causation. Understanding the difference is crucial for accurate diagnosis.

### Correlation

**Definition:** Two variables change together.

**Characteristics:**
- Statistical relationship
- Doesn't imply causation
- Can be positive or negative
- Can be spurious

**Example:**
- Ice cream sales and drowning deaths are correlated (both increase in summer)
- But ice cream doesn't cause drowning

### Causation

**Definition:** One variable directly causes another.

**Characteristics:**
- Direct relationship
- One causes the other
- Requires evidence beyond correlation
- Harder to prove

**Example:**
- Smoking causes lung cancer (causation)
- Not just correlated, but directly causes

### Why It Matters

**Mistake:** Assuming correlation = causation leads to:
- Wrong root causes
- Ineffective interventions
- Wasted resources
- Missed opportunities

**Example:**
- Conversion rate and page load time are correlated
- Assumption: Slow pages cause low conversion
- Reality: Both caused by high traffic volume
- Fix: Optimize for traffic, not just page speed

### Establishing Causation

**Criteria (at analyst level):**

1. **Temporal Order:** Cause must precede effect
2. **Correlation:** Variables must be related
3. **Eliminate Alternatives:** Other explanations ruled out
4. **Mechanism:** Understandable causal mechanism
5. **Consistency:** Relationship holds across contexts

### Techniques for Analysts

**1. Controlled Comparisons**
- Compare similar groups with/without treatment
- Example: A/B tests

**2. Time-Series Analysis**
- Cause should precede effect in time
- Look for lagged relationships

**3. Instrumental Variables**
- Use proxy variables to establish causation
- Advanced technique, use carefully

**4. Natural Experiments**
- Leverage external events
- Example: Policy changes, market events

**5. Regression Analysis**
- Control for confounding variables
- Establish relationship after controlling

### Example: User Engagement Drop

**Observation:** User engagement dropped 20%

**Correlation Found:** Engagement correlated with feature X usage

**Hypothesis:** Feature X usage causes engagement

**Test:**
1. **Temporal Order:** Did feature usage drop before engagement? ✓
2. **Eliminate Alternatives:** 
   - Did other factors change? (Yes - new competitor launched)
   - Did user base change? (Yes - new user segment)
3. **Mechanism:** Why would feature X affect engagement? (Unclear)
4. **Controlled Comparison:** Compare users with/without feature X access

**Conclusion:** Correlation, not causation. Both affected by new competitor and user base change.

### Best Practices

1. **Be Skeptical:** Correlation doesn't mean causation
2. **Test Hypotheses:** Use controlled comparisons when possible
3. **Consider Alternatives:** What else could explain this?
4. **Look for Mechanisms:** How would this cause that?
5. **Use Time:** Cause should precede effect
6. **Communicate Uncertainty:** Distinguish correlation from causation

---

## 5.5 Writing Analytical Narratives

### Introduction

A good analytical narrative tells a story that explains what happened and why. It connects data points into a coherent explanation that leads to action.

### Structure of Analytical Narrative

**1. The Hook (What Changed?)**
- Start with the key finding
- Make it clear and compelling
- Example: "Revenue dropped 15% this month"

**2. The Investigation (What Did We Find?)**
- Present the evidence
- Show the analysis
- Example: "Drill-down revealed the drop was concentrated in..."

**3. The Root Cause (Why Did It Happen?)**
- Explain the cause
- Provide evidence
- Example: "Root cause: Marketing channel changes reduced qualified traffic by 30%"

**4. The Impact (How Significant Is This?)**
- Quantify the impact
- Compare to baseline
- Example: "This accounts for 12 of the 15 percentage point drop"

**5. The Confidence (How Sure Are We?)**
- Acknowledge uncertainty
- Note limitations
- Example: "High confidence (90%) based on multiple data sources"

**6. The Recommendation (What Should We Do?)**
- Suggest actions
- Prioritize
- Example: "Recommendation: Restore previous marketing channel mix and investigate quality score decline"

### Writing Style

**Be Clear:**
- Use simple language
- Avoid jargon
- Define terms

**Be Concise:**
- Get to the point
- Remove unnecessary detail
- Focus on what matters

**Be Confident (But Honest):**
- State findings clearly
- Acknowledge uncertainty
- Don't overstate confidence

**Be Actionable:**
- Connect to decisions
- Provide recommendations
- Make next steps clear

### Example Narrative

**Title:** Revenue Drop Investigation - January 2024

**Executive Summary:**
Revenue dropped 15% in January ($1.7M → $1.45M). Investigation identified root cause: 30% reduction in qualified traffic from paid search channel, accounting for 12 of the 15 percentage point drop.

**Investigation:**
Drill-down analysis revealed:
- Overall revenue: ↓ 15%
- Revenue by channel:
  - Paid search: ↓ 25% (largest contributor)
  - Organic: ↓ 5%
  - Direct: ↓ 10%
- Paid search traffic: ↓ 30%
- Paid search conversion: Stable

**Root Cause:**
Marketing team reduced paid search budget by 40% in mid-December due to cost concerns. This reduced qualified traffic by 30%, directly causing the revenue drop.

**Impact:**
- Paid search revenue: ↓ $300K
- Accounts for 12 of 15 percentage point drop (80% of total drop)
- Other channels relatively stable

**Confidence:**
High (90%). Clear temporal relationship (budget cut → traffic drop → revenue drop), and other factors ruled out.

**Recommendations:**
1. **Immediate:** Restore paid search budget to previous levels
2. **Short-term:** Investigate quality score decline (may have contributed)
3. **Long-term:** Diversify traffic sources to reduce dependency on paid search

---

## Lab 5: Root-Cause Investigation

### Objective

Investigate simulated business issues and write clear root-cause narratives.

### Tasks

**Task 1: Conversion Drop Investigation (2 hours)**

Scenario: Conversion rate dropped 20% this week.

1. Formulate hypotheses
2. Perform drill-down analysis
3. Use segmentation to identify problem areas
4. Distinguish correlation from causation
5. Write analytical narrative

**Deliverable:** Investigation report with root-cause narrative

**Task 2: Revenue Decline Investigation (2 hours)**

Scenario: Revenue declined 10% this month.

1. Investigate across dimensions (product, channel, geography)
2. Use time-based analysis to identify when it started
3. Apply cohort analysis if relevant
4. Identify root cause(s)
5. Write analytical narrative

**Deliverable:** Investigation report with root-cause narrative

**Task 3: Retention Anomaly Investigation (2 hours)**

Scenario: Month 2 retention dropped unexpectedly.

1. Compare to historical cohorts
2. Segment by relevant dimensions
3. Identify what changed
4. Establish causation (not just correlation)
5. Write analytical narrative

**Deliverable:** Investigation report with root-cause narrative

**Task 4: Narrative Review (1 hour)**

For all three investigations:

1. Review narrative quality
2. Check for clarity and actionability
3. Verify confidence levels are appropriate
4. Ensure recommendations are specific

**Deliverable:** Narrative review with improvements

### Deliverables

- 3 investigation reports (one per scenario)
- 1 narrative review document
- 1-page summary of diagnostic approach

### Evaluation Criteria

- **Investigation Depth (40%):** Thorough analysis, multiple angles explored
- **Root Cause Identification (30%):** Accurate root cause, evidence provided
- **Narrative Quality (20%):** Clear, compelling, actionable
- **Methodology (10%):** Proper use of diagnostic techniques

---

## Key Takeaways

1. **Diagnostic vs Descriptive:** Move from "what" to "why"
2. **Drill-Down Strategies:** Start broad, go narrow, use multiple dimensions
3. **Segmentation:** Identify which groups drive changes
4. **Correlation ≠ Causation:** Test hypotheses, consider alternatives
5. **Analytical Narratives:** Tell a story that explains and recommends

---

## Additional Resources

### Reading
- "Thinking, Fast and Slow" by Daniel Kahneman (cognitive biases)
- "The Art of Problem Solving" by Russell Ackoff
- "Root Cause Analysis" methodologies (5 Whys, Fishbone diagrams)

### Tools
- Statistical analysis tools (R, Python)
- Visualization tools for drill-down
- A/B testing platforms

### Next Steps
- Complete Lab 5
- Review Module 6: Storytelling & Executive Communication
- Join course discussion forum

---

**Module 5 Complete. Ready for Module 6? →**
