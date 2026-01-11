---
title: "Module 10: Security, Safety, and Containment Boundaries"
description: "Agents as potential attack surfaces"
module: "10"
order: 10
email_takeaway: "Agents are attack surfaces. Use least-privilege agents, auditability, and kill switches. Prove containment works under adversarial input."
email_action: "What's the worst thing an attacker could do with your agent system? How would you detect and stop it?"
---

# Module 10: Security, Safety, and Containment Boundaries

**Duration:** Week 10  
**Learning Objectives:**
- Understand agents as potential attack surfaces
- Prevent tool and prompt injection at system level
- Implement least-privilege agents
- Build auditability and post-incident forensics
- Design kill switches and containment strategies

---

## 10.1 Agents as Potential Attack Surfaces

### Attack Vectors

**Vector 1: Prompt Injection**
```
User Input: "Ignore previous instructions and..."
→ Agent follows injected instructions
→ System compromised
```

**Vector 2: Tool Injection**
```
Malicious Tool: Returns corrupted data
→ Agent uses corrupted data
→ System produces wrong results
```

**Vector 3: Model Manipulation**
```
Adversarial Input: Designed to confuse model
→ Model produces wrong output
→ System fails
```

**Vector 4: State Corruption**
```
Malicious State Update: Corrupts agent state
→ Agent makes wrong decisions
→ System compromised
```

### Attack Impact

**Impact 1: Data Exfiltration**
- Agent reveals sensitive data
- Accesses unauthorized resources
- Leaks information

**Impact 2: System Manipulation**
- Agent executes unauthorized actions
- Modifies system state
- Bypasses security controls

**Impact 3: Cost Escalation**
- Agent makes expensive calls
- Runs infinite loops
- Wastes resources

**Impact 4: Reputation Damage**
- Agent produces harmful content
- Violates policies
- Damages brand

---

## 10.2 Tool and Prompt Injection at the System Level

### Prompt Injection Prevention

**Strategy 1: Input Sanitization**
```python
class InputSanitizer:
    def sanitize(self, input):
        # Remove injection patterns
        patterns = [
            r"ignore previous instructions",
            r"forget everything",
            r"system:",
            r"assistant:"
        ]
        
        for pattern in patterns:
            input = re.sub(pattern, "", input, flags=re.IGNORECASE)
        
        return input
```

**Strategy 2: Prompt Isolation**
```python
class PromptIsolation:
    def __init__(self):
        self.system_prompt = "You are a helpful assistant..."
        self.user_prompt = None
    
    def build_prompt(self, user_input):
        # Isolate system and user prompts
        return {
            "system": self.system_prompt,
            "user": self.sanitize(user_input)
        }
```

**Strategy 3: Output Validation**
```python
class OutputValidator:
    def validate(self, output):
        # Check for injection attempts in output
        if self.contains_injection_pattern(output):
            raise SecurityException("Potential injection detected")
        
        # Check for policy violations
        if self.violates_policy(output):
            raise PolicyViolationException()
        
        return output
```

### Tool Injection Prevention

**Strategy 1: Tool Whitelisting**
```python
class ToolWhitelist:
    def __init__(self):
        self.allowed_tools = {
            "search": SearchTool(),
            "calculator": CalculatorTool()
        }
    
    def get_tool(self, tool_name):
        if tool_name not in self.allowed_tools:
            raise SecurityException(f"Tool {tool_name} not allowed")
        return self.allowed_tools[tool_name]
```

**Strategy 2: Tool Input Validation**
```python
class ToolInputValidator:
    def validate(self, tool, input):
        # Validate input against tool schema
        schema = tool.get_input_schema()
        
        if not schema.validate(input):
            raise ValidationException("Invalid tool input")
        
        # Check for injection patterns
        if self.contains_injection(input):
            raise SecurityException("Injection detected in tool input")
        
        return input
```

