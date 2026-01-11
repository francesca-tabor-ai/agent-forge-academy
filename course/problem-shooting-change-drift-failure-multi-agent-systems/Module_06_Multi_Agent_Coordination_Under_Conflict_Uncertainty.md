---
title: "Module 6: Multi-Agent Coordination Under Conflict and Uncertainty"
description: "When agents disagree, stall, or hallucinate consensus"
module: "6"
order: 6
email_takeaway: "Agent conflicts are inevitable. Use communication protocols, shared state, and arbitration policies to prevent deadlocks, livelocks, and runaway collaboration."
email_action: "Think of a multi-agent system—what happens when two agents disagree? How would you detect and resolve it?"
---

# Module 6: Multi-Agent Coordination Under Conflict and Uncertainty

**Duration:** Week 6  
**Learning Objectives:**
- Handle agent disagreement, stalling, and false consensus
- Design communication protocols and shared state
- Prevent deadlocks, livelocks, and runaway collaboration
- Implement arbitration, voting, and escalation policies
- Build budget-aware coordination

---

## 6.1 When Agents Disagree, Stall, or Hallucinate Consensus

### Types of Agent Conflicts

**Type 1: Direct Disagreement**
```
Agent A: "The answer is 4"
Agent B: "The answer is 5"
→ Conflict: Agents have different answers
```

**Type 2: Stalling**
```
Agent A: Waiting for Agent B
Agent B: Waiting for Agent A
→ Deadlock: Both agents waiting
```

**Type 3: False Consensus**
```
Agent A: "I agree with Agent B"
Agent B: "I agree with Agent A"
Agent C: "Everyone agrees, so it must be correct"
→ False Consensus: Agents agree but are all wrong
```

**Type 4: Runaway Collaboration**
```
Agent A: "Let me ask Agent B"
Agent B: "Let me ask Agent C"
Agent C: "Let me ask Agent A"
→ Infinite Loop: Agents keep asking each other
```

### Why Conflicts Occur

**Reason 1: Non-Deterministic Reasoning**
- Same input → different outputs
- Agents reason differently
- No single "correct" answer

**Reason 2: Incomplete Information**
- Agents have different context
- Missing information leads to different conclusions
- Uncertainty causes disagreement

**Reason 3: Conflicting Goals**
- Agents optimize for different objectives
- Trade-offs lead to different choices
- No optimal solution for all agents

**Reason 4: Communication Failures**
- Messages lost or delayed
- Misinterpretation of messages
- State synchronization issues

---

## 6.2 Communication Protocols and Shared State

### Communication Protocol Design

**Protocol 1: Request-Response**
```python
class RequestResponseProtocol:
    def send_request(self, from_agent, to_agent, request):
        message = {
            "type": "request",
            "from": from_agent.id,
            "to": to_agent.id,
            "request_id": generate_id(),
            "content": request,
            "timestamp": now()
        }
        return message
    
    def send_response(self, request, response):
        message = {
            "type": "response",
            "request_id": request["request_id"],
            "from": request["to"],
            "to": request["from"],
            "content": response,
            "timestamp": now()
        }
        return message
```

**Protocol 2: Publish-Subscribe**
```python
class PubSubProtocol:
    def __init__(self):
        self.subscribers = {}
    
    def subscribe(self, agent, event_type):
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(agent)
    
    def publish(self, event_type, data):
        if event_type in self.subscribers:
            for agent in self.subscribers[event_type]:
                agent.handle_event(event_type, data)
```

**Protocol 3: Consensus Protocol**
```python
class ConsensusProtocol:
    def propose(self, agent, proposal):
        # Broadcast proposal
        votes = []
        for other_agent in self.agents:
            if other_agent != agent:
                vote = other_agent.vote(proposal)
                votes.append(vote)
        
        # Check consensus
        approval_rate = sum(votes) / len(votes)
        return approval_rate >= self.threshold
```

