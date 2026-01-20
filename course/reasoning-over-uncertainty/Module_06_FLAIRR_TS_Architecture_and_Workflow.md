---
title: "Module 6: FLAIRR-TS: Architecture and Workflow"
description: "Learn the FLAIRR-TS architecture for hybrid forecasting systems"
module: "6"
week: 6
order: 6
---

# Module 6: FLAIRR-TS: Architecture and Workflow

**Duration:** Week 6  
**Learning Objectives:**
- Understand what FLAIRR-TS is and why it exists
- Learn the prediction layer vs reasoning layer architecture
- Understand Recursive Reasoning & Refinement (RR)
- Learn time-series awareness in hybrid systems
- Map real-world problems into FLAIRR-TS pipelines

---

## 6.1 What FLAIRR-TS Is and Why It Exists

### Introduction

FLAIRR-TS (Forecasting with LLM-Assisted Interpretive Reasoning and Refinement for Time-Series) is a framework for building hybrid forecasting systems that combine statistical forecasting with LLM reasoning.

### The Problem It Solves

**Traditional Statistical Forecasting:**
- Provides quantitative forecasts
- Quantifies uncertainty
- But: Hard to interpret, lacks context, difficult to communicate

**LLM-Only Forecasting:**
- Provides narrative explanations
- Easy to communicate
- But: Poor calibration, no statistical foundation, overconfident

**FLAIRR-TS Solution:**
- Combines statistical rigor with LLM reasoning
- Provides both numbers and narratives
- Maintains calibration while enabling interpretation

### Core Principles

**1. Separation of Concerns**
- Statistical models: quantitative prediction
- LLMs: qualitative reasoning and interpretation

**2. Numbers First, Language Second**
- Generate forecasts first
- Then interpret with LLMs

**3. Recursive Refinement**
- LLM reasoning can identify issues
- Feedback loop improves forecasts
- Iterative improvement

**4. Time-Series Awareness**
- Understands temporal structure
- Handles trends, seasonality, regime shifts
- Maintains temporal context

---

## 6.2 Prediction Layer vs Reasoning Layer

### Architecture Overview

```
┌─────────────────────────────────────────┐
│         PREDICTION LAYER                │
│  (Statistical/ML Models)                │
│                                         │
│  • Time-series models                  │
│  • Probability distributions           │
│  • Uncertainty quantification          │
│  • Forecast generation                 │
└──────────────┬──────────────────────────┘
               │
               │ Structured Forecasts
               │ (JSON, Tables, Distributions)
               │
               ▼
┌─────────────────────────────────────────┐
│         REASONING LAYER                │
│  (LLMs + Human Experts)                │
│                                         │
│  • Forecast interpretation              │
│  • Scenario analysis                    │
│  • Assumption evaluation                │
│  • Communication                        │
└──────────────┬──────────────────────────┘
               │
               │ Insights & Refinements
               │
               ▼
         Final Forecasts
         + Interpretations
```

### Prediction Layer

**Components:**
- Statistical models (ARIMA, Prophet, etc.)
- Machine learning models
- Ensemble methods
- Expert elicitation (quantitative)

**Responsibilities:**
- Generate quantitative forecasts
- Quantify uncertainty
- Provide probability distributions
- Validate models

**Outputs:**
- Point forecasts
- Prediction intervals
- Probability distributions
- Confidence intervals

**Characteristics:**
- Quantitative
- Probabilistic
- Validated
- Calibrated (ideally)

### Reasoning Layer

**Components:**
- LLMs (for interpretation)
- Human experts (for validation)
- Structured reasoning frameworks

**Responsibilities:**
- Interpret forecasts
- Explain implications
- Analyze scenarios
- Evaluate assumptions
- Communicate insights

**Inputs:**
- Forecasts from prediction layer
- Context and domain knowledge
- Historical patterns
- Assumptions

**Outputs:**
- Interpretations
- Explanations
- Scenario analyses
- Recommendations
- Refinement suggestions

**Characteristics:**
- Qualitative
- Narrative
- Contextual
- Communicative

---

## 6.3 Recursive Reasoning & Refinement (RR)

### The Refinement Loop

**Basic Flow:**
```
1. Prediction Layer generates forecast
2. Reasoning Layer interprets forecast
3. Reasoning Layer identifies issues/improvements
4. Feedback to Prediction Layer
5. Refine forecast (if needed)
6. Repeat until satisfactory
```

### Types of Refinement

**1. Model Refinement**
```
LLM identifies: "The forecast doesn't account for 
                seasonal patterns in Q4"
Action: Add seasonal component to model
Result: Improved forecast
```

