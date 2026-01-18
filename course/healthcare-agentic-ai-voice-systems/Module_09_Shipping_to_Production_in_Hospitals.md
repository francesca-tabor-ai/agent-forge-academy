---
title: "Module 9: Shipping to Production in Hospitals"
description: "Move from pilot to live system without breaking trust"
module: "9"
order: 9
email_takeaway: "Hospital deployments require feature flags, shadow mode, kill switches, careful change management, and support for regulatory inspections."
email_action: "Plan a safe deployment for a hospital AI system with feature flags, shadow mode, and rollback strategy."
---

# Module 9: Shipping to Production in Hospitals

**Duration:** Week 9-10  
**Learning Objectives:**
- **feature flags and staged rollout Development**: Design feature flags and staged rollout
- **shadow mode and silent testing Implementation**: Implement shadow mode and silent testing
- **kill switches and rollback strategies Development**: Create kill switches and rollback strategies
- **Plan Change**: Plan change management in clinical settings
- **Support Cqc**: Support CQC inspections and assurance reviews

---

## 9.1 Feature Flags and Staged Rollout

### Why Feature Flags Matter

**Benefits:**
- Gradual rollout reduces risk
- Easy rollback if issues
- A/B testing capabilities
- User-specific enablement
- Emergency disable

**Healthcare Considerations:**
- Patient safety first
- Regulatory compliance
- Clinical workflow impact
- Staff training needs

### Feature Flag Design

```python
class FeatureFlagManager:
    def __init__(self):
        self.flags = {}
        self.rollout_strategy = RolloutStrategy()
    
    def create_flag(self, flag_name, default_value=False):
        flag = {
            "name": flag_name,
            "default": default_value,
            "enabled_for": [],
            "disabled_for": [],
            "rollout_percentage": 0,
            "conditions": []
        }
        
        self.flags[flag_name] = flag
        return flag
    
    def is_enabled(self, flag_name, user_id=None, context=None):
        flag = self.flags.get(flag_name)
        
        if not flag:
            return False
        
        # Check explicit enable/disable
        if user_id in flag["disabled_for"]:
            return False
        
        if user_id in flag["enabled_for"]:
            return True
        
        # Check rollout percentage
        if flag["rollout_percentage"] > 0:
            user_hash = hash(f"{user_id}_{flag_name}")
            if (user_hash % 100) < flag["rollout_percentage"]:
                return True
        
        # Check conditions
        if flag["conditions"]:
            if self._evaluate_conditions(flag["conditions"], context):
                return True
        
        return flag["default"]
    
    def gradual_rollout(self, flag_name, percentages=[10, 25, 50, 100], days_between=7):
        # Gradual rollout over time
        for percentage in percentages:
            self.flags[flag_name]["rollout_percentage"] = percentage
            self._save_flags()
            
            # Monitor for issues
            if self._detect_issues(flag_name):
                # Rollback
                self.flags[flag_name]["rollout_percentage"] = 0
                return False
            
            # Wait before next stage
            if percentage < 100:
                time.sleep(days_between * 24 * 3600)
        
        return True
```

### Staged Rollout Strategy

**Stage 1: Internal Testing (0-5%)**
- Enable for development team
- Test in controlled environment
- Validate functionality
- Fix critical issues

**Stage 2: Pilot Users (5-20%)**
- Enable for selected clinicians
- Monitor closely
- Collect feedback
- Address issues

**Stage 3: Department Rollout (20-50%)**
- Enable for one department
- Monitor department-wide
- Compare to control group
- Validate safety

**Stage 4: Hospital-Wide (50-100%)**
- Gradual increase to 100%
- Monitor system-wide metrics
- Support users
- Document learnings

**Implementation:**

```python
class StagedRollout:
    def __init__(self):
        self.stages = [
            {"name": "internal", "percentage": 5, "duration_days": 7},
            {"name": "pilot", "percentage": 20, "duration_days": 14},
            {"name": "department", "percentage": 50, "duration_days": 21},
            {"name": "hospital_wide", "percentage": 100, "duration_days": 30}
        ]
    
    def execute_rollout(self, flag_name):
        for stage in self.stages:
            # Set rollout percentage
            self.feature_flags.set_rollout_percentage(
                flag_name, stage["percentage"]
            )
            
            # Monitor during stage
            monitoring_result = self._monitor_stage(flag_name, stage)
            
            # Check if should proceed
            if not monitoring_result["proceed"]:
                # Rollback
                self.feature_flags.set_rollout_percentage(flag_name, 0)
                return {
                    "success": False,
                    "stopped_at": stage["name"],
                    "reason": monitoring_result["reason"]
                }
            
            # Wait for stage duration
            time.sleep(stage["duration_days"] * 24 * 3600)
        
        return {"success": True, "completed": True}
```

