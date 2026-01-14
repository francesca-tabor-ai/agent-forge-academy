---
title: "Module 6: Data, Privacy & Governance by Design"
description: "Build systems that are compliant by construction"
module: "6"
order: 6
email_takeaway: "Data governance in healthcare AI requires data minimization, PHI separation, comprehensive audit trails, and compliance by design."
email_action: "Design a data flow that separates PHI from generative components and includes audit trails."
---

# Module 6: Data, Privacy & Governance by Design

**Duration:** Week 6-7  
**Learning Objectives:**
- Implement data minimization and purpose limitation
- Separate PHI from generative components
- Design comprehensive audit trails and traceability
- Implement consent, access control, and retention policies
- Support DPIAs and audits through engineering choices

---

## 6.1 Data Minimisation and Purpose Limitation

### The Principles

**Data Minimisation:**
- Collect only data necessary for the purpose
- Don't collect "just in case" data
- Delete data when no longer needed
- Use anonymized data where possible

**Purpose Limitation:**
- Use data only for stated purpose
- Don't repurpose data without consent
- Clear purpose statements
- Enforce purpose boundaries

### Data Classification

**1. Required Data (Must Have)**
- Essential for function
- Cannot operate without
- Minimal set needed
- Example: Patient ID for medication lookup

**2. Optional Data (Nice to Have)**
- Improves function but not essential
- Can operate without
- Requires justification
- Example: Patient preferences for personalization

**3. Prohibited Data (Must Not Have)**
- Not needed for function
- Privacy/security risk
- Regulatory restriction
- Example: Genetic data for medication reminder system

### Implementation

**Data Collection Design:**

```python
class MedicationAgent:
    def __init__(self):
        # Define required data
        self.required_data = [
            "patient_id",
            "medication_name",
            "current_medications"  # For interaction checking
        ]
        
        # Define optional data
        self.optional_data = [
            "patient_preferences",
            "medication_history"  # Improves recommendations
        ]
        
        # Define prohibited data
        self.prohibited_data = [
            "genetic_data",
            "psychiatric_notes",
            "social_history"  # Not needed for medication management
        ]
    
    def process_request(self, request):
        # Validate data collection
        collected_data = self._extract_data(request)
        
        # Check for prohibited data
        if any(key in self.prohibited_data for key in collected_data):
            raise ProhibitedDataError("Cannot collect prohibited data")
        
        # Check required data present
        if not all(key in collected_data for key in self.required_data):
            raise MissingRequiredDataError("Required data missing")
        
        # Use only required + explicitly consented optional data
        data_to_use = {
            k: v for k, v in collected_data.items()
            if k in self.required_data or 
               (k in self.optional_data and self._has_consent(k))
        }
        
        return self._process_with_minimal_data(data_to_use)
```

**Purpose Enforcement:**

```python
class DataProcessor:
    def __init__(self):
        self.data_purposes = {
            "patient_id": ["medication_lookup", "allergy_check"],
            "medication_name": ["interaction_check", "dose_calculation"],
            "lab_results": ["dose_adjustment"]  # Cannot use for other purposes
        }
    
    def use_data(self, data_key, purpose):
        # Check if data can be used for this purpose
        allowed_purposes = self.data_purposes.get(data_key, [])
        
        if purpose not in allowed_purposes:
            raise PurposeViolationError(
                f"Data {data_key} cannot be used for {purpose}. "
                f"Allowed purposes: {allowed_purposes}"
            )
        
        # Log data usage
        self._log_data_usage(data_key, purpose)
        
        return self._process(data_key, purpose)
```

---

## 6.2 Separation of PHI and Generative Components

### The Critical Separation

**Problem:** Generative AI components (LLMs) should not have direct access to PHI.

**Solution:** Separate PHI processing from generative components.

### Architecture Pattern

**Traditional (Unsafe):**
```
PHI → LLM → Response
```

**Safe Pattern:**
```
PHI → PHI Processor → Structured Data → LLM → Response
         ↓
    [PHI Storage]
```

### Implementation

**1. PHI Extraction and Anonymization**