**2. Assumption Refinement**
```
LLM identifies: "Assumption about policy stability 
                 is questionable"
Action: Create alternative scenarios
Result: More robust forecast
```

**3. Uncertainty Refinement**
```
LLM identifies: "Uncertainty bounds seem too narrow 
                 given recent volatility"
Action: Widen confidence intervals
Result: Better calibrated forecast
```

**4. Scenario Refinement**
```
LLM identifies: "Missing tail risk scenario"
Action: Add extreme scenario
Result: More complete forecast
```

### Implementation

**Step 1: Initial Forecast**
```python
# Prediction Layer
forecast = statistical_model.forecast(
    horizon=3,
    include_uncertainty=True
)
```

**Step 2: LLM Reasoning**
```python
# Reasoning Layer
prompt = f"""
Analyze this forecast and identify:
1. Potential issues
2. Missing considerations
3. Assumption problems
4. Uncertainty concerns

Forecast: {forecast}
"""

llm_analysis = llm.analyze(prompt)
```

**Step 3: Refinement Suggestions**
```python
# LLM suggests refinements
refinements = llm_analysis.extract_refinements()
# Example: ["Add seasonal component", "Widen uncertainty"]
```

**Step 4: Apply Refinements**
```python
# Update forecast based on suggestions
if "seasonal" in refinements:
    forecast = add_seasonal_component(forecast)
if "widen_uncertainty" in refinements:
    forecast = adjust_uncertainty(forecast, wider=True)
```

**Step 5: Iterate**
```python
# Re-run reasoning on refined forecast
refined_analysis = llm.analyze(refined_forecast)
# Continue until satisfactory
```

### When to Stop Refining

**Stop When:**
- LLM identifies no major issues
- Refinements become minor
- Time/budget constraints
- Diminishing returns

**Continue When:**
- Major issues identified
- Significant improvements possible
- High-stakes decisions
- Sufficient resources

---

## 6.4 Time-Series Awareness

### Temporal Structure

**FLAIRR-TS maintains awareness of:**
- Temporal ordering
- Trends and patterns
- Seasonality
- Regime changes
- Historical context

### Temporal Context in LLM Reasoning

**1. Historical Patterns**
```
LLM receives:
- Current forecast
- Historical data
- Past forecasts and outcomes

LLM can:
- Compare with historical patterns
- Identify anomalies
- Recognize regime changes
- Learn from past mistakes
```

**2. Trend Awareness**
```
Forecast: "Sales increasing 5% per quarter"
LLM reasoning: "This continues the upward trend 
                observed over the past 2 years, 
                suggesting sustained growth..."
```

**3. Seasonality Recognition**
```
Forecast: "Q4 sales: 150K"
LLM reasoning: "This is consistent with historical 
                Q4 patterns, which typically show 
                20% increase over Q3..."
```

**4. Regime Change Detection**
```
LLM reasoning: "Recent data shows a break from 
                historical patterns, suggesting a 
                regime change. The forecast may 
                need adjustment..."
```

### Temporal Reasoning Prompts

**Example:**
```
Given this time-series forecast and historical context:

CURRENT FORECAST:
- Next quarter: 120K ± 10K
- Next year: 500K ± 50K

HISTORICAL CONTEXT:
- Past 4 quarters: [100K, 105K, 110K, 115K]
- Historical average: 108K
- Seasonal pattern: Q4 typically 15% higher

ANALYSIS TASKS:
1. Compare forecast with historical trends
2. Assess if forecast is consistent with patterns
3. Identify potential regime changes
4. Evaluate seasonal expectations
5. Recommend adjustments if needed
```

---

## 6.5 Complete FLAIRR-TS Workflow

### Step-by-Step Process

**Phase 1: Data Preparation**
1. Collect time-series data
2. Clean and preprocess
3. Identify patterns (trend, seasonality)
4. Split into train/validation/test

**Phase 2: Forecast Generation**
1. Select appropriate models
2. Fit models to data
3. Generate forecasts
4. Quantify uncertainty
5. Create probability distributions

**Phase 3: Structure for LLM**
1. Format forecasts (JSON, tables)
2. Create scenario tables
3. List assumptions
4. Provide historical context
5. Define uncertainty bounds

**Phase 4: LLM Reasoning**
1. Send structured forecast to LLM
2. LLM interprets forecast
3. LLM analyzes scenarios
4. LLM evaluates assumptions
5. LLM identifies issues

**Phase 5: Refinement**
1. Review LLM suggestions
2. Validate suggestions
3. Apply refinements
4. Regenerate forecasts (if needed)
5. Re-run reasoning

