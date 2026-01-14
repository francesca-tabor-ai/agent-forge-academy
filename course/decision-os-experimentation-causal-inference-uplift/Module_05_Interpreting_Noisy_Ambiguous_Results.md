---
title: "Module 5: Interpreting Noisy & Ambiguous Results"
description: "Learn to interpret experiments with weak signals, conflicting metrics, and uncertainty—most experiments are not clean"
module: "5"
order: 5
email_takeaway: "Most experiments are messy. Learn to interpret weak signals, conflicting metrics, and make decisions under uncertainty."
email_action: "Analyze an experiment with weak signals or conflicting metrics—write a decision narrative under uncertainty."
---

# Module 5: Interpreting Noisy & Ambiguous Results

**Duration:** Week 5  
**Theme:** *Most experiments are not clean*

**Learning Objectives:**
- Distinguish statistical vs practical significance
- Interpret confidence intervals vs p-values
- Understand heterogeneous treatment effects
- Recognize Simpson's paradox and aggregation bias
- Make decisions when "no result" is still a decision
- Create decision narratives under uncertainty

---

## 5.1 Statistical vs Practical Significance

### The Fundamental Distinction

**Statistical Significance:**
- "Is the effect different from zero (beyond chance)?"
- Determined by p-value and sample size
- Can be achieved with tiny effects if sample is large enough

**Practical Significance:**
- "Does the effect matter for the business?"
- Determined by effect size and business context
- Requires judgment, not just statistics

### The Problem: Large Samples

**Example:**
```
Effect: 0.1% increase in conversion rate
Sample: 10 million users
Result: p < 0.001 (highly statistically significant)
```

**Statistical Significance:** ✅ Yes (p < 0.001)  
**Practical Significance:** ❓ Maybe (0.1% might not matter)

**Why This Happens:**
- Larger samples → Smaller standard errors
- Smaller standard errors → Easier to detect tiny effects
- Statistical significance doesn't mean business impact

### Effect Size Matters

**Key Metrics:**

1. **Absolute Effect Size**
   - Raw difference: 2.5% → 2.6% = 0.1% absolute
   - Easy to interpret
   - Business-relevant

2. **Relative Effect Size**
   - Percentage change: 0.1% / 2.5% = 4% relative
   - Standardized comparison
   - Can be misleading if baseline is small

