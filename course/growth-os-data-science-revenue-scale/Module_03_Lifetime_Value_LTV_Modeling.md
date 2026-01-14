---
title: "Module 3: Lifetime Value (LTV) Modeling"
description: "Not all customers are equal"
module: "3"
order: 3
---

# Module 3: Lifetime Value (LTV) Modeling

**Duration:** Week 3  
**Theme:** *Not all customers are equal*

**Learning Objectives:**
- Understand conceptual foundations of LTV
- Differentiate historical vs predictive LTV
- Calculate contribution margin and include costs
- Perform segment-level LTV analysis
- Use LTV for budget and strategy decisions
- Build predictive LTV models

---

## 3.1 Conceptual Foundations of LTV

### What is Lifetime Value?

**Definition:** The total revenue (or profit) a customer will generate over their entire relationship with your business.

**Key Insight:** Not all customers are equal. Some are worth 10x, 100x, or even 1000x more than others.

#### Why LTV Matters

**1. Customer Acquisition Decisions**
- How much should you spend to acquire a customer?
- Which channels are profitable?
- Which segments should you target?

**2. Product Strategy**
- Which features drive LTV?
- What's the ROI of product improvements?
- How do pricing changes affect LTV?

**3. Resource Allocation**
- Where should you invest?
- Which customers deserve more attention?
- How do you prioritize growth initiatives?

#### Basic LTV Formula

**Simple Formula:**
```
LTV = Average Revenue Per User (ARPU) × Average Customer Lifespan
```

**Example:**
- ARPU: $50/month
- Average Lifespan: 24 months
- LTV = $50 × 24 = $1,200

**More Accurate Formula:**
```
LTV = ARPU × Gross Margin % × (1 / Churn Rate)
```

**Example:**
- ARPU: $50/month
- Gross Margin: 80%
- Monthly Churn Rate: 5%
- LTV = $50 × 0.80 × (1 / 0.05) = $800

**With Discounting (Time Value of Money):**
```
LTV = Σ (Revenue_t × Margin_t × (1 / (1 + r)^t))
```
where r = discount rate, t = time period

---

## 3.2 Historical vs Predictive LTV

### Historical LTV: What Happened

**Definition:** Calculate LTV based on actual customer behavior to date.

**Calculation:**

```python
def calculate_historical_ltv(transactions_df):
    """Calculate historical LTV for each customer"""
    customer_ltv = transactions_df.groupby('customer_id').agg({
        'revenue': 'sum',
        'cost': 'sum',
        'transaction_date': ['min', 'max', 'count']
    })
    
    customer_ltv.columns = ['total_revenue', 'total_cost', 'first_purchase', 'last_purchase', 'transaction_count']
    customer_ltv['lifetime_days'] = (
        customer_ltv['last_purchase'] - customer_ltv['first_purchase']
    ).dt.days
    
    customer_ltv['ltv'] = customer_ltv['total_revenue'] - customer_ltv['total_cost']
    customer_ltv['ltv_margin'] = customer_ltv['ltv'] / customer_ltv['total_revenue']
    
    return customer_ltv
```

**Advantages:**
- Accurate for completed relationships
- No assumptions needed
- Good for benchmarking

**Limitations:**
- Only works for customers who have churned
- Doesn't predict future value
- Can't use for active customers
- Biased toward older cohorts

### Predictive LTV: What Will Happen

**Definition:** Predict LTV for customers based on their current behavior and characteristics.

**Approach 1: Cohort-Based Prediction**

```python
def predict_ltv_cohort_method(historical_cohorts, current_cohort_age):
    """Predict LTV using cohort analysis"""
    # Calculate historical LTV by cohort age
    cohort_ltv_by_age = {}
    
    for cohort in historical_cohorts:
        for age in range(1, cohort['max_age'] + 1):
            if age not in cohort_ltv_by_age:
                cohort_ltv_by_age[age] = []
            
            cohort_ltv_by_age[age].append(
                cohort['cumulative_revenue'][age]
            )
    
    # Calculate average LTV by age
    avg_ltv_by_age = {
        age: np.mean(ltvs) 
        for age, ltvs in cohort_ltv_by_age.items()
    }
    
    # Predict for current cohort
    if current_cohort_age in avg_ltv_by_age:
        current_ltv = avg_ltv_by_age[current_cohort_age]
        
        # Extrapolate to full lifetime
        # Use retention curve to estimate remaining lifetime
        retention_curve = calculate_retention_curve(historical_cohorts)
        remaining_months = estimate_remaining_lifetime(retention_curve, current_cohort_age)
        
        # Estimate future revenue
        avg_monthly_revenue = current_ltv / current_cohort_age
        predicted_future_revenue = avg_monthly_revenue * remaining_months
        
        predicted_ltv = current_ltv + predicted_future_revenue
    else:
        predicted_ltv = None
    
    return predicted_ltv
```

