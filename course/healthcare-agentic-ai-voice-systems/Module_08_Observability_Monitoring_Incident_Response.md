---
title: "Module 8: Observability, Monitoring & Incident Response"
description: "Detect problems before clinicians do"
module: "8"
order: 8
email_takeaway: "AI observability requires logging the right things, monitoring hallucinations and refusals, detecting drift, and having incident response playbooks."
email_action: "Design an observability strategy for an AI system with 5 key metrics and 3 alert conditions."
---

# Module 8: Observability, Monitoring & Incident Response

**Duration:** Week 8-9  
**Learning Objectives:**
- Design what to log in AI systems (and what not to)
- Monitor hallucinations, refusals, and escalations
- Detect drift and behavioral change
- Create incident response playbooks for AI systems
- Support clinical and regulatory investigations

---

## 8.1 What to Log in AI Systems (and What Not to)

### The Logging Challenge

**Too Little Logging:**
- Can't debug issues
- Can't investigate incidents
- Can't support audits
- Can't learn from failures

**Too Much Logging:**
- Privacy risks
- Performance impact
- Storage costs
- Noise obscures signals

### What to Log

**1. System Operations**
- Service health and availability
- Request/response times
- Error rates and types
- Resource usage

**2. AI Decisions**
- Inputs (anonymized)
- Model outputs
- Confidence scores
- Reasoning (if available)

**3. User Interactions**
- User actions
- Overrides and modifications
- Escalations
- Feedback

**4. Safety Events**
- Low confidence detections
- Refusals and escalations
- Near misses
- Safety violations

**5. Data Access**
- Who accessed what data
- When and why
- What was the result
- Consent status

**6. System Changes**
- Configuration changes
- Model updates
- Prompt changes
- Deployment events

### What NOT to Log

**1. PHI in Plain Text**
- Don't log PHI unencrypted
- Don't log full patient records
- Don't log in searchable logs
- Use tokens or hashes instead

**2. Excessive Detail**
- Don't log every intermediate step
- Don't log full conversation history
- Don't log redundant information
- Log summaries instead

**3. Sensitive Credentials**
- Don't log passwords
- Don't log API keys
- Don't log tokens
- Don't log encryption keys

**4. Personal Information**
- Don't log unnecessary PII
- Don't log user locations
- Don't log browsing history
- Minimize personal data

### Logging Implementation

```python
class AILogger:
    def __init__(self):
        self.logger = StructuredLogger()
        self.phi_scrubber = PHIScrubber()
    
    def log_ai_decision(self, inputs, outputs, confidence, model_version):
        # Scrub PHI from inputs
        sanitized_inputs = self.phi_scrubber.scrub(inputs)
        
        log_entry = {
            "timestamp": datetime.now(),
            "event_type": "ai_decision",
            "inputs": sanitized_inputs,  # PHI removed
            "outputs": outputs,
            "confidence": confidence,
            "model_version": model_version,
            "session_id": self._get_session_id(),
            "user_id": self._hash_user_id()  # Hashed, not plain
        }
        
        self.logger.log(log_entry)
    
    def log_safety_event(self, event_type, details):
        log_entry = {
            "timestamp": datetime.now(),
            "event_type": "safety_event",
            "safety_type": event_type,  # "low_confidence", "refusal", "escalation"
            "details": self._sanitize_details(details),
            "severity": self._assess_severity(event_type, details)
        }
        
        self.logger.log(log_entry)
        
        # Alert if high severity
        if log_entry["severity"] >= 8:
            self._alert_safety_team(log_entry)
    
    def log_user_interaction(self, user_id, action, result):
        log_entry = {
            "timestamp": datetime.now(),
            "event_type": "user_interaction",
            "user_id": self._hash_user_id(user_id),  # Hashed
            "action": action,
            "result": result,
            "session_id": self._get_session_id()
        }
        
        self.logger.log(log_entry)
```

---

## 8.2 Monitoring Hallucinations, Refusals, and Escalations

### Monitoring AI Behavior

**Key Metrics to Monitor:**

**1. Hallucination Rate**
- How often does the model make up information?
- How often does it cite non-existent sources?
- How often does it provide incorrect medical information?

**2. Refusal Rate**
- How often does the model refuse to answer?
- What are the refusal reasons?
- Are refusals appropriate?

**3. Escalation Rate**
- How often are cases escalated to humans?
- What are the escalation reasons?
- Are escalations timely?

**4. Confidence Distribution**
- What is the confidence score distribution?
- Are we seeing more low-confidence responses?
- Is confidence calibrated correctly?

### Hallucination Monitoring