---

## 9.2 Shadow Mode and Silent Testing

### What Is Shadow Mode?

**Definition:** Run new system in parallel with existing system, but don't use its outputs for actual decisions.

**Benefits:**
- Test in real environment
- Compare to existing system
- No risk to patients
- Gather real-world data
- Validate performance

### Shadow Mode Implementation

```python
class ShadowMode:
    def __init__(self):
        self.production_system = ProductionSystem()
        self.shadow_system = ShadowSystem()
        self.comparator = SystemComparator()
    
    def process_request(self, request):
        # Production system (actual decision)
        production_result = self.production_system.process(request)
        
        # Shadow system (parallel, no impact)
        shadow_result = self.shadow_system.process(request)
        
        # Compare results
        comparison = self.comparator.compare(
            production_result, shadow_result
        )
        
        # Log comparison (for analysis)
        self._log_comparison(request, production_result, shadow_result, comparison)
        
        # Return production result (shadow doesn't affect outcome)
        return production_result
    
    def analyze_shadow_results(self, timeframe):
        # Analyze shadow mode results
        comparisons = self._get_comparisons(timeframe)
        
        analysis = {
            "total_requests": len(comparisons),
            "agreement_rate": self._calculate_agreement(comparisons),
            "disagreement_analysis": self._analyze_disagreements(comparisons),
            "performance_comparison": self._compare_performance(comparisons),
            "safety_analysis": self._analyze_safety(comparisons)
        }
        
        return analysis
```

### Silent Testing

**What Is Silent Testing?**
- Test new features without users knowing
- Collect data on usage patterns
- Validate assumptions
- Test edge cases

**Implementation:**

```python
class SilentTesting:
    def __init__(self):
        self.test_features = {}
        self.data_collector = DataCollector()
    
    def enable_silent_test(self, feature_name, test_config):
        self.test_features[feature_name] = {
            "config": test_config,
            "enabled": True,
            "start_time": datetime.now()
        }
    
    def process_with_silent_test(self, request, feature_name):
        # Normal processing
        result = self._normal_process(request)
        
        # Silent test (if enabled)
        if feature_name in self.test_features:
            test_config = self.test_features[feature_name]["config"]
            
            # Run test version
            test_result = self._test_process(request, test_config)
            
            # Collect data (don't use test result)
            self.data_collector.collect({
                "request": request,
                "normal_result": result,
                "test_result": test_result,
                "feature": feature_name,
                "timestamp": datetime.now()
            })
        
        # Return normal result (test is silent)
        return result
    
    def analyze_silent_test(self, feature_name, timeframe):
        # Analyze silent test data
        test_data = self.data_collector.get_data(feature_name, timeframe)
        
        analysis = {
            "test_count": len(test_data),
            "performance_comparison": self._compare_performance(test_data),
            "user_behavior": self._analyze_behavior(test_data),
            "edge_cases": self._identify_edge_cases(test_data),
            "recommendation": self._make_recommendation(test_data)
        }
        
        return analysis
```

---

## 9.3 Kill Switches and Rollback Strategies

### Kill Switches

**What Are Kill Switches?**
- Emergency disable mechanism
- Immediate system shutdown
- Patient safety protection
- Regulatory requirement

**Types of Kill Switches:**

**1. Feature Kill Switch**
- Disable specific feature
- Keep system running
- Use for non-critical features

**2. System Kill Switch**
- Disable entire system
- Complete shutdown
- Use for critical failures

**3. Model Kill Switch**
- Disable specific model
- Fallback to backup
- Use for model issues

**Implementation:**

