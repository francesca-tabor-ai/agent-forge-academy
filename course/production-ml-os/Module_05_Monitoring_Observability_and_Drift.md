---
title: "Module 5: Monitoring, Observability & Drift"
description: "Knowing when things go wrong in production ML systems"
module: "Module 5"
week: 5
order: 5
email_takeaway: "ML systems fail silently—comprehensive monitoring detects data drift, concept drift, and model degradation before users notice."
email_action: "Define an observability dashboard for a live ML system with data, model, system, and business metrics."
---

# Module 5: Monitoring, Observability & Drift

**Theme:** *Knowing when things go wrong*

**Duration:** Week 5  
**Learning Objectives:**
- Monitor data, model, system, and business metrics
- Detect input data drift and concept drift
- Design alerting thresholds
- Tie ML metrics to business KPIs

---

## 5.1 What to Monitor: Data, Model, System, and Business Metrics

### The Four Pillars of ML Observability

**1. Data Metrics**
- Input data distributions
- Feature statistics
- Data quality
- Missing values

**2. Model Metrics**
- Prediction distributions
- Model performance
- Confidence scores
- Prediction latency

**3. System Metrics**
- Request rate
- Error rate
- Latency (P50, P95, P99)
- Resource utilization

**4. Business Metrics**
- Business outcomes
- User impact
- Revenue impact
- Cost per prediction

### Data Metrics

**What to Monitor:**

1. **Feature Distributions**
   - Mean, median, std dev
   - Min/max values
   - Percentiles

2. **Data Quality**
   - Missing value rate
   - Outlier rate
   - Data freshness

3. **Schema Changes**
   - New features
   - Removed features
   - Type changes

**Example:**
```python
def monitor_data_metrics(features):
    metrics = {
        "feature_mean": features.mean(),
        "feature_std": features.std(),
        "missing_rate": features.isna().mean(),
        "outlier_rate": detect_outliers(features)
    }
    send_metrics(metrics)
```

### Model Metrics

**What to Monitor:**

1. **Prediction Distributions**
   - Prediction value ranges
   - Confidence scores
   - Prediction frequency

2. **Model Performance** (when labels available)
   - Accuracy, precision, recall
   - AUC, F1 score
   - Confusion matrix

3. **Prediction Latency**
   - Inference time
   - Feature extraction time
   - End-to-end latency

**Example:**
```python
def monitor_model_metrics(predictions, labels=None):
    metrics = {
        "prediction_mean": predictions.mean(),
        "prediction_std": predictions.std(),
        "latency_p95": compute_latency_percentile(95)
    }
    
    if labels:
        metrics.update({
            "accuracy": accuracy_score(labels, predictions),
            "precision": precision_score(labels, predictions)
        })
    
    send_metrics(metrics)
```

### System Metrics

**What to Monitor:**

1. **Request Metrics**
   - Request rate (req/s)
   - Success rate
   - Error rate by type

2. **Latency Metrics**
   - P50, P95, P99 latency
   - End-to-end latency
   - Component-level latency

3. **Resource Metrics**
   - CPU utilization
   - Memory usage
   - GPU utilization
   - Network I/O

**Example:**
```python
def monitor_system_metrics():
    metrics = {
        "request_rate": get_request_rate(),
        "error_rate": get_error_rate(),
        "latency_p95": get_latency_percentile(95),
        "cpu_utilization": get_cpu_usage(),
        "memory_usage": get_memory_usage()
    }
    send_metrics(metrics)
```

### Business Metrics

**What to Monitor:**

1. **Outcome Metrics**
   - Business KPI impact
   - User behavior changes
   - Revenue impact

2. **Cost Metrics**
   - Cost per prediction
   - Infrastructure costs
   - Model training costs

**Example:**
```python
def monitor_business_metrics(predictions, outcomes):
    metrics = {
        "conversion_rate": compute_conversion_rate(outcomes),
        "revenue_impact": compute_revenue_impact(predictions, outcomes),
        "cost_per_prediction": compute_cost(),
        "roi": compute_roi(predictions, outcomes)
    }
    send_metrics(metrics)
```

