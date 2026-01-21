---
title: "Module 3: Feature Engineering at Scale"
description: "From notebook features to production features"
module: "3"
order: 3
---

# Module 3: Feature Engineering at Scale

**Duration:** Week 3  
**Theme:** *From notebook features to production features*

**Learning Objectives:**
- **Engineer Time-Aware**: Engineer time-aware features correctly
- **rolling windows, decay functions, and recency features Development**: Build rolling windows, decay functions, and recency features
- **aggregations across users, products, and events Development**: Create aggregations across users, products, and events
- **offline vs online features Understanding**: Understand offline vs online features
- **scalable feature Development**: Design scalable feature pipelines

---

## 3.1 Time-Aware Feature Engineering

### The Temporal Challenge

**Problem:** Features must be calculated as they would be at prediction time, not using future information.

**Solution:** Always calculate features with a temporal cutoff.

### Time-Window Features

#### Rolling Window Aggregates

**Definition:** Calculate statistics over a fixed time window ending at prediction time.

**Example: Purchases in Last 30 Days**
```python
def purchases_last_30_days(customer_id, prediction_date):
    window_start = prediction_date - timedelta(days=30)
    purchases = get_purchases(
        customer_id,
        start_date=window_start,
        end_date=prediction_date  # Not including prediction_date
    )
    return len(purchases)
```

**Common Windows:**
- Last 7 days (recent behavior)
- Last 30 days (short-term patterns)
- Last 90 days (medium-term trends)
- Last 365 days (long-term behavior)

**Best Practice:** Use multiple windows to capture different time scales.

```python
features = {
    'purchases_last_7_days': purchases_last_n_days(customer, date, 7),
    'purchases_last_30_days': purchases_last_n_days(customer, date, 30),
    'purchases_last_90_days': purchases_last_n_days(customer, date, 90),
    'purchases_last_365_days': purchases_last_n_days(customer, date, 365)
}
```

#### Expanding Window Aggregates

**Definition:** Calculate statistics from a fixed start date to prediction time.

**Example: Lifetime Value**
```python
def lifetime_value(customer_id, prediction_date):
    signup_date = get_signup_date(customer_id)
    purchases = get_purchases(
        customer_id,
        start_date=signup_date,
        end_date=prediction_date
    )
    return sum(p.purchase_amount for p in purchases)
```

**Use Cases:**
- Lifetime aggregates (total purchases, total spend)
- Since-first-event (days since first purchase)
- Cumulative metrics

### Time-Based Features

#### Recency Features

**Definition:** Time since last occurrence of an event.

**Examples:**
```python
def days_since_last_purchase(customer_id, prediction_date):
    last_purchase = get_last_purchase(customer_id, before_date=prediction_date)
    if last_purchase:
        return (prediction_date - last_purchase.date).days
    else:
        return None  # or a large number for "never"

features = {
    'days_since_last_purchase': days_since_last_purchase(customer, date),
    'days_since_last_login': days_since_last_login(customer, date),
    'days_since_last_support_ticket': days_since_last_support_ticket(customer, date)
}
```

**Best Practice:** Handle "never" cases explicitly.

```python
def days_since_last_purchase(customer_id, prediction_date):
    last_purchase = get_last_purchase(customer_id, before_date=prediction_date)
    if last_purchase:
        return (prediction_date - last_purchase.date).days
    else:
        return 999  # Large number for "never purchased"
        # Or use a separate boolean: 'has_ever_purchased'
```

#### Time Since First Event

**Definition:** Time between first occurrence and prediction time.

**Examples:**
```python
def days_since_signup(customer_id, prediction_date):
    signup_date = get_signup_date(customer_id)
    return (prediction_date - signup_date).days

def days_since_first_purchase(customer_id, prediction_date):
    first_purchase = get_first_purchase(customer_id, before_date=prediction_date)
    if first_purchase:
        return (prediction_date - first_purchase.date).days
    else:
        return None
```

---

## 3.2 Rolling Windows, Decay Functions, and Recency

### Rolling Windows: Multiple Time Scales

**Strategy:** Capture behavior at different time scales.

