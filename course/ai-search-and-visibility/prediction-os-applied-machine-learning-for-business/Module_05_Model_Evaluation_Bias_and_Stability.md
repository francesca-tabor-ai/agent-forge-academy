---
title: "Module 5: Model Evaluation, Bias & Stability"
description: "Does the model actually work — and for whom?"
module: "5"
order: 5
---

# Module 5: Model Evaluation, Bias & Stability

**Duration:** Week 5  
**Theme:** *Does the model actually work — and for whom?*

**Learning Objectives:**
- **Choose The**: Choose the right evaluation metrics
- **offline vs online evaluation Understanding**: Understand offline vs online evaluation
- **Perform Segment-Level**: Perform segment-level performance analysis
- **Identify Bias,**: Identify bias, fairness, and unintended consequences
- **model robustness Evaluation**: Assess model robustness and temporal stability

---

## 5.1 Choosing the Right Evaluation Metrics

### Classification Metrics

#### Accuracy: When It Works and When It Doesn't

**Definition:** Percentage of correct predictions.

```python
from sklearn.metrics import accuracy_score

accuracy = accuracy_score(y_true, y_pred)
```

**When to Use:**
- Balanced classes
- All errors are equally costly
- Simple baseline metric

**When NOT to Use:**
- Imbalanced classes (e.g., 95% negative, 5% positive)
- Different costs for different errors
- Need to understand false positives vs false negatives

**Example: Churn Prediction (5% churn rate)**
```python
# Bad model: Always predict "won't churn"
# Accuracy: 95% (looks good, but useless!)

# Good model: Actually predicts churn
# Accuracy: 85% (lower, but actually useful)
```

#### Precision and Recall

**Precision:** Of predicted positives, how many are actually positive?

```python
from sklearn.metrics import precision_score

precision = precision_score(y_true, y_pred)
# precision = TP / (TP + FP)
```

**Recall:** Of actual positives, how many did we catch?

```python
from sklearn.metrics import recall_score

recall = recall_score(y_true, y_pred)
# recall = TP / (TP + FN)
```

**Trade-off:**
- High precision: Few false positives (conservative)
- High recall: Few false negatives (aggressive)

**Example: Churn Prediction**
```python
# High precision, low recall
# → Few false alarms, but miss many churners
# Good when: Retention campaigns are expensive

# Low precision, high recall
# → Catch most churners, but many false alarms
# Good when: Missing churners is very costly
```

#### F1-Score: Balancing Precision and Recall

```python
from sklearn.metrics import f1_score

f1 = f1_score(y_true, y_pred)
# f1 = 2 * (precision * recall) / (precision + recall)
```

**When to Use:**
- Need balanced precision and recall
- Classes are imbalanced
- Single metric for comparison

#### ROC-AUC: Ranking Quality

**Definition:** Area under the ROC curve. Measures how well model ranks examples.

```python
from sklearn.metrics import roc_auc_score

roc_auc = roc_auc_score(y_true, y_pred_proba)
```

**Interpretation:**
- 0.5: Random (no better than chance)
- 0.7: Acceptable
- 0.8: Good
- 0.9: Excellent
- 1.0: Perfect

**When to Use:**
- Ranking is important (e.g., lead scoring)
- Want threshold-independent metric
- Imbalanced classes

**When NOT to Use:**
- Need specific threshold performance
- Cost-sensitive decisions
- Multiple classes

#### PR-AUC: Precision-Recall Curve

```python
from sklearn.metrics import average_precision_score

pr_auc = average_precision_score(y_true, y_pred_proba)
```

**When to Use:**
- Highly imbalanced classes
- Care more about positive class
- Better than ROC-AUC for imbalanced data

### Regression Metrics

#### MAE: Mean Absolute Error

```python
from sklearn.metrics import mean_absolute_error

mae = mean_absolute_error(y_true, y_pred)
```

**Interpretation:** Average prediction error in original units.

**When to Use:**
- All errors are equally costly
- Want interpretable metric
- Outliers are important