```python
class HallucinationMonitor:
    def __init__(self):
        self.hallucination_detector = HallucinationDetector()
        self.metrics = MetricsCollector()
    
    def monitor_response(self, response, sources, context):
        # Check for hallucinations
        hallucination_score = self.hallucination_detector.detect(
            response, sources, context
        )
        
        # Log if hallucination detected
        if hallucination_score > 0.7:
            self._log_hallucination(response, sources, hallucination_score)
            self.metrics.increment("hallucinations.detected")
        
        # Track metrics
        self.metrics.record("hallucination_score", hallucination_score)
        self.metrics.record("response_length", len(response))
        self.metrics.record("source_count", len(sources))
        
        # Alert if rate too high
        if self.metrics.get_rate("hallucinations.detected") > 0.05:  # 5%
            self._alert_high_hallucination_rate()
    
    def _log_hallucination(self, response, sources, score):
        log_entry = {
            "timestamp": datetime.now(),
            "event_type": "hallucination_detected",
            "response": response,
            "sources": sources,
            "hallucination_score": score,
            "severity": "high" if score > 0.9 else "medium"
        }
        
        self.logger.log(log_entry)
```

### Refusal Monitoring

```python
class RefusalMonitor:
    def __init__(self):
        self.metrics = MetricsCollector()
    
    def monitor_refusal(self, refusal_reason, confidence, context):
        # Track refusal
        self.metrics.increment("refusals.total")
        self.metrics.increment(f"refusals.{refusal_reason}")
        
        # Record details
        self.metrics.record("refusal_confidence", confidence)
        
        # Log refusal
        log_entry = {
            "timestamp": datetime.now(),
            "event_type": "refusal",
            "reason": refusal_reason,
            "confidence": confidence,
            "context": self._sanitize_context(context)
        }
        
        self.logger.log(log_entry)
        
        # Alert if refusal rate too high
        refusal_rate = self.metrics.get_rate("refusals.total")
        if refusal_rate > 0.2:  # 20% refusal rate
            self._alert_high_refusal_rate(refusal_rate, refusal_reason)
    
    def analyze_refusal_patterns(self):
        # Analyze refusal patterns
        patterns = {
            "low_confidence": self.metrics.get_count("refusals.low_confidence"),
            "insufficient_data": self.metrics.get_count("refusals.insufficient_data"),
            "safety_concern": self.metrics.get_count("refusals.safety_concern"),
            "prohibited_query": self.metrics.get_count("refusals.prohibited_query")
        }
        
        return patterns
```

### Escalation Monitoring

```python
class EscalationMonitor:
    def __init__(self):
        self.metrics = MetricsCollector()
    
    def monitor_escalation(self, escalation_reason, urgency, response_time):
        # Track escalation
        self.metrics.increment("escalations.total")
        self.metrics.increment(f"escalations.{escalation_reason}")
        
        # Track response time
        self.metrics.record("escalation_response_time", response_time)
        
        # Log escalation
        log_entry = {
            "timestamp": datetime.now(),
            "event_type": "escalation",
            "reason": escalation_reason,
            "urgency": urgency,
            "response_time": response_time
        }
        
        self.logger.log(log_entry)
        
        # Alert if urgent escalation delayed
        if urgency == "urgent" and response_time > 300:  # 5 minutes
            self._alert_delayed_escalation(escalation_reason, response_time)
        
        # Alert if escalation rate too high
        escalation_rate = self.metrics.get_rate("escalations.total")
        if escalation_rate > 0.15:  # 15% escalation rate
            self._alert_high_escalation_rate(escalation_rate)
```

---

## 8.3 Drift Detection and Behavioral Change

### What Is Drift?

**Data Drift:**
- Input data distribution changes
- Patient population changes
- Clinical patterns change

**Model Drift:**
- Model performance degrades
- Model behavior changes
- Predictions become less accurate

**Concept Drift:**
- Underlying relationships change
- Medical knowledge updates
- Clinical guidelines change

### Drift Detection

