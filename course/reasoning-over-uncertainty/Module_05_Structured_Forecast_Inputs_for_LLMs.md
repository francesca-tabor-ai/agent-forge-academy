---
title: "Module 5: Structured Forecast Inputs for LLMs"
description: "Learn how to structure forecasts for effective LLM reasoning"
module: "5"
week: 5
order: 5
---

# Module 5: Structured Forecast Inputs for LLMs

**Duration:** Week 5  
**Learning Objectives:**
- Design scenario tables for LLM input
- Structure probability distributions as inputs
- Create decision trees for reasoning
- Develop assumption lists and uncertainty bounds
- Use prompt scaffolding and constraint-based reasoning
- Prevent narrative drift in LLM outputs

---

## 5.1 Scenario Tables

### Introduction

Scenario tables provide structured representations of multiple possible futures, making it easier for LLMs to reason about uncertainty and alternatives.

### Basic Scenario Table Structure

**Format:**
```
Scenario | Probability | Key Variables | Outcomes
---------|-------------|---------------|----------
Base Case | 60% | Growth: 2-3% | Moderate expansion
Optimistic | 25% | Growth: 4-5% | Strong expansion
Pessimistic | 15% | Growth: 0-1% | Stagnation/decline
```

### Example: Economic Forecast Scenarios

```json
{
  "scenarios": [
    {
      "name": "Base Case",
      "probability": 0.60,
      "description": "Continued moderate growth",
      "variables": {
        "gdp_growth": {"mean": 2.5, "range": [2.0, 3.0]},
        "inflation": {"mean": 2.2, "range": [1.8, 2.6]},
        "unemployment": {"mean": 3.8, "range": [3.5, 4.2]}
      },
      "key_assumptions": [
        "No major policy changes",
        "Continued moderate demand",
        "Stable global conditions"
      ]
    },
    {
      "name": "Optimistic",
      "probability": 0.25,
      "description": "Stronger than expected growth",
      "variables": {
        "gdp_growth": {"mean": 4.0, "range": [3.5, 4.5]},
        "inflation": {"mean": 2.5, "range": [2.0, 3.0]},
        "unemployment": {"mean": 3.2, "range": [2.8, 3.6]}
      },
      "key_assumptions": [
        "Favorable policy environment",
        "Strong consumer confidence",
        "Positive global trade conditions"
      ]
    },
    {
      "name": "Pessimistic",
      "probability": 0.15,
      "description": "Slower growth or recession",
      "variables": {
        "gdp_growth": {"mean": 0.5, "range": [-0.5, 1.5]},
        "inflation": {"mean": 1.5, "range": [1.0, 2.0]},
        "unemployment": {"mean": 4.5, "range": [4.0, 5.0]}
      },
      "key_assumptions": [
        "Policy uncertainty",
        "Reduced consumer spending",
        "Global economic headwinds"
      ]
    }
  ]
}
```

### Using Scenario Tables with LLMs

**Prompt Structure:**
```
Given these economic forecast scenarios:

[Scenario Table JSON]

1. Analyze the key differences between scenarios
2. Identify the most critical assumptions
3. Explain what would need to happen for each scenario
4. Recommend which scenario to use for planning
5. Identify risks and opportunities in each scenario
```

**Benefits:**
- Forces LLM to consider multiple futures
- Prevents overconfidence in single scenario
- Enables structured reasoning
- Makes assumptions explicit

---

## 5.2 Probability Distributions as Inputs

### Representing Distributions

**Format Options:**

**1. Parametric Distributions:**
```json
{
  "variable": "sales_next_quarter",
  "distribution": "normal",
  "parameters": {
    "mean": 120000,
    "std": 15000
  },
  "quantiles": {
    "10th": 100800,
    "25th": 109900,
    "50th": 120000,
    "75th": 130100,
    "90th": 139200
  }
}
```

**2. Non-Parametric (Empirical):**
```json
{
  "variable": "market_share",
  "distribution": "empirical",
  "samples": [0.15, 0.18, 0.20, 0.22, 0.25, 0.28, 0.30],
  "probabilities": [0.05, 0.10, 0.20, 0.30, 0.20, 0.10, 0.05]
}
```

