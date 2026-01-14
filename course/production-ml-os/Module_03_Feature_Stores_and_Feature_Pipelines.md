---
title: "Module 3: Feature Stores & Feature Pipelines"
description: "Ensuring consistency between training and inference"
module: "Module 3"
week: 3
order: 3
email_takeaway: "Training-serving skew is the #1 cause of production ML failures—feature stores prevent this by ensuring consistency."
email_action: "Build a time-aware feature pipeline and design a feature store schema for your use case."
---

# Module 3: Feature Stores & Feature Pipelines

**Theme:** *Consistency between training and inference*

**Duration:** Week 3  
**Learning Objectives:**
- Understand feature pipelines vs feature stores
- Prevent training-serving skew
- Implement time-aware feature computation
- Design feature store schemas

---

## 3.1 Feature Pipelines vs Feature Stores

### Feature Pipelines

**Definition:** Code that transforms raw data into features used by ML models.

**Characteristics:**
- ETL/ELT processes
- Scheduled or event-driven
- Compute features from source data
- Store results in databases/caches

**Example:**
```python
# Feature pipeline
def compute_user_features(user_id):
    raw_data = get_user_data(user_id)
    features = {
        "days_since_signup": (now() - raw_data.signup_date).days,
        "total_orders": count_orders(user_id),
        "avg_order_value": compute_avg_order_value(user_id),
        "last_purchase_days_ago": days_since_last_purchase(user_id)
    }
    return features
```

### Feature Stores

**Definition:** Centralized storage and serving layer for features, ensuring consistency between training and inference.

**Characteristics:**
- Store pre-computed features
- Serve features to training and inference
- Version features
- Enable point-in-time lookups
- Provide online and offline access

**Example:**
```python
# Feature store usage
# Training
features = feature_store.get_features(
    entity_ids=user_ids,
    feature_names=["days_since_signup", "total_orders"],
    point_in_time=training_date
)

# Inference
features = feature_store.get_features(
    entity_ids=[user_id],
    feature_names=["days_since_signup", "total_orders"],
    point_in_time=now()
)
```

### Key Differences

| Aspect | Feature Pipeline | Feature Store |
|--------|------------------|---------------|
| Purpose | Compute features | Store and serve features |
| When | Scheduled/triggered | On-demand |
| Consistency | Manual enforcement | Built-in guarantees |
| Reuse | Code duplication | Centralized |
| Versioning | Manual | Automatic |

### Why Both Matter

**Feature Pipelines:**
- Transform raw data → features
- Handle data quality
- Manage compute resources
- Schedule and orchestrate

**Feature Stores:**
- Ensure training-serving consistency
- Enable feature reuse
- Provide point-in-time correctness
- Serve features at scale

---

## 3.2 Offline vs Online Feature Consistency

### The Consistency Problem

**Training:** Features computed at training time
**Inference:** Features computed at prediction time

**Problem:** If features are computed differently, model performance degrades.

### Offline Features (Training)

**Characteristics:**
- Computed for historical data
- Batch processing
- Point-in-time correctness required
- Used for model training

**Example:**
```python
# Training: Compute features as of 2024-01-01
training_features = compute_features(
    user_ids=training_users,
    as_of_date="2024-01-01"
)
```

### Online Features (Inference)

**Characteristics:**
- Computed for real-time requests
- Low-latency requirements
- Current point in time
- Used for predictions

**Example:**
```python
# Inference: Compute features for now
inference_features = compute_features(
    user_ids=[current_user_id],
    as_of_date=now()
)
```

### Ensuring Consistency

**1. Same Code, Different Data**
```python
# Shared feature computation
def compute_user_features(user_id, as_of_date):
    # Same logic for training and inference
    return features

# Training
features = compute_user_features(user_id, training_date)

# Inference
features = compute_user_features(user_id, now())
```

**2. Feature Store**
- Store features computed by pipelines
- Serve same features to training and inference
- Ensure point-in-time correctness

**3. Validation**
- Compare offline vs online feature distributions
- Monitor feature drift
- Alert on inconsistencies

---

## 3.3 Time Travel & Point-in-Time Correctness

### The Problem

**Scenario:** Training a model on historical data requires features as they existed at that point in time, not as they exist now.

**Example:**
- Training on 2024-01-01 data
- User had 5 orders on 2024-01-01
- User now has 10 orders (2024-12-01)
- Using current order count (10) would be incorrect

### Point-in-Time Correctness

**Definition:** Features reflect the state of the world at a specific point in time.

**Requirements:**
- Store feature values with timestamps
- Enable historical lookups
- Handle feature updates correctly

### Implementation Patterns

**1. Temporal Feature Store**
```python
# Store features with timestamps
feature_store.write(
    entity_id="user_123",
    features={"total_orders": 5},
    timestamp="2024-01-01"
)

feature_store.write(
    entity_id="user_123",
    features={"total_orders": 10},
    timestamp="2024-12-01"
)

# Retrieve features as of specific time
features = feature_store.get(
    entity_id="user_123",
    as_of="2024-01-01"  # Returns total_orders: 5
)
```

