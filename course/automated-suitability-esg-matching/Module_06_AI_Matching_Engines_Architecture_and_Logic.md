---
title: "Module 6: AI Matching Engines: Architecture & Logic"
description: "Learn how AI reduces cognitive load without replacing human judgment"
module: "6"
order: 6
---

# Module 6: AI Matching Engines: Architecture & Logic

**Duration:** Week 6  
**Learning Objectives:**
- Understand rules engines vs. machine learning models
- Design matching logic: risk × ESG × client constraints
- Implement explainability and audit trails
- Design human-in-the-loop governance models

---

## Lesson 6.1: Rules Engines vs. Machine Learning Models

### Rules Engines

**Characteristics**
- Explicit if-then logic
- Deterministic outcomes
- Transparent decisions
- Easy to audit

**Use Cases**
- Hard exclusion enforcement
- Regulatory compliance checks
- Clear-cut matching scenarios
- Binary decisions

**Advantages**
- Interpretable
- Regulatory defensible
- Consistent
- Fast execution

**Limitations**
- Rigid logic
- Limited learning
- Manual maintenance
- May miss nuances

### Machine Learning Models

**Characteristics**
- Pattern recognition
- Probabilistic outputs
- Learning from data
- Adaptive behavior

**Use Cases**
- Preference matching
- Risk profile interpretation
- Complex pattern recognition
- Ranking and scoring

**Advantages**
- Handles complexity
- Learns from data
- Identifies patterns
- Adapts to changes

**Limitations**
- Less interpretable
- Requires training data
- Model maintenance
- Validation complexity

### Hybrid Architecture

**Best Practice**
- Rules for compliance
- ML for matching
- Human for exceptions
- Continuous improvement

**Architecture**
```
Client Input
  ↓
Rules Engine (Hard Exclusions)
  ↓
ML Model (Preference Matching)
  ↓
Scoring & Ranking
  ↓
Human Review (Edge Cases)
  ↓
Final Recommendations
```

---

## Lesson 6.2: Matching Logic: Risk × ESG × Client Constraints

### Multi-Dimensional Matching

**Risk Dimension**
- Risk profile matching
- PRR alignment
- Portfolio diversification
- Risk capacity considerations

**ESG Dimension**
- Preference matching
- Exclusion compliance
- Impact alignment
- Taxonomy considerations

**Client Constraints**
- Hard exclusions
- Soft preferences
- Geographic restrictions
- Sector limitations

### Matching Algorithm

**Scoring Framework**
```python
def calculate_match_score(product, client_profile):
    """
    Calculate multi-dimensional match score
    """
    risk_score = match_risk(product.prr, client_profile.risk_level)
    esg_score = match_esg(product.esg_data, client_profile.esg_preferences)
    constraint_score = check_constraints(product, client_profile.constraints)
    
    # Weighted combination
    total_score = (
        0.4 * risk_score +
        0.4 * esg_score +
        0.2 * constraint_score
    )
    
    return total_score, {
        'risk': risk_score,
        'esg': esg_score,
        'constraints': constraint_score
    }
```

**Matching Steps**
1. Apply hard exclusions
2. Calculate risk match score
3. Calculate ESG match score
4. Apply client constraints
5. Combine scores
6. Rank products
7. Generate recommendations

---

## Lesson 6.3: Explainability and Audit Trails

### Explainability Requirements

**Regulatory Need**
- Client explanations required
- Regulatory defensibility
- Audit trail maintenance
- Transparency obligations

**Explainability Methods**
- Feature importance
- Decision path explanation
- Score breakdown
- Alternative recommendations

**Implementation**
```python
def explain_match(product, client_profile, match_score):
    """
    Generate explanation for match
    """
    explanation = {
        'product_name': product.name,
        'match_score': match_score.total,
        'risk_match': {
            'client_risk': client_profile.risk_level,
            'product_prr': product.prr,
            'alignment': 'Good' if abs(client_profile.risk_level - product.prr) <= 1 else 'Acceptable'
        },
        'esg_match': {
            'preferences_met': count_matched_preferences(product, client_profile),
            'exclusions_compliant': check_exclusions(product, client_profile)
        },
        'rationale': generate_natural_language_explanation(product, client_profile)
    }
    
    return explanation
```

### Audit Trails

**Required Information**
- Client profile snapshot
- Product data used
- Matching logic applied
- Scores and rankings
- Human overrides
- Timestamps

**Storage**
- Immutable records
- Complete history
- Searchable format
- Regulatory reporting

---

## Lesson 6.4: Human-in-the-Loop Governance Models

### Governance Framework

**Automated Decisions**
- High confidence matches
- Standard scenarios
- Clear-cut cases
- Routine recommendations

**Human Review**
- Low confidence matches
- Edge cases
- Complex scenarios
- Client requests

**Escalation Logic**
```python
def determine_review_requirement(match_result):
    """
    Determine if human review is needed
    """
    if match_result.confidence < 0.7:
        return 'REQUIRED'
    elif match_result.has_override_flag:
        return 'REQUIRED'
    elif match_result.edge_case:
        return 'RECOMMENDED'
    else:
        return 'NOT_REQUIRED'
```

### Human Oversight

**Review Triggers**
- Low confidence scores
- Override requests
- Complex cases
- Regulatory flags

**Review Process**
- Advisor review
- Compliance check
- Documentation
- Approval workflow

---

## Exercise 6: Sketch a High-Level System Architecture for an ESG Suitability Matcher

### Objective
Design the system architecture for a complete ESG suitability matching engine.

### Requirements

1. **System Components**
   - Data ingestion layer
   - Processing engine
   - Matching logic
   - Recommendation engine
   - Explanation generator
   - Audit system

2. **Architecture Design**
   - Component diagram
   - Data flow
   - API design
   - Database schema
   - Integration points

3. **Technology Stack**
   - Technology selection
   - Infrastructure design
   - Scalability considerations
   - Performance requirements

4. **Deliverables**
   - Architecture diagram
   - Component specifications
   - Technology stack documentation
   - Implementation roadmap

### Architecture Components

**Data Layer**
- Client profile database
- Product catalog
- ESG data store
- Audit trail database

**Processing Layer**
- Rules engine
- ML matching models
- Scoring algorithms
- Ranking system

**Application Layer**
- Matching API
- Explanation service
- Recommendation engine
- Review workflow

**Presentation Layer**
- Client portal
- Advisor dashboard
- Reporting interface
- Admin console

### Evaluation Criteria
- Architecture completeness (35%)
- Component design (25%)
- Technology selection (20%)
- Scalability considerations (20%)

---

## Key Takeaways

- Rules engines and ML models serve complementary roles in matching systems
- Multi-dimensional matching requires careful score combination and weighting
- Explainability and audit trails are essential for regulatory compliance
- Human-in-the-loop governance ensures quality while maintaining efficiency
- System architecture must balance automation with human oversight

---

## Additional Resources

### Reading
- Matching algorithm best practices
- Explainable AI frameworks
- System architecture patterns
- Governance models

### Tools
- Architecture diagramming tools
- Matching algorithm templates
- Explanation generation frameworks
- Audit trail systems

### Next Steps
- Review Exercise 6 requirements
- Study system architecture patterns
- Prepare design tools
- Proceed to Module 7: Explainability and Trust

---

**End of Module 6**
