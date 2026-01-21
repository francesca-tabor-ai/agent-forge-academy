---
title: "Module 1: Problem Framing for Machine Learning"
description: "What should we predict — and why?"
module: "1"
order: 1
---

# Module 1: Problem Framing for Machine Learning

**Duration:** Week 1  
**Theme:** *What should we predict — and why?*

**Learning Objectives:**
- **the difference between prediction, explanation, and optimization Understanding**: Understand the difference between prediction, explanation, and optimization
- **Map Business**: Map business decisions to ML problems effectively
- **Define Targets,**: Define targets, labels, and prediction horizons correctly
- **Choose The**: Choose the right ML approach for the problem
- **Identify And**: Identify and avoid common framing failures

---

## 1.1 Prediction vs Explanation vs Optimization

### Three Different Goals, Three Different Approaches

Machine learning can serve three distinct purposes, and confusing them leads to failed projects.

#### Prediction: What Will Happen?

**Goal:** Forecast future outcomes with accuracy

**Key Questions:**
- "Who will churn in the next 30 days?"
- "How much demand should we expect next quarter?"
- "Which customers are worth investing in?"

**Characteristics:**
- Focus on **accuracy** of future outcomes
- Model interpretability is secondary
- Performance measured by prediction quality
- Used for **decision-making**

**Example:**
```python
# Prediction: Will this customer churn?
# We don't need to know WHY, just IF
churn_probability = model.predict(customer_features)
if churn_probability > 0.3:
    trigger_retention_campaign()
```

#### Explanation: Why Did It Happen?

**Goal:** Understand causal relationships and drivers

**Key Questions:**
- "Why did sales drop last month?"
- "What factors drive customer satisfaction?"
- "Which features most influence conversion?"

**Characteristics:**
- Focus on **interpretability** and causality
- Model accuracy is secondary
- Performance measured by insight quality
- Used for **understanding**

**Example:**
```python
# Explanation: What drives churn?
# We need to understand the drivers
shap_values = explainer.shap_values(customer_features)
# Identify top drivers: price_increase, support_tickets, etc.
```

#### Optimization: What Should We Do?

**Goal:** Find the best action to maximize an objective

**Key Questions:**
- "What price should we set to maximize revenue?"
- "Which marketing channel should we invest in?"
- "How should we allocate budget across campaigns?"

**Characteristics:**
- Focus on **action selection**
- Requires understanding of constraints
- Performance measured by outcome improvement
- Used for **action planning**

**Example:**
```python
# Optimization: What discount should we offer?
# We need to find the action that maximizes expected value
def expected_revenue(discount):
    retention_prob = model.predict(customer_features, discount)
    revenue = price * (1 - discount) * retention_prob
    return revenue

optimal_discount = optimize(expected_revenue)
```

### When to Use Each Approach

| Business Question | Approach | Why |
|------------------|----------|-----|
| "Who will churn?" | **Prediction** | Need to identify at-risk customers |
| "Why do customers churn?" | **Explanation** | Need to understand root causes |
| "What should we do to reduce churn?" | **Optimization** | Need to select best intervention |

**This course focuses on Prediction** — building models that forecast future outcomes to drive decisions.

---

## 1.2 Mapping Business Decisions to ML Problems

### The Decision → Prediction Pipeline

Every ML problem should start with a **business decision** that needs to be made.

#### Step 1: Identify the Decision

**Bad Starting Point:**
- "Let's build a churn model"
- "We need ML for customer segmentation"
- "Can we predict sales?"

**Good Starting Point:**
- "We need to decide which customers to target for retention campaigns"
- "We need to decide how much inventory to stock"
- "We need to decide which leads to prioritize for sales outreach"

#### Step 2: Define the Decision Horizon

**Question:** When does this decision need to be made?

**Examples:**
- **Churn:** Decision needed 30 days before likely churn → predict 30 days ahead
- **Demand:** Decision needed weekly → predict next week's demand
- **LTV:** Decision needed at acquisition → predict lifetime value at signup