```python
class PHIProcessor:
    def extract_phi(self, text):
        # Extract PHI using NER
        phi_entities = self.ner_model.extract(text)
        
        # Replace with tokens
        anonymized_text = self._replace_with_tokens(text, phi_entities)
        
        # Store mapping separately (encrypted)
        phi_mapping = self._store_phi_mapping(phi_entities)
        
        return {
            "anonymized_text": anonymized_text,
            "phi_tokens": phi_entities,
            "mapping_id": phi_mapping.id
        }
    
    def de_anonymize(self, response, mapping_id):
        # Retrieve PHI mapping
        phi_mapping = self._retrieve_phi_mapping(mapping_id)
        
        # Replace tokens with PHI
        de_anonymized = self._replace_tokens_with_phi(response, phi_mapping)
        
        return de_anonymized
```

**2. Structured Data Interface**

```python
class GenerativeComponent:
    def __init__(self):
        # LLM never sees PHI directly
        self.llm = LLM()
        self.phi_processor = PHIProcessor()
    
    def process(self, input_text):
        # Step 1: Extract and anonymize PHI
        phi_data = self.phi_processor.extract_phi(input_text)
        anonymized_input = phi_data["anonymized_text"]
        
        # Step 2: Process with LLM (no PHI)
        llm_response = self.llm.process(anonymized_input)
        
        # Step 3: De-anonymize response
        final_response = self.phi_processor.de_anonymize(
            llm_response,
            phi_data["mapping_id"]
        )
        
        return final_response
```

**3. PHI Storage Separation**

```python
class PHIStorage:
    def __init__(self):
        # Separate encrypted storage for PHI
        self.phi_db = EncryptedDatabase()
        self.anonymized_db = RegularDatabase()
    
    def store(self, phi_data, anonymized_data):
        # Store PHI in encrypted database
        phi_id = self.phi_db.store_encrypted(phi_data)
        
        # Store anonymized data in regular database
        self.anonymized_db.store({
            "anonymized": anonymized_data,
            "phi_id": phi_id  # Reference only, not PHI
        })
        
        return phi_id
```

### Data Flow Design

**Safe Data Flow:**

```
1. Input with PHI
   ↓
2. PHI Extraction Layer
   - Extract PHI
   - Anonymize
   - Store PHI separately (encrypted)
   ↓
3. Anonymized Data
   ↓
4. Generative Component (LLM)
   - Processes anonymized data only
   - No PHI access
   ↓
5. Generated Response (anonymized)
   ↓
6. De-anonymization Layer
   - Retrieve PHI mapping
   - Replace tokens with PHI
   ↓
7. Final Response (with PHI restored)
```

**Key Points:**
- LLM never sees PHI
- PHI stored separately and encrypted
- Only tokens passed to LLM
- De-anonymization happens after generation

---

## 6.3 Audit Trails and Traceability

### Why Audit Trails Matter

**Regulatory Requirements:**
- HIPAA requires audit trails
- GDPR requires data processing logs
- FDA requires device audit logs
- Clinical governance requires traceability

**Operational Needs:**
- Debug issues
- Investigate incidents
- Support compliance audits
- Learn from usage patterns

### What to Audit

**1. Data Access**
- Who accessed what data
- When was it accessed
- Why was it accessed
- What was the result

**2. System Actions**
- What actions were taken
- Who initiated the action
- What was the input
- What was the output

**3. AI Decisions**
- What recommendation was made
- What was the confidence
- What data was used
- Why was this decision made

**4. Human Interactions**
- What did humans override
- What approvals were given
- What modifications were made
- What escalations occurred

**5. Data Changes**
- What data was modified
- Who modified it
- When was it modified
- What was the change

### Audit Trail Implementation

```python
class AuditLogger:
    def __init__(self):
        self.audit_db = AuditDatabase()
        self.encryption = EncryptionService()
    
    def log_data_access(self, user_id, data_type, data_id, purpose, result):
        audit_entry = {
            "timestamp": datetime.now(),
            "event_type": "data_access",
            "user_id": user_id,
            "data_type": data_type,
            "data_id": data_id,
            "purpose": purpose,
            "result": result,
            "ip_address": self._get_ip_address(),
            "session_id": self._get_session_id()
        }
        
        # Encrypt sensitive fields
        audit_entry = self.encryption.encrypt_audit_entry(audit_entry)
        
        # Store in audit database
        self.audit_db.store(audit_entry)
    
    def log_ai_decision(self, agent_id, decision, confidence, inputs, reasoning):
        audit_entry = {
            "timestamp": datetime.now(),
            "event_type": "ai_decision",
            "agent_id": agent_id,
            "decision": decision,
            "confidence": confidence,
            "inputs": self._anonymize_inputs(inputs),
            "reasoning": reasoning,
            "model_version": self._get_model_version()
        }
        
        self.audit_db.store(audit_entry)
    
    def log_human_override(self, user_id, ai_decision, human_decision, reason):
        audit_entry = {
            "timestamp": datetime.now(),
            "event_type": "human_override",
            "user_id": user_id,
            "ai_decision": ai_decision,
            "human_decision": human_decision,
            "reason": reason
        }
        
        self.audit_db.store(audit_entry)
```

