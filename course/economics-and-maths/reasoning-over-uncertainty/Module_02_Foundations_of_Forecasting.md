---
title: "Module 2: Foundations of Forecasting"
description: "Master the fundamentals of time-series forecasting, uncertainty quantification, and forecast evaluation"
module: "2"
week: 2
order: 2
---

# Module 2: Foundations of Forecasting

**Duration:** Week 2  
**Learning Objectives:**
- Understand time-series basics (trend, seasonality, noise)
- Distinguish point forecasts from distributions
- Work with confidence intervals and uncertainty
- Understand forecast horizons and regime shifts
- Compare different forecasting approaches (human, statistical, naive)

---

## 2.1 Time-Series Basics

### Introduction

Time-series data is a sequence of observations collected over time. Understanding the components of time-series is essential for building effective forecasting models.

### Components of Time-Series

#### 1. Trend

**Definition:** A long-term increase or decrease in the data.

**Characteristics:**
- Persistent direction over time
- Can be linear or nonlinear
- May change direction (trend breaks)

**Examples:**
- Population growth (generally increasing)
- Technology adoption (S-curve: slow → fast → slow)
- Economic growth (cyclical with long-term trend)

**Detection:**
- Visual inspection (plotting the data)
- Statistical tests (Mann-Kendall test, etc.)
- Moving averages

#### 2. Seasonality

**Definition:** Regular, predictable patterns that repeat over fixed periods.

**Characteristics:**
- Fixed period (daily, weekly, monthly, yearly)
- Repeating pattern
- Can be additive or multiplicative

**Examples:**
- Retail sales (higher in December)
- Energy consumption (daily patterns, seasonal patterns)
- Website traffic (weekly patterns: lower on weekends)

**Types:**
- **Additive Seasonality:** Magnitude of seasonal effect is constant
- **Multiplicative Seasonality:** Magnitude of seasonal effect grows with the trend

#### 3. Noise (Random Variation)

**Definition:** Unpredictable, random fluctuations in the data.

**Characteristics:**
- Cannot be predicted
- Random and irregular
- May follow statistical distributions

**Sources:**
- Measurement error
- Random events
- Unexplained variation

### Decomposition

**Time-Series Decomposition** separates a time-series into its components:

**Additive Model:**
```
Y(t) = Trend(t) + Seasonality(t) + Noise(t)
```

**Multiplicative Model:**
```
Y(t) = Trend(t) × Seasonality(t) × Noise(t)
```

**Purpose:**
- Understand data structure
- Identify patterns
- Build better models
- Forecast each component separately

### Stationarity

**Definition:** A time-series is stationary if its statistical properties (mean, variance) do not change over time.

**Why It Matters:**
- Many forecasting methods assume stationarity
- Non-stationary data requires differencing or transformation
- Stationary data is easier to model

**Making Data Stationary:**
- **Differencing:** Take differences between consecutive observations
- **Log Transformation:** Stabilize variance
- **Detrending:** Remove trend component

---

## 2.2 Point Forecasts vs Distributions

### Point Forecasts

**Definition:** A single value prediction for a future observation.

**Example:**
```
"The temperature tomorrow will be 72°F"
"The stock price will be $150"
"Sales next month will be $1.2M"
```

**Characteristics:**
- Simple and easy to understand
- Provides a single "best guess"
- Does not convey uncertainty
- Often misleading

**Problems:**
- No information about uncertainty
- Cannot assess risk
- May be overconfident
- Difficult to evaluate accuracy

### Distributional Forecasts

**Definition:** A probability distribution over possible future values.

**Example:**
```
"Temperature tomorrow: Normal(72°F, 5°F)
  - 68% chance between 67°F and 77°F
  - 95% chance between 62°F and 82°F"

"Stock price: Log-normal(150, 0.15)
  - Expected value: $150
  - 68% chance between $130 and $173"
```

**Characteristics:**
- Quantifies uncertainty
- Provides full information
- Enables risk assessment
- More useful for decision-making

**Forms:**
- **Full Distribution:** Complete probability distribution
- **Quantiles:** Percentiles (10th, 25th, 50th, 75th, 90th)
- **Intervals:** Confidence/prediction intervals

### Why Distributions Matter

**1. Uncertainty Quantification**
- Know how uncertain the forecast is
- Understand range of possible outcomes
- Assess tail risks

**2. Decision-Making**
- Make decisions under uncertainty
- Optimize across scenarios
- Manage risk

