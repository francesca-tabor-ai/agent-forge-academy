---
title: "Module 5: Safety, Risk & Failure Mode Engineering"
description: "Engineer for worst-case scenarios, not happy paths"
module: "5"
order: 5
email_takeaway: "FMEA and hazard analysis are essential for healthcare AI systems. Design for worst-case scenarios, not just happy paths."
email_action: "Conduct an FMEA on one component of an AI system, identifying 5 failure modes and mitigations."
---

# Module 5: Safety, Risk & Failure Mode Engineering

**Duration:** Week 5-6  
**Learning Objectives:**
- **Conduct Hazard**: Conduct hazard analysis for AI systems
- **Perform Failure**: Perform Failure Mode and Effects Analysis (FMEA) for agents
- **safe degradation and graceful failure Development**: Design safe degradation and graceful failure
- **confidence thresholds and refusal behaviors Implementation**: Implement confidence thresholds and refusal behaviors
- **Log And**: Log and learn from "near misses"

---

## 5.1 Hazard Analysis for AI Systems

### What Is Hazard Analysis?

Hazard analysis identifies potential sources of harm in a system and assesses their severity and likelihood.

### Healthcare AI Hazards

**1. Incorrect Recommendations**
- Wrong medication recommendations
- Incorrect dosages
- Inappropriate treatment suggestions
- Misdiagnosis support

**2. Missing Critical Information**
- Failure to flag critical lab values
- Missing drug interactions
- Overlooking allergies
- Missing contraindications

**3. System Failures**
- Service outages during critical operations
- Data loss or corruption
- Integration failures
- Network disruptions

**4. Privacy and Security Breaches**
- Unauthorized access to PHI
- Data leakage
- Inadequate encryption
- Compliance violations

**5. Over-Reliance on AI**
- Clinicians trusting AI without verification
- Ignoring clinical judgment
- Not questioning AI recommendations
- Automation bias

### Hazard Analysis Process

**Step 1: Identify Hazards**

Brainstorm potential hazards:
- What could go wrong?
- What are the failure modes?
- What are the edge cases?
- What are the misuse scenarios?

**Step 2: Assess Severity**

Rate severity on scale (1-5):
- 5: Catastrophic (death, permanent disability)
- 4: Critical (major injury, significant harm)
- 3: Serious (moderate injury, reversible harm)
- 2: Minor (temporary injury, minimal harm)
- 1: Negligible (no injury, inconvenience)

**Step 3: Assess Likelihood**

Rate likelihood on scale (1-5):
- 5: Frequent (likely to occur)
- 4: Probable (will occur several times)
- 3: Occasional (may occur)
- 2: Remote (unlikely to occur)
- 1: Improbable (very unlikely)

**Step 4: Calculate Risk**

Risk = Severity × Likelihood

Risk levels:
- 20-25: Unacceptable (must mitigate)
- 15-19: High (should mitigate)
- 10-14: Medium (consider mitigation)
- 5-9: Low (monitor)
- 1-4: Negligible (accept)

**Step 5: Identify Mitigations**

For each high-risk hazard:
- How can we prevent it?
- How can we detect it?
- How can we mitigate impact?
- How can we recover?

### Example: Medication Recommendation System

**Hazard: Incorrect Medication Recommendation**

**Severity:** 5 (Catastrophic - wrong medication could cause death)

**Likelihood:** 2 (Remote - with proper validation)

**Risk:** 10 (Medium)

**Mitigations:**
1. **Prevention:**
   - Comprehensive training data
   - Multiple validation checks
   - Drug interaction database
   - Allergy verification

2. **Detection:**
   - Confidence scoring
   - Anomaly detection
   - Human review for high-risk medications
   - Audit logging

3. **Impact Mitigation:**
   - Require human approval for all medication recommendations
   - Provide alternatives and reasoning
   - Show confidence scores
   - Enable easy override

4. **Recovery:**
   - Rollback procedures
   - Incident response plan
   - Learning from errors
   - System updates

---

## 5.2 Failure Mode and Effects Analysis (FMEA)

### What Is FMEA?

FMEA is a systematic method for identifying potential failure modes, their causes, and their effects.

### FMEA Process

**1. Identify Components/Functions**
- Break system into components
- List functions of each component
- Identify interfaces between components

