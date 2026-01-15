---
title: "Module 4: The European ESG Template (EET): Anatomy of a Data Beast"
description: "Understand how 600+ ESG data points power automated matching"
module: "4"
order: 4
---

# Module 4: The European ESG Template (EET): Anatomy of a Data Beast

**Duration:** Week 4  
**Learning Objectives:**
- Understand the structure of the EET and key data sections
- Distinguish mandatory vs. optional ESG fields
- Learn about Principal Adverse Impacts (PAIs) and double materiality
- Handle data quality risks and missing-field logic

---

## Lesson 4.1: Structure of the EET and Key Data Sections

### EET Overview

**Purpose**
- Standardized ESG data format
- Enables automated ESG matching
- Regulatory compliance (SFDR)
- Cross-border comparability

**Scope**
- 600+ data points
- Comprehensive ESG coverage
- Product-level and entity-level data
- Historical and forward-looking data

### Key Data Sections

**Section 1: Basic Information**
- Product identification
- Classification (Article 6/8/9)
- Investment strategy
- Benchmark information

**Section 2: Principal Adverse Impacts (PAIs)**
- 18 mandatory PAIs
- Additional optional PAIs
- Impact metrics
- Historical trends

**Section 3: Sustainable Investment Objectives**
- Environmental objectives
- Social objectives
- Taxonomy alignment
- Impact measurement

**Section 4: Governance**
- Corporate governance practices
- Remuneration policies
- Shareholder engagement
- Voting policies

**Section 5: Additional Information**
- Methodology notes
- Data sources
- Assurance information
- Updates and revisions

---

## Lesson 4.2: Mandatory vs. Optional ESG Fields

### Mandatory Fields

**Regulatory Requirements**
- Article 8/9 classification
- Principal Adverse Impacts (PAIs)
- Taxonomy alignment
- Sustainable investment objectives

**Critical for Matching**
- Product classification
- ESG objectives
- Exclusion criteria
- Impact metrics

**Data Quality**
- Must be complete
- Must be accurate
- Must be current
- Must be verified

### Optional Fields

**Enhancement Fields**
- Additional PAIs
- Detailed methodology
- Historical data
- Forward-looking indicators

**Matching Enhancement**
- Provide additional context
- Enable nuanced matching
- Support preference weighting
- Improve match quality

**Handling Missing Data**
- Graceful degradation
- Default values
- Confidence scoring
- Data quality flags

---

## Lesson 4.3: Principal Adverse Impacts (PAIs) and Double Materiality

### Principal Adverse Impacts (PAIs)

**Definition**
- Negative impacts on sustainability factors
- Must be considered and disclosed
- 18 mandatory PAIs
- Additional optional PAIs

**Mandatory PAIs Categories**

**Climate and Environment**
- GHG emissions
- Carbon footprint
- Biodiversity impact
- Water usage
- Waste generation

**Social and Employee Matters**
- Gender pay gap
- Board gender diversity
- Violations of UN principles
- Controversial weapons
- Tax transparency

**Governance**
- Board independence
- Executive compensation
- Anti-corruption measures
- Tax strategy

### Double Materiality

**Concept**
- Financial materiality: Impact on company value
- Impact materiality: Impact on society/environment
- Both perspectives required
- Comprehensive risk assessment

**Application**
- Risk assessment from both angles
- Impact measurement
- Stakeholder consideration
- Long-term value creation

---

## Lesson 4.4: Data Quality Risks and Missing-Field Logic

### Data Quality Risks

**Common Issues**
- Missing data fields
- Inconsistent data formats
- Outdated information
- Incomplete disclosures
- Data errors

**Impact on Matching**
- Reduced match accuracy
- False positives/negatives
- Incomplete preference matching
- Regulatory compliance risks

**Mitigation Strategies**
- Data validation rules
- Quality scoring
- Vendor reconciliation
- Regular updates
- Error handling

### Missing-Field Logic

**Handling Strategies**

**Conservative Approach**
- Exclude products with missing critical data
- Require complete data for matching
- High data quality threshold
- Reduces false matches

**Graceful Degradation**
- Use available data
- Apply confidence scores
- Flag incomplete matches
- Allow with warnings

**Default Values**
- Use industry averages
- Apply conservative defaults
- Clearly document assumptions
- Regular validation

**Confidence Scoring**
```python
def calculate_match_confidence(product_data, client_preferences):
    """
    Calculate confidence score based on data completeness
    """
    required_fields = get_required_fields(client_preferences)
    available_fields = get_available_fields(product_data)
    
    completeness = len(available_fields) / len(required_fields)
    confidence = completeness * data_quality_score
    
    return confidence
```

---

## Exercise 4: Identify Which EET Fields are Critical for Automated ESG Matching

### Objective
Analyze the EET structure and identify which fields are essential for automated ESG preference matching.

### Requirements

1. **EET Field Analysis**
   - Review EET structure
   - Categorize fields by importance
   - Identify critical fields
   - Document field dependencies

2. **Matching Logic Mapping**
   - Map fields to matching logic
   - Identify hard exclusion fields
   - Identify preference matching fields
   - Identify scoring fields

3. **Data Quality Requirements**
   - Define completeness requirements
   - Set quality thresholds
   - Design missing data handling
   - Create validation rules

4. **Deliverables**
   - Critical fields matrix
   - Matching logic documentation
   - Data quality requirements
   - Missing data handling strategy

### Field Categorization

**Tier 1: Critical (Must Have)**
- Product classification
- Hard exclusion indicators
- Core ESG objectives
- Principal adverse impacts

**Tier 2: Important (Should Have)**
- Detailed impact metrics
- Taxonomy alignment
- Governance practices
- Historical trends

**Tier 3: Optional (Nice to Have)**
- Methodology details
- Forward-looking indicators
- Additional PAIs
- Assurance information

### Evaluation Criteria
- Field identification accuracy (35%)
- Matching logic mapping (30%)
- Data quality strategy (25%)
- Documentation quality (10%)

---

## Key Takeaways

- The EET contains 600+ data points organized into logical sections
- Mandatory fields are critical for regulatory compliance and matching
- PAIs and double materiality provide comprehensive impact assessment
- Data quality risks require robust handling strategies
- Missing-field logic must balance matching quality with data availability

---

## Additional Resources

### Reading
- EET documentation and specifications
- SFDR regulation guidelines
- PAI calculation methodologies
- Data quality best practices

### Tools
- EET data parsers
- Data validation frameworks
- Quality scoring tools
- Matching algorithm templates

### Next Steps
- Review Exercise 4 requirements
- Study EET structure in detail
- Prepare field analysis tools
- Proceed to Module 5: Article 8 & Article 9 Classification

---

**End of Module 4**