#### Step 3: Map to ML Problem Type

| Decision | Prediction Needed | ML Problem Type |
|----------|------------------|-----------------|
| "Who to target for retention?" | Churn probability | **Binary Classification** |
| "How much inventory to stock?" | Demand quantity | **Regression** |
| "Which leads to prioritize?" | Lead score | **Ranking** |
| "What price to set?" | Price elasticity | **Regression** |
| "When will equipment fail?" | Time to failure | **Time-to-Event (Survival)** |

#### Step 4: Define Success Criteria

**Business Success:**
- "Reduce churn by 15%"
- "Increase revenue by 10%"
- "Reduce inventory costs by 20%"

**ML Success (must support business success):**
- "Predict churn with 80% precision at 60% recall"
- "Forecast demand within 10% error"
- "Rank top 20% of leads that convert 3x better"

---

## 1.3 Defining Targets, Labels, and Prediction Horizons

### Targets: What Are We Predicting?

**Target Definition Checklist:**
- [ ] **Measurable:** Can we observe this outcome?
- [ ] **Actionable:** Does predicting this enable a decision?
- [ ] **Timely:** Can we observe it soon enough to act?
- [ ] **Stable:** Does the definition remain consistent?

#### Good Target Examples

**Churn Prediction:**
```
Target: Customer does not make a purchase in next 30 days
- Measurable: ✅ Yes, we can observe purchases
- Actionable: ✅ Yes, we can intervene before churn
- Timely: ✅ Yes, 30 days is actionable
- Stable: ✅ Yes, definition is consistent
```

**Demand Forecasting:**
```
Target: Total units sold in next week
- Measurable: ✅ Yes, we track sales
- Actionable: ✅ Yes, we can adjust inventory
- Timely: ✅ Yes, weekly is actionable
- Stable: ✅ Yes, definition is consistent
```

#### Bad Target Examples

**Vague Churn:**
```
Target: "Customer dissatisfaction"
- Measurable: ❌ No, too vague
- Actionable: ❌ No, unclear what to do
- Timely: ❌ No, when do we measure?
- Stable: ❌ No, subjective definition
```

**Too Distant:**
```
Target: Customer lifetime value in 5 years
- Measurable: ✅ Yes
- Actionable: ❌ No, too far in future
- Timely: ❌ No, decision needed now
- Stable: ✅ Yes
```

### Labels: How Do We Create Training Data?

**Label Creation Strategies:**

#### 1. Historical Labels (Most Common)

**Process:**
1. Look back in time
2. Identify when target occurred
3. Use features from before that time

**Example: Churn Labels**
```python
# For each customer on Jan 1, 2024
# Did they churn in next 30 days (Jan 1 - Jan 31)?
# Use features from Dec 31, 2023 or earlier

customer_features_2023_12_31 = get_features(customer, '2023-12-31')
churned_in_jan = did_customer_churn(customer, '2024-01-01', '2024-01-31')
# Label: churned_in_jan (True/False)
```

#### 2. Proxy Labels (When Direct Labels Don't Exist)

**When to Use:**
- Target is hard to observe directly
- Need to use a related signal

**Example: Engagement as Proxy for Churn**
```python
# Direct label: Customer cancels subscription
# Proxy label: Customer has < 2 logins in 30 days
# Risk: Proxy may not perfectly match true target
```

**Danger:** Proxy labels can mislead if they don't align with true target.

#### 3. Synthetic Labels (Expert Judgment)

**When to Use:**
- No historical data
- New product/feature
- Rare events

**Example: Fraud Detection**
```python
# Expert rules to label fraud
if transaction.amount > 10000 and transaction.country != user.country:
    label = 'fraud'
else:
    label = 'not_fraud'
```

### Prediction Horizons: How Far Ahead?