**2. Identify Failure Modes**
- How can each component fail?
- What are the ways it can malfunction?
- What are the edge cases?

**3. Identify Effects**
- What happens when this component fails?
- What is the impact on the system?
- What is the impact on patients?

**4. Identify Causes**
- What causes this failure mode?
- What are the root causes?
- What are contributing factors?

**5. Rate Severity, Occurrence, Detection**
- **Severity (S):** Impact of the failure (1-10)
- **Occurrence (O):** Likelihood of failure (1-10)
- **Detection (D):** Likelihood of detecting failure (1-10)

**6. Calculate Risk Priority Number (RPN)**
RPN = Severity × Occurrence × Detection

**7. Prioritize Actions**
- Focus on highest RPN items
- Develop mitigation strategies
- Recalculate RPN after mitigations

### FMEA Template

| Component | Function | Failure Mode | Effect | Cause | S | O | D | RPN | Mitigation |
|-----------|----------|--------------|--------|-------|---||---|---|-----|------------|
| ASR | Recognize speech | Misrecognize medication name | Wrong medication ordered | Similar-sounding names | 10 | 3 | 4 | 120 | Spelling confirmation |
| NLU | Extract intent | Misclassify intent | Wrong action taken | Ambiguous utterance | 8 | 4 | 5 | 160 | Intent confirmation |
| Agent | Make recommendation | High confidence on wrong answer | Incorrect treatment | Model error | 10 | 2 | 3 | 60 | Human review required |

### Example: Voice Medication Ordering System FMEA

**Component: ASR Service**

**Function:** Convert speech to text

**Failure Mode 1: Misrecognize Medication Name**

- **Effect:** Wrong medication ordered, potential patient harm
- **Severity:** 10 (Catastrophic)
- **Occurrence:** 3 (Occasional - similar-sounding names)
- **Detection:** 4 (Moderate - may be caught in review)
- **RPN:** 120 (High priority)
- **Mitigation:**
  - Require spelling for medication names
  - Show visual confirmation
  - Use medication database for validation
  - Require human approval

**Failure Mode 2: Fail to Recognize Speech**

- **Effect:** System unusable, workflow disruption
- **Severity:** 6 (Serious)
- **Occurrence:** 4 (Probable - noise, accents)
- **Detection:** 10 (Certain - immediate)
- **RPN:** 240 (Very high priority)
- **Mitigation:**
  - Fallback to text input
  - Multiple ASR providers
  - Noise reduction
  - Adaptive thresholds

**Component: Medication Agent**

**Function:** Recommend medication and dosage

**Failure Mode 1: Recommend Wrong Dosage**

- **Effect:** Overdose or underdose, patient harm
- **Severity:** 10 (Catastrophic)
- **Occurrence:** 2 (Remote - with validation)
- **Detection:** 5 (Moderate - may be caught)
- **RPN:** 100 (High priority)
- **Mitigation:**
  - Multiple validation checks
  - Dose range limits
  - Human review for unusual doses
  - Visual confirmation with calculations

**Failure Mode 2: Miss Drug Interaction**

- **Effect:** Adverse drug interaction, patient harm
- **Severity:** 9 (Critical)
- **Occurrence:** 3 (Occasional)
- **Detection:** 4 (Moderate)
- **RPN:** 108 (High priority)
- **Mitigation:**
  - Comprehensive interaction database
  - Real-time interaction checking
  - Flag all potential interactions
  - Require pharmacist review for interactions

---

## 5.3 Safe Degradation and Graceful Failure

### The Principle of Graceful Degradation

Systems should continue to provide value even when components fail, rather than failing completely.

### Degradation Strategies

**1. Reduced Functionality Mode**

```python
class MedicationSystem:
    def __init__(self):
        self.ai_service_available = True
        self.ehr_integration_available = True
        self.medication_db_available = True
    
    def recommend_medication(self, patient, condition):
        # Check service availability
        if not self.ai_service_available:
            # Degrade to rule-based recommendations
            return self._rule_based_recommendation(patient, condition)
        
        if not self.ehr_integration_available:
            # Use cached patient data
            patient_data = self._get_cached_patient_data(patient.id)
            return self._recommend_with_cached_data(patient_data, condition)
        
        if not self.medication_db_available:
            # Use local medication list
            return self._recommend_with_local_db(patient, condition)
        
        # Full functionality
        return self._ai_recommendation(patient, condition)
```

