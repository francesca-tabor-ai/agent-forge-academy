---
title: "Capstone Project: Build a Prediction OS"
description: "End-to-end applied ML system"
module: "9"
order: 9
---

# Capstone Project: Build a Prediction OS

**Duration:** Weeks 9-10  
**Theme:** *End-to-end applied ML system*

**Learning Objectives:**
- **Frame A**: Frame a real business problem as an ML problem
- **Engineer Production-Ready**: Apply engineer production-ready features in relevant contexts
- **Train And**: Train and evaluate predictive models
- **bias Evaluation**: Assess bias and stability
- **Translate Predictions**: Translate predictions into actionable decisions
- **Communicate Results**: Communicate results to stakeholders

---

## Project Overview

### Objective

Build a complete **Prediction Operating System** — a production-ready ML system that:
1. Predicts a business outcome
2. Translates predictions into decisions
3. Monitors performance
4. Creates measurable business value

### Project Structure

The capstone is divided into **5 phases**, each building on the previous:

1. **Problem Framing & Scoping** (Week 9, Days 1-2)
2. **Feature Engineering & Data Pipeline** (Week 9, Days 3-4)
3. **Model Development & Evaluation** (Week 9, Days 5-7)
4. **Decision Framework & Integration** (Week 10, Days 1-3)
5. **Presentation & Defense** (Week 10, Days 4-5)

---

## Phase 1: Problem Framing & Scoping

### Deliverables

#### 1. Problem Definition Document

**Required Sections:**

**A. Business Context**
- What business problem are you solving?
- Why does this matter?
- What's the current state (without ML)?

**B. ML Problem Framing**
- What are you predicting? (Target definition)
- What's the prediction horizon?
- What type of ML problem? (Classification/Regression/etc.)

**C. Success Criteria**
- Business success metrics
- ML performance targets
- How will you measure impact?

**D. Constraints & Assumptions**
- Data availability
- Timeline constraints
- Resource limitations
- Key assumptions

**Example Structure:**

> **Template: Problem Definition**

# Problem Definition: Customer Churn Prediction

## Business Context
We're losing 5% of customers monthly, costing $500K in revenue.
Currently, we only know someone churned after they've left.

## ML Problem
- Target: Will customer churn in next 30 days? (Binary classification)
- Horizon: 30 days ahead
- Problem Type: Binary classification

## Success Criteria
- Business: Reduce churn by 15%
- ML: F1-score > 0.75, Precision > 0.70
- Impact: Save $200K+ in prevented churn

## Constraints
- Data: 12 months of historical data
- Timeline: 2 weeks for MVP
- Resources: Single data scientist

#### 2. Data Exploration Report

**Required Analysis:**
- Data overview (size, features, time range)
- Target distribution
- Feature distributions
- Missing values
- Temporal patterns
- Initial insights

#### 3. Stakeholder Alignment

**Deliverable:** Meeting notes or email confirming:
- Problem definition agreed upon
- Success criteria aligned
- Timeline and resources confirmed

### Evaluation Criteria

- Problem framing quality (40%)
- Business alignment (30%)
- Data understanding (20%)
- Documentation clarity (10%)

---

## Phase 2: Feature Engineering & Data Pipeline

### Deliverables

#### 1. Feature Engineering Pipeline

**Required Components:**

**A. Feature Definitions**
- List of all features
- Calculation logic
- Temporal constraints
- Data sources

**B. Feature Engineering Code**
- Reusable functions
- Time-aware calculations
- Aggregations
- Leakage prevention

**C. Feature Validation**
- Leakage checks
- Temporal alignment
- Distribution analysis
- Quality checks

**Example Features:**
```python
# Time-window features
'purchases_last_7_days'
'purchases_last_30_days'
'spend_last_90_days'

# Recency features
'days_since_last_purchase'
'days_since_last_login'

# Aggregate features
'lifetime_value'
'avg_purchase_amount'
'unique_categories_purchased'

# Temporal features
'days_since_signup'
'month'
'is_weekend'
```

#### 2. Data Pipeline

**Required:**
- Data loading
- Feature calculation
- Data validation
- Feature storage (or generation on-demand)

#### 3. Feature Documentation

**Document:**
- Feature definitions
- Calculation formulas
- Expected ranges
- Usage guidelines

### Evaluation Criteria

- Feature quality (35%)
- Pipeline robustness (25%)
- Leakage prevention (25%)
- Documentation (15%)