### Traceability Requirements

**1. Complete Chain of Custody**
- Track data from collection to deletion
- Know where data is at all times
- Track all transformations
- Record all access

**2. Decision Traceability**
- Why was this decision made?
- What data was used?
- What was the reasoning?
- Who approved it?

**3. Change Traceability**
- What changed?
- Who changed it?
- When did it change?
- Why did it change?

**4. Incident Traceability**
- What happened?
- When did it happen?
- Who was involved?
- What was the impact?

---

## 6.4 Consent, Access Control, and Retention

### Consent Management

**Types of Consent:**

**1. Explicit Consent**
- Clear opt-in
- Specific purpose stated
- Can be withdrawn
- Example: "I consent to AI-assisted medication management"

**2. Implied Consent**
- Consent inferred from action
- Limited scope
- Example: Using voice system implies consent for voice processing

**3. Opt-Out Consent**
- Default consent with opt-out
- Must be easy to opt-out
- Example: Research use of anonymized data

**Consent Implementation:**

```python
class ConsentManager:
    def __init__(self):
        self.consent_db = ConsentDatabase()
    
    def check_consent(self, patient_id, purpose, data_type):
        consent = self.consent_db.get_consent(patient_id, purpose, data_type)
        
        if not consent or not consent.is_valid():
            raise ConsentRequiredError(
                f"Consent required for {purpose} with {data_type}"
            )
        
        if consent.is_expired():
            raise ConsentExpiredError("Consent has expired")
        
        return consent
    
    def record_consent(self, patient_id, purpose, data_type, consent_details):
        consent = {
            "patient_id": patient_id,
            "purpose": purpose,
            "data_type": data_type,
            "consent_given": True,
            "timestamp": datetime.now(),
            "expiry": self._calculate_expiry(consent_details),
            "withdrawable": consent_details.get("withdrawable", True)
        }
        
        self.consent_db.store(consent)
    
    def withdraw_consent(self, patient_id, purpose, data_type):
        consent = self.consent_db.get_consent(patient_id, purpose, data_type)
        
        if consent:
            consent.withdraw()
            self.consent_db.update(consent)
            
            # Trigger data deletion if required
            if consent.requires_deletion_on_withdrawal:
                self._trigger_data_deletion(patient_id, data_type)
```

### Access Control

**Role-Based Access Control (RBAC):**

```python
class AccessControl:
    def __init__(self):
        self.roles = {
            "clinician": ["read_patient_data", "create_orders", "view_ai_recommendations"],
            "nurse": ["read_patient_data", "view_ai_recommendations"],
            "pharmacist": ["read_patient_data", "review_medications", "override_ai"],
            "admin": ["read_audit_logs", "manage_users"],
            "patient": ["read_own_data", "view_own_recommendations"]
        }
    
    def check_access(self, user_id, action, resource):
        user_role = self._get_user_role(user_id)
        allowed_actions = self.roles.get(user_role, [])
        
        if action not in allowed_actions:
            raise AccessDeniedError(
                f"User {user_id} with role {user_role} cannot {action}"
            )
        
        # Additional resource-level checks
        if not self._check_resource_access(user_id, resource):
            raise AccessDeniedError(f"Access denied to resource {resource}")
        
        # Log access
        self._log_access(user_id, action, resource)
        
        return True
```

**Attribute-Based Access Control (ABAC):**