**2. Fallback to Simpler Models**

```python
def get_recommendation(patient, condition):
    try:
        # Try advanced model
        return advanced_model.recommend(patient, condition)
    except ModelError:
        try:
            # Fallback to simpler model
            return simple_model.recommend(patient, condition)
        except ModelError:
            # Fallback to rule-based
            return rule_based_recommendation(patient, condition)
```

**3. Cached Data Mode**

```python
def get_patient_data(patient_id):
    try:
        # Try live EHR
        return ehr_service.get_patient(patient_id)
    except EHRUnavailable:
        # Use cached data with staleness warning
        cached_data = cache.get_patient(patient_id)
        if cached_data.age > 24_hours:
            return {
                "data": cached_data,
                "warning": "Using data from 24+ hours ago",
                "degraded": True
            }
        return cached_data
```

**4. Manual Override Mode**

```python
def process_medication_order(medication, dose):
    try:
        # Try automated processing
        return automated_order_processing(medication, dose)
    except SystemError:
        # Enable manual entry
        return {
            "status": "manual_mode",
            "message": "System unavailable. Please enter order manually.",
            "form": generate_manual_order_form(medication, dose)
        }
```

### Graceful Failure Patterns

**1. Fail-Safe Defaults**

```python
def calculate_dose(patient, medication):
    try:
        return ai_calculate_dose(patient, medication)
    except:
        # Fail-safe: Return conservative default
        return {
            "dose": medication.default_dose,
            "confidence": 0.0,
            "warning": "Using default dose. Manual review required.",
            "requires_approval": True
        }
```

**2. Fail-Closed for Safety**

```python
def process_critical_command(command):
    try:
        validated = validate_command(command)
        if validated:
            return execute_command(command)
        else:
            return reject_command("Validation failed")
    except:
        # Fail-closed: Reject if uncertain
        return reject_command("System error. Command rejected for safety.")
```

**3. Fail-Open with Warnings**

```python
def get_lab_results(patient_id):
    try:
        return fetch_lab_results(patient_id)
    except:
        # Fail-open: Allow access but warn
        return {
            "results": get_cached_results(patient_id),
            "warning": "Using cached results. May be outdated.",
            "timestamp": get_cache_timestamp(patient_id)
        }
```

---

## 5.4 Confidence Thresholds and Refusal Behaviors

### The Confidence Problem

AI systems often provide answers even when uncertain. In healthcare, this is dangerous.

### Confidence Thresholds

**Threshold Levels:**

**1. High Confidence (> 0.9)**
- Proceed with recommendation
- Still show confidence score
- Enable override

**2. Medium Confidence (0.7 - 0.9)**
- Show recommendation with warning
- Require confirmation
- Show alternatives

**3. Low Confidence (0.5 - 0.7)**
- Show recommendation with strong warning
- Require explicit approval
- Provide alternatives
- Suggest human consultation

**4. Very Low Confidence (< 0.5)**
- Refuse to make recommendation
- Escalate to human
- Provide available information
- Suggest alternative approaches

### Refusal Behaviors

**When to Refuse:**

1. **Confidence Too Low**
   - Below threshold for safety
   - Cannot determine correct answer
   - Multiple equally likely options

2. **Insufficient Information**
   - Missing critical data
   - Ambiguous inputs
   - Conflicting information

3. **Safety Concerns**
   - High-risk decision
   - Potential for harm
   - Regulatory requirement

4. **System Uncertainty**
   - Model uncertainty
   - Data quality issues
   - Integration problems

**How to Refuse:**

```python
def make_recommendation(patient, condition):
    confidence = calculate_confidence(patient, condition)
    
    if confidence < 0.5:
        return refuse_recommendation(
            reason="Insufficient confidence",
            confidence=confidence,
            available_info=summarize_available_info(patient, condition),
            suggestion="Please consult with a clinician",
            escalation=True
        )
    
    if confidence < 0.7:
        return conditional_recommendation(
            recommendation=calculate_recommendation(patient, condition),
            confidence=confidence,
            warning="Low confidence. Human review recommended.",
            requires_approval=True
        )
    
    return full_recommendation(
        recommendation=calculate_recommendation(patient, condition),
        confidence=confidence
    )
```