---

## Phase 3: Model Development & Evaluation

### Deliverables

#### 1. Model Development

**Required:**
- Baseline model
- Multiple model types tried
- Hyperparameter tuning
- Final model selection

**Models to Try:**
- At minimum: Baseline, Random Forest, GBM (XGBoost/LightGBM)
- Additional: Linear model, other GBMs

#### 2. Model Evaluation Report

**Required Sections:**

**A. Performance Metrics**
- Overall performance (accuracy, precision, recall, F1, etc.)
- Performance by segment
- Business metrics (ROI, cost-benefit)

**B. Bias Analysis**
- Performance by demographic groups
- Fairness metrics
- Bias identification and mitigation

**C. Stability Analysis**
- Performance over time
- Concept drift detection
- Data drift detection

**D. Model Comparison**
- Compare all models tried
- Justify final model selection
- Trade-offs analysis

#### 3. Model Documentation

**Required:**
- Model card
- Feature importance
- Limitations
- Usage instructions

### Evaluation Criteria

- Model performance (30%)
- Evaluation thoroughness (25%)
- Bias analysis (20%)
- Documentation quality (15%)
- Code quality (10%)

---

## Phase 4: Decision Framework & Integration

### Deliverables

#### 1. Decision Framework

**Required Components:**

**A. Threshold Optimization**
- Cost-benefit analysis
- Optimal threshold calculation
- Threshold justification

**B. Decision Policy**
- Score → Action mapping
- Tiered policies (if applicable)
- Context-aware decisions (if applicable)

**C. Business Impact Analysis**
- Expected ROI
- Cost-benefit breakdown
- Risk assessment

**Example:**
```python
def retention_decision_policy(churn_probability, customer_value):
    if churn_probability >= 0.7:
        return {
            'action': 'aggressive_retention',
            'discount': 0.20,
            'priority': 'critical'
        }
    elif churn_probability >= 0.4:
        return {
            'action': 'standard_retention',
            'discount': 0.10,
            'priority': 'high'
        }
    elif churn_probability >= 0.2:
        return {
            'action': 'light_retention',
            'discount': 0.05,
            'priority': 'medium'
        }
    else:
        return {
            'action': 'no_action',
            'priority': 'low'
        }
```

#### 2. Monitoring Plan

**Required:**
- Metrics to monitor
- Monitoring infrastructure (design)
- Alerting rules
- Retraining strategy

#### 3. Integration Design

**Required:**
- How predictions will be used
- Integration points
- API design (if applicable)
- Batch vs real-time strategy

### Evaluation Criteria

- Decision framework quality (35%)
- Business impact analysis (25%)
- Monitoring plan (20%)
- Integration design (20%)

---

## Phase 5: Presentation & Defense

### Deliverables

#### 1. Executive Presentation

**Format:** 10-minute presentation + 5-minute Q&A

**Required Slides:**

1. **Problem & Impact** (2 min)
   - Business problem
   - Why it matters
   - Expected impact

2. **Solution Overview** (2 min)
   - What you built
   - How it works (high-level)
   - Key innovations

3. **Results** (3 min)
   - Model performance
   - Business impact (if available)
   - Segment analysis

4. **Decision Framework** (2 min)
   - How predictions become actions
   - Expected ROI
   - Risk mitigation

5. **Next Steps** (1 min)
   - Implementation plan
   - Resource needs
   - Timeline

#### 2. Technical Deep-Dive (Optional, for technical audience)

**Cover:**
- Model architecture
- Feature engineering details
- Evaluation methodology
- Technical challenges and solutions

#### 3. Code Repository

**Required:**
- Well-organized code
- README with setup instructions
- Documentation
- Tests (if applicable)

### Evaluation Criteria

- Presentation quality (30%)
- Technical depth (25%)
- Business alignment (20%)
- Q&A performance (15%)
- Code quality (10%)

---

## Project Options

### Option 1: Customer Churn Prediction

**Problem:** Predict which customers will churn in the next 30 days.

**Deliverables:**
- Churn prediction model
- Retention decision framework
- Campaign targeting system

**Data Needed:**
- Customer transaction history
- Engagement data (logins, page views)
- Support ticket data
- Churn labels (customers who canceled)

### Option 2: Demand Forecasting

**Problem:** Forecast product demand for next 4 weeks.

**Deliverables:**
- Demand forecasting model
- Inventory planning recommendations
- Uncertainty quantification

