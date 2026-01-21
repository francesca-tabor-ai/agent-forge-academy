---
title: "Module 5: Attribution & Incrementality"
description: "Credit vs causality"
module: "5"
order: 5
---

# Module 5: Attribution & Incrementality

**Duration:** Week 5  
**Theme:** *Credit vs causality*

**Learning Objectives:**
- **rules-based vs data-driven attribution Understanding**: Understand rules-based vs data-driven attribution
- **incrementality and causal lift concepts Understanding**: Learn incrementality and causal lift concepts
- **A/B testing Analysis**: Compare A/B testing vs observational attribution
- **Identify Common**: Identify common attribution failure modes
- **Align Attribution**: Align attribution with business goals
- **attribution and incrementality models Development**: Build attribution and incrementality models

---

## 5.1 Rules-Based vs Data-Driven Attribution

### What is Attribution?

**Definition:** The process of assigning credit for a conversion to one or more marketing touchpoints in a customer's journey.

**Key Question:** "Which marketing touchpoint(s) should get credit for this sale?"

#### Rules-Based Attribution

**Definition:** Attribution based on predefined rules, not data-driven analysis.

**Common Models:**

1. **Last-Touch Attribution**
   - **Rule:** 100% credit to last touchpoint
   - **Example:** User sees ad → clicks email → converts
   - **Credit:** Email gets 100%
   - **Pros:** Simple, easy to implement
   - **Cons:** Ignores earlier touchpoints, undervalues awareness

2. **First-Touch Attribution**
   - **Rule:** 100% credit to first touchpoint
   - **Example:** User sees ad → clicks email → converts
   - **Credit:** Ad gets 100%
   - **Pros:** Values acquisition, simple
   - **Cons:** Ignores nurturing, undervalues conversion touchpoints

3. **Linear Attribution**
   - **Rule:** Equal credit to all touchpoints
   - **Example:** 3 touchpoints → each gets 33.3%
   - **Pros:** Recognizes all touchpoints
   - **Cons:** Assumes all touchpoints equal (unrealistic)

4. **Time-Decay Attribution**
   - **Rule:** More credit to touchpoints closer to conversion
   - **Example:** Last touchpoint: 50%, previous: 30%, first: 20%
   - **Pros:** Values recency
   - **Cons:** Arbitrary decay rates

5. **Position-Based Attribution (U-Shaped)**
   - **Rule:** 40% first, 40% last, 20% middle
   - **Pros:** Values both acquisition and conversion
   - **Cons:** Arbitrary weights

**Implementation:**

```python
def last_touch_attribution(customer_journey):
    """Last-touch attribution"""
    return customer_journey.iloc[-1]['touchpoint']

def first_touch_attribution(customer_journey):
    """First-touch attribution"""
    return customer_journey.iloc[0]['touchpoint']

def linear_attribution(customer_journey):
    """Linear attribution"""
    touchpoints = customer_journey['touchpoint'].tolist()
    credit_per_touchpoint = 1.0 / len(touchpoints)
    return {tp: credit_per_touchpoint for tp in touchpoints}

def time_decay_attribution(customer_journey, decay_rate=0.5):
    """Time-decay attribution"""
    touchpoints = customer_journey['touchpoint'].tolist()
    timestamps = customer_journey['timestamp'].tolist()
    
    # Calculate weights (more recent = higher weight)
    weights = []
    for i in range(len(touchpoints)):
        time_from_conversion = (timestamps[-1] - timestamps[i]).total_seconds()
        weight = decay_rate ** (time_from_conversion / (24 * 3600))  # Decay per day
        weights.append(weight)
    
    # Normalize weights
    total_weight = sum(weights)
    credits = {tp: w / total_weight for tp, w in zip(touchpoints, weights)}
    
    return credits
```

#### Data-Driven Attribution

**Definition:** Attribution based on statistical analysis of actual customer behavior data.

**Methods:**

1. **Markov Chain Attribution**
   - Models customer journey as state transitions
   - Calculates removal effect (what happens if channel removed)
   - Credit based on actual impact

2. **Shapley Value Attribution**
   - Game theory approach
   - Calculates marginal contribution of each touchpoint
   - Fairly distributes credit

3. **Machine Learning Attribution**
   - Train model to predict conversion
   - Use feature importance for attribution
   - Can handle complex interactions

**Why Data-Driven is Better:**
- Based on actual data, not assumptions
- Accounts for channel interactions
- Reflects true customer behavior
- Adapts to changing patterns

---

## 5.2 Incrementality and Causal Lift

### What is Incrementality?

**Definition:** The additional conversions (or value) that occur because of a marketing activity, above what would have happened anyway.

