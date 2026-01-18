---
title: "Module 5: Suitability, Guardrails & Embedded Compliance"
description: "Keep mass-market AI advice regulator-ready by design"
module: "5"
order: 5
---

# Module 5: Suitability, Guardrails & Embedded Compliance

**Duration:** Week 5  
**Learning Objectives:**
- **embedded suitability logic for retail clients Implementation**: Implement embedded suitability logic for retail clients
- **Conduct Risk**: Conduct risk profiling through conversational inputs
- **Apply Jurisdiction-Aware**: Apply jurisdiction-aware compliance constraints
- **escalation to human advisors when thresholds are crossed Development**: Design escalation to human advisors when thresholds are crossed

---

## Lesson 5.1: Embedded Suitability Logic for Retail Clients

### Suitability Framework

**Suitability Factors**
- Risk tolerance
- Investment objectives
- Time horizon
- Financial situation
- Knowledge and experience

**Embedded Logic**
```python
def assess_suitability(product, client_profile):
    """
    Assess product suitability for client
    """
    suitability_check = {
        'risk_match': check_risk_match(product.risk_rating, client_profile.risk_tolerance),
        'objective_match': check_objective_match(product.objectives, client_profile.investment_objectives),
        'time_horizon_match': check_time_horizon(product.time_horizon, client_profile.time_horizon),
        'financial_situation_match': check_financial_situation(product.requirements, client_profile.financial_situation),
        'knowledge_match': check_knowledge_requirements(product.complexity, client_profile.knowledge_level)
    }
    
    overall_suitability = calculate_overall_suitability(suitability_check)
    
    return {
        'suitability_score': overall_suitability,
        'checks': suitability_check,
        'recommendation': get_suitability_recommendation(overall_suitability)
    }
```

---

## Lesson 5.2: Risk Profiling Through Conversational Inputs

### Conversational Risk Assessment

**Risk Questions**
- Risk tolerance questions
- Loss aversion scenarios
- Time horizon questions
- Financial situation questions

**Conversation Flow**
```python
def conduct_risk_profiling_conversation():
    """
    Conduct risk profiling through conversation
    """
    questions = [
        {
            'question': 'How would you feel if your investment lost 20% in a year?',
            'options': ['Very uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable'],
            'risk_weight': 'high'
        },
        {
            'question': 'What is your investment time horizon?',
            'options': ['Less than 1 year', '1-3 years', '3-5 years', '5+ years'],
            'risk_weight': 'medium'
        },
        {
            'question': 'What is your primary investment goal?',
            'options': ['Preserve capital', 'Generate income', 'Growth', 'Aggressive growth'],
            'risk_weight': 'high'
        }
    ]
    
    responses = []
    for question in questions:
        response = ask_question(question)
        responses.append(response)
    
    risk_profile = calculate_risk_profile(responses)
    return risk_profile
```

---

## Lesson 5.3: Jurisdiction-Aware Compliance Constraints

### Regulatory Variations

**Jurisdictional Differences**
- Suitability requirements
- Disclosure standards
- Product restrictions
- Advice boundaries

**Compliance Engine**
```python
class JurisdictionAwareCompliance:
    """
    Jurisdiction-aware compliance engine
    """
    def __init__(self, jurisdiction):
        self.jurisdiction = jurisdiction
        self.rules = load_compliance_rules(jurisdiction)
    
    def check_compliance(self, action, client_context):
        """
        Check if action complies with jurisdiction rules
        """
        compliance_checks = {
            'suitability': self.check_suitability(action, client_context),
            'disclosures': self.check_disclosures(action, client_context),
            'product_restrictions': self.check_product_restrictions(action, client_context),
            'advice_boundaries': self.check_advice_boundaries(action, client_context)
        }
        
        is_compliant = all(compliance_checks.values())
        
        return {
            'is_compliant': is_compliant,
            'checks': compliance_checks,
            'required_actions': get_required_actions(compliance_checks)
        }
```

---

## Lesson 5.4: Escalation to Human Advisors

### Escalation Triggers

**High-Risk Scenarios**
- Complex situations
- High-value transactions
- Regulatory requirements
- Client requests

**Escalation Framework**
```python
def determine_escalation_need(query, client_context, ai_response):
    """
    Determine if human escalation is needed
    """
    escalation_triggers = {
        'high_value': client_context.account_value > ESCALATION_THRESHOLD,
        'complex_situation': assess_complexity(query) > COMPLEXITY_THRESHOLD,
        'regulatory_requirement': requires_human_oversight(query, client_context),
        'low_confidence': ai_response.confidence < CONFIDENCE_THRESHOLD,
        'client_request': client_context.requested_human_advisor
    }
    
    needs_escalation = any(escalation_triggers.values())
    
    if needs_escalation:
        return create_escalation_task(query, client_context, escalation_triggers)
    else:
        return None
```

---

## Exercise 5: Define Guardrails That Prevent Unsuitable AI Responses

### Objective
Design comprehensive guardrails that prevent the AI from providing unsuitable responses.

### Requirements

1. **Guardrail Framework**
   - Suitability checks
   - Risk boundaries
   - Regulatory constraints
   - Escalation rules

2. **Implementation**
   - Rule definitions
   - Check logic
   - Response filtering
   - Escalation mechanisms

3. **Deliverables**
   - Guardrail specification
   - Implementation code
   - Testing scenarios
   - Documentation

### Evaluation Criteria
- Framework completeness (35%)
- Implementation quality (30%)
- Coverage of scenarios (25%)
- Documentation (10%)

---

## Key Takeaways

- **Embedded Suitability**: Embedded suitability logic ensures regulatory compliance by design
- **Conversational Risk**: Conversational risk profiling makes assessment accessible and natural
- **Jurisdiction-Aware Compliance**: Jurisdiction-aware compliance handles regulatory variations automatically
- **Escalation Mechanisms**: Escalation mechanisms ensure human oversight when needed

---

**End of Module 5**
