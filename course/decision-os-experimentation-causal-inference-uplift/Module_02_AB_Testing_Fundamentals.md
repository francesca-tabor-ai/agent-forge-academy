---
title: "Module 2: A/B Testing Fundamentals (Done Properly)"
description: "Master the fundamentals of trustworthy A/B testing with proper randomization, power analysis, and guardrails"
module: "2"
order: 2
email_takeaway: "Proper A/B testing requires randomization, adequate power, and guardrails—not just statistical significance."
email_action: "Design an A/B test for a conversion funnel change, including sample size calculation and guardrail metrics."
---

# Module 2: A/B Testing Fundamentals (Done Properly)

**Duration:** Week 2  
**Theme:** *Trusting the basics*

**Learning Objectives:**
- Understand randomization, control, and treatment design
- Master unit of randomization and interference
- Calculate sample size, power, and Minimum Detectable Effect (MDE)
- Design guardrails vs success metrics
- Identify and avoid common A/B testing failure modes
- Design production-ready experiments

---

## 2.1 Randomization, Control, and Treatment Design

### The Foundation: Randomization

**Why Randomization Works:**

Randomization creates **statistical equivalence** between groups:
- Treatment group: Gets the change
- Control group: Gets the status quo

**Key Principle:**
> On average, randomization balances both observed and unobserved characteristics

**Without Randomization:**
- Selection bias
- Confounding variables
- Cannot establish causation

**With Randomization:**
- Groups are equivalent (on average)
- Differences are due to treatment (or chance)
- Can establish causation

### Control Group Design

**Purpose of Control:**
- Provides counterfactual: "What would have happened without the change?"
- Enables causal inference
- Controls for external factors (seasonality, market changes)

**Control Group Requirements:**
1. **Same Population:** Drawn from same user base
2. **Same Time Period:** Exposed simultaneously
3. **Same Conditions:** Except for the treatment
4. **Adequate Size:** For statistical power

**Common Mistakes:**
- ❌ Using historical data as control (confounded by time)
- ❌ Different user segments (selection bias)
- ❌ Too small control group (low power)

### Treatment Design

**Treatment = The Change Being Tested**

**Single Treatment Design:**
```
Control: Current version
Treatment: New version
```

**Multiple Treatment Design:**
```
Control: Current version
Treatment A: Variation 1
Treatment B: Variation 2
```

**Factorial Design:**
```
Control: Baseline
Treatment 1: Feature A only
Treatment 2: Feature B only
Treatment 3: Features A + B
```

**Treatment Design Principles:**
1. **Isolate the Change:** Only one thing different (when possible)
2. **Clear Hypothesis:** What effect do we expect?
3. **Practical Significance:** Is the change meaningful if it works?
4. **Implementation Feasibility:** Can we actually ship this?

### Randomization Mechanisms

**Simple Randomization:**
- Each unit has equal probability of assignment
- Coin flip for each user
- Works for large samples

**Stratified Randomization:**
- Randomize within strata (e.g., by country, user segment)
- Ensures balance on key dimensions
- Reduces variance

**Block Randomization:**
- Randomize in blocks (e.g., 4 users per block, 2 control, 2 treatment)
- Ensures exact balance in small samples
- Prevents temporal drift

**Example: User Randomization**
```python
import random
import hashlib

def assign_to_group(user_id, experiment_id):
    """Deterministic assignment based on user ID"""
    # Hash user_id + experiment_id for consistent assignment
    hash_value = hashlib.md5(f"{user_id}_{experiment_id}".encode()).hexdigest()
    # Convert to integer and take modulo
    assignment = int(hash_value, 16) % 100
    
    if assignment < 50:
        return "control"
    else:
        return "treatment"
```

**Key Properties:**
- Deterministic (same user always in same group)
- Uniform distribution (50/50 split)
- Reproducible

---

## 2.2 Unit of Randomization & Interference

### Choosing the Unit of Randomization

**Common Units:**
- **User-level:** Each user randomly assigned
- **Session-level:** Each session randomly assigned
- **Page-level:** Each page view randomly assigned
- **Geographic:** Entire regions randomly assigned

### User-Level Randomization

**When to Use:**
- ✅ User experience should be consistent
- ✅ Treatment affects user state (e.g., onboarding)
- ✅ Long-term effects matter

**Example:**
- Onboarding flow change
- Pricing experiment
- Feature flag for entire user journey

**Advantages:**
- No interference (user sees one version)
- Clean causal interpretation
- Matches business logic

**Disadvantages:**
- Requires user identification
- Can't test session-level changes easily

### Session-Level Randomization

**When to Use:**
- ✅ Treatment is session-specific
- ✅ Want to test multiple variations per user
- ✅ Short-term effects only