**Approach 2: Machine Learning Prediction**

```python
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split

def predict_ltv_ml_method(customer_features, historical_ltv):
    """Predict LTV using machine learning"""
    # Prepare features
    features = [
        'acquisition_channel',
        'signup_month',
        'first_purchase_amount',
        'days_to_first_purchase',
        'purchase_frequency',
        'avg_order_value',
        'product_category_preference',
        'device_type',
        'location'
    ]
    
    X = customer_features[features]
    y = historical_ltv['ltv']
    
    # Encode categorical features
    from sklearn.preprocessing import LabelEncoder
    label_encoders = {}
    for col in X.select_dtypes(include=['object']).columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        label_encoders[col] = le
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train model
    model = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5
    )
    model.fit(X_train, y_train)
    
    # Predict
    predictions = model.predict(X_test)
    
    # Evaluate
    from sklearn.metrics import mean_absolute_error, r2_score
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    return {
        'model': model,
        'predictions': predictions,
        'mae': mae,
        'r2': r2,
        'feature_importance': get_feature_importance(model, features)
    }
```

**Approach 3: Probabilistic Models (BG/NBD)**

```python
from lifetimes import BetaGeoFitter, GammaGammaFitter

def predict_ltv_probabilistic(transaction_data):
    """Predict LTV using probabilistic models (BG/NBD + Gamma-Gamma)"""
    # Prepare data for BG/NBD model
    from lifetimes.utils import summary_data_from_transaction_data
    
    summary = summary_data_from_transaction_data(
        transaction_data,
        'customer_id',
        'transaction_date',
        'revenue',
        observation_period_end=transaction_data['transaction_date'].max()
    )
    
    # Fit BG/NBD model (predicts transaction frequency)
    bgf = BetaGeoFitter(penalizer_coef=0.0)
    bgf.fit(
        summary['frequency'],
        summary['recency'],
        summary['T']
    )
    
    # Predict future transactions
    summary['predicted_transactions'] = bgf.conditional_expected_number_of_purchases_up_to_time(
        12,  # 12 months ahead
        summary['frequency'],
        summary['recency'],
        summary['T']
    )
    
    # Fit Gamma-Gamma model (predicts average order value)
    # Filter to customers with repeat purchases
    repeat_customers = summary[summary['frequency'] > 0]
    
    ggf = GammaGammaFitter(penalizer_coef=0.0)
    ggf.fit(
        repeat_customers['frequency'],
        repeat_customers['monetary_value']
    )
    
    # Predict average order value
    summary['predicted_aov'] = ggf.conditional_expected_average_profit(
        summary['frequency'],
        summary['monetary_value']
    )
    
    # Calculate predicted LTV
    summary['predicted_ltv'] = (
        summary['predicted_transactions'] * 
        summary['predicted_aov']
    )
    
    return {
        'bgf_model': bgf,
        'ggf_model': ggf,
        'predictions': summary[['predicted_ltv', 'predicted_transactions', 'predicted_aov']]
    }
```

---

## 3.3 Contribution Margin and Cost Inclusion

### What Costs to Include

**LTV Components:**

1. **Revenue**
   - Subscription fees
   - Transaction revenue
   - Upsells/cross-sells
   - Referral revenue

2. **Direct Costs**
   - Cost of goods sold (COGS)
   - Payment processing fees
   - Fulfillment costs
   - Support costs (if significant)

3. **Indirect Costs (Optional)**
   - Marketing costs (CAC)
   - Product development allocation
   - Overhead allocation

**Decision Framework:**

**For Customer Acquisition Decisions:**
- Use: Revenue - Direct Costs (Gross Margin LTV)
- Compare to: Customer Acquisition Cost (CAC)
- Ratio: LTV:CAC should be > 3:1

**For Product Strategy:**
- Use: Revenue - Direct Costs
- Focus on: How product changes affect this

**For Financial Planning:**
- Use: Revenue - All Costs (Net LTV)
- Include: CAC, overhead, etc.

