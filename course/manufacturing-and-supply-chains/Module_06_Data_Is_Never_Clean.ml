---
title: "Module 6: Data Is Never Clean"
description: "Reset expectations about operational data"
module: "6"
order: 6
problem: "Assuming operational data is clean, accurate, and timely"
capability: "Operational Data Reality"
inspiration: "Data quality management and ERP systems"
---

# Module 6: Data Is Never Clean

**Problem:** Assuming operational data is clean, accurate, and timely  
**Capability:** Operational Data Reality  
**Inspiration:** Data quality management and ERP systems

---

## Mindset Shift

> "Operational data is a messy reflection of reality, not a clean representation of it."

---

## Learning Objectives

### ERP Data Delays and Revisions

- Why ERP data is always behind reality
- Batch processing vs. real-time updates
- Data entry delays
- Revision cycles and backdating
- How to work with delayed data

### Manual Overrides and "Shadow Systems"

- Why people override systems
- Spreadsheets and "shadow systems"
- Manual adjustments that aren't recorded
- The gap between system data and reality
- How to account for overrides

### Why Timestamps Lie

- When data was created vs. when event happened
- System clocks and timezone issues
- Batch processing timestamps
- Backdated transactions
- How to interpret timestamps correctly

### Aggregation Hides Risk

- How aggregation smooths variability
- Lost detail in summaries
- Risk hidden in averages
- Why you need disaggregated data
- When aggregation is appropriate

---

## Hands-On Exercise

### Analyze a "Dirty" Inventory Dataset and Identify False Signals

**Objective:** Experience the reality of operational data quality

**Dataset Provided:**
- Inventory levels over time
- Multiple locations
- Various data quality issues:
  - Missing values
  - Duplicate entries
  - Timestamp inconsistencies
  - Manual adjustments
  - System errors
  - Aggregation artifacts

**Tasks:**

1. **Data Quality Assessment**
   - Identify missing values
   - Find duplicate entries
   - Check for outliers
   - Validate timestamps
   - Identify inconsistencies

2. **Pattern Detection**
   - What patterns are real vs. data artifacts?
   - Which trends are meaningful?
   - What looks like a problem but isn't?
   - What looks normal but is actually a problem?

3. **False Signal Identification**
   - Identify signals that are data quality issues
   - Distinguish real trends from data problems
   - Document assumptions about missing data
   - Identify where you need more information

4. **Data Cleaning Strategy**
   - How would you clean this data?
   - What can be fixed vs. what must be accepted?
   - How to handle missing values?
   - What validation rules would help?

5. **Modeling Implications**
   - How would data quality affect a forecasting model?
   - What assumptions would break?
   - How to build robustness to data issues?
   - What monitoring would catch problems?

**Deliverables:**
- Data quality report
- List of identified issues
- False signals documented
- Data cleaning recommendations
- Modeling implications analysis

---

## Practical Exercise

### Document Data Quality Issues in a Real System

**Objective:** Understand data quality challenges in practice

**Activity:**

1. **Choose a System**
   - An operational system you have access to
   - Examples: inventory, sales, production, orders

2. **Examine the Data**
   - Look at raw data (not cleaned/aggregated)
   - Check for common issues:
     - Missing values
     - Duplicates
     - Timestamp problems
     - Manual overrides
     - System errors

3. **Interview Users**
   - How do they use the system?
   - What manual workarounds exist?
   - Where do they keep "shadow" data?
   - What data do they not trust?
   - What would they change?

4. **Document Findings**
   - Data quality issues found
   - Root causes
   - Impact on decision-making
   - Recommendations for improvement

**Deliverables:**
- Data quality assessment
- User interview findings
- Root cause analysis
- Impact assessment
- Improvement recommendations

---

## Behaviour Installed

### Success Indicators

- **Data skepticism**
  - Questions about data quality and timeliness
  - Recognition that data is never perfect

- **Reality awareness**
  - Understanding of gaps between data and reality
  - Questions about manual overrides and shadow systems

- **Robust modeling**
  - Building models that handle data quality issues
  - Monitoring for data problems
  - Validation and sanity checks

---

## Key Concepts

### ERP Data Characteristics

- Always behind reality
- Batch processing delays
- Revision cycles
- Data entry errors
- System limitations

### Manual Overrides

- Why people override systems
- Shadow systems (spreadsheets, etc.)
- Unrecorded adjustments
- The reality gap
- How to account for overrides

### Timestamp Issues

- Creation time vs. event time
- Timezone problems
- Batch processing artifacts
- Backdated transactions
- How to interpret correctly

### Aggregation Problems

- Smoothing variability
- Lost detail
- Hidden risk in averages
- When disaggregation is needed
- Appropriate aggregation levels

### Data Quality Management

- Data quality dimensions (accuracy, completeness, timeliness, consistency)
- Validation rules
- Monitoring and alerting
- Cleaning strategies
- Accepting imperfection

---

## Tools and Techniques

- Data quality assessment frameworks
- Outlier detection
- Missing data analysis
- Timestamp validation
- Data profiling
- Statistical process control for data quality
- Data quality monitoring

---

**End of Module 6**