#### RMSE: Root Mean Squared Error

```python
from sklearn.metrics import mean_squared_error
import numpy as np

rmse = np.sqrt(mean_squared_error(y_true, y_pred))
```

**Interpretation:** Average prediction error, penalizes large errors more.

**When to Use:**
- Large errors are much worse than small errors
- Standard metric for comparison

#### MAPE: Mean Absolute Percentage Error

```python
def mape(y_true, y_pred):
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100

mape_score = mape(y_true, y_pred)
```

**Interpretation:** Average percentage error.

**When to Use:**
- Relative error matters
- Different scales across examples
- Business stakeholders understand percentages

**When NOT to Use:**
- Values can be zero or near zero
- Asymmetric error costs

### Business Metrics

**Key Principle:** ML metrics should align with business outcomes.

**Example: Churn Prediction**
```python
# ML Metric: F1-Score = 0.75
# Business Metric: Retention campaign ROI

def calculate_retention_roi(predictions, actuals, campaign_cost, customer_value):
    # Target customers predicted to churn
    targeted = predictions == 1
    
    # How many actually churned?
    prevented_churns = (targeted & (actuals == 0)).sum()
    
    # Revenue saved
    revenue_saved = prevented_churns * customer_value
    
    # Campaign cost
    total_cost = targeted.sum() * campaign_cost
    
    # ROI
    roi = (revenue_saved - total_cost) / total_cost
    return roi
```

**Always Include:**
- Business impact metrics
- Cost-benefit analysis
- Actionability assessment

---

## 5.2 Offline vs Online Evaluation

### Offline Evaluation: Before Deployment

**Definition:** Evaluate model on historical data.

**Methods:**

#### 1. Train-Validation-Test Split

```python
from sklearn.model_selection import train_test_split

# Split data
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.4, random_state=42
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42
)

# Train on train, tune on val, evaluate on test
model.fit(X_train, y_train)
# Tune hyperparameters on X_val, y_val
final_score = model.score(X_test, y_test)
```

#### 2. Time-Based Split (Critical for Time Series)

```python
# For time series: Use temporal split
split_date = '2024-01-01'

train = data[data['date'] < split_date]
test = data[data['date'] >= split_date]

# Never use future data to predict past!
```

#### 3. Cross-Validation

```python
from sklearn.model_selection import cross_val_score

# K-fold cross-validation
scores = cross_val_score(model, X, y, cv=5)
print(f"Mean score: {scores.mean():.3f} (+/- {scores.std() * 2:.3f})")
```

**When to Use:**
- Limited data
- Need robust estimate
- Not time series data

**When NOT to Use:**
- Time series (use time-based split)
- Data leakage risk
- Need to simulate production

#### 4. Stratified Splits

```python
from sklearn.model_selection import train_test_split

# Maintain class distribution
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
```

**When to Use:**
- Imbalanced classes
- Need representative splits

### Online Evaluation: After Deployment

**Definition:** Evaluate model in production with real data.

**Methods:**

#### 1. A/B Testing

```python
# Split traffic
group_a = get_traffic(percentage=50)  # Old model
group_b = get_traffic(percentage=50)  # New model

# Compare outcomes
results_a = evaluate_model(group_a, old_model)
results_b = evaluate_model(group_b, new_model)

# Statistical significance test
if is_significant(results_a, results_b):
    deploy_new_model()
```

**Key Considerations:**
- Sample size for statistical power
- Duration of test
- Guardrails for safety

#### 2. Shadow Mode

**Definition:** Run new model alongside old model, but don't use predictions.

```python
# Production: Use old model
production_prediction = old_model.predict(features)

# Shadow: Run new model (for evaluation only)
shadow_prediction = new_model.predict(features)

# Compare predictions (offline)
compare_predictions(production_prediction, shadow_prediction)
```

**When to Use:**
- Validate model before full deployment
- Compare model versions
- Low-risk evaluation

#### 3. Canary Deployment