```python
def rolling_window_features(customer_id, prediction_date):
    return {
        # Short-term (recent behavior)
        'purchases_last_7_days': count_purchases(customer, prediction_date, days=7),
        'spend_last_7_days': sum_spend(customer, prediction_date, days=7),
        
        # Medium-term (trends)
        'purchases_last_30_days': count_purchases(customer, prediction_date, days=30),
        'spend_last_30_days': sum_spend(customer, prediction_date, days=30),
        
        # Long-term (patterns)
        'purchases_last_90_days': count_purchases(customer, prediction_date, days=90),
        'spend_last_90_days': sum_spend(customer, prediction_date, days=90),
        
        # Ratios (trends)
        'spend_last_7_vs_30': spend_last_7_days / spend_last_30_days,
        'purchases_last_7_vs_30': purchases_last_7_days / purchases_last_30_days
    }
```

### Decay Functions: Weighting Recent Events More

**Concept:** Recent events matter more than distant events.

#### Exponential Decay

**Formula:** `weight = exp(-λ * days_ago)`

```python
def exponential_decay_weight(days_ago, decay_rate=0.1):
    """
    decay_rate: Controls how quickly weight decreases
    Higher decay_rate = faster decay (recent events matter more)
    """
    return np.exp(-decay_rate * days_ago)

def weighted_spend_last_30_days(customer_id, prediction_date, decay_rate=0.1):
    purchases = get_purchases(customer_id, prediction_date, days=30)
    total = 0
    for purchase in purchases:
        days_ago = (prediction_date - purchase.date).days
        weight = exponential_decay_weight(days_ago, decay_rate)
        total += purchase.amount * weight
    return total
```

**Use Cases:**
- Recent behavior is more predictive
- Want to emphasize recent trends
- Smooth out noise from distant events

#### Linear Decay

**Formula:** `weight = max(0, 1 - days_ago / window_size)`

```python
def linear_decay_weight(days_ago, window_size=30):
    return max(0, 1 - days_ago / window_size)

def weighted_purchases_last_30_days(customer_id, prediction_date):
    purchases = get_purchases(customer_id, prediction_date, days=30)
    total = 0
    for purchase in purchases:
        days_ago = (prediction_date - purchase.date).days
        weight = linear_decay_weight(days_ago, window_size=30)
        total += weight
    return total
```

### Recency Features: How Recent Is Recent?

**Strategy:** Combine recency with frequency.

```python
def recency_features(customer_id, prediction_date):
    last_purchase = get_last_purchase(customer_id, before_date=prediction_date)
    
    features = {
        # Absolute recency
        'days_since_last_purchase': (
            (prediction_date - last_purchase.date).days 
            if last_purchase else 999
        ),
        
        # Recency relative to frequency
        'avg_days_between_purchases': calculate_avg_interval(customer_id, prediction_date),
        'days_since_last_vs_avg': (
            days_since_last_purchase / avg_days_between_purchases
            if avg_days_between_purchases > 0 else None
        ),
        
        # Recency categories
        'is_recent_customer': days_since_last_purchase <= 7,
        'is_active_customer': days_since_last_purchase <= 30,
        'is_at_risk': days_since_last_purchase > 90
    }
    
    return features
```

---

## 3.3 Aggregations Across Users, Products, and Events

### User-Level Aggregates

**Definition:** Summarize behavior for a specific user.

```python
def user_aggregates(customer_id, prediction_date):
    return {
        # Frequency
        'total_purchases': count_purchases(customer_id, prediction_date, days=365),
        'purchases_last_30_days': count_purchases(customer_id, prediction_date, days=30),
        
        # Monetary
        'lifetime_value': sum_spend(customer_id, prediction_date, days=365),
        'avg_purchase_amount': calculate_avg_purchase(customer_id, prediction_date),
        'max_purchase_amount': calculate_max_purchase(customer_id, prediction_date),
        
        # Diversity
        'unique_categories_purchased': count_unique_categories(customer_id, prediction_date),
        'unique_products_purchased': count_unique_products(customer_id, prediction_date),
        
        # Patterns
        'avg_days_between_purchases': calculate_avg_interval(customer_id, prediction_date),
        'preferred_day_of_week': get_most_common_day(customer_id, prediction_date)
    }
```

### Product/Category Aggregates

**Definition:** Summarize behavior for products or categories.

