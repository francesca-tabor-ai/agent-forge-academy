---
title: "Module 2: Data Understanding & Feature Thinking"
description: "Garbage in, garbage out — but smarter"
module: "2"
order: 2
---

# Module 2: Data Understanding & Feature Thinking

**Duration:** Week 2  
**Theme:** *Garbage in, garbage out — but smarter*

**Learning Objectives:**
- Understand data-generating processes
- Differentiate between static and dynamic features
- Identify behavioral, temporal, and aggregate features
- Detect and eliminate feature leakage
- Balance feature interpretability vs performance

---

## 2.1 Understanding Data-Generating Processes

### The Foundation: How Was This Data Created?

**Key Principle:** Understanding how data is generated helps you:
- Identify potential biases
- Spot data quality issues
- Design better features
- Avoid leakage

### Common Data-Generating Processes

#### 1. User Actions (Behavioral Data)

**Examples:**
- Clicks, purchases, logins, searches
- Page views, video watches, downloads

**Characteristics:**
- **Temporal:** Happens over time
- **Volatile:** Can change quickly
- **Rich:** Contains intent signals

**Questions to Ask:**
- When was this action recorded?
- Is this action available at prediction time?
- Could this action be influenced by what we're predicting?

#### 2. System Events (Operational Data)

**Examples:**
- Support tickets, refunds, returns
- Account changes, subscription updates
- System errors, API calls

**Characteristics:**
- **Event-driven:** Triggered by specific conditions
- **Structured:** Usually well-defined
- **Causal:** Often related to outcomes

**Questions to Ask:**
- Does this event cause or result from the target?
- Is this event available before the prediction window?

#### 3. External Data (Contextual Data)

**Examples:**
- Weather, holidays, economic indicators
- Competitor prices, market trends
- News, social media sentiment

**Characteristics:**
- **Exogenous:** Outside our control
- **Predictive:** Can signal future outcomes
- **Noisy:** May have weak signals

**Questions to Ask:**
- Is this data available at prediction time?
- How reliable is this data source?
- Does this data actually influence the target?

#### 4. Derived Data (Calculated Features)

**Examples:**
- Aggregates (total purchases, average spend)
- Ratios (purchase frequency, engagement rate)
- Trends (growth rate, change over time)

**Characteristics:**
- **Computed:** Derived from raw data
- **Flexible:** Can create many variations
- **Risky:** Prone to leakage if not careful

**Questions to Ask:**
- What time window is used for calculation?
- Does this include future information?
- Is this stable over time?

---

## 2.2 Static vs Dynamic Features

### Static Features: Characteristics That Don't Change

**Definition:** Features that remain constant or change very slowly.

**Examples:**
- Demographics: age, gender, location (at signup)
- Account attributes: signup date, initial plan
- Historical snapshots: first purchase category

**When to Use:**
- Baseline customer understanding
- Segmentation
- Cold start problems (new customers)

**Limitations:**
- Don't capture recent behavior
- May become stale over time
- Limited predictive power for dynamic outcomes

**Example:**
```python
# Static features
customer_features = {
    'signup_date': '2023-01-15',
    'signup_channel': 'organic',
    'initial_plan': 'premium',
    'signup_country': 'US',
    'age_at_signup': 32
}
```

### Dynamic Features: Characteristics That Change

**Definition:** Features that change over time and reflect current state.

**Examples:**
- Recent behavior: purchases in last 30 days
- Current state: active subscription, current plan
- Trends: spending trend, engagement trend

**When to Use:**
- Capturing recent patterns
- Reflecting current customer state
- Predicting near-term outcomes

**Advantages:**
- More predictive for recent outcomes
- Captures customer evolution
- Better for time-sensitive predictions

**Example:**
```python
# Dynamic features (as of prediction date)
customer_features = {
    'days_since_last_purchase': 15,
    'purchases_last_30_days': 3,
    'total_spend_last_90_days': 450.00,
    'current_plan': 'premium',
    'support_tickets_last_30_days': 2
}
```