```python
class KillSwitch:
    def __init__(self):
        self.kill_switches = {}
        self.alert_system = AlertSystem()
    
    def register_kill_switch(self, switch_name, switch_type, action):
        self.kill_switches[switch_name] = {
            "type": switch_type,
            "action": action,
            "enabled": False,
            "triggered_at": None,
            "triggered_by": None
        }
    
    def trigger_kill_switch(self, switch_name, triggered_by, reason):
        switch = self.kill_switches.get(switch_name)
        
        if not switch:
            raise KillSwitchNotFoundError(f"Kill switch {switch_name} not found")
        
        # Trigger switch
        switch["enabled"] = True
        switch["triggered_at"] = datetime.now()
        switch["triggered_by"] = triggered_by
        switch["reason"] = reason
        
        # Execute action
        switch["action"]()
        
        # Alert
        self.alert_system.alert({
            "type": "kill_switch_triggered",
            "switch": switch_name,
            "triggered_by": triggered_by,
            "reason": reason,
            "timestamp": datetime.now()
        })
        
        # Log
        self._log_kill_switch_trigger(switch_name, triggered_by, reason)
    
    def reset_kill_switch(self, switch_name, reset_by, reason):
        switch = self.kill_switches.get(switch_name)
        
        if not switch:
            raise KillSwitchNotFoundError(f"Kill switch {switch_name} not found")
        
        # Reset switch
        switch["enabled"] = False
        switch["reset_at"] = datetime.now()
        switch["reset_by"] = reset_by
        switch["reset_reason"] = reason
        
        # Log
        self._log_kill_switch_reset(switch_name, reset_by, reason)
```

### Rollback Strategies

**1. Immediate Rollback**

```python
class ImmediateRollback:
    def rollback(self, deployment_id):
        # Get deployment
        deployment = self._get_deployment(deployment_id)
        
        # Get previous version
        previous_version = self._get_previous_version(deployment)
        
        # Deploy previous version
        self._deploy_version(previous_version, rollout_percentage=100)
        
        # Disable new version
        self._disable_deployment(deployment_id)
        
        # Notify
        self._notify_rollback(deployment_id, previous_version)
        
        return previous_version
```

**2. Gradual Rollback**

```python
class GradualRollback:
    def rollback(self, deployment_id, stages=[100, 50, 25, 0]):
        deployment = self._get_deployment(deployment_id)
        previous_version = self._get_previous_version(deployment)
        
        for percentage in stages:
            # Reduce new version
            self._set_rollout_percentage(deployment_id, percentage)
            
            # Increase previous version
            self._set_rollout_percentage(previous_version, 100 - percentage)
            
            # Monitor
            if self._monitor_rollback(deployment_id, previous_version):
                # Continue rollback
                time.sleep(3600)  # 1 hour between stages
            else:
                # Issues detected, pause rollback
                self._pause_rollback(deployment_id)
                return False
        
        # Rollback complete
        self._complete_rollback(deployment_id, previous_version)
        return True
```

**3. Feature Flag Rollback**

```python
class FeatureFlagRollback:
    def rollback_feature(self, flag_name):
        # Disable feature flag
        self.feature_flags.disable(flag_name)
        
        # Notify
        self._notify_feature_disabled(flag_name)
        
        # Log
        self._log_rollback(flag_name)
        
        return True
```

---

## 9.4 Change Management in Clinical Settings

### Clinical Change Management

**Why It Matters:**
- Clinical workflows are complex
- Staff need training
- Patient safety depends on proper use
- Regulatory compliance required

### Change Management Process

**1. Planning Phase**

```python
class ChangePlanner:
    def plan_change(self, change_description):
        plan = {
            "change_id": self._generate_id(),
            "description": change_description,
            "impact_assessment": self._assess_impact(change_description),
            "stakeholders": self._identify_stakeholders(change_description),
            "training_required": self._assess_training_needs(change_description),
            "rollout_plan": self._create_rollout_plan(change_description),
            "rollback_plan": self._create_rollback_plan(change_description),
            "communication_plan": self._create_communication_plan(change_description)
        }
        
        return plan
```

**2. Communication Phase**

```python
class ChangeCommunicator:
    def communicate_change(self, change_plan):
        communications = []
        
        # Notify clinical leadership
        communications.append({
            "to": "clinical_leadership",
            "message": self._generate_leadership_message(change_plan),
            "timing": "4_weeks_before"
        })
        
        # Notify affected staff
        communications.append({
            "to": "affected_staff",
            "message": self._generate_staff_message(change_plan),
            "timing": "2_weeks_before"
        })
        
        # Training announcements
        communications.append({
            "to": "all_staff",
            "message": self._generate_training_announcement(change_plan),
            "timing": "1_week_before"
        })
        
        # Execute communications
        for comm in communications:
            self._send_communication(comm)
        
        return communications
```