### Calculating Contribution Margin

```python
def calculate_ltv_with_costs(revenue_data, cost_data):
    """Calculate LTV including all relevant costs"""
    # Aggregate revenue by customer
    customer_revenue = revenue_data.groupby('customer_id').agg({
        'revenue': 'sum',
        'transaction_count': 'count'
    })
    
    # Aggregate costs by customer
    customer_costs = cost_data.groupby('customer_id').agg({
        'cogs': 'sum',
        'payment_processing': 'sum',
        'fulfillment': 'sum',
        'support': 'sum'
    })
    
    # Merge
    customer_ltv = customer_revenue.merge(
        customer_costs,
        left_index=True,
        right_index=True,
        how='left'
    ).fillna(0)
    
    # Calculate margins
    customer_ltv['total_costs'] = (
        customer_ltv['cogs'] +
        customer_ltv['payment_processing'] +
        customer_ltv['fulfillment'] +
        customer_ltv['support']
    )
    
    customer_ltv['gross_margin'] = (
        customer_ltv['revenue'] - customer_ltv['total_costs']
    )
    
    customer_ltv['gross_margin_pct'] = (
        customer_ltv['gross_margin'] / customer_ltv['revenue'] * 100
    )
    
    # Calculate LTV (with margin)
    customer_ltv['ltv'] = customer_ltv['gross_margin']
    
    return customer_ltv
```

### Including Customer Acquisition Cost

```python
def calculate_ltv_cac_ratio(customer_ltv, acquisition_costs):
    """Calculate LTV:CAC ratio for decision making"""
    # Merge acquisition costs
    customer_analysis = customer_ltv.merge(
        acquisition_costs[['customer_id', 'cac']],
        on='customer_id',
        how='left'
    )
    
    # Calculate ratios
    customer_analysis['ltv_cac_ratio'] = (
        customer_analysis['ltv'] / customer_analysis['cac']
    )
    
    # Calculate payback period (months to recover CAC)
    customer_analysis['avg_monthly_margin'] = (
        customer_analysis['gross_margin'] / customer_analysis['lifetime_months']
    )
    customer_analysis['payback_period'] = (
        customer_analysis['cac'] / customer_analysis['avg_monthly_margin']
    )
    
    return customer_analysis
```

---

## 3.4 Segment-Level LTV Analysis

### Why Segment LTV Matters

**Key Insight:** Average LTV hides massive differences. Segment analysis reveals where value really comes from.

#### Segmenting by Acquisition Channel

```python
def analyze_ltv_by_channel(customer_ltv, acquisition_data):
    """Analyze LTV by acquisition channel"""
    # Merge acquisition channel
    ltv_by_channel = customer_ltv.merge(
        acquisition_data[['customer_id', 'channel']],
        on='customer_id',
        how='left'
    )
    
    # Calculate metrics by channel
    channel_analysis = ltv_by_channel.groupby('channel').agg({
        'ltv': ['mean', 'median', 'std', 'count'],
        'gross_margin': 'mean',
        'lifetime_months': 'mean',
        'transaction_count': 'mean'
    })
    
    # Calculate LTV:CAC by channel (if CAC data available)
    if 'cac' in ltv_by_channel.columns:
        channel_analysis['ltv_cac_ratio'] = (
            ltv_by_channel.groupby('channel')['ltv'].mean() /
            ltv_by_channel.groupby('channel')['cac'].mean()
        )
    
    return channel_analysis.sort_values(('ltv', 'mean'), ascending=False)
```

#### Segmenting by Product Tier

```python
def analyze_ltv_by_tier(customer_ltv, product_data):
    """Analyze LTV by product tier"""
    # Merge product tier
    ltv_by_tier = customer_ltv.merge(
        product_data[['customer_id', 'tier', 'monthly_price']],
        on='customer_id',
        how='left'
    )
    
    # Calculate metrics by tier
    tier_analysis = ltv_by_tier.groupby('tier').agg({
        'ltv': ['mean', 'median', 'std'],
        'gross_margin': 'mean',
        'lifetime_months': 'mean',
        'monthly_price': 'mean'
    })
    
    # Calculate LTV per dollar of price
    tier_analysis['ltv_per_price'] = (
        tier_analysis[('ltv', 'mean')] /
        tier_analysis[('monthly_price', 'mean')]
    )
    
    return tier_analysis.sort_values(('ltv', 'mean'), ascending=False)
```

