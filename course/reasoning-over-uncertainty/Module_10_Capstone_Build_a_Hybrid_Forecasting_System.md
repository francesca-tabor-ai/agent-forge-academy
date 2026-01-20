---
title: "Module 10: Capstone: Build a Hybrid Forecasting System"
description: "Build a complete FLAIRR-TS system in a domain of your choice"
module: "10"
week: 10
order: 10
---

# Module 10: Capstone: Build a Hybrid Forecasting System

**Duration:** Week 10 (Extended project)  
**Learning Objectives:**
- Integrate all course concepts into a complete system
- Build a working FLAIRR-TS pipeline
- Generate statistical forecasts
- Structure forecasts for LLM reasoning
- Implement LLM reasoning layer
- Evaluate the complete system
- Reflect on lessons learned

---

## 10.1 Capstone Project Overview

### Objective

Build a complete hybrid forecasting system that combines statistical forecasting with LLM reasoning, following the FLAIRR-TS architecture.

### Project Requirements

**1. Choose a Domain**
- Economics
- Climate
- Energy
- Markets
- Policy
- Technology adoption
- Or another domain of interest

**2. Build Prediction Layer**
- Collect time-series data
- Select appropriate forecasting methods
- Generate forecasts with uncertainty
- Validate models

**3. Structure Forecasts**
- Create scenario tables
- Format probability distributions
- List assumptions
- Define uncertainty bounds

**4. Implement Reasoning Layer**
- Design LLM prompts
- Structure inputs
- Implement reasoning
- Handle refinements

**5. Evaluate System**
- Assess forecast accuracy
- Evaluate calibration
- Assess reasoning quality
- Measure usefulness

**6. Document and Reflect**
- Document complete system
- Reflect on lessons learned
- Identify improvements
- Present findings

---

## 10.2 Project Structure

### Phase 1: Planning and Design (Week 1-2)

**Tasks:**
1. Choose domain and problem
2. Define success criteria
3. Design system architecture
4. Plan data collection
5. Select forecasting methods
6. Design LLM integration

**Deliverables:**
- Project proposal (2-3 pages)
- System architecture diagram
- Data collection plan
- Implementation timeline

### Phase 2: Prediction Layer (Week 3-4)

**Tasks:**
1. Collect and clean data
2. Explore data (trends, seasonality)
3. Select and fit forecasting models
4. Generate forecasts
5. Quantify uncertainty
6. Validate models

**Deliverables:**
- Cleaned dataset
- Forecast models
- Forecast outputs with uncertainty
- Model validation results

### Phase 3: Reasoning Layer (Week 5-6)

**Tasks:**
1. Structure forecasts for LLM
2. Design reasoning prompts
3. Implement LLM reasoning
4. Handle refinements
5. Iterate and improve

**Deliverables:**
- Structured forecast inputs
- LLM reasoning outputs
- Refinement process
- Reasoning quality assessment

### Phase 4: Integration and Evaluation (Week 7-8)

**Tasks:**
1. Integrate prediction and reasoning layers
2. Test complete system
3. Evaluate quantitatively
4. Evaluate qualitatively
5. Identify improvements

**Deliverables:**
- Complete integrated system
- Evaluation results
- Performance metrics
- Quality assessments

### Phase 5: Documentation and Presentation (Week 9-10)

**Tasks:**
1. Write comprehensive report
2. Create presentation
3. Reflect on lessons learned
4. Identify future improvements
5. Present findings

**Deliverables:**
- Final report (15-20 pages)
- Presentation (15-20 slides)
- Code and documentation
- Reflection essay

---

## 10.3 Domain Options

### Economics

**Possible Topics:**
- GDP growth forecasting
- Inflation prediction
- Unemployment forecasting
- Interest rate forecasting
- Economic indicator prediction

**Data Sources:**
- FRED (Federal Reserve Economic Data)
- World Bank
- IMF
- National statistical offices

**Forecasting Methods:**
- ARIMA
- VAR models
- Economic models
- Expert elicitation

### Climate

**Possible Topics:**
- Temperature forecasting
- Precipitation prediction
- Sea level rise
- Extreme weather events
- Climate impact assessment

**Data Sources:**
- NOAA
- NASA
- IPCC data
- Climate research institutions

