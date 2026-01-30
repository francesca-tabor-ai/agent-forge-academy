---
title: "Capstone Project: Data in the Wild"
description: "Apply all course concepts to a messy operational dataset"
module: "Capstone"
order: 9
problem: "Real operational data is messy and requires careful interpretation"
capability: "Operational Data Mastery"
inspiration: "Real-world data challenges in manufacturing and supply chains"
---

# Capstone Project: Data in the Wild

**Problem:** Real operational data is messy and requires careful interpretation  
**Capability:** Operational Data Mastery  
**Inspiration:** Real-world data challenges in manufacturing and supply chains

---

## Project Overview

Given a messy order + inventory dataset, you will:
1. Identify data issues
2. Flag false signals
3. Propose modeling-safe transformations
4. Explain what decisions should not rely on this data

This project integrates all concepts from the course:
- Understanding operational data sources (Module 1)
- Distinguishing data types and their failure modes (Module 2)
- Interpreting missing data as signals (Module 3)
- Accounting for delays, backfills, and revisions (Module 4)
- Detecting manual overrides and shadow systems (Module 5)
- Recognizing aggregation that hides risk (Module 6)
- Identifying false signals and data traps (Module 7)
- Cleaning data for decisions, not beauty (Module 8)

---

## Project Dataset

**Provided Dataset:**
- Order data (multiple years)
- Inventory data (multiple locations, SKUs)
- Various data quality issues:
  - Missing values (structural and random)
  - Data from multiple systems (ERP, WMS, manual)
  - Revisions and backfills
  - Manual overrides
  - Aggregation at multiple levels
  - Promotional effects
  - Pipeline inventory
  - System errors

**Dataset Characteristics:**
- Real operational data with real problems
- Multiple data sources
- Various time periods and revisions
- Mix of transactional and aggregated data
- Operational context provided

---

## Project Tasks

### Task 1: Data Issue Identification

**Objective:** Systematically identify all data quality issues

**Deliverables:**

1. **Data Source Analysis**
   - Map data to operational systems (ERP, WMS, etc.)
   - Identify which system provides which data
   - Document data ownership and incentives
   - Identify conflicts between systems

2. **Data Type Assessment**
   - Classify data as transactional vs. sensor vs. aggregated
   - Identify how each type might fail
   - Document precision vs. accuracy issues
   - Note timing vs. recording differences

3. **Missing Data Analysis**
   - Characterize missingness patterns
   - Distinguish structural vs. random missingness
   - Identify human-driven gaps
   - Interpret missingness as operational signals

4. **Revision and Latency Analysis**
   - Track data revisions over time
   - Identify revision patterns
   - Document data latency by source
   - Assess impact of revisions on historical data

5. **Override Detection**
   - Identify manual overrides
   - Detect shadow systems
   - Document workarounds
   - Assess impact on data reliability

6. **Aggregation Analysis**
   - Identify aggregation levels
   - Assess what's hidden at each level
   - Detect Simpson's paradox
   - Identify tail risk hidden by aggregation

**Output:** Comprehensive data issue inventory with root cause analysis

---

### Task 2: False Signal Identification

**Objective:** Identify signals that will mislead models

**Deliverables:**

1. **Promotional Effect Detection**
   - Identify promo-driven demand spikes
   - Separate promotional from baseline demand
   - Detect demand pull-forward
   - Assess promotional impact

2. **Pipeline Inventory Issues**
   - Distinguish available vs. pipeline inventory
   - Identify when pipeline creates false signals
   - Assess actual availability

3. **Phantom Stockout Detection**
   - Compare system vs. physical inventory
   - Identify accuracy issues
   - Find systematic discrepancies

4. **False Growth Signals**
   - Separate pulled-forward from real growth
   - Identify one-time events
   - Distinguish sustainable from temporary patterns

5. **Other False Signals**
   - System errors masquerading as patterns
   - Data collection artifacts
   - Operational process effects
   - Any other misleading patterns

**Output:** False signal catalog with causal analysis

---

### Task 3: Modeling-Safe Transformations

**Objective:** Propose transformations that preserve decision-relevant information

**Deliverables:**

1. **What NOT to Transform**
   - Missing data that's meaningful
   - Outliers that are real events
   - Variability that's important
   - Uncertainty that should be preserved

2. **Uncertainty Preservation**
   - Design confidence-aware transformations
   - Flag unreliable observations
   - Quantify uncertainty where possible
   - Preserve revision history

3. **False Signal Handling**
   - Separate promotional from baseline
   - Account for pipeline inventory
   - Handle phantom stockouts
   - Adjust for pull-forward effects

4. **Aggregation Strategy**
   - Choose appropriate aggregation levels
   - Preserve risk information
   - Avoid Simpson's paradox
   - Design multi-level views

5. **Transformation Documentation**
   - Why each transformation
   - What information is preserved
   - What information is lost
   - How to use transformed data

**Output:** Transformation proposal with rationale and documentation

---