```python
class DriftDetector:
    def __init__(self):
        self.baseline_distribution = None
        self.metrics = MetricsCollector()
    
    def detect_data_drift(self, current_data, baseline_data=None):
        if baseline_data is None:
            baseline_data = self.baseline_distribution
        
        # Compare distributions
        drift_score = self._compare_distributions(current_data, baseline_data)
        
        # Track drift
        self.metrics.record("data_drift_score", drift_score)
        
        # Alert if significant drift
        if drift_score > 0.3:  # 30% drift
            self._alert_data_drift(drift_score)
        
        return drift_score
    
    def detect_model_drift(self, predictions, ground_truth=None):
        # Compare current performance to baseline
        if ground_truth is not None:
            current_accuracy = self._calculate_accuracy(predictions, ground_truth)
            baseline_accuracy = self.metrics.get_baseline("accuracy")
            
            accuracy_drop = baseline_accuracy - current_accuracy
            
            if accuracy_drop > 0.05:  # 5% drop
                self._alert_model_drift(accuracy_drop)
        
        # Detect prediction distribution changes
        prediction_distribution = self._get_distribution(predictions)
        baseline_distribution = self.metrics.get_baseline("prediction_distribution")
        
        drift_score = self._compare_distributions(
            prediction_distribution, baseline_distribution
        )
        
        if drift_score > 0.2:  # 20% drift
            self._alert_prediction_drift(drift_score)
    
    def detect_behavioral_change(self, behavior_metrics):
        # Monitor key behavioral metrics
        metrics_to_monitor = [
            "confidence_distribution",
            "refusal_rate",
            "escalation_rate",
            "response_time"
        ]
        
        changes = {}
        for metric in metrics_to_monitor:
            current = behavior_metrics.get(metric)
            baseline = self.metrics.get_baseline(metric)
            
            if baseline:
                change = abs(current - baseline) / baseline
                if change > 0.1:  # 10% change
                    changes[metric] = change
                    self._alert_behavioral_change(metric, change)
        
        return changes
```

### Continuous Monitoring

```python
class ContinuousMonitor:
    def __init__(self):
        self.drift_detector = DriftDetector()
        self.monitoring_interval = timedelta(hours=1)
    
    def start_monitoring(self):
        while True:
            # Collect current metrics
            current_metrics = self._collect_metrics()
            
            # Detect drift
            data_drift = self.drift_detector.detect_data_drift(
                current_metrics["data_distribution"]
            )
            model_drift = self.drift_detector.detect_model_drift(
                current_metrics["predictions"]
            )
            behavioral_change = self.drift_detector.detect_behavioral_change(
                current_metrics["behavior"]
            )
            
            # Update baselines if no significant drift
            if data_drift < 0.1 and model_drift < 0.1:
                self._update_baselines(current_metrics)
            
            # Wait for next interval
            time.sleep(self.monitoring_interval.total_seconds())
```

---

## 8.4 Incident Response Playbooks for AI Systems

### Incident Types

**1. Model Failure**
- Model produces incorrect outputs
- Model crashes or errors
- Model performance degrades

**2. Data Issues**
- Data quality problems
- Data leakage
- Data corruption

**3. Security Incidents**
- Unauthorized access
- Data breach
- System compromise

**4. Safety Incidents**
- Harmful recommendation
- Missed critical finding
- System malfunction

**5. Performance Issues**
- System slowdown
- High error rate
- Resource exhaustion

### Incident Response Playbook

**Phase 1: Detection**

```python
class IncidentDetector:
    def detect_incident(self, metrics, logs):
        incidents = []
        
        # Check for model failures
        if metrics.get("error_rate") > 0.1:  # 10% error rate
            incidents.append({
                "type": "model_failure",
                "severity": "high",
                "details": "High error rate detected"
            })
        
        # Check for safety incidents
        if metrics.get("harmful_recommendations") > 0:
            incidents.append({
                "type": "safety_incident",
                "severity": "critical",
                "details": "Harmful recommendations detected"
            })
        
        # Check for data issues
        if metrics.get("data_quality_score") < 0.7:
            incidents.append({
                "type": "data_issue",
                "severity": "medium",
                "details": "Data quality degraded"
            })
        
        return incidents
```

**Phase 2: Assessment**

```python
class IncidentAssessor:
    def assess_incident(self, incident):
        assessment = {
            "incident_id": self._generate_id(),
            "type": incident["type"],
            "severity": incident["severity"],
            "detected_at": datetime.now(),
            "affected_systems": self._identify_affected_systems(incident),
            "impact": self._assess_impact(incident),
            "root_cause": None,  # To be determined
            "status": "assessing"
        }
        
        return assessment
```

**Phase 3: Containment**

```python
class IncidentContainment:
    def contain_incident(self, incident):
        containment_actions = []
        
        if incident["type"] == "model_failure":
            # Disable affected model
            containment_actions.append({
                "action": "disable_model",
                "model_id": incident.get("model_id"),
                "fallback": "use_backup_model"
            })
        
        elif incident["type"] == "safety_incident":
            # Enable additional safety checks
            containment_actions.append({
                "action": "enable_strict_safety",
                "require_human_approval": True
            })
        
        elif incident["type"] == "data_issue":
            # Stop processing affected data
            containment_actions.append({
                "action": "quarantine_data",
                "data_source": incident.get("data_source")
            })
        
        # Execute containment actions
        for action in containment_actions:
            self._execute_action(action)
        
        return containment_actions
```