**Key Insight:** Attribution asks "who gets credit?" Incrementality asks "did this actually cause the conversion?"

#### The Incrementality Question

**Example:**
- User was going to buy anyway (saw product, researched, decided)
- User sees retargeting ad
- User converts

**Attribution says:** Retargeting ad gets credit  
**Incrementality says:** Ad may have had zero impact (user was converting anyway)

#### Measuring Incrementality

**Gold Standard: Randomized Controlled Trials (RCTs)**

```python
def measure_incrementality_rct(experiment_data):
    """Measure incrementality using RCT"""
    # Split users into treatment and control
    treatment = experiment_data[experiment_data['group'] == 'treatment']
    control = experiment_data[experiment_data['group'] == 'control']
    
    # Calculate conversion rates
    treatment_conv_rate = treatment['converted'].mean()
    control_conv_rate = control['converted'].mean()
    
    # Calculate incrementality
    incrementality_lift = treatment_conv_rate - control_conv_rate
    incrementality_pct = (incrementality_lift / control_conv_rate) * 100
    
    # Statistical significance
    from scipy.stats import chi2_contingency
    contingency_table = pd.crosstab(
        experiment_data['group'],
        experiment_data['converted']
    )
    chi2, p_value, dof, expected = chi2_contingency(contingency_table)
    
    return {
        'incrementality_lift': incrementality_lift,
        'incrementality_pct': incrementality_pct,
        'treatment_conv_rate': treatment_conv_rate,
        'control_conv_rate': control_conv_rate,
        'p_value': p_value,
        'statistically_significant': p_value < 0.05
    }
```

**Alternative: Geo-Based Experiments**

```python
def measure_incrementality_geo(geo_data):
    """Measure incrementality using geo-based experiment"""
    # Treatment geos: Show ads
    # Control geos: Don't show ads
    
    treatment_geos = geo_data[geo_data['treatment'] == True]
    control_geos = geo_data[geo_data['treatment'] == False]
    
    # Calculate metrics
    treatment_conv = treatment_geos['conversions'].sum() / treatment_geos['users'].sum()
    control_conv = control_geos['conversions'].sum() / control_geos['users'].sum()
    
    incrementality = treatment_conv - control_conv
    
    return {
        'incrementality': incrementality,
        'incrementality_pct': (incrementality / control_conv) * 100,
        'treatment_conv_rate': treatment_conv,
        'control_conv_rate': control_conv
    }
```

**Alternative: Synthetic Control Methods**

```python
def measure_incrementality_synthetic_control(geo_data, treatment_start_date):
    """Measure incrementality using synthetic control"""
    # Build synthetic control (weighted combination of control geos)
    # that matches treatment geo before treatment
    
    pre_treatment = geo_data[geo_data['date'] < treatment_start_date]
    post_treatment = geo_data[geo_data['date'] >= treatment_start_date]
    
    # Build synthetic control
    from sklearn.linear_model import LinearRegression
    
    treatment_geo = pre_treatment[pre_treatment['geo'] == 'treatment_geo']
    control_geos = pre_treatment[pre_treatment['geo'] != 'treatment_geo']
    
    # Fit model to predict treatment geo from control geos
    X = control_geos.pivot_table(
        index='date',
        columns='geo',
        values='conversions'
    )
    y = treatment_geo['conversions']
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Predict what would have happened (counterfactual)
    post_control = post_treatment[post_treatment['geo'] != 'treatment_geo']
    X_post = post_control.pivot_table(
        index='date',
        columns='geo',
        values='conversions'
    )
    counterfactual = model.predict(X_post)
    
    # Calculate incrementality
    actual = post_treatment[post_treatment['geo'] == 'treatment_geo']['conversions']
    incrementality = actual.values - counterfactual
    
    return {
        'incrementality': incrementality.sum(),
        'incrementality_per_period': incrementality,
        'counterfactual': counterfactual,
        'actual': actual.values
    }
```

---

## 5.3 A/B Testing vs Observational Attribution

### When to Use Each

#### A/B Testing: The Gold Standard

**Best For:**
- **Measuring Incrementality**: Implement measuring incrementality effectively across relevant use cases
- **Causal Inference**: Implement causal inference effectively across relevant use cases
- **Testing Specific**: Apply testing specific hypotheses in relevant contexts
- **New Channels**: New channels or campaigns

**Limitations:**
- **Requires Experimentation**: Apply requires experimentation capability in relevant contexts
- **Takes Time**: Apply takes time (weeks/months) in relevant contexts
- **Can'T Test**: Apply can't test everything in relevant contexts
- **May Miss**: May miss long-term effects

**Example:**

