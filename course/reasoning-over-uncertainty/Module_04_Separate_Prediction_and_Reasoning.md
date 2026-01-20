---
title: "Module 4: The Core Design Pattern: Separate Prediction and Reasoning"
description: "Learn the fundamental design pattern for hybrid forecasting systems"
module: "4"
week: 4
order: 4
---

# Module 4: The Core Design Pattern: Separate Prediction and Reasoning

**Duration:** Week 4  
**Learning Objectives:**
- Understand functional decomposition of forecasting systems
- Learn the "Numbers first, language second" principle
- Identify when not to let LLMs generate probabilities
- Understand why LLMs should be forecast interpreters, not forecasters
- Apply separation of roles in forecasting prompts

---

## 4.1 Functional Decomposition of Forecasting Systems

### Introduction

The key insight of hybrid forecasting systems is to separate the prediction task from the reasoning task. Each component does what it's best at.

### The Two-Layer Architecture

#### Layer 1: Prediction Layer

**Purpose:** Generate quantitative forecasts with uncertainty.

**Components:**
- Statistical models (ARIMA, Prophet, etc.)
- Machine learning models
- Expert elicitation
- Ensemble methods

**Outputs:**
- Point forecasts
- Probability distributions
- Confidence intervals
- Prediction intervals

**Characteristics:**
- Quantitative
- Probabilistic
- Validated
- Calibrated (ideally)

#### Layer 2: Reasoning Layer

**Purpose:** Interpret forecasts, reason about scenarios, and communicate insights.

**Components:**
- LLMs
- Human experts
- Structured reasoning frameworks

**Inputs:**
- Forecasts from Layer 1
- Context and assumptions
- Scenarios and alternatives

**Outputs:**
- Interpretations
- Explanations
- Scenario analysis
- Recommendations

**Characteristics:**
- Qualitative
- Narrative
- Contextual
- Communicative

### Why Separation Matters

**1. Specialization**
- Each layer does what it's best at
- Statistical models: quantitative prediction
- LLMs: reasoning and communication

**2. Validation**
- Can validate prediction layer independently
- Can evaluate reasoning layer separately
- Clear accountability

**3. Flexibility**
- Can swap out components
- Can improve layers independently
- Can combine multiple approaches

**4. Transparency**
- Clear what each layer does
- Easier to debug
- Easier to explain

---

## 4.2 "Numbers First, Language Second"

### The Principle

**Numbers First:** Generate quantitative forecasts using statistical/ML methods.

**Language Second:** Use LLMs to interpret, explain, and reason about those forecasts.

### Why This Order Matters

**If You Do It Backwards (Language First):**
```
LLM generates: "The market will likely rise 5-10% next quarter"
Problem: 
- No statistical foundation
- Overconfident
- Poorly calibrated
- Cannot be validated
```

**If You Do It Right (Numbers First):**
```
Statistical Model: "Market has 60% probability of being 
                    between 4,200 and 4,500 in 3 months"
LLM interprets: "The forecast suggests moderate optimism, 
                 with the market likely to continue its 
                 current trend, though with significant 
                 uncertainty..."
Benefit:
- Statistical foundation
- Quantified uncertainty
- Can be validated
- LLM adds value through interpretation
```

### The Workflow

**Step 1: Generate Forecasts (Numbers)**
- Use statistical/ML models
- Quantify uncertainty
- Generate distributions
- Validate models

**Step 2: Structure Forecasts**
- Format forecasts for LLM input
- Include uncertainty information
- Provide context and assumptions
- Create scenario tables

**Step 3: LLM Reasoning (Language)**
- Interpret forecasts
- Explain implications
- Reason about scenarios
- Communicate uncertainty

**Step 4: Refinement Loop**
- LLM may identify issues
- May suggest model improvements
- May highlight missing scenarios
- Iterate as needed

---

## 4.3 When Not to Let LLMs Generate Probabilities

### The Problem

**LLMs are poor at:**
- Generating well-calibrated probabilities
- Quantifying uncertainty accurately
- Making statistical predictions
- Validating their own predictions

### When LLMs Should NOT Generate Probabilities

**1. Direct Prediction Tasks**
```
Bad: "What's the probability of a recession next year?"
LLM: "There is a 30% chance..."
Problem: LLM is generating probability, not reasoning about it
```

