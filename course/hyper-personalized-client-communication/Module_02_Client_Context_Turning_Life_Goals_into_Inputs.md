---
title: "Module 2: Client Context: Turning Life Goals into Inputs"
description: "Translate qualitative client goals into structured data for AI systems"
module: "2"
order: 2
---

# Module 2: Client Context: Turning Life Goals into Inputs

**Duration:** Week 2  
**Learning Objectives:**
- Understand life-stage goals (retirement, education, wealth transfer)
- Learn time horizons, liquidity needs, and emotional risk
- Distinguish behavioral signals vs. declared preferences
- Consider data privacy and consent requirements
- Build client context profiles for AI-driven communication

---

## Lesson 2.1: Life-Stage Goals

### Retirement Planning

**Key Characteristics**
- Long-term time horizon
- Income replacement focus
- Tax optimization
- Risk tolerance evolution

**Data Points**
- Current age and retirement age
- Desired retirement lifestyle
- Existing retirement savings
- Expected retirement income needs

### Education Funding

**Key Characteristics**
- Medium-term time horizon
- Specific target amounts
- Predictable timing
- Lower risk tolerance

**Data Points**
- Number of children
- Ages of children
- Target education costs
- Time to enrollment

### Wealth Transfer

**Key Characteristics**
- Multi-generational planning
- Estate planning considerations
- Tax efficiency
- Legacy objectives

**Data Points**
- Beneficiaries and relationships
- Transfer timeline
- Tax considerations
- Legacy goals

### Other Life Goals

**Additional Goals**
- Home purchase
- Business investment
- Major purchases
- Charitable giving

---

## Lesson 2.2: Time Horizons, Liquidity Needs, and Emotional Risk

### Time Horizons

**Horizon Categories**
- Short-term (0-3 years)
- Medium-term (3-10 years)
- Long-term (10+ years)
- Multi-generational

**Impact on Communication**
- Short-term: Focus on stability and liquidity
- Medium-term: Balance growth and stability
- Long-term: Emphasize growth potential
- Multi-generational: Legacy and transfer focus

### Liquidity Needs

**Liquidity Requirements**
- Emergency fund needs
- Planned expenses
- Income requirements
- Flexibility preferences

**Communication Implications**
- Highlight liquidity features
- Explain liquidity trade-offs
- Address access concerns
- Provide liquidity options

### Emotional Risk

**Emotional Factors**
- Market volatility tolerance
- Loss aversion
- Regret avoidance
- Peace of mind needs

**Assessment Methods**
- Behavioral questionnaires
- Historical behavior analysis
- Stress scenario responses
- Preference declarations

---

## Lesson 2.3: Behavioral Signals vs. Declared Preferences

### Declared Preferences

**What Clients Say**
- Stated risk tolerance
- Expressed goals
- Declared preferences
- Self-reported attitudes

**Characteristics**
- Explicit
- Self-reported
- May not reflect behavior
- Subject to bias

### Behavioral Signals

**What Clients Do**
- Actual investment behavior
- Transaction patterns
- Engagement levels
- Response to market events

**Characteristics**
- Implicit
- Observable
- More reliable indicators
- Revealed preferences

### Integration Approach

**Combining Both**
- Use declared preferences as baseline
- Adjust based on behavioral signals
- Identify discrepancies
- Refine understanding over time

**Implementation**
```python
def build_client_context(declared_preferences, behavioral_signals):
    """
    Build comprehensive client context
    """
    context = {
        'declared': declared_preferences,
        'behavioral': behavioral_signals,
        'integrated': integrate_preferences(declared_preferences, behavioral_signals),
        'confidence': calculate_confidence(declared_preferences, behavioral_signals)
    }
    
    return context
```

---

## Lesson 2.4: Data Privacy and Consent Considerations

### Privacy Requirements

**Regulatory Framework**
- GDPR (EU)
- CCPA (California)
- Other jurisdiction requirements
- Industry standards

**Key Principles**
- Consent for data use
- Purpose limitation
- Data minimization
- Right to access and deletion

### Consent Management

**Consent Types**
- Explicit consent for personalization
- Consent for AI processing
- Consent for data sharing
- Consent for profiling

**Implementation**
- Clear consent language
- Granular consent options
- Easy consent management
- Regular consent review

### Data Security

**Security Measures**
- Encryption
- Access controls
- Audit trails
- Data retention policies

---

## Exercise 2: Build a Client "Context Profile" Suitable for AI-Driven Communication

### Objective
Create a structured client context profile that captures all relevant information for AI-driven personalization.

### Requirements

1. **Profile Structure**
   - Life-stage goals
   - Time horizons
   - Risk profile
   - Liquidity needs
   - Behavioral signals
   - Communication preferences

2. **Data Format**
   - Structured data format (JSON)
   - Machine-readable
   - Extensible
   - Version-controlled

3. **Implementation**
   - Profile schema
   - Data collection framework
   - Update mechanisms
   - Privacy compliance

4. **Deliverables**
   - Context profile schema
   - Sample profiles
   - Data collection framework
   - Privacy compliance documentation

### Profile Schema

```json
{
  "client_id": "12345",
  "profile_version": "1.0",
  "life_stage_goals": {
    "retirement": {
      "target_age": 65,
      "target_amount": 2000000,
      "current_savings": 500000,
      "priority": "high"
    },
    "education": {
      "children": [
        {"age": 10, "target_cost": 50000, "years_to_enrollment": 8}
      ],
      "priority": "medium"
    }
  },
  "time_horizons": {
    "short_term": {"years": 3, "goals": ["emergency_fund"]},
    "medium_term": {"years": 10, "goals": ["education"]},
    "long_term": {"years": 30, "goals": ["retirement"]}
  },
  "risk_profile": {
    "declared_tolerance": 4,
    "behavioral_indicators": 3,
    "integrated_level": 3.5,
    "emotional_risk": "moderate"
  },
  "liquidity_needs": {
    "emergency_fund": 50000,
    "planned_expenses": [
      {"description": "home_renovation", "amount": 100000, "timeline": "2_years"}
    ]
  },
  "communication_preferences": {
    "tone": "professional_friendly",
    "format": "detailed_summary",
    "frequency": "monthly",
    "channels": ["email", "portal"]
  },
  "consent": {
    "personalization": true,
    "ai_processing": true,
    "data_sharing": false,
    "last_updated": "2025-01-15"
  }
}
```

### Evaluation Criteria
- Profile completeness (35%)
- Data structure quality (25%)
- Privacy compliance (25%)
- Practical utility (15%)

---

## Key Takeaways

- Life-stage goals provide structure for personalization
- Time horizons, liquidity needs, and emotional risk shape communication
- Behavioral signals complement declared preferences for better understanding
- Data privacy and consent are critical for compliant personalization
- Structured context profiles enable AI-driven personalization at scale

---

## Additional Resources

### Reading
- Client profiling best practices
- Behavioral finance research
- Privacy compliance guidelines
- Data structure design

### Tools
- Profile schema templates
- Data collection frameworks
- Privacy compliance checklists
- Behavioral analysis tools

### Next Steps
- Review Exercise 2 requirements
- Study client profiling methods
- Prepare profile schemas
- Proceed to Module 3: Content Generators

---

**End of Module 2**
