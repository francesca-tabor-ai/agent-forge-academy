---
title: "Module 5: Manual Overrides & Shadow Systems"
description: "Account for human behavior in the data"
module: "5"
order: 5
problem: "Assuming system data reflects actual decisions and operations"
capability: "Human Behavior in Data"
inspiration: "Organizational behavior, shadow IT, and workarounds"
---

# Module 5: Manual Overrides & Shadow Systems

**Problem:** Assuming system data reflects actual decisions and operations  
**Capability:** Human Behavior in Data  
**Inspiration:** Organizational behavior, shadow IT, and workarounds

---

## Mindset Shift

> "People work around systems when systems don't work for them — understanding these workarounds is essential for understanding operational reality."

---

## Learning Objectives

### Planner Overrides

- **Why planners override systems**
  - Systems don't account for local knowledge
  - Systems are too slow for urgent decisions
  - Systems don't handle exceptions well
  - Planners know things systems don't

- **How overrides work**
  - Manual adjustments to forecasts
  - Direct changes to production plans
  - Bypassing automated recommendations
  - Using system as "suggestion engine"

- **Impact on data**
  - System data doesn't reflect actual decisions
  - Overrides may not be recorded
  - Historical data includes overrides
  - Models trained on overridden data learn wrong patterns

- **How to detect overrides**
  - Comparing system recommendations to actuals
  - Identifying large manual adjustments
  - Finding patterns in deviations
  - Interviewing planners

### Spreadsheet-Driven Decisions

- **Why spreadsheets exist**
  - Systems are too rigid
  - Systems don't support needed analysis
  - Systems are too slow
  - People prefer familiar tools

- **What spreadsheets contain**
  - Critical operational data
  - Decision logic and calculations
  - Historical analysis
  - "Real" plans vs. system plans

- **Impact on data**
  - Important decisions not in systems
  - Data exists in multiple places
  - Reconciliation challenges
  - Models miss critical information

- **How to work with spreadsheets**
  - Identify critical spreadsheets
  - Understand their role
  - Integrate or replace thoughtfully
  - Don't assume systems have all data

### WhatsApp and Email Workflows

- **Why informal channels are used**
  - Faster than systems
  - More flexible
  - Better for exceptions
  - Supports relationships

- **What happens in informal channels**
  - Urgent decisions
  - Exception handling
  - Coordination
  - Problem-solving

- **Impact on data**
  - Decisions not recorded in systems
  - Important context missing
  - Data doesn't reflect reality
  - Models miss critical signals

- **How to account for informal channels**
  - Recognize their existence
  - Understand their role
  - Find ways to capture key information
  - Don't assume systems are complete

### Why Overrides Are Often Rational

- **Systems optimize for the average**
  - Don't handle exceptions well
  - Too slow for urgent decisions
  - Don't account for local knowledge
  - Don't support needed flexibility

- **People have information systems don't**
  - Customer relationships
  - Supplier capabilities
  - Operational constraints
  - Market intelligence

- **Overrides solve real problems**
  - Systems fail in edge cases
  - Urgent decisions need speed
  - Local knowledge matters
  - Flexibility is required

- **How to learn from overrides**
  - Understand why they happen
  - Identify patterns
  - Improve systems based on overrides
  - Don't just eliminate them

---

## Practical Exercise

### Detect Override Patterns in Order Data

**Objective:** Learn to identify and interpret manual overrides in operational data

**Dataset Provided:**
- Order data with:
  - System-generated forecasts
  - Actual orders placed
  - Manual adjustments
  - Override flags (when available)
- Multiple products and time periods
- Various override patterns

**Tasks:**

1. **Identify Overrides**
   - Compare system recommendations to actuals
   - Find large deviations
   - Identify manual adjustments
   - Flag suspicious patterns

2. **Characterize Override Patterns**
   - When do overrides occur?
   - Which products get overridden?
   - What's the magnitude of overrides?
   - Are overrides systematic or random?

3. **Understand Override Reasons**
   - Interview planners (if possible)
   - Correlate with operational context
   - Identify patterns in override timing
   - Understand what triggers overrides

4. **Assess Override Impact**
   - How do overrides affect:
     - System accuracy?
     - Model performance?
     - Operational decisions?
     - Data quality?

5. **Design Override-Aware Models**
   - How to handle overridden data?
   - How to use override information?
   - How to predict when overrides will occur?
   - How to improve systems to reduce overrides?

**Deliverables:**
- Override detection analysis
- Pattern characterization
- Reason analysis
- Impact assessment
- Override-aware modeling approach

---

## Practical Exercise

### Map Shadow Systems and Workarounds

**Objective:** Understand how people work around systems in practice

**Steps:**

1. **Choose an Operational Process**
   - Forecasting, planning, ordering, production
   - Any process with both system and manual components

2. **Interview Operators**
   - How do they use the system?
   - What workarounds do they use?
   - Where do they use spreadsheets?
   - What happens in email/WhatsApp?
   - What decisions aren't in the system?

3. **Document Shadow Systems**
   - Identify critical spreadsheets
   - Map informal communication channels
   - Document manual processes
   - Understand decision flows

4. **Assess Impact**
   - How much decision-making happens outside systems?
   - What data exists only in shadow systems?
   - How do workarounds affect operations?
   - What would break if workarounds stopped?

5. **Design Response**
   - How to account for shadow systems?
   - How to integrate or replace them?
   - How to improve systems to reduce workarounds?
   - How to capture critical information?

**Deliverables:**
- Shadow system inventory
- Workaround documentation
- Impact assessment
- Integration/replacement recommendations
- System improvement plan

---

## Behaviour Installed

### Success Indicators

- **Workaround awareness**
  - Questions about how people actually work
  - Recognition that systems don't capture everything
  - Understanding of shadow systems

- **Override detection**
  - Ability to identify manual overrides
  - Understanding of why overrides happen
  - Recognition that overrides are often rational

- **Human behavior understanding**
  - Appreciation for why people work around systems
  - Ability to learn from overrides
  - Design of systems that reduce need for workarounds

---

## Key Concepts

### Planner Overrides

- Why planners override systems
- How overrides work
- Impact on data and models
- How to detect and learn from overrides

### Shadow Systems

- Spreadsheets, email, WhatsApp
- Why they exist
- What they contain
- How to work with them

### Rational Workarounds

- Systems optimize for average
- People have information systems don't
- Overrides solve real problems
- How to learn from workarounds

### Human Behavior in Data

- Data reflects human behavior
- Understanding behavior is key to understanding data
- Workarounds are signals about system problems
- How to account for human behavior in models

---

## Tools and Techniques

- Override detection methods
- Shadow system mapping
- Interview techniques
- Workaround analysis
- System improvement based on workarounds
- Human-centered system design

---

**End of Module 5**