---

## 5.2 Input Data Drift vs Concept Drift

### Input Data Drift

**Definition:** Change in the distribution of input features over time.

**Causes:**
- Changes in user behavior
- Data pipeline bugs
- External data source changes
- Seasonality

**Detection:**
- Statistical tests (KS test, PSI)
- Distribution comparisons
- Feature monitoring

**Example:**
```python
def detect_data_drift(current_features, baseline_features):
    # Kolmogorov-Smirnov test
    ks_stat, p_value = ks_2samp(
        baseline_features, 
        current_features
    )
    
    # Population Stability Index
    psi = compute_psi(baseline_features, current_features)
    
    if p_value < 0.05 or psi > 0.25:
        alert("Data drift detected")
```

### Concept Drift

**Definition:** Change in the relationship between features and target variable.

**Causes:**
- Changing user preferences
- Market conditions
- External factors
- Model becoming outdated

**Detection:**
- Performance degradation
- Prediction distribution changes
- Label distribution changes

**Example:**
```python
def detect_concept_drift(predictions, labels, baseline_performance):
    current_performance = compute_performance(predictions, labels)
    
    performance_drop = baseline_performance - current_performance
    
    if performance_drop > 0.05:  # 5% drop
        alert("Concept drift detected - performance degraded")
```

### Drift Detection Strategies

**1. Statistical Tests**
- KS test for distributions
- Chi-square for categorical
- PSI for feature stability

**2. Model-Based**
- Train drift detector model
- Monitor prediction confidence
- Track prediction errors

**3. Performance-Based**
- Monitor accuracy over time
- Track business metrics
- Compare to baseline

---

## 5.3 Prediction Distribution Monitoring

### Why Monitor Predictions?

**Insights:**
- Model behavior changes
- Data distribution shifts
- Model degradation
- Anomalous patterns

### What to Monitor

**1. Prediction Value Distributions**
```python
def monitor_prediction_distribution(predictions):
    metrics = {
        "mean": predictions.mean(),
        "std": predictions.std(),
        "min": predictions.min(),
        "max": predictions.max(),
        "percentiles": {
            "p10": np.percentile(predictions, 10),
            "p50": np.percentile(predictions, 50),
            "p90": np.percentile(predictions, 90),
            "p99": np.percentile(predictions, 99)
        }
    }
    send_metrics(metrics)
```

**2. Prediction Frequency**
- Count predictions by value ranges
- Detect unusual patterns
- Identify spikes or drops

**3. Confidence Scores**
- Monitor model confidence
- Detect overconfident predictions
- Track uncertainty

### Anomaly Detection

**Patterns to Detect:**
- Sudden spikes/drops
- Gradual shifts
- Unusual distributions
- Outliers

**Example:**
```python
def detect_prediction_anomalies(predictions, baseline):
    z_scores = (predictions - baseline.mean()) / baseline.std()
    anomalies = np.abs(z_scores) > 3
    
    if anomalies.sum() > len(predictions) * 0.01:  # >1% anomalies
        alert("Anomalous predictions detected")
```

---

## 5.4 Alerting Thresholds & On-Call Readiness

### Alerting Principles

**1. Alert on Symptoms, Not Causes**
- Alert on business impact
- Not on every metric change

**2. Reduce Noise**
- Avoid alert fatigue
- Use intelligent thresholds
- Group related alerts

**3. Actionable Alerts**
- Clear what to do
- Include context
- Link to runbooks

### Threshold Design

**Static Thresholds:**
```python
# Simple but can be noisy
if error_rate > 0.01:  # 1% error rate
    alert("High error rate")
```

**Dynamic Thresholds:**
```python
# Adapt to normal variation
baseline = compute_baseline(historical_data)
threshold = baseline + 3 * std_dev

if current_value > threshold:
    alert("Anomaly detected")
```

**Percentile-Based:**
```python
# Alert on percentiles
if latency_p95 > 200:  # 95th percentile > 200ms
    alert("High latency")
```

### Alert Severity

**Critical (Page Immediately):**
- Service down
- Data corruption
- Security breach
- Revenue impact