### Hybrid Approach: Best of Both Worlds

**Strategy:** Combine static and dynamic features.

```python
# Complete feature set
features = {
    # Static (baseline)
    'signup_date': '2023-01-15',
    'signup_channel': 'organic',
    
    # Dynamic (current state)
    'days_since_last_purchase': 15,
    'purchases_last_30_days': 3,
    
    # Derived (combining both)
    'days_since_signup': 365,  # current_date - signup_date
    'lifetime_purchases': 45,
    'avg_purchase_frequency': 45 / 365  # purchases per day
}
```

---

## 2.3 Behavioral, Temporal, and Aggregate Features

### Behavioral Features: What Users Do

**Definition:** Features capturing user actions and interactions.

**Types:**

#### 1. Frequency Features
```python
'purchases_last_30_days': 5
'logins_last_7_days': 12
'page_views_last_week': 45
```

#### 2. Recency Features
```python
'days_since_last_purchase': 10
'days_since_last_login': 2
'hours_since_last_activity': 6
```

#### 3. Intensity Features
```python
'total_spend_last_30_days': 500.00
'avg_session_duration_last_week': 15.5  # minutes
'total_items_purchased_last_month': 12
```

#### 4. Diversity Features
```python
'unique_categories_purchased': 3
'unique_pages_visited': 25
'number_of_devices_used': 2
```

**Best Practices:**
- Use multiple time windows (7, 30, 90 days)
- Combine frequency and recency
- Capture both volume and variety

### Temporal Features: When Things Happen

**Definition:** Features capturing time-based patterns and seasonality.

**Types:**

#### 1. Time-Based Features
```python
'day_of_week': 3  # Wednesday
'month': 6  # June
'quarter': 2  # Q2
'is_weekend': False
'is_holiday': False
```

#### 2. Cyclical Encoding
```python
# Better than raw numbers for cyclical patterns
'hour_sin': sin(2 * π * hour / 24)
'hour_cos': cos(2 * π * hour / 24)
'day_of_week_sin': sin(2 * π * day / 7)
'day_of_week_cos': cos(2 * π * day / 7)
```

#### 3. Time Since Events
```python
'days_since_signup': 365
'days_since_first_purchase': 300
'days_since_last_upgrade': 90
```

#### 4. Seasonality Indicators
```python
'is_black_friday': False
'is_christmas_season': False
'days_until_holiday': 45
```

**Best Practices:**
- Encode cyclical patterns properly (sin/cos)
- Include business-specific temporal patterns
- Consider time zones and business hours

### Aggregate Features: Summaries Across Dimensions

**Definition:** Features that aggregate data across users, products, categories, or time.

**Types:**

#### 1. User Aggregates
```python
'lifetime_value': 5000.00
'total_purchases': 45
'avg_purchase_amount': 111.11
'customer_tenure_days': 365
```

#### 2. Product/Category Aggregates
```python
'avg_price_in_category': 50.00
'total_sales_in_category_last_month': 10000
'category_popularity_score': 0.85
```

#### 3. Time-Based Aggregates
```python
'purchases_last_30_days': 5
'purchases_last_90_days': 12
'purchases_last_365_days': 45
```

#### 4. Cross-Dimensional Aggregates
```python
# User behavior in specific category
'purchases_in_electronics_last_30_days': 2

# User behavior at specific time
'purchases_on_weekends_last_month': 3

# User behavior relative to average
'spend_vs_category_avg': 1.2  # 20% above average
```

**Best Practices:**
- Use multiple aggregation windows
- Compare individual to group averages
- Consider percentiles, not just means

---

## 2.4 Feature Leakage and Future Data Contamination

### What Is Feature Leakage?

**Definition:** Using information that wouldn't be available at prediction time.

**Result:** Models perform well in training but fail in production.

### Types of Leakage

#### 1. Temporal Leakage (Most Common)

**Problem:** Using data from after the prediction window.

