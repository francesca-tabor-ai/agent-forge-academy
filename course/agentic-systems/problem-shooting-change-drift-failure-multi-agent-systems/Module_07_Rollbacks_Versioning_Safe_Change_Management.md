---
title: "Module 7: Rollbacks, Versioning, and Safe Change Management"
description: "Undoing damage cheaply"
module: "7"
order: 7
email_takeaway: "Version everything: prompts, agents, tools, policies. Canary behavioral changes and roll back without losing in-flight work."
email_action: "What would break if you rolled back your agent system right now? What state would be lost?"
---

# Module 7: Rollbacks, Versioning, and Safe Change Management

**Duration:** Week 7  
**Learning Objectives:**
- **Version Prompts,**: Version prompts, agents, tools, and policies
- **canarying for behavioral changes Implementation**: Implement canarying for behavioral changes
- **Ensure Backward**: Ensure backward compatibility for agent reasoning
- **Roll Back**: Roll back without losing in-flight work
- **Recover From**: Recover from bad deployments without restarting

---

## 7.1 Versioning Prompts, Agents, Tools, and Policies

### What Needs Versioning?

**Component 1: Prompts**
- System prompts
- User prompts
- Few-shot examples
- Prompt templates

**Component 2: Agents**
- Agent code
- Agent configuration
- Agent behavior
- Agent dependencies

**Component 3: Tools**
- Tool implementations
- Tool APIs
- Tool schemas
- Tool configurations

**Component 4: Policies**
- Decision policies
- Escalation policies
- Cost policies
- Security policies

### Versioning Strategy

**Approach 1: Semantic Versioning**
```python
class Version:
    def __init__(self, major, minor, patch):
        self.major = major  # Breaking changes
        self.minor = minor  # New features
        self.patch = patch  # Bug fixes
    
    def __str__(self):
        return f"{self.major}.{self.minor}.{self.patch}"
```

**Approach 2: Content-Based Versioning**
```python
class ContentVersion:
    def __init__(self, content_hash):
        self.hash = content_hash
    
    def from_content(self, content):
        return ContentVersion(hashlib.sha256(content.encode()).hexdigest())
```

**Approach 3: Timestamp Versioning**
```python
class TimestampVersion:
    def __init__(self, timestamp):
        self.timestamp = timestamp
    
    def now(self):
        return TimestampVersion(datetime.now())
```

### Version Storage

**Storage Structure:**
```python
class VersionStore:
    def __init__(self):
        self.versions = {}
    
    def store(self, component, version, content):
        key = f"{component}:{version}"
        self.versions[key] = {
            "component": component,
            "version": version,
            "content": content,
            "timestamp": now()
        }
    
    def get(self, component, version):
        key = f"{component}:{version}"
        return self.versions.get(key)
    
    def list_versions(self, component):
        return [v for k, v in self.versions.items() if v["component"] == component]
```

---

## 7.2 Canarying Behavioral Changes

### What Is Canarying?

**Definition:** Deploy changes to a small subset first, monitor, then roll out gradually

**Benefits:**
- Catch issues early
- Limit blast radius
- Test in production
- Gradual rollout

### Canary Strategy for Agents

**Strategy 1: Percentage-Based**
```python
class PercentageCanary:
    def __init__(self, percentage=10):
        self.percentage = percentage
    
    def should_use_new_version(self, request_id):
        # Use hash to consistently route same requests
        hash_value = hash(request_id) % 100
        return hash_value < self.percentage
```

**Strategy 2: User-Based**
```python
class UserBasedCanary:
    def __init__(self, user_ids):
        self.canary_users = set(user_ids)
    
    def should_use_new_version(self, user_id):
        return user_id in self.canary_users
```

**Strategy 3: Feature-Based**
```python
class FeatureBasedCanary:
    def __init__(self, features):
        self.canary_features = set(features)
    
    def should_use_new_version(self, feature):
        return feature in self.canary_features
```

### Canary Monitoring

**Metrics to Monitor:**
```python
class CanaryMetrics:
    def __init__(self):
        self.metrics = {
            "error_rate": 0.0,
            "latency": 0.0,
            "cost": 0.0,
            "quality_score": 0.0,
            "user_satisfaction": 0.0
        }
    
    def compare_with_baseline(self, baseline_metrics):
        comparison = {}
        for metric, value in self.metrics.items():
            baseline_value = baseline_metrics[metric]
            diff = value - baseline_value
            diff_percent = (diff / baseline_value) * 100
            comparison[metric] = {
                "value": value,
                "baseline": baseline_value,
                "diff": diff,
                "diff_percent": diff_percent
            }
        return comparison
    
    def should_rollback(self, baseline_metrics, thresholds):
        comparison = self.compare_with_baseline(baseline_metrics)
        for metric, threshold in thresholds.items():
            if abs(comparison[metric]["diff_percent"]) > threshold:
                return True
        return False
```

