---
title: "Module 4: Delays, Backfills & Revisions"
description: "Understand why historical data keeps changing"
module: "4"
order: 4
problem: "Assuming historical data is stable and accurate"
capability: "Temporal Data Understanding"
inspiration: "Data latency, revision cycles, and temporal data management"
---

# Module 4: Delays, Backfills & Revisions

**Problem:** Assuming historical data is stable and accurate  
**Capability:** Temporal Data Understanding  
**Inspiration:** Data latency, revision cycles, and temporal data management

---

## Mindset Shift

> "Historical data is not a fixed record — it's a living document that changes as operational reality becomes clearer and corrections are made."

---

## Learning Objectives

### Data Latency by System Type

- **Real-time systems (MES, sensors)**
  - Near-instantaneous data availability
  - But may lack business context
  - May be revised later with corrections

- **Batch systems (ERP, financial)**
  - Daily, weekly, or monthly updates
  - Data appears hours or days after events
  - Optimized for accuracy over speed

- **Manual entry systems**
  - Variable latency depending on workload
  - May be entered days or weeks later
  - Subject to human delays and priorities

- **Why latency varies**
  - System architecture and design
  - Business process requirements
  - Data quality vs. speed trade-offs
  - Integration complexity

### Retroactive Corrections

- **Why corrections happen**
  - Errors discovered later
  - Better information becomes available
  - Reconciliation processes
  - Audit findings

- **How corrections are made**
  - Backdating transactions
  - Adjusting historical records
  - Replacing incorrect values
  - Adding missing transactions

- **Impact on historical data**
  - Data you saw yesterday may change today
  - Historical trends may shift
  - Models trained on "final" data may be wrong
  - Comparisons across time periods become complex

### End-of-Period Adjustments

- **Why adjustments happen**
  - Financial closing processes
  - Inventory reconciliation
  - Performance reporting
  - Regulatory requirements

- **Common adjustment types**
  - Inventory write-downs/up
  - Revenue recognition adjustments
  - Cost allocation corrections
  - Accrual adjustments

- **When adjustments occur**
  - End of month/quarter/year
  - After audits
  - During reconciliation
  - When discrepancies are found

- **Impact on data**
  - Historical periods get revised
  - Trends change after adjustments
  - Models need to account for revision cycles
  - "Final" numbers may not be final

### Snapshot vs Event-Sourced Data

- **Snapshot data**
  - Point-in-time views (e.g., inventory levels)
  - Current state at a moment
  - May be overwritten
  - Loses history of changes

- **Event-sourced data**
  - Immutable log of events
  - Preserves history
  - Can reconstruct any point in time
  - More complex but more accurate

- **Why it matters**
  - Snapshot data hides revision history
  - Event-sourced data shows what actually happened
  - Different modeling approaches needed
  - Different data quality implications

---

## Hands-On Exercise

### Compare Real-Time vs Revised Demand Numbers

**Objective:** Experience how data changes over time and impacts models

**Dataset Provided:**
- Demand data with multiple versions:
  - Real-time demand (as reported initially)
  - Revised demand (after corrections)
  - Final demand (after end-of-period adjustments)
- Multiple time periods
- Various revision patterns

**Tasks:**

1. **Track Data Changes Over Time**
   - For each time period, document:
     - Initial reported value
     - Subsequent revisions
     - Final value
     - Time between initial and final
   - Calculate revision magnitude and frequency

2. **Identify Revision Patterns**
   - When do revisions occur?
   - What types of revisions are common?
   - Are revisions systematic or random?
   - Do revisions follow patterns (e.g., always upward, always at month-end)?

3. **Analyze Revision Impact**
   - How much do numbers change?
   - Which periods/products are revised most?
   - What's the typical revision lag?
   - How do revisions affect trends?

4. **Model with Different Data Versions**
   - Build models using:
     - Real-time data only
     - Final revised data only
     - Both with revision flags
   - Compare model performance
   - Identify which approach works best

5. **Design Revision-Aware Models**
   - How to handle data that changes?
   - How to use revision information?
   - How to predict when revisions will occur?
   - How to build models robust to revisions?

**Deliverables:**
- Revision tracking analysis
- Revision pattern identification
- Impact assessment
- Model comparison across data versions
- Revision-aware modeling approach

---

## Practical Exercise

### Document Data Revision Patterns in a Real System

**Objective:** Understand how data revisions work in practice

**Steps:**

1. **Choose a Data Source**
   - Sales, inventory, production, orders
   - Any system with revision cycles

2. **Track Data Over Time**
   - Capture data at multiple points:
     - Day 1 (initial)
     - Day 7 (after weekly reconciliation)
     - Day 30 (after monthly close)
     - Day 90 (after quarterly adjustments)
   - Document all changes

3. **Identify Revision Triggers**
   - What causes revisions?
   - When do they occur?
   - Who makes them?
   - What's the process?

4. **Analyze Revision Patterns**
   - Magnitude of revisions
   - Frequency of revisions
   - Direction of revisions (up/down)
   - Which items are revised most

5. **Assess Impact**
   - How do revisions affect:
     - Historical trends?
     - Model predictions?
     - Business decisions?
     - Performance metrics?

6. **Design Response**
   - How to handle revisions in models
   - How to use revision information
   - How to build revision-aware processes
   - How to communicate revision impact

**Deliverables:**
- Data revision tracking
- Revision trigger analysis
- Pattern identification
- Impact assessment
- Recommendations for handling revisions

---

## Behaviour Installed

### Success Indicators

- **Temporal awareness**
  - Questions about data latency
  - Recognition that data changes over time
  - Understanding of revision cycles

- **Revision tracking**
  - Ability to track data changes
  - Identification of revision patterns
  - Understanding of revision impact

- **Robust modeling**
  - Building models that handle revisions
  - Using revision information appropriately
  - Designing revision-aware processes

---

## Key Concepts

### Data Latency

- Real-time vs. batch vs. manual entry
- Why latency varies by system
- Impact on decision-making
- How to work with delayed data

### Retroactive Corrections

- Why corrections happen
- How corrections are made
- Impact on historical data
- How to account for corrections

### End-of-Period Adjustments

- Why adjustments occur
- Common adjustment types
- When adjustments happen
- Impact on data and models

### Snapshot vs. Event-Sourced

- Snapshot: point-in-time views
- Event-sourced: immutable event logs
- Why it matters for modeling
- How to work with each type

---

## Tools and Techniques

- Data versioning and tracking
- Revision pattern analysis
- Temporal data management
- Event sourcing architectures
- Revision-aware modeling
- Data latency measurement

---

**End of Module 4**
