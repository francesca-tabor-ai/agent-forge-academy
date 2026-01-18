---
title: "Module 2: Credit Risk Modeling with Machine Learning"
description: "Build AI-powered credit scoring models with explainability"
module: "2"
order: 2
---

# Module 2: Credit Risk Modeling with Machine Learning

**Duration:** Week 2  
**Learning Objectives:**
- **Probability of Default Understanding**: Understand Probability of Default (PD) modeling
- **machine learning models for credit scoring Development**: Build machine learning models for credit scoring
- **explainable AI for regulatory compliance Implementation**: Implement explainable AI for regulatory compliance
- **Loss Given Default (LGD) and Exposure at Default (EAD) models Development**: Develop Loss Given Default (LGD) and Exposure at Default (EAD) models

---

## Lesson 2.1: Probability of Default (PD) Models

### Traditional PD Models

**Logistic Regression**
- Binary classification: default vs. non-default
- Interpretable coefficients
- Assumes linear relationships
- Limitations: Cannot capture complex interactions

**Credit Scoring Models**
- Weighted scorecards
- Rule-based systems
- Industry-standard approach
- Limitations: Static, manual updates required

### Machine Learning PD Models

**Gradient Boosting (XGBoost, LightGBM)**
- Handles non-linear relationships
- Feature importance automatically calculated
- Robust to outliers
- High predictive power

**Neural Networks**
- Deep learning for complex patterns
- Can process unstructured data
- Requires large datasets
- Less interpretable

**Ensemble Methods**
- Combine multiple models
- Improved accuracy and robustness
- Reduces overfitting risk

---

## Lesson 2.2: Feature Engineering for Credit Risk

### Financial Ratios
- Leverage ratios (debt-to-equity)
- Liquidity ratios (current ratio, quick ratio)
- Profitability ratios (ROE, ROA)
- Coverage ratios (interest coverage)

### Behavioral Features
- Payment history patterns
- Utilization trends
- Transaction frequency
- Account age and tenure

### Macroeconomic Indicators
- GDP growth
- Unemployment rate
- Interest rates
- Industry-specific indicators

### Alternative Data
- Social media sentiment
- News sentiment
- Web traffic patterns
- Satellite data (for commercial lending)

---

## Lesson 2.3: Loss Given Default (LGD) and Exposure at Default (EAD)

### LGD Modeling
- Recovery rate estimation
- Collateral valuation
- Seniority and security
- Economic cycle impact

### EAD Modeling
- Current exposure
- Potential future exposure
- Credit conversion factors
- Drawdown probabilities

---

## Lesson 2.4: Explainable AI for Credit Models

### SHAP Values
- Feature importance
- Individual prediction explanations
- Global model interpretability

### LIME
- Local interpretability
- Model-agnostic approach
- Simple explanations

### Regulatory Compliance
- Model documentation requirements
- Validation and backtesting
- Ongoing monitoring

---

## Exercise 2: Develop a Credit Scoring Model

Build a complete credit scoring system using machine learning with explainability features.

**Deliverables:**
- Trained PD model (XGBoost or LightGBM)
- Feature importance analysis
- SHAP value explanations
- Model validation report
- Performance metrics (AUC, Gini coefficient)

---

## Key Takeaways

- **Machine Learning**: Machine learning models significantly outperform traditional logistic regression for PD estimation
- **Feature Engineering**: Feature engineering is critical for model performance
- **Explainability Is**: Explainability is essential for regulatory compliance
- **Lgd And**: LGD and EAD models complement PD models for complete credit risk assessment

---

**End of Module 2**