**2. Event Sourcing**
- Store all feature changes as events
- Replay events to reconstruct state at any time
- Enables perfect point-in-time correctness

**3. Snapshot + Delta**
- Periodic snapshots of feature state
- Store deltas between snapshots
- Reconstruct state by applying deltas

---

## 3.4 Feature Freshness and Backfills

### Feature Freshness

**Definition:** How up-to-date features are relative to the current time.

**Freshness Requirements:**

| Use Case | Freshness | Update Frequency |
|----------|-----------|------------------|
| Real-time fraud | Seconds | Continuous |
| Recommendations | Minutes | Every 5-10 min |
| Churn prediction | Hours | Daily |
| Credit scoring | Days | Weekly |

### Managing Freshness

**1. Real-Time Updates**
```python
# Update features on events
def on_user_action(event):
    update_feature(
        entity_id=event.user_id,
        feature="last_activity",
        value=event.timestamp
    )
```

**2. Scheduled Refreshes**
```python
# Periodic batch updates
@schedule(hourly="*/5")
def refresh_features():
    update_stale_features(max_age_minutes=10)
```

**3. TTL-Based Expiration**
```python
# Features expire after TTL
feature_store.get(
    entity_id=user_id,
    max_age_seconds=300  # 5 minutes
)
```

### Backfills

**Definition:** Recomputing features for historical periods.

**When Needed:**
- Fixing bugs in feature computation
- Adding new features to historical data
- Correcting data quality issues

**Pattern:**
```python
def backfill_features(start_date, end_date):
    for date in date_range(start_date, end_date):
        features = compute_features(as_of_date=date)
        feature_store.write(features, timestamp=date)
```

---

## 3.5 Ownership, Reuse, and Governance

### Feature Ownership

**Principle:** Each feature has a clear owner responsible for:
- Feature definition
- Data quality
- Documentation
- Deprecation

**Ownership Model:**
- **Data Team:** Raw data features
- **ML Team:** Derived features
- **Domain Teams:** Business-specific features

### Feature Reuse

**Benefits:**
- Reduce duplication
- Ensure consistency
- Faster model development
- Lower maintenance cost

**Pattern:**
```python
# Reusable feature definitions
class UserFeatures:
    @feature
    def total_orders(user_id):
        return count_orders(user_id)
    
    @feature
    def avg_order_value(user_id):
        return compute_avg(user_id)

# Used by multiple models
churn_model_features = [
    UserFeatures.total_orders,
    UserFeatures.avg_order_value
]

recommendation_model_features = [
    UserFeatures.total_orders,
    UserFeatures.avg_order_value
]
```

### Feature Governance

**1. Documentation**
- Feature description
- Data sources
- Computation logic
- Usage examples

**2. Versioning**
- Version feature definitions
- Track changes
- Enable rollback

**3. Testing**
- Unit tests for feature computation
- Integration tests for pipelines
- Validation tests for data quality

**4. Monitoring**
- Feature freshness
- Data quality metrics
- Usage statistics
- Performance metrics

---

## Hands-On Exercise: Build a Time-Aware Feature Pipeline

### Exercise: Design Feature Store Schema

**Scenario:** E-commerce recommendation system

**Entities:**
- User
- Product
- Order

**Features Needed:**
- User: total_orders, avg_order_value, days_since_last_purchase
- Product: total_sales, avg_rating, days_since_launch
- User-Product: purchase_count, last_purchase_date

**Tasks:**

1. **Design Feature Store Schema**
   - Entity definitions
   - Feature definitions
   - Timestamp handling
   - Indexing strategy

2. **Implement Feature Pipeline**
   - Compute features from raw data
   - Handle point-in-time correctness
   - Update features on events

3. **Build Feature Serving API**
   - Online feature retrieval
   - Offline feature retrieval
   - Batch feature retrieval

**Deliverable:** 
- Feature store schema design
- Feature pipeline implementation
- Feature serving API

---

## Module Summary

### Key Takeaways

1. **Feature pipelines compute, feature stores serve** - Both are needed for production ML
2. **Consistency is critical** - Training-serving skew causes failures
3. **Point-in-time correctness matters** - Historical features must reflect past state
4. **Governance enables scale** - Ownership, reuse, and documentation are essential

### Next Steps

- Complete the feature store design exercise
- Review feature store implementations (Feast, Tecton, etc.)
- Move to Module 4 to learn about latency and scalability

---

## Exercises

1. **Feature Pipeline Design:** Design a feature pipeline for:
   - Real-time fraud detection (features update on events)
   - Batch churn prediction (daily feature computation)
   - Hybrid recommendation system (batch + real-time)

2. **Feature Store Schema:** Design schemas for:
   - User features (demographics, behavior)
   - Product features (inventory, sales)
   - Transaction features (amount, frequency)

3. **Consistency Validation:** Design tests to ensure:
   - Offline and online features match
   - Point-in-time correctness
   - Feature freshness requirements
