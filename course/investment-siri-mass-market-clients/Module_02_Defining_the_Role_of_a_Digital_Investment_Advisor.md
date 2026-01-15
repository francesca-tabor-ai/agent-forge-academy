---
title: "Module 2: Defining the Role of a Digital Investment Advisor"
description: "Clarify what an Investment Siri should—and should not—do"
module: "2"
order: 2
---

# Module 2: Defining the Role of a Digital Investment Advisor

**Duration:** Week 2  
**Learning Objectives:**
- Distinguish guidance vs. recommendations vs. execution
- Understand goal-based investing for non-expert clients
- Design question-led advisory journeys
- Manage expectations and trust in AI

---

## Lesson 2.1: Guidance vs. Recommendations vs. Execution

### Guidance

**Characteristics**
- Educational information
- General principles
- Market context
- No specific actions

**Examples**
- "Diversification helps manage risk"
- "Long-term investing typically outperforms short-term trading"
- "Consider your time horizon when investing"

### Recommendations

**Characteristics**
- Specific suggestions
- Personalized advice
- Suitability-based
- Regulatory oversight

**Examples**
- "Based on your profile, consider a 60/40 stock/bond allocation"
- "This fund matches your risk tolerance and goals"
- "Given your situation, I recommend..."

### Execution

**Characteristics**
- Trade execution
- Order placement
- Transaction processing
- Operational functions

**Examples**
- Placing buy/sell orders
- Rebalancing portfolios
- Executing trades
- Managing transactions

---

## Lesson 2.2: Goal-Based Investing for Non-Expert Clients

### Goal Framework

**Goal Types**
- Retirement planning
- Education funding
- Home purchase
- Wealth accumulation
- Emergency fund

**Goal Characteristics**
- Time horizon
- Target amount
- Priority level
- Risk tolerance

### Implementation

**Goal-Based Approach**
```python
def assess_goal_requirements(client_goal):
    """
    Assess requirements for client investment goal
    """
    goal_analysis = {
        'goal_type': client_goal.type,
        'time_horizon': client_goal.time_horizon,
        'target_amount': client_goal.target_amount,
        'current_savings': client_goal.current_savings,
        'required_return': calculate_required_return(client_goal),
        'risk_profile': determine_risk_profile(client_goal),
        'investment_strategy': recommend_strategy(client_goal)
    }
    
    return goal_analysis
```

---

## Lesson 2.3: Question-Led Advisory Journeys

### Journey Design

**Conversation Flow**
- Opening questions
- Goal discovery
- Risk assessment
- Strategy discussion
- Next steps

**Question Types**
- Open-ended questions
- Multiple choice
- Scale-based questions
- Follow-up questions

### Implementation

**Conversation Framework**
```python
def design_advisory_journey(client_type):
    """
    Design question-led advisory journey
    """
    journey = {
        'opening': get_opening_questions(client_type),
        'goal_discovery': get_goal_questions(),
        'risk_assessment': get_risk_questions(),
        'strategy_discussion': get_strategy_questions(),
        'next_steps': get_next_step_questions()
    }
    
    return journey
```

---

## Lesson 2.4: Managing Expectations and Trust in AI

### Expectation Setting

**Clear Communication**
- What AI can do
- What AI cannot do
- Limitations
- When to escalate

**Trust Building**
- Transparency
- Explainability
- Consistency
- Reliability

### Trust Mechanisms

**Building Trust**
- Clear explanations
- Source attribution
- Confidence indicators
- Human escalation options

---

## Exercise 2: Design a Conversation Flow for a First-Time Retail Investor

### Objective
Create a complete conversation flow for a first-time retail investor using the Investment Siri.

### Requirements

1. **Conversation Design**
   - Opening interaction
   - Goal discovery
   - Risk assessment
   - Education and guidance
   - Next steps

2. **User Experience**
   - Natural language
   - Clear questions
   - Helpful responses
   - Appropriate tone

3. **Deliverables**
   - Conversation flow diagram
   - Sample dialogues
   - UX guidelines
   - Implementation framework

### Evaluation Criteria
- Flow completeness (35%)
- User experience quality (30%)
- Natural language (25%)
- Implementation feasibility (10%)

---

## Key Takeaways

- Clear distinction between guidance, recommendations, and execution is essential
- Goal-based investing makes advice accessible to non-expert clients
- Question-led journeys create engaging, personalized experiences
- Managing expectations and building trust are critical for AI adoption

---

**End of Module 2**
