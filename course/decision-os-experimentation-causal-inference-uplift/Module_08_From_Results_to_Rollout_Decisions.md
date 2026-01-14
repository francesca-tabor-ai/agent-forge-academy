---
title: "Module 8: From Results to Rollout Decisions"
description: "Learn to translate experiment results into decisions: communicate uncertainty, align stakeholders, and build institutional learning"
module: "8"
order: 8
email_takeaway: "Translating experiment results into decisions requires clear communication, stakeholder alignment, and building organizational learning."
email_action: "Write a rollout memo based on experiment results, communicating uncertainty and making a clear recommendation."
---

# Module 8: From Results to Rollout Decisions

**Duration:** Week 8  
**Theme:** *Closing the loop*

**Learning Objectives:**
- Translate experiment results into clear decisions
- Apply rollout, iterate, or kill frameworks
- Communicate uncertainty to executives effectively
- Align Product, Data, and Leadership teams
- Build institutional learning from experiments
- Create executive-ready decision recommendations

---

## 8.1 Translating Results into Decisions

### The Decision Framework

**Three Possible Outcomes:**

1. **Rollout**
   - Positive, significant results
   - Guardrails passed
   - Confident in decision
   - Proceed with implementation

2. **Iterate**
   - Mixed or inconclusive results
   - Potential but needs refinement
   - Learn and improve
   - Test again

3. **Kill**
   - Negative or no results
   - Guardrails failed
   - Not worth pursuing
   - Move on

### Decision Criteria

**Rollout Criteria:**

✅ **Success Metrics:**
- Statistically significant positive effect
- Effect size is practically meaningful
- Confidence interval excludes zero (or negative values)

✅ **Guardrails:**
- No degradation in guardrail metrics
- All safety checks passed
- No unintended consequences detected

✅ **Business Case:**
- Positive ROI (if applicable)
- Aligns with strategy
- Feasible to implement
- Low risk

**Iterate Criteria:**

⚠️ **Potential But Issues:**
- Positive direction but not significant
- Effect size too small
- Some guardrail concerns
- Implementation issues

⚠️ **Learning Opportunities:**
- Clear what to improve
- Feasible to iterate
- Worth additional investment
- Strategic importance

**Kill Criteria:**

❌ **Negative Results:**
- Statistically significant negative effect
- Guardrails failed
- Unintended consequences
- High risk

❌ **No Value:**
- No significant effect
- Effect size too small to matter
- Not worth further investment
- Better alternatives exist

### Decision Matrix

| Success Metric | Guardrail | Effect Size | Decision |
|----------------|-----------|-------------|----------|
| ✅ Significant + | ✅ Pass | ✅ Meaningful | **Rollout** |
| ✅ Significant + | ✅ Pass | ⚠️ Small | **Iterate or Rollout** |
| ✅ Significant + | ❌ Fail | ✅ Meaningful | **Kill or Iterate** |
| ⚠️ Not Significant | ✅ Pass | ⚠️ Uncertain | **Iterate** |
| ⚠️ Not Significant | ❌ Fail | ⚠️ Uncertain | **Kill** |
| ❌ Significant - | Any | Any | **Kill** |

### Context Matters

**High-Stakes Decisions:**
- Require higher confidence
- More stringent criteria
- May need extended experiments
- Executive approval

**Low-Stakes Decisions:**
- Can proceed with less confidence
- Faster iteration
- Lower risk tolerance for negative

**Strategic Importance:**
- High strategic value → More investment
- Low strategic value → Kill faster

---

## 8.2 Rollout, Iterate, or Kill Frameworks

### Framework 1: Confidence-Based

**Structure:**
- Assess confidence level
- Make decision based on confidence

**High Confidence (80%+):**
- Clear positive results
- All checks passed
- Low uncertainty
- **Decision: Rollout**

**Medium Confidence (50-80%):**
- Positive but uncertain
- Some concerns
- Moderate risk
- **Decision: Iterate or Limited Rollout**

**Low Confidence (<50%):**
- Inconclusive or negative
- High uncertainty
- High risk
- **Decision: Iterate or Kill**