**3. Interval-Based:**
```json
{
  "variable": "temperature",
  "intervals": [
    {"range": [60, 70], "probability": 0.20},
    {"range": [70, 80], "probability": 0.50},
    {"range": [80, 90], "probability": 0.25},
    {"range": [90, 100], "probability": 0.05}
  ]
}
```

### LLM Prompt for Distribution Reasoning

```
Given this probability distribution for sales:

Distribution: Normal(mean=120000, std=15000)
Quantiles:
- 10th percentile: 100,800
- 25th percentile: 109,900
- 50th percentile: 120,000
- 75th percentile: 130,100
- 90th percentile: 139,200

1. Interpret what this distribution means
2. Explain the uncertainty (width of distribution)
3. Identify what scenarios correspond to different quantiles
4. Recommend how to use this for decision-making
5. Explain what would need to happen for extreme outcomes
```

---

## 5.3 Decision Trees

### Structure

Decision trees help LLMs reason through conditional logic and sequential decisions.

**Format:**
```json
{
  "root": {
    "condition": "Policy Change",
    "branches": [
      {
        "outcome": "Policy Enacted",
        "probability": 0.60,
        "child": {
          "condition": "Market Response",
          "branches": [
            {
              "outcome": "Positive Response",
              "probability": 0.70,
              "forecast": {"growth": 4.0, "uncertainty": "low"}
            },
            {
              "outcome": "Negative Response",
              "probability": 0.30,
              "forecast": {"growth": 1.0, "uncertainty": "high"}
            }
          ]
        }
      },
      {
        "outcome": "No Policy Change",
        "probability": 0.40,
        "forecast": {"growth": 2.5, "uncertainty": "moderate"}
      }
    ]
  }
}
```

### Using Decision Trees with LLMs

**Prompt:**
```
Given this decision tree for policy impact:

[Decision Tree JSON]

1. Trace through each path
2. Calculate expected outcomes
3. Identify the most critical decision points
4. Recommend which path to prepare for
5. Suggest how to reduce uncertainty at key nodes
```

---

## 5.4 Assumption Lists and Uncertainty Bounds

### Assumption Lists

**Purpose:** Make implicit assumptions explicit so LLMs can reason about them.

**Format:**
```json
{
  "forecast": {
    "variable": "renewable_energy_adoption",
    "point_forecast": 0.45,
    "uncertainty_range": [0.30, 0.60]
  },
  "assumptions": [
    {
      "assumption": "Policy support continues",
      "impact": "high",
      "uncertainty": "moderate",
      "if_false": "Forecast would be 0.10-0.20 lower"
    },
    {
      "assumption": "Technology costs continue declining",
      "impact": "high",
      "uncertainty": "low",
      "if_false": "Forecast would be 0.15-0.25 lower"
    },
    {
      "assumption": "No major supply chain disruptions",
      "impact": "moderate",
      "uncertainty": "high",
      "if_false": "Forecast would be 0.05-0.15 lower"
    }
  ]
}
```

### Uncertainty Bounds

**Format:**
```json
{
  "forecast": {
    "central": 2.5,
    "bounds": {
      "optimistic": 4.0,
      "pessimistic": 1.0,
      "extreme_optimistic": 5.5,
      "extreme_pessimistic": -0.5
    },
    "confidence_intervals": {
      "50%": [2.0, 3.0],
      "80%": [1.5, 3.5],
      "95%": [1.0, 4.0],
      "99%": [0.5, 4.5]
    }
  }
}
```

### LLM Prompt for Assumption Analysis

```
Given this forecast and its assumptions:

[Forecast with Assumptions JSON]

1. Identify which assumptions are most critical
2. Explain what would happen if each assumption fails
3. Assess the uncertainty of each assumption
4. Recommend how to reduce uncertainty
5. Suggest alternative scenarios based on assumption changes
```

---