**Example:**
- Homepage layout
- Search results ranking
- Banner ad variations

**Advantages:**
- More data points (multiple sessions per user)
- Can test session-specific treatments

**Disadvantages:**
- Potential interference (user sees both versions)
- More complex analysis

### Geographic Randomization

**When to Use:**
- ✅ Treatment affects entire market
- ✅ Network effects matter
- ✅ Cannot randomize at user level

**Example:**
- Pricing by region
- Market-wide policy changes
- Supply-side experiments

**Advantages:**
- No interference between regions
- Clean for market-level effects

**Disadvantages:**
- Fewer units (regions, not users)
- Geographic heterogeneity
- Longer experiment duration

### The Interference Problem

**Definition:** Treatment assignment of one unit affects outcomes of another unit

**Example: Social Network Experiment**
```
User A gets new feature → Shares more content
User B (friend of A) sees more content → Also engages more
```

**Problem:** User B's outcome is affected by User A's treatment, even though User B is in control

**Types of Interference:**

1. **Direct Interference**
   - User A's treatment directly affects User B
   - Example: Social features, marketplace dynamics

2. **Indirect Interference**
   - Treatment changes system-wide behavior
   - Example: Recommendation algorithm affects all users

3. **Spillover Effects**
   - Treatment effects leak across groups
   - Example: Word-of-mouth, network effects

### Handling Interference

**Solutions:**

1. **Cluster Randomization**
   - Randomize clusters (e.g., user groups, regions)
   - Analyze at cluster level
   - Reduces interference within clusters

2. **Restrict Treatment Scope**
   - Limit who sees treatment
   - Isolate treatment effects
   - Example: Test in one region only

3. **Account for Interference in Analysis**
   - Model interference explicitly
   - Use causal inference methods
   - Acknowledge limitations

4. **Design Experiments to Minimize Interference**
   - Choose appropriate unit of randomization
   - Isolate treatment groups
   - Monitor for spillover

---

## 2.3 Sample Size, Power, and MDE

### Statistical Power

**Definition:** Probability of detecting an effect when it truly exists

**Power = 1 - β (where β is Type II error rate)**

**Common Power Levels:**
- 80% power: Industry standard
- 90% power: High-stakes decisions
- 95% power: Critical experiments

**Why Power Matters:**
- Low power → High false negative rate
- Miss real effects
- Waste resources on underpowered tests

### Minimum Detectable Effect (MDE)

**Definition:** Smallest effect size we can detect with given power

**MDE Components:**
- Effect size (e.g., 5% increase in conversion)
- Statistical power (e.g., 80%)
- Significance level (e.g., α = 0.05)
- Baseline rate (e.g., 2% conversion rate)
- Sample size

**MDE Trade-offs:**
- Smaller MDE → Larger sample size needed
- Larger MDE → Can detect with smaller sample
- Choose MDE based on business significance

**Example:**
```
Baseline conversion: 2%
MDE: 10% relative increase (2% → 2.2%)
Power: 80%
α: 0.05
Required sample: ~50,000 per group
```

### Sample Size Calculation

**Factors Affecting Sample Size:**

1. **Effect Size**
   - Smaller effects require larger samples
   - Relative vs absolute matters

2. **Baseline Rate**
   - Lower baselines require larger samples
   - Binary outcomes (conversion) vs continuous (revenue)

3. **Statistical Power**
   - Higher power requires larger samples
   - 80% → 90% power roughly doubles sample size

4. **Significance Level**
   - Lower α (0.01 vs 0.05) requires larger samples
   - More stringent false positive control

5. **Variance**
   - Higher variance requires larger samples
   - Continuous metrics often need more data

**Sample Size Formula (Binary Outcome):**

For conversion rate (proportion):
```
n = 2 * (Z_α/2 + Z_β)² * p(1-p) / (MDE)²

Where:
- Z_α/2 = 1.96 (for α = 0.05)
- Z_β = 0.84 (for 80% power)
- p = baseline conversion rate
- MDE = minimum detectable effect (absolute)
```

**Example Calculation:**
```
Baseline: 2% (0.02)
MDE: 0.2% absolute (10% relative)
α = 0.05, Power = 80%

n = 2 * (1.96 + 0.84)² * 0.02 * 0.98 / (0.002)²
n = 2 * 7.84 * 0.0196 / 0.000004
n = 76,832 per group
```

**Sample Size Formula (Continuous Outcome):**

For revenue, engagement time, etc.:
```
n = 2 * (Z_α/2 + Z_β)² * σ² / (MDE)²

Where:
- σ = standard deviation
- MDE = minimum detectable effect (absolute)
```

### Practical Sample Size Considerations