### Refusal Message Design

**Good Refusal:**
- Clear explanation of why
- What information is available
- What the system is uncertain about
- Suggested next steps
- Escalation path

**Example:**
```
"I cannot confidently recommend a medication because:
- Patient's renal function data is missing
- Multiple conditions present that may interact
- Medication history is incomplete

Available information:
- Patient has condition X
- Known allergies: Y, Z
- Current medications: A, B

Suggested next steps:
- Complete patient assessment
- Consult with pharmacist
- Review full medication history"
```

---

## 5.5 Logging "Near Misses"

### What Are Near Misses?

Near misses are incidents that could have caused harm but didn't, or incidents that were caught before causing harm.

### Why Log Near Misses?

1. **Learning Opportunity**
   - Identify potential problems before they cause harm
   - Understand system weaknesses
   - Improve safety mechanisms

2. **Pattern Detection**
   - Identify recurring issues
   - Detect systemic problems
   - Find common failure modes

3. **Preventive Action**
   - Fix issues before they cause harm
   - Improve system design
   - Enhance safety mechanisms

4. **Regulatory Compliance**
   - Demonstrate safety monitoring
   - Show proactive risk management
   - Support regulatory reviews

### Near Miss Categories

**1. Low Confidence Caught**
- System had low confidence
- Human caught and corrected
- Log: What was the issue? Why was confidence low?

**2. Override Patterns**
- Human overrode AI recommendation
- Log: What was overridden? Why? Was AI wrong?

**3. System Errors Caught**
- System error occurred
- Safety mechanism prevented harm
- Log: What was the error? How was it caught?

**4. Ambiguity Resolved**
- Ambiguous input resolved
- Log: What was ambiguous? How was it resolved?

**5. Edge Cases Handled**
- Unusual situation handled safely
- Log: What was unusual? How was it handled?

### Near Miss Logging Implementation

```python
class NearMissLogger:
    def log_near_miss(self, category, details):
        near_miss = {
            "timestamp": datetime.now(),
            "category": category,
            "details": details,
            "severity_potential": self._assess_potential_severity(details),
            "caught_by": details.get("caught_by", "system"),
            "resolution": details.get("resolution"),
            "system_state": self._capture_system_state()
        }
        
        # Store in database
        self.db.store_near_miss(near_miss)
        
        # Alert if high severity potential
        if near_miss["severity_potential"] >= 8:
            self._alert_safety_team(near_miss)
        
        # Analyze for patterns
        self._analyze_patterns(near_miss)

# Example usage
logger = NearMissLogger()

# Low confidence caught
logger.log_near_miss("low_confidence_caught", {
    "scenario": "medication_recommendation",
    "ai_confidence": 0.65,
    "ai_recommendation": "Medication X, 10mg",
    "human_action": "Reviewed and confirmed",
    "human_confidence": "High - confirmed correct",
    "caught_by": "clinician_review"
})

# Override pattern
logger.log_near_miss("human_override", {
    "scenario": "dosage_calculation",
    "ai_recommendation": "20mg",
    "human_override": "15mg",
    "reason": "Patient has renal impairment",
    "ai_missed": "Did not account for renal function"
})
```

### Near Miss Analysis

**Regular Analysis:**
- Weekly review of near misses
- Pattern identification
- Root cause analysis
- Action items

**Metrics:**
- Near miss rate
- Categories of near misses
- Severity distribution
- Resolution time
- Recurrence patterns

---

## 5.6 Practical: Conduct an FMEA

### Exercise: FMEA on Agentic or Voice System

**Objective:** Conduct a Failure Mode and Effects Analysis on an agentic or voice system component.

**Choose a system component:**

**Option A: Voice Recognition Component**
- ASR service
- NLU service
- Audio preprocessing

**Option B: Agent Decision Component**
- Recommendation agent
- Triage agent
- Documentation agent

**Option C: Integration Component**
- EHR integration
- Medication database integration
- Notification service

**FMEA Requirements:**

1. **Component Breakdown**
   - Identify sub-components
   - List functions
   - Identify interfaces