### Shared State Management

**Approach 1: Centralized State**
```python
class CentralizedState:
    def __init__(self):
        self.state = {}
        self.lock = Lock()
    
    def update(self, key, value, agent_id):
        with self.lock:
            self.state[key] = {
                "value": value,
                "updated_by": agent_id,
                "timestamp": now(),
                "version": self.state.get(key, {}).get("version", 0) + 1
            }
    
    def read(self, key):
        with self.lock:
            return self.state.get(key)
```

**Approach 2: Distributed State**
```python
class DistributedState:
    def __init__(self, agents):
        self.agents = agents
        self.local_state = {}
    
    def update(self, key, value):
        # Update local state
        self.local_state[key] = value
        
        # Broadcast to other agents
        for agent in self.agents:
            if agent != self:
                agent.receive_state_update(key, value)
    
    def get_consensus_state(self, key):
        # Get state from all agents
        states = [agent.local_state.get(key) for agent in self.agents]
        
        # Return consensus value
        return self.consensus(states)
```

**Approach 3: Versioned State**
```python
class VersionedState:
    def __init__(self):
        self.state = {}
        self.versions = {}
    
    def update(self, key, value, agent_id):
        version = self.versions.get(key, 0) + 1
        self.state[key] = {
            "value": value,
            "version": version,
            "updated_by": agent_id,
            "timestamp": now()
        }
        self.versions[key] = version
    
    def read_with_version(self, key):
        return {
            "value": self.state.get(key),
            "version": self.versions.get(key, 0)
        }
    
    def merge_conflicts(self, key, updates):
        # Merge conflicting updates
        # Use version numbers to resolve conflicts
        latest_version = max(u.version for u in updates)
        return [u for u in updates if u.version == latest_version]
```

---

## 6.3 Deadlocks, Livelocks, and Runaway Collaboration

### Deadlocks

**Definition:** Agents waiting for each other indefinitely

**Example:**
```python
# Deadlock scenario
Agent A: Waiting for Agent B to finish
Agent B: Waiting for Agent A to finish
→ Both waiting forever
```

**Detection:**
```python
class DeadlockDetector:
    def __init__(self, timeout=30):
        self.timeout = timeout
        self.waiting_agents = {}
    
    def check_deadlock(self, agents):
        for agent in agents:
            if agent.is_waiting():
                wait_start = agent.wait_start_time()
                if now() - wait_start > self.timeout:
                    return True
        return False
```

**Prevention:**
```python
class DeadlockPrevention:
    def execute_with_timeout(self, agent, task, timeout=30):
        start_time = now()
        result = None
        
        while now() - start_time < timeout:
            try:
                result = agent.execute(task)
                break
            except WaitingException:
                if now() - start_time > timeout:
                    raise DeadlockException()
                sleep(1)
        
        return result
```

### Livelocks

**Definition:** Agents keep changing state but make no progress

**Example:**
```python
# Livelock scenario
Agent A: Proposes solution X
Agent B: Rejects, proposes solution Y
Agent A: Rejects, proposes solution X again
Agent B: Rejects, proposes solution Y again
→ Infinite loop of proposals
```

**Detection:**
```python
class LivelockDetector:
    def __init__(self):
        self.state_history = []
    
    def detect_livelock(self, current_state):
        self.state_history.append(current_state)
        
        # Check for repeating patterns
        if len(self.state_history) > 10:
            recent = self.state_history[-10:]
            if len(set(recent)) < 3:  # Only 2-3 unique states
                return True
        return False
```

**Prevention:**
```python
class LivelockPrevention:
    def execute_with_progress_check(self, agents):
        initial_state = self.get_state(agents)
        iterations = 0
        max_iterations = 100
        
        while iterations < max_iterations:
            # Execute one step
            self.execute_step(agents)
            iterations += 1
            
            # Check for progress
            current_state = self.get_state(agents)
            if self.has_progress(initial_state, current_state):
                initial_state = current_state
                iterations = 0
            elif iterations >= max_iterations:
                raise LivelockException()
```

