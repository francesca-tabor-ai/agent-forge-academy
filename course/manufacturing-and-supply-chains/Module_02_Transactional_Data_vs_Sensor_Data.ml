---
title: "Module 2: Transactional Data vs Sensor Data"
description: "Learn how different data types lie in different ways"
module: "2"
order: 2
problem: "Treating all operational data as equally reliable"
capability: "Data Type Awareness"
inspiration: "IoT sensors, transactional systems, and measurement theory"
---

# Module 2: Transactional Data vs Sensor Data

**Problem:** Treating all operational data as equally reliable  
**Capability:** Data Type Awareness  
**Inspiration:** IoT sensors, transactional systems, and measurement theory

---

## Mindset Shift

> "Transactional data and sensor data lie in fundamentally different ways — understanding how each type fails is essential for building robust models."

---

## Learning Objectives

### Transactional Events (Orders, Receipts, Shipments)

- **What transactional data represents**
  - Discrete events with business meaning
  - Human-initiated or system-generated actions
  - Records of decisions and commitments

- **How transactional data lies**
  - Timing: when event happened vs. when it was recorded
  - Completeness: events that should exist but don't
  - Accuracy: wrong quantities, dates, or locations
  - Intent vs. reality: what was intended vs. what happened

- **Common failure modes**
  - Backdated transactions
  - Missing transactions
  - Duplicate entries
  - Incorrect quantities or dates
  - System errors and manual corrections

### Sensor / IoT Streams (Machines, Temperature, Location)

- **What sensor data represents**
  - Continuous measurements of physical phenomena
  - Automated data collection
  - Real-time or near-real-time streams

- **How sensor data lies**
  - Precision vs. accuracy confusion
  - Sensor drift and calibration issues
  - Missing measurements (sensor failures, network issues)
  - Sampling frequency vs. signal frequency
  - Environmental interference

- **Common failure modes**
  - Sensor failures (stuck values, noise)
  - Calibration drift
  - Network interruptions
  - Sampling aliasing
  - Environmental factors (temperature, vibration)

### Precision vs Accuracy

- **Precision:** Consistency of measurements
- **Accuracy:** Correctness of measurements
- Why high precision doesn't mean high accuracy
- Why sensor data can be precise but wrong
- Why transactional data can be accurate but imprecise
- How to assess both dimensions

### Event Timing vs Event Recording

- **Event timing:** When something actually happened
- **Event recording:** When it was entered into the system
- Why these differ for transactional data
- Why they're closer for sensor data
- How timing differences create modeling problems
- How to account for recording delays

---

## Case Study

### Machine Uptime Sensors vs Reported Production Output

**Scenario:** A manufacturing line has IoT sensors tracking machine uptime and a production reporting system that records output quantities.

**The Problem:**
- Sensors show machine running 95% of time
- Production system shows only 80% of expected output
- Models using sensor data predict higher production than reality

**Analysis:**

1. **Sensor Data (Uptime)**
   - Measures: machine is on/off
   - Precision: high (millisecond accuracy)
   - Accuracy: questionable (does "on" mean producing?)
   - What it misses:
     - Machine running but not producing (setup, changeover, quality issues)
     - Running at reduced speed
     - Producing scrap/rework

2. **Transactional Data (Production Output)**
   - Measures: completed units recorded
   - Precision: lower (batch recording, delays)
   - Accuracy: higher for business purposes
   - What it captures:
     - Actual good units produced
     - When production was recorded (may be delayed)
     - Adjustments and corrections

3. **The Gap**
   - Sensors measure machine state, not production
   - Production system measures business output, not machine state
   - Neither is "wrong" — they measure different things
   - Models need to understand what each measures

**Lessons:**
- Sensor data measures physical state, not business outcomes
- Transactional data measures business events, not physical reality
- Both are needed, but for different purposes
- Models must account for what each data type actually represents

---

## Practical Exercise

### Compare Transactional and Sensor Data for the Same Process

**Objective:** Experience how different data types tell different stories

**Steps:**

1. **Choose a Process**
   - Manufacturing line
   - Warehouse operation
   - Transportation route
   - Any process with both transactional and sensor data

2. **Collect Transactional Data**
   - Events recorded in systems (orders, shipments, production records)
   - Document: what it measures, when recorded, update frequency

3. **Collect Sensor Data**
   - IoT measurements (temperature, location, machine status)
   - Document: what it measures, sampling frequency, sensor type

4. **Compare Measurements**
   - What does each data type measure?
   - How do they differ?
   - Where do they agree or disagree?
   - What does each miss?

5. **Identify Failure Modes**
   - How could transactional data be wrong?
   - How could sensor data be wrong?
   - What would break a model using only one type?

6. **Design a Robust Model**
   - How would you use both data types?
   - What would you trust from each?
   - How would you reconcile differences?

**Deliverables:**
- Comparison of transactional vs. sensor data
- Failure mode analysis for each type
- Model design using both data types
- Recommendations for data collection

---

## Behaviour Installed

### Success Indicators

- **Data type awareness**
  - Questions about what data actually measures
  - Recognition that different types fail differently
  - Understanding precision vs. accuracy

- **Measurement skepticism**
  - Questions about how data was collected
  - Awareness of timing vs. recording differences
  - Recognition that "data" isn't "truth"

- **Robust modeling**
  - Using multiple data types appropriately
  - Accounting for different failure modes
  - Designing models that handle data limitations

---

## Key Concepts

### Transactional Data Characteristics

- Discrete events with business meaning
- Human or system-initiated
- Timing vs. recording delays
- Completeness and accuracy issues
- Intent vs. reality gaps

### Sensor Data Characteristics

- Continuous physical measurements
- Automated collection
- Precision vs. accuracy
- Sensor failures and drift
- Sampling and aliasing issues

### Precision vs. Accuracy

- Precision: consistency of measurements
- Accuracy: correctness of measurements
- High precision ≠ high accuracy
- Both matter for different reasons
- How to assess both dimensions

### Event Timing vs. Recording

- When event happened vs. when recorded
- Different for transactional vs. sensor data
- How delays create modeling problems
- How to account for timing differences

---

## Tools and Techniques

- Data type classification frameworks
- Precision and accuracy assessment methods
- Sensor calibration and validation
- Transactional data reconciliation
- Multi-source data integration
- Failure mode analysis for data types

---

**End of Module 2**