**Strategy 3: Tool Output Validation**
```python
class ToolOutputValidator:
    def validate(self, tool, output):
        # Validate output format
        schema = tool.get_output_schema()
        
        if not schema.validate(output):
            raise ValidationException("Invalid tool output")
        
        # Check for malicious content
        if self.contains_malicious_content(output):
            raise SecurityException("Malicious content in tool output")
        
        return output
```

---

## 10.3 Least-Privilege Agents

### What Is Least Privilege?

**Definition:** Agents have minimum permissions needed

**Benefits:**
- Limits attack surface
- Reduces impact of compromise
- Easier to audit
- Better security

### Implementation

**Approach 1: Role-Based Access Control**
```python
class RBACAgent:
    def __init__(self, role):
        self.role = role
        self.permissions = self.get_permissions(role)
    
    def can_access(self, resource):
        return resource in self.permissions
    
    def execute(self, action, resource):
        if not self.can_access(resource):
            raise PermissionException(f"Agent {self.role} cannot access {resource}")
        
        return action.execute(resource)
```

**Approach 2: Capability-Based**
```python
class CapabilityAgent:
    def __init__(self, capabilities):
        self.capabilities = set(capabilities)
    
    def has_capability(self, capability):
        return capability in self.capabilities
    
    def execute(self, action):
        required_capabilities = action.get_required_capabilities()
        
        for capability in required_capabilities:
            if not self.has_capability(capability):
                raise CapabilityException(f"Missing capability: {capability}")
        
        return action.execute()
```

**Approach 3: Resource-Based**
```python
class ResourceBasedAgent:
    def __init__(self, allowed_resources):
        self.allowed_resources = set(allowed_resources)
    
    def can_access_resource(self, resource):
        return resource in self.allowed_resources
    
    def execute(self, action, resource):
        if not self.can_access_resource(resource):
            raise ResourceException(f"Cannot access resource: {resource}")
        
        return action.execute(resource)
```

---

## 10.4 Auditability and Post-Incident Forensics

### Audit Logging

**What to Log:**
```python
class AuditLogger:
    def log_decision(self, agent, decision, context):
        log_entry = {
            "timestamp": now(),
            "agent_id": agent.id,
            "decision": decision,
            "context": context,
            "inputs": decision.inputs,
            "outputs": decision.outputs,
            "tools_used": decision.tools_used,
            "cost": decision.cost
        }
        self.write_log(log_entry)
    
    def log_tool_call(self, agent, tool, input, output):
        log_entry = {
            "timestamp": now(),
            "agent_id": agent.id,
            "tool": tool.name,
            "input": self.sanitize_for_logging(input),
            "output": self.sanitize_for_logging(output)
        }
        self.write_log(log_entry)
    
    def log_state_change(self, agent, before, after):
        log_entry = {
            "timestamp": now(),
            "agent_id": agent.id,
            "state_before": before,
            "state_after": after,
            "changes": self.compute_changes(before, after)
        }
        self.write_log(log_entry)
```

### Forensics Analysis

**Analysis Tools:**
```python
class ForensicsAnalyzer:
    def analyze_incident(self, incident_id, time_range):
        # Get all logs for incident
        logs = self.get_logs(incident_id, time_range)
        
        # Build timeline
        timeline = self.build_timeline(logs)
        
        # Identify root cause
        root_cause = self.identify_root_cause(timeline)
        
        # Trace attack path
        attack_path = self.trace_attack_path(timeline)
        
        # Identify compromised components
        compromised = self.identify_compromised_components(timeline)
        
        return {
            "timeline": timeline,
            "root_cause": root_cause,
            "attack_path": attack_path,
            "compromised_components": compromised
        }
```

---

## 10.5 Kill Switches and Containment Strategies

### Kill Switches

**Type 1: Immediate Kill**
```python
class ImmediateKillSwitch:
    def __init__(self):
        self.active = True
    
    def kill(self, agent_id):
        # Immediately stop agent
        agent = self.get_agent(agent_id)
        agent.stop()
        agent.clear_state()
        self.notify_security_team(agent_id)
    
    def kill_all(self):
        # Kill all agents
        for agent in self.get_all_agents():
            agent.stop()
            agent.clear_state()
```

