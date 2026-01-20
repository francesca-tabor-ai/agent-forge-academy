---
title: "Module 9: Evaluation: How Do We Know This Works?"
description: "Learn to evaluate hybrid forecasting systems beyond point accuracy"
module: "9"
week: 9
order: 9
---

# Module 9: Evaluation: How Do We Know This Works?

**Duration:** Week 9  
**Learning Objectives:**
- Understand forecast accuracy vs usefulness
- Learn calibration and sharpness metrics
- Understand Brier scores (introductory level)
- Evaluate qualitative reasoning quality
- Analyze failure modes
- Design evaluation plans for hybrid systems

---

## 9.1 Forecast Accuracy vs Usefulness

### Forecast Accuracy

**Definition:** How close forecasts are to actual outcomes.

**Common Metrics:**
- Mean Absolute Error (MAE)
- Root Mean Squared Error (RMSE)
- Mean Absolute Percentage Error (MAPE)

**Limitations:**
- Only measures point forecasts
- Doesn't assess uncertainty
- Doesn't evaluate usefulness
- May miss important aspects

**Example:**
```
Forecast: 100
Actual: 105
Error: 5
Accuracy: Good (small error)
But: Was uncertainty properly communicated?
```

### Forecast Usefulness

**Definition:** How helpful forecasts are for decision-making.

**Aspects:**
- Accuracy (important but not sufficient)
- Uncertainty quantification
- Calibration
- Communication
- Actionability

**Example:**
```
Forecast 1: 100 ± 5 (well-calibrated, useful)
Forecast 2: 100 ± 50 (poorly calibrated, less useful)
Both have same point forecast, different usefulness
```

### Why Both Matter

**Accuracy:**
- Necessary but not sufficient
- Measures point forecasts
- Easy to understand
- Commonly used

**Usefulness:**
- What actually matters for decisions
- Includes uncertainty
- Considers communication
- Harder to measure

### Evaluating Hybrid Systems

**Need to Evaluate:**
1. Statistical forecast accuracy
2. Uncertainty quantification quality
3. LLM reasoning quality
4. Overall system usefulness
5. Decision-making impact

---

## 9.2 Calibration and Sharpness

### Calibration

**Definition:** When stated probabilities match actual frequencies.

**Well-Calibrated:**
- Say 70% chance → happens 70% of the time
- Say 90% chance → happens 90% of the time
- Probabilities match reality

**Poorly Calibrated:**
- Say 70% chance → happens 50% of the time (overconfident)
- Say 70% chance → happens 90% of the time (underconfident)
- Probabilities don't match reality

### Measuring Calibration

**Method:**
1. Group forecasts by stated probability
2. Calculate actual frequency for each group
3. Compare stated vs actual

**Example:**
```
Forecasts with 80% probability:
- Stated: 80%
- Actual frequency: 75%
- Calibration: Slightly overconfident
```

### Sharpness

**Definition:** How narrow (precise) forecasts are.

**Sharp Forecast:**
- Narrow confidence intervals
- Precise probabilities
- Low uncertainty

**Less Sharp Forecast:**
- Wide confidence intervals
- Imprecise probabilities
- High uncertainty

### The Calibration-Sharpness Trade-Off

**Well-Calibrated but Not Sharp:**
```
Forecast: "50-90% probability"
- Calibrated (covers reality)
- Not sharp (too wide)
```

**Sharp but Not Calibrated:**
```
Forecast: "95% probability"
- Sharp (precise)
- Not calibrated (overconfident)
```

**Ideal:**
- Well-calibrated AND sharp
- Probabilities match reality AND are precise

### Evaluating Hybrid Systems

**Statistical Forecast:**
- Measure calibration
- Measure sharpness
- Compare with benchmarks

**LLM Reasoning:**
- Does it preserve calibration?
- Does it explain uncertainty?
- Does it communicate clearly?

---

## 9.3 Brier Scores (Introductory)

### What is a Brier Score?

**Definition:** A metric for evaluating probabilistic forecasts.

**Formula (simplified):**
```
Brier Score = Average of (Forecast Probability - Actual Outcome)²
```

