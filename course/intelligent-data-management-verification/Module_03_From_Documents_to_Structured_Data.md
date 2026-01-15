---
title: "Module 3: From Documents to Structured Data"
description: "Turn extracted text into usable, auditable data fields"
module: "3"
order: 3
---

# Module 3: From Documents to Structured Data

**Duration:** Week 3  
**Learning Objectives:**
- Implement confidence scoring and ambiguity handling
- Map extracted values to internal data models
- Provide source attribution ("show me where this came from")
- Implement version control and document change detection

---

## Lesson 3.1: Confidence Scoring and Ambiguity Handling

### Confidence Scoring

**Confidence Factors**
- Extraction method reliability
- Source document quality
- Pattern match strength
- Contextual validation

**Implementation**
```python
def calculate_extraction_confidence(extracted_value, source_context):
    """
    Calculate confidence score for extracted value
    """
    confidence_factors = {
        'extraction_method': assess_method_reliability(source_context.method),
        'source_quality': assess_source_quality(source_context.document),
        'pattern_match': assess_pattern_match(extracted_value, source_context.pattern),
        'contextual_validation': validate_context(extracted_value, source_context.context),
        'multiple_sources': check_multiple_sources(extracted_value, source_context)
    }
    
    # Weighted confidence calculation
    confidence_score = (
        confidence_factors['extraction_method'] * 0.3 +
        confidence_factors['source_quality'] * 0.2 +
        confidence_factors['pattern_match'] * 0.2 +
        confidence_factors['contextual_validation'] * 0.2 +
        confidence_factors['multiple_sources'] * 0.1
    )
    
    return {
        'confidence_score': confidence_score,
        'factors': confidence_factors,
        'recommendation': get_recommendation(confidence_score)
    }
```

### Ambiguity Handling

**Ambiguity Types**
- Multiple possible values
- Unclear context
- Conditional statements
- Conflicting information

**Handling Strategies**
- Flag for review
- Use highest confidence value
- Request clarification
- Escalate to human

---

## Lesson 3.2: Mapping Extracted Values to Internal Data Models

### Data Model Mapping

**Mapping Framework**
```python
class DataModelMapper:
    """
    Map extracted values to internal data models
    """
    def __init__(self, data_model):
        self.data_model = data_model
        self.mapping_rules = load_mapping_rules()
    
    def map_extracted_data(self, extracted_data):
        """
        Map extracted data to internal model
        """
        mapped_data = {}
        
        for field in self.data_model.fields:
            # Find matching extracted value
            extracted_value = self.find_matching_value(field, extracted_data)
            
            if extracted_value:
                # Transform value
                transformed_value = self.transform_value(field, extracted_value)
                
                # Validate transformation
                if self.validate_value(field, transformed_value):
                    mapped_data[field.name] = {
                        'value': transformed_value,
                        'source': extracted_value.source,
                        'confidence': extracted_value.confidence
                    }
        
        return mapped_data
```

### Transformation Rules

**Value Transformations**
- Unit conversions
- Format standardization
- Data type conversions
- Normalization

---

## Lesson 3.3: Source Attribution

### Attribution Framework

**Attribution Components**
- Source document
- Page number
- Section reference
- Extraction timestamp
- Extraction method

**Implementation**
```python
def create_source_attribution(extracted_value, document):
    """
    Create source attribution for extracted value
    """
    attribution = {
        'document_id': document.id,
        'document_name': document.name,
        'document_version': document.version,
        'page_number': extracted_value.page_number,
        'section': extracted_value.section,
        'paragraph': extracted_value.paragraph,
        'extraction_method': extracted_value.method,
        'extraction_timestamp': extracted_value.timestamp,
        'confidence': extracted_value.confidence,
        'raw_text': extracted_value.raw_text,
        'context': extracted_value.context
    }
    
    return attribution
```

### "Show Me Where This Came From"

**User Interface**
- Clickable source links
- Document viewer integration
- Highlighted source text
- Context display

---

## Lesson 3.4: Version Control and Document Change Detection

### Version Control

**Version Management**
```python
class DocumentVersionControl:
    """
    Version control for documents and extracted data
    """
    def __init__(self):
        self.version_store = VersionStore()
        self.change_detector = ChangeDetector()
    
    def create_version(self, document, extracted_data):
        """
        Create new version of document and data
        """
        version = {
            'version_id': generate_version_id(),
            'document': document,
            'extracted_data': extracted_data,
            'timestamp': datetime.now(),
            'checksum': calculate_checksum(document)
        }
        
        self.version_store.store(version)
        return version
    
    def detect_changes(self, new_document, previous_version):
        """
        Detect changes between document versions
        """
        changes = self.change_detector.compare(
            new_document,
            previous_version.document
        )
        
        return {
            'has_changes': len(changes) > 0,
            'changes': changes,
            'impacted_fields': identify_impacted_fields(changes)
        }
```

### Change Detection

**Change Types**
- Content changes
- Structural changes
- Format changes
- Metadata changes

**Impact Analysis**
- Affected data fields
- Validation requirements
- Review needs
- Update priorities

---

## Exercise 3: Design a Traceability Model Linking Data Fields Back to Source Documents

### Objective
Create a comprehensive traceability model that links every data field back to its source document with full attribution.

### Requirements

1. **Traceability Framework**
   - Data field identification
   - Source document mapping
   - Attribution structure
   - Version tracking

2. **Implementation Design**
   - Data model
   - Storage structure
   - Query capabilities
   - User interface

3. **Deliverables**
   - Traceability model design
   - Data schema
   - Implementation code
   - Documentation

### Evaluation Criteria
- Model completeness (35%)
- Attribution quality (30%)
- Implementation design (25%)
- Documentation (10%)

---

## Key Takeaways

- Confidence scoring enables quality assessment and review prioritization
- Mapping to internal data models ensures consistency and usability
- Source attribution provides transparency and auditability
- Version control and change detection maintain data integrity over time

---

**End of Module 3**
