---
title: "Module 3: Experimentation Platforms & Operating Models"
description: "Learn to scale experiments safely with platforms, feature flags, concurrent experiments, and organizational processes"
module: "3"
order: 3
email_takeaway: "Scaling experiments requires platforms, feature flags, and organizational processes—not just statistical knowledge."
email_action: "Design an experimentation workflow for a product team, including review process and concurrent experiment management."
---

# Module 3: Experimentation Platforms & Operating Models

**Duration:** Week 3  
**Theme:** *Scaling experiments safely*

**Learning Objectives:**
- **experimentation platform architecture Understanding**: Understand experimentation platform architecture
- **feature flags, ramp-ups, and kill switches Understanding**: Master feature flags, ramp-ups, and kill switches
- **Handle Concurrent**: Handle concurrent experiments and interaction effects
- **organizational experiment review processes Development**: Design organizational experiment review processes
- **Recognize And**: Recognize and manage experiment debt and fatigue
- **scalable experimentation operating models Development**: Build scalable experimentation operating models

---

## 3.1 Experimentation Platforms: Conceptual Architecture

### Why Platforms Matter

**Without a Platform:**
- Manual experiment setup
- Inconsistent implementation
- Difficult to track experiments
- High risk of errors
- Slow iteration

**With a Platform:**
- Standardized experiment setup
- Automated assignment and tracking
- Centralized monitoring
- Reduced errors
- Faster iteration

### Core Platform Components

**1. Experiment Configuration**
- Define experiment parameters
- Set treatment/control groups
- Configure targeting rules
- Set sample sizes and splits

**2. Assignment Engine**
- Deterministic user assignment
- Consistent across sessions
- Handles multiple concurrent experiments
- Manages experiment overlap

**3. Data Collection**
- Event tracking
- Metric calculation
- Real-time monitoring
- Historical data storage

**4. Analysis Engine**
- Statistical testing
- Power calculations
- Confidence intervals
- Multiple testing corrections

**5. Decision Support**
- Automated significance testing
- Guardrail monitoring
- Rollout recommendations
- Reporting dashboards

### Platform Architecture Patterns

**Centralized Platform:**
```
All Experiments → Single Platform → All Applications
```

**Advantages:**
- Consistent methodology
- Centralized expertise
- Easier governance
- Shared infrastructure

**Disadvantages:**
- Potential bottleneck
- One-size-fits-all limitations
- Single point of failure

**Distributed Platform:**
```
Team A Experiments → Platform A → Application A
Team B Experiments → Platform B → Application B
```

**Advantages:**
- Team autonomy
- Specialized solutions
- No single bottleneck

**Disadvantages:**
- Inconsistent methods
- Duplicated effort
- Harder governance

**Hybrid Approach:**
```
Core Platform (Assignment, Analysis)
    ↓
Team-Specific Layers (Implementation)
```

**Best of Both Worlds:**
- Standardized core
- Team flexibility
- Centralized governance

---

## 3.2 Feature Flags, Ramp-Ups, and Kill Switches

### Feature Flags: The Foundation

**Definition:** Runtime configuration that controls feature availability

**Basic Feature Flag:**
```python
if feature_flag_enabled(user_id, "new_checkout"):
    show_new_checkout()
else:
    show_old_checkout()
```

**Feature Flag Types:**

1. **Boolean Flags**
   - On/off for entire user base
   - Simple, but limited

2. **Percentage Flags**
   - Gradual rollout (0% → 100%)
   - Risk mitigation

3. **Targeted Flags**
   - Specific user segments
   - Geographic targeting
   - User attribute targeting

4. **Experiment Flags**
   - A/B test assignment
   - Treatment/control logic

### Ramp-Ups: Gradual Rollout

**Why Ramp Up:**
- Reduce risk of catastrophic failures
- Monitor metrics at each stage
- Catch issues early
- Build confidence

**Ramp-Up Strategy:**

**Stage 1: Internal (1-5%)**
- Team members only
- Validate basic functionality
- Catch obvious bugs

**Stage 2: Canary (5-10%)**
- Small user subset
- Monitor key metrics
- Validate user experience

**Stage 3: Gradual (10% → 50% → 100%)**
- Incremental increases
- Monitor at each stage
- Pause if issues detected