**3. Training Phase**

```python
class ChangeTrainer:
    def train_staff(self, change_plan):
        training_plan = {
            "training_materials": self._create_training_materials(change_plan),
            "training_sessions": self._schedule_training_sessions(change_plan),
            "hands_on_practice": self._setup_practice_environment(change_plan),
            "assessment": self._create_assessment(change_plan)
        }
        
        # Execute training
        for session in training_plan["training_sessions"]:
            self._conduct_training(session)
        
        # Assess training
        training_results = self._assess_training(training_plan)
        
        return training_results
```

**4. Deployment Phase**

```python
class ChangeDeployer:
    def deploy_change(self, change_plan):
        # Pre-deployment checks
        if not self._pre_deployment_checks(change_plan):
            raise PreDeploymentCheckFailed("Pre-deployment checks failed")
        
        # Deploy with feature flags
        deployment = self._deploy_with_flags(change_plan)
        
        # Monitor deployment
        monitoring = self._monitor_deployment(deployment)
        
        # Support users
        support = self._provide_support(deployment)
        
        return {
            "deployment": deployment,
            "monitoring": monitoring,
            "support": support
        }
```

**5. Post-Deployment Phase**

```python
class PostDeploymentProcessor:
    def process_post_deployment(self, change_plan, deployment):
        # Collect feedback
        feedback = self._collect_feedback(deployment)
        
        # Analyze results
        analysis = self._analyze_deployment(deployment, feedback)
        
        # Update documentation
        self._update_documentation(change_plan, deployment)
        
        # Schedule review
        self._schedule_review(change_plan["change_id"], days=30)
        
        return {
            "feedback": feedback,
            "analysis": analysis,
            "next_review": self._get_review_date()
        }
```

---

## 9.5 Supporting CQC Inspections and Assurance Reviews

### CQC (Care Quality Commission) Inspections

**What CQC Looks For:**
- Patient safety
- Clinical effectiveness
- Staff training
- System governance
- Incident management

### Inspection Support

**1. Documentation**

```python
class InspectionDocumentation:
    def prepare_documentation(self):
        documentation = {
            "system_overview": self._generate_system_overview(),
            "safety_measures": self._document_safety_measures(),
            "training_records": self._get_training_records(),
            "incident_reports": self._get_incident_reports(),
            "audit_trails": self._get_audit_trails(),
            "governance_documents": self._get_governance_documents(),
            "compliance_evidence": self._get_compliance_evidence()
        }
        
        return documentation
```

**2. Demonstration**

```python
class InspectionDemonstration:
    def prepare_demonstration(self):
        demonstration = {
            "system_demo": self._prepare_system_demo(),
            "safety_features_demo": self._prepare_safety_demo(),
            "training_demo": self._prepare_training_demo(),
            "incident_response_demo": self._prepare_incident_demo()
        }
        
        return demonstration
```

**3. Evidence Collection**

```python
class InspectionEvidence:
    def collect_evidence(self, inspection_requirements):
        evidence = {}
        
        for requirement in inspection_requirements:
            if requirement == "patient_safety":
                evidence["patient_safety"] = {
                    "safety_measures": self._get_safety_measures(),
                    "incident_reports": self._get_incident_reports(),
                    "near_miss_logs": self._get_near_miss_logs(),
                    "safety_audits": self._get_safety_audits()
                }
            
            elif requirement == "clinical_effectiveness":
                evidence["clinical_effectiveness"] = {
                    "validation_studies": self._get_validation_studies(),
                    "performance_metrics": self._get_performance_metrics(),
                    "user_feedback": self._get_user_feedback(),
                    "outcome_data": self._get_outcome_data()
                }
            
            elif requirement == "staff_training":
                evidence["staff_training"] = {
                    "training_records": self._get_training_records(),
                    "competency_assessments": self._get_competency_assessments(),
                    "training_materials": self._get_training_materials(),
                    "ongoing_education": self._get_ongoing_education()
                }
        
        return evidence
```

---

## 9.6 Practical: Plan a Safe Deployment

### Exercise: Production Deployment Plan

**Objective:** Plan a safe deployment for a hospital AI system.