**Interpretation:**
- Lower is better
- 0 = perfect
- 1 = worst possible

### Example

**Forecast:** 70% probability of event
**Outcome:** Event occurred (1)

**Brier Score:** (0.70 - 1)² = 0.09

**Forecast:** 70% probability of event
**Outcome:** Event did not occur (0)

**Brier Score:** (0.70 - 0)² = 0.49

### Why Brier Scores Matter

**1. Evaluates Probabilities**
- Not just point forecasts
- Assesses probability quality
- Penalizes overconfidence

**2. Calibration Component**
- Lower scores = better calibration
- Measures how well probabilities match reality

**3. Comparability**
- Can compare different forecasts
- Standardized metric
- Widely used

### Limitations

**1. Requires Many Forecasts**
- Need many observations
- Not useful for single forecasts
- Statistical significance needed

**2. Binary Outcomes**
- Typically for yes/no events
- Can extend to continuous
- More complex

**3. Doesn't Capture Everything**
- Doesn't measure usefulness
- Doesn't assess communication
- Focuses on probabilities

---

## 9.4 Qualitative Evaluation of Reasoning Quality

### Why Qualitative Evaluation Matters

**Quantitative Metrics:**
- Measure accuracy, calibration
- But: Don't capture reasoning quality
- Don't assess communication
- Don't evaluate usefulness

**Qualitative Evaluation:**
- Assesses reasoning quality
- Evaluates communication
- Measures usefulness
- Captures what numbers miss

### Dimensions of Reasoning Quality

**1. Logical Coherence**
- Is reasoning logical?
- Are arguments sound?
- Do conclusions follow?

**2. Evidence Integration**
- Uses provided forecasts?
- Incorporates context?
- Weighs evidence appropriately?

**3. Uncertainty Acknowledgment**
- Recognizes uncertainty?
- Communicates uncertainty?
- Doesn't overstate confidence?

**4. Scenario Analysis**
- Considers multiple scenarios?
- Explores alternatives?
- Doesn't fixate on one future?

**5. Communication Clarity**
- Clear explanations?
- Accessible language?
- Well-structured?

### Evaluation Framework

**1. Review Reasoning Output**
- Read LLM reasoning
- Assess quality
- Identify strengths/weaknesses

**2. Check Against Forecasts**
- Does reasoning match forecasts?
- Uses provided data?
- Doesn't add unsupported claims?

**3. Assess Communication**
- Is it clear?
- Is it useful?
- Is uncertainty communicated?

**4. Compare with Alternatives**
- Compare different reasoning outputs
- Identify best practices
- Learn from differences

### LLM Reasoning Evaluation Checklist

**✓ Logical Coherence**
- [ ] Reasoning is logical
- [ ] Arguments are sound
- [ ] Conclusions follow from premises

**✓ Evidence Integration**
- [ ] Uses provided forecasts
- [ ] Incorporates context
- [ ] Weighs evidence appropriately

**✓ Uncertainty Acknowledgment**
- [ ] Recognizes uncertainty
- [ ] Communicates uncertainty
- [ ] Doesn't overstate confidence

**✓ Scenario Analysis**
- [ ] Considers multiple scenarios
- [ ] Explores alternatives
- [ ] Doesn't fixate on one future

**✓ Communication**
- [ ] Clear explanations
- [ ] Accessible language
- [ ] Well-structured

---

## 9.5 Failure Analysis

### When LLM Reasoning Makes Things Worse

**1. Overconfidence**
```
Statistical Forecast: 60% probability ± 10%
LLM Interpretation: "Very likely to occur"
Problem: LLM overstates confidence
```

**2. Narrative Drift**
```
Statistical Forecast: Sales 120K ± 15K
LLM Interpretation: "Strong growth due to new marketing..."
Problem: LLM adds unsupported narrative
```

**3. Ignoring Uncertainty**
```
Statistical Forecast: Wide uncertainty [80K, 160K]
LLM Interpretation: "Sales will be around 120K"
Problem: LLM ignores uncertainty range
```