**3. Evaluation**
- Compare forecasts properly
- Assess calibration
- Identify overconfidence

**4. Communication**
- Communicate uncertainty to stakeholders
- Avoid false precision
- Build trust through honesty

---

## 2.3 Confidence Intervals and Uncertainty

### Confidence Intervals

**Definition:** A range of values that is likely to contain the true value with a specified probability.

**Example:**
```
"95% confidence interval: [100, 200]"
Means: There is a 95% probability the true value is between 100 and 200
```

**Common Levels:**
- 50% interval (interquartile range)
- 80% interval
- 90% interval
- 95% interval (most common)
- 99% interval

### Prediction Intervals vs Confidence Intervals

**Confidence Interval:**
- Uncertainty about the **parameter** (e.g., mean, trend)
- Based on estimation uncertainty
- Gets narrower with more data

**Prediction Interval:**
- Uncertainty about a **future observation**
- Includes both estimation uncertainty and noise
- Does not get arbitrarily narrow

**Example:**
```
Confidence Interval for Mean:
"We are 95% confident the true mean is between 100 and 120"

Prediction Interval for Next Observation:
"We are 95% confident the next observation will be between 80 and 140"
```

### Sources of Uncertainty

**1. Model Uncertainty**
- Which model is correct?
- Are assumptions valid?
- Model misspecification

**2. Parameter Uncertainty**
- Estimated parameters have uncertainty
- More data → less uncertainty
- Estimation error

**3. Process Uncertainty (Noise)**
- Random variation in the process
- Cannot be reduced with more data
- Inherent to the system

**4. Structural Uncertainty**
- Unknown future changes
- Regime shifts
- Black swan events

### Communicating Uncertainty

**Good Practices:**
- Always provide uncertainty ranges
- Use multiple interval levels (50%, 80%, 95%)
- Explain what the intervals mean
- Visualize distributions when possible

**Bad Practices:**
- Only providing point forecasts
- Overconfident intervals (too narrow)
- Underconfident intervals (too wide)
- Not explaining what intervals mean

---

## 2.4 Forecast Horizons and Regime Shifts

### Forecast Horizons

**Definition:** How far into the future we are forecasting.

**Short-Term (Days to Weeks):**
- More accurate
- Less uncertainty
- Patterns more stable
- Easier to model

**Medium-Term (Months to Quarters):**
- Moderate accuracy
- Moderate uncertainty
- Some pattern changes
- Requires more sophisticated models

**Long-Term (Years to Decades):**
- Lower accuracy
- High uncertainty
- Major pattern changes likely
- Structural breaks common

### Why Horizon Matters

**1. Uncertainty Increases with Horizon**
- Further out = more uncertain
- Confidence intervals widen
- More things can go wrong

**2. Different Methods for Different Horizons**
- Short-term: Simple methods may work
- Long-term: Need structural models
- Very long-term: Scenario planning

**3. Different Use Cases**
- Short-term: Operational decisions
- Long-term: Strategic planning

### Regime Shifts

**Definition:** Structural changes in the underlying process that make historical patterns unreliable.

**Examples:**
- Financial crises (2008, 2020)
- Technology disruptions (internet, smartphones, AI)
- Policy changes (regulations, trade agreements)
- Pandemics (COVID-19)

**Characteristics:**
- Sudden or gradual
- Changes fundamental relationships
- Historical data becomes less relevant
- Requires model adaptation

**Detection:**
- Statistical tests (structural break tests)
- Visual inspection
- Expert knowledge
- Monitoring forecast errors

**Handling:**
- Use more recent data
- Adjust models
- Increase uncertainty
- Use scenario planning
- Expert judgment

---

## 2.5 Forecasting Tools (Conceptual Overview)

### ARIMA (AutoRegressive Integrated Moving Average)

**What It Is:**
- Statistical method for time-series forecasting
- Combines autoregression, differencing, and moving averages
- Handles trends and seasonality

**When to Use:**
- Stationary or can be made stationary
- Linear relationships
- Sufficient historical data
- Short to medium-term forecasts

**Limitations:**
- Assumes linear relationships
- Requires stationarity
- May miss structural breaks
- Not good for very long horizons

### Prophet

**What It Is:**
- Facebook's forecasting tool
- Designed for business time-series
- Handles trends, seasonality, holidays automatically

**When to Use:**
- Business metrics (sales, traffic, etc.)
- Strong seasonality
- Holiday effects
- Missing data or outliers