### Canary Rollout

**Gradual Rollout:**
```python
class CanaryRollout:
    def __init__(self):
        self.stages = [10, 25, 50, 100]  # Percentage stages
        self.current_stage = 0
    
    def rollout(self, canary_metrics, baseline_metrics):
        if self.should_advance(canary_metrics, baseline_metrics):
            self.current_stage += 1
            return self.stages[self.current_stage]
        elif self.should_rollback(canary_metrics, baseline_metrics):
            return 0  # Rollback
        else:
            return self.stages[self.current_stage]  # Stay at current stage
    
    def should_advance(self, canary_metrics, baseline_metrics):
        # Check if canary is performing well
        comparison = canary_metrics.compare_with_baseline(baseline_metrics)
        return all(abs(c["diff_percent"]) < 5 for c in comparison.values())
    
    def should_rollback(self, canary_metrics, baseline_metrics):
        # Check if canary is performing poorly
        comparison = canary_metrics.compare_with_baseline(baseline_metrics)
        return any(abs(c["diff_percent"]) > 20 for c in comparison.values())
```

---

## 7.3 Backward Compatibility for Agent Reasoning

### What Is Backward Compatibility?

**Definition:** New version can handle inputs/outputs from old version

**Challenges:**
- Agent reasoning may change
- Output format may change
- Tool interfaces may change
- State format may change

### Compatibility Strategies

**Strategy 1: Input Compatibility**
```python
class InputCompatibility:
    def handle_legacy_input(self, input, version):
        if version < current_version:
            # Transform legacy input to current format
            return self.transform_input(input, version)
        return input
    
    def transform_input(self, input, old_version):
        # Transform based on version
        if old_version < "2.0":
            return self.transform_v1_to_v2(input)
        return input
```

**Strategy 2: Output Compatibility**
```python
class OutputCompatibility:
    def ensure_compatible_output(self, output, requested_version):
        if requested_version < current_version:
            # Transform output to requested format
            return self.transform_output(output, requested_version)
        return output
    
    def transform_output(self, output, old_version):
        # Transform based on version
        if old_version < "2.0":
            return self.transform_v2_to_v1(output)
        return output
```

**Strategy 3: State Compatibility**
```python
class StateCompatibility:
    def migrate_state(self, state, from_version, to_version):
        # Migrate state between versions
        current_state = state
        for version in range(from_version, to_version):
            current_state = self.migrate_step(current_state, version)
        return current_state
    
    def migrate_step(self, state, version):
        # Single version migration step
        migration = self.get_migration(version)
        return migration.apply(state)
```

### Version Adapters

**Adapter Pattern:**
```python
class VersionAdapter:
    def __init__(self, from_version, to_version):
        self.from_version = from_version
        self.to_version = to_version
    
    def adapt_input(self, input):
        # Adapt input from old version to new version
        pass
    
    def adapt_output(self, output):
        # Adapt output from new version to old version
        pass
    
    def adapt_state(self, state):
        # Adapt state from old version to new version
        pass
```

---

## 7.4 Rolling Back Without Losing In-Flight Work

### The In-Flight Work Problem

**Scenario:**
```
1. Agent starts task with version 2.0
2. System rolls back to version 1.0
3. Agent still has in-flight work from version 2.0
4. Version 1.0 can't handle version 2.0 state
→ Work is lost or corrupted
```

### Solutions

**Solution 1: Version-Aware State**
```python
class VersionAwareState:
    def __init__(self):
        self.state = {}
        self.version = None
    
    def checkpoint(self, version):
        return {
            "state": self.state.copy(),
            "version": version,
            "timestamp": now()
        }
    
    def restore(self, checkpoint):
        self.state = checkpoint["state"]
        self.version = checkpoint["version"]
    
    def migrate_if_needed(self, target_version):
        if self.version != target_version:
            self.state = self.migrate_state(self.state, self.version, target_version)
            self.version = target_version
```

**Solution 2: Graceful Completion**
```python
class GracefulRollback:
    def rollback(self, in_flight_tasks):
        # Complete in-flight tasks with current version
        for task in in_flight_tasks:
            if task.can_complete_quickly():
                task.complete()
            else:
                # Save task state for later
                task.save_state()
                task.queue_for_later()
        
        # Now safe to rollback
        self.perform_rollback()
```