#### Segmenting by Behavior

```python
def analyze_ltv_by_behavior(customer_ltv, behavior_data):
    """Analyze LTV by customer behavior patterns"""
    # Create behavior segments
    behavior_data['segment'] = behavior_data.apply(
        lambda row: classify_behavior_segment(row),
        axis=1
    )
    
    # Merge
    ltv_by_behavior = customer_ltv.merge(
        behavior_data[['customer_id', 'segment']],
        on='customer_id',
        how='left'
    )
    
    # Calculate metrics by segment
    segment_analysis = ltv_by_behavior.groupby('segment').agg({
        'ltv': ['mean', 'median', 'std', 'count'],
        'gross_margin': 'mean',
        'lifetime_months': 'mean'
    })
    
    return segment_analysis.sort_values(('ltv', 'mean'), ascending=False)

def classify_behavior_segment(row):
    """Classify customer into behavior segment"""
    if row['purchase_frequency'] > 4 and row['avg_order_value'] > 100:
        return 'high_value_high_frequency'
    elif row['purchase_frequency'] > 4:
        return 'high_frequency_low_value'
    elif row['avg_order_value'] > 100:
        return 'low_frequency_high_value'
    else:
        return 'low_value_low_frequency'
```

#### Pareto Analysis (80/20 Rule)

```python
def pareto_ltv_analysis(customer_ltv):
    """Identify top customers driving LTV (Pareto analysis)"""
    # Sort by LTV
    customer_ltv_sorted = customer_ltv.sort_values('ltv', ascending=False)
    
    # Calculate cumulative
    customer_ltv_sorted['cumulative_ltv'] = customer_ltv_sorted['ltv'].cumsum()
    customer_ltv_sorted['cumulative_pct'] = (
        customer_ltv_sorted['cumulative_ltv'] /
        customer_ltv_sorted['ltv'].sum() * 100
    )
    customer_ltv_sorted['customer_pct'] = (
        (customer_ltv_sorted.index + 1) /
        len(customer_ltv_sorted) * 100
    )
    
    # Find 80/20 point
    pareto_point = customer_ltv_sorted[
        customer_ltv_sorted['cumulative_pct'] >= 80
    ].iloc[0]
    
    return {
        'top_20_pct_customers': pareto_point['customer_pct'],
        'top_20_pct_ltv': pareto_point['cumulative_pct'],
        'top_customers': customer_ltv_sorted.head(int(len(customer_ltv_sorted) * 0.2))
    }
```

---

## 3.5 Using LTV for Budget and Strategy Decisions

### LTV-Based Budget Allocation

```python
def allocate_budget_by_ltv(channel_ltv_analysis, total_budget):
    """Allocate marketing budget based on LTV performance"""
    # Calculate efficiency score (LTV:CAC ratio)
    channel_ltv_analysis['efficiency_score'] = (
        channel_ltv_analysis['ltv_cac_ratio'] /
        channel_ltv_analysis['ltv_cac_ratio'].sum()
    )
    
    # Allocate budget proportionally to efficiency
    channel_ltv_analysis['allocated_budget'] = (
        total_budget * channel_ltv_analysis['efficiency_score']
    )
    
    # Calculate expected customers and revenue
    channel_ltv_analysis['expected_customers'] = (
        channel_ltv_analysis['allocated_budget'] /
        channel_ltv_analysis['cac']
    )
    
    channel_ltv_analysis['expected_revenue'] = (
        channel_ltv_analysis['expected_customers'] *
        channel_ltv_analysis['ltv']
    )
    
    return channel_ltv_analysis.sort_values('expected_revenue', ascending=False)
```

### LTV-Based Product Prioritization

```python
def prioritize_features_by_ltv(feature_usage_data, customer_ltv):
    """Prioritize features based on LTV impact"""
    # Merge feature usage with LTV
    feature_ltv = feature_usage_data.merge(
        customer_ltv[['customer_id', 'ltv']],
        on='customer_id',
        how='left'
    )
    
    # Calculate LTV by feature usage
    feature_analysis = feature_ltv.groupby('feature_name').agg({
        'ltv': ['mean', 'count'],
        'usage_frequency': 'mean'
    })
    
    # Calculate lift (LTV of users vs non-users)
    feature_lift = []
    for feature in feature_analysis.index:
        users_with_feature = feature_ltv[feature_ltv['feature_name'] == feature]['ltv'].mean()
        users_without_feature = feature_ltv[feature_ltv['feature_name'] != feature]['ltv'].mean()
        
        lift = (users_with_feature / users_without_feature - 1) * 100
        
        feature_lift.append({
            'feature': feature,
            'ltv_lift_pct': lift,
            'users_count': feature_analysis.loc[feature, ('ltv', 'count')]
        })
    
    return pd.DataFrame(feature_lift).sort_values('ltv_lift_pct', ascending=False)
```