## 5.5 Prompt Scaffolding

### What is Prompt Scaffolding?

**Definition:** Structuring prompts to guide LLM reasoning step-by-step, preventing narrative drift and ensuring systematic analysis.

### Scaffolding Techniques

**1. Step-by-Step Reasoning:**
```
Step 1: Identify key variables and their forecasts
Step 2: Analyze relationships between variables
Step 3: Consider different scenarios
Step 4: Evaluate assumptions
Step 5: Synthesize insights
```

**2. Constraint-Based Reasoning:**
```
Constraints:
- Do not generate new probabilities
- Only reason about provided forecasts
- Stay within uncertainty bounds
- Reference specific scenarios
```

**3. Template-Based:**
```
Template:
- Forecast Summary: [LLM fills in]
- Key Insights: [LLM fills in]
- Critical Assumptions: [LLM fills in]
- Risks and Opportunities: [LLM fills in]
- Recommendations: [LLM fills in]
```

### Example: Scaffolded Prompt

```
You are analyzing an economic forecast. Follow these steps:

STEP 1: Summarize the Forecast
- What is being forecasted?
- What is the central estimate?
- What is the uncertainty range?

STEP 2: Analyze Scenarios
- What are the different scenarios?
- What are their probabilities?
- What are the key differences?

STEP 3: Evaluate Assumptions
- What are the critical assumptions?
- Which assumptions are most uncertain?
- What happens if assumptions fail?

STEP 4: Identify Implications
- What does this mean for decision-making?
- What are the key risks?
- What are the opportunities?

STEP 5: Provide Recommendations
- How should this forecast be used?
- What actions should be taken?
- What should be monitored?

CONSTRAINTS:
- Do not generate new forecasts or probabilities
- Only reason about the provided forecasts
- Stay within the uncertainty bounds
- Reference specific scenarios from the input
```

---

## 5.6 Constraint-Based Reasoning

### Purpose

Prevent LLMs from:
- Generating new probabilities
- Creating forecasts
- Going beyond provided data
- Narrative drift

### Constraint Types

**1. Output Constraints:**
```
- Do not generate probabilities
- Do not create forecasts
- Only interpret provided forecasts
- Stay within uncertainty bounds
```

**2. Input Constraints:**
```
- Only use provided data
- Do not add external information
- Reference specific scenarios
- Use provided assumptions
```

**3. Reasoning Constraints:**
```
- Follow structured reasoning steps
- Reference specific forecasts
- Explain reasoning explicitly
- Acknowledge uncertainty
```

### Example: Constrained Prompt

```
Analyze this forecast with the following constraints:

CONSTRAINTS:
1. Do NOT generate new probabilities or forecasts
2. Only reason about the provided forecast data
3. Reference specific scenarios by name
4. Stay within the provided uncertainty bounds
5. Do not add information not in the input

FORECAST DATA:
[Structured Forecast JSON]

TASKS:
1. Interpret the forecast (using only provided data)
2. Explain uncertainty (using provided bounds)
3. Analyze scenarios (from provided scenarios)
4. Evaluate assumptions (from provided assumptions)
5. Provide recommendations (based on analysis)
```

---

## 5.7 Preventing Narrative Drift

### What is Narrative Drift?

**Definition:** When LLMs generate coherent but unsupported narratives that go beyond the provided forecasts.

### Common Drift Patterns

**1. Adding Details:**
```
Input: "Sales forecast: 120K ± 15K"
LLM: "Sales will likely be strong due to new marketing 
      campaign and seasonal trends..."
Problem: Added details not in forecast
```

**2. Overconfidence:**
```
Input: "60% probability of growth"
LLM: "Growth is very likely..."
Problem: Overstated confidence
```

**3. Causal Stories:**
```
Input: "Correlation between A and B"
LLM: "A causes B because..."
Problem: Assumed causation
```

### Prevention Strategies

**1. Explicit Constraints:**
- State what LLM should NOT do
- Provide examples of drift
- Reinforce constraints