**Real-World Constraints:**

1. **Traffic Volume**
   - Can we get enough users?
   - How long will experiment run?

2. **Business Timeline**
   - Need results in 1 week? → May need larger MDE
   - Can wait 4 weeks? → Can detect smaller effects

3. **Cost of Experiment**
   - More users = more infrastructure cost
   - Balance statistical needs with budget

4. **Multiple Metrics**
   - Need power for primary AND guardrail metrics
   - Use largest required sample size

**Sample Size Tools:**
- Online calculators (Evan Miller, Optimizely)
- R/Python packages (pwr, statsmodels)
- Built into experimentation platforms

---

## 2.4 Guardrails vs Success Metrics

### Success Metrics (Primary Outcomes)

**Definition:** Metrics we're optimizing for

**Characteristics:**
- Directly tied to business goals
- Statistical significance here drives decision
- Can be multiple (but prioritize)

**Examples:**
- Conversion rate
- Revenue per user
- Engagement time
- Retention rate

**Success Metric Design:**
1. **Clear Definition:** Exactly what we're measuring
2. **Business Alignment:** Tied to key outcomes
3. **Sensitivity:** Can detect meaningful changes
4. **Reliability:** Consistent measurement

### Guardrail Metrics (Safety Metrics)

**Definition:** Metrics we're protecting from degradation

**Characteristics:**
- Must not degrade significantly
- Can be more sensitive than success metrics
- Failure here blocks rollout (even if success metric positive)

**Examples:**
- Support ticket volume
- Error rates
- User complaints
- Revenue per transaction (if testing conversion)

**Guardrail Design:**
1. **Identify Risks:** What could go wrong?
2. **Define Thresholds:** How much degradation is acceptable?
3. **Set Sensitivity:** Often more sensitive than success metrics
4. **Monitor Continuously:** Real-time alerts

### The Decision Framework

**Rollout Decision Matrix:**

| Success Metric | Guardrail Metric | Decision |
|----------------|------------------|----------|
| ✅ Significant + Positive | ✅ No degradation | **Rollout** |
| ✅ Significant + Positive | ❌ Degraded | **Do Not Rollout** |
| ❌ Not significant | ✅ No degradation | **Iterate or Kill** |
| ❌ Not significant | ❌ Degraded | **Kill** |

**Key Principle:**
> Guardrails are non-negotiable. Success metrics drive optimization, but guardrails prevent harm.

### Guardrail Sensitivity

**Why Guardrails May Be More Sensitive:**

1. **Asymmetric Costs**
   - Cost of guardrail failure >> benefit of success
   - Example: User trust (guardrail) vs revenue (success)

2. **Early Warning**
   - Guardrails may detect problems before they show in success metrics
   - Example: Support tickets spike before churn

3. **Regulatory/Compliance**
   - Some guardrails are legal requirements
   - Zero tolerance for degradation

**Setting Guardrail Thresholds:**

**Conservative Approach:**
- Any degradation → Block rollout
- Highest sensitivity

**Practical Approach:**
- Small degradation acceptable if success metric very positive
- Requires business judgment

**Example: Pricing Experiment**
- **Success Metric:** Revenue (want increase)
- **Guardrail:** Customer satisfaction (must not decrease)
- **Guardrail:** Churn rate (must not increase)
- **Guardrail:** Support volume (must not increase)

---

## 2.5 Common A/B Testing Failure Modes

### Failure Mode 1: Underpowered Tests

**Problem:** Sample size too small to detect real effects

**Symptoms:**
- "No significant difference" but effect might exist
- High false negative rate
- Wasted experiments

**Prevention:**
- Calculate sample size upfront
- Use power analysis
- Don't stop early without justification

### Failure Mode 2: Multiple Testing Problem

**Problem:** Testing many metrics increases false positive rate

**Example:**
- Test 20 metrics at α = 0.05
- Expected false positives: 20 × 0.05 = 1
- High chance of spurious significance

**Solutions:**
1. **Bonferroni Correction:** Divide α by number of tests
2. **False Discovery Rate (FDR):** Control expected proportion of false positives
3. **Pre-specify Primary Metrics:** Only test what you planned
4. **Sequential Testing:** Account for multiple looks

### Failure Mode 3: Early Stopping

**Problem:** Stopping experiment when p-value becomes significant

**Why It's Wrong:**
- Increases false positive rate
- "Peeking" at data invalidates p-values
- Can stop on random noise

**Correct Approach:**
- Pre-specify sample size
- Use sequential testing methods if early stopping needed
- Fixed sample size or group sequential design

### Failure Mode 4: Selection Bias

**Problem:** Non-random assignment or analysis

