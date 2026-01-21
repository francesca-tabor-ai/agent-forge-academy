---
title: "Module 4: Causal Inference Beyond A/B Tests"
description: "Learn quasi-experimental methods when randomization isn't possible: Difference-in-Differences, synthetic control, matching, and more"
module: "4"
order: 4
email_takeaway: "When you can't randomize, quasi-experimental methods like DiD and synthetic control can still provide causal estimates—with clear assumptions."
email_action: "Apply Difference-in-Differences or matching to a real policy or feature change, clearly stating your assumptions."
---

# Module 4: Causal Inference Beyond A/B Tests

**Duration:** Week 4  
**Theme:** *When you can't randomize*

**Learning Objectives:**
- **why real-world experiments break Understanding**: Understand why real-world experiments break
- **Difference-in-Differences Understanding**: Master Difference-in-Differences (DiD) methodology
- **synthetic control methods Understanding**: Learn synthetic control methods
- **Apply Matching**: Apply matching and reweighting techniques
- **Recognize Assumptions**: Recognize assumptions and failure modes
- **Choose The**: Choose the least wrong method for each situation

---

## 4.1 Why Real-World Experiments Break

### When Randomization Fails

**Common Scenarios Where A/B Tests Aren't Possible:**

1. **Policy Changes**
   - Company-wide policy implementation
   - Regulatory changes
   - Market-wide interventions
   - Cannot randomize at individual level

2. **Geographic Rollouts**
   - Staged regional launches
   - Market-specific changes
   - Supply-side experiments
   - Natural variation, not randomization

3. **Time-Based Changes**
   - Before/after comparisons
   - Historical policy changes
   - One-time events
   - No control group available

4. **Ethical Constraints**
   - Medical interventions
   - Educational programs
   - Social services
   - Cannot withhold treatment

5. **Technical Constraints**
   - Infrastructure limitations
   - System-wide changes
   - Network effects
   - Cannot isolate treatment

### The Fundamental Problem

**Without Randomization:**
- Treatment and control groups may differ systematically
- Confounding variables can bias results
- Cannot assume statistical equivalence
- Need alternative methods

**Solution: Quasi-Experimental Methods**
- Use natural variation
- Construct control groups
- Make explicit assumptions
- Validate assumptions when possible

---

## 4.2 Difference-in-Differences (DiD)

### The DiD Intuition

**Core Idea:** Compare changes over time between treatment and control groups

**Setup:**
- Treatment group: Gets intervention
- Control group: Doesn't get intervention
- Before period: Pre-intervention
- After period: Post-intervention

**DiD Estimate:**
```
DiD = (Treatment_After - Treatment_Before) - (Control_After - Control_Before)
```

**Why This Works:**
- Removes time-invariant differences between groups
- Removes common time trends
- Isolates treatment effect

### DiD Example: Minimum Wage Increase

**Scenario:**
- State A increases minimum wage (treatment)
- State B doesn't (control)
- Measure employment before and after

**Data:**
```
                Before    After    Change
State A (T)     100       95       -5
State B (C)      100       98       -2
```

**DiD Calculation:**
```
Treatment change: -5
Control change: -2
DiD = -5 - (-2) = -3
```

**Interpretation:** Minimum wage increase reduced employment by 3 units relative to control

### DiD Assumptions

**1. Parallel Trends Assumption**

**Critical Assumption:** Treatment and control groups would have followed parallel trends in the absence of treatment

**Visual Check:**
```
Outcome
  ↑
  |     Treatment
  |    /-------
  |   /
  |  /  Control
  | /  /-------
  |/  /
  +--+--+--+--+-- Time
     Pre  Post
```

**If trends diverge pre-treatment → Assumption violated**

**Validation:**
- Check pre-treatment trends
- Multiple pre-periods help
- Placebo tests (fake treatment dates)

**2. No Anticipation Effects**

**Assumption:** Treatment group doesn't change behavior before treatment

**Example Problem:**
- Policy announced 3 months before implementation
- People adjust behavior early
- Pre-treatment period contaminated

**Solution:**
- Use announcement date, not implementation date
- Or exclude anticipation period

**3. Stable Unit Treatment Value Assumption (SUTVA)**

**Assumption:** No spillover effects between groups

**Example Problem:**
- Treatment in State A affects State B (migration, competition)
- Control group contaminated