3. **Standardized Effect Size (Cohen's d)**
   - Effect / Standard deviation
   - Comparable across metrics
   - Less intuitive for business

**Decision Framework:**
```
Statistically Significant? → Check Effect Size
    ↓
Effect Size Meaningful? → Consider Business Context
    ↓
Business Impact Positive? → Rollout Decision
```

### Practical Significance Thresholds

**Setting Thresholds:**

**Revenue Metrics:**
- Minimum: 1-2% relative increase
- Meaningful: 5%+ relative increase
- Context: Revenue per user, total revenue

**Engagement Metrics:**
- Minimum: 3-5% relative increase
- Meaningful: 10%+ relative increase
- Context: DAU, session duration, retention

**Conversion Metrics:**
- Minimum: 5% relative increase
- Meaningful: 10-15%+ relative increase
- Context: Sign-up rate, purchase rate

**Note:** Thresholds depend on:
- Baseline rates
- Business context
- Cost of implementation
- Risk tolerance

---

## 5.2 Confidence Intervals vs P-Values

### Why Confidence Intervals Are Better

**P-Value Problems:**
- Binary: Significant or not
- Doesn't convey effect size
- Misleading with large samples
- Often misinterpreted

**Confidence Interval Advantages:**
- Shows effect size range
- Conveys uncertainty
- More informative
- Better for decision-making

### Interpreting Confidence Intervals

**95% Confidence Interval:**
- "We're 95% confident the true effect lies in this range"
- Not: "95% chance the effect is in this range" (common mistake)

**Example:**
```
Conversion Rate Increase: 2.3% ± 0.8%
95% CI: [1.5%, 3.1%]
```

**Interpretation:**
- Best estimate: 2.3% increase
- Range of plausible values: 1.5% to 3.1%
- Unlikely true effect is < 1.5% or > 3.1%

### Decision-Making with Confidence Intervals

**Scenario 1: Clear Positive Effect**
```
Effect: +5.2%
95% CI: [4.1%, 6.3%]
```

**Decision:** ✅ Rollout
- Entire interval is positive
- Effect size is meaningful
- Low uncertainty

**Scenario 2: Positive but Uncertain**
```
Effect: +2.1%
95% CI: [-0.3%, 4.5%]
```

**Decision:** ⚠️ Consider carefully
- Interval includes zero
- Could be no effect
- Need more data or context

**Scenario 3: Negative Effect**
```
Effect: -1.8%
95% CI: [-3.2%, -0.4%]
```

**Decision:** ❌ Do not rollout
- Entire interval is negative
- Clear harm

**Scenario 4: Very Uncertain**
```
Effect: +0.5%
95% CI: [-2.1%, 3.1%]
```

**Decision:** ❓ Inconclusive
- Wide interval
- Includes both positive and negative
- Need more data or different approach

### Confidence Level Selection

**Standard: 95% Confidence**
- Industry standard
- 5% false positive rate
- Good balance

**Higher Confidence (99%):**
- More stringent
- Wider intervals
- Use for high-stakes decisions

**Lower Confidence (90%):**
- Less stringent
- Narrower intervals
- Use for exploratory analysis

**Key Principle:**
- Choose confidence level based on decision stakes
- Higher stakes → Higher confidence needed

---

## 5.3 Heterogeneous Treatment Effects

### The Problem: One Size Doesn't Fit All

**Average Treatment Effect (ATE):**
- Overall effect across all users
- Hides variation
- May not apply to any specific user

**Reality:**
- Effects vary by user characteristics
- Some users benefit, others don't
- Some may be harmed

### Sources of Heterogeneity

**1. User Characteristics**
- Demographics (age, gender, location)
- Behavior (engagement level, past purchases)
- Preferences (product category interests)

**2. Context**
- Time of day, day of week
- Device type
- Entry point

**3. Treatment Intensity**
- Different exposure levels
- Frequency of treatment
- Duration of treatment

### Analyzing Heterogeneous Effects

**Subgroup Analysis:**

```python
# Overall effect
overall_effect = calculate_ate(df)

# By segment
for segment in ['new_users', 'returning_users']:
    segment_df = df[df['segment'] == segment]
    segment_effect = calculate_ate(segment_df)
    print(f"{segment}: {segment_effect}")
```

**Regression with Interactions:**

```python
import statsmodels.api as sm

# Interaction model
df['treatment_x_segment'] = df['treatment'] * df['segment']

X = df[['treatment', 'segment', 'treatment_x_segment', 'covariates']]
y = df['outcome']

model = sm.OLS(y, sm.add_constant(X)).fit()
print(model.summary())

# Treatment effect for each segment
# Base effect + interaction term
```

**Machine Learning Approaches:**

```python
from econml.metalearners import TLearner

# Estimate heterogeneous effects
learner = TLearner(models=RandomForestRegressor())
learner.fit(X, treatment, y)

# Predict individual treatment effects
individual_effects = learner.effect(X)
```

### Interpreting Heterogeneous Effects

**Example: Pricing Experiment**

**Overall Effect:**
- Average: +2.1% revenue
- 95% CI: [0.8%, 3.4%]

**By Segment:**
- High-value users: +5.3% [3.1%, 7.5%]
- Medium-value users: +1.8% [-0.2%, 3.8%]
- Low-value users: -2.1% [-4.3%, 0.1%]

**Decision Implications:**
- ✅ Rollout to high-value users
- ⚠️ Test more for medium-value
- ❌ Don't rollout to low-value users

**Key Questions:**
1. Can we target by segment?
2. What's the net effect if we roll out to all?
3. Are negative effects acceptable for some users?

---

## 5.4 Simpson's Paradox & Aggregation Bias

### Simpson's Paradox

**Definition:** Trend appears in different groups but disappears or reverses when groups are combined

**Classic Example: Kidney Stone Treatment**

**Aggregated Results:**
```
Treatment A: 78% success (273/350)
Treatment B: 83% success (289/350)
Conclusion: Treatment B is better
```

**By Stone Size:**
```
Small stones:
  Treatment A: 93% (81/87)
  Treatment B: 87% (234/270)
  → Treatment A better

Large stones:
  Treatment A: 73% (192/263)
  Treatment B: 69% (55/80)
  → Treatment A better
```

**Paradox:** Treatment A is better in both subgroups, but worse overall!

**Why This Happens:**
- Treatment A used more for large stones (harder cases)
- Treatment B used more for small stones (easier cases)
- Aggregation hides the selection bias

### Business Example: Feature Experiment

**Aggregated Results:**
```
Feature: +3.2% engagement
95% CI: [1.8%, 4.6%]
Conclusion: Rollout feature
```

**By User Segment:**
```
New users: -5.1% [-7.2%, -3.0%]  (harmful)
Returning users: +8.3% [6.1%, 10.5%]  (beneficial)
```

**Paradox:** Feature helps returning users but hurts new users. Overall positive because more returning users in sample.

**Decision Implications:**
- ❌ Don't rollout to all users
- ✅ Rollout only to returning users
- ⚠️ Need different solution for new users

### Detecting Simpson's Paradox

**Red Flags:**
1. Effect direction differs by segment
2. Segment sizes are very different
3. Treatment assignment correlates with segment
4. Aggregated effect seems inconsistent with segments

**Prevention:**
- Always analyze by key segments
- Check for interaction effects
- Don't rely solely on aggregate results
- Understand treatment assignment mechanism

### Aggregation Bias

**Definition:** Bias from aggregating data inappropriately

**Types:**

1. **Temporal Aggregation**
   - Aggregating across time periods
   - Hides time-varying effects
   - Solution: Analyze by time period

2. **Geographic Aggregation**
   - Aggregating across regions
   - Hides regional differences
   - Solution: Analyze by region

3. **Product Aggregation**
   - Aggregating across products
   - Hides product-specific effects
   - Solution: Analyze by product

**Best Practice:**
- Start with aggregate analysis
- Always check key segments
- Look for heterogeneity
- Don't aggregate away important variation

---

## 5.5 When "No Result" Is Still a Decision

### The Problem with "No Significant Result"

**Common Misinterpretation:**
- "No significant result" = "No effect"
- "Experiment failed"
- "Do nothing"

**Reality:**
- "No significant result" = "Uncertain"
- Could be no effect, or effect too small to detect
- Still need to make a decision

### Types of "No Result"

**1. True Null Effect**
- Treatment genuinely has no effect
- Decision: Don't rollout (or iterate)

**2. Underpowered Test**
- Effect exists but too small to detect
- Sample size too small
- Decision: Need more data or larger MDE

**3. Effect in Wrong Direction**
- Treatment has negative effect (not significant)
- Decision: Don't rollout (even if not significant)

**4. High Variance**
- Effect exists but masked by noise
- Wide confidence intervals
- Decision: Need more data or better measurement

### Decision Framework for "No Result"

**Step 1: Check Confidence Interval**

```
Effect: +0.8%
95% CI: [-1.2%, 2.8%]
```

**Interpretation:**
- Includes zero → Not significant
- But also includes meaningful positive values
- Uncertainty is high

**Step 2: Assess Practical Significance**

**If entire CI is below practical threshold:**
- Effect too small even if real
- Decision: Don't rollout

**If CI includes meaningful values:**
- Could be meaningful effect
- Decision: Need more data or accept uncertainty

**Step 3: Consider Costs**

**Cost of Rolling Out:**
- Implementation cost
- Risk of negative effect
- Opportunity cost

**Cost of Not Rolling Out:**
- Missed opportunity
- Competitive disadvantage
- Stagnation

**Step 4: Make Decision**

**Options:**
1. **Don't Rollout** (if risk > opportunity)
2. **Iterate** (if design can be improved)
3. **Collect More Data** (if feasible)
4. **Rollout with Monitoring** (if low risk, high potential)

### Communicating "No Result"

**Bad Communication:**
- "Experiment showed no effect"
- "Feature doesn't work"
- "We should kill this"

**Good Communication:**
- "Experiment was inconclusive"
- "Effect estimate is [X] with 95% CI [Y, Z]"
- "Given uncertainty and [costs/benefits], we recommend [decision]"
- "Next steps: [iterate/collect more data/monitor]"

---

## 5.6 Creating Decision Narratives Under Uncertainty

### The Decision Narrative Framework

**Components:**

1. **Context**
   - What decision are we making?
   - Why does it matter?
   - What's at stake?

2. **Evidence**
   - What did we observe?
   - What's the effect estimate?
   - What's the uncertainty?

3. **Interpretation**
   - What does the evidence mean?
   - What are the limitations?
   - What are alternative explanations?

4. **Recommendation**
   - What should we do?
   - Why this recommendation?
   - What are the risks?

5. **Next Steps**
   - What happens next?
   - How will we monitor?
   - What will we learn?

### Example Decision Narrative

**Context:**
We tested a new checkout flow to reduce cart abandonment. This is a high-stakes decision because checkout is our primary conversion point, and changes could significantly impact revenue.

**Evidence:**
- Treatment group: 2.8% conversion rate
- Control group: 2.5% conversion rate
- Effect: +0.3% absolute (+12% relative)
- 95% CI: [-0.1%, 0.7%]
- p-value: 0.08 (not significant at α = 0.05)

**Interpretation:**
The point estimate suggests a meaningful 12% relative increase in conversion. However, the confidence interval includes zero, so we cannot rule out no effect. The effect could be as small as -0.1% (harmful) or as large as 0.7% (very beneficial).

**Limitations:**
- Experiment ran during holiday season (may not generalize)
- Sample size was adequate for 10% MDE, but effect is smaller
- Some users in treatment group didn't see new flow (implementation issue)

**Recommendation:**
Given the positive point estimate and potential for meaningful impact, we recommend a **gradual rollout with close monitoring**. Start with 10% of users, monitor conversion and guardrail metrics daily, and expand if metrics remain positive.

**Rationale:**
- Low risk: Easy to roll back if issues arise
- High potential: 12% relative increase would be very valuable
- Uncertainty manageable: Can monitor and adjust

**Risks:**
- False positive: Could be no effect (waste resources)
- Implementation issues: Some users didn't see treatment
- Seasonal effects: Results may not generalize

**Next Steps:**
1. Fix implementation to ensure all treatment users see new flow
2. Rollout to 10% of users
3. Monitor daily for 1 week
4. Expand to 50% if metrics positive
5. Full rollout if 50% stage successful

### Key Principles

**1. Acknowledge Uncertainty**
- Don't hide uncertainty
- Be transparent about limitations
- Quantify when possible

**2. Provide Context**
- Explain why decision matters
- Connect to business goals
- Consider stakeholder perspectives

**3. Make Recommendation Clear**
- State recommendation explicitly
- Justify with evidence and reasoning
- Address counterarguments

**4. Plan for Monitoring**
- How will we know if we're right?
- What metrics to watch?
- When to adjust course?

---

## 5.7 Key Takeaways

**Statistical vs Practical Significance:**
- Statistical significance ≠ business impact
- Large samples can make tiny effects significant
- Always assess effect size and business context

**Confidence Intervals > P-Values:**
- Confidence intervals show effect size and uncertainty
- Better for decision-making
- Interpret entire interval, not just point estimate

**Heterogeneous Effects:**
- Effects vary by user characteristics
- Always analyze by key segments
- Consider targeted rollouts

**Simpson's Paradox:**
- Aggregated results can be misleading
- Always check segment-level analysis
- Understand treatment assignment mechanism

**"No Result" Decisions:**
- "No significant result" ≠ "No effect"
- Still need to make a decision
- Consider costs, risks, and uncertainty

**Decision Narratives:**
- Structure: Context, Evidence, Interpretation, Recommendation, Next Steps
- Acknowledge uncertainty
- Make recommendation clear
- Plan for monitoring

---

## Lab 5: Decision Narrative Under Uncertainty

**Objective:** Analyze experiments with weak signals or conflicting metrics and write a decision narrative

**Requirements:**

Choose one scenario:

1. **Weak Signal Experiment**
   - Effect is positive but not significant
   - Wide confidence intervals
   - Uncertainty is high

2. **Conflicting Metrics Experiment**
   - Primary metric positive, guardrail negative
   - Or: Different segments show opposite effects
   - Trade-offs required

3. **Segment-Level Tradeoffs**
   - Some segments benefit, others harmed
   - Need to decide on rollout strategy

**For Your Scenario:**

1. **Analysis**
   - Calculate effect estimates
   - Compute confidence intervals
   - Analyze by segments
   - Check for Simpson's paradox

2. **Interpretation**
   - What does the evidence mean?
   - What are the limitations?
   - What are alternative explanations?

3. **Decision Narrative**
   - Context: Why this decision matters
   - Evidence: What we observed
   - Interpretation: What it means
   - Recommendation: What to do
   - Next Steps: How to proceed

4. **Risk Assessment**
   - What could go wrong?
   - What are the costs?
   - How will we monitor?

**Deliverables:**
- Analysis document (2-3 pages)
- Decision narrative (2-3 pages)
- Code/analysis files
- Presentation (optional)

**Evaluation Criteria:**
- Accurate statistical analysis (30%)
- Clear interpretation of uncertainty (25%)
- Thoughtful decision recommendation (25%)
- Complete decision narrative (20%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Statistical Significance vs Practical Significance" - Various
- "Confidence Intervals: A Guide" - Statistical guides
- "Simpson's Paradox" - Wikipedia, academic papers
- "Making Decisions Under Uncertainty" - Business case studies

**Videos:**
- "Statistical vs Practical Significance" - Khan Academy
- "Confidence Intervals Explained" - Statistics videos
- "Simpson's Paradox" - Educational videos

**Tools:**
- Statistical software (R, Python)
- Confidence interval calculators
- Visualization tools for heterogeneous effects

**Next Module Preview:**
Module 6 will cover uplift modeling and targeted decisions—who should get the treatment, incrementality vs prediction, and designing targeted rollout strategies.

---

**Module 5 Complete**  
**Next:** Module 6 - Uplift Modeling & Targeted Decisions