### Task 4: Decision Suitability Analysis

**Objective:** Explain what decisions can and cannot rely on this data

**Deliverables:**

1. **Decision Categories**
   - Operational decisions (daily/weekly)
   - Tactical decisions (monthly/quarterly)
   - Strategic decisions (annual/long-term)
   - Real-time decisions

2. **Data Suitability by Decision**
   - Which decisions can use this data?
   - Which decisions cannot?
   - What additional data is needed?
   - What risks exist for each decision type?

3. **Confidence Assessment**
   - Reliability by data source
   - Confidence by decision type
   - Uncertainty quantification
   - Risk assessment

4. **Recommendations**
   - What decisions should proceed?
   - What decisions should wait?
   - What data improvements are needed?
   - What monitoring is required?

**Output:** Decision suitability matrix with recommendations

---

## Evaluation Criteria

### Correct Diagnosis of Data Pathologies (30%)

- **Completeness:** All major data issues identified
- **Accuracy:** Correct classification of issues
- **Root Cause Analysis:** Understanding why issues exist
- **Systematic Approach:** Methodical identification process

**Key Questions:**
- Did you find all the data problems?
- Did you correctly identify their causes?
- Do you understand why they exist?

### Restraint in Cleaning (25%)

- **What NOT to Clean:** Recognition of meaningful uncertainty
- **Uncertainty Preservation:** Maintaining decision-relevant uncertainty
- **Appropriate Cleaning:** Cleaning only what should be cleaned
- **Documentation:** Clear rationale for cleaning decisions

**Key Questions:**
- Did you avoid cleaning away uncertainty?
- Did you preserve decision-relevant information?
- Did you clean appropriately, not excessively?

### Decision Awareness (25%)

- **Decision Suitability:** Understanding what decisions can use data
- **Risk Assessment:** Recognizing decision risks
- **Confidence Quantification:** Assessing data reliability
- **Recommendations:** Clear guidance on data use

**Key Questions:**
- Do you understand what decisions can use this data?
- Can you assess decision risks?
- Are your recommendations clear and actionable?

### Clarity of Explanation (20%)

- **Communication:** Clear, concise explanations
- **Structure:** Well-organized analysis
- **Documentation:** Complete and understandable
- **Presentation:** Professional and polished

**Key Questions:**
- Can others understand your analysis?
- Is your documentation complete?
- Is your presentation clear?

---

## Project Deliverables

### 1. Data Issue Report
- Comprehensive inventory of data issues
- Root cause analysis
- Impact assessment
- System mapping

### 2. False Signal Analysis
- Catalog of false signals
- Causal analysis
- Impact on models
- Handling recommendations

### 3. Transformation Proposal
- Modeling-safe transformations
- Uncertainty preservation strategy
- False signal handling
- Documentation and rationale

### 4. Decision Suitability Matrix
- Decision categories
- Data suitability assessment
- Risk analysis
- Recommendations

### 5. Executive Summary
- Key findings
- Critical issues
- Recommendations
- Decision guidance

---

## Project Philosophy

> "If you don't understand how the data was created, you shouldn't trust what it says."

This project embodies the core philosophy of the course:
- Operational data is messy and requires interpretation
- Understanding data creation is essential
- Not all data problems should be "fixed"
- Decisions must account for data limitations
- Transparency and honesty about data quality

---

## Success Indicators

Upon completion, you should be able to:

- **Systematically assess operational data**
  - Identify all major data issues
  - Understand root causes
  - Map data to operational systems

- **Distinguish real from false signals**
  - Identify misleading patterns
  - Understand causal relationships
  - Separate signal from noise

- **Design appropriate transformations**
  - Preserve uncertainty
  - Handle false signals
  - Support decision-making

- **Assess decision suitability**
  - Understand what decisions can use data
  - Quantify risks and confidence
  - Provide clear recommendations

- **Communicate clearly**
  - Explain data issues understandably
  - Document transformations
  - Provide actionable recommendations

---

## Tools and Techniques

You may use any tools and techniques from the course:
- Data quality assessment frameworks
- Missing data pattern analysis
- Revision tracking methods
- Override detection techniques
- Aggregation analysis
- False signal identification
- Uncertainty quantification
- Confidence-aware dataset design

---

## Timeline

**Recommended Schedule:**
- Week 1: Data issue identification
- Week 2: False signal analysis
- Week 3: Transformation design
- Week 4: Decision suitability analysis and documentation

**Total Duration:** 4 weeks (aligns with course structure)

---

## Getting Started

1. **Review Course Materials**
   - Revisit all 8 modules
   - Understand key concepts
   - Review examples and case studies

2. **Examine the Dataset**
   - Load and explore the data
   - Understand structure and context
   - Identify obvious issues

3. **Plan Your Approach**
   - Break down into tasks
   - Identify tools and techniques
   - Create timeline

4. **Begin Systematic Analysis**
   - Start with data source mapping
   - Work through each task methodically
   - Document everything

---

**End of Capstone Project**