**Example:**
```python
# BAD: Using future data
prediction_date = '2024-01-01'
churn_window = ('2024-01-01', '2024-01-31')

# Leakage: Using features from after prediction date
features = get_features(customer, '2024-02-15')  # ❌ Future data!
label = did_customer_churn(customer, churn_window)

# GOOD: Using only past data
features = get_features(customer, '2023-12-31')  # ✅ Before prediction
label = did_customer_churn(customer, churn_window)
```

**How to Prevent:**
- Always use features from BEFORE prediction window
- Strict temporal cutoff: `feature_date < prediction_window_start`

#### 2. Target Leakage

**Problem:** Using information that is a direct result of the target.

**Example: Churn Prediction**
```python
# BAD: Using cancellation date to predict churn
features = {
    'cancellation_date': '2024-01-15',  # ❌ This IS churn!
    'days_until_cancellation': 10  # ❌ Directly reveals target
}

# GOOD: Using behavior before cancellation window
features = {
    'days_since_last_purchase': 45,  # ✅ Behavior indicator
    'support_tickets_last_30_days': 5  # ✅ Pre-churn signal
}
```

**How to Prevent:**
- Never use the target or direct derivatives
- Use only causes, not effects

#### 3. Data Collection Leakage

**Problem:** Using data that is only collected for certain outcomes.

**Example:**
```python
# BAD: Using "retention_campaign_contacted" to predict churn
# Problem: We only contact customers we think will churn
# This feature directly reveals our prediction target

# GOOD: Use behavior that exists for all customers
features = {
    'days_since_last_purchase': 45,  # ✅ Available for all
    'engagement_score': 0.3  # ✅ Available for all
}
```

**How to Prevent:**
- Ensure features exist for all examples
- Be aware of selection bias in data collection

#### 4. Aggregation Leakage

**Problem:** Including future information in aggregates.

**Example:**
```python
# BAD: Calculating average using future data
prediction_date = '2024-01-01'
churn_window = ('2024-01-01', '2024-01-31')

# Leakage: Average includes purchases from churn window
avg_purchase = mean(purchases['2023-12-01':'2024-01-31'])  # ❌ Includes future

# GOOD: Only use data before prediction
avg_purchase = mean(purchases['2023-12-01':'2023-12-31'])  # ✅ Only past
```

**How to Prevent:**
- Strict time windows for aggregates
- Always end aggregates before prediction window

### Detecting Leakage

#### Method 1: Temporal Validation

```python
# Split data temporally
train_end = '2023-12-31'
val_start = '2024-01-01'
val_end = '2024-01-31'

# If validation performance >> training performance, likely leakage
train_score = model.evaluate(train_data)
val_score = model.evaluate(val_data)

if val_score >> train_score:  # Much better
    print("Warning: Possible data leakage!")
```

#### Method 2: Feature Importance Analysis

```python
# If a single feature has extremely high importance, investigate
feature_importance = model.feature_importances_
top_feature = features[np.argmax(feature_importance)]

if feature_importance.max() > 0.8:  # 80%+ importance
    print(f"Warning: {top_feature} may be leaking")
    # Investigate: Is this available at prediction time?
```

#### Method 3: Business Logic Review

**Questions to Ask:**
- "Is this feature available at prediction time?"
- "Could this feature be influenced by the target?"
- "Would we have this information before the outcome occurs?"

---

## 2.5 Feature Interpretability vs Performance Trade-offs

### The Trade-off

**Interpretable Models:**
- Linear models, decision trees
- Easy to explain
- May have lower performance

**Complex Models:**
- Gradient boosting, neural networks
- Higher performance
- Harder to explain

### When Interpretability Matters

**High-Stakes Decisions:**
- Medical diagnosis
- Credit approval
- Hiring decisions
- Regulatory compliance

**Stakeholder Trust:**
- Business teams need to understand
- Executives need to trust
- Customers may need explanations

**Debugging:**
- Understanding model failures
- Identifying data issues
- Improving features

### Strategies for Balancing

#### 1. Start Simple, Add Complexity

