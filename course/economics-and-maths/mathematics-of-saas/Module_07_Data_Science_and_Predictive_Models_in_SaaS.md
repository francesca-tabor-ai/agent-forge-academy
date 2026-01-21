---
title: "Data Science & Predictive Models in SaaS"
module: "Module 7"
week: 7
order: 7
description: "Turning data into forward-looking decisions"
---

# Module 7: Data Science & Predictive Models in SaaS

## Introduction

Predictive models enable proactive decision-making in SaaS. This module covers classification, regression, feature engineering, and model evaluation for churn prediction, lead scoring, and upsell propensity.

## Learning Objectives

- Apply classification and regression
- Engineer features from SaaS data
- Evaluate model performance
- Build churn prediction models
- Develop lead scoring systems
- Create upsell propensity models
- Translate predictions into business actions

## Classification and Regression

### Classification

**Binary classification:**
```
P(Class = 1 | Features) = f(Features)
```

**Logistic regression:**
```
P(Churn = 1) = 1 / (1 + exp(-(β₀ + β₁×X₁ + ... + βₙ×Xₙ)))
```

**Decision threshold:**
```
Predict Churn if P(Churn) > Threshold
```

### Regression

**Linear regression:**
```
Y = β₀ + β₁×X₁ + ... + βₙ×Xₙ + ε
```

**LTV prediction:**
```
LTV = f(Usage, Engagement, Support_tickets, ...)
```

**Revenue prediction:**
```
Revenue = f(Customers, ARPA, Expansion_rate, ...)
```

## Feature Engineering

### Time-Based Features

**Recency:**
```
Days_since_last_login
Days_since_signup
```

**Frequency:**
```
Logins_per_week
Features_used_per_month
```

**Engagement:**
```
Total_usage_time
Active_days_count
```

### Behavioral Features

**Product usage:**
```
Feature_adoption_rate
Depth_of_usage
Breadth_of_usage
```

**Support:**
```
Support_ticket_count
Support_ticket_severity
Time_to_resolution
```

**Payment:**
```
Payment_history
Failed_payments
Upgrade_history
```

### Aggregated Features

**Rolling averages:**
```
Avg_usage_last_30_days
Avg_engagement_last_quarter
```

**Trends:**
```
Usage_trend = (Recent_usage - Past_usage) / Past_usage
```

**Ratios:**
```
Usage_intensity = Usage / Days_active
```

## Model Evaluation

### Classification Metrics

**Confusion matrix:**
```
                Predicted
              Positive  Negative
Actual Positive  TP      FN
       Negative  FP      TN
```

**Precision:**
```
Precision = TP / (TP + FP)
```

**Recall:**
```
Recall = TP / (TP + FN)
```

**F1 score:**
```
F1 = 2 × (Precision × Recall) / (Precision + Recall)
```

**ROC-AUC:**
```
AUC = Area under ROC curve
Measures separability
```

### Regression Metrics

**Mean Absolute Error:**
```
MAE = (1/n) × Σ |y_i - ŷ_i|
```

**Root Mean Squared Error:**
```
RMSE = √[(1/n) × Σ(y_i - ŷ_i)²]
```

**R-squared:**
```
R² = 1 - (SS_res / SS_tot)
```

## Churn Prediction

### Model Development

**Target:**
```
Churn = 1 if customer churned
Churn = 0 if customer retained
```

**Features:**
```
Usage, Engagement, Support, Payment, Demographics, ...
```

**Model:**
```
P(Churn) = f(Features)
```

### Model Types

**Logistic regression:**
```
Interpretable coefficients
Linear decision boundary
```

**Random forest:**
```
Non-linear relationships
Feature importance
```

**Gradient boosting:**
```
High accuracy
Handles interactions
```

### Actionable Insights

**Risk segmentation:**
```
High_risk: P(Churn) > 0.7
Medium_risk: 0.3 < P(Churn) ≤ 0.7
Low_risk: P(Churn) ≤ 0.3
```

**Intervention:**
```
Target high-risk customers
Personalized retention offers
```

## Lead Scoring

### Scoring Model

**Score:**
```
Score = f(Lead_characteristics)
```

**Features:**
```
Company_size, Industry, Job_title, Engagement, ...
```

**Probability:**
```
P(Convert) = f(Score)
```

### Model Development

**Target:**
```
Converted = 1 if lead converted
Converted = 0 if not converted
```

**Training:**
```
Train on historical leads
Predict conversion probability
```

### Application

**Prioritization:**
```
Focus on high-score leads
Improve conversion efficiency
```

**Routing:**
```
High-score → Sales team
Low-score → Marketing automation
```

## Upsell Propensity Models

### Upsell Prediction

**Target:**
```
Upsell = 1 if customer upsold
Upsell = 0 if not upsold
```

**Features:**
```
Usage, Engagement, Current_tier, Company_growth, ...
```

**Model:**
```
P(Upsell) = f(Features)
```

### Timing Prediction

**When to upsell:**
```
Optimal_time = f(Usage_trend, Engagement, ...)
```

**Revenue impact:**
```
Expected_upsell_revenue = P(Upsell) × Upsell_value
```

### Actionable Insights

**Targeting:**
```
High_propensity: P(Upsell) > Threshold
```

**Messaging:**
```
Personalize based on usage patterns
Highlight relevant features
```

## Translating Predictions into Actions

### Decision Framework

**Risk-based:**
```
If P(Churn) > Threshold: Intervene
If P(Upsell) > Threshold: Target
```

**Expected value:**
```
E[Action_value] = P(Outcome) × Value(Outcome) - Cost(Action)
```

**Optimization:**
```
Maximize: E[Total_value]
Subject to: Budget_constraints
```

### Implementation

**Automation:**
```
Trigger actions based on predictions
Email campaigns
In-app messaging
```

**Monitoring:**
```
Track prediction accuracy
Update models regularly
```

## Exercises

1. **Churn Prediction:** Build churn prediction model
2. **Lead Scoring:** Develop lead scoring system
3. **Upsell Model:** Create upsell propensity model
4. **Action Framework:** Design decision framework

## Case Studies

- Churn prediction and prevention
- Lead scoring implementation
- Upsell optimization
- Predictive model deployment
- Model monitoring and maintenance