### Runaway Collaboration

**Definition:** Agents keep asking each other without making progress

**Example:**
```python
# Runaway collaboration
Agent A: "I need Agent B's input"
Agent B: "I need Agent C's input"
Agent C: "I need Agent A's input"
→ Circular dependency
```

**Prevention:**
```python
class CollaborationBudget:
    def __init__(self, max_collaborations=10):
        self.max_collaborations = max_collaborations
        self.collaboration_count = {}
    
    def can_collaborate(self, agent_id):
        count = self.collaboration_count.get(agent_id, 0)
        if count >= self.max_collaborations:
            return False
        self.collaboration_count[agent_id] = count + 1
        return True
    
    def reset(self):
        self.collaboration_count = {}
```

---

## 6.4 Arbitration, Voting, and Escalation Policies

### Arbitration

**Definition:** Third party decides between conflicting agents

**Approach 1: Authority-Based**
```python
class AuthorityArbitration:
    def __init__(self, authority_agent):
        self.authority = authority_agent
    
    def arbitrate(self, conflict):
        # Authority agent makes final decision
        decision = self.authority.resolve(conflict)
        return decision
```

**Approach 2: Rule-Based**
```python
class RuleBasedArbitration:
    def __init__(self, rules):
        self.rules = rules
    
    def arbitrate(self, conflict):
        # Apply rules to resolve conflict
        for rule in self.rules:
            if rule.applies_to(conflict):
                return rule.resolve(conflict)
        return self.default_resolution(conflict)
```

**Approach 3: Cost-Based**
```python
class CostBasedArbitration:
    def arbitrate(self, conflict):
        options = conflict.get_options()
        
        # Choose option with lowest cost
        costs = [self.estimate_cost(option) for option in options]
        best_option = options[costs.index(min(costs))]
        
        return best_option
```

### Voting

**Approach 1: Simple Majority**
```python
class MajorityVoting:
    def vote(self, proposal, agents):
        votes = [agent.vote(proposal) for agent in agents]
        approval_rate = sum(votes) / len(votes)
        return approval_rate >= 0.5
```

**Approach 2: Weighted Voting**
```python
class WeightedVoting:
    def __init__(self, weights):
        self.weights = weights  # {agent_id: weight}
    
    def vote(self, proposal, agents):
        total_weight = 0
        approval_weight = 0
        
        for agent in agents:
            weight = self.weights.get(agent.id, 1.0)
            vote = agent.vote(proposal)
            total_weight += weight
            if vote:
                approval_weight += weight
        
        return approval_weight / total_weight >= 0.5
```

**Approach 3: Confidence-Weighted**
```python
class ConfidenceWeightedVoting:
    def vote(self, proposal, agents):
        total_confidence = 0
        approval_confidence = 0
        
        for agent in agents:
            vote, confidence = agent.vote_with_confidence(proposal)
            total_confidence += confidence
            if vote:
                approval_confidence += confidence
        
        return approval_confidence / total_confidence >= 0.5
```

### Escalation Policies

**Policy 1: Time-Based Escalation**
```python
class TimeBasedEscalation:
    def __init__(self, timeout=60):
        self.timeout = timeout
    
    def escalate_if_timeout(self, conflict, start_time):
        if now() - start_time > self.timeout:
            return self.escalate_to_human(conflict)
        return None
```

**Policy 2: Iteration-Based Escalation**
```python
class IterationBasedEscalation:
    def __init__(self, max_iterations=10):
        self.max_iterations = max_iterations
    
    def escalate_if_max_iterations(self, conflict, iterations):
        if iterations >= self.max_iterations:
            return self.escalate_to_human(conflict)
        return None
```