```python
class ABAC:
    def check_access(self, user, action, resource, context):
        # Check user attributes
        if not self._check_user_attributes(user, action):
            return False
        
        # Check resource attributes
        if not self._check_resource_attributes(resource, action):
            return False
        
        # Check context (time, location, etc.)
        if not self._check_context(context, action):
            return False
        
        # Check policies
        policies = self._get_applicable_policies(user, resource, context)
        for policy in policies:
            if not policy.evaluate(user, action, resource, context):
                return False
        
        return True
```

### Data Retention

**Retention Policies:**

```python
class RetentionManager:
    def __init__(self):
        self.retention_policies = {
            "patient_data": timedelta(days=365 * 7),  # 7 years
            "audit_logs": timedelta(days=365 * 10),   # 10 years
            "ai_decisions": timedelta(days=365 * 5),   # 5 years
            "temporary_data": timedelta(days=30),     # 30 days
            "research_data": timedelta(days=365 * 20) # 20 years (anonymized)
        }
    
    def apply_retention(self, data_type, data_id):
        policy = self.retention_policies.get(data_type)
        
        if not policy:
            raise RetentionPolicyError(f"No retention policy for {data_type}")
        
        # Calculate expiry
        expiry = datetime.now() + policy
        
        # Set expiry
        self._set_expiry(data_type, data_id, expiry)
    
    def cleanup_expired_data(self):
        expired_data = self._get_expired_data()
        
        for data in expired_data:
            # Check if data can be deleted
            if self._can_delete(data):
                self._delete_data(data)
            else:
                # Anonymize instead of delete
                self._anonymize_data(data)
```

---

## 6.5 Supporting DPIAs and Audits

### Data Protection Impact Assessment (DPIA)

**What Is a DPIA?**
- Assessment of data processing risks
- Required for high-risk processing
- Demonstrates compliance
- Guides system design

**Engineering Support for DPIA:**

**1. Data Flow Documentation**
- Clear data flow diagrams
- Data processing steps
- Data storage locations
- Data sharing points

**2. Risk Documentation**
- Identified risks
- Mitigation measures
- Residual risks
- Monitoring plans

**3. Technical Safeguards**
- Encryption implementation
- Access controls
- Audit logging
- Data minimization

**4. Compliance Evidence**
- Consent mechanisms
- Retention policies
- Deletion procedures
- Breach response plans

### Audit Support

**What Auditors Need:**

**1. Access to Audit Logs**
- Comprehensive logging
- Searchable logs
- Export capabilities
- Long-term retention

**2. System Documentation**
- Architecture diagrams
- Data flow diagrams
- Security controls
- Compliance measures

**3. Evidence of Controls**
- Access control implementation
- Encryption evidence
- Consent records
- Retention compliance

**4. Incident Records**
- Security incidents
- Data breaches
- Near misses
- Remediation actions

**Audit-Ready Implementation:**

```python
class AuditSupport:
    def generate_audit_report(self, start_date, end_date):
        report = {
            "period": {"start": start_date, "end": end_date},
            "data_access": self._summarize_data_access(start_date, end_date),
            "ai_decisions": self._summarize_ai_decisions(start_date, end_date),
            "human_interactions": self._summarize_human_interactions(start_date, end_date),
            "security_events": self._summarize_security_events(start_date, end_date),
            "compliance_checks": self._run_compliance_checks(),
            "data_retention": self._check_retention_compliance(),
            "consent_status": self._check_consent_compliance()
        }
        
        return report
    
    def export_audit_logs(self, filters, format="json"):
        logs = self.audit_db.query(filters)
        
        if format == "json":
            return json.dumps(logs, default=str)
        elif format == "csv":
            return self._convert_to_csv(logs)
        elif format == "pdf":
            return self._generate_pdf_report(logs)
```

---

## 6.6 Practical: Design a Compliant Data Flow

### Exercise: Data Flow Design

**Objective:** Design a data flow that passes governance review, separating PHI from generative components and including audit trails.

**Choose a use case:**

**Option A: AI-Assisted Diagnosis**
- Patient data → AI analysis → Diagnosis recommendation
- Must separate PHI from LLM
- Must audit all decisions

**Option B: Medication Management**
- Patient data → Interaction checking → Recommendations
- Must minimize data collection
- Must track all access

**Option C: Clinical Documentation**
- Voice input → Documentation generation → EHR storage
- Must handle PHI properly
- Must maintain audit trail

**Design Requirements:**

