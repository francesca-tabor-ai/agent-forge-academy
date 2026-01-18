---
title: "Module 7: Productionization & Feedback Loops"
description: "Keeping models alive"
module: "7"
order: 7
---

# Module 7: Productionization & Feedback Loops

**Duration:** Week 7  
**Theme:** *Keeping models alive*

**Learning Objectives:**
- **batch vs real-time prediction Understanding**: Understand batch vs real-time prediction
- **Monitor Model**: Monitor model performance and drift
- **retraining strategies Development**: Apply design retraining strategies in relevant contexts
- **data quality checks Implementation**: Implement data quality checks
- **Collaborate Effectively**: Collaborate effectively with ML Engineers

---

## 7.1 Batch vs Real-Time Prediction

### Batch Prediction: Scheduled Processing

**Definition:** Predictions computed in batches at scheduled intervals.

**Characteristics:**
- Runs periodically (daily, weekly, hourly)
- Processes many examples at once
- Can use more complex models
- Lower infrastructure costs

**Example: Daily Churn Predictions**
```python
# Scheduled job runs daily at 2 AM
def daily_churn_batch_prediction():
    # Get all active customers
    customers = get_all_active_customers()
    
    # Get features (pre-computed offline)
    features = load_features_from_store(customers)
    
    # Batch prediction
    churn_probabilities = model.predict_proba(features)
    
    # Store predictions
    save_predictions(customers, churn_probabilities, date=today())
    
    # Trigger actions for high-risk customers
    high_risk = customers[churn_probabilities >= 0.3]
    trigger_retention_campaigns(high_risk)
```

**When to Use:**
- Predictions don't need to be instant
- Can pre-compute features
- Cost efficiency matters
- Predictions are used for planning, not real-time actions

**Use Cases:**
- Daily churn predictions
- Weekly demand forecasts
- Monthly LTV updates
- Batch scoring for campaigns

### Real-Time Prediction: On-Demand

**Definition:** Predictions computed immediately when requested.

**Characteristics:**
- Low latency (< 100ms typical)
- Processes one or few examples
- Requires fast, simple models
- Higher infrastructure costs

**Example: Real-Time Recommendation**
```python
# API endpoint for real-time prediction
@app.route('/predict', methods=['POST'])
def real_time_prediction():
    customer_id = request.json['customer_id']
    
    # Get features (may need real-time computation)
    features = get_features_realtime(customer_id)
    
    # Fast prediction
    churn_probability = model.predict_proba([features])[0][1]
    
    # Return immediately
    return jsonify({
        'churn_probability': churn_probability,
        'recommendation': 'target' if churn_probability >= 0.3 else 'no_action'
    })
```

**When to Use:**
- Predictions needed immediately
- User-facing applications
- Real-time decision making
- Interactive systems

**Use Cases:**
- Real-time recommendations
- Fraud detection
- Dynamic pricing
- Live chat routing

### Hybrid Approach: Best of Both

**Strategy:** Use batch for bulk, real-time for exceptions.

```python
# Batch: Pre-compute predictions for all customers
daily_batch_predictions()

# Real-time: Handle edge cases or new customers
def get_prediction(customer_id):
    # Try to get from batch predictions
    batch_prediction = get_batch_prediction(customer_id)
    
    if batch_prediction and is_recent(batch_prediction):
        return batch_prediction
    else:
        # Fall back to real-time if not available or stale
        return real_time_prediction(customer_id)
```

---

## 7.2 Monitoring Model Performance & Drift

### What to Monitor

#### 1. Prediction Metrics

**Performance Over Time:**
```python
def monitor_performance_over_time(model, production_data):
    # Calculate metrics daily
    daily_metrics = []
    
    for date in date_range:
        data_for_date = production_data[production_data['date'] == date]
        
        # Get predictions and actuals
        predictions = model.predict(data_for_date['features'])
        actuals = data_for_date['target']
        
        metrics = {
            'date': date,
            'accuracy': accuracy_score(actuals, predictions),
            'precision': precision_score(actuals, predictions),
            'recall': recall_score(actuals, predictions),
            'f1': f1_score(actuals, predictions)
        }
        
        daily_metrics.append(metrics)
    
    # Alert if performance degrades
    recent_performance = np.mean([m['f1'] for m in daily_metrics[-7:]])
    baseline_performance = np.mean([m['f1'] for m in daily_metrics[:7]])
    
    if recent_performance < baseline_performance * 0.95:  # 5% degradation
        alert("Model performance degraded!")
```

#### 2. Prediction Distributions