**Examples:**
- Analyzing only users who completed experiment
- Different user segments in treatment vs control
- Time-based selection (analyzing only certain days)

**Prevention:**
- Intent-to-treat analysis (analyze all assigned users)
- Check balance on key covariates
- Monitor assignment quality

### Failure Mode 5: Interference

**Problem:** Treatment effects spill over to control group

**Examples:**
- Social features affect both groups
- Marketplace dynamics (supply/demand)
- Word-of-mouth effects

**Prevention:**
- Choose appropriate unit of randomization
- Isolate treatment groups
- Account for interference in analysis

### Failure Mode 6: Metric Definition Issues

**Problem:** Unclear or changing metric definitions

**Examples:**
- "Conversion" means different things in different analyses
- Metric calculation changes mid-experiment
- Denominator inconsistencies

**Prevention:**
- Document metric definitions upfront
- Version control for metric code
- Validate calculations

### Failure Mode 7: External Confounders

**Problem:** External events affect experiment

**Examples:**
- Holiday season
- Competitor launches
- Marketing campaigns
- System outages

**Prevention:**
- Monitor external factors
- Extend experiment if needed
- Account for in analysis (if possible)

### Failure Mode 8: Simpson's Paradox

**Problem:** Aggregated results differ from segment-level results

**Example:**
- Overall: Treatment better
- By segment: Control better in every segment
- Caused by different segment sizes

**Prevention:**
- Analyze by key segments
- Check for heterogeneity
- Don't rely solely on aggregate

---

## 2.6 Key Takeaways

**Randomization Fundamentals:**
- Randomization creates statistical equivalence
- Control group provides counterfactual
- Treatment design should isolate the change
- Choose appropriate unit of randomization

**Power & Sample Size:**
- Power = probability of detecting real effects
- MDE = smallest effect we can detect
- Sample size depends on effect size, power, baseline, variance
- Calculate upfront, don't guess

**Guardrails vs Success:**
- Success metrics drive optimization
- Guardrails prevent harm
- Guardrails can block rollout even if success metric positive
- Set sensitivity based on risk

**Common Failures:**
- Underpowered tests
- Multiple testing
- Early stopping
- Selection bias
- Interference
- Metric issues
- External confounders
- Simpson's paradox

---

## Lab 2: Design Production-Ready Experiments

**Objective:** Design three A/B tests with proper guardrails

**Requirements:**

Design experiments for:

1. **Conversion Funnel Change**
   - Example: Checkout page redesign
   - Define: Success metric, guardrails, sample size, duration

2. **Pricing Experiment**
   - Example: 10% price increase test
   - Define: Success metric, guardrails, sample size, MDE

3. **Personalization Logic**
   - Example: New recommendation algorithm
   - Define: Success metric, guardrails, unit of randomization, interference considerations

**For Each Experiment:**

1. **Hypothesis**
   - Clear statement of expected effect

2. **Success Metrics**
   - Primary outcome(s)
   - Definition and calculation

3. **Guardrail Metrics**
   - Safety metrics
   - Degradation thresholds

4. **Sample Size Calculation**
   - Baseline rates
   - MDE
   - Power and α
   - Required sample size
   - Expected duration

5. **Randomization Design**
   - Unit of randomization
   - Assignment mechanism
   - Interference considerations

6. **Analysis Plan**
   - Primary analysis method
   - Segment analysis
   - Decision criteria

**Deliverables:**
- Three experiment design documents (one page each)
- Sample size calculations with justification
- Guardrail thresholds with rationale

**Evaluation Criteria:**
- Proper sample size calculation (25%)
- Appropriate guardrail design (25%)
- Sound randomization strategy (25%)
- Complete analysis plan (25%)

**Time Estimate:** 4-5 hours

---

## Additional Resources

**Readings:**
- "Trustworthy Online Controlled Experiments" - Kohavi, Tang, Xu
- "Statistical Methods in Online A/B Testing" - Georgiev
- "Experimentation Works" - Stefan Thomke
- "The Art of A/B Testing" - CXL Institute

**Videos:**
- "A/B Testing at Scale" - Ronny Kohavi (Microsoft)
- "Statistical Power and Sample Size" - Khan Academy
- "Common A/B Testing Mistakes" - Industry talks

**Tools:**
- Sample size calculators (Evan Miller, Optimizely)
- R: `pwr` package
- Python: `statsmodels.stats.power`
- Experimentation platforms (Optimizely, VWO, LaunchDarkly)

**Next Module Preview:**
Module 3 will cover experimentation platforms, feature flags, concurrent experiments, and organizational operating models for scaling experiments safely.

---

**Module 2 Complete**  
**Next:** Module 3 - Experimentation Platforms & Operating Models