**Phase 4: Investigation**

```python
class IncidentInvestigator:
    def investigate(self, incident):
        investigation = {
            "incident_id": incident["incident_id"],
            "investigation_start": datetime.now(),
            "root_cause_analysis": self._perform_rca(incident),
            "timeline": self._reconstruct_timeline(incident),
            "affected_users": self._identify_affected_users(incident),
            "data_collected": self._collect_evidence(incident)
        }
        
        return investigation
```

**Phase 5: Remediation**

```python
class IncidentRemediation:
    def remediate(self, incident, investigation):
        remediation_plan = {
            "incident_id": incident["incident_id"],
            "remediation_steps": [],
            "prevention_measures": []
        }
        
        # Determine remediation steps based on root cause
        root_cause = investigation["root_cause_analysis"]["root_cause"]
        
        if root_cause == "model_bug":
            remediation_plan["remediation_steps"].append({
                "step": "fix_model",
                "action": "deploy_fixed_model",
                "testing": "comprehensive_testing"
            })
        
        elif root_cause == "data_quality":
            remediation_plan["remediation_steps"].append({
                "step": "fix_data",
                "action": "clean_and_validate_data",
                "prevention": "improve_data_validation"
            })
        
        # Execute remediation
        for step in remediation_plan["remediation_steps"]:
            self._execute_remediation_step(step)
        
        return remediation_plan
```

**Phase 6: Communication**

```python
class IncidentCommunicator:
    def communicate(self, incident, stakeholders):
        communications = []
        
        # Notify clinical team
        if incident["severity"] in ["high", "critical"]:
            communications.append({
                "to": "clinical_team",
                "message": self._generate_clinical_notification(incident),
                "urgency": "high"
            })
        
        # Notify IT team
        communications.append({
            "to": "it_team",
            "message": self._generate_it_notification(incident),
            "urgency": "medium"
        })
        
        # Notify compliance (if required)
        if incident["type"] in ["data_breach", "safety_incident"]:
            communications.append({
                "to": "compliance_team",
                "message": self._generate_compliance_notification(incident),
                "urgency": "high"
            })
        
        # Send communications
        for comm in communications:
            self._send_notification(comm)
        
        return communications
```

**Phase 7: Post-Incident**

```python
class PostIncidentProcessor:
    def process_post_incident(self, incident):
        # Generate post-incident report
        report = {
            "incident_id": incident["incident_id"],
            "summary": self._generate_summary(incident),
            "root_cause": incident["root_cause"],
            "remediation": incident["remediation"],
            "lessons_learned": self._extract_lessons(incident),
            "prevention_measures": self._identify_preventions(incident),
            "follow_up_actions": self._identify_follow_ups(incident)
        }
        
        # Update playbooks based on lessons learned
        self._update_playbooks(report["lessons_learned"])
        
        # Schedule follow-up review
        self._schedule_review(incident["incident_id"], days=30)
        
        return report
```

---

## 8.5 Supporting Clinical and Regulatory Investigations

### Investigation Support

**What Investigators Need:**

**1. Complete Audit Trail**
- All system actions
- All data access
- All AI decisions
- All human interactions

**2. Reproducibility**
- Ability to replay scenarios
- Ability to reproduce decisions
- Ability to test hypotheses

**3. Data Access**
- Access to relevant logs
- Access to system state
- Access to configuration
- Access to model versions

**4. Analysis Tools**
- Search and filter logs
- Aggregate and analyze data
- Generate reports
- Export data

### Investigation Tools

```python
class InvestigationSupport:
    def __init__(self):
        self.audit_logger = AuditLogger()
        self.replay_system = ReplaySystem()
    
    def generate_investigation_report(self, incident_id, timeframe):
        # Collect all relevant data
        logs = self.audit_logger.query(
            incident_id=incident_id,
            timeframe=timeframe
        )
        
        system_state = self._capture_system_state(incident_id)
        configuration = self._get_configuration(incident_id)
        
        # Generate report
        report = {
            "incident_id": incident_id,
            "timeframe": timeframe,
            "logs": logs,
            "system_state": system_state,
            "configuration": configuration,
            "timeline": self._generate_timeline(logs),
            "analysis": self._analyze_incident(logs, system_state)
        }
        
        return report
    
    def replay_scenario(self, scenario_id, inputs):
        # Replay scenario with same inputs
        result = self.replay_system.replay(
            scenario_id=scenario_id,
            inputs=inputs,
            model_version=self._get_model_version(scenario_id),
            configuration=self._get_configuration(scenario_id)
        )
        
        return result
    
    def export_for_investigation(self, incident_id, format="json"):
        # Export all relevant data
        data = {
            "incident": self._get_incident(incident_id),
            "logs": self._get_logs(incident_id),
            "system_state": self._get_system_state(incident_id),
            "configuration": self._get_configuration(incident_id)
        }
        
        if format == "json":
            return json.dumps(data, default=str)
        elif format == "csv":
            return self._convert_to_csv(data)
        elif format == "pdf":
            return self._generate_pdf_report(data)
```