**Data Needed:**
- Historical sales data
- Product features
- Seasonal patterns
- External factors (holidays, promotions)

### Option 3: Customer Lifetime Value (LTV)

**Problem:** Predict customer lifetime value at acquisition.

**Deliverables:**
- LTV prediction model
- Customer acquisition prioritization
- Marketing budget allocation

**Data Needed:**
- Customer acquisition data
- Transaction history
- Customer attributes
- LTV labels (for existing customers)

### Option 4: Lead Scoring

**Problem:** Rank leads by likelihood to convert.

**Deliverables:**
- Lead scoring model
- Sales prioritization system
- Conversion prediction

**Data Needed:**
- Lead attributes
- Lead behavior data
- Conversion labels
- Sales cycle information

### Option 5: Your Own Problem

**Requirements:**
- Must be a real business problem
- Must have accessible data
- Must enable actionable decisions
- Must be approved by instructor

---

## Grading Rubric

### Overall Project Grade

**Components:**
- Phase 1: Problem Framing (15%)
- Phase 2: Feature Engineering (20%)
- Phase 3: Model Development (25%)
- Phase 4: Decision Framework (20%)
- Phase 5: Presentation (20%)

**Passing:** 70% overall + all phases completed

### Quality Standards

**Excellent (90-100%):**
- Production-ready code
- Comprehensive evaluation
- Strong business alignment
- Clear communication
- Innovative solutions

**Good (80-89%):**
- Solid implementation
- Good evaluation
- Good business alignment
- Clear communication
- Some areas for improvement

**Satisfactory (70-79%):**
- Basic implementation
- Adequate evaluation
- Some business alignment
- Acceptable communication
- Several areas need work

**Needs Improvement (<70%):**
- Incomplete implementation
- Insufficient evaluation
- Poor business alignment
- Unclear communication
- Major gaps

---

## Resources & Support

### Office Hours

- **Weekly:** Tuesday/Thursday 6-7 PM EST
- **Project-specific:** Additional hours during capstone weeks
- **Slack/Discord:** Daily support channel

### Data Sources

**If you need data:**
- Kaggle datasets
- UCI Machine Learning Repository
- Company data (if available)
- Synthetic data (with instructor approval)

### Tools & Libraries

**Recommended:**
- Python: pandas, numpy, scikit-learn
- ML: XGBoost, LightGBM, CatBoost
- Evaluation: SHAP, Evidently AI
- Visualization: matplotlib, seaborn, plotly
- Documentation: Jupyter notebooks, Markdown

---

## Timeline

### Week 9

- **Days 1-2:** Problem framing & data exploration
- **Days 3-4:** Feature engineering
- **Days 5-7:** Model development & evaluation

### Week 10

- **Days 1-3:** Decision framework & integration
- **Days 4-5:** Presentation preparation & delivery

### Milestones

- **End of Week 9, Day 2:** Problem definition due
- **End of Week 9, Day 4:** Feature pipeline due
- **End of Week 9, Day 7:** Model evaluation due
- **End of Week 10, Day 3:** Decision framework due
- **Week 10, Days 4-5:** Presentations

---

## Success Tips

1. **Start Early:** Don't wait until the last minute
2. **Iterate:** Build incrementally, test frequently
3. **Document:** Write as you go, not at the end
4. **Communicate:** Regular check-ins with stakeholders
5. **Focus on Impact:** Always tie back to business value
6. **Ask for Help:** Use office hours and community

---

## Final Notes

**Remember:**
- This is a **learning experience** — it's okay to make mistakes
- **Business impact** matters more than perfect metrics
- **Communication** is as important as technical skills
- **Iteration** is better than perfection

**Goal:**
> Build a predictive model that is **used**, **trusted**, and **embedded** in real business workflows.

**You won't just predict the future — you'll help decide it.**

---

## Submission

### Final Deliverables

1. **Code Repository** (GitHub/GitLab)
   - All code
   - README
   - Documentation

2. **Project Report** (PDF)
   - Problem definition
   - Methodology
   - Results
   - Business impact
   - Recommendations

3. **Presentation** (Slides + Recording)
   - Executive presentation
   - Technical deep-dive (optional)

4. **Model Artifacts**
   - Trained model
   - Feature pipeline
   - Evaluation results

**Due Date:** End of Week 10

---

**Good luck! You've got this! 🚀**

---

**Back to [Course Overview →](README.md)**
