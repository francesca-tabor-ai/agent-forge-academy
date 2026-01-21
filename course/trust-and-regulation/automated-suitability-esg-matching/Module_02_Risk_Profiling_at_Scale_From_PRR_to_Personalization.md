---
title: "Module 2: Risk Profiling at Scale: From PRR to Personalization"
description: "Learn how automated engines match Product Risk Ratings (PRR) to millions of client profiles"
module: "2"
order: 2
---

# Module 2: Risk Profiling at Scale: From PRR to Personalization

**Duration:** Week 2  
**Learning Objectives:**
- **risk capacity vs. risk tolerance vs. risk willingness Understanding**: Understand risk capacity vs. risk tolerance vs. risk willingness
- **how to translate client answers into machine-readable risk profiles Understanding**: Learn how to translate client answers into machine-readable risk profiles
- **mapping PRR bands to client risk buckets Understanding**: Master mapping PRR bands to client risk buckets
- **Handle Edge**: Handle edge cases: portfolio diversification and mixed-risk products

---

## Lesson 2.1: Risk Capacity vs. Risk Tolerance vs. Risk Willingness

### Risk Capacity

**Definition**
- Objective ability to bear financial loss
- Based on financial situation and circumstances
- Time horizon considerations
- Income and asset stability

**Assessment Factors**
- Current financial situation
- Income stability
- Existing assets and liabilities
- Time horizon for investments
- Financial obligations and goals

**Calculation Approach**
- Quantitative analysis
- Financial modeling
- Scenario testing
- Objective metrics

### Risk Tolerance

**Definition**
- Subjective comfort level with risk
- Psychological attitude toward risk
- Based on client's stated preferences
- Questionnaire-based assessment

**Assessment Factors**
- Client's stated risk preferences
- Past investment experience
- Reaction to market volatility
- Investment knowledge
- Comfort with uncertainty

**Measurement Approach**
- Risk tolerance questionnaires
- Psychometric scales
- Behavioral indicators
- Self-reported preferences

### Risk Willingness

**Definition**
- Client's desire to take risk
- Aspirational risk-taking
- May differ from capacity and tolerance
- Influenced by goals and objectives

**Assessment Factors**
- Investment objectives
- Return expectations
- Growth aspirations
- Goal importance
- Trade-off preferences

**Considerations**
- May exceed capacity or tolerance
- Requires advisor judgment
- Needs to be reconciled with capacity
- Important for goal achievement

### Integration Framework

**Balanced Risk Profile**
- Minimum of capacity, tolerance, and willingness
- Conservative approach
- Protects client interests
- Regulatory best practice

**Reconciliation Logic**
```
Final Risk Profile = min(Risk Capacity, Risk Tolerance, Risk Willingness)
```

---

## Lesson 2.2: Translating Client Answers into Machine-Readable Risk Profiles

### Questionnaire Design

**Question Types**
- Multiple choice questions
- Likert scale questions
- Scenario-based questions
- Behavioral questions

**Risk Dimensions**
- Investment knowledge
- Investment experience
- Time horizon
- Financial situation
- Risk attitude
- Return expectations

### Scoring Algorithms

**Weighted Scoring**
- Different questions have different weights
- Critical questions weighted higher
- Validation questions for consistency
- Total score calculation

**Risk Bucket Classification**
- Score ranges map to risk levels
- Typically 5-7 risk levels
- Conservative, Moderate, Balanced, Growth, Aggressive
- Clear boundaries and definitions

### Machine-Readable Format

**Structured Data**
```json
{
  "client_id": "12345",
  "risk_profile": {
    "capacity": 4,
    "tolerance": 5,
    "willingness": 4,
    "final_risk_level": 4,
    "risk_label": "Balanced",
    "score": 72,
    "confidence": 0.85
  },
  "constraints": {
    "min_risk_level": 3,
    "max_risk_level": 5,
    "exclusions": ["high_volatility"]
  }
}
```

