---
title: "Module 3: Cross-Document Consistency Engine"
description: "Use AI to ensure all disclosures tell the same story"
module: "3"
order: 3
---

# Module 3: Cross-Document Consistency Engine

**Duration:** Week 3  
**Learning Objectives:**
- Implement NLP for semantic comparison across documents
- Detect contradictions, omissions, and overstatements
- Align qualitative claims with quantitative data
- Implement confidence scoring and materiality thresholds

---

## Lesson 3.1: NLP for Semantic Comparison Across Documents

### Semantic Comparison

**Comparison Framework**
```python
class CrossDocumentConsistencyEngine:
    """
    AI engine for cross-document consistency checking
    """
    def __init__(self):
        self.nlp_model = load_semantic_nlp_model()
        self.comparison_engine = SemanticComparisonEngine()
    
    def compare_documents(self, documents):
        """
        Compare documents for semantic consistency
        """
        # Extract ESG claims from each document
        claims = {}
        for doc in documents:
            claims[doc.id] = self.extract_esg_claims(doc)
        
        # Semantic comparison
        comparisons = []
        for doc1_id, claims1 in claims.items():
            for doc2_id, claims2 in claims.items():
                if doc1_id != doc2_id:
                    comparison = self.comparison_engine.compare_semantically(
                        claims1, claims2
                    )
                    comparisons.append({
                        'doc1': doc1_id,
                        'doc2': doc2_id,
                        'similarity': comparison.similarity,
                        'inconsistencies': comparison.inconsistencies
                    })
        
        return comparisons
    
    def extract_esg_claims(self, document):
        """
        Extract ESG claims from document
        """
        # Use NLP to identify ESG claims
        claims = self.nlp_model.extract_claims(document.content)
        
        # Categorize claims
        categorized_claims = {
            'environmental': [c for c in claims if c.category == 'environmental'],
            'social': [c for c in claims if c.category == 'social'],
            'governance': [c for c in claims if c.category == 'governance']
        }
        
        return categorized_claims
```

### Semantic Similarity

**Similarity Metrics**
- Cosine similarity
- Semantic embeddings
- Context-aware comparison
- Domain-specific models

---

## Lesson 3.2: Detecting Contradictions, Omissions, and Overstatements

### Contradiction Detection

**Detection Methods**
```python
def detect_contradictions(claim1, claim2):
    """
    Detect contradictions between claims
    """
    # Semantic contradiction detection
    contradiction_score = calculate_contradiction_score(claim1, claim2)
    
    # Factual contradiction detection
    factual_contradiction = detect_factual_contradiction(claim1, claim2)
    
    # Quantitative contradiction detection
    quantitative_contradiction = detect_quantitative_contradiction(claim1, claim2)
    
    return {
        'has_contradiction': contradiction_score > CONTRADICTION_THRESHOLD or 
                           factual_contradiction or quantitative_contradiction,
        'contradiction_score': contradiction_score,
        'contradiction_type': identify_contradiction_type(claim1, claim2),
        'details': {
            'semantic': contradiction_score,
            'factual': factual_contradiction,
            'quantitative': quantitative_contradiction
        }
    }
```

### Omission Detection

**Omission Types**
- Missing required disclosures
- Incomplete information
- Partial statements
- Absent evidence

### Overstatement Detection

**Overstatement Indicators**
- Exaggerated claims
- Unsupported statements
- Marketing language
- Unsubstantiated objectives

---

## Lesson 3.3: Aligning Qualitative Claims with Quantitative Data

### Alignment Framework

**Qualitative-Quantitative Alignment**
```python
def align_qualitative_quantitative(qualitative_claim, quantitative_data):
    """
    Align qualitative claims with quantitative data
    """
    # Extract metrics from qualitative claim
    claimed_metrics = extract_metrics_from_claim(qualitative_claim)
    
    # Find corresponding quantitative data
    quantitative_metrics = find_corresponding_data(claimed_metrics, quantitative_data)
    
    # Validate alignment
    alignment = validate_alignment(claimed_metrics, quantitative_metrics)
    
    return {
        'is_aligned': alignment.is_valid,
        'alignment_score': alignment.score,
        'discrepancies': alignment.discrepancies,
        'recommendations': alignment.recommendations
    }
```

### Validation Rules

**Validation Criteria**
- Numerical consistency
- Trend alignment
- Evidence support
- Objective measurement

---

## Lesson 3.4: Confidence Scoring and Materiality Thresholds

### Confidence Scoring

**Confidence Factors**
- Source reliability
- Evidence strength
- Consistency level
- Validation results

**Implementation**
```python
def calculate_consistency_confidence(comparison_result):
    """
    Calculate confidence in consistency assessment
    """
    confidence_factors = {
        'similarity_score': comparison_result.similarity,
        'evidence_strength': assess_evidence_strength(comparison_result),
        'source_reliability': assess_source_reliability(comparison_result),
        'validation_results': comparison_result.validation_results
    }
    
    confidence = (
        confidence_factors['similarity_score'] * 0.4 +
        confidence_factors['evidence_strength'] * 0.3 +
        confidence_factors['source_reliability'] * 0.2 +
        confidence_factors['validation_results'] * 0.1
    )
    
    return confidence
```

### Materiality Thresholds

**Materiality Framework**
- High materiality: Critical inconsistencies
- Medium materiality: Significant inconsistencies
- Low materiality: Minor inconsistencies
- Immaterial: Acceptable variations

---

## Exercise 3: Design an AI Check for Consistency Between EET Fields and a Marketing Fact Sheet

### Objective
Design an AI system that checks consistency between structured EET data and narrative marketing fact sheet content.

### Requirements

1. **Consistency Check Design**
   - Comparison methodology
   - Claim extraction
   - Alignment validation
   - Inconsistency detection

2. **Implementation Framework**
   - NLP models
   - Comparison algorithms
   - Validation rules
   - Reporting mechanism

3. **Deliverables**
   - System design document
   - Implementation code
   - Test scenarios
   - Documentation

### Evaluation Criteria
- Design completeness (35%)
- Methodology quality (30%)
- Implementation (25%)
- Documentation (10%)

---

## Key Takeaways

- NLP enables semantic comparison across documents for consistency checking
- Detecting contradictions, omissions, and overstatements prevents greenwashing
- Aligning qualitative claims with quantitative data ensures accuracy
- Confidence scoring and materiality thresholds prioritize review efforts

---

**End of Module 3**