**Forecasting Methods:**
- Time-series models
- Climate models
- Statistical downscaling
- Expert judgment

### Energy

**Possible Topics:**
- Energy demand forecasting
- Renewable energy adoption
- Oil/gas price prediction
- Energy transition modeling
- Grid capacity planning

**Data Sources:**
- EIA (Energy Information Administration)
- IEA (International Energy Agency)
- Energy companies
- Research institutions

**Forecasting Methods:**
- Time-series models
- Regression models
- Scenario modeling
- Expert elicitation

### Markets

**Possible Topics:**
- Stock price forecasting
- Real estate price prediction
- Commodity price forecasting
- Market volatility
- Asset allocation

**Data Sources:**
- Yahoo Finance
- FRED
- Real estate databases
- Market data providers

**Forecasting Methods:**
- Time-series models
- GARCH models
- Machine learning
- Statistical models

### Policy

**Possible Topics:**
- Policy outcome prediction
- Election forecasting
- Regulatory impact assessment
- Public opinion prediction
- Policy effectiveness

**Data Sources:**
- Polling data
- Government databases
- Research institutions
- Public records

**Forecasting Methods:**
- Statistical models
- Expert elicitation
- Scenario planning
- Qualitative methods

### Technology Adoption

**Possible Topics:**
- Technology adoption curves
- Market penetration forecasting
- Innovation diffusion
- Product adoption
- Platform growth

**Data Sources:**
- Industry reports
- Market research
- Company data
- Research publications

**Forecasting Methods:**
- Diffusion models
- Time-series models
- S-curve models
- Expert judgment

---

## 10.4 Deliverables

### 1. Forecast Model Outputs

**Requirements:**
- Point forecasts
- Probability distributions
- Confidence intervals
- Prediction intervals
- Scenario forecasts

**Format:**
- Structured data (JSON, CSV)
- Visualizations
- Documentation

### 2. Structured Inputs to LLM

**Requirements:**
- Scenario tables
- Probability distributions
- Assumption lists
- Uncertainty bounds
- Historical context

**Format:**
- JSON structure
- Well-documented
- Reusable format

### 3. Reasoning Transcripts

**Requirements:**
- LLM reasoning outputs
- Interpretation of forecasts
- Scenario analysis
- Assumption evaluation
- Recommendations

**Format:**
- Text transcripts
- Structured outputs
- Documentation

### 4. Evaluation and Reflection

**Requirements:**
- Quantitative evaluation
- Qualitative evaluation
- System performance
- Lessons learned
- Future improvements

**Format:**
- Evaluation report
- Metrics and analysis
- Reflection essay

---

## 10.5 Evaluation Criteria

### Technical Quality (40%)

**Forecast Quality:**
- Appropriate methods
- Good model fit
- Proper uncertainty quantification
- Validation results

**System Architecture:**
- Clean separation of layers
- Well-structured inputs
- Effective LLM integration
- Proper refinement process

**Code Quality:**
- Well-documented code
- Reproducible
- Clean structure
- Good practices

### Reasoning Quality (30%)

**LLM Reasoning:**
- Logical and coherent
- Uses provided forecasts
- Acknowledges uncertainty
- Considers scenarios
- Clear communication

**Integration:**
- Effective combination of layers
- Proper feedback loops
- Iterative improvement
- System coherence

### Evaluation (20%)

**Quantitative:**
- Appropriate metrics
- Thorough analysis
- Comparison with benchmarks
- Statistical rigor

**Qualitative:**
- Reasoning quality assessment
- Communication evaluation
- Usefulness analysis
- Failure mode identification

### Documentation and Reflection (10%)

**Documentation:**
- Comprehensive report
- Clear explanations
- Good structure
- Professional presentation

**Reflection:**
- Deep insights
- Lessons learned
- Future improvements
- Critical thinking

---

## 10.6 Project Timeline

### Week 1-2: Planning
- Choose domain
- Design system
- Plan implementation
- Submit proposal

### Week 3-4: Prediction Layer
- Collect data
- Build models
- Generate forecasts
- Validate

### Week 5-6: Reasoning Layer
- Structure inputs
- Design prompts
- Implement reasoning
- Refine

### Week 7-8: Integration
- Integrate layers
- Test system
- Evaluate
- Improve

### Week 9-10: Documentation
- Write report
- Create presentation
- Reflect
- Present