**Risk Level Mapping**
- 1: Very Conservative
- 2: Conservative
- 3: Moderate
- 4: Balanced
- 5: Growth
- 6: Aggressive
- 7: Very Aggressive

---

## Lesson 2.3: Mapping PRR Bands to Client Risk Buckets

### Product Risk Ratings (PRR)

**PRR Structure**
- Standardized risk ratings for financial products
- Typically 1-7 scale
- Based on product characteristics
- Regulatory requirements

**PRR Factors**
- Volatility
- Credit risk
- Liquidity risk
- Complexity
- Leverage
- Underlying assets

### Matching Logic

**Direct Matching**
- Client risk level = Product PRR
- Simple 1:1 matching
- Suitable for straightforward cases
- Limited flexibility

**Range Matching**
- Client risk level ± 1 PRR level
- Allows some flexibility
- Common in practice
- Requires justification

**Conservative Matching**
- Product PRR ≤ Client risk level
- Protects client
- Regulatory preference
- May limit opportunities

### Edge Cases

**Portfolio Diversification**
- Mixed-risk portfolios
- Lower-risk products for stability
- Higher-risk products for growth
- Weighted average risk

**Mixed-Risk Products**
- Products with multiple risk components
- Structured products
- Multi-asset funds
- Requires detailed analysis

**Client Constraints**
- Hard exclusions
- Soft preferences
- Sector restrictions
- Geographic constraints

---

## Exercise 2: Design a Simplified PRR-to-Client Risk Matching Logic

### Objective
Create a PRR-to-client risk matching algorithm that handles standard cases and edge cases.

### Requirements

1. **Core Matching Logic**
   - Implement direct matching
   - Add range matching option
   - Include conservative matching
   - Handle risk level boundaries

2. **Edge Case Handling**
   - Portfolio diversification logic
   - Mixed-risk product handling
   - Client constraint application
   - Exception handling

3. **Implementation**
   - Python code with clear logic
   - Unit tests for different scenarios
   - Documentation of matching rules
   - Example outputs

4. **Deliverables**
   - Matching algorithm code
   - Test cases and results
   - Documentation
   - Example matching scenarios

### Sample Code Structure

```python
class RiskMatcher:
    def __init__(self, matching_mode='conservative'):
        self.matching_mode = matching_mode
    
    def match_product_to_client(self, client_risk_profile, product_prr):
        """
        Match product PRR to client risk profile
        
        Args:
            client_risk_profile: Client risk level (1-7)
            product_prr: Product risk rating (1-7)
        
        Returns:
            dict: Matching result with suitability and rationale
        """
        # Implementation here
        pass
    
    def handle_portfolio_diversification(self, portfolio, client_risk):
        """
        Handle mixed-risk portfolios
        """
        # Implementation here
        pass
```

### Test Cases
- Standard matching scenarios
- Edge cases (boundary conditions)
- Portfolio diversification
- Constraint handling

### Evaluation Criteria
- Algorithm correctness (35%)
- Edge case handling (25%)
- Code quality (20%)
- Documentation (20%)

---

## Key Takeaways

- **Risk Capacity,**: Risk capacity, tolerance, and willingness are distinct concepts that must be reconciled
- **Client Questionnaire**: Client questionnaire responses can be systematically converted into machine-readable risk profiles
- **Prr-To-Client Matching**: PRR-to-client matching requires clear logic and handles various edge cases
- **Portfolio Diversification**: Portfolio diversification and mixed-risk products require special consideration
- **Automated Risk**: Automated risk matching enables scalability while maintaining regulatory compliance

---

## Additional Resources

### Reading
- Risk profiling best practices
- PRR calculation methodologies
- Portfolio risk assessment frameworks

### Tools
- Risk profiling questionnaires
- PRR calculation tools
- Matching algorithm templates

### Next Steps
- Review Exercise 2 requirements
- Study PRR calculation methods
- Prepare development environment
- Proceed to Module 3: ESG Preferences

---

**End of Module 2**
