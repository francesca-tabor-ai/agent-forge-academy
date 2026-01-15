---
title: "Module 6: AI Decision Support vs. Autonomous Execution"
description: "Define the right level of automation"
module: "6"
order: 6
---

# Module 6: AI Decision Support vs. Autonomous Execution

**Duration:** Week 6  
**Learning Objectives:**
- Distinguish suggestive vs. automatic rebalancing
- Design human-in-the-loop governance
- Handle market stress and exceptional events
- Understand regulatory expectations for discretionary management

---

## Lesson 6.1: Suggestive vs. Automatic Rebalancing

### Suggestive Rebalancing

**Characteristics**
- AI suggests actions
- Human approval required
- Advisor oversight
- Final human decision

**Use Cases**
- High-value portfolios
- Complex scenarios
- Client-specific considerations
- Regulatory requirements

### Automatic Rebalancing

**Characteristics**
- AI executes actions
- Pre-approved parameters
- Automated execution
- Post-execution review

**Use Cases**
- Standard portfolios
- Clear-cut scenarios
- Routine rebalancing
- Low-risk situations

---

## Lesson 6.2: Human-in-the-Loop Governance

### Governance Framework

**Review Triggers**
- High-value transactions
- Complex scenarios
- Market stress
- Low confidence

**Approval Workflow**
```python
def rebalancing_workflow(portfolio, drift_analysis):
    """
    Rebalancing workflow with human oversight
    """
    # Generate rebalancing suggestion
    suggestion = generate_rebalancing_suggestion(portfolio, drift_analysis)
    
    # Determine if approval needed
    if requires_approval(suggestion, portfolio):
        # Create approval task
        approval_task = create_approval_task(suggestion, portfolio)
        return approval_task
    else:
        # Auto-execute
        execute_rebalancing(suggestion, portfolio)
        return {'status': 'EXECUTED', 'suggestion': suggestion}
```

---

## Lesson 6.3: Handling Market Stress and Exceptional Events

### Stress Scenarios

**Market Stress**
- High volatility
- Market crashes
- Liquidity crises
- Exceptional events

**Response Strategies**
- Pause automation
- Escalate to humans
- Conservative approach
- Enhanced monitoring

---

## Lesson 6.4: Regulatory Expectations

### Discretionary Management

**Regulatory Framework**
- Fiduciary responsibilities
- Suitability requirements
- Documentation needs
- Oversight obligations

**AI Use Guidelines**
- Human accountability
- Oversight requirements
- Documentation standards
- Audit trail needs

---

## Exercise 6: Design an Escalation Model for AI-Driven Rebalancing

### Objective
Create an escalation model that appropriately routes AI-driven rebalancing actions.

### Requirements

1. **Escalation Triggers**
   - Value thresholds
   - Complexity indicators
   - Risk factors
   - Confidence levels

2. **Escalation Workflow**
   - Routing logic
   - Reviewer assignment
   - Timeline requirements
   - Approval process

3. **Deliverables**
   - Escalation model
   - Workflow diagram
   - Implementation code
   - Documentation

### Evaluation Criteria
- Model completeness (35%)
- Workflow efficiency (30%)
- Risk management (25%)
- Documentation (10%)

---

## Key Takeaways

- Suggestive and automatic rebalancing serve different use cases
- Human-in-the-loop governance ensures quality and accountability
- Market stress requires special handling and human oversight
- Regulatory expectations demand appropriate automation levels

---

**End of Module 6**