---

## 10.7 Resources and Support

### Course Materials
- All previous modules
- Example code
- Templates
- Best practices

### Tools
- Statistical software (Python, R)
- LLM APIs (OpenAI, Anthropic)
- Data sources
- Visualization tools

### Support
- Office hours
- Discussion forum
- Peer feedback
- Instructor guidance

---

## 10.8 Success Criteria

### Minimum Requirements
- Working prediction layer
- Structured forecast inputs
- LLM reasoning implementation
- Basic evaluation
- Complete documentation

### Excellent Project
- High-quality forecasts
- Sophisticated reasoning
- Comprehensive evaluation
- Deep reflection
- Professional presentation

---

## Assignment: Complete Capstone Project

### Objective

Build a complete hybrid forecasting system following the FLAIRR-TS architecture.

### Requirements

**1. Prediction Layer**
- Collect time-series data (at least 2-3 years)
- Select and implement appropriate forecasting methods
- Generate forecasts with uncertainty quantification
- Validate models

**2. Reasoning Layer**
- Structure forecasts for LLM input
- Design effective reasoning prompts
- Implement LLM reasoning
- Handle refinements

**3. Integration**
- Integrate prediction and reasoning layers
- Test complete system
- Iterate and improve

**4. Evaluation**
- Quantitative evaluation (accuracy, calibration)
- Qualitative evaluation (reasoning quality)
- System performance assessment
- Comparison with alternatives

**5. Documentation**
- Comprehensive report (15-20 pages)
- Presentation (15-20 slides)
- Code and documentation
- Reflection essay (2-3 pages)

### Deliverables

1. **Forecast Model Outputs**
   - Point forecasts
   - Probability distributions
   - Confidence intervals
   - Scenario forecasts

2. **Structured Inputs to LLM**
   - Scenario tables
   - Probability distributions
   - Assumption lists
   - Uncertainty bounds

3. **Reasoning Transcripts**
   - LLM reasoning outputs
   - Interpretations
   - Scenario analyses
   - Recommendations

4. **Evaluation Report**
   - Quantitative metrics
   - Qualitative assessment
   - Performance analysis
   - Comparison results

5. **Final Report**
   - Complete system description
   - Implementation details
   - Evaluation results
   - Lessons learned
   - Future improvements

6. **Presentation**
   - System overview
   - Key findings
   - Demonstration
   - Q&A

### Evaluation

**Technical Quality (40%):**
- Forecast quality
- System architecture
- Code quality

**Reasoning Quality (30%):**
- LLM reasoning quality
- Integration effectiveness

**Evaluation (20%):**
- Quantitative evaluation
- Qualitative evaluation

**Documentation (10%):**
- Report quality
- Reflection depth

---

## Key Takeaways

- **Integration:** Successfully combine statistical forecasting with LLM reasoning
- **Architecture:** Implement FLAIRR-TS architecture
- **Evaluation:** Assess both quantitative and qualitative aspects
- **Reflection:** Learn from the process and identify improvements
- **Application:** Apply course concepts to real-world problems

---

## Course Conclusion

### What You've Learned

**Core Concepts:**
- Prediction vs reasoning
- Forecasting foundations
- LLM limitations
- Hybrid system design
- Probabilistic reasoning
- Scenario planning
- Evaluation methods

**Skills:**
- Statistical forecasting
- LLM integration
- System design
- Evaluation
- Communication

### Next Steps

**Continue Learning:**
- Advanced forecasting methods
- More sophisticated LLM integration
- Evaluation techniques
- Domain-specific applications

**Apply Skills:**
- Build forecasting systems
- Improve existing systems
- Teach others
- Contribute to the field

**Stay Connected:**
- Course community
- Alumni network
- Ongoing discussions
- Future courses

---

## Additional Resources

### Reading
- All course materials
- Research papers on hybrid systems
- Domain-specific literature
- Best practices

### Tools
- Statistical software
- LLM APIs
- Data sources
- Visualization tools

### Community
- Course forum
- Alumni network
- Professional communities
- Research groups

---

**Congratulations on completing the course!**

**The future is not predicted by language. It is reasoned about, under uncertainty, using structured beliefs.**

**You now have the skills to design systems that respect that reality.**

---

**Module 10 Complete. Course Complete! 🎉**