---

## 8.6 Practical: Design Observability and Alerting Strategy

### Exercise: Observability Design

**Objective:** Design an observability and alerting strategy for an AI system.

**Design Requirements:**

1. **Logging Strategy**
   - What to log
   - What not to log
   - Log structure
   - Log retention

2. **Monitoring Strategy**
   - Key metrics
   - Monitoring frequency
   - Baseline establishment
   - Threshold definition

3. **Alerting Strategy**
   - Alert conditions
   - Alert severity levels
   - Alert channels
   - Alert escalation

4. **Drift Detection**
   - Data drift detection
   - Model drift detection
   - Behavioral change detection
   - Response procedures

5. **Incident Response**
   - Incident detection
   - Response playbooks
   - Investigation support
   - Post-incident process

**Deliverable:** Observability and alerting strategy document including:
- Logging design
- Monitoring design
- Alerting design
- Drift detection design
- Incident response playbooks

---

## 8.7 Artefact: AI Monitoring & Incident Response Plan

### Template: Observability and Incident Response Document

Create a comprehensive observability and incident response plan.

**Structure:**

1. **Observability Overview**
   - Observability goals
   - Key principles
   - Architecture overview

2. **Logging Strategy**
   - What to log
   - What not to log
   - Log structure
   - Log retention
   - Log access control

3. **Monitoring Strategy**
   - Key metrics
   - Monitoring architecture
   - Baseline establishment
   - Threshold definition
   - Monitoring tools

4. **Alerting Strategy**
   - Alert conditions
   - Alert severity
   - Alert channels
   - Alert escalation
   - Alert response

5. **Drift Detection**
   - Data drift detection
   - Model drift detection
   - Behavioral change detection
   - Response procedures

6. **Incident Response**
   - Incident types
   - Response playbooks
   - Investigation procedures
   - Communication plans
   - Post-incident process

7. **Investigation Support**
   - Audit trail access
   - Reproducibility tools
   - Analysis capabilities
   - Reporting tools

**Example Sections:**

**Key Metrics:**
- Hallucination rate
- Refusal rate
- Escalation rate
- Confidence distribution
- Response time
- Error rate
- User satisfaction

**Alert Conditions:**
- Hallucination rate > 5%
- Refusal rate > 20%
- Escalation rate > 15%
- Error rate > 10%
- Response time > 5 seconds
- Data drift > 30%
- Model drift > 5%

**Incident Response Playbook:**
- Detection procedures
- Assessment criteria
- Containment actions
- Investigation steps
- Remediation plans
- Communication protocols
- Post-incident review

**Deliverable:** 12-15 page AI monitoring and incident response plan document.

---

## 8.8 Key Takeaways

**Observability Fundamentals:**
- Log the right things: system operations, AI decisions, safety events
- Don't log PHI in plain text or excessive detail
- Monitor hallucinations, refusals, and escalations
- Detect drift in data, model, and behavior
- Have incident response playbooks ready

**Design Principles:**
- Comprehensive logging for debugging and audits
- Privacy-preserving logging (no PHI in logs)
- Proactive monitoring of AI behavior
- Automated drift detection
- Well-defined incident response procedures

**Next Steps:**
- Design logging strategy for your system
- Implement monitoring for key metrics
- Set up alerting for critical conditions
- Create incident response playbooks
- Test incident response procedures

---

## Additional Resources

**Readings:**
- "Observability for AI Systems" - AI monitoring
- "Incident Response in Healthcare" - Clinical incident management
- "Drift Detection in ML" - Model monitoring
- "Healthcare AI Safety Monitoring" - Clinical AI safety

**Videos:**
- "AI Observability and Monitoring" (40 min)
- "Incident Response for AI Systems" (35 min)

**Tools to Explore:**
- Logging frameworks
- Monitoring platforms
- Alerting systems
- Incident management tools

**Next Module Preview:**
Module 9 will explore shipping to production in hospitals, including feature flags, shadow mode, kill switches, and change management.

---

**Module 8 Complete**  
**Next:** Module 9 - Shipping to Production in Hospitals
