---
title: "Module 6: Uplift Modeling & Targeted Decisions"
description: "Learn who should get the treatment: uplift modeling, incrementality, and targeted rollout strategies"
module: "6"
order: 6
email_takeaway: "Uplift modeling identifies who will respond to treatment, enabling targeted decisions that maximize incremental impact."
email_action: "Design an uplift-based decision strategy for retention offers, promotions, or messaging campaigns."
---

# Module 6: Uplift Modeling & Targeted Decisions

**Duration:** Week 6  
**Theme:** *Who should get the treatment?*

**Learning Objectives:**
- **propensity vs uplift modeling Understanding**: Understand propensity vs uplift modeling
- **incrementality from prediction Analysis**: Distinguish incrementality from prediction
- **Recognize When**: Recognize when uplift beats personalization rules
- **Identify Risks**: Identify risks of misusing uplift models
- **uplift models properly Evaluation**: Evaluate uplift models properly
- **targeted rollout strategies Development**: Design targeted rollout strategies

---

## 6.1 Propensity vs Uplift Modeling

### The Fundamental Distinction

**Propensity Modeling:**
- Predicts: "Who is likely to have the outcome?"
- Example: "Who will churn?"
- Use case: Targeting users at risk

**Uplift Modeling:**
- Predicts: "Who will respond to treatment?"
- Example: "Who will churn less if we give them an offer?"
- Use case: Targeting users who will be influenced by treatment

### Why This Matters

**Scenario: Retention Campaign**

**Propensity Approach:**
```
Model: Predict who will churn
Target: Users with high churn probability
Action: Send retention offer to high-risk users
```

**Problem:**
- High-risk users might churn regardless of offer
- Low-risk users might be influenced but aren't targeted
- Wastes resources on users who won't respond

**Uplift Approach:**
```
Model: Predict who will respond to retention offer
Target: Users with high uplift (offer changes behavior)
Action: Send offer only to users who will respond
```

**Advantage:**
- Targets users who will be influenced
- Avoids wasting resources on non-responders
- Maximizes incremental impact

### The Uplift Concept

**Definition:** Change in outcome due to treatment

**For Individual User:**
```
Uplift_i = Y_i(treatment) - Y_i(control)
```

**Problem:** We can't observe both outcomes for same user

**Solution:** Estimate from experiment data

**Average Uplift:**
```
ATE = E[Y | T=1] - E[Y | T=0]
```

**Heterogeneous Uplift:**
```
Uplift(X) = E[Y | T=1, X] - E[Y | T=0, X]
```

Varies by user characteristics X

### User Segments by Uplift

**Four User Types:**

1. **Persuadables (High Uplift)**
   - Respond positively to treatment
   - Would not have outcome without treatment
   - Would have outcome with treatment
   - **Target these!**

2. **Sure Things (Low Uplift)**
   - Will have outcome regardless
   - Treatment doesn't change behavior
   - **Don't waste resources**

3. **Lost Causes (Low Uplift)**
   - Won't have outcome regardless
   - Treatment doesn't help
   - **Don't waste resources**

4. **Sleeping Dogs (Negative Uplift)**
   - Treatment makes things worse
   - Would have outcome without treatment
   - Would not have outcome with treatment
   - **Avoid these!**

**Example: Retention Offer**

- **Persuadables:** Will stay if given offer, would leave without
- **Sure Things:** Will stay regardless (loyal customers)
- **Lost Causes:** Will leave regardless (already decided)
- **Sleeping Dogs:** Will leave if given offer (offended by discount)

---

## 6.2 Incrementality vs Prediction

### The Core Difference

**Prediction Models:**
- Answer: "What will happen?"
- Focus: Outcome probability
- Use: Forecasting, risk assessment

**Uplift Models:**
- Answer: "What will change if we intervene?"
- Focus: Treatment effect
- Use: Targeting, resource allocation

### Prediction Model Example

**Churn Prediction:**
```python
# Predict churn probability
model = train_churn_model(X, y_churn)
churn_prob = model.predict_proba(X)[:, 1]

# Target high-risk users
target_users = users[churn_prob > 0.7]
```

**What This Tells Us:**
- Who is likely to churn
- Risk assessment
- Resource prioritization

**What This Doesn't Tell Us:**
- Who will respond to intervention
- Whether intervention will help
- Incremental impact

### Uplift Model Example