2. **Failure Mode Identification**
   - How can each component fail?
   - What are the failure modes?
   - What are edge cases?

3. **Effects Analysis**
   - What happens when it fails?
   - Impact on system
   - Impact on patients
   - Impact on workflow

4. **Cause Analysis**
   - Root causes
   - Contributing factors
   - Trigger conditions

5. **Risk Assessment**
   - Rate Severity (1-10)
   - Rate Occurrence (1-10)
   - Rate Detection (1-10)
   - Calculate RPN

6. **Mitigation Design**
   - Prevention strategies
   - Detection mechanisms
   - Impact mitigation
   - Recovery procedures

**Deliverable:** FMEA document including:
- Component breakdown
- Failure mode analysis table
- Risk prioritization
- Mitigation strategies
- Action plan

---

## 5.7 Artefact: Failure Mode & Mitigation Register

### Template: Failure Mode Register

Create a comprehensive register of failure modes and their mitigations.

**Structure:**

1. **System Overview**
   - System description
   - Components list
   - Critical functions

2. **FMEA Summary**
   - High-priority failure modes
   - Risk summary
   - Overall risk assessment

3. **Failure Mode Register**
   - Detailed failure mode analysis
   - Effects and causes
   - Risk ratings
   - Mitigation strategies

4. **Mitigation Implementation**
   - Current mitigations
   - Planned mitigations
   - Mitigation effectiveness
   - Residual risk

5. **Monitoring and Review**
   - How failures are detected
   - Review schedule
   - Update procedures
   - Learning from incidents

**Example Failure Mode Entry:**

```
Failure Mode: ASR Misrecognizes Medication Name

Component: Voice Recognition System
Function: Convert speech to text for medication names

Effect:
  - Wrong medication name in system
  - Potential for wrong medication order
  - Patient safety risk

Severity: 10 (Catastrophic)
Occurrence: 3 (Occasional)
Detection: 4 (Moderate)
RPN: 120 (High Priority)

Causes:
  - Similar-sounding medication names
  - Background noise
  - Accent or speech pattern
  - Fast speech

Current Mitigations:
  - Require spelling for medication names
  - Visual confirmation display
  - Medication database validation
  - Human approval required

Planned Mitigations:
  - Medical terminology fine-tuning
  - Multi-pass recognition
  - Confidence threshold increase to 0.95

Residual Risk: Medium (RPN: 60 after mitigations)

Monitoring:
  - Track misrecognition rate
  - Log near misses
  - Review override patterns
  - Monthly analysis
```

**Deliverable:** 8-12 page failure mode and mitigation register document.

---

## 5.8 Key Takeaways

**Safety Engineering Fundamentals:**
- Hazard analysis identifies potential sources of harm
- FMEA systematically analyzes failure modes
- Safe degradation enables continued operation during failures
- Confidence thresholds prevent overconfident recommendations
- Near miss logging enables proactive safety improvement

**Design Principles:**
- Engineer for worst-case scenarios, not just happy paths
- Multiple layers of safety mechanisms
- Fail-safe defaults for critical operations
- Refuse when uncertain rather than guess
- Learn from near misses to prevent incidents

**Next Steps:**
- **Conduct Hazard**: Conduct hazard analysis for your system
- **Perform Fmea**: Perform FMEA on critical components
- **degradation and failure handling Development**: Design degradation and failure handling
- **confidence thresholds and refusal behaviors Implementation**: Implement confidence thresholds and refusal behaviors
- **near miss logging and analysis Implementation**: Set up near miss logging and analysis

---

## Additional Resources

**Readings:**
- "Failure Mode and Effects Analysis" - FMEA methodology
- "Hazard Analysis in Healthcare" - Clinical safety
- "Safe AI Systems" - AI safety engineering
- "Near Miss Reporting" - Safety management

**Videos:**
- "FMEA for AI Systems" (40 min)
- "Safe Degradation Patterns" (30 min)

**Tools to Explore:**
- FMEA templates and tools
- Risk assessment frameworks
- Near miss tracking systems

**Next Module Preview:**
Module 6 will explore data, privacy, and governance by design, including data minimization, PHI separation, audit trails, and compliance.

---

**Module 5 Complete**  
**Next:** Module 6 - Data, Privacy & Governance by Design
