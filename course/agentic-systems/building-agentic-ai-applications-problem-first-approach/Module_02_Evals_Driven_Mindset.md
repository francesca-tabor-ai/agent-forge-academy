---
title: "Module 2: Build an Evals Driven Mindset & Iterative Design"
description: "Learn to frame AI problems through measurable outcomes rather than features or model choices"
module: "2"
order: 2
---

# Module 2: Build an Evals Driven Mindset & Iterative Design

**Duration:** Week 2  
**Learning Objectives:**
- Learn to frame AI problems through measurable outcomes rather than features or model choices
- Understand how evaluation acts as the backbone of reliable agentic systems
- Identify and quantify failure modes early using proxy metrics and iterative testing
- Build evaluation frameworks that guide development decisions

---

## 2.1 The Evals-Driven Philosophy

### Why Evaluation First?

Traditional software development:
1. Build features
2. Test for bugs
3. Fix issues
4. Deploy

**Problem:** This doesn't work for AI systems because:
- "Bugs" are probabilistic, not deterministic
- You can't test all inputs
- "Correctness" is subjective
- Performance varies with context

**Evals-Driven Development:**
1. Define success metrics
2. Build evaluation framework
3. Build minimal system
4. Evaluate and iterate
5. Deploy when metrics are met

### Outcomes Over Features

**Feature-Focused Thinking:**
- "Let's add RAG"
- "We should use GPT-4"
- "Let's build a multi-agent system"

**Outcome-Focused Thinking:**
- "We need 90% accuracy on customer queries"
- "We need to reduce support costs by 40%"
- "We need to resolve 80% of tickets without escalation"

**Key Insight:** Features are means to outcomes. Start with outcomes, then select features that achieve them.

---

## 2.2 Framing Problems Through Measurable Outcomes

### The Outcome Framework

For any AI system, define:

1. **Primary Outcome**
   - What business goal does this achieve?
   - How do we measure success?
   - What's the target metric?

2. **Secondary Outcomes**
   - What other benefits do we want?
   - What constraints must we satisfy?
   - What are acceptable tradeoffs?

3. **Failure Modes**
   - What can go wrong?
   - How do we detect failures?
   - What's the impact of failures?

### Example: Customer Support Agent

**Feature-Focused:**
- "Build a chatbot with RAG"
- "Use GPT-4 for responses"
- "Add multi-agent coordination"

**Outcome-Focused:**
- **Primary:** Resolve 80% of customer queries without human escalation
- **Secondary:** 
  - Average response time < 2 minutes
  - Cost per ticket < $0.50
  - Customer satisfaction > 4.5/5
- **Failure Modes:**
  - Provides incorrect information (detect via confidence scores)
  - Fails to understand query (detect via clarification requests)
  - Escalates unnecessarily (detect via escalation rate)

### Defining Measurable Outcomes

**Good Outcomes:**
- ✅ Specific: "80% resolution rate"
- ✅ Measurable: Can be quantified
- ✅ Relevant: Tied to business goals
- ✅ Time-bound: Achievable in defined timeframe

**Bad Outcomes:**
- ❌ Vague: "Better customer service"
- ❌ Unmeasurable: "More intelligent responses"
- ❌ Irrelevant: "Use latest AI models"
- ❌ Unrealistic: "100% accuracy"

### Outcome Categories

#### 1. Accuracy Outcomes
- Task completion rate
- Correctness percentage
- Error rate
- Precision/recall

#### 2. Efficiency Outcomes
- Time to resolution
- Cost per transaction
- Throughput
- Resource utilization

#### 3. User Experience Outcomes
- User satisfaction scores
- Task completion rate
- Time to value
- Adoption rate

#### 4. Business Outcomes
- Revenue impact
- Cost savings
- Conversion rate
- Retention rate

---

## 2.3 Evaluation as the Backbone of Reliable Systems

### Why Evaluation Matters

**Without Evaluation:**
- You don't know if your system works
- You can't detect regressions
- You can't optimize effectively
- You can't make informed decisions

**With Evaluation:**
- You measure what matters
- You detect issues early
- You optimize systematically
- You make data-driven decisions

### The Evaluation Loop

```
Define Metrics
    ↓
Build System
    ↓
Evaluate System
    ↓
Identify Issues
    ↓
Iterate
    ↓
Re-evaluate
    ↓
Deploy (when metrics met)
```

### Types of Evaluation

#### 1. Unit-Level Evaluation
- Test individual components
- Example: Test retrieval accuracy, test prompt effectiveness
- **When:** During development, debugging

#### 2. Integration Evaluation
- Test component interactions
- Example: Test RAG + LLM pipeline
- **When:** After integration, before deployment

#### 3. End-to-End Evaluation
- Test complete system
- Example: Test full agentic workflow
- **When:** Before deployment, for monitoring

#### 4. Continuous Evaluation
- Monitor production system
- Example: Track metrics over time
- **When:** After deployment, ongoing

### Evaluation Metrics for Agentic Systems

#### Task-Specific Metrics
- **Accuracy:** % of tasks completed correctly
- **Completeness:** % of tasks fully completed
- **Efficiency:** Time/cost per task