**Solution:**
- Choose isolated control groups
- Account for spillover if possible

**4. Composition Stability**

**Assumption:** Groups don't change composition over time

**Example Problem:**
- Treatment causes migration
- Group composition changes
- Biases results

**Solution:**
- Use fixed sample (intent-to-treat)
- Or account for composition changes

### DiD Implementation

**Basic DiD Regression:**

```python
import pandas as pd
import statsmodels.api as sm

# Create DiD variables
df['post'] = (df['period'] == 'after').astype(int)
df['treated'] = (df['group'] == 'treatment').astype(int)
df['did'] = df['post'] * df['treated']

# DiD regression
X = df[['post', 'treated', 'did']]
y = df['outcome']

model = sm.OLS(y, sm.add_constant(X)).fit()
print(model.summary())

# DiD coefficient is the interaction term
```

**Interpretation:**
- `did` coefficient = DiD estimate
- Standard errors need clustering (by group, or group-time)

**Advanced: Two-Way Fixed Effects**

```python
# More robust specification
import linearmodels.panel as lp

model = lp.PanelOLS(
    df.set_index(['group', 'time']),
    entity_effects=True,  # Group fixed effects
    time_effects=True,     # Time fixed effects
    dependent='outcome'
)
```

### DiD Failure Modes

**1. Violated Parallel Trends**
- Pre-treatment trends differ
- DiD estimate biased
- Solution: Find better control, or use alternative method

**2. Anticipation Effects**
- Behavior changes before treatment
- Contaminates pre-period
- Solution: Adjust treatment date, or exclude anticipation

**3. Spillover Effects**
- Treatment affects control
- Violates SUTVA
- Solution: Isolated controls, or account for spillover

**4. Composition Changes**
- Groups change over time
- Selection bias
- Solution: Fixed sample, or account for changes

---

## 4.3 Synthetic Control

### The Synthetic Control Intuition

**Core Idea:** Construct a "synthetic" control group as weighted combination of untreated units

**When to Use:**
- Single treated unit (e.g., one state, one company)
- Many potential control units
- Pre-treatment data available

**Advantage:** More flexible than simple control group

### Synthetic Control Example: California Smoking Law

**Scenario:**
- California implements smoking ban (1989)
- Want to estimate effect on cigarette sales
- Other states as potential controls

**Approach:**
1. Find weights for control states
2. Create synthetic California = weighted average of controls
3. Match pre-treatment trends
4. Compare post-treatment: Real vs Synthetic

**Result:**
```
Cigarette Sales
  ↑
  |  Real California
  |  /-------
  | /
  |/  Synthetic California
  |  /-------
  | /
  +--+--+--+--+-- Time
     1989
```

**Treatment Effect:** Difference between real and synthetic after 1989

### Synthetic Control Algorithm

**Step 1: Choose Donor Pool**
- Units that didn't receive treatment
- Similar characteristics to treated unit
- Sufficient pre-treatment data

**Step 2: Find Weights**
- Minimize pre-treatment prediction error
- Weights sum to 1
- Non-negative weights (optional)

**Mathematical Formulation:**
```
Minimize: ||Y_treated_pre - W * Y_controls_pre||²
Subject to: Σw_i = 1, w_i ≥ 0
```

**Step 3: Construct Synthetic Control**
```
Y_synthetic = W * Y_controls
```

**Step 4: Estimate Treatment Effect**
```
Effect = Y_treated_post - Y_synthetic_post
```

### Synthetic Control Implementation

**Python Example:**

```python
from synth import synth

# Prepare data
# treated_unit: name of treated unit
# control_units: list of control unit names
# predictors: variables to match on
# time_variable: time column
# dependent: outcome variable

result = synth(
    data=df,
    treated_unit="California",
    control_units=["Nevada", "Arizona", "Oregon", ...],
    predictors=["cigarette_sales", "population", "income"],
    time_variable="year",
    dependent="cigarette_sales",
    pre_period=(1970, 1988),
    post_period=(1989, 2000)
)

# Extract results
treatment_effect = result['effect']
weights = result['weights']
```

### Synthetic Control Assumptions

**1. No Anticipation**
- Treated unit doesn't change before treatment
- Similar to DiD

**2. Stable Relationship**
- Weights valid post-treatment
- Pre-treatment relationship continues (without treatment)

**3. No Spillover**
- Treatment doesn't affect control units
- Similar to DiD