**2. Structured Output:**
- Use templates
- Require citations
- Force explicit reasoning

**3. Validation:**
- Check outputs against inputs
- Verify no new information added
- Ensure uncertainty preserved

**4. Iterative Refinement:**
- Review outputs
- Identify drift
- Refine prompts
- Re-run

### Example: Anti-Drift Prompt

```
Analyze this forecast. IMPORTANT: Do not add information 
not in the forecast.

FORECAST:
- Variable: Sales
- Central: 120K
- Range: [105K, 135K]
- Scenarios: Base (60%), Optimistic (25%), Pessimistic (15%)

CONSTRAINTS:
- Do NOT add details about marketing, trends, or causes
- Do NOT create new scenarios
- Do NOT modify probabilities
- Only interpret what is provided

If you find yourself adding information not in the forecast, 
stop and re-read the constraints.
```

---

## Assignment: Design a Structured Forecast Input Schema for an LLM

### Objective

Design a complete structured input schema for feeding forecasts to an LLM, including scenarios, distributions, assumptions, and constraints.

### Tasks

1. **Select a Forecasting Domain (30 min)**
   - Choose a domain (economics, climate, technology, etc.)
   - Identify key variables to forecast
   - Determine forecast horizon

2. **Design Statistical Forecast Layer (2 hours)**
   - Choose forecasting method
   - Generate or simulate forecasts
   - Quantify uncertainty
   - Create distributions

3. **Design Structured Input Schema (3 hours)**
   - Create scenario tables
   - Structure probability distributions
   - List assumptions
   - Define uncertainty bounds
   - Create decision trees (if applicable)

4. **Design LLM Prompt (2 hours)**
   - Create scaffolded prompt
   - Add constraints
   - Define output format
   - Include anti-drift measures

5. **Test and Refine (1.5 hours)**
   - Test with LLM
   - Identify drift
   - Refine schema
   - Improve prompts

6. **Write Design Document (1.5 hours)**
   - 5-7 page document
   - Document schema design
   - Explain choices
   - Provide examples
   - Include test results

### Deliverables

- Forecast data (statistical forecasts)
- Structured input schema (JSON or similar)
- LLM prompts
- Test outputs
- 5-7 page design document
- Refinement notes

### Evaluation Criteria

- **Schema Quality (30%):** Well-structured, comprehensive schema
- **Prompt Design (25%):** Effective scaffolding and constraints
- **Drift Prevention (25%):** Successfully prevents narrative drift
- **Documentation (20%):** Clear documentation and examples

### Example Domains

- Economic forecasting (GDP, inflation, unemployment)
- Climate forecasting (temperature, precipitation, sea level)
- Technology adoption (AI, electric vehicles, renewable energy)
- Market forecasting (stock prices, real estate, commodities)
- Policy outcomes (elections, regulations, international relations)

---

## Key Takeaways

- **Scenario Tables:** Structure multiple futures for LLM reasoning
- **Probability Distributions:** Represent uncertainty in structured format
- **Decision Trees:** Enable conditional reasoning
- **Assumption Lists:** Make implicit assumptions explicit
- **Prompt Scaffolding:** Guide LLM reasoning step-by-step
- **Constraint-Based Reasoning:** Prevent LLMs from going beyond provided data
- **Narrative Drift Prevention:** Keep LLM outputs grounded in forecasts

---

## Additional Resources

### Reading
- "Superforecasting" by Philip Tetlock (scenario planning)
- "The Art of Strategy" by Dixit and Nalebuff (decision trees)
- Research papers on structured reasoning with LLMs

### Tools
- JSON for structuring data
- Python/R for generating forecasts
- LLM APIs for testing prompts
- Validation tools for checking outputs

### Practice
- Design schemas for different domains
- Test prompts with different LLMs
- Iterate and refine
- Share and compare with others

### Next Steps
- Complete Assignment 5
- Review Module 6: FLAIRR-TS Architecture and Workflow
- Join course discussion forum
- Start thinking about complete forecasting systems

---

**Module 5 Complete. Ready for Module 6? →**