#### Agent-Specific Metrics
- **Plan Fidelity:** % of steps executed as planned
- **Tool Success Rate:** % of tool calls that succeed
- **Reasoning Quality:** Quality of intermediate reasoning

#### System-Level Metrics
- **Reliability:** Uptime, error rate
- **Latency:** Response time distribution
- **Cost:** Cost per transaction

---

## 2.4 Identifying and Quantifying Failure Modes

### Common Failure Modes in Agentic Systems

#### 1. Hallucination
- **What:** Model generates false information
- **Impact:** High - can mislead users
- **Detection:** Fact-checking, confidence scores
- **Mitigation:** RAG, verification steps, human review

#### 2. Reasoning Failures
- **What:** Model makes logical errors
- **Impact:** Medium-High - wrong decisions
- **Detection:** Step-by-step evaluation, consistency checks
- **Mitigation:** Better prompts, chain-of-thought, verification

#### 3. Tool Use Failures
- **What:** Incorrect tool calls or parameters
- **Impact:** Medium - system can't complete tasks
- **Detection:** Tool response validation, error monitoring
- **Mitigation:** Better tool descriptions, parameter validation

#### 4. Context Window Issues
- **What:** Important information lost due to context limits
- **Impact:** Medium - incomplete responses
- **Detection:** Context usage monitoring, quality degradation
- **Mitigation:** Better chunking, summarization, retrieval

#### 5. Infinite Loops
- **What:** Agent gets stuck in repetitive actions
- **Impact:** High - wastes resources, poor UX
- **Detection:** Loop detection, step counting
- **Mitigation:** Max steps, better planning, timeout

#### 6. Escalation Failures
- **What:** Fails to escalate when needed, or escalates unnecessarily
- **Impact:** Medium - poor user experience, wasted resources
- **Detection:** Escalation rate monitoring, outcome tracking
- **Mitigation:** Better escalation criteria, confidence thresholds

### Quantifying Failure Modes

For each failure mode, measure:

1. **Frequency**
   - How often does it occur?
   - % of transactions affected

2. **Severity**
   - What's the impact?
   - User impact, business impact

3. **Detectability**
   - Can we detect it?
   - Detection rate, false positive rate

4. **Mitigatability**
   - Can we fix it?
   - Mitigation strategies, success rate

### Example: Failure Mode Analysis

**Failure Mode:** Hallucination in customer support responses

**Frequency:** 15% of responses contain at least one hallucinated fact

**Severity:** 
- High: 5% cause user confusion or incorrect actions
- Medium: 10% cause minor confusion but don't lead to wrong actions

**Detectability:**
- Can detect via fact-checking: 60% detection rate
- Can detect via confidence scores: 40% detection rate
- False positive rate: 10%

**Mitigation:**
- RAG reduces frequency to 5%
- Human review reduces severity to < 1% high-severity cases
- Cost: +$0.10 per ticket

**Decision:** Implement RAG + confidence-based human review for high-confidence hallucinations

---

## 2.5 Proxy Metrics and Iterative Testing

### What Are Proxy Metrics?

**Direct Metrics:** Measure exactly what you care about
- Example: Customer satisfaction score

**Proxy Metrics:** Measure something correlated with what you care about
- Example: Response time, response length, confidence score

**Why Use Proxy Metrics?**
- Direct metrics are expensive to measure
- Direct metrics take time to collect
- Proxy metrics are available immediately
- Proxy metrics can guide development

### Good Proxy Metrics

**Characteristics:**
- ✅ Correlated with target metric
- ✅ Available quickly
- ✅ Easy to measure
- ✅ Actionable

**Example:**
- **Target:** Customer satisfaction
- **Proxy:** Response time, response quality score, confidence score
- **Correlation:** 0.7 with satisfaction
- **Use:** Optimize proxies during development, validate with target metric

### Iterative Testing Strategy

#### Phase 1: Proxy Metrics (Development)
- Use fast, cheap metrics
- Iterate quickly
- Example: Response quality score, latency

#### Phase 2: Validation Metrics (Pre-deployment)
- Use more expensive metrics
- Validate proxy correlations
- Example: Human evaluation, A/B testing

#### Phase 3: Business Metrics (Production)
- Use business outcomes
- Monitor continuously
- Example: Customer satisfaction, cost per ticket

### Example: Iterative Testing Plan

**Week 1-2: Proxy Metrics**
- Response quality score (LLM-as-judge)
- Latency
- Cost per query
- **Goal:** Get proxies to acceptable levels

**Week 3: Validation**
- Human evaluation (100 samples)
- A/B test with current system
- **Goal:** Validate proxy correlations

**Week 4: Business Metrics**
- Deploy to 10% of traffic
- Monitor customer satisfaction
- Monitor escalation rate
- **Goal:** Validate business impact

**Week 5+: Full Deployment**
- Deploy to 100% of traffic
- Monitor all metrics
- **Goal:** Maintain performance

---

## 2.6 Building Evaluation Frameworks

### Framework Components

1. **Test Dataset**
   - Representative samples
   - Edge cases
   - Failure scenarios