**Deployment Scenario:**
- New AI-assisted medication management system
- Replacing manual medication checking
- Hospital-wide deployment
- Regulatory approval obtained

**Planning Requirements:**

1. **Feature Flag Strategy**
   - Define feature flags needed
   - Design rollout stages
   - Plan gradual rollout
   - Design rollback triggers

2. **Shadow Mode Plan**
   - Design shadow mode implementation
   - Plan comparison metrics
   - Define success criteria
   - Plan transition from shadow to live

3. **Kill Switch Design**
   - Define kill switch types
   - Design trigger conditions
   - Plan emergency procedures
   - Design reset procedures

4. **Change Management**
   - Identify stakeholders
   - Plan communication
   - Design training program
   - Plan support structure

5. **Rollback Strategy**
   - Design rollback procedures
   - Plan rollback triggers
   - Design rollback communication
   - Plan post-rollback actions

6. **Inspection Support**
   - Prepare documentation
   - Plan demonstrations
   - Collect evidence
   - Design inspection response

**Deliverable:** Production deployment plan including:
- Feature flag and rollout strategy
- Shadow mode plan
- Kill switch design
- Change management plan
- Rollback strategy
- Inspection support plan

---

## 9.7 Artefact: Production Rollout & Rollback Plan

### Template: Deployment Plan Document

Create a comprehensive production rollout and rollback plan.

**Structure:**

1. **Deployment Overview**
   - System description
   - Deployment scope
   - Success criteria
   - Risk assessment

2. **Feature Flag Strategy**
   - Feature flags defined
   - Rollout stages
   - Gradual rollout plan
   - Monitoring during rollout

3. **Shadow Mode Plan**
   - Shadow mode design
   - Comparison metrics
   - Success criteria
   - Transition plan

4. **Kill Switch Design**
   - Kill switch types
   - Trigger conditions
   - Emergency procedures
   - Reset procedures

5. **Change Management**
   - Stakeholder identification
   - Communication plan
   - Training plan
   - Support plan

6. **Rollback Strategy**
   - Rollback triggers
   - Rollback procedures
   - Rollback communication
   - Post-rollback actions

7. **Inspection Support**
   - Documentation preparation
   - Demonstration planning
   - Evidence collection
   - Inspection response

**Example Sections:**

**Rollout Stages:**
- Stage 1: Internal testing (5%, 1 week)
- Stage 2: Pilot users (20%, 2 weeks)
- Stage 3: Department rollout (50%, 3 weeks)
- Stage 4: Hospital-wide (100%, 4 weeks)

**Kill Switch Triggers:**
- Error rate > 10%
- Safety incident detected
- Performance degradation > 20%
- User complaints > threshold

**Rollback Triggers:**
- Critical safety issue
- System instability
- Performance degradation
- User rejection

**Deliverable:** 12-15 page production rollout and rollback plan document.

---

## 9.8 Key Takeaways

**Production Deployment Fundamentals:**
- Feature flags enable gradual, safe rollout
- Shadow mode tests in real environment without risk
- Kill switches provide emergency safety mechanism
- Change management ensures proper adoption
- Rollback strategies enable quick recovery

**Design Principles:**
- Gradual rollout reduces risk
- Test in production safely (shadow mode)
- Always have kill switches ready
- Communicate and train before deploying
- Plan rollback before you need it

**Next Steps:**
- **feature flag strategy for your Development**: Design feature flag strategy for your system
- **Plan Shadow**: Plan shadow mode implementation
- **kill switch mechanisms Development**: Create kill switch mechanisms
- **change management plan Development**: Develop change management plan
- **Test Rollback**: Apply test rollback procedures in relevant contexts

---

## Additional Resources

**Readings:**
- "Feature Flags in Production" - Deployment strategies
- "Shadow Mode Testing" - Safe production testing
- "Change Management in Healthcare" - Clinical change management
- "CQC Inspection Preparation" - Regulatory compliance

**Videos:**
- "Safe Production Deployments" (40 min)
- "Hospital AI Deployment" (35 min)

**Tools to Explore:**
- Feature flag platforms
- Deployment tools
- Monitoring systems
- Change management tools

**Next Module Preview:**
Module 10 is the capstone project where you'll design and defend a complete production-grade AI system suitable for hospital deployment.

---

**Module 9 Complete**  
**Next:** Module 10 - Capstone: Build & Defend a Production-Grade AI System