**Phase 6: Final Output**
1. Combine forecasts and interpretations
2. Create final report
3. Communicate to stakeholders
4. Document assumptions
5. Plan monitoring

### Example: Complete Workflow

**Domain:** Sales Forecasting

**Step 1: Data**
```python
sales_data = load_sales_data(start='2020-01', end='2024-12')
# Monthly sales: [100K, 105K, 110K, ...]
```

**Step 2: Forecast**
```python
model = Prophet()
model.fit(sales_data)
forecast = model.predict(horizon=12)
# Next 12 months with uncertainty
```

**Step 3: Structure**
```json
{
  "forecast": {
    "horizon": "12 months",
    "point_forecasts": [120, 125, 130, ...],
    "uncertainty": {
      "80%_ci": [[110, 130], [115, 135], ...],
      "95%_ci": [[105, 135], [110, 140], ...]
    }
  },
  "scenarios": [...],
  "assumptions": [...],
  "historical_context": {...}
}
```

**Step 4: LLM Reasoning**
```python
prompt = create_flairr_prompt(structured_forecast)
llm_analysis = llm.analyze(prompt)
```

**Step 5: Refinement**
```python
if llm_analysis.suggests_refinement():
    refined_forecast = apply_refinements(forecast, llm_analysis)
    llm_analysis = llm.analyze(refined_forecast)
```

**Step 6: Output**
```python
final_report = combine(forecast, llm_analysis)
```

---

## Assignment: Map a Real-World Forecasting Problem into a FLAIRR-TS Pipeline

### Objective

Take a real-world forecasting problem and design a complete FLAIRR-TS pipeline for it.

### Tasks

1. **Select a Problem (30 min)**
   - Choose a real-world forecasting problem
   - Identify stakeholders and use cases
   - Define success criteria

2. **Design Prediction Layer (3 hours)**
   - Select appropriate forecasting methods
   - Design data pipeline
   - Specify forecast outputs
   - Define uncertainty quantification

3. **Design Reasoning Layer (2.5 hours)**
   - Design LLM input structure
   - Create reasoning prompts
   - Define refinement process
   - Specify output format

4. **Design Complete Workflow (2 hours)**
   - Map out all steps
   - Define data flows
   - Specify iteration process
   - Design monitoring

5. **Create Implementation Plan (1.5 hours)**
   - Technical architecture
   - Tools and technologies
   - Implementation steps
   - Testing strategy

6. **Write Design Document (1.5 hours)**
   - 6-8 page document
   - Complete pipeline design
   - Implementation plan
   - Expected outcomes

### Deliverables

- Problem description
- Prediction layer design
- Reasoning layer design
- Complete workflow diagram
- Implementation plan
- 6-8 page design document

### Evaluation Criteria

- **Pipeline Design (30%):** Complete and well-structured pipeline
- **Prediction Layer (25%):** Appropriate forecasting methods
- **Reasoning Layer (25%):** Effective LLM integration
- **Documentation (20%):** Clear and comprehensive documentation

### Example Problems

- Economic forecasting (GDP, inflation, unemployment)
- Climate forecasting (temperature, precipitation, sea level)
- Technology adoption (AI, electric vehicles, renewable energy)
- Market forecasting (stock prices, real estate, commodities)
- Policy outcomes (elections, regulations, international relations)
- Business metrics (sales, revenue, customer acquisition)

---

## Key Takeaways

- **FLAIRR-TS:** Framework for hybrid forecasting combining statistical rigor with LLM reasoning
- **Two-Layer Architecture:** Prediction layer (quantitative) + Reasoning layer (qualitative)
- **Recursive Refinement:** Iterative improvement through LLM feedback
- **Time-Series Awareness:** Maintains temporal context and patterns
- **Complete Workflow:** End-to-end process from data to final forecasts
- **Separation of Concerns:** Each layer does what it's best at

---

## Additional Resources

### Reading
- Research papers on hybrid AI systems
- "Superforecasting" by Philip Tetlock (forecasting methods)
- "Prediction Machines" by Agrawal, Gans, Goldfarb (AI and prediction)

### Tools
- Statistical forecasting: Python (statsmodels, prophet), R (forecast)
- LLM APIs: OpenAI, Anthropic, etc.
- Workflow tools: Python scripts, Jupyter notebooks, workflow engines

### Practice
- Design FLAIRR-TS pipelines for different domains
- Implement simplified versions
- Test and iterate
- Share and compare designs

### Next Steps
- Complete Assignment 6
- Review Module 7: Probabilistic Reasoning with LLMs
- Join course discussion forum
- Start thinking about evaluation methods

---

**Module 6 Complete. Ready for Module 7? →**