**Advantages:**
- Easy to use
- Handles common problems automatically
- Good default behavior
- Interpretable components

**Limitations:**
- May not work well for all data types
- Less flexible than custom models
- May overfit with too much flexibility

### Expert Elicitation

**What It Is:**
- Structured process for gathering forecasts from experts
- Combines multiple expert opinions
- Uses structured methods to reduce bias

**When to Use:**
- Limited historical data
- Novel situations
- Complex systems
- Long-term forecasts

**Methods:**
- Delphi method
- Prediction markets
- Structured interviews
- Aggregation techniques

**Advantages:**
- Incorporates domain knowledge
- Can handle novel situations
- Combines multiple perspectives
- Can quantify expert uncertainty

**Limitations:**
- Subject to biases
- Expensive and time-consuming
- Experts may disagree
- May be overconfident

---

## Assignment: Compare Human, Statistical, and Naive Forecasts

### Objective

Compare three different forecasting approaches on the same data to understand their strengths, weaknesses, and when each is appropriate.

### Tasks

1. **Select a Time-Series Dataset (30 min)**
   - Choose a dataset with at least 2-3 years of data
   - Should have clear patterns (trend, seasonality)
   - Examples: stock prices, sales data, website traffic, temperature

2. **Generate Three Forecasts (3 hours)**
   
   **a) Human Forecast:**
   - Ask 3-5 people to forecast the next 3-6 months
   - Have them provide point forecasts and uncertainty ranges
   - Document their reasoning
   
   **b) Statistical Forecast:**
   - Use ARIMA, Prophet, or another statistical method
   - Generate point forecasts and prediction intervals
   - Document model assumptions
   
   **c) Naive Forecast:**
   - Use simple methods (last value, average, seasonal naive)
   - Generate point forecasts
   - Document the method

3. **Compare Forecasts (2 hours)**
   - Compare accuracy (if you have actual values)
   - Compare uncertainty quantification
   - Compare reasoning/assumptions
   - Identify strengths and weaknesses

4. **Write Analysis Report (1.5 hours)**
   - 4-6 page report
   - Describe each forecasting approach
   - Compare results
   - Discuss when each approach is appropriate
   - Provide recommendations

### Deliverables

- Dataset description
- Three sets of forecasts (human, statistical, naive)
- Comparison analysis
- 4-6 page report
- Code/analysis files (if applicable)

### Evaluation Criteria

- **Forecast Quality (30%):** Appropriate use of forecasting methods
- **Comparison Depth (30%):** Thorough comparison of approaches
- **Understanding (20%):** Demonstration of understanding of forecasting concepts
- **Analysis Quality (20%):** Quality of analysis and recommendations

### Example Datasets

- Stock prices (Yahoo Finance, Alpha Vantage)
- Sales data (Kaggle, UCI ML Repository)
- Website traffic (Google Analytics, if available)
- Economic indicators (FRED, World Bank)
- Weather data (NOAA, Weather Underground)

---

## Key Takeaways

- **Time-Series Components:** Trend, seasonality, and noise are fundamental building blocks
- **Point vs Distribution:** Distributions provide much more information than point forecasts
- **Uncertainty Matters:** Always quantify and communicate uncertainty
- **Forecast Horizons:** Different horizons require different approaches and have different uncertainty
- **Regime Shifts:** Structural changes can invalidate historical patterns
- **Tool Selection:** Choose forecasting tools based on data characteristics and use case
- **Multiple Approaches:** Different forecasting methods have different strengths and are appropriate in different situations

---

## Additional Resources

### Reading
- "Forecasting: Principles and Practice" by Rob Hyndman (free online textbook)
- "Time Series Analysis" by James Hamilton
- "Superforecasting" by Philip Tetlock (expert forecasting)

### Tools & Libraries
- **Python:** statsmodels, prophet, pandas, numpy
- **R:** forecast package, prophet, tseries
- **Online:** FRED (economic data), Kaggle (datasets)

### Practice
- Try forecasting with different methods
- Compare your forecasts with actual outcomes
- Practice communicating uncertainty
- Experiment with different forecast horizons

### Next Steps
- Complete Assignment 2
- Review Module 3: Why LLMs Fail at Prediction
- Join course discussion forum
- Start thinking about how to combine statistical forecasts with LLM reasoning

---

**Module 2 Complete. Ready for Module 3? →**