1. **Data Minimization**
   - Identify required vs optional data
   - Define data collection limits
   - Implement purpose limitation

2. **PHI Separation**
   - Design PHI extraction layer
   - Separate PHI storage
   - Anonymize for LLM processing
   - De-anonymize responses

3. **Audit Trails**
   - Define what to audit
   - Design audit logging
   - Plan retention
   - Design audit reporting

4. **Access Control**
   - Define roles and permissions
   - Implement access checks
   - Log all access
   - Plan consent management

5. **Retention and Deletion**
   - Define retention policies
   - Implement deletion procedures
   - Plan anonymization strategies
   - Design data lifecycle

**Deliverable:** Data flow design document including:
- Data flow diagram
- PHI separation architecture
- Audit trail design
- Access control design
- Retention and deletion procedures
- Compliance checklist

---

## 6.7 Artefact: Data Flow Diagram + Auditability Notes

### Template: Data Governance Design Document

Create a comprehensive data governance design document.

**Structure:**

1. **Data Flow Overview**
   - High-level data flow
   - Data sources
   - Data destinations
   - Processing steps

2. **Data Classification**
   - Data types and classifications
   - Required vs optional data
   - Prohibited data
   - Sensitive data handling

3. **PHI Separation Design**
   - PHI extraction architecture
   - Anonymization process
   - PHI storage design
   - De-anonymization process

4. **Audit Trail Design**
   - What is audited
   - Audit logging implementation
   - Audit storage
   - Audit reporting

5. **Access Control Design**
   - Role definitions
   - Permission matrix
   - Access control implementation
   - Consent management

6. **Retention and Deletion**
   - Retention policies
   - Deletion procedures
   - Anonymization strategies
   - Data lifecycle

7. **Compliance Support**
   - DPIA support
   - Audit readiness
   - Regulatory compliance
   - Evidence collection

**Example Data Flow Diagram:**

```
[Patient Input]
    ↓
[PHI Extraction Layer]
    ├─ Extract PHI → [Encrypted PHI Storage]
    └─ Anonymize → [Anonymized Data]
         ↓
[Generative Component (LLM)]
    - Processes anonymized data only
    - No PHI access
         ↓
[Generated Response (Anonymized)]
         ↓
[De-anonymization Layer]
    - Retrieve PHI mapping
    - Replace tokens
         ↓
[Final Response]
    ↓
[Audit Logging]
    - Log all steps
    - Track data access
    - Record decisions
```

**Auditability Notes:**

- All data access logged with user, timestamp, purpose
- All AI decisions logged with inputs, outputs, confidence
- All PHI access requires audit trail
- All consent actions logged
- All data modifications tracked
- Audit logs retained for 10 years
- Audit logs encrypted and access-controlled

**Deliverable:** 10-15 page data flow diagram and auditability notes document.

---

## 6.8 Key Takeaways

**Data Governance Fundamentals:**
- Data minimization: collect only what's needed
- Purpose limitation: use data only for stated purpose
- PHI separation: keep PHI away from generative components
- Comprehensive audit trails: log everything important
- Access control: enforce permissions and consent

**Design Principles:**
- Compliance by design, not afterthought
- Separate PHI processing from generative AI
- Comprehensive audit logging from the start
- Clear retention and deletion policies
- Support DPIAs and audits through engineering

**Next Steps:**
- Apply data minimization to your system
- Design PHI separation architecture
- Implement comprehensive audit trails
- Set up access control and consent management
- Plan retention and deletion procedures

---

## Additional Resources

**Readings:**
- "HIPAA Compliance for AI Systems" - Healthcare privacy
- "GDPR and AI" - European data protection
- "Data Protection Impact Assessments" - DPIA guidance
- "Healthcare Data Governance" - Clinical data management

**Videos:**
- "PHI Separation in AI Systems" (35 min)
- "Audit Trails for Healthcare AI" (30 min)

**Tools to Explore:**
- PHI detection and anonymization tools
- Audit logging frameworks
- Consent management systems
- Data retention tools

**Next Module Preview:**
Module 7 will explore architectures for safe LLM systems, including RAG with approved content, model selection, prompt versioning, and tool sandboxing.

---

**Module 6 Complete**  
**Next:** Module 7 - Architectures for Safe LLM Systems