**2. Statistical Forecasting**
```
Bad: "Forecast next quarter's sales"
LLM: "Sales will be $1.2M with 80% confidence..."
Problem: LLM is doing forecasting, not interpreting forecasts
```

**3. Uncertainty Quantification**
```
Bad: "How uncertain is this forecast?"
LLM: "The forecast has moderate uncertainty, around 20-30%..."
Problem: LLM is quantifying uncertainty, not explaining it
```

### When LLMs SHOULD Work with Probabilities

**1. Interpreting Given Probabilities**
```
Good: "Given this forecast shows a 60% probability of 
       growth, what does this mean?"
LLM: "This suggests moderate optimism, but significant 
      uncertainty remains..."
Benefit: LLM interprets, doesn't generate
```

**2. Reasoning About Scenarios**
```
Good: "Given these probability distributions, what 
       scenarios should we consider?"
LLM: "The high-probability scenario suggests..., while 
      the tail risk scenario indicates..."
Benefit: LLM reasons about probabilities, doesn't create them
```

**3. Explaining Uncertainty**
```
Good: "Explain why this forecast has wide confidence 
       intervals"
LLM: "The wide intervals reflect several sources of 
      uncertainty: model uncertainty, parameter 
      uncertainty, and process uncertainty..."
Benefit: LLM explains uncertainty, doesn't quantify it
```

### The Rule

**LLMs should REASON ABOUT probabilities, not GENERATE probabilities.**

---

## 4.4 LLMs as Forecast Interpreters, Not Forecasters

### The Role Shift

**Old (Wrong) Approach:**
- LLM as forecaster
- LLM generates predictions
- LLM quantifies uncertainty
- LLM makes statistical claims

**New (Right) Approach:**
- LLM as interpreter
- LLM receives forecasts
- LLM explains and reasons
- LLM communicates insights

### What LLMs Are Good At (As Interpreters)

**1. Narrative Construction**
- Explain what forecasts mean
- Connect forecasts to context
- Create coherent explanations
- Communicate to humans

**2. Scenario Analysis**
- Explore different scenarios
- Reason about implications
- Consider alternatives
- Think through consequences

**3. Pattern Recognition (Qualitative)**
- Identify interesting patterns
- Connect to domain knowledge
- Recognize anomalies
- Suggest investigations

**4. Communication**
- Translate technical forecasts to plain language
- Explain uncertainty clearly
- Make forecasts accessible
- Build understanding

### What LLMs Are Bad At (As Forecasters)

**1. Statistical Prediction**
- Generating calibrated probabilities
- Quantifying uncertainty accurately
- Making validated predictions
- Handling distribution shift

**2. Numerical Accuracy**
- Precise calculations
- Statistical modeling
- Parameter estimation
- Model validation

**3. Calibration**
- Well-calibrated probabilities
- Accurate uncertainty ranges
- Proper risk assessment
- Validated predictions

### The Hybrid Approach

**Statistical Models:**
- Generate forecasts
- Quantify uncertainty
- Provide numbers

**LLMs:**
- Interpret forecasts
- Explain implications
- Reason about scenarios
- Communicate insights

**Together:**
- Best of both worlds
- Statistical rigor + narrative understanding
- Quantitative forecasts + qualitative reasoning

---

## 4.5 Practical Implementation

### Example 1: Economic Forecasting

**Step 1: Statistical Forecast**
```python
# Statistical model generates forecast
forecast = {
    'point': 2.5,  # GDP growth %
    'distribution': 'normal',
    'mean': 2.5,
    'std': 0.8,
    'ci_80': [1.5, 3.5],
    'ci_95': [0.9, 4.1]
}
```

**Step 2: Structure for LLM**
```json
{
  "forecast": {
    "variable": "GDP Growth",
    "horizon": "Next Quarter",
    "point_forecast": 2.5,
    "distribution": "Normal(2.5, 0.8)",
    "confidence_intervals": {
      "80%": [1.5, 3.5],
      "95%": [0.9, 4.1]
    }
  },
  "context": {
    "current_growth": 2.1,
    "historical_average": 2.3,
    "recent_trend": "moderate_increase"
  }
}
```