**Definition:** Gradually roll out new model to small percentage of traffic.

```python
# Start with 1% of traffic
if random.random() < 0.01:
    prediction = new_model.predict(features)
else:
    prediction = old_model.predict(features)

# Monitor metrics
# If good: Increase percentage
# If bad: Roll back
```

### Offline vs Online: Key Differences

| Aspect | Offline | Online |
|--------|---------|--------|
| **Data** | Historical | Real-time |
| **Speed** | Can take time | Must be fast |
| **Risk** | Low (no impact) | High (affects users) |
| **Realism** | May not match production | True production conditions |
| **Cost** | Low | Can be high |

**Best Practice:** Use both offline and online evaluation.

---

## 5.3 Segment-Level Performance Analysis

### Why Segment Analysis Matters

**Problem:** Average performance can hide poor performance for specific groups.

**Example:**
```python
# Overall accuracy: 85% (looks good!)
# But:
# - Segment A (high-value customers): 95% accuracy ✅
# - Segment B (low-value customers): 60% accuracy ❌
# - Segment C (new customers): 70% accuracy ⚠️
```

### Segment Definition

**Common Segments:**
- Demographics (age, gender, location)
- Customer value (high, medium, low)
- Product categories
- Customer lifecycle stage
- Geographic regions

```python
def analyze_by_segment(model, X, y, segments):
    results = {}
    
    for segment_name, segment_mask in segments.items():
        X_seg = X[segment_mask]
        y_seg = y[segment_mask]
        
        # Evaluate on this segment
        score = model.score(X_seg, y_seg)
        results[segment_name] = {
            'accuracy': score,
            'size': len(X_seg),
            'precision': precision_score(y_seg, model.predict(X_seg)),
            'recall': recall_score(y_seg, model.predict(X_seg))
        }
    
    return results
```

### Identifying Problem Segments

```python
def identify_problem_segments(results, threshold=0.75):
    problems = []
    
    overall_performance = np.mean([r['accuracy'] for r in results.values()])
    
    for segment, metrics in results.items():
        if metrics['accuracy'] < overall_performance * threshold:
            problems.append({
                'segment': segment,
                'accuracy': metrics['accuracy'],
                'gap': overall_performance - metrics['accuracy']
            })
    
    return problems
```

### Addressing Segment Issues

**Strategies:**
1. **More data for underperforming segments**
2. **Segment-specific models**
3. **Feature engineering for segments**
4. **Bias correction techniques**

---

## 5.4 Bias, Fairness, and Unintended Consequences

### Types of Bias

#### 1. Data Bias

**Definition:** Training data doesn't represent population.

**Example:**
```python
# Training data: 80% male, 20% female
# Population: 50% male, 50% female
# → Model may perform poorly for females
```

**How to Detect:**
- Compare data distribution to population
- Analyze performance by demographic groups
- Check for underrepresented groups

#### 2. Algorithmic Bias

**Definition:** Model learns biased patterns from data.

**Example:**
```python
# Model learns: "Women are less likely to be promoted"
# (Because historical data shows this pattern)
# → Model perpetuates bias
```

**How to Detect:**
- Analyze feature importance
- Check for proxy variables (e.g., zip code → race)
- Evaluate fairness metrics

#### 3. Evaluation Bias

**Definition:** Evaluation doesn't account for different groups.

**Example:**
```python
# Overall accuracy: 85%
# But accuracy for minority group: 60%
# → Evaluation bias: Hides poor performance
```

**How to Detect:**
- Segment-level evaluation
- Fairness metrics
- Disparate impact analysis

### Fairness Metrics

#### Demographic Parity

**Definition:** Positive predictions are distributed equally across groups.

```python
def demographic_parity(y_pred, groups):
    parity_scores = {}
    overall_positive_rate = (y_pred == 1).mean()
    
    for group_name, group_mask in groups.items():
        group_positive_rate = (y_pred[group_mask] == 1).mean()
        parity_scores[group_name] = {
            'positive_rate': group_positive_rate,
            'difference': abs(group_positive_rate - overall_positive_rate)
        }
    
    return parity_scores
```