**Monitor Prediction Score Distributions:**
```python
def monitor_prediction_distributions(predictions_by_date):
    # Compare distributions over time
    from scipy import stats
    
    baseline_dist = predictions_by_date['2024-01-01']
    recent_dist = predictions_by_date['2024-01-15']
    
    # Kolmogorov-Smirnov test
    statistic, p_value = stats.ks_2samp(baseline_dist, recent_dist)
    
    if p_value < 0.05:  # Significant change
        alert("Prediction distribution has shifted!")
```

#### 3. Data Drift

**Monitor Feature Distributions:**
```python
def monitor_data_drift(X_train, X_production):
    from evidently import DatasetDrift
    
    drift_report = DatasetDrift()
    drift_report.calculate(X_train, X_production)
    
    if drift_report.get_report()['dataset_drift']['drift_detected']:
        alert("Data drift detected!")
        
        # Identify drifted features
        drifted_features = drift_report.get_report()['drift_by_columns']
        for feature, drift_info in drifted_features.items():
            if drift_info['drift_detected']:
                alert(f"Feature {feature} has drifted")
```

#### 4. Concept Drift

**Monitor Target Distribution:**
```python
def monitor_concept_drift(y_train, y_production):
    # Compare target distributions
    train_positive_rate = (y_train == 1).mean()
    prod_positive_rate = (y_production == 1).mean()
    
    if abs(train_positive_rate - prod_positive_rate) > 0.1:  # 10% change
        alert("Concept drift detected: Target distribution changed!")
```

### Monitoring Dashboard

**Key Metrics to Display:**
1. **Performance Metrics:** Accuracy, precision, recall, F1 over time
2. **Prediction Statistics:** Mean, median, distribution of predictions
3. **Data Quality:** Missing values, outliers, feature distributions
4. **Drift Indicators:** Data drift, concept drift alerts
5. **Business Metrics:** ROI, cost, action rates

**Tools:**
- **MLflow:** Experiment tracking and monitoring
- **Weights & Biases:** Model monitoring
- **Evidently AI:** Data and model drift detection
- **Grafana:** Custom dashboards
- **Custom dashboards:** Built with Plotly, Streamlit

---

## 7.3 Retraining Strategies

### When to Retrain

**Triggers:**
1. **Scheduled:** Weekly, monthly, quarterly
2. **Performance degradation:** Metrics drop below threshold
3. **Data drift detected:** Feature distributions change
4. **Concept drift detected:** Target relationships change
5. **New data available:** Significant amount of new labeled data

### Retraining Strategies

#### Strategy 1: Full Retrain

**Approach:** Retrain on all available data.

```python
def full_retrain(model, all_data):
    # Use all historical data
    X_all = all_data['features']
    y_all = all_data['target']
    
    # Retrain from scratch
    new_model = train_model(X_all, y_all)
    
    return new_model
```

**When to Use:**
- Small datasets
- Relationships may have changed significantly
- Want to use all historical patterns

**Pros:**
- Uses all available information
- Can capture long-term patterns

**Cons:**
- Slow for large datasets
- May include outdated patterns

#### Strategy 2: Incremental Retrain

**Approach:** Retrain on recent data only.

```python
def incremental_retrain(model, recent_data, lookback_days=90):
    # Use only recent data
    cutoff_date = today() - timedelta(days=lookback_days)
    recent = recent_data[recent_data['date'] >= cutoff_date]
    
    X_recent = recent['features']
    y_recent = recent['target']
    
    # Retrain on recent data
    new_model = train_model(X_recent, y_recent)
    
    return new_model
```

**When to Use:**
- Recent patterns are more relevant
- Want to adapt quickly to changes
- Large datasets (faster)

**Pros:**
- Faster training
- Adapts to recent changes
- Less affected by outdated patterns

**Cons:**
- Loses long-term patterns
- May overfit to recent noise

#### Strategy 3: Weighted Retrain

**Approach:** Weight recent data more heavily.

```python
def weighted_retrain(model, all_data):
    # Calculate sample weights (more weight to recent)
    dates = all_data['date']
    max_date = dates.max()
    
    # Weight = exponential decay by days ago
    days_ago = (max_date - dates).dt.days
    weights = np.exp(-0.01 * days_ago)  # Decay rate
    
    X_all = all_data['features']
    y_all = all_data['target']
    
    # Retrain with weights
    new_model = train_model(X_all, y_all, sample_weight=weights)
    
    return new_model
```

**When to Use:**
- Want balance between recent and historical
- Gradual concept drift
- Need long-term patterns but adapt to recent changes