**High (Page During Business Hours):**
- Performance degradation
- High error rate
- Drift detected

**Medium (Notify, No Page):**
- Warning signs
- Gradual degradation
- Non-critical issues

**Low (Log Only):**
- Informational
- Trends
- Non-urgent

### On-Call Readiness

**Runbooks:**
- Step-by-step procedures
- Common issues and fixes
- Escalation paths

**Dashboards:**
- Real-time metrics
- Historical trends
- System health

**Tools:**
- Monitoring (Datadog, Prometheus)
- Alerting (PagerDuty, Opsgenie)
- Incident management (Jira, Linear)

---

## 5.5 Tying ML Metrics to Business KPIs

### The Gap

**Problem:** ML metrics (accuracy, latency) don't directly measure business impact.

**Solution:** Connect ML metrics to business outcomes.

### Mapping Metrics

**Example: Recommendation System**

| ML Metric | Business KPI | Relationship |
|-----------|-------------|--------------|
| Click-through rate | Revenue | Direct correlation |
| Prediction latency | User engagement | Latency > 500ms → 10% drop in engagement |
| Model accuracy | Conversion rate | 1% accuracy increase → 0.5% conversion increase |
| Coverage | User satisfaction | More recommendations → higher satisfaction |

### Business Impact Calculation

**Example:**
```python
def compute_business_impact(ml_metrics, business_metrics):
    # Model accuracy impact on revenue
    accuracy_impact = (
        (ml_metrics.accuracy - baseline.accuracy) * 
        conversion_rate_per_accuracy_point *
        average_order_value
    )
    
    # Latency impact on engagement
    latency_impact = (
        (ml_metrics.latency_p95 - target_latency) *
        engagement_drop_per_ms *
        users_per_day *
        revenue_per_user
    )
    
    return {
        "accuracy_impact": accuracy_impact,
        "latency_impact": latency_impact,
        "total_impact": accuracy_impact + latency_impact
    }
```

### Dashboard Design

**Business-Focused Dashboard:**
- Revenue impact (primary)
- User engagement
- Cost per prediction
- ROI

**Technical Dashboard:**
- Model performance
- System health
- Drift detection
- Latency metrics

---

## Hands-On Exercise: Define Observability Dashboard

### Exercise: Design Monitoring for Live ML System

**Scenario:** Real-time fraud detection system

**Requirements:**
- Detect fraud in < 100ms
- 99.9% availability
- Must catch drift quickly
- Business impact: $10M in prevented fraud

**Tasks:**

1. **Define Metrics**
   - Data metrics (feature distributions)
   - Model metrics (prediction distributions)
   - System metrics (latency, errors)
   - Business metrics (fraud caught, false positives)

2. **Design Dashboard**
   - Real-time view
   - Historical trends
   - Alert summary
   - Business impact

3. **Define Alerting Rules**
   - Critical alerts (service down)
   - High alerts (drift detected)
   - Medium alerts (performance degradation)
   - Thresholds for each

4. **Create Runbooks**
   - Common issues
   - Resolution steps
   - Escalation paths

**Deliverable:**
- Monitoring dashboard design
- Alerting rules document
- Runbook for common incidents

---

## Module Summary

### Key Takeaways

1. **Monitor everything** - Data, model, system, and business metrics
2. **Detect drift early** - Input drift and concept drift require different approaches
3. **Alert intelligently** - Reduce noise, focus on business impact
4. **Connect to business** - ML metrics must tie to business KPIs

### Next Steps

- Complete the observability dashboard exercise
- Review monitoring tools and practices
- Move to Module 6 to learn about ML CI/CD

---

## Exercises

1. **Metrics Design:** Define metrics for:
   - Recommendation system
   - Churn prediction
   - Dynamic pricing

2. **Drift Detection:** Implement drift detection for:
   - Input data drift (statistical tests)
   - Concept drift (performance monitoring)
   - Prediction distribution monitoring

3. **Alerting Design:** Design alerting rules with:
   - Thresholds (static and dynamic)
   - Severity levels
   - Runbooks
