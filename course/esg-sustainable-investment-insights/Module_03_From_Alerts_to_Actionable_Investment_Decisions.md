---
title: "Module 3: From Alerts to Actionable Investment Decisions"
description: "Turn real-time ESG signals into portfolio responses"
module: "3"
order: 3
---

# Module 3: From Alerts to Actionable Investment Decisions

**Duration:** Week 3  
**Learning Objectives:**
- **controversies Integration**: Link controversies to holdings and issuers
- **short-term Analysis**: Distinguish short-term vs. structural ESG risks
- **engagement, escalation, or divestment Development**: Design engagement, escalation, or divestment workflows
- **Coordinate Between**: Coordinate between ESG, risk, and investment teams

---

## Lesson 3.1: Linking Controversies to Holdings and Issuers

### Portfolio Linkage

**Linkage Framework**
```python
class PortfolioControversyLinker:
    """
    Link ESG controversies to portfolio holdings
    """
    def __init__(self):
        self.portfolio_manager = PortfolioManager()
        self.entity_matcher = EntityMatcher()
    
    def link_controversies_to_portfolio(self, controversies, portfolio):
        """
        Link controversies to portfolio holdings
        """
        linked_controversies = []
        
        for controversy in controversies:
            # Match to portfolio holdings
            holdings = self.entity_matcher.match_to_holdings(
                controversy.company, portfolio
            )
            
            if holdings:
                for holding in holdings:
                    linked = {
                        'controversy': controversy,
                        'holding': holding,
                        'exposure': calculate_exposure(holding, portfolio),
                        'impact': assess_impact(controversy, holding),
                        'urgency': calculate_urgency(controversy, holding)
                    }
                    linked_controversies.append(linked)
        
        return linked_controversies
```

### Impact Assessment

**Impact Calculation**
- Portfolio exposure
- Financial impact
- Reputational risk
- Regulatory risk

---

## Lesson 3.2: Short-Term vs. Structural ESG Risks

### Risk Classification

**Risk Types**
- Short-term risks
- Structural risks
- Cyclical risks
- Event-driven risks

**Classification Framework**
```python
def classify_esg_risk(controversy, holding):
    """
    Classify ESG risk as short-term or structural
    """
    risk_indicators = {
        'event_driven': is_event_driven(controversy),
        'systemic_issue': is_systemic_issue(controversy),
        'historical_pattern': check_historical_pattern(controversy.company),
        'governance_weakness': assess_governance_weakness(controversy),
        'regulatory_action': has_regulatory_action(controversy)
    }
    
    if risk_indicators['systemic_issue'] or \
       risk_indicators['governance_weakness'] or \
       risk_indicators['historical_pattern']:
        risk_type = 'structural'
    elif risk_indicators['event_driven'] and not risk_indicators['regulatory_action']:
        risk_type = 'short_term'
    else:
        risk_type = 'mixed'
    
    return {
        'risk_type': risk_type,
        'indicators': risk_indicators,
        'recommendation': get_risk_recommendation(risk_type, risk_indicators)
    }
```

### Response Strategy

**Strategy Selection**
- Short-term: Monitor, engage
- Structural: Escalate, divest
- Mixed: Assess case-by-case

---

## Lesson 3.3: Engagement, Escalation, or Divestment Workflows

### Workflow Framework

**Workflow Types**
```python
class ESGResponseWorkflow:
    """
    Workflow for ESG controversy response
    """
    def __init__(self):
        self.engagement_manager = EngagementManager()
        self.escalation_manager = EscalationManager()
        self.divestment_manager = DivestmentManager()
    
    def determine_workflow(self, linked_controversy):
        """
        Determine appropriate workflow for controversy
        """
        risk_assessment = assess_risk(linked_controversy)
        
        if risk_assessment.risk_type == 'short_term' and \
           risk_assessment.severity < 'high':
            return self.engagement_manager.create_workflow(linked_controversy)
        
        elif risk_assessment.risk_type == 'structural' or \
             risk_assessment.severity >= 'high':
            return self.escalation_manager.create_workflow(linked_controversy)
        
        elif risk_assessment.severity == 'critical' and \
             risk_assessment.risk_type == 'structural':
            return self.divestment_manager.create_workflow(linked_controversy)
        
        else:
            return self.engagement_manager.create_workflow(linked_controversy)
```

### Engagement Workflow

**Engagement Steps**
- Initial contact
- Information request
- Dialogue establishment
- Progress monitoring
- Outcome assessment

### Escalation Workflow

**Escalation Steps**
- Risk assessment
- Senior review
- Enhanced engagement
- Public statement
- Voting action

### Divestment Workflow

**Divestment Steps**
- Final assessment
- Approval process
- Execution plan
- Communication
- Monitoring

---

## Lesson 3.4: Coordination Between Teams

### Team Coordination

**Coordination Framework**
```python
class TeamCoordinator:
    """
    Coordinate ESG, risk, and investment teams
    """
    def __init__(self):
        self.esg_team = ESGTeam()
        self.risk_team = RiskTeam()
        self.investment_team = InvestmentTeam()
    
    def coordinate_response(self, linked_controversy):
        """
        Coordinate team response to ESG controversy
        """
        # ESG team assessment
        esg_assessment = self.esg_team.assess(linked_controversy)
        
        # Risk team assessment
        risk_assessment = self.risk_team.assess(linked_controversy)
        
        # Investment team assessment
        investment_assessment = self.investment_team.assess(linked_controversy)
        
        # Integrated decision
        decision = integrate_assessments(
            esg_assessment, risk_assessment, investment_assessment
        )
        
        # Coordinate action
        action_plan = create_action_plan(decision, linked_controversy)
        
        return {
            'assessments': {
                'esg': esg_assessment,
                'risk': risk_assessment,
                'investment': investment_assessment
            },
            'decision': decision,
            'action_plan': action_plan
        }
```

---

## Exercise 3: Create a Response Playbook for a Hypothetical ESG Controversy

### Objective
Develop a comprehensive response playbook for handling an ESG controversy.

### Requirements

1. **Playbook Design**
   - Risk assessment framework
   - Response workflows
   - Team coordination
   - Decision criteria

2. **Implementation**
   - Workflow steps
   - Escalation triggers
   - Communication templates
   - Monitoring procedures

3. **Deliverables**
   - Playbook document
   - Workflow diagrams
   - Templates
   - Implementation guide

### Evaluation Criteria
- Playbook completeness (35%)
- Workflow design (30%)
- Team coordination (25%)
- Implementation guide (10%)

---

## Key Takeaways

- **Linking Controversies**: Linking controversies to holdings enables targeted portfolio responses
- **Distinguishing Short-Term**: Distinguishing short-term from structural risks guides appropriate responses
- **Engagement, Escalation,**: Engagement, escalation, and divestment workflows provide structured response options
- **Team Coordination**: Team coordination ensures comprehensive assessment and aligned action

---

**End of Module 3**