#### Equalized Odds

**Definition:** True positive and false positive rates are equal across groups.

```python
from sklearn.metrics import confusion_matrix

def equalized_odds(y_true, y_pred, groups):
    results = {}
    
    for group_name, group_mask in groups.items():
        y_true_group = y_true[group_mask]
        y_pred_group = y_pred[group_mask]
        
        tn, fp, fn, tp = confusion_matrix(y_true_group, y_pred_group).ravel()
        
        tpr = tp / (tp + fn)  # True positive rate
        fpr = fp / (fp + tn)  # False positive rate
        
        results[group_name] = {
            'tpr': tpr,
            'fpr': fpr
        }
    
    return results
```

#### Disparate Impact

**Definition:** Ratio of positive rates between groups.

```python
def disparate_impact(y_pred, groups):
    positive_rates = {}
    
    for group_name, group_mask in groups.items():
        positive_rates[group_name] = (y_pred[group_mask] == 1).mean()
    
    # Calculate ratio (typically: protected / majority)
    min_rate = min(positive_rates.values())
    max_rate = max(positive_rates.values())
    
    # Rule of thumb: Ratio < 0.8 indicates disparate impact
    ratio = min_rate / max_rate
    
    return {
        'ratio': ratio,
        'has_disparate_impact': ratio < 0.8,
        'positive_rates': positive_rates
    }
```

### Mitigating Bias

#### 1. Data Collection

- Ensure representative data
- Oversample underrepresented groups
- Collect more data for minority groups

#### 2. Feature Engineering

- Remove proxy variables
- Use fair features
- Create group-aware features

#### 3. Algorithmic Fairness

- Use fairness constraints in training
- Post-process predictions for fairness
- Use fair ML libraries (e.g., Fairlearn)

#### 4. Monitoring

- Track fairness metrics over time
- Alert on fairness degradation
- Regular bias audits

---

## 5.5 Model Robustness and Temporal Stability

### Robustness: Performance Across Conditions

**Definition:** Model performs well across different data distributions.

#### 1. Distribution Shift

**Problem:** Training and production data differ.

```python
def detect_distribution_shift(X_train, X_production):
    # Compare feature distributions
    from scipy import stats
    
    shifts = {}
    for feature in X_train.columns:
        # Kolmogorov-Smirnov test
        statistic, p_value = stats.ks_2samp(
            X_train[feature], 
            X_production[feature]
        )
        shifts[feature] = {
            'statistic': statistic,
            'p_value': p_value,
            'has_shift': p_value < 0.05
        }
    
    return shifts
```

#### 2. Outlier Robustness

**Test:** How does model handle outliers?

```python
def test_outlier_robustness(model, X_test, y_test):
    # Add outliers
    X_outlier = X_test.copy()
    X_outlier.iloc[0] = X_outlier.iloc[0] * 100  # Extreme outlier
    
    # Compare predictions
    normal_pred = model.predict(X_test)
    outlier_pred = model.predict(X_outlier)
    
    # Check if outlier causes extreme prediction
    return {
        'outlier_impact': abs(outlier_pred[0] - normal_pred[0]),
        'is_robust': abs(outlier_pred[0] - normal_pred[0]) < threshold
    }
```

### Temporal Stability: Performance Over Time

**Problem:** Model performance degrades over time.

#### 1. Performance Over Time

```python
def evaluate_temporal_stability(model, data_by_time):
    performance_over_time = []
    
    for time_period, (X, y) in data_by_time.items():
        score = model.score(X, y)
        performance_over_time.append({
            'time_period': time_period,
            'score': score
        })
    
    # Check for degradation
    recent_performance = performance_over_time[-3:]  # Last 3 periods
    early_performance = performance_over_time[:3]    # First 3 periods
    
    degradation = np.mean([p['score'] for p in early_performance]) - \
                  np.mean([p['score'] for p in recent_performance])
    
    return {
        'performance_over_time': performance_over_time,
        'degradation': degradation,
        'needs_retraining': degradation > threshold
    }
```