**Churn Uplift:**
```python
# Estimate uplift (change in churn probability)
uplift_model = train_uplift_model(X, treatment, y_churn)
uplift = uplift_model.predict(X)

# Target high-uplift users
target_users = users[uplift > threshold]
```

**What This Tells Us:**
- Who will respond to intervention
- Incremental impact of treatment
- Optimal targeting strategy

**What This Requires:**
- Experiment data (treatment/control)
- Causal inference methods
- More complex than prediction

### When to Use Each

**Use Prediction When:**
- ✅ Need to forecast outcomes
- ✅ Risk assessment
- ✅ No treatment/intervention
- ✅ Observational data only

**Use Uplift When:**
- ✅ Need to target interventions
- ✅ Want to maximize incremental impact
- ✅ Have experiment data
- ✅ Treatment has costs

**Combined Approach:**
1. Predict outcome probability (who's at risk)
2. Estimate uplift (who will respond)
3. Target: High risk AND high uplift

---

## 6.3 When Uplift Beats Personalization Rules

### Traditional Personalization Rules

**Rule-Based Targeting:**
```
If user_segment == "high_value" and days_since_purchase > 30:
    send_promotion()
```

**Problems:**
- Based on correlation, not causation
- Doesn't account for incrementality
- May target wrong users
- Doesn't optimize for impact

### Uplift-Based Targeting

**Data-Driven Targeting:**
```
If uplift_score > threshold:
    send_promotion()
```

**Advantages:**
- Targets based on causal effect
- Maximizes incremental impact
- Accounts for who will actually respond
- Optimizes resource allocation

### Example: Promotional Campaign

**Rule-Based Approach:**
```
Target: Users who haven't purchased in 30+ days
Rationale: They're at risk of churning
```

**Result:**
- Targets many users
- Some respond, some don't
- Average response rate: 5%
- Cost per conversion: High

**Uplift-Based Approach:**
```
Target: Users with high uplift (will purchase if given promotion)
Rationale: Maximize incremental purchases
```

**Result:**
- Targets fewer, better users
- Higher response rate: 15%
- Cost per conversion: Lower
- Higher ROI

### When Rules Are Good Enough

**Use Rules When:**
- Simple heuristics work well
- Experiment data unavailable
- Treatment cost is very low
- Quick implementation needed

**Use Uplift When:**
- Treatment has meaningful cost
- Experiment data available
- Incremental impact matters
- Optimization is important

---

## 6.4 Risks of Misusing Uplift Models

### Risk 1: Overfitting

**Problem:**
- Uplift is harder to predict than outcomes
- Smaller signal (difference between groups)
- Easy to overfit to noise

**Symptoms:**
- High training performance
- Poor validation performance
- Doesn't generalize

**Prevention:**
- Cross-validation
- Hold-out test set
- Regularization
- Simpler models

### Risk 2: Selection Bias

**Problem:**
- Training on experiment data
- But deploying on all users
- Distribution shift

**Example:**
- Experiment: Random sample
- Deployment: All users
- Model may not generalize

**Prevention:**
- Validate on representative data
- Monitor performance in production
- Retrain periodically

### Risk 3: Ignoring Costs

**Problem:**
- Target high-uplift users
- But ignore treatment costs
- May not be profitable

**Example:**
```
User A: Uplift = +$10, Cost = $5 → Net: +$5 ✅
User B: Uplift = +$3, Cost = $5 → Net: -$2 ❌
```

**Solution:**
- Optimize for net value, not just uplift
- Consider: Uplift - Cost
- Set threshold based on profitability

### Risk 4: Ethical Concerns

**Problem:**
- Targeting based on sensitive attributes
- Discriminatory outcomes
- Privacy violations

**Example:**
- Uplift model uses protected attributes
- Results in discriminatory targeting
- Legal and ethical issues

**Prevention:**
- Audit for fairness
- Remove protected attributes
- Test for disparate impact
- Consider ethical implications

### Risk 5: Model Decay

**Problem:**
- User behavior changes over time
- Model becomes outdated
- Performance degrades

**Prevention:**
- Monitor model performance
- Retrain regularly
- A/B test model updates
- Track key metrics

---

## 6.5 Evaluating Uplift Models

### The Challenge: We Can't Observe True Uplift

**Problem:**
- For each user, we only see one outcome
- Can't directly measure individual uplift
- Must estimate from population data

### Evaluation Methods

**1. Qini Curve**

**Concept:** Compare cumulative uplift by targeting top users

**Calculation:**
1. Rank users by predicted uplift
2. Calculate cumulative uplift as we target more users
3. Compare to random targeting

**Interpretation:**
- Higher curve = Better model
- Area under curve (AUUC) = Overall performance
- Steeper early = Better targeting

**Implementation:**
```python
from causalml.metrics import auuc_score

# Calculate AUUC
auuc = auuc_score(
    y_true=outcomes,
    y_pred=predicted_uplift,
    treatment=treatment_assignment
)
```

**2. Uplift by Decile**

**Concept:** Group users by predicted uplift, measure actual uplift

**Calculation:**
1. Rank users by predicted uplift
2. Divide into deciles (10 groups)
3. Calculate actual uplift in each decile

**Interpretation:**
- Top decile should have highest actual uplift
- Monotonic relationship = Good model
- Flat relationship = Poor model

**3. Treatment Effect Heterogeneity**

**Concept:** Model should capture variation in treatment effects

**Validation:**
- Compare predicted uplift across segments
- Check if segments with different characteristics have different uplift
- Validate against known heterogeneity

**4. Out-of-Sample Validation**

**Concept:** Test on held-out data

**Approach:**
- Train on experiment data
- Validate on separate experiment or hold-out
- Measure performance on unseen data

**Key Metrics:**
- AUUC on validation set
- Uplift by decile on validation
- Correlation between predicted and actual uplift

### Common Evaluation Mistakes

**Mistake 1: Using Prediction Metrics**
- Accuracy, AUC for classification
- R² for regression
- These don't measure uplift prediction

**Mistake 2: Not Using Experiment Data**
- Can't evaluate uplift without treatment/control
- Need experiment to measure true uplift

**Mistake 3: Overfitting to Training Data**
- High training performance
- Poor validation performance
- Always validate on held-out data

---

## 6.6 Designing Targeted Rollout Strategies

### Strategy 1: Uplift-Based Targeting

**Approach:**
1. Estimate uplift for all users
2. Rank by predicted uplift
3. Target top N users or users above threshold

**Implementation:**
```python
# Estimate uplift
uplift_scores = uplift_model.predict(user_features)

# Rank users
ranked_users = users.sort_values('uplift', ascending=False)

# Target top 20%
target_users = ranked_users.head(len(ranked_users) * 0.2)
```

**Advantages:**
- Maximizes incremental impact
- Efficient resource use
- Data-driven

**Considerations:**
- Need experiment data to train model
- Model performance matters
- May miss some high-value users

### Strategy 2: Segment-Based Targeting

**Approach:**
1. Estimate uplift by segment
2. Target segments with high uplift
3. Avoid segments with negative uplift

**Implementation:**
```python
# Calculate uplift by segment
for segment in segments:
    segment_data = data[data['segment'] == segment]
    segment_uplift = calculate_uplift(segment_data)
    
    if segment_uplift > threshold:
        target_segment(segment)
```

**Advantages:**
- Simple to implement
- Easy to interpret
- Can combine with rules

**Considerations:**
- Less precise than individual-level
- May miss heterogeneity within segments

### Strategy 3: Profit-Optimized Targeting

**Approach:**
1. Estimate uplift and costs
2. Calculate net value: Uplift - Cost
3. Target users with positive net value

**Implementation:**
```python
# Calculate net value
net_value = predicted_uplift - treatment_cost

# Target profitable users
target_users = users[net_value > 0]

# Or optimize threshold
optimal_threshold = find_threshold_maximizing_profit(net_value)
target_users = users[net_value > optimal_threshold]
```

**Advantages:**
- Optimizes profitability
- Accounts for costs
- Business-aligned

**Considerations:**
- Need cost estimates
- More complex
- May reduce reach

### Strategy 4: Risk-Adjusted Targeting

**Approach:**
1. Estimate uplift and uncertainty
2. Adjust for risk (e.g., confidence intervals)
3. Target high-confidence, high-uplift users

**Implementation:**
```python
# Estimate uplift with uncertainty
uplift, ci_lower, ci_upper = estimate_uplift_with_ci(user_features)

# Conservative targeting (use lower bound)
conservative_uplift = ci_lower
target_users = users[conservative_uplift > threshold]

# Or risk-adjusted score
risk_adjusted_score = uplift - risk_penalty * uncertainty
target_users = users[risk_adjusted_score > threshold]
```

**Advantages:**
- Accounts for uncertainty
- More robust
- Reduces risk

**Considerations:**
- May be too conservative
- Need uncertainty estimates
- More complex

### Strategy 5: Multi-Armed Bandit

**Approach:**
1. Start with exploration (test different strategies)
2. Gradually shift to exploitation (use best strategy)
3. Continuously learn and adapt

**Implementation:**
```python
# Epsilon-greedy approach
if random() < epsilon:  # Explore
    target = random_strategy()
else:  # Exploit
    target = best_strategy_based_on_data()
```

**Advantages:**
- Balances exploration and exploitation
- Adapts over time
- Maximizes long-term value

**Considerations:**
- More complex to implement
- Requires ongoing monitoring
- May take time to converge

### Choosing a Strategy

**Factors to Consider:**
1. **Data Availability:** Experiment data? Historical data?
2. **Model Performance:** How good is uplift model?
3. **Cost Structure:** Fixed costs? Variable costs?
4. **Risk Tolerance:** Conservative? Aggressive?
5. **Business Goals:** Maximize impact? Profit? Reach?

**Recommendation:**
- Start simple (segment-based)
- Move to uplift-based as data and models improve
- Optimize for business goals (profit, impact)
- Monitor and iterate

---

## 6.7 Key Takeaways

**Propensity vs Uplift:**
- Propensity: Who will have outcome?
- Uplift: Who will respond to treatment?
- Use uplift for targeting interventions

**Incrementality vs Prediction:**
- Prediction: What will happen?
- Uplift: What will change?
- Use uplift to maximize incremental impact

**When Uplift Wins:**
- Treatment has costs
- Experiment data available
- Incremental impact matters
- Optimization is important

**Risks:**
- Overfitting (harder to predict)
- Selection bias (distribution shift)
- Ignoring costs (not profitable)
- Ethical concerns (discrimination)
- Model decay (outdated models)

**Evaluation:**
- Qini curve and AUUC
- Uplift by decile
- Out-of-sample validation
- Don't use prediction metrics

**Targeting Strategies:**
- Uplift-based: Rank by predicted uplift
- Segment-based: Target high-uplift segments
- Profit-optimized: Net value (uplift - cost)
- Risk-adjusted: Account for uncertainty
- Multi-armed bandit: Explore and exploit

---

## Lab 6: Design Uplift-Based Decision Strategy

**Objective:** Design an uplift-based decision strategy for a business scenario

**Requirements:**

Choose one scenario:

1. **Retention Offers**
   - Identify users at risk of churning
   - Design offer strategy
   - Optimize for retention and cost

2. **Promotions**
   - Target users for promotional campaigns
   - Maximize incremental purchases
   - Optimize for ROI

3. **Messaging Campaigns**
   - Personalize messaging
   - Maximize engagement
   - Optimize for conversion

**For Your Scenario:**

1. **Problem Setup**
   - Define the decision
   - Identify treatment and outcome
   - Available data

2. **Uplift Model Design**
   - Choose modeling approach
   - Define features
   - Plan evaluation

3. **Targeting Strategy**
   - Select targeting approach
   - Define targeting rules
   - Set thresholds

4. **Implementation Plan**
   - How to deploy
   - How to monitor
   - How to iterate

5. **Expected Outcomes**
   - Expected impact
   - Cost estimates
   - ROI projection

**Deliverables:**
- Strategy document (4-5 pages)
- Model design
- Targeting logic
- Implementation plan
- Expected outcomes

**Evaluation Criteria:**
- Sound uplift modeling approach (30%)
- Appropriate targeting strategy (25%)
- Feasible implementation plan (25%)
- Realistic outcome projections (20%)

**Time Estimate:** 6-8 hours

---

## Additional Resources

**Readings:**
- "Uplift Modeling" - Radcliffe & Surry
- "Causal Inference and Uplift Modeling" - Various
- "Personalization and Targeting" - Industry case studies

**Videos:**
- "Introduction to Uplift Modeling" - Academic talks
- "Uplift Modeling in Practice" - Industry talks

**Tools:**
- Python: `causalml`, `econml`, `scikit-uplift`
- R: `uplift`, `causalTree`
- Commercial: Various ML platforms

**Next Module Preview:**
Module 7 will cover guardrails, ethics, and decision safety—preventing harm while moving fast, detecting unintended consequences, and building safe experimentation practices.

---

**Module 6 Complete**  
**Next:** Module 7 - Guardrails, Ethics & Decision Safety
