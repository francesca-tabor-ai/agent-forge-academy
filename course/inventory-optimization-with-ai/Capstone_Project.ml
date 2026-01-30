---
title: "Capstone Project: Multi-Echelon Inventory System Design"
description: "Design an inventory optimization system for a multi-echelon network facing inflation, long lead times, and volatile demand"
module: "Capstone"
order: 10
problem: "Real-world inventory systems face multiple simultaneous challenges"
capability: "End-to-End Inventory System Design"
inspiration: "Production inventory systems and supply chain resilience"
---

# Capstone Project: Multi-Echelon Inventory System Design

**Problem:** Real-world inventory systems face multiple simultaneous challenges  
**Capability:** End-to-End Inventory System Design  
**Inspiration:** Production inventory systems and supply chain resilience

---

## Project Overview

Design an inventory optimization system for a multi-echelon network facing:
- **Inflation:** Rising input costs (3–5% monthly)
- **Long lead times:** 90–120 day supplier lead times
- **Volatile demand:** Demand spikes up to 3x normal, regime shifts
- **Multi-echelon:** Plant → DC → Regional Warehouse → Retail

---

## Project Requirements

### System Context

**Network Structure:**
- 1 Plant (manufactures components)
- 3 Distribution Centers (serve regions)
- 9 Regional Warehouses (3 per DC)
- 27 Retail Locations (3 per warehouse)

**Product Characteristics:**
- 50 SKUs across 3 categories:
  - Fast movers (20 SKUs): high demand, low value, short lifecycle
  - Medium movers (20 SKUs): medium demand, medium value, stable
  - Slow movers (10 SKUs): low demand, high value, long lifecycle

**Constraints:**
- Working capital limit: $5M total inventory
- Service level requirement: 95% fill rate at retail
- Inflation: 3–5% monthly input cost increase
- Lead times: 90–120 days from supplier to plant
- Demand volatility: ±50% normal, spikes up to 3x

---

## Deliverables

### 1. Inventory Policy Logic

**Requirements:**
- Reorder point calculation by SKU and echelon
- Safety stock calculation (demand + lead-time variance)
- Order quantity calculation (EOQ-adjusted for constraints)
- SKU-specific DOI targets
- Multi-echelon coordination logic

**Documentation:**
- Policy formulas and algorithms
- Assumptions and rationale
- Code implementation (Python recommended)
- Example calculations for sample SKUs

### 2. Risk Thresholds

**Requirements:**
- Stockout risk limits: maximum acceptable probability
- Working capital limits: maximum inventory value
- Inflation hedging thresholds: when to buy early
- Demand shock detection: anomaly thresholds
- Override triggers: when human intervention needed

**Documentation:**
- Risk threshold definitions
- Trigger conditions
- Escalation procedures
- Monitoring and alerting logic

### 3. KPI Framework

**Requirements:**
- Service level metrics: fill rate, stockout frequency
- Inventory metrics: DOI, turns, excess inventory
- Cost metrics: total cost, holding cost, stockout cost
- Working capital metrics: inventory value, cash flow
- Trust metrics: override rate, acceptance rate

**Documentation:**
- KPI definitions and calculations
- Target values and tolerances
- Dashboard design (mockup or description)
- Reporting frequency and format

### 4. System Design Document

**Requirements:**
- Architecture: how components interact
- Data flows: demand signals, orders, inventory updates
- Decision logic: when to reorder, how much to order
- Override mechanisms: how operators intervene
- Feedback loops: how system learns from operators

**Documentation:**
- System architecture diagram
- Data flow diagrams
- Decision flowcharts
- User interface mockups (optional)
- Implementation roadmap

---

## Evaluation Criteria

### Risk Awareness (25%)

**Evaluation:**
- Does the system account for uncertainty?
- Are risk thresholds explicit and justified?
- Does it handle tail risk scenarios?
- Is inflation and FX risk considered?

**Evidence:**
- Risk assessment in policy design
- Tail risk scenarios addressed
- Inflation hedging logic
- Stress testing results

### Decision Robustness (25%)

**Evaluation:**
- Does the system work under various conditions?
- Does it handle demand shocks and regime shifts?
- Does it adapt to changing uncertainty?
- Are there failure modes and mitigations?

**Evidence:**
- Simulation results under various scenarios
- Stress testing: demand shocks, supplier failures
- Adaptation logic: how system responds to changes
- Failure mode analysis

### Practical Constraints (25%)

**Evaluation:**
- Are working capital constraints respected?
- Are multi-echelon coordination issues addressed?
- Are SKU-specific differences handled?
- Are long lead times and supplier reliability accounted for?

**Evidence:**
- Working capital calculations and limits
- Multi-echelon coordination logic
- SKU classification and differentiation
- Lead-time and supplier reliability handling

### Clarity of Explanation (25%)

**Evaluation:**
- Is the system design clear and understandable?
- Can operators understand and trust the recommendations?
- Are explanations jargon-free and actionable?
- Is the documentation complete and usable?

**Evidence:**
- System design documentation quality
- Explanation examples (how to explain to operators)
- User interface or interaction design
- Documentation completeness

---

## Project Timeline

**Week 1: Analysis and Design**
- Analyze requirements and constraints
- Design inventory policy logic
- Define risk thresholds
- Create system architecture

**Week 2: Implementation**
- Implement policy calculations
- Build simulation framework
- Create KPI framework
- Design override mechanisms

**Week 3: Testing and Validation**
- Run simulations under various scenarios
- Stress test: demand shocks, supplier failures
- Validate against requirements
- Refine based on results

**Week 4: Documentation and Presentation**
- Complete system design document
- Create KPI dashboard mockup
- Write explanation examples
- Prepare presentation

---

## Core Lesson (Explicit)

> **"Inventory optimization is about surviving uncertainty, not minimizing formulas."**

This capstone project brings together all modules:
- **Module 1:** Risk-based thinking, not formula optimization
- **Module 2:** Dynamic safety stock under uncertainty
- **Module 3:** SKU-specific DOI targets
- **Module 4:** Multi-echelon network optimization
- **Module 5:** Risk-aware policies with intervals and scenarios
- **Module 6:** Long lead times and structural constraints
- **Module 7:** Inflation and FX volatility
- **Module 8:** Demand shocks and regime shifts
- **Module 9:** Human-in-the-loop trust

The goal is not to find the "optimal" solution, but to design a system that:
- **Survives uncertainty:** handles volatility, shocks, and constraints
- **Operators trust:** easy to understand, easy to override
- **Adapts to reality:** learns from feedback, adjusts to changes
- **Balances trade-offs:** service level, cost, risk, working capital

---

## Submission Format

**Required Files:**
1. `inventory_policy.py` - Policy implementation code
2. `system_design.md` - System design document
3. `risk_thresholds.md` - Risk threshold definitions
4. `kpi_framework.md` - KPI framework and dashboard
5. `simulation_results.ipynb` - Simulation and validation results
6. `presentation.pdf` - Final presentation (optional)

**Code Requirements:**
- Python 3.8+
- Well-documented code
- Modular design (separate functions for policy, simulation, KPIs)
- Example usage and test cases

**Documentation Requirements:**
- Clear explanations
- Diagrams where helpful
- Example calculations
- Assumptions and limitations

---

**End of Capstone Project**