**4. Sufficient Pre-Period Data**
- Need enough data to estimate weights
- Typically 10+ pre-periods

### Synthetic Control vs DiD

**Synthetic Control Advantages:**
- Works with single treated unit
- More flexible matching
- Can handle multiple treated units (generalized)

**DiD Advantages:**
- Simpler implementation
- Easier to interpret
- Standard errors straightforward

**When to Choose:**
- Single treated unit → Synthetic Control
- Multiple treated units, simple setup → DiD
- Complex matching needed → Synthetic Control

---

## 4.4 Matching & Reweighting

### Matching: The Intuition

**Core Idea:** Find control units similar to treated units on observables

**Goal:** Create treatment and control groups that are similar on all observed characteristics

**Example:**
- Treated: Users who got promotion
- Control: Users who didn't
- Problem: Users who got promotion might be different (selection bias)

**Solution:** Match each treated user to similar control user(s)

### Propensity Score Matching

**Step 1: Estimate Propensity Score**
- Probability of receiving treatment given observables
- Use logistic regression

```python
from sklearn.linear_model import LogisticRegression

# Estimate propensity scores
X = df[['age', 'income', 'past_purchases', ...]]
y = df['treated']

model = LogisticRegression()
model.fit(X, y)
df['propensity_score'] = model.predict_proba(X)[:, 1]
```

**Step 2: Match on Propensity Score**
- For each treated unit, find control unit(s) with similar propensity score

**Matching Methods:**

1. **Nearest Neighbor**
   - Match to closest control unit
   - With or without replacement

2. **Caliper Matching**
   - Match within caliper (e.g., 0.1)
   - Discard if no match within caliper

3. **Stratification**
   - Divide into propensity score strata
   - Compare within strata

4. **Kernel Matching**
   - Weight all controls by distance
   - Closer controls get higher weight

**Step 3: Estimate Treatment Effect**
- Compare outcomes between matched groups

```python
# Nearest neighbor matching
from sklearn.neighbors import NearestNeighbors

treated = df[df['treated'] == 1]
control = df[df['treated'] == 0]

# Match on propensity score
nn = NearestNeighbors(n_neighbors=1)
nn.fit(control[['propensity_score']])
distances, indices = nn.kneighbors(treated[['propensity_score']])

# Calculate treatment effect
matched_control_outcomes = control.iloc[indices.flatten()]['outcome']
treatment_effect = treated['outcome'].mean() - matched_control_outcomes.mean()
```

### Reweighting: Inverse Probability Weighting (IPW)

**Core Idea:** Weight observations by inverse of probability of their observed treatment

**Intuition:**
- Underrepresented groups get higher weight
- Creates balance between treatment and control

**Weights:**
```
For treated: w = 1 / P(treatment | X)
For control: w = 1 / P(control | X) = 1 / (1 - P(treatment | X))
```

**Treatment Effect:**
```
Effect = E[Y | T=1, weighted] - E[Y | T=0, weighted]
```

**Implementation:**

```python
# Calculate IPW weights
df['weight'] = np.where(
    df['treated'] == 1,
    1 / df['propensity_score'],
    1 / (1 - df['propensity_score'])
)

# Weighted average
treated_outcome = (df[df['treated'] == 1]['outcome'] * 
                   df[df['treated'] == 1]['weight']).sum() / \
                  df[df['treated'] == 1]['weight'].sum()

control_outcome = (df[df['treated'] == 0]['outcome'] * 
                   df[df['treated'] == 0]['weight']).sum() / \
                  df[df['treated'] == 0]['weight'].sum()

treatment_effect = treated_outcome - control_outcome
```

### Matching Assumptions

**1. Conditional Independence (Unconfoundedness)**
- Given observables, treatment assignment is random
- All confounders are observed
- Strong assumption!

**2. Overlap/Common Support**
- For all X, 0 < P(T=1 | X) < 1
- Every treated unit has potential control match
- Check propensity score distributions

**3. Stable Unit Treatment Value (SUTVA)**
- No spillover effects
- Same as DiD

**Validation:**
- Check balance after matching (covariates should be similar)
- Sensitivity analysis (how robust to unobserved confounders?)

---

## 4.5 Choosing the Least Wrong Method

### Decision Framework

**Question 1: Can we randomize?**
- ✅ Yes → A/B test (gold standard)
- ❌ No → Continue