**Solution 3: Dual Version Support**
```python
class DualVersionSupport:
    def __init__(self):
        self.versions = {
            "1.0": Version1Handler(),
            "2.0": Version2Handler()
        }
    
    def handle_request(self, request):
        version = request.get_version()
        handler = self.versions.get(version)
        if handler:
            return handler.handle(request)
        else:
            # Fallback to latest
            return self.versions["2.0"].handle(request)
```

---

## 7.5 Recovering from Bad Deployments

### Bad Deployment Scenarios

**Scenario 1: Immediate Failure**
```
Deployment → System crashes → Immediate rollback needed
```

**Scenario 2: Gradual Degradation**
```
Deployment → System works but degrades → Need to detect and rollback
```

**Scenario 3: Silent Failure**
```
Deployment → System appears to work but produces wrong results → Hard to detect
```

### Recovery Process

**Step 1: Detection**
```python
class DeploymentMonitor:
    def monitor_deployment(self, deployment):
        metrics = self.collect_metrics()
        
        if self.detect_failure(metrics):
            return self.trigger_rollback(deployment)
        
        if self.detect_degradation(metrics):
            return self.trigger_rollback(deployment)
        
        return "deployment_ok"
    
    def detect_failure(self, metrics):
        return metrics.error_rate > 0.1
    
    def detect_degradation(self, metrics):
        return metrics.quality_score < baseline_quality * 0.9
```

**Step 2: Rollback Decision**
```python
class RollbackDecision:
    def should_rollback(self, deployment, metrics):
        # Check multiple signals
        signals = {
            "error_rate": metrics.error_rate > 0.1,
            "latency": metrics.latency > baseline_latency * 1.5,
            "cost": metrics.cost > baseline_cost * 1.2,
            "quality": metrics.quality_score < baseline_quality * 0.9
        }
        
        # Rollback if multiple signals indicate problem
        problem_signals = sum(signals.values())
        return problem_signals >= 2
```

**Step 3: Safe Rollback**
```python
class SafeRollback:
    def rollback(self, deployment):
        # 1. Stop accepting new requests with new version
        self.stop_new_requests()
        
        # 2. Complete in-flight work
        self.complete_in_flight_work()
        
        # 3. Restore previous version
        self.restore_previous_version()
        
        # 4. Verify rollback
        if self.verify_rollback():
            self.resume_requests()
        else:
            self.alert("Rollback verification failed")
```

**Step 4: Verification**
```python
class RollbackVerification:
    def verify(self, deployment):
        # Check that system is working
        test_results = self.run_smoke_tests()
        
        # Check metrics
        metrics = self.collect_metrics()
        
        # Verify state consistency
        state_consistent = self.check_state_consistency()
        
        return test_results.passed and metrics.normal and state_consistent
```

---

## 7.6 Key Takeaways

**Versioning:**
- Version prompts, agents, tools, policies
- Use semantic, content-based, or timestamp versioning
- Store versions for rollback capability

**Canarying:**
- Deploy to small subset first
- Monitor metrics closely
- Gradual rollout based on performance
- Rollback if issues detected

**Backward Compatibility:**
- Ensure input/output compatibility
- Migrate state between versions
- Use version adapters
- Support multiple versions simultaneously

**Safe Rollback:**
- Complete in-flight work before rollback
- Use version-aware state
- Support graceful completion
- Verify rollback success

**Recovery:**
- Detect failures and degradation
- Make rollback decisions based on multiple signals
- Perform safe rollback process
- Verify rollback success

---

## Practical Work: Recovering from a Bad Deployment Without Restarting the System

**Objective:** Implement safe rollback and recovery mechanisms

**Requirements:**
1. Set up versioning system
2. Implement canary deployment
3. Add backward compatibility
4. Build safe rollback mechanism
5. Create recovery process
6. Test bad deployment scenario

**Deliverables:**
- Versioning implementation
- Canary deployment system
- Backward compatibility layer
- Safe rollback mechanism
- Recovery process
- Test results

**Evaluation Criteria:**
- Versioning system quality (20%)
- Canary deployment (20%)
- Backward compatibility (20%)
- Safe rollback (20%)
- Recovery process (20%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Safe Deployment Strategies"
- "Version Management for AI Systems"
- "Rollback Patterns"

**Tools to Explore:**
- Version control systems
- Deployment tools
- Monitoring platforms

**Next Module Preview:**
Module 8 will teach you how to build observability for agent reasoning and decisions.

---

**Module 7 Complete**   
**Next:** Module 8 - Observability for Agent Reasoning and Decisions