**Ramp-Up Decision Points:**

At each stage, check:
- ✅ Guardrail metrics stable?
- ✅ Success metrics positive?
- ✅ No critical bugs?
- ✅ User feedback acceptable?

If any fail → **Stop ramp-up, investigate**

### Kill Switches: Emergency Controls

**Definition:** Immediate mechanism to disable a feature/experiment

**When to Use Kill Switches:**
- Guardrail metric degradation
- Critical bugs discovered
- User complaints spike
- Business emergency
- Regulatory issue

**Kill Switch Types:**

1. **Immediate Kill**
   - Instant disable
   - All users revert to control
   - Use for critical issues

2. **Gradual Kill**
   - Stop new assignments
   - Existing users complete experience
   - Use for non-critical issues

3. **Partial Kill**
   - Disable for specific segments
   - Keep for others
   - Use for targeted issues

**Kill Switch Implementation:**

```python
def should_show_feature(user_id, feature_name):
    # Check kill switch first
    if is_killed(feature_name):
        return False
    
    # Check experiment assignment
    if is_in_experiment(user_id, feature_name):
        return get_assignment(user_id, feature_name) == "treatment"
    
    return False
```

**Kill Switch Monitoring:**
- Automated alerts on guardrail degradation
- Real-time dashboards
- On-call rotation
- Escalation procedures

---

## 3.3 Concurrent Experiments & Interaction Effects

### The Challenge of Multiple Experiments

**Problem:** Multiple experiments running simultaneously can interact

**Example:**
```
Experiment A: Homepage redesign (50% of users)
Experiment B: Search algorithm (50% of users)
```

**Potential Interactions:**
- Users in both experiments
- Experiments affect same metrics
- One experiment affects another's users

### Experiment Overlap

**Overlap Scenarios:**

1. **No Overlap (Ideal)**
   - Experiments on different user segments
   - Clean, independent results
   - Requires careful planning

2. **Partial Overlap**
   - Some users in multiple experiments
   - Need to account for interactions
   - More realistic in practice

3. **Full Overlap**
   - All users in all experiments
   - Maximum interaction risk
   - Requires factorial design

### Handling Overlap: Strategies

**Strategy 1: Mutual Exclusivity**
```
Experiment A: Users 0-25%
Experiment B: Users 25-50%
Experiment C: Users 50-75%
Experiment D: Users 75-100%
```

**Advantages:**
- No overlap
- Clean results
- Simple analysis

**Disadvantages:**
- Slower experimentation (fewer users per experiment)
- Less flexibility

**Strategy 2: Orthogonal Design**
```
Experiment A: Even user IDs (50%)
Experiment B: User IDs % 4 < 2 (50%)
```

**Result:**
- 25% in both
- 25% in A only
- 25% in B only
- 25% in neither

**Advantages:**
- Can test interactions
- More users per experiment
- Factorial analysis possible

**Disadvantages:**
- More complex analysis
- Requires larger sample sizes

**Strategy 3: Allow Overlap, Monitor Interactions**
```
Experiment A: 50% of users
Experiment B: 50% of users
Overlap: ~25% (by chance)
```

**Approach:**
- Allow natural overlap
- Monitor for interactions
- Analyze separately and together
- Acknowledge limitations

**Advantages:**
- Maximum flexibility
- Faster experimentation

**Disadvantages:**
- Interaction risk
- More complex analysis
- Potential confounding

### Detecting Interaction Effects

**Signs of Interaction:**
- Results differ when experiments run together vs separately
- Unexpected metric movements
- Segment-level inconsistencies

**Analysis Methods:**

1. **Factorial Analysis**
   - Test all combinations
   - Estimate main effects and interactions
   - Requires factorial design

2. **Subgroup Analysis**
   - Compare results for users in one vs both experiments
   - Detect if overlap affects outcomes

3. **Sequential Testing**
   - Run experiments sequentially
   - Compare to concurrent results
   - Identify interactions

### Best Practices for Concurrent Experiments

1. **Experiment Registry**
   - Track all active experiments
   - Document overlap
   - Monitor interactions

2. **Priority System**
   - High-priority experiments get exclusive users
   - Low-priority can overlap
   - Clear escalation rules

3. **Interaction Testing**
   - Periodically test for interactions
   - Document known interactions
   - Update analysis accordingly

