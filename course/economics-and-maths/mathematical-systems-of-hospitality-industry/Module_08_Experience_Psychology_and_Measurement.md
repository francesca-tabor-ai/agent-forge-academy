---
title: "Experience, Psychology, and Measurement"
module: "Module 8"
week: 8
order: 8
description: "Quantifying subjective experience"
---

# Module 8: Experience, Psychology, and Measurement

## Introduction

Guest experience is subjective but can be quantified. This module covers latent variables, survey scaling, review sentiment analysis, and experience vs. efficiency trade-offs.

## Learning Objectives

- Model latent variables (satisfaction, trust)
- Apply survey scaling and weighting
- Analyze review sentiment
- Evaluate experience vs. efficiency trade-offs
- Use weighted indices
- Apply factor models
- Calculate text-based sentiment scoring
- Build NPS and CSI dashboards
- Drive review-driven service improvements
- Evaluate experience ROI

## Latent Variables

### Definition

**Latent variables:**
```
Not directly observable
Measured through indicators
```

**Examples:**
- Satisfaction
- Trust
- Loyalty
- Experience quality

**Measurement:**
```
Indicators: Survey_responses, Reviews, Behavior
Latent = f(Indicators)
```

### Factor Models

**Factor analysis:**
```
Indicators = f(Latent_factors) + Error
```

**Measurement model:**
```
X = Λ × F + ε
where:
  X = observed indicators
  Λ = factor loadings
  F = latent factors
  ε = error
```

**Estimation:**
```
Factor_analysis
Structural_equation_modeling
```

## Survey Scaling and Weighting

### Survey Scales

**Likert scale:**
```
1 = Strongly_disagree
5 = Strongly_agree
```

**NPS (Net Promoter Score):**
```
0-10 scale
Promoters: 9-10
Detractors: 0-6
NPS = %Promoters - %Detractors
```

**CSI (Customer Satisfaction Index):**
```
Weighted_average of satisfaction_scores
```

### Weighting

**Equal weights:**
```
Score = (1/n) × Σ Score_i
```

**Weighted:**
```
Score = Σ w_i × Score_i
where Σ w_i = 1
```

**Weights:**
```
Importance_weights
Reliability_weights
```

## Review Sentiment Analysis

### Sentiment Scoring

**Text analysis:**
```
Review_text → Sentiment_score
```

**Methods:**
- Lexicon-based
- Machine learning
- Deep learning

**Score:**
```
Sentiment ∈ [-1, 1]
-1 = Very_negative
+1 = Very_positive
```

### Sentiment Models

**Bag of words:**
```
Count positive_words
Count negative_words
Score = (Positive - Negative) / Total
```

**Machine learning:**
```
Train classifier on labeled_reviews
Predict sentiment
```

**Deep learning:**
```
Neural_networks
Word_embeddings
Context_aware
```

## Experience vs. Efficiency Trade-offs

### Trade-off

**More experience:**
```
Higher_satisfaction
Higher_cost
Longer_service_time
```

**More efficiency:**
```
Lower_cost
Faster_service
Lower_satisfaction (potentially)
```

**Optimization:**
```
Maximize: Satisfaction
Subject to: Cost_constraints
```

### Experience ROI

**Experience investment:**
```
Staff_training
Amenities
Service_improvements
```

**Experience benefit:**
```
Higher_satisfaction
Higher_retention
Higher_CLV
```

**ROI:**
```
ROI = (CLV_increase - Experience_cost) / Experience_cost
```

## Core Mathematics

### Weighted Indices

**Composite index:**
```
Index = Σ w_i × X_i
where:
  w_i = weights
  X_i = normalized_scores
  Σ w_i = 1
```

**Normalization:**
```
X_normalized = (X - Min) / (Max - Min)
```

**Weighting:**
```
w_i = Importance_i / Σ Importance_j
```

### Factor Models

**Factor analysis:**
```
X = ΛF + ε
```

**Loadings:**
```
Λ_ij = Correlation(Indicator_i, Factor_j)
```

**Scores:**
```
F = Λ^(-1) × X (if invertible)
Or: F = f(X, Λ) via estimation
```

### Text-Based Sentiment Scoring

**Lexicon:**
```
Positive_words: {good, great, excellent, ...}
Negative_words: {bad, terrible, awful, ...}
```

**Scoring:**
```
Score = (Positive_count - Negative_count) / Total_words
```

**Machine learning:**
```
P(Sentiment | Text) = f(Text_features)
```

## Industry Applications

### NPS and CSI Dashboards

**NPS calculation:**
```
NPS = %Promoters - %Detractors
Range: [-100, 100]
```

**CSI calculation:**
```
CSI = Σ w_i × Satisfaction_i
```

**Dashboard:**
```
Real-time metrics
Trends
Segmentation
```

### Review-Driven Service Improvements

**Sentiment analysis:**
```
Analyze review_sentiment
Identify issues
```

**Action:**
```
Address negative_reviews
Improve weak_areas
```

**Measurement:**
```
Track sentiment_over_time
Measure improvement
```

### Experience ROI Evaluation

**Investment:**
```
Experience_improvement_cost
```

**Outcome:**
```
Satisfaction_increase
Retention_increase
CLV_increase
```

**ROI:**
```
ROI = (CLV_increase - Investment) / Investment
```

## Exercises

1. **Latent Variables:** Model satisfaction as latent variable
2. **Scaling:** Design survey scale and calculate indices
3. **Sentiment:** Analyze review sentiment
4. **Trade-offs:** Optimize experience vs. efficiency

## Case Studies

- NPS improvement programs
- Review sentiment analysis
- Experience ROI optimization
- Survey design and analysis
- Service improvement strategies
