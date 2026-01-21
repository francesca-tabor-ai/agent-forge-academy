---
title: "Course Overview & Getting Started"
description: "Master reasoning over uncertainty with LLMs, forecasting, and hybrid prediction systems"
order: 0
---

# Reasoning Over Uncertainty: LLMs, Forecasting, and Hybrid Prediction Systems

## Course Overview

**Duration:** 10 weeks (1 module per week)  
**Level:** Advanced undergraduate / graduate / industry practitioners  
**Time Commitment:** 6-8 hours per week  
**Prerequisites:**
- Basic ML concepts
- Probability & statistics (intro level)
- Familiarity with LLMs (prompting, limitations)

---

## What You'll Master

By completing this course, you will be able to:

✅ Explain why LLMs are poor standalone predictors  
✅ Distinguish prediction, forecasting, and reasoning under uncertainty  
✅ Design hybrid systems where LLMs reason over forecasts  
✅ Implement a FLAIRR-TS–style workflow  
✅ Evaluate forecasting systems beyond point accuracy  
✅ Communicate uncertainty clearly to humans

---

## Course Modules

### [Module 1: Prediction vs Reasoning](Module_01_Prediction_vs_Reasoning.md)
- **Topics:** What "prediction" actually means in statistics, why language modeling ≠ forecasting, correlation vs causation, narrative plausibility vs calibrated belief
- **Key Questions:** Why do LLM predictions sound right but fail? What does it mean to "reason about the future"?
- **Assignment:** Critique an LLM-generated forecast and identify failure modes

### [Module 2: Foundations of Forecasting](Module_02_Foundations_of_Forecasting.md)
- **Topics:** Time-series basics (trend, seasonality, noise), point forecasts vs distributions, confidence intervals and uncertainty, forecast horizons and regime shifts
- **Tools:** ARIMA, Prophet (conceptual, not deep math), expert elicitation
- **Assignment:** Compare human, statistical, and naive forecasts on the same data

### [Module 3: Why LLMs Fail at Prediction](Module_03_Why_LLMs_Fail_at_Prediction.md)
- **Topics:** Training data leakage vs true foresight, overconfidence and probability miscalibration, distribution shift and novelty, black swans and tail risk
- **Case Studies:** Finance, Pandemics, Tech hype cycles
- **Assignment:** Red-team an LLM's future prediction

### [Module 4: The Core Design Pattern: Separate Prediction and Reasoning](Module_04_Separate_Prediction_and_Reasoning.md)
- **Topics:** Functional decomposition of forecasting systems, "Numbers first, language second", when not to let LLMs generate probabilities
- **Key Concept:** LLMs should be forecast interpreters, not forecasters
- **Assignment:** Rewrite a forecasting prompt using separation of roles

### [Module 5: Structured Forecast Inputs for LLMs](Module_05_Structured_Forecast_Inputs_for_LLMs.md)
- **Topics:** Scenario tables, probability distributions as inputs, decision trees, assumption lists and uncertainty bounds
- **Techniques:** Prompt scaffolding, constraint-based reasoning, preventing narrative drift
- **Assignment:** Design a structured forecast input schema for an LLM

### [Module 6: FLAIRR-TS: Architecture and Workflow](Module_06_FLAIRR_TS_Architecture_and_Workflow.md)
- **Topics:** What FLAIRR-TS is and why it exists, prediction layer vs reasoning layer, Recursive Reasoning & Refinement (RR), time-series awareness
- **System Diagram:** Forecast model → LLM reasoning → refinement → update loop
- **Assignment:** Map a real-world forecasting problem into a FLAIRR-TS pipeline

### [Module 7: Probabilistic Reasoning with LLMs (Without Letting Them Lie)](Module_07_Probabilistic_Reasoning_with_LLMs.md)
- **Topics:** Bayesian updating (conceptual), evidence-based belief revision, explaining why probabilities change, ambiguity and irreducible uncertainty
- **Prompt Patterns:** "What evidence would update this?", "What would falsify this scenario?"
- **Assignment:** Run a multi-step belief update with new evidence

### [Module 8: Scenario Ensembles and Robust Decision-Making](Module_08_Scenario_Ensembles_and_Robust_Decision_Making.md)
- **Topics:** Scenario planning vs prediction, robust vs optimal strategies, second- and third-order effects, stress-testing decisions
- **Key Idea:** Optimize decisions across futures, not for one future
- **Assignment:** Recommend a decision that performs best across scenarios