**4. Confusing Correlation with Causation**
```
Statistical Forecast: Correlation between A and B
LLM Interpretation: "A causes B because..."
Problem: LLM assumes causation
```

**5. Overfitting Narratives**
```
Statistical Forecast: Moderate trend
LLM Interpretation: Complex story explaining trend
Problem: LLM creates elaborate narrative from simple pattern
```

### Identifying Failures

**1. Compare with Forecasts**
- Does reasoning match forecasts?
- Uses provided data?
- Doesn't add claims?

**2. Check Calibration**
- Does reasoning preserve calibration?
- Doesn't overstate confidence?
- Acknowledges uncertainty?

**3. Assess Logic**
- Is reasoning logical?
- Are arguments sound?
- Do conclusions follow?

**4. Evaluate Communication**
- Is it clear?
- Is it accurate?
- Is it useful?

### Preventing Failures

**1. Structured Inputs**
- Provide structured forecasts
- Use scenario tables
- Include uncertainty

**2. Constrained Prompts**
- Constrain LLM outputs
- Prevent narrative drift
- Require evidence

**3. Validation**
- Check outputs
- Compare with inputs
- Verify calibration

**4. Iterative Refinement**
- Review outputs
- Identify issues
- Refine prompts

---

## Assignment: Design an Evaluation Plan for a Hybrid Forecasting System

### Objective

Design a comprehensive evaluation plan for a hybrid forecasting system that assesses both quantitative and qualitative aspects.

### Tasks

1. **Define System (30 min)**
   - Describe the hybrid system
   - Identify components
   - Define use cases

2. **Design Quantitative Evaluation (3 hours)**
   - Forecast accuracy metrics
   - Calibration measures
   - Sharpness assessment
   - Brier scores (if applicable)
   - Comparison with benchmarks

3. **Design Qualitative Evaluation (2.5 hours)**
   - Reasoning quality framework
   - Communication assessment
   - Usefulness evaluation
   - Failure mode analysis

4. **Design Evaluation Process (2 hours)**
   - Data collection
   - Evaluation procedures
   - Analysis methods
   - Reporting format

5. **Create Evaluation Plan (1.5 hours)**
   - Complete evaluation framework
   - Implementation steps
   - Timeline
   - Success criteria

6. **Write Evaluation Plan Document (1.5 hours)**
   - 6-8 page document
   - Complete evaluation framework
   - Implementation plan
   - Expected outcomes

### Deliverables

- System description
- Quantitative evaluation design
- Qualitative evaluation design
- Evaluation process
- Implementation plan
- 6-8 page evaluation plan document

### Evaluation Criteria

- **Comprehensiveness (30%):** Covers all important aspects
- **Quantitative Design (25%):** Appropriate metrics and methods
- **Qualitative Design (25%):** Effective qualitative evaluation
- **Implementation (20%):** Practical and feasible plan

### Example Systems

- Economic forecasting system
- Climate forecasting system
- Technology adoption forecasting
- Market forecasting system
- Policy outcome forecasting

---

## Key Takeaways

- **Accuracy vs Usefulness:** Both matter, but usefulness is what counts for decisions
- **Calibration:** Probabilities should match actual frequencies
- **Sharpness:** Forecasts should be precise when possible
- **Brier Scores:** Metric for evaluating probabilistic forecasts
- **Qualitative Evaluation:** Essential for assessing reasoning quality
- **Failure Analysis:** Identify when LLM reasoning makes things worse
- **Comprehensive Evaluation:** Need both quantitative and qualitative assessment

---

## Additional Resources

### Reading
- "Superforecasting" by Philip Tetlock (evaluation methods)
- "The Signal and the Noise" by Nate Silver (forecast evaluation)
- Research papers on forecast evaluation

### Tools
- Python/R for calculating metrics
- Evaluation frameworks
- Statistical analysis tools

### Practice
- Practice evaluating forecasts
- Calculate calibration metrics
- Assess reasoning quality
- Design evaluation plans

### Next Steps
- Complete Assignment 9
- Review Module 10: Capstone Project
- Join course discussion forum
- Start planning your capstone project

---

**Module 9 Complete. Ready for Module 10 (Capstone)? →**