**Key Principle:** Prediction horizon should match decision timing.

**Common Horizons:**

| Business Decision | Prediction Horizon | Why |
|------------------|-------------------|-----|
| Retention campaign | 30-90 days | Need time to intervene |
| Inventory planning | 1-4 weeks | Weekly/monthly ordering cycles |
| Lead prioritization | 7-30 days | Sales cycle length |
| Equipment maintenance | 1-6 months | Maintenance scheduling |

**Rule of Thumb:**
- **Too Short:** Not enough time to act
- **Too Long:** Predictions become unreliable, less actionable

---

## 1.4 Choosing the Right ML Approach

### Problem Type Decision Tree

```
Start: What are we predicting?
│
├─ Single value at a point in time?
│  │
│  ├─ Binary outcome (yes/no)?
│  │  └─> Binary Classification
│  │      (churn, fraud, conversion)
│  │
│  └─ Continuous value?
│     └─> Regression
│         (revenue, demand, price)
│
├─ Sequence of values over time?
│  └─> Time Series Forecasting
│      (demand over weeks, sales over months)
│
├─ Ranking/Ordering?
│  └─> Ranking/Learning to Rank
│      (lead scoring, recommendation)
│
└─ Time until event?
   └─> Survival Analysis
       (time to churn, equipment failure)
```

### Classification: Binary Outcomes

**When to Use:**
- Predicting yes/no, true/false, 0/1 outcomes
- Decision is "take action" or "don't take action"

**Examples:**
- Will customer churn? (Yes/No)
- Is transaction fraudulent? (Yes/No)
- Will lead convert? (Yes/No)

**Key Metrics:**
- Precision, Recall, F1-Score
- ROC-AUC, PR-AUC
- Business metrics (cost per action, revenue impact)

### Regression: Continuous Values

**When to Use:**
- Predicting numeric quantities
- Decision involves "how much"

**Examples:**
- How much will customer spend? (dollars)
- What will next week's demand be? (units)
- What is customer lifetime value? (dollars)

**Key Metrics:**
- MAE, RMSE, MAPE
- R², Adjusted R²
- Business metrics (forecast accuracy, cost impact)

### Time Series: Sequential Predictions

**When to Use:**
- Predicting values over time
- Temporal patterns matter
- Need to forecast multiple periods ahead

**Examples:**
- Daily sales for next 30 days
- Weekly demand for next quarter
- Monthly active users for next year

**Key Metrics:**
- MAE, RMSE (per time step)
- Forecast accuracy at different horizons
- Business metrics (inventory costs, service levels)

### Ranking: Ordering Items

**When to Use:**
- Need to prioritize items
- Relative order matters more than absolute scores

**Examples:**
- Which leads should sales call first?
- Which products should we recommend?
- Which customers should we target?

**Key Metrics:**
- NDCG, MAP
- Precision@K, Recall@K
- Business metrics (conversion rate, revenue lift)

---

## 1.5 Common Framing Failures

### Failure 1: Proxy Targets

**Problem:** Predicting something that doesn't directly enable the decision.

**Example:**
```
Business Decision: Who should we target for retention?
Bad Target: "Customer satisfaction score"
Good Target: "Will customer churn in next 30 days?"

Why Bad: Satisfaction doesn't directly predict churn.
Some satisfied customers churn (price, competition).
Some dissatisfied customers stay (switching costs).
```

**How to Fix:**
- Always map back to the actual decision
- If you can't measure the real target, use the best proxy but validate it

### Failure 2: Leaky Labels

**Problem:** Using information from the future to predict the past.

**Example:**
```
Bad: Predicting churn using features from AFTER churn window
customer_features = get_features(customer, '2024-02-15')  # After churn window
churn_label = did_customer_churn(customer, '2024-01-01', '2024-01-31')

Why Bad: Features from Feb 15 may include information
about what happened in January (data leakage).
```