### LTV-Based Pricing Strategy

```python
def optimize_pricing_by_ltv(price_test_data, customer_ltv):
    """Optimize pricing based on LTV impact"""
    # Merge price test results with LTV
    price_ltv = price_test_data.merge(
        customer_ltv[['customer_id', 'ltv']],
        on='customer_id',
        how='left'
    )
    
    # Calculate metrics by price point
    price_analysis = price_ltv.groupby('price_tier').agg({
        'ltv': 'mean',
        'conversion_rate': 'mean',
        'customer_id': 'count'
    })
    
    # Calculate total value (LTV × Conversion Rate × Volume)
    price_analysis['total_value'] = (
        price_analysis['ltv'] *
        price_analysis['conversion_rate'] *
        price_analysis['customer_id']
    )
    
    # Find optimal price point
    optimal_price = price_analysis['total_value'].idxmax()
    
    return {
        'optimal_price': optimal_price,
        'expected_ltv': price_analysis.loc[optimal_price, 'ltv'],
        'expected_conversion': price_analysis.loc[optimal_price, 'conversion_rate'],
        'analysis': price_analysis
    }
```

---

## Lab 3: LTV Modeling

### Objective
Build a predictive LTV model and evaluate its stability.

### Dataset
You'll be provided with:
- Customer transaction history
- Customer acquisition data (channel, date, CAC)
- Customer behavior data (features used, engagement)
- Product data (tier, pricing)

### Tasks

1. **Calculate Historical LTV**
   - Calculate LTV for churned customers
   - Include all relevant costs
   - Calculate contribution margins

2. **Segment Analysis**
   - Analyze LTV by acquisition channel
   - Analyze LTV by product tier
   - Identify high-value segments

3. **Build Predictive Models**
   - Build cohort-based LTV model
   - Build ML-based LTV model
   - Build probabilistic LTV model (BG/NBD)

4. **Model Evaluation**
   - Compare model accuracy
   - Evaluate model stability over time
   - Test on holdout data

5. **Business Application**
   - Use LTV for budget allocation
   - Use LTV for product prioritization
   - Use LTV for pricing decisions

### Deliverables

1. **LTV Analysis Report**
   - Historical LTV analysis
   - Segment comparisons
   - Predictive model results
   - Business recommendations
   - Budget allocation plan

2. **Code Repository**
   - LTV calculation functions
   - Predictive modeling code
   - Evaluation scripts
   - Clean, documented code

### Evaluation Criteria

- **Model Quality (40%):** Accurate predictions, proper methodology
- **Analysis Quality (30%):** Meaningful insights, correct calculations
- **Code Quality (20%):** Clean, reusable, well-documented
- **Business Application (10%):** Actionable recommendations

### Expected Output

An LTV framework that:
- Accurately predicts customer lifetime value
- Identifies high-value customer segments
- Informs acquisition budget allocation
- Guides product and pricing decisions
- Quantifies expected revenue impact

---

## Summary

**Key Takeaways:**

1. **LTV is Fundamental:** Drives acquisition, product, and pricing decisions
2. **Predictive > Historical:** Need to predict LTV for active customers
3. **Include Costs:** Gross margin LTV is what matters for decisions
4. **Segment Analysis Reveals Value:** Average LTV hides massive differences
5. **Use LTV for Decisions:** Budget allocation, product prioritization, pricing

**Next Steps:**
- Module 4: Learn marketing mix modeling (MMM)
- Understand how to measure marketing effectiveness
- Allocate spend based on incrementality

---

## Additional Resources

### Reading
- "Lean Analytics" by Alistair Croll and Benjamin Yoskovitz
- "The Lean Startup" by Eric Ries
- Lifetimes library documentation (probabilistic LTV models)

### Tools
- Python: pandas, scikit-learn, lifetimes
- R: BTYD package (Buy 'Til You Die models)

---

**Ready for Module 4? [Continue →](Module_04_Marketing_Mix_Modeling_MMM.md)**