```python
# Step 1: Linear model (interpretable)
linear_model = LogisticRegression()
linear_score = cross_val_score(linear_model, X, y)

# Step 2: Tree model (moderately interpretable)
tree_model = RandomForestClassifier()
tree_score = cross_val_score(tree_model, X, y)

# Step 3: Complex model (if needed)
if tree_score < target_performance:
    complex_model = XGBoostClassifier()
    complex_score = cross_val_score(complex_model, X, y)
```

#### 2. Use Post-Hoc Explanation

```python
# Train complex model for performance
model = XGBoostClassifier()
model.fit(X, y)

# Explain with SHAP
import shap
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X)

# Now you can explain individual predictions
```

#### 3. Feature Engineering for Interpretability

```python
# Instead of raw features that are hard to interpret
features = {
    'feature_1': 0.234,
    'feature_2': 0.891,
    'feature_3': 0.456
}

# Create interpretable features
features = {
    'days_since_last_purchase': 15,  # Clear meaning
    'purchases_last_30_days': 5,  # Clear meaning
    'spend_vs_avg': 1.2  # 20% above average - clear meaning
}
```

#### 4. Hybrid Approach

```python
# Use interpretable model for decisions
interpretable_model = LogisticRegression()
interpretable_model.fit(X_interpretable, y)

# Use complex model for validation
complex_model = XGBoostClassifier()
complex_model.fit(X_all, y)

# Compare: If complex is much better, investigate why
# Then try to capture that signal in interpretable features
```

---

## Lab 2: Exploratory Feature Analysis and Leak Detection

### Objective
Perform exploratory feature analysis and identify potential leakage issues.

### Tasks

1. **Data Exploration**
   - Load and explore a customer dataset
   - Identify static vs dynamic features
   - Identify behavioral, temporal, and aggregate features

2. **Feature Analysis**
   - Calculate feature statistics
   - Identify missing values and outliers
   - Analyze feature distributions
   - Check feature correlations

3. **Leakage Detection**
   - Review temporal alignment of features
   - Identify potential target leakage
   - Check for data collection bias
   - Validate aggregation windows

4. **Feature Blueprint**
   - Create a feature blueprint document
   - Define feature calculation logic
   - Specify temporal constraints
   - Document potential issues

### Deliverables

1. **Exploratory Data Analysis Report** including:
   - Data overview and statistics
   - Feature type classification
   - Distribution analysis
   - Correlation analysis

2. **Leakage Detection Report** including:
   - Temporal alignment review
   - Target leakage analysis
   - Data collection bias check
   - Recommendations for fixes

3. **Feature Blueprint Document** including:
   - Feature definitions
   - Calculation logic
   - Temporal constraints
   - Data sources
   - Potential issues and mitigations

### Evaluation Criteria

- Data understanding depth (30%)
- Leakage detection accuracy (30%)
- Feature blueprint quality (25%)
- Analysis clarity (15%)

---

## Summary

**Key Takeaways:**

1. **Data-Generating Processes:** Understand how data is created
2. **Static vs Dynamic:** Use both for comprehensive features
3. **Feature Types:** Behavioral, temporal, and aggregate features serve different purposes
4. **Leakage Prevention:** Always use features from before prediction window
5. **Interpretability Trade-offs:** Balance performance and explainability based on use case

**Next Steps:**
- Module 3: Engineer features at scale
- Learn time-aware feature engineering
- Build production-ready feature pipelines

---

## Additional Resources

### Reading
- "Feature Engineering for Machine Learning" by Alice Zheng and Amanda Casari
- "Designing Machine Learning Systems" by Chip Huyen (Chapter 3: Data Management)
- "The Elements of Statistical Learning" (Chapter 2: Overview of Supervised Learning)

### Tools
- pandas: Data exploration and manipulation
- Great Expectations: Data quality validation
- Evidently AI: Data drift detection

---

**Ready for Module 3? [Continue →](Module_03_Feature_Engineering_at_Scale.md)**