**Pros:**
- Balances recent and historical
- Smooth adaptation

**Cons:**
- More complex
- Requires tuning decay rate

#### Strategy 4: Online Learning

**Approach:** Update model continuously with new data.

```python
def online_learning_update(model, new_data):
    # Update model with new examples
    X_new = new_data['features']
    y_new = new_data['target']
    
    # Partial fit (incremental update)
    model.partial_fit(X_new, y_new)
    
    return model
```

**When to Use:**
- Real-time adaptation needed
- Streaming data
- Model supports incremental learning

**Pros:**
- Always up-to-date
- Efficient for streaming data

**Cons:**
- Requires incremental learning support
- May forget old patterns
- Harder to debug

### Retraining Pipeline

```python
def retraining_pipeline():
    # 1. Check if retraining is needed
    if not should_retrain():
        return
    
    # 2. Load new data
    new_data = load_new_data_since_last_training()
    
    # 3. Validate data quality
    if not validate_data_quality(new_data):
        alert("Data quality issues detected!")
        return
    
    # 4. Retrain model
    new_model = retrain_model(new_data)
    
    # 5. Evaluate new model
    evaluation = evaluate_model(new_model, validation_data)
    
    # 6. Compare with current model
    current_evaluation = evaluate_model(current_model, validation_data)
    
    # 7. Deploy if better
    if evaluation['f1'] > current_evaluation['f1']:
        deploy_model(new_model)
        log_retraining(evaluation)
    else:
        log_retraining_failure("New model not better")
```

---

## 7.4 Data Quality Checks

### What to Check

#### 1. Missing Values

```python
def check_missing_values(X):
    missing_counts = X.isnull().sum()
    missing_percentages = missing_counts / len(X) * 100
    
    issues = []
    for feature, pct in missing_percentages.items():
        if pct > 5:  # More than 5% missing
            issues.append({
                'feature': feature,
                'missing_percentage': pct,
                'severity': 'high' if pct > 20 else 'medium'
            })
    
    return issues
```

#### 2. Outliers

```python
def check_outliers(X):
    from scipy import stats
    
    issues = []
    for feature in X.select_dtypes(include=[np.number]).columns:
        z_scores = np.abs(stats.zscore(X[feature].dropna()))
        outlier_count = (z_scores > 3).sum()
        
        if outlier_count > len(X) * 0.01:  # More than 1% outliers
            issues.append({
                'feature': feature,
                'outlier_count': outlier_count,
                'outlier_percentage': outlier_count / len(X) * 100
            })
    
    return issues
```

#### 3. Distribution Shifts

```python
def check_distribution_shifts(X_train, X_production):
    from scipy import stats
    
    issues = []
    for feature in X_train.columns:
        if X_train[feature].dtype in [np.float64, np.int64]:
            # Kolmogorov-Smirnov test
            statistic, p_value = stats.ks_2samp(
                X_train[feature].dropna(),
                X_production[feature].dropna()
            )
            
            if p_value < 0.05:  # Significant shift
                issues.append({
                    'feature': feature,
                    'p_value': p_value,
                    'has_shift': True
                })
    
    return issues
```

#### 4. Schema Validation

```python
def validate_schema(X, expected_schema):
    issues = []
    
    # Check columns
    missing_columns = set(expected_schema.keys()) - set(X.columns)
    extra_columns = set(X.columns) - set(expected_schema.keys())
    
    if missing_columns:
        issues.append({
            'type': 'missing_columns',
            'columns': missing_columns
        })
    
    if extra_columns:
        issues.append({
            'type': 'extra_columns',
            'columns': extra_columns
        })
    
    # Check data types
    for col, expected_dtype in expected_schema.items():
        if col in X.columns:
            if X[col].dtype != expected_dtype:
                issues.append({
                    'type': 'wrong_dtype',
                    'column': col,
                    'expected': expected_dtype,
                    'actual': X[col].dtype
                })
    
    return issues
```

### Automated Data Quality Pipeline

```python
def data_quality_pipeline(X):
    issues = []
    
    # Run all checks
    issues.extend(check_missing_values(X))
    issues.extend(check_outliers(X))
    issues.extend(validate_schema(X, expected_schema))
    
    # Alert if critical issues
    critical_issues = [i for i in issues if i.get('severity') == 'high']
    if critical_issues:
        alert("Critical data quality issues detected!", critical_issues)
    
    # Log all issues
    log_data_quality_report(issues)
    
    return issues
```

---

## 7.5 Collaboration with ML Engineers

### Roles and Responsibilities