**Question 2: Do we have a control group?**
- ✅ Yes → Continue
- ❌ No → Need to construct one

**Question 3: How many treated units?**
- Single unit → Synthetic Control
- Multiple units → DiD or Matching

**Question 4: Is there natural variation?**
- Time variation → DiD
- Cross-sectional variation → Matching
- Both → Can combine

**Question 5: Can we observe confounders?**
- ✅ Yes → Matching possible
- ❌ No → DiD (relies on parallel trends)

### Method Comparison

| Method | When to Use | Key Assumption | Pros | Cons |
|--------|-------------|----------------|------|------|
| **A/B Test** | Can randomize | Randomization | Gold standard, clean | Not always possible |
| **DiD** | Before/after, control group | Parallel trends | Simple, intuitive | Needs parallel trends |
| **Synthetic Control** | Single treated unit | Stable relationship | Flexible, single unit | Complex, data needs |
| **Matching** | Observables available | Unconfoundedness | Handles selection | Strong assumption |
| **IPW** | Observables available | Unconfoundedness | Uses all data | Sensitive to model |

### Hybrid Approaches

**DiD + Matching:**
- Match first to improve balance
- Then apply DiD
- Reduces bias from initial differences

**Synthetic DiD:**
- Multiple treated units
- Synthetic control for each
- Average effects

**Event Studies:**
- Extension of DiD
- Multiple time periods
- Dynamic effects

---

## 4.6 Key Takeaways

**When Experiments Break:**
- Policy changes, geographic rollouts, ethical constraints
- Need quasi-experimental methods
- Make assumptions explicit

**Difference-in-Differences:**
- Compare changes over time
- Key assumption: Parallel trends
- Validate with pre-treatment data

**Synthetic Control:**
- Construct weighted control
- Works with single treated unit
- More flexible than simple control

**Matching & Reweighting:**
- Balance on observables
- Key assumption: Unconfoundedness
- Validate balance after matching

**Choosing Methods:**
- A/B test when possible (gold standard)
- DiD for time-based variation
- Synthetic control for single unit
- Matching when observables available
- Often combine methods

---

## Lab 4: Apply Causal Inference to Real Change

**Objective:** Apply DiD or matching to a real policy or feature change

**Requirements:**

Choose one scenario:

1. **Policy Change (DiD)**
   - Company-wide policy implementation
   - Staged geographic rollout
   - Before/after comparison

2. **Feature Change (Matching)**
   - Non-randomized feature launch
   - Users selected based on criteria
   - Need to control for selection

**For Your Scenario:**

1. **Problem Setup**
   - Describe the intervention
   - Why randomization wasn't possible
   - Available data

2. **Method Selection**
   - Choose DiD or Matching
   - Justify your choice
   - Alternative methods considered

3. **Implementation**
   - Apply the method
   - Show code/analysis
   - Present results

4. **Assumption Validation**
   - State key assumptions
   - Validate when possible
   - Discuss limitations

5. **Sensitivity Analysis**
   - Test robustness
   - Alternative specifications
   - How sensitive to assumptions?

**Deliverables:**
- Analysis document (3-5 pages)
- Code/analysis files
- Results with interpretation
- Assumption validation
- Sensitivity analysis

**Evaluation Criteria:**
- Appropriate method selection (25%)
- Correct implementation (30%)
- Assumption validation (25%)
- Sensitivity analysis (20%)

**Time Estimate:** 6-8 hours

---

## Additional Resources

**Readings:**
- "Causal Inference: The Mixtape" - Scott Cunningham
- "Mostly Harmless Econometrics" - Angrist & Pischke
- "The Book of Why" - Judea Pearl
- "Synthetic Control Methods" - Abadie et al.

**Videos:**
- "Introduction to Causal Inference" - Harvard Data Science
- "Difference-in-Differences" - MIT OpenCourseWare
- "Synthetic Control Method" - Academic talks

**Tools:**
- R: `synth`, `MatchIt`, `did` packages
- Python: `causal inference`, `econml`, `synthetic_control`
- Stata: `synth`, `teffects`

**Next Module Preview:**
Module 5 will cover interpreting noisy and ambiguous results—statistical vs practical significance, confidence intervals, heterogeneous effects, and making decisions under uncertainty.

---

**Module 4 Complete**  
**Next:** Module 5 - Interpreting Noisy & Ambiguous Results
