---
title: "Module 1: The Operational Data Landscape"
description: "Understand where supply chain data actually comes from"
module: "1"
order: 1
problem: "Assuming a single system is the source of truth for operational data"
capability: "Operational Systems Understanding"
inspiration: "ERP, MES, WMS, and TMS systems in manufacturing and supply chains"
---

# Module 1: The Operational Data Landscape

**Problem:** Assuming a single system is the source of truth for operational data  
**Capability:** Operational Systems Understanding  
**Inspiration:** ERP, MES, WMS, and TMS systems in manufacturing and supply chains

---

## Mindset Shift

> "No single system is 'the source of truth' — operational data is fragmented across multiple systems, each with different purposes, owners, and incentives."

---

## Learning Objectives

### Overview of Operational Systems

- **ERP (Enterprise Resource Planning)**
  - Orders, inventory, finance
  - Master data management
  - Financial reporting requirements
  - Why ERP data is optimized for accounting, not operations

- **MES (Manufacturing Execution System)**
  - Production events and yields
  - Real-time machine status
  - Quality measurements
  - Why MES data is optimized for production control, not forecasting

- **WMS (Warehouse Management System)**
  - Warehouse movements and locations
  - Picking and put-away operations
  - Inventory accuracy at location level
  - Why WMS data is optimized for warehouse efficiency, not visibility

- **TMS (Transportation Management System)**
  - Shipments and routing
  - Delivery delays and exceptions
  - Carrier performance
  - Why TMS data is optimized for logistics, not demand planning

### Why No Single System Is "The Source of Truth"

- Each system serves different stakeholders
- Different update frequencies and latencies
- Different levels of granularity
- Different data quality standards
- Reconciliation challenges between systems
- Why "single source of truth" is a myth in operations

### Data Ownership and Incentives

- Who owns each data source?
- What incentives drive data entry?
- When is data entry a priority vs. a burden?
- How incentives create data quality issues
- Why understanding ownership matters for data reliability

---

## Practical Exercise

### Map Which Decisions Depend on Which Systems

**Objective:** Build awareness of how operational decisions rely on fragmented data sources

**Steps:**

1. **Choose a Decision Scenario**
   - Examples:
     - Should we increase production?
     - Do we have enough inventory?
     - Should we expedite a shipment?
     - Can we fulfill this order?

2. **Identify Required Data**
   - What information is needed to make this decision?
   - What questions need to be answered?
   - What metrics or signals matter?

3. **Map Data Sources**
   - Which system(s) provide each piece of data?
   - ERP, MES, WMS, TMS, or other?
   - Are there multiple sources for the same information?

4. **Document Data Characteristics**
   - Update frequency (real-time, hourly, daily, weekly)
   - Latency (how long after event does data appear?)
   - Granularity (SKU level, location level, aggregate?)
   - Reliability (how often is it wrong or missing?)

5. **Identify Conflicts and Gaps**
   - Where do systems disagree?
   - What data is missing?
   - What requires manual reconciliation?
   - What decisions are made with incomplete information?

6. **Document Data Ownership**
   - Who is responsible for each data source?
   - Who enters the data?
   - What are their incentives?
   - How does ownership affect data quality?

**Deliverables:**
- Decision-to-data-source mapping
- Data characteristics matrix
- List of conflicts and gaps
- Ownership and incentive analysis
- Recommendations for improving decision-making data

---

## Behaviour Installed

### Success Indicators

- **System awareness**
  - Questions about which system provides which data
  - Recognition that data comes from multiple sources
  - Understanding that systems serve different purposes

- **Source of truth skepticism**
  - Rejection of "single source of truth" claims
  - Questions about data ownership and incentives
  - Awareness of system-specific limitations

- **Decision-data mapping**
  - Ability to trace decisions back to data sources
  - Recognition of data gaps and conflicts
  - Questions about data reliability before trusting it

---

## Key Concepts

### Operational System Types

- **ERP:** Financial and order management focus
- **MES:** Production execution and control focus
- **WMS:** Warehouse operations focus
- **TMS:** Transportation and logistics focus
- Each system optimized for different stakeholders

### Fragmented Data Reality

- No single system has complete picture
- Systems disagree and require reconciliation
- Different update frequencies and latencies
- Different granularity and quality standards
- Manual processes bridge system gaps

### Data Ownership and Incentives

- Who enters data and why
- How incentives affect data quality
- When data entry is a priority vs. burden
- Why understanding ownership matters
- How to work with incentivized data entry

---

## Tools and Techniques

- System architecture mapping
- Data source inventory
- Decision-to-data mapping frameworks
- Stakeholder and ownership analysis
- Data quality assessment by system
- Reconciliation process design

---

**End of Module 1**