**Data Scientist (You):**
- Problem framing
- Feature engineering
- Model development
- Evaluation and validation
- Business alignment

**ML Engineer:**
- Model deployment
- Infrastructure setup
- Performance optimization
- Monitoring systems
- Scalability

### Effective Collaboration

#### 1. Clear Interfaces

**Define Model Interface:**
```python
# Clear input/output specification
class ChurnPredictionModel:
    def predict(self, customer_features: dict) -> float:
        """
        Predict churn probability for a customer.
        
        Args:
            customer_features: Dictionary with required features:
                - 'days_since_last_purchase': int
                - 'purchases_last_30_days': int
                - 'lifetime_value': float
                - ...
        
        Returns:
            churn_probability: float between 0 and 1
        """
        pass
```

#### 2. Version Control

**Model Versioning:**
```python
# Use MLflow or similar
import mlflow

# Log model
mlflow.sklearn.log_model(
    model,
    "churn_model",
    registered_model_name="ChurnPrediction"
)

# Version models
# v1: Initial model
# v2: Added new features
# v3: Retrained with more data
```

#### 3. Documentation

**Model Card:**
```markdown
# Churn Prediction Model

## Model Information
- Version: 1.2
- Training Date: 2024-01-15
- Algorithm: XGBoost

## Performance
- Accuracy: 0.85
- Precision: 0.78
- Recall: 0.72
- F1: 0.75

## Features
- days_since_last_purchase
- purchases_last_30_days
- lifetime_value
- ...

## Limitations
- Trained on US customers only
- Performance degrades for new customers (< 30 days)
```

#### 4. Testing

**Model Tests:**
```python
def test_model_interface():
    # Test that model accepts expected inputs
    model = load_model()
    test_features = create_test_features()
    
    prediction = model.predict(test_features)
    
    assert 0 <= prediction <= 1, "Prediction should be probability"
    assert isinstance(prediction, float), "Prediction should be float"

def test_model_performance():
    # Test that model meets performance requirements
    model = load_model()
    test_data = load_test_data()
    
    score = evaluate_model(model, test_data)
    
    assert score['f1'] >= 0.70, "F1 score should be at least 0.70"
```

---

## Lab 7: Design a Monitoring Plan

### Objective
Design a comprehensive monitoring plan for a production ML system.

### Tasks

1. **Monitoring Metrics**
   - Define key performance metrics
   - Set up monitoring dashboards
   - Create alerting rules

2. **Drift Detection**
   - Implement data drift detection
   - Implement concept drift detection
   - Set up automated alerts

3. **Retraining Strategy**
   - Design retraining pipeline
   - Define retraining triggers
   - Create retraining schedule

4. **Data Quality**
   - Implement data quality checks
   - Set up quality monitoring
   - Create quality alerts

5. **Collaboration Plan**
   - Document model interface
   - Create model card
   - Define handoff process

### Deliverables

1. **Monitoring Plan Document** including:
   - Metrics to monitor
   - Monitoring infrastructure
   - Alerting rules
   - Dashboard design

2. **Monitoring Implementation** including:
   - Code for monitoring
   - Drift detection
   - Quality checks
   - Alerting system

3. **Retraining Strategy** including:
   - Retraining pipeline
   - Trigger conditions
   - Evaluation criteria
   - Deployment process

### Evaluation Criteria

- Monitoring completeness (30%)
- Drift detection quality (25%)
- Retraining strategy (25%)
- Implementation quality (20%)

---

## Summary

**Key Takeaways:**

- **Batch vs Real-Time:**: Choose based on latency requirements
- **Monitor Everything:**: Performance, distributions, drift
- **Retrain Strategically:**: Scheduled, triggered, or continuous
- **Data Quality:**: Check before training and in production
- **Collaborate Effectively:**: Clear interfaces, documentation, testing

**Next Steps:**
- **Module 8:**: Module 8: Communicate ML impact
- **stakeholder communication Understanding**: Learn stakeholder communication
- **trust and alignment Development**: Build trust and alignment

---

## Additional Resources

### Reading
- "Designing Machine Learning Systems" by Chip Huyen (Chapters 5-7)
- "Building Machine Learning Powered Applications" by Emmanuel Ameisen
- "MLOps: Continuous delivery and automation pipelines in ML" by Mark Treveil

### Tools
- MLflow: Model versioning and tracking
- Evidently AI: Data and model drift
- Great Expectations: Data quality
- Weights & Biases: Experiment tracking

---

**Ready for Module 8? [Continue →](Module_08_Communicating_ML_Impact.md)**