```python
def ab_test_incrementality(campaign_data):
    """Run A/B test to measure incrementality"""
    # Randomly assign users to treatment/control
    treatment = campaign_data[campaign_data['group'] == 'treatment']
    control = campaign_data[campaign_data['group'] == 'control']
    
    # Measure outcomes
    treatment_conv = treatment['converted'].mean()
    control_conv = control['converted'].mean()
    
    # Calculate lift
    lift = treatment_conv - control_conv
    lift_pct = (lift / control_conv) * 100
    
    # Statistical test
    from scipy.stats import ttest_ind
    t_stat, p_value = ttest_ind(
        treatment['converted'],
        control['converted']
    )
    
    return {
        'lift': lift,
        'lift_pct': lift_pct,
        'p_value': p_value,
        'statistically_significant': p_value < 0.05
    }
```

#### Observational Attribution: Faster, But Limited

**Best For:**
- **Quick Insights**: Implement quick insights effectively across relevant use cases
- **Historical Analysis**: Implement historical analysis effectively across relevant use cases
- **When Experiments**: When experiments aren't feasible
- **Understanding Customer**: Apply understanding customer journeys in relevant contexts

**Limitations:**
- **Correlation, Not**: Apply correlation, not causation in relevant contexts
- **Can Be**: Apply can be biased in relevant contexts
- **Doesn'T Measure**: Apply doesn't measure incrementality in relevant contexts
- **May Mislead**: Apply may mislead decisions in relevant contexts

**Example: Markov Chain Attribution**

```python
def markov_chain_attribution(customer_journeys):
    """Markov chain attribution model"""
    # Build transition matrix
    transitions = {}
    
    for journey in customer_journeys:
        touchpoints = journey['touchpoint'].tolist()
        for i in range(len(touchpoints) - 1):
            from_state = touchpoints[i]
            to_state = touchpoints[i + 1]
            
            if from_state not in transitions:
                transitions[from_state] = {}
            if to_state not in transitions[from_state]:
                transitions[from_state][to_state] = 0
            
            transitions[from_state][to_state] += 1
    
    # Convert to probabilities
    transition_matrix = {}
    for from_state, to_states in transitions.items():
        total = sum(to_states.values())
        transition_matrix[from_state] = {
            to_state: count / total
            for to_state, count in to_states.items()
        }
    
    # Calculate removal effect (what happens if channel removed)
    removal_effects = {}
    for channel in set([tp for journey in customer_journeys for tp in journey['touchpoint']]):
        # Calculate conversion probability with channel
        conv_with = calculate_conversion_probability(
            transition_matrix,
            include_channel=channel
        )
        
        # Calculate conversion probability without channel
        conv_without = calculate_conversion_probability(
            transition_matrix,
            exclude_channel=channel
        )
        
        removal_effects[channel] = conv_with - conv_without
    
    # Normalize to get attribution
    total_effect = sum(removal_effects.values())
    attribution = {
        channel: effect / total_effect
        for channel, effect in removal_effects.items()
    }
    
    return attribution
```

---

## 5.4 Common Attribution Failure Modes

### Failure Mode 1: Last-Touch Bias

**Problem:** Over-crediting conversion touchpoints, under-crediting awareness.

**Example:**
- User sees brand ad (awareness)
- User researches product (consideration)
- User sees retargeting ad (conversion)
- **Last-touch says:** Retargeting caused conversion
- **Reality:** Brand ad started the journey

**Solution:** Use multi-touch attribution or incrementality testing.

### Failure Mode 2: Correlation vs Causation

**Problem:** Attributing credit based on correlation, not causation.

**Example:**
- High-value customers see premium ads
- High-value customers convert
- **Attribution says:** Premium ads cause high-value conversions
- **Reality:** Premium ads target high-value customers (selection bias)

**Solution:** Use incrementality testing to establish causation.

### Failure Mode 3: Ignoring Interactions

**Problem:** Treating channels independently, missing synergies.

**Example:**
- TV ad + Search ad together: 10% conversion
- TV ad alone: 3% conversion
- Search ad alone: 2% conversion
- **Simple attribution:** TV: 3%, Search: 2%, Other: 5%
- **Reality:** TV + Search have synergy (interaction effect)

**Solution:** Use models that account for interactions.

### Failure Mode 4: Time Window Issues

**Problem:** Attribution windows too short or too long.

**Example:**
- User sees ad on Monday
- User converts on Friday
- **7-day window:** Ad gets credit
- **1-day window:** Ad doesn't get credit
- **30-day window:** Ad gets credit, but may include other factors

**Solution:** Use data-driven methods to determine optimal windows.

### Failure Mode 5: View-Through Attribution

**Problem:** Crediting conversions to ads users saw but didn't click.

**Example:**
- User sees display ad (no click)
- User later converts
- **View-through attribution:** Display ad gets credit
- **Reality:** User may have converted anyway (no incrementality)