**Step 3: LLM Reasoning**
```
Prompt: "Given this GDP growth forecast, interpret what 
         it means and explain the key implications."

LLM Response: "The forecast suggests moderate economic 
               growth continuing into the next quarter, 
               with the central estimate of 2.5% slightly 
               above the historical average. The wide 
               confidence intervals (80% range: 1.5-3.5%) 
               reflect significant uncertainty, potentially 
               due to..."
```

### Example 2: Sales Forecasting

**Step 1: Statistical Forecast**
```python
forecast = {
    'monthly_sales': [120000, 135000, 150000],
    'seasonal_adjustment': 'high_season',
    'uncertainty': 'moderate',
    'ci_95': [[100000, 140000], 
              [115000, 155000], 
              [130000, 170000]]
}
```

**Step 2: LLM Interpretation**
```
Prompt: "Interpret this sales forecast and identify key 
         risks and opportunities."

LLM Response: "The forecast shows strong growth into the 
               high season, with sales expected to increase 
               from $120K to $150K over three months. 
               However, the wide confidence intervals 
               suggest significant uncertainty. Key risks 
               include..."
```

---

## Assignment: Rewrite a Forecasting Prompt Using Separation of Roles

### Objective

Take a forecasting task that incorrectly uses an LLM as a forecaster and redesign it to use the separation of roles pattern.

### Tasks

1. **Find or Create a Bad Example (30 min)**
   - Find a prompt that asks an LLM to forecast directly
   - Or create your own example
   - Document the original prompt

2. **Design Statistical Forecast Layer (2 hours)**
   - Identify appropriate statistical/ML method
   - Design the forecast generation process
   - Specify outputs (point forecasts, distributions, intervals)
   - Document assumptions and limitations

3. **Design LLM Reasoning Layer (2 hours)**
   - Design structured input format for LLM
   - Create prompts for interpretation
   - Specify reasoning tasks
   - Define expected outputs

4. **Implement Separation (2 hours)**
   - Generate statistical forecast (or simulate)
   - Structure forecast for LLM input
   - Run LLM reasoning
   - Compare with original approach

5. **Write Analysis Report (1.5 hours)**
   - 4-6 page report
   - Document original approach and problems
   - Describe new approach
   - Compare results
   - Provide recommendations

### Deliverables

- Original prompt (bad example)
- Statistical forecast design
- LLM reasoning design
- Implementation (code or detailed description)
- 4-6 page report
- Comparison and recommendations

### Evaluation Criteria

- **Separation Quality (30%):** Clear separation of prediction and reasoning
- **Statistical Design (25%):** Appropriate forecasting method
- **LLM Design (25%):** Effective use of LLM as interpreter
- **Analysis (20%):** Quality of analysis and recommendations

### Example Topics

- Sales forecasting
- Economic indicators
- Technology adoption
- Market trends
- Policy outcomes

---

## Key Takeaways

- **Functional Decomposition:** Separate prediction (quantitative) from reasoning (qualitative)
- **Numbers First:** Generate forecasts using statistical/ML methods first
- **Language Second:** Use LLMs to interpret and reason about forecasts
- **Don't Let LLMs Generate Probabilities:** LLMs should reason about probabilities, not create them
- **LLMs as Interpreters:** LLMs excel at interpretation, explanation, and communication, not statistical prediction
- **Hybrid Approach:** Combine statistical rigor with LLM reasoning for best results

---

## Additional Resources

### Reading
- "Prediction Machines" by Agrawal, Gans, Goldfarb (AI and prediction)
- "Superforecasting" by Philip Tetlock (forecasting methods)
- Research papers on hybrid AI systems

### Tools
- Statistical forecasting: Python (statsmodels, prophet), R (forecast)
- LLM APIs: OpenAI, Anthropic, etc.
- Structuring data: JSON, CSV, structured prompts

### Practice
- Practice separating prediction and reasoning
- Design hybrid systems for different domains
- Compare with LLM-only approaches
- Iterate and improve designs

### Next Steps
- Complete Assignment 4
- Review Module 5: Structured Forecast Inputs for LLMs
- Join course discussion forum
- Start thinking about how to structure forecasts for LLMs

---

**Module 4 Complete. Ready for Module 5? →**