4. **Communication**
   - Teams aware of other experiments
   - Coordinate on high-impact changes
   - Share learnings

---

## 3.4 Organizational Experiment Review Processes

### Why Review Processes Matter

**Without Review:**
- Poorly designed experiments
- Wasted resources
- Incorrect conclusions
- Low trust in results

**With Review:**
- Higher quality experiments
- Better resource allocation
- More trustworthy results
- Organizational learning

### Review Process Components

**1. Pre-Experiment Review**

**Purpose:** Validate experiment design before launch

**Review Checklist:**
- ✅ Clear hypothesis?
- ✅ Appropriate success metrics?
- ✅ Guardrails defined?
- ✅ Sample size adequate?
- ✅ Randomization sound?
- ✅ Analysis plan complete?
- ✅ Business alignment?

**Reviewers:**
- Data scientist (statistical validity)
- Product manager (business alignment)
- Engineer (implementation feasibility)
- Stakeholder (strategic fit)

**2. Mid-Experiment Monitoring**

**Purpose:** Catch issues early

**Monitoring:**
- Real-time guardrail alerts
- Daily metric checks
- Automated anomaly detection
- User feedback review

**Escalation:**
- Guardrail degradation → Immediate review
- Unexpected results → Investigate
- User complaints → Assess impact

**3. Post-Experiment Review**

**Purpose:** Learn from results and process

**Review Components:**
- Results interpretation
- Decision recommendation
- Process improvements
- Knowledge sharing

### Review Process Models

**Model 1: Centralized Review Board**

**Structure:**
- Central team reviews all experiments
- Standardized process
- Consistent quality

**Advantages:**
- High quality standards
- Knowledge centralization
- Consistent methodology

**Disadvantages:**
- Potential bottleneck
- Slower iteration
- Less team autonomy

**Model 2: Distributed Review**

**Structure:**
- Teams review their own experiments
- Lightweight central oversight
- Self-service tools

**Advantages:**
- Faster iteration
- Team autonomy
- Scales well

**Disadvantages:**
- Quality variation
- Less knowledge sharing
- Potential inconsistencies

**Model 3: Hybrid (Recommended)**

**Structure:**
- Teams design and run experiments
- Central review for high-stakes experiments
- Self-service for low-stakes
- Regular quality audits

**Advantages:**
- Balance speed and quality
- Scales with organization
- Continuous improvement

### Experiment Tiers

**Tier 1: High-Stakes (Full Review)**
- Revenue impact > $X
- User-facing major changes
- Regulatory implications
- Strategic initiatives

**Review Required:**
- Pre-experiment review
- Mid-experiment monitoring
- Post-experiment review
- Executive sign-off

**Tier 2: Medium-Stakes (Light Review)**
- Moderate business impact
- Feature improvements
- Optimization experiments

**Review Required:**
- Self-service design
- Automated monitoring
- Post-experiment summary

**Tier 3: Low-Stakes (Self-Service)**
- Small optimizations
- Exploratory tests
- Quick iterations

**Review Required:**
- Self-service only
- Automated alerts
- Optional post-review

---

## 3.5 Experiment Debt & Experiment Fatigue

### Experiment Debt

**Definition:** Accumulated technical and process issues from experiments

**Types of Debt:**

1. **Technical Debt**
   - Dead experiment code
   - Unused feature flags
   - Legacy experiment infrastructure
   - Inconsistent implementations

2. **Process Debt**
   - Incomplete documentation
   - Unresolved experiments
   - Missing analyses
   - Knowledge gaps

3. **Organizational Debt**
   - Unclear ownership
   - Inconsistent practices
   - Lack of standards
   - Poor communication

### Managing Technical Debt

**Prevention:**
- Clean up experiment code after completion
- Remove unused feature flags
- Standardize implementations
- Regular code reviews

**Remediation:**
- Periodic cleanup sprints
- Flag removal campaigns
- Code refactoring
- Infrastructure updates

**Metrics to Track:**
- Number of active feature flags
- Lines of experiment code
- Unused experiment infrastructure
- Technical debt score

### Experiment Fatigue

**Definition:** Reduced effectiveness due to too many experiments

**Symptoms:**
- Users see too many changes
- Experiment effects diminish
- Analysis becomes harder
- Team burnout