**Solution:** Measure view-through incrementality, not just correlation.

---

## 5.5 Aligning Attribution with Business Goals

### Different Goals Require Different Attribution

**Goal 1: Optimize for Acquisition**

**Attribution:** First-touch or early-touch weighted
**Focus:** Channels that bring new users
**Metrics:** New user acquisition, cost per acquisition

**Goal 2: Optimize for Conversion**

**Attribution:** Last-touch or late-touch weighted
**Focus:** Channels that close deals
**Metrics:** Conversion rate, cost per conversion

**Goal 3: Optimize for Revenue**

**Attribution:** Revenue-weighted multi-touch
**Focus:** Channels that drive high-value conversions
**Metrics:** Revenue per user, LTV

**Goal 4: Optimize for Efficiency**

**Attribution:** Incrementality-based
**Focus:** Channels with highest incremental ROI
**Metrics:** Incremental ROI, efficiency

### Building Goal-Aligned Attribution

```python
def goal_aligned_attribution(customer_journeys, business_goal='revenue'):
    """Build attribution aligned with business goal"""
    if business_goal == 'acquisition':
        # Weight early touchpoints
        return first_touch_weighted_attribution(customer_journeys)
    
    elif business_goal == 'conversion':
        # Weight late touchpoints
        return last_touch_weighted_attribution(customer_journeys)
    
    elif business_goal == 'revenue':
        # Weight by revenue contribution
        return revenue_weighted_attribution(customer_journeys)
    
    elif business_goal == 'efficiency':
        # Use incrementality
        return incrementality_based_attribution(customer_journeys)
    
    else:
        # Default: Data-driven multi-touch
        return markov_chain_attribution(customer_journeys)
```

---

## Lab 5: Attribution and Incrementality

### Objective
Compare attribution and incrementality results for the same channel.

### Dataset
You'll be provided with:
- Customer journey data (touchpoints, timestamps)
- Conversion data
- A/B test data for incrementality measurement
- Channel spend data

### Tasks

1. **Attribution Analysis**
   - Implement multiple attribution models (last-touch, first-touch, linear, Markov)
   - Calculate channel credit using each model
   - Compare results across models

2. **Incrementality Analysis**
   - Analyze A/B test data
   - Calculate incrementality lift
   - Measure statistical significance

3. **Comparison**
   - Compare attribution vs incrementality results
   - Identify discrepancies
   - Understand why they differ

4. **Failure Mode Analysis**
   - Identify common failure modes in your data
   - Quantify impact of each failure mode
   - Recommend fixes

5. **Business Application**
   - Align attribution with business goals
   - Make budget allocation recommendations
   - Quantify impact of using incrementality vs attribution

### Deliverables

1. **Attribution & Incrementality Report**
   - Attribution model comparisons
   - Incrementality analysis
   - Comparison and discrepancies
   - Failure mode analysis
   - Business recommendations

2. **Code Repository**
   - Attribution model implementations
   - Incrementality analysis code
   - Comparison scripts
   - Clean, documented code

### Evaluation Criteria

- **Methodology (40%):** Correct implementation, proper statistical methods
- **Analysis Quality (30%):** Meaningful insights, correct calculations
- **Code Quality (20%):** Clean, reusable, well-documented
- **Business Application (10%):** Actionable recommendations

### Expected Output

A defensible channel impact assessment that:
- Compares attribution and incrementality results
- Identifies discrepancies and explains them
- Quantifies impact of using wrong method
- Provides specific recommendations
- Clearly states limitations

---

## Summary

**Key Takeaways:**

- **Attribution ≠ Incrementality:**: Attribution gives credit, incrementality measures causality
- **Data-Driven > Rules-Based:**: Use actual data, not assumptions
- **A/B Testing is Gold Standard:**: For incrementality, use experiments
- **Watch for Failure Modes:**: Last-touch bias, correlation/causation, interactions
- **Align with Goals:**: Different goals require different attribution

**Next Steps:**
- **Module 6:**: Module 6: Learn pricing and promotion optimization
- **price elasticity and demand curves Understanding**: Understand price elasticity and demand curves
- **pricing experiments Development**: Apply design pricing experiments in relevant contexts

---

## Additional Resources

### Reading
- "Attribution" by Google Analytics Academy
- "Incrementality Testing" by Facebook Business
- "Causal Inference" by Judea Pearl

### Tools
- Python: pandas, scipy, scikit-learn
- Attribution: Google Analytics, Adobe Analytics
- Incrementality: Geo experiments, holdout tests

---

**Ready for Module 6? [Continue →](Module_06_Pricing_and_Promotion_Optimization.md)**