### Framework 2: Risk-Reward

**Structure:**
- Assess potential reward
- Assess potential risk
- Make decision based on balance

**High Reward, Low Risk:**
- Large positive effect
- No guardrail issues
- Easy to rollback
- **Decision: Rollout**

**High Reward, High Risk:**
- Large positive effect
- Some guardrail concerns
- Hard to rollback
- **Decision: Iterate or Cautious Rollout**

**Low Reward, Low Risk:**
- Small positive effect
- No issues
- Easy to implement
- **Decision: Rollout (if low cost) or Iterate**

**Low Reward, High Risk:**
- Small or negative effect
- Guardrail issues
- High cost
- **Decision: Kill**

### Framework 3: Investment-Based

**Structure:**
- Assess investment made
- Assess potential return
- Decide if worth continuing

**High Investment, High Potential:**
- Significant resources invested
- Clear potential value
- **Decision: Iterate (don't waste investment)**

**High Investment, Low Potential:**
- Significant resources invested
- Limited potential
- **Decision: Kill (sunk cost fallacy)**

**Low Investment, High Potential:**
- Minimal resources
- High potential value
- **Decision: Iterate or Rollout**

**Low Investment, Low Potential:**
- Minimal resources
- Limited potential
- **Decision: Kill (easy decision)**

### Framework 4: Strategic Alignment

**Structure:**
- Assess strategic importance
- Assess results quality
- Make decision based on alignment

**High Strategic, Good Results:**
- Aligns with strategy
- Positive results
- **Decision: Rollout**

**High Strategic, Poor Results:**
- Aligns with strategy
- Negative or inconclusive
- **Decision: Iterate (find different approach)**

**Low Strategic, Good Results:**
- Not strategic priority
- Positive results
- **Decision: Rollout (if low cost) or Defer**

**Low Strategic, Poor Results:**
- Not strategic priority
- Negative or inconclusive
- **Decision: Kill**

### Choosing a Framework

**Use Multiple Frameworks:**
- Don't rely on single framework
- Apply 2-3 frameworks
- Look for consensus
- Use judgment to resolve conflicts

**Context-Specific:**
- High-stakes → Confidence-based
- Resource-constrained → Investment-based
- Strategic initiatives → Strategic alignment
- General use → Risk-reward

---

## 8.3 Communicating Uncertainty to Executives

### The Challenge

**Executives Want:**
- Clear answers
- Confidence
- Actionable recommendations
- Business impact

**Reality:**
- Experiments have uncertainty
- Results are probabilistic
- Need to communicate nuance
- Without losing credibility

### Communication Principles

**1. Lead with the Answer**

**Structure:**
1. Recommendation (first sentence)
2. Evidence (supporting data)
3. Uncertainty (limitations)
4. Next steps (action plan)

**Example:**
> "We recommend rolling out the new checkout flow. The experiment showed a 12% increase in conversion with 95% confidence interval of [8%, 16%]. While there's some uncertainty, the lower bound still represents meaningful business impact. We'll monitor closely and can rollback if needed."

**2. Quantify Uncertainty**

**Don't Say:**
- "Results are uncertain"
- "We're not sure"
- "Maybe it works"

**Do Say:**
- "95% confidence interval: [X, Y]"
- "We're 80% confident this will work"
- "Effect could be as small as X or as large as Y"

**3. Use Business Language**

**Avoid:**
- Statistical jargon
- Technical details
- P-values (unless asked)

**Use:**
- Business impact
- Revenue implications
- User experience
- Risk assessment

**4. Provide Context**

**Include:**
- Why this decision matters
- What alternatives were considered
- What happens if we're wrong
- How we'll know if we're right

### Communication Formats

**1. Executive Summary (1 page)**

**Structure:**
- Recommendation (1 paragraph)
- Key Results (2-3 bullets)
- Business Impact (1 paragraph)
- Risks & Mitigation (1 paragraph)
- Next Steps (1 paragraph)

**2. Rollout Memo (2-3 pages)**

**Structure:**
- Executive Summary
- Experiment Overview
- Results & Analysis
- Decision Recommendation
- Implementation Plan
- Risk Assessment
- Monitoring Plan

**3. Presentation (10-15 slides)**

**Structure:**
- Title slide
- Recommendation
- Experiment overview
- Key results (visuals)
- Business impact
- Uncertainty & risks
- Implementation plan
- Q&A backup slides

### Visualizing Uncertainty

**Good Visualizations:**
- Confidence intervals on charts
- Effect size with uncertainty bands
- Probability distributions
- Scenario analysis

**Example Chart:**
```
Conversion Rate Increase
  ↑
  |
  |     [===== Effect =====]
  |     |                  |
  |     |   95% CI         |
  |     |                  |
  +-----+------------------+----
  0%    5%   10%   15%   20%
```

**Avoid:**
- Hiding uncertainty
- Overstating confidence
- Misleading visuals

---

## 8.4 Aligning Product, Data & Leadership

### The Alignment Challenge

**Different Perspectives:**
- **Product:** User experience, features, roadmap
- **Data:** Statistical validity, methodology, rigor
- **Leadership:** Business impact, strategy, resources

**Common Misalignments:**
- Product wants to ship, Data wants more evidence
- Leadership wants certainty, Data provides uncertainty
- Product focuses on features, Data focuses on metrics

### Alignment Strategies

**1. Shared Frameworks**

**Establish Common Language:**
- Decision criteria everyone understands
- Risk assessment framework
- Success definition
- Guardrail agreement

**Example:**
```
Success = 5%+ conversion increase AND
         No guardrail degradation AND
         95% confidence interval excludes zero
```

**2. Regular Communication**

**Structured Updates:**
- Weekly experiment reviews
- Monthly decision summaries
- Quarterly strategic alignment
- Ad-hoc for high-stakes

**3. Collaborative Planning**

**Involve All Stakeholders:**
- Experiment design phase
- Success metric definition
- Guardrail selection
- Decision criteria

**4. Clear Roles**

**Define Responsibilities:**
- **Data:** Statistical validity, analysis, methodology
- **Product:** User experience, implementation, features
- **Leadership:** Strategic alignment, resource allocation, final decisions

**5. Decision Escalation**

**Clear Escalation Path:**
- Data/Product can make low-stakes decisions
- Leadership approval for high-stakes
- Disagreement resolution process

### Building Trust

**Trust Builders:**
- Deliver accurate analyses
- Communicate clearly
- Acknowledge limitations
- Learn from mistakes
- Show business impact

**Trust Killers:**
- Overstating confidence
- Hiding problems
- Ignoring feedback
- Poor communication
- Inconsistent quality

---

## 8.5 Building Institutional Learning

### Why Institutional Learning Matters

**Individual Learning:**
- Person learns from experiment
- Knowledge stays with person
- Lost when person leaves

**Institutional Learning:**
- Organization learns from experiments
- Knowledge captured and shared
- Persists across people
- Enables better decisions over time

### Learning Components

**1. Experiment Documentation**

**Capture:**
- Hypothesis
- Design decisions
- Results
- Interpretation
- Decision made
- Lessons learned

**Format:**
- Experiment database
- Wiki or documentation
- Searchable repository
- Regular updates

**2. Post-Mortems**

**After Each Experiment:**
- What worked?
- What didn't?
- What surprised us?
- What would we do differently?

**Structure:**
- Results summary
- Process review
- Methodology assessment
- Recommendations

**3. Pattern Recognition**

**Identify Patterns:**
- What types of experiments work?
- What types fail?
- Common failure modes?
- Success factors?

**Examples:**
- "Pricing experiments often show negative short-term, positive long-term"
- "UI changes need longer experiments to see full effect"
- "Personalization works better for engaged users"

**4. Methodology Evolution**

**Improve Over Time:**
- Better guardrail design
- Improved analysis methods
- More efficient processes
- Better tools

**5. Knowledge Sharing**

**Share Learnings:**
- Regular team meetings
- Experiment showcases
- Best practices documentation
- Training sessions

### Learning Systems

**1. Experiment Database**

**Track:**
- All experiments (past and present)
- Results and decisions
- Key learnings
- Searchable and filterable

**2. Decision Log**

**Document:**
- Decisions made
- Rationale
- Outcomes
- Retrospectives

**3. Best Practices Library**

**Maintain:**
- Design patterns
- Analysis templates
- Common pitfalls
- Success stories

**4. Regular Reviews**

**Schedule:**
- Weekly experiment reviews
- Monthly learning sessions
- Quarterly methodology reviews
- Annual strategic reviews

### Measuring Learning

**Metrics:**
- Experiment success rate (improving?)
- Time to decision (decreasing?)
- Decision quality (improving?)
- Knowledge reuse (increasing?)

**Indicators:**
- Fewer repeated mistakes
- Faster experiment design
- Better predictions
- More confident decisions

---

## 8.6 Key Takeaways

**Translating Results:**
- Three outcomes: Rollout, Iterate, or Kill
- Use decision criteria and frameworks
- Consider context and stakes
- Apply multiple frameworks for validation

**Decision Frameworks:**
- Confidence-based: Assess certainty
- Risk-reward: Balance potential
- Investment-based: Consider sunk costs
- Strategic alignment: Match priorities
- Use multiple frameworks

**Executive Communication:**
- Lead with recommendation
- Quantify uncertainty
- Use business language
- Provide context
- Visualize uncertainty clearly

**Stakeholder Alignment:**
- Establish shared frameworks
- Regular communication
- Collaborative planning
- Clear roles and escalation
- Build trust over time

**Institutional Learning:**
- Document experiments
- Conduct post-mortems
- Recognize patterns
- Evolve methodology
- Share knowledge
- Measure learning

---

## Lab 8: Write Rollout Memo

**Objective:** Write an executive-ready rollout memo based on experiment results

**Requirements:**

Use real or simulated experiment results to write a rollout memo.

**Memo Structure:**

1. **Executive Summary** (1 page)
   - Recommendation (first paragraph)
   - Key results (2-3 bullets)
   - Business impact (1 paragraph)
   - Risks & mitigation (1 paragraph)
   - Next steps (1 paragraph)

2. **Experiment Overview** (1 page)
   - Hypothesis
   - Design
   - Success metrics
   - Guardrails
   - Sample size and duration

3. **Results & Analysis** (1-2 pages)
   - Primary results
   - Statistical analysis
   - Segment analysis
   - Guardrail assessment
   - Uncertainty quantification

4. **Decision Recommendation** (1 page)
   - Clear recommendation (Rollout/Iterate/Kill)
   - Rationale
   - Framework used
   - Confidence level

5. **Implementation Plan** (1 page)
   - Rollout strategy
   - Timeline
   - Resource requirements
   - Monitoring plan

6. **Risk Assessment** (1 page)
   - Identified risks
   - Mitigation strategies
   - Contingency plans
   - Rollback procedures

**Deliverables:**
- Complete rollout memo (6-8 pages)
- Supporting analysis (if applicable)
- Presentation version (optional)

**Evaluation Criteria:**
- Clear recommendation (25%)
- Effective uncertainty communication (25%)
- Complete analysis (20%)
- Practical implementation plan (15%)
- Professional presentation (15%)

**Time Estimate:** 6-8 hours

---

## Additional Resources

**Readings:**
- "How to Present Data" - Various guides
- "Executive Communication" - Business writing
- "Decision-Making Under Uncertainty" - Case studies
- "Building Learning Organizations" - Management literature

**Videos:**
- "Presenting Data to Executives" - Industry talks
- "Communicating Uncertainty" - Academic talks
- "Stakeholder Alignment" - Management talks

**Tools:**
- Presentation templates
- Data visualization tools
- Experiment documentation systems
- Decision frameworks

**Next: Capstone Project**
The capstone will bring together all concepts to build an end-to-end Decision OS for a real business decision.

---

**Module 8 Complete**  
**Next:** Capstone Project - Build a Decision OS
