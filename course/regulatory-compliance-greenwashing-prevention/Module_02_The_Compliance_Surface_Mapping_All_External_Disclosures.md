---
title: "Module 2: The Compliance Surface: Mapping All External Disclosures"
description: "Define the full universe of documents that must be aligned"
module: "2"
order: 2
---

# Module 2: The Compliance Surface: Mapping All External Disclosures

**Duration:** Week 2  
**Learning Objectives:**
- **Identify All**: Identify all external disclosure documents (SFDR, EET, prospectuses, fact sheets, websites)
- **structured Analysis**: Distinguish structured vs. narrative ESG statements
- **jurisdiction-specific disclosure variations Understanding**: Understand jurisdiction-specific disclosure variations
- **Recognize Versioning**: Recognize versioning and publication timing risk

---

## Lesson 2.1: SFDR Disclosures, EET Files, Prospectuses, Fact Sheets, Websites

### Disclosure Types

**Regulatory Disclosures**
- SFDR (Sustainable Finance Disclosure Regulation) disclosures
- EET (European ESG Template) files
- Regulatory filings
- Compliance reports

**Fund Documents**
- Fund prospectuses
- Fact sheets
- Annual reports
- Marketing materials

**Digital Channels**
- Fund websites
- Online platforms
- Social media
- Client portals

### Document Inventory

**Mapping Framework**
```python
class DisclosureMapper:
    """
    Map all external disclosures for a fund
    """
    def __init__(self, fund_id):
        self.fund_id = fund_id
        self.disclosures = {}
    
    def map_all_disclosures(self):
        """
        Map all disclosure types for a fund
        """
        disclosures = {
            'regulatory': {
                'sfdr': self.get_sfdr_disclosures(),
                'eet': self.get_eet_files(),
                'regulatory_filings': self.get_regulatory_filings()
            },
            'fund_documents': {
                'prospectus': self.get_prospectus(),
                'fact_sheets': self.get_fact_sheets(),
                'annual_reports': self.get_annual_reports(),
                'marketing_materials': self.get_marketing_materials()
            },
            'digital': {
                'website': self.get_website_content(),
                'online_platforms': self.get_online_platforms(),
                'social_media': self.get_social_media()
            }
        }
        
        return disclosures
```

---

## Lesson 2.2: Structured vs. Narrative ESG Statements

### Structured ESG Statements

**Characteristics**
- Standardized formats
- Data fields
- Quantitative metrics
- Template-based

**Examples**
- EET fields
- SFDR templates
- Regulatory forms
- Database entries

### Narrative ESG Statements

**Characteristics**
- Free-form text
- Qualitative descriptions
- Marketing language
- Context-dependent

**Examples**
- Website content
- Marketing materials
- Fund descriptions
- Client communications

### Alignment Challenge

**Consistency Requirements**
- Align narratives with structured data
- Ensure quantitative support for qualitative claims
- Maintain consistency across formats
- Validate evidence base

---

## Lesson 2.3: Jurisdiction-Specific Disclosure Variations

### Jurisdictional Differences

**Regulatory Variations**
- EU: SFDR, EET requirements
- US: SEC ESG disclosure rules
- UK: FCA sustainability requirements
- Other jurisdictions: Local requirements

**Implementation Framework**
```python
class JurisdictionAwareDisclosure:
    """
    Handle jurisdiction-specific disclosure requirements
    """
    def __init__(self, fund_jurisdictions):
        self.jurisdictions = fund_jurisdictions
        self.regulatory_rules = load_regulatory_rules(self.jurisdictions)
    
    def get_required_disclosures(self, fund):
        """
        Get required disclosures for fund based on jurisdictions
        """
        required_disclosures = {}
        
        for jurisdiction in self.jurisdictions:
            rules = self.regulatory_rules[jurisdiction]
            required_disclosures[jurisdiction] = {
                'mandatory': rules.get_mandatory_disclosures(fund),
                'conditional': rules.get_conditional_disclosures(fund),
                'format': rules.get_format_requirements(fund)
            }
        
        return required_disclosures
```

---

## Lesson 2.4: Versioning and Publication Timing Risk

### Version Control

**Versioning Challenges**
- Multiple document versions
- Concurrent updates
- Version synchronization
- Historical tracking

**Version Management**
```python
class DisclosureVersionControl:
    """
    Manage versions and timing of disclosures
    """
    def __init__(self):
        self.version_store = VersionStore()
        self.timing_validator = TimingValidator()
    
    def track_versions(self, disclosure):
        """
        Track versions of disclosure documents
        """
        version = {
            'document_id': disclosure.id,
            'version': disclosure.version,
            'publication_date': disclosure.publication_date,
            'effective_date': disclosure.effective_date,
            'content_hash': calculate_hash(disclosure.content)
        }
        
        self.version_store.store(version)
        return version
    
    def validate_timing(self, disclosures):
        """
        Validate publication timing across disclosures
        """
        timing_issues = []
        
        for disclosure in disclosures:
            # Check if publication date is appropriate
            if not self.timing_validator.is_valid_publication_date(disclosure):
                timing_issues.append({
                    'disclosure': disclosure,
                    'issue': 'invalid_publication_date'
                })
            
            # Check synchronization with other disclosures
            sync_issues = self.timing_validator.check_synchronization(disclosure, disclosures)
            if sync_issues:
                timing_issues.extend(sync_issues)
        
        return timing_issues
```

### Publication Timing Risk

**Risk Factors**
- Asynchronous updates
- Stale information
- Inconsistent effective dates
- Regulatory deadlines

---

## Exercise 2: Create a Disclosure Map for a Single Fund Across All Channels

### Objective
Create a comprehensive map of all disclosures for a single fund across all channels and document types.

### Requirements

1. **Disclosure Inventory**
   - All document types
   - All channels
   - Version information
   - Publication dates

2. **Mapping Framework**
   - Document relationships
   - Consistency requirements
   - Update dependencies
   - Risk assessment

3. **Deliverables**
   - Disclosure map document
   - Relationship diagram
   - Risk assessment
   - Maintenance plan

### Evaluation Criteria
- Inventory completeness (35%)
- Mapping quality (30%)
- Risk assessment (25%)
- Maintenance plan (10%)

---

## Key Takeaways

- **The Compliance**: The compliance surface includes regulatory disclosures, fund documents, and digital channels
- **Structured And**: Structured and narrative ESG statements must be aligned and consistent
- **Jurisdiction-Specific Variations**: Jurisdiction-specific variations require careful management
- **Versioning And**: Versioning and publication timing create significant compliance risk

---

**End of Module 2**