**How to Fix:**
- Always use features from BEFORE the prediction window
- Strict temporal separation: features < prediction_window_start

### Failure 3: Irrelevant Predictions

**Problem:** Predicting something that doesn't enable action.

**Example:**
```
Bad: Predicting customer age
Business Decision: Who to target for retention?

Why Bad: Age doesn't help us decide who to target.
We can't change age, and it may not be actionable.
```

**How to Fix:**
- Always ask: "If I had this prediction, what would I do differently?"
- If the answer is "nothing," the prediction is irrelevant

### Failure 4: Wrong Granularity

**Problem:** Predicting at the wrong level of detail.

**Example:**
```
Business Decision: How much inventory to stock per store?
Bad: Predict total company demand
Good: Predict demand per store

Why Bad: Company-level prediction doesn't help
with store-level inventory decisions.
```

**How to Fix:**
- Match prediction granularity to decision granularity
- If decision is per-store, predict per-store

### Failure 5: Ignoring Actionability

**Problem:** Predicting outcomes we can't influence or act on.

**Example:**
```
Bad: Predicting macroeconomic indicators
Business Decision: How to price our products?

Why Bad: We can't control macro indicators.
Better: Predict demand given different price points.
```

**How to Fix:**
- Focus on predictions that enable actions
- If you can't act on it, don't predict it (unless it's a feature)

---

## Lab 1: Convert Business Questions into ML Problems

### Objective
Convert three business questions into well-scoped ML problem definitions.

### Tasks

1. **Churn Prediction**
   - Business Question: "Who will churn in the next 30 days?"
   - Define: Target, labels, prediction horizon, problem type
   - Identify: Potential framing failures

2. **Demand Forecasting**
   - Business Question: "How much demand should we expect next week?"
   - Define: Target, labels, prediction horizon, problem type
   - Identify: Potential framing failures

3. **Customer Value**
   - Business Question: "Which customers are worth investing in?"
   - Define: Target, labels, prediction horizon, problem type
   - Identify: Potential framing failures

### Deliverables

For each problem, provide:

1. **Problem Definition Document** including:
   - Business decision being enabled
   - Target definition (what we're predicting)
   - Label creation strategy
   - Prediction horizon and justification
   - Problem type (classification/regression/etc.)
   - Success criteria (business + ML metrics)
   - Potential framing failures and how to avoid them

2. **Stakeholder Communication**
   - One-page summary for business stakeholders
   - Explains the ML approach in business terms

### Evaluation Criteria

- Problem framing quality (40%)
- Alignment with business decisions (30%)
- Identification of potential issues (20%)
- Communication clarity (10%)

---

## Summary

**Key Takeaways:**

- **Prediction vs Explanation vs Optimization:**: Know which goal you're serving
- **Decision-First Thinking:**: Always start with the business decision
- **Target Definition:**: Measurable, actionable, timely, stable
- **Label Creation:**: Historical > Proxy > Synthetic (with validation)
- **Problem Type Selection:**: Match ML approach to prediction type
- **Common Failures:**: Proxy targets, leaky labels, irrelevant predictions, wrong granularity, ignoring actionability

**Next Steps:**
- **Module 2:**: Module 2: Understand data and think about features
- **to identify feature leakage Understanding**: Learn to identify feature leakage
- **feature blueprints Development**: Build feature blueprints

---

## Additional Resources

### Reading
- "Designing Machine Learning Systems" by Chip Huyen (Chapter 2: Introduction to ML Systems Design)
- "Applied Predictive Modeling" by Max Kuhn and Kjell Johnson (Chapter 1: Introduction)
- "The Elements of Statistical Learning" by Hastie, Tibshirani, Friedman (Chapter 2: Overview of Supervised Learning)

### Tools
- scikit-learn documentation: Problem types
- MLflow: Experiment tracking for problem framing

---

**Ready for Module 2? [Continue →](Module_02_Data_Understanding_and_Feature_Thinking.md)**