**Policy 3: Confidence-Based Escalation**
```python
class ConfidenceBasedEscalation:
    def __init__(self, min_confidence=0.7):
        self.min_confidence = min_confidence
    
    def escalate_if_low_confidence(self, conflict):
        max_confidence = max(agent.confidence for agent in conflict.agents)
        if max_confidence < self.min_confidence:
            return self.escalate_to_human(conflict)
        return None
```

---

## 6.5 Budget-Aware Coordination

### Coordination Costs

**Cost Types:**
- Communication cost (API calls)
- Time cost (latency)
- Computational cost (processing)
- Opportunity cost (delayed decisions)

### Budget-Aware Protocols

**Protocol 1: Cost-Limited Communication**
```python
class CostLimitedProtocol:
    def __init__(self, budget):
        self.budget = budget
        self.used = 0
    
    def can_communicate(self, cost):
        return self.used + cost <= self.budget
    
    def communicate(self, message, cost):
        if not self.can_communicate(cost):
            raise BudgetExceededException()
        self.used += cost
        return self.send(message)
```

**Protocol 2: Priority-Based Coordination**
```python
class PriorityBasedCoordination:
    def coordinate(self, agents, tasks):
        # Sort by priority
        sorted_tasks = sorted(tasks, key=lambda t: t.priority, reverse=True)
        
        # Allocate budget based on priority
        for task in sorted_tasks:
            if self.has_budget(task.cost):
                self.allocate(task)
            else:
                # Skip lower priority tasks
                break
```

**Protocol 3: Adaptive Coordination**
```python
class AdaptiveCoordination:
    def coordinate(self, agents, budget):
        # Start with full coordination
        coordination_level = 1.0
        
        while coordination_level > 0:
            cost = self.estimate_cost(coordination_level)
            if cost <= budget:
                return self.execute_with_level(coordination_level)
            else:
                # Reduce coordination level
                coordination_level -= 0.1
        
        # Fallback to minimal coordination
        return self.execute_minimal()
```

---

## 6.6 Key Takeaways

**Conflict Types:**
- Direct disagreement
- Stalling (deadlocks)
- False consensus
- Runaway collaboration

**Communication Protocols:**
- Request-response
- Publish-subscribe
- Consensus protocols
- Shared state management

**Conflict Prevention:**
- Deadlock detection and prevention
- Livelock detection and prevention
- Collaboration budgets
- Timeouts and limits

**Conflict Resolution:**
- Arbitration (authority, rule-based, cost-based)
- Voting (simple, weighted, confidence-weighted)
- Escalation (time, iteration, confidence-based)

**Budget-Aware Coordination:**
- Track coordination costs
- Limit communication by budget
- Prioritize high-value coordination
- Adapt coordination level to budget

---

## Practical Work: Inducing Agent Disagreement and Preventing Infinite Loops

**Objective:** Build conflict detection and resolution mechanisms

**Requirements:**
1. Create multi-agent system with potential conflicts
2. Implement communication protocols
3. Add shared state management
4. Build deadlock/livelock detection
5. Implement arbitration and voting
6. Add budget-aware coordination
7. Test conflict scenarios

**Deliverables:**
- Multi-agent system
- Communication protocols
- Shared state implementation
- Conflict detection mechanisms
- Resolution strategies
- Budget-aware coordination
- Test results

**Evaluation Criteria:**
- Conflict detection quality (20%)
- Communication protocol design (20%)
- Shared state management (20%)
- Deadlock/livelock prevention (20%)
- Resolution mechanisms (20%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Multi-Agent Coordination Protocols"
- "Deadlock Detection and Prevention"
- "Consensus Algorithms"

**Tools to Explore:**
- Multi-agent frameworks
- Consensus libraries
- Coordination protocols

**Next Module Preview:**
Module 7 will teach you how to safely roll back changes and manage versions in agent systems.

---

**Module 6 Complete**   
**Next:** Module 7 - Rollbacks, Versioning, and Safe Change Management