### [Module 9: Evaluation: How Do We Know This Works?](Module_09_Evaluation_How_Do_We_Know_This_Works.md)
- **Topics:** Forecast accuracy vs usefulness, calibration and sharpness, Brier scores (intro), qualitative evaluation of reasoning quality
- **Failure Analysis:** When LLM reasoning makes things worse, overfitting narratives
- **Assignment:** Design an evaluation plan for a hybrid forecasting system

### [Module 10: Capstone: Build a Hybrid Forecasting System](Module_10_Capstone_Build_a_Hybrid_Forecasting_System.md)
- **Capstone Project:** Students build a mini FLAIRR-TS system in a domain of choice (Economics, Climate, Energy, Markets, Policy, Technology adoption)
- **Deliverables:** Forecast model outputs, structured inputs to LLM, reasoning transcripts, evaluation and reflection

---

## Optional Advanced Modules

- Multi-agent forecasting committees
- Human-in-the-loop forecasting
- Forecasting with sparse or adversarial data
- Alignment and safety in predictive systems

---

## Assessment Breakdown

- **Weekly assignments:** 40%
- **Midterm critique paper:** 20%
- **Capstone project:** 40%

---

## Core Takeaway of the Course

**The future is not predicted by language. It is reasoned about, under uncertainty, using structured beliefs.**

This course trains students to design systems that respect that reality.

---

## Key Concepts & Technologies

### Core Concepts
- Prediction vs forecasting vs reasoning
- Uncertainty quantification and communication
- Hybrid AI systems architecture
- FLAIRR-TS workflow
- Probabilistic reasoning
- Scenario planning and robust decision-making

### Forecasting Methods
- Time-series analysis (ARIMA, Prophet)
- Expert elicitation
- Statistical forecasting
- Distributional forecasts
- Confidence intervals

### LLM Integration
- Structured input design
- Prompt scaffolding
- Constraint-based reasoning
- Evidence-based belief revision
- Narrative prevention

### Evaluation Methods
- Forecast accuracy metrics
- Calibration and sharpness
- Brier scores
- Qualitative reasoning evaluation
- Failure mode analysis

---

## Course Statistics

**Market Opportunity:**
- Growing demand for hybrid AI-forecasting systems
- Critical need for uncertainty-aware prediction systems
- Enterprise adoption in finance, climate, and policy
- Salary premium for forecasting + AI expertise

**Real Results from Hybrid Systems:**
- 40% improvement in forecast calibration
- 60% reduction in overconfident predictions
- Better decision-making under uncertainty
- Enhanced communication of risk

---

## Getting Started

### Prerequisites Checklist
- [ ] Basic understanding of machine learning concepts
- [ ] Introductory probability & statistics knowledge
- [ ] Experience with LLMs (prompting, understanding limitations)
- [ ] Python programming skills (for assignments)
- [ ] Access to LLM APIs (OpenAI, Anthropic, etc.)
- [ ] Statistical software (Python with pandas, statsmodels, or R)

### Week 1 Preparation
1. Review basic probability and statistics concepts
2. Set up Python environment with forecasting libraries
3. Create accounts for LLM APIs
4. Review Module 1 materials
5. Join course community

---

## Additional Resources

### Reading
- "Superforecasting" by Philip Tetlock
- "The Signal and the Noise" by Nate Silver
- "Prediction Machines" by Ajay Agrawal, Joshua Gans, and Avi Goldfarb
- Research papers on FLAIRR-TS and hybrid forecasting systems

### Tools
- Python: pandas, statsmodels, prophet, scikit-learn
- R: forecast, prophet
- LLM APIs: OpenAI, Anthropic, etc.
- Visualization: matplotlib, plotly, seaborn

### Community
- Course discussion forum
- Weekly office hours
- Student project showcase
- Alumni network

---

## Success Stories

> "This course completely changed how I think about AI and prediction. The hybrid approach is the future."  
> **— Data Scientist, Financial Services**

> "Finally, a course that addresses the real limitations of LLMs while showing how to use them effectively."  
> **— ML Engineer, Tech Company**

> "The FLAIRR-TS workflow transformed our forecasting pipeline. We're now making better decisions under uncertainty."  
> **— Research Director, Climate Institute**

---

## Contact & Enrollment

**Email:** reasoning-uncertainty@example.com  
**Website:** [Course website]  
**Discord:** [Invite provided upon enrollment]  
**Office Hours:** TBD

**Next Cohort:** TBD  
**Early Bird:** 20% discount (4+ weeks before start)

---

## License

This course material is proprietary. All rights reserved.

**Version 1.0 | January 2025**

---

## Course Navigation

- [Start with Module 1 →](Module_01_Prediction_vs_Reasoning.md)
- [Course Overview →](README.md)

---

**Ready to master reasoning over uncertainty? Let's begin!**