```python
def product_aggregates(customer_id, prediction_date):
    return {
        # Category-level
        'purchases_in_electronics': count_by_category(customer_id, 'electronics', prediction_date),
        'spend_in_electronics': sum_by_category(customer_id, 'electronics', prediction_date),
        
        # Product-level
        'purchases_of_product_123': count_by_product(customer_id, 'product_123', prediction_date),
        
        # Relative to category
        'spend_vs_category_avg': (
            customer_spend_in_category / category_avg_spend
        ),
        'purchases_vs_category_avg': (
            customer_purchases_in_category / category_avg_purchases
        )
    }
```

### Event Aggregates

**Definition:** Summarize specific event types.

```python
def event_aggregates(customer_id, prediction_date):
    return {
        # Support events
        'support_tickets_last_30_days': count_events(customer_id, 'support_ticket', prediction_date, days=30),
        'refunds_last_90_days': count_events(customer_id, 'refund', prediction_date, days=90),
        
        # Engagement events
        'logins_last_7_days': count_events(customer_id, 'login', prediction_date, days=7),
        'page_views_last_30_days': count_events(customer_id, 'page_view', prediction_date, days=30),
        
        # Conversion events
        'cart_abandonments_last_30_days': count_events(customer_id, 'cart_abandon', prediction_date, days=30),
        'wishlist_adds_last_30_days': count_events(customer_id, 'wishlist_add', prediction_date, days=30)
    }
```

### Cross-Dimensional Aggregates

**Definition:** Combine multiple dimensions.

```python
def cross_dimensional_aggregates(customer_id, prediction_date):
    return {
        # User × Category × Time
        'electronics_purchases_last_30_days': count_by_category_and_time(
            customer_id, 'electronics', prediction_date, days=30
        ),
        
        # User × Product × Recency
        'recent_purchases_of_top_product': count_recent_purchases_of_favorite_product(
            customer_id, prediction_date
        ),
        
        # User × Time × Behavior
        'weekend_purchases_last_month': count_weekend_purchases(
            customer_id, prediction_date, days=30
        )
    }
```

---

## 3.4 Offline vs Online Features

### Offline Features: Pre-Computed

**Definition:** Features calculated in batch, ahead of time.

**Characteristics:**
- Computed periodically (daily, weekly)
- Stored in feature store or database
- Fast to retrieve at prediction time
- May be slightly stale

**Example:**
```python
# Batch job runs daily at 2 AM
def compute_offline_features(date):
    for customer in all_customers:
        features = {
            'purchases_last_30_days': count_purchases(customer, date, days=30),
            'lifetime_value': calculate_lifetime_value(customer, date),
            # ... other features
        }
        save_features(customer.id, date, features)

# At prediction time (fast)
def get_features_offline(customer_id, prediction_date):
    return load_features(customer_id, prediction_date)
```

**Use Cases:**
- Historical aggregates
- Expensive computations
- Features that don't change frequently
- Batch prediction systems

### Online Features: Real-Time

**Definition:** Features calculated at prediction time.

**Characteristics:**
- Computed on-demand
- Always up-to-date
- May be slower
- Requires real-time data access

**Example:**
```python
# At prediction time (slower, but current)
def get_features_online(customer_id, prediction_date):
    return {
        'purchases_last_30_days': count_purchases_realtime(customer_id, prediction_date, days=30),
        'current_cart_value': get_current_cart_value(customer_id),  # Real-time
        'minutes_since_last_activity': get_minutes_since_last_activity(customer_id)  # Real-time
    }
```

**Use Cases:**
- Real-time predictions
- Features that change frequently
- Context-dependent features
- Low-latency requirements

### Hybrid Approach: Best of Both

**Strategy:** Combine offline and online features.

```python
def get_features_hybrid(customer_id, prediction_date):
    # Fast: Load pre-computed features
    offline_features = get_features_offline(customer_id, prediction_date)
    
    # Slower: Compute real-time features
    online_features = {
        'current_cart_value': get_current_cart_value(customer_id),
        'minutes_since_last_activity': get_minutes_since_last_activity(customer_id)
    }
    
    # Combine
    return {**offline_features, **online_features}
```

---

