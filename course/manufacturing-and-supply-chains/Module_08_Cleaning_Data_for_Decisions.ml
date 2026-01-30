---
title: "Module 8: Cleaning Data for Decisions (Not Beauty)"
description: "Clean data to support action, not dashboards"
module: "8"
order: 8
problem: "Cleaning data to make it look good rather than making it decision-ready"
capability: "Decision-Oriented Data Preparation"
inspiration: "Decision theory, uncertainty quantification, and operational data preparation"
---

# Module 8: Cleaning Data for Decisions (Not Beauty)

**Problem:** Cleaning data to make it look good rather than making it decision-ready  
**Capability:** Decision-Oriented Data Preparation  
**Inspiration:** Decision theory, uncertainty quantification, and operational data preparation

---

## Mindset Shift

> "Data cleaning should preserve uncertainty and support decisions — not create false confidence through cosmetic improvements."

---

## Learning Objectives

### What Not to Clean

- **Don't clean away uncertainty**
  - Missing data might be meaningful
  - Outliers might be real operational events
  - Variability might be important information
  - Cleaning can hide problems

- **Don't clean for aesthetics**
  - Smooth data for dashboards
  - Remove "ugly" patterns
  - Make data look "clean"
  - Focus on appearance over function

- **Don't clean without understanding**
  - Why is data missing?
  - Why are there outliers?
  - What does variability mean?
  - What information would be lost?

- **When not cleaning is right**
  - Missing data is a signal
  - Outliers are real events
  - Variability is important
  - Uncertainty should be preserved

### Preserving Uncertainty

- **Why uncertainty matters**
  - Real operations are uncertain
  - Decisions need to account for uncertainty
  - False confidence leads to bad decisions
  - Uncertainty is information

- **How to preserve uncertainty**
  - Don't impute missing data blindly
  - Flag uncertain observations
  - Quantify uncertainty where possible
  - Design datasets that preserve uncertainty

- **Uncertainty-aware datasets**
  - Confidence flags
  - Uncertainty estimates
  - Multiple scenarios
  - Risk indicators

- **Using uncertainty in decisions**
  - Robust decision-making
  - Safety margins
  - Risk-aware planning
  - Scenario analysis

### Flagging Unreliable Observations

- **Why flagging matters**
  - Not all data is equally reliable
  - Decisions need reliability information
  - Models need to know what to trust
  - Transparency is essential

- **What to flag**
  - Missing data (and why it's missing)
  - Outliers (and whether they're real)
  - Revised data (and revision history)
  - Manual overrides
  - System errors
  - Low-confidence observations

- **How to flag**
  - Reliability scores
  - Confidence flags
  - Data quality indicators
  - Source and process metadata

- **Using flags in models**
  - Weight observations by reliability
  - Separate high/low confidence data
  - Model uncertainty explicitly
  - Design for reliability

### Designing "Confidence-Aware" Datasets

- **What confidence-aware means**
  - Each observation has reliability information
  - Uncertainty is quantified where possible
  - Data quality is transparent
  - Decisions can account for confidence

- **Components of confidence-aware datasets**
  - Data values
  - Confidence scores
  - Quality flags
  - Source metadata
  - Process history

- **How to design**
  - Start with raw data
  - Add confidence assessments
  - Flag unreliable observations
  - Preserve uncertainty information
  - Document data quality

- **Benefits**
  - Better decision-making
  - More robust models
  - Transparency
  - Accountability

---

## Hands-On Exercise

### Build a Decision-Ready Inventory Dataset

**Objective:** Practice cleaning data for decisions, not beauty

**Dataset Provided:**
- Raw inventory data with:
  - Missing values
  - Outliers
  - Revisions
  - System errors
  - Manual overrides
  - Various data quality issues

**Tasks:**

1. **Assess Data Quality**
   - Identify missing values and why
   - Find outliers and assess if real
   - Check for revisions and backfills
   - Identify system errors
   - Document manual overrides

2. **Decide What NOT to Clean**
   - What missing data is meaningful?
   - What outliers are real events?
   - What variability is important?
   - What uncertainty should be preserved?

3. **Preserve Uncertainty**
   - Don't impute blindly
   - Flag uncertain observations
   - Quantify uncertainty where possible
   - Design to preserve uncertainty

4. **Flag Unreliable Observations**
   - Create reliability scores
   - Add confidence flags
   - Document data quality
   - Make reliability transparent

5. **Design Confidence-Aware Dataset**
   - Include data values
   - Add confidence scores
   - Include quality flags
   - Preserve source metadata
   - Document process history

6. **Validate for Decision-Making**
   - Can decisions account for uncertainty?
   - Is reliability information available?
   - Are false signals flagged?
   - Is data ready for robust decisions?

**Deliverables:**
- Data quality assessment
- Cleaning decisions (what not to clean)
- Uncertainty preservation strategy
- Confidence-aware dataset design
- Decision-readiness validation

---

## Practical Exercise

### Clean a Real Dataset for a Specific Decision

**Objective:** Apply decision-oriented cleaning to real data

**Steps:**

1. **Define the Decision**
   - What decision needs to be made?
   - What information is needed?
   - What uncertainty matters?
   - What reliability is required?

2. **Assess Raw Data**
   - What data quality issues exist?
   - What's missing and why?
   - What's unreliable?
   - What uncertainty exists?

3. **Decide Cleaning Strategy**
   - What NOT to clean?
   - What uncertainty to preserve?
   - What to flag?
   - What to clean and how?

4. **Build Confidence-Aware Dataset**
   - Clean appropriately
   - Preserve uncertainty
   - Flag unreliable observations
   - Add confidence information

5. **Validate for Decision**
   - Does dataset support decision?
   - Is uncertainty preserved?
   - Is reliability transparent?
   - Can decision account for confidence?

6. **Document Decisions**
   - Why cleaning choices were made
   - What uncertainty was preserved
   - What was flagged and why
   - How to use confidence information

**Deliverables:**
- Decision definition
- Data quality assessment
- Cleaning strategy
- Confidence-aware dataset
- Decision validation
- Documentation

---

## Behaviour Installed

### Success Indicators

- **Decision-oriented cleaning**
  - Questions about decision needs
  - Cleaning for function, not beauty
  - Preserving uncertainty
  - Flagging unreliability

- **Uncertainty preservation**
  - Not cleaning away uncertainty
  - Quantifying uncertainty
  - Designing confidence-aware datasets
  - Using uncertainty in decisions

- **Transparency**
  - Flagging unreliable observations
  - Documenting data quality
  - Making confidence visible
  - Supporting informed decisions

---

## Key Concepts

### What Not to Clean

- Don't clean away uncertainty
- Don't clean for aesthetics
- Don't clean without understanding
- When not cleaning is right

### Preserving Uncertainty

- Why uncertainty matters
- How to preserve uncertainty
- Uncertainty-aware datasets
- Using uncertainty in decisions

### Flagging Unreliability

- Why flagging matters
- What to flag
- How to flag
- Using flags in models

### Confidence-Aware Datasets

- What confidence-aware means
- Components of confidence-aware datasets
- How to design
- Benefits

### Decision-Oriented Cleaning

- Clean for decisions, not beauty
- Preserve uncertainty
- Flag unreliability
- Design for confidence

---

## Tools and Techniques

- Data quality assessment frameworks
- Uncertainty quantification methods
- Confidence scoring techniques
- Reliability flagging systems
- Decision-oriented cleaning processes
- Confidence-aware dataset design

---

**End of Module 8**