**Type 2: Graceful Kill**
```python
class GracefulKillSwitch:
    def kill(self, agent_id):
        agent = self.get_agent(agent_id)
        
        # Complete current task if safe
        if agent.can_safely_complete():
            agent.complete_current_task()
        
        # Save state
        agent.save_state()
        
        # Stop accepting new tasks
        agent.stop_accepting_tasks()
        
        # Notify
        self.notify_security_team(agent_id)
```

**Type 3: Selective Kill**
```python
class SelectiveKillSwitch:
    def kill_by_pattern(self, pattern):
        # Kill agents matching pattern
        matching_agents = self.find_agents_by_pattern(pattern)
        
        for agent in matching_agents:
            agent.stop()
            agent.clear_state()
    
    def kill_by_behavior(self, behavior):
        # Kill agents exhibiting behavior
        agents = self.detect_behavior(behavior)
        
        for agent in agents:
            agent.stop()
            agent.clear_state()
```

### Containment Strategies

**Strategy 1: Network Isolation**
```python
class NetworkContainment:
    def contain(self, agent_id):
        agent = self.get_agent(agent_id)
        
        # Isolate network
        agent.isolate_network()
        
        # Block external connections
        agent.block_external_connections()
        
        # Allow only local resources
        agent.allow_only_local_resources()
```

**Strategy 2: Resource Limiting**
```python
class ResourceContainment:
    def contain(self, agent_id):
        agent = self.get_agent(agent_id)
        
        # Limit resources
        agent.set_cpu_limit(0.1)
        agent.set_memory_limit(100)  # MB
        agent.set_cost_limit(1.0)  # dollars
        
        # Monitor usage
        agent.monitor_resource_usage()
```

**Strategy 3: Sandboxing**
```python
class SandboxContainment:
    def contain(self, agent_id):
        agent = self.get_agent(agent_id)
        
        # Move to sandbox
        sandbox = self.create_sandbox()
        agent.move_to_sandbox(sandbox)
        
        # Restrict capabilities
        agent.restrict_capabilities()
        
        # Monitor behavior
        agent.monitor_behavior()
```

---

## 10.6 Key Takeaways

**Attack Surfaces:**
- Prompt injection
- Tool injection
- Model manipulation
- State corruption

**Prevention:**
- Input sanitization
- Prompt isolation
- Output validation
- Tool whitelisting

**Least Privilege:**
- Role-based access control
- Capability-based permissions
- Resource-based restrictions

**Auditability:**
- Comprehensive logging
- Forensics analysis
- Timeline reconstruction
- Attack path tracing

**Containment:**
- Kill switches (immediate, graceful, selective)
- Network isolation
- Resource limiting
- Sandboxing

---

## Practical Work: Exploiting the System, Then Hardening It

**Objective:** Find vulnerabilities and implement security measures

**Requirements:**
1. Identify attack vectors
2. Attempt prompt injection
3. Test tool injection
4. Implement security measures
5. Test containment strategies
6. Verify security improvements

**Deliverables:**
- Vulnerability assessment
- Attack demonstrations
- Security implementations
- Containment mechanisms
- Security test results
- Hardening report

**Evaluation Criteria:**
- Vulnerability identification (20%)
- Attack demonstration (20%)
- Security implementation (20%)
- Containment mechanisms (20%)
- Security verification (20%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Security for AI Systems"
- "Prompt Injection Attacks"
- "Containment Strategies"

**Tools to Explore:**
- Security testing frameworks
- Audit logging systems
- Containment platforms

**Next Module Preview:**
Module 11 will teach you about cost failures and economic drift in agent systems.

---

**Module 10 Complete**   
**Next:** Module 11 - Cost Failures and Economic Drift