## 3.5 Introduction to Feature Stores (Conceptual)

### What Is a Feature Store?

**Definition:** A system for storing, managing, and serving features for ML models.

**Key Components:**
1. **Feature Storage:** Where features are stored
2. **Feature Computation:** How features are calculated
3. **Feature Serving:** How features are retrieved
4. **Feature Versioning:** Tracking feature changes

### Benefits

**Consistency:**
- Same features for training and inference
- Reduces training-serving skew

**Reusability:**
- Features shared across models
- Reduces duplicate computation

**Efficiency:**
- Pre-computed features
- Fast feature retrieval

**Governance:**
- Feature documentation
- Version tracking
- Access control

### Conceptual Architecture

```
┌─────────────────┐
│  Data Sources   │
│  (DB, Events)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Feature Compute │
│   (Batch/Stream)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Feature Store   │
│  (Storage)      │
└────────┬────────┘
         │
         ├──────────────┐
         ▼              ▼
┌──────────────┐  ┌──────────────┐
│   Training   │  │   Inference  │
│   Pipeline   │  │   Service    │
└──────────────┘  └──────────────┘
```

### Popular Feature Stores

**Open Source:**
- **Feast:** Feature store for ML
- **Hopsworks:** Feature store platform
- **Tecton:** Enterprise feature store (commercial)

**Cloud:**
- **AWS SageMaker Feature Store**
- **GCP Vertex AI Feature Store**
- **Azure ML Feature Store**

### When to Use a Feature Store

**Use When:**
- Multiple models sharing features
- Need for feature consistency
- Complex feature pipelines
- Production ML systems

**Don't Use When:**
- Single model, simple features
- Prototyping phase
- Small team, simple use case

---

## Lab 3: Build Time-Based Features for Churn, Demand, and LTV

### Objective
Build scalable feature engineering pipelines for three prediction problems.

### Tasks

1. **Churn Prediction Features**
   - Build time-window features (7, 30, 90 days)
   - Create recency features
   - Implement decay-weighted features
   - Aggregate user behavior features

2. **Demand Forecasting Features**
   - Build temporal features (day of week, month, seasonality)
   - Create lag features (previous day, week, month)
   - Implement rolling statistics
   - Aggregate product-level features

3. **LTV Prediction Features**
   - Build lifetime aggregates
   - Create growth rate features
   - Implement cohort-based features
   - Aggregate spending patterns

4. **Feature Pipeline**
   - Design reusable feature calculation functions
   - Implement temporal constraints
   - Create feature documentation
   - Test for leakage

### Deliverables

1. **Feature Engineering Code** including:
   - Reusable feature calculation functions
   - Time-aware feature implementations
   - Aggregation functions
   - Feature pipeline structure

2. **Feature Documentation** including:
   - Feature definitions
   - Calculation logic
   - Temporal constraints
   - Usage examples

3. **Feature Validation Report** including:
   - Leakage checks
   - Temporal alignment validation
   - Feature distribution analysis
   - Performance benchmarks

### Evaluation Criteria

- Feature engineering quality (35%)
- Temporal correctness (30%)
- Code reusability (20%)
- Documentation clarity (15%)

---

## Summary

**Key Takeaways:**

- **Time-Aware Engineering:**: Always use temporal cutoffs
- **Multiple Windows:**: Capture behavior at different time scales
- **Decay Functions:**: Weight recent events more heavily
- **Aggregations:**: Summarize across users, products, events
- **Offline vs Online:**: Balance freshness and performance
- **Feature Stores:**: Centralize feature management for production

**Next Steps:**
- **Module 4:**: Module 4: Choose and train predictive models
- **model selection strategies Understanding**: Learn model selection strategies
- **benchmark models Development**: Build benchmark models

---

## Additional Resources

### Reading
- "Feature Engineering for Machine Learning" by Alice Zheng and Amanda Casari
- "Designing Machine Learning Systems" by Chip Huyen (Chapter 3: Data Management)
- Feast Documentation: Feature Store concepts

### Tools
- pandas: Time-based feature engineering
- Feature-engine: Feature engineering library
- Feast: Feature store framework

---

**Ready for Module 4? [Continue →](Module_04_Predictive_Modeling_Patterns.md)**