2. **Evaluation Metrics**
   - Primary metrics
   - Secondary metrics
   - Proxy metrics

3. **Evaluation Process**
   - How to run evaluations
   - When to evaluate
   - Who evaluates

4. **Reporting**
   - How to report results
   - What to track
   - How to visualize

### Test Dataset Design

**Representative Samples:**
- Cover common use cases
- Reflect real-world distribution
- Include typical queries

**Edge Cases:**
- Unusual queries
- Boundary conditions
- Error cases

**Failure Scenarios:**
- Known failure modes
- Adversarial examples
- Stress tests

**Dataset Size:**
- Development: 50-100 samples
- Validation: 200-500 samples
- Production monitoring: Continuous

### Evaluation Metrics Design

**Primary Metrics:**
- Directly measure business outcomes
- 1-3 metrics maximum
- Clear targets

**Secondary Metrics:**
- Support primary metrics
- Help diagnose issues
- 3-5 metrics

**Proxy Metrics:**
- Fast, cheap alternatives
- Used during development
- Validated against primary metrics

### Evaluation Process

**Automated Evaluation:**
- Run on every code change
- Fast feedback
- Use proxy metrics

**Manual Evaluation:**
- Periodic validation
- Expensive but accurate
- Use primary metrics

**Continuous Evaluation:**
- Monitor production
- Track metrics over time
- Alert on degradation

### Example: Evaluation Framework for Customer Support Agent

**Test Dataset:**
- 200 representative customer queries
- 50 edge cases
- 50 failure scenarios
- Total: 300 test cases

**Primary Metrics:**
- Resolution rate (target: 80%+)
- Customer satisfaction (target: 4.5/5)

**Secondary Metrics:**
- Average response time (target: < 2 min)
- Cost per ticket (target: < $0.50)
- Escalation rate (target: < 20%)

**Proxy Metrics:**
- Response quality score (LLM-as-judge)
- Confidence score
- Response length

**Evaluation Process:**
- Daily: Automated evaluation on test dataset
- Weekly: Human evaluation (50 samples)
- Monthly: Business metrics review

**Reporting:**
- Dashboard with all metrics
- Weekly reports to stakeholders
- Alerts on metric degradation

---

## 2.7 Lab 2: Build an Evaluation Framework for an Agentic System

### Objective

Design and implement an evaluation framework for an agentic AI system.

### Instructions

1. **Choose a System**
   - Use your Lab 1 system, or choose a new one
   - Ensure it's an agentic system (not just RAG)

2. **Define Outcomes**
   - Identify primary business outcome
   - Define success criteria
   - Set target metrics

3. **Identify Failure Modes**
   - List potential failure modes
   - Quantify frequency and severity
   - Design detection methods

4. **Design Test Dataset**
   - Create 50-100 test cases
   - Include representative samples, edge cases, failure scenarios
   - Document each test case

5. **Define Metrics**
   - Primary metrics (1-3)
   - Secondary metrics (3-5)
   - Proxy metrics (for development)

6. **Build Evaluation System**
   - Implement automated evaluation
   - Create evaluation functions
   - Build reporting dashboard

7. **Run Evaluation**
   - Evaluate your system (or a baseline)
   - Report results
   - Identify issues

8. **Document Framework**
   - Write evaluation framework documentation
   - Explain metrics and their rationale
   - Describe evaluation process

### Deliverables

1. Outcomes definition document
2. Failure mode analysis
3. Test dataset (50-100 cases)
4. Evaluation code
5. Evaluation results report
6. Framework documentation

### Evaluation Criteria

- **Outcomes Definition (20%):** Clear, measurable outcomes
- **Failure Mode Analysis (20%):** Comprehensive, quantified
- **Test Dataset (20%):** Representative, well-documented
- **Metrics Design (20%):** Appropriate, actionable
- **Implementation (20%):** Working evaluation system

---

## 2.8 Key Takeaways

1. **Start with outcomes, not features** - Define what success looks like before building

2. **Evaluation is continuous** - Not a one-time activity, but an ongoing process

3. **Use proxy metrics for speed** - Fast feedback during development, validate with real metrics

4. **Quantify failure modes** - Understand what can go wrong and how often

5. **Iterate based on evaluation** - Use metrics to guide development decisions

6. **Build evaluation into the system** - Make it easy to evaluate continuously

---

## 2.9 Additional Resources

### Reading
- "Evaluating AI Systems" - Comprehensive guide to evaluation
- "Proxy Metrics in ML" - Using proxy metrics effectively
- Case studies: Evaluation frameworks from production systems

### Tools
- Langfuse (evaluation and monitoring)
- LLM-as-judge frameworks
- Evaluation dataset templates

### Next Steps
- Complete Lab 2
- Review Module 3 preview (Prompt and Context Engineering)
- Join office hours to discuss evaluation strategies

---

**Previous Module:** [Module 1: Problem-First AI Intuition ←](Module_01_Problem_First_AI_Intuition.md)  
**Next Module:** [Module 3: Master Practical Prompt and Context Engineering →](Module_03_Prompt_Context_Engineering.md)