#### 2. Concept Drift Detection

**Definition:** Relationship between features and target changes over time.

```python
def detect_concept_drift(model, data_by_time):
    # Monitor prediction accuracy over time
    accuracies = []
    
    for time_period, (X, y) in data_by_time.items():
        accuracy = model.score(X, y)
        accuracies.append(accuracy)
    
    # Statistical test for trend
    from scipy import stats
    slope, intercept, r_value, p_value, std_err = stats.linregress(
        range(len(accuracies)), accuracies
    )
    
    # Negative slope with significance = concept drift
    has_drift = slope < 0 and p_value < 0.05
    
    return {
        'has_concept_drift': has_drift,
        'slope': slope,
        'p_value': p_value
    }
```

#### 3. Data Drift Detection

**Definition:** Feature distributions change over time.

```python
def detect_data_drift(X_train, X_production):
    from evidently import DatasetDrift
    
    # Use Evidently AI or similar
    drift_report = DatasetDrift()
    drift_report.calculate(X_train, X_production)
    
    return {
        'has_drift': drift_report.get_report()['dataset_drift']['drift_detected'],
        'drifted_features': drift_report.get_report()['drift_by_columns']
    }
```

### Maintaining Stability

**Strategies:**
1. **Regular retraining** (weekly, monthly)
2. **Monitor performance** continuously
3. **Alert on degradation** (automated)
4. **A/B test** model updates
5. **Rollback** if performance drops

---

## Lab 5: Evaluate Models Across Segments, Time, and Distributions

### Objective
Perform comprehensive model evaluation including bias and stability analysis.

### Tasks

1. **Metric Selection**
   - Choose appropriate metrics for each problem
   - Calculate business metrics
   - Compare ML vs business metrics

2. **Segment Analysis**
   - Define customer segments
   - Evaluate performance by segment
   - Identify problem segments
   - Propose solutions

3. **Bias Analysis**
   - Calculate fairness metrics
   - Identify biased predictions
   - Analyze root causes
   - Propose mitigation strategies

4. **Stability Analysis**
   - Evaluate performance over time
   - Detect concept drift
   - Detect data drift
   - Recommend retraining schedule

### Deliverables

1. **Evaluation Report** including:
   - Metric selection rationale
   - Overall performance
   - Segment-level performance
   - Bias analysis
   - Stability analysis

2. **Recommendations Document** including:
   - Model improvements
   - Bias mitigation strategies
   - Retraining schedule
   - Monitoring plan

### Evaluation Criteria

- Evaluation thoroughness (30%)
- Bias analysis quality (25%)
- Stability analysis depth (25%)
- Recommendations quality (20%)

---

## Summary

**Key Takeaways:**

- **Right Metrics:**: Choose metrics that align with business goals
- **Offline + Online:**: Use both for comprehensive evaluation
- **Segment Analysis:**: Average performance hides problems
- **Bias Detection:**: Always evaluate fairness
- **Stability Monitoring:**: Track performance over time
- **Trustworthy Models:**: Evaluation builds trust

**Next Steps:**
- **Module 6:**: Module 6: Translate predictions into decisions
- **decision frameworks Understanding**: Learn decision frameworks
- **action-oriented ML Development**: Build action-oriented ML systems

---

## Additional Resources

### Reading
- "Fairness and Machine Learning" by Solon Barocas, Moritz Hardt, Arvind Narayanan
- "Designing Machine Learning Systems" by Chip Huyen (Chapter 4: Training Data)
- "Evaluating Machine Learning Models" by Alice Zheng

### Tools
- scikit-learn: Evaluation metrics
- Fairlearn: Fairness assessment
- Evidently AI: Data drift detection
- SHAP: Model explanation

---

**Ready for Module 6? [Continue →](Module_06_From_Prediction_to_Decision.md)**