**Causes:**
- Too many concurrent experiments
- Frequent changes to same features
- Lack of coordination
- No prioritization

### Managing Experiment Fatigue

**1. Prioritization**
- Focus on high-impact experiments
- Kill low-value experiments early
- Coordinate related experiments
- Set experiment limits per team

**2. User Experience**
- Limit experiments per user
- Coordinate related changes
- Monitor user feedback
- Respect user preferences

**3. Analysis Quality**
- Fewer, better experiments
- Adequate sample sizes
- Proper analysis time
- Quality over quantity

**4. Team Health**
- Realistic experiment targets
- Time for analysis and learning
- Celebrate wins
- Learn from failures

### Experiment Velocity vs Quality

**Trade-off:**
- High velocity → More experiments, lower quality
- High quality → Fewer experiments, better results

**Optimal Balance:**
- Quality gates prevent bad experiments
- Streamlined process enables speed
- Focus on high-impact experiments
- Continuous improvement

**Metrics:**
- Experiments per month
- Experiment success rate
- Time to results
- Decision quality

---

## 3.6 Key Takeaways

**Platform Architecture:**
- Core components: Configuration, assignment, data, analysis, decisions
- Centralized vs distributed vs hybrid approaches
- Choose based on organization size and needs

**Feature Flags & Controls:**
- Feature flags enable experimentation
- Ramp-ups reduce risk
- Kill switches provide safety
- Monitor continuously

**Concurrent Experiments:**
- Overlap is common
- Interactions can occur
- Use strategies: mutual exclusivity, orthogonal design, or monitored overlap
- Detect and account for interactions

**Review Processes:**
- Pre-experiment: Validate design
- Mid-experiment: Monitor and escalate
- Post-experiment: Learn and improve
- Tier experiments by stakes

**Debt & Fatigue:**
- Technical, process, and organizational debt accumulate
- Experiment fatigue reduces effectiveness
- Balance velocity and quality
- Prioritize high-impact experiments

---

## Lab 3: Design Scalable Experimentation Operating Model

**Objective:** Design an experimentation workflow for a product team

**Requirements:**

Design a complete operating model including:

1. **Platform Architecture**
   - Centralized, distributed, or hybrid?
   - Core components and responsibilities
   - Integration with existing systems

2. **Experiment Workflow**
   - Pre-experiment process
   - Launch process
   - Monitoring process
   - Post-experiment process

3. **Review Process**
   - Experiment tiers (high/medium/low stakes)
   - Review requirements for each tier
   - Reviewers and responsibilities
   - Escalation procedures

4. **Concurrent Experiment Management**
   - Overlap strategy
   - Interaction detection
   - Prioritization system
   - Experiment registry

5. **Feature Flag & Safety Controls**
   - Feature flag strategy
   - Ramp-up procedures
   - Kill switch implementation
   - Monitoring and alerts

6. **Debt & Fatigue Management**
   - Technical debt prevention
   - Experiment fatigue mitigation
   - Quality vs velocity balance
   - Metrics and KPIs

**Deliverables:**
- Operating model document (5-7 pages)
- Process flow diagrams
- Review checklists
- Metrics dashboard mockup

**Evaluation Criteria:**
- Complete workflow design (30%)
- Appropriate review process (25%)
- Sound concurrent experiment strategy (25%)
- Practical debt management (20%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Experimentation Works" - Stefan Thomke
- "Building an Experimentation Culture" - Industry case studies
- "Feature Flag Best Practices" - LaunchDarkly, Split.io docs
- "Scaling Experimentation" - Google, Microsoft, Netflix case studies

**Videos:**
- "Experimentation at Scale" - Ronny Kohavi
- "Feature Flags in Production" - Industry talks
- "Building Experimentation Culture" - Conference talks

**Tools:**
- Feature flag platforms (LaunchDarkly, Split.io, Optimizely)
- Experimentation platforms (Optimizely, VWO, Google Optimize)
- Experiment tracking tools (internal dashboards)

**Next Module Preview:**
Module 4 will cover causal inference methods for when you can't randomize—Difference-in-Differences, synthetic control, matching, and when to use each.

---

**Module 3 Complete**  
**Next:** Module 4 - Causal Inference Beyond A/B Tests
