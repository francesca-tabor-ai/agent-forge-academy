---
title: "Course Index & Reference Guide"
description: "Navigate all course materials and find what you need quickly"
order: 0
---

# Problem-Shooting Change, Drift, and Failure - Complete Index

## Course Materials Overview

This directory contains all course materials for the **Problem-Shooting Change, Drift, and Failure in Multi-Agent Systems** course.

---

## File Structure

### Core Course Files
1. **[README.md](README.md)** - Main course overview, start here
2. **INDEX.md** (this file) - Complete navigation guide
3. **[_COURSE_OVERVIEW.md](_COURSE_OVERVIEW.md)** - Quick start guide

### Module Files (Modules 1-12)

#### Foundations & Failure Taxonomy
- **[Module 01: Why "Working" Agent Systems Fail in Production](Module_01_Why_Working_Agent_Systems_Fail_in_Production.md)**
  - Mental models and failure taxonomy
  - Why agent failures are different from microservice failures
  - Non-determinism as a production liability
  - Silent degradation vs hard failure
  - Practical Work: Autopsy of a "successful" agent system

#### Architecture & Design
- **[Module 02: System Architecture for Failure-First Agents](Module_02_System_Architecture_for_Failure_First_Agents.md)**
  - Designing systems that expect to be wrong
  - Agents as control systems, not LLM wrappers
  - Explicit state, implicit state, and where bugs hide
  - Multi-agent topologies and their failure signatures
  - Practical Work: Refactoring a happy-path agent into a failure-tolerant system

#### Tools & Execution
- **[Module 03: Tool Contracts, Capability Drift, and Defensive Execution](Module_03_Tool_Contracts_Capability_Drift_Defensive_Execution.md)**
  - Tools as unstable dependencies
  - Schemas, invariants, and execution budgets
  - Capability probing vs optimistic calls
  - Graceful degradation strategies
  - Practical Work: Breaking a tool interface mid-execution

#### Debugging & Reproducibility
- **[Module 04: Determinism, Replay, and Rerunnable Agent Evals](Module_04_Determinism_Replay_Rerunnable_Agent_Evals.md)**
  - Capturing full agent trajectories
  - Replaying decisions with partial determinism
  - Golden traces vs golden answers
  - What "reproducible" means for agents
  - Practical Work: Building a replay harness that reproduces a real production failure

#### Evaluation & Drift Detection
- **[Module 05: Evaluation That Detects Drift, Not Just Accuracy](Module_05_Evaluation_That_Detects_Drift_Not_Just_Accuracy.md)**
  - Outcome vs process vs trajectory evaluation
  - Partial credit and degradation curves
  - Regression testing for planning quality
  - Eval sets that evolve with the system
  - Practical Work: Writing evals that catch subtle reasoning regressions

#### Coordination & Conflict
- **[Module 06: Multi-Agent Coordination Under Conflict and Uncertainty](Module_06_Multi_Agent_Coordination_Under_Conflict_Uncertainty.md)**
  - When agents disagree, stall, or hallucinate consensus
  - Communication protocols and shared state
  - Deadlocks, livelocks, and runaway collaboration
  - Arbitration, voting, and escalation policies
  - Practical Work: Inducing agent disagreement and preventing infinite loops

#### Change Management
- **[Module 07: Rollbacks, Versioning, and Safe Change Management](Module_07_Rollbacks_Versioning_Safe_Change_Management.md)**
  - Versioning prompts, agents, tools, and policies
  - Canarying behavioral changes
  - Backward compatibility for agent reasoning
  - Rolling back without losing in-flight work
  - Practical Work: Recovering from a bad deployment without restarting the system

#### Observability
- **[Module 08: Observability for Agent Reasoning and Decisions](Module_08_Observability_for_Agent_Reasoning_Decisions.md)**
  - Decision traces vs logs
  - Causal chains in multi-agent failures
  - Cost attribution per decision
  - Detecting behavioral drift early
  - Practical Work: Diagnosing a failure using traces only

#### Human Integration
- **[Module 09: Humans in the Loop Without Destroying Autonomy](Module_09_Humans_in_the_Loop_Without_Destroying_Autonomy.md)**
  - Humans as circuit breakers, not babysitters
  - Confidence-based escalation
  - Interrupt vs override vs approve
  - Learning from corrections without overfitting
  - Practical Work: Adding human intervention that improves reliability without doubling cost

#### Security & Safety
- **[Module 10: Security, Safety, and Containment Boundaries](Module_10_Security_Safety_Containment_Boundaries.md)**
  - Agents as potential attack surfaces
  - Tool and prompt injection at the system level
  - Least-privilege agents
  - Auditability and post-incident forensics
  - Practical Work: Exploiting the system, then hardening it

#### Cost Management
- **[Module 11: Cost Failures and Economic Drift](Module_11_Cost_Failures_Economic_Drift.md)**
  - Preventing financial incidents
  - Cost per decision, not per request
  - Adaptive reasoning depth
  - Speculative execution and early stopping
  - Practical Work: Reducing cost dramatically without harming eval performance

#### State Management
- **[Module 12: Long-Running, Stateful, and Resumable Agents](Module_12_Long_Running_Stateful_Resumable_Agents.md)**
  - Systems that survive time
  - Durable vs ephemeral memory
  - State corruption and recovery
  - Checkpointing and resumability
  - Practical Work: Resuming a partially completed long-running task after failure

---

## Quick Navigation

### By Learning Goal

**Want to understand why systems fail?**
→ Start with [Module 1](Module_01_Why_Working_Agent_Systems_Fail_in_Production.md)

**Need to design failure-tolerant systems?**
→ Read [Module 2](Module_02_System_Architecture_for_Failure_First_Agents.md)

**Dealing with tool failures?**
→ Study [Module 3](Module_03_Tool_Contracts_Capability_Drift_Defensive_Execution.md)

**Need to debug production issues?**
→ Review [Module 4](Module_04_Determinism_Replay_Rerunnable_Agent_Evals.md)

**Want to detect drift early?**
→ Explore [Module 5](Module_05_Evaluation_That_Detects_Drift_Not_Just_Accuracy.md)

**Agents conflicting or stalling?**
→ Check [Module 6](Module_06_Multi_Agent_Coordination_Under_Conflict_Uncertainty.md)

**Need safe deployments?**
→ Follow [Module 7](Module_07_Rollbacks_Versioning_Safe_Change_Management.md)

**Want better observability?**
→ Learn from [Module 8](Module_08_Observability_for_Agent_Reasoning_Decisions.md)

**Adding human oversight?**
→ See [Module 9](Module_09_Humans_in_the_Loop_Without_Destroying_Autonomy.md)

**Security concerns?**
→ Review [Module 10](Module_10_Security_Safety_Containment_Boundaries.md)

**Cost issues?**
→ Optimize with [Module 11](Module_11_Cost_Failures_Economic_Drift.md)

**Long-running tasks?**
→ Study [Module 12](Module_12_Long_Running_Stateful_Resumable_Agents.md)

---

## By Problem Type

### System Failures
- [Module 1](Module_01_Why_Working_Agent_Systems_Fail_in_Production.md) - Understanding failures
- [Module 2](Module_02_System_Architecture_for_Failure_First_Agents.md) - Designing for failure
- [Module 4](Module_04_Determinism_Replay_Rerunnable_Agent_Evals.md) - Debugging failures

### Tool & Integration Issues
- [Module 3](Module_03_Tool_Contracts_Capability_Drift_Defensive_Execution.md) - Tool contracts and drift
- [Module 7](Module_07_Rollbacks_Versioning_Safe_Change_Management.md) - Versioning tools

### Coordination Problems
- [Module 6](Module_06_Multi_Agent_Coordination_Under_Conflict_Uncertainty.md) - Conflict resolution
- [Module 9](Module_09_Humans_in_the_Loop_Without_Destroying_Autonomy.md) - Human coordination

### Quality & Drift
- [Module 5](Module_05_Evaluation_That_Detects_Drift_Not_Just_Accuracy.md) - Drift detection
- [Module 8](Module_08_Observability_for_Agent_Reasoning_Decisions.md) - Behavioral monitoring

### Operational Concerns
- [Module 7](Module_07_Rollbacks_Versioning_Safe_Change_Management.md) - Change management
- [Module 10](Module_10_Security_Safety_Containment_Boundaries.md) - Security and safety
- [Module 11](Module_11_Cost_Failures_Economic_Drift.md) - Cost management
- [Module 12](Module_12_Long_Running_Stateful_Resumable_Agents.md) - State management

---

## Learning Paths

### Path 1: Complete Course (Recommended)
Follow modules 1-12 in order for comprehensive understanding.

### Path 2: Production Operations Focus
1. Module 1 - Understand failures
2. Module 2 - Design for failure
3. Module 7 - Change management
4. Module 8 - Observability
5. Module 10 - Security

### Path 3: Debugging & Quality Focus
1. Module 1 - Failure taxonomy
2. Module 4 - Replay and debugging
3. Module 5 - Drift detection
4. Module 8 - Observability

### Path 4: Cost & Efficiency Focus
1. Module 2 - Architecture
2. Module 11 - Cost management
3. Module 12 - State management
4. Module 9 - Human efficiency

---

## Module Dependencies

**Start Here:**
- Module 1 (foundations)

**Builds on Module 1:**
- Module 2 (architecture)
- Module 3 (tools)
- Module 4 (debugging)

**Builds on Earlier Modules:**
- Module 5 (evaluation) - needs Module 1, 2
- Module 6 (coordination) - needs Module 1, 2
- Module 7 (change management) - needs Module 1, 2, 4
- Module 8 (observability) - needs Module 1, 2, 4
- Module 9 (human-in-loop) - needs Module 1, 2, 6
- Module 10 (security) - needs Module 1, 2, 7
- Module 11 (cost) - needs Module 1, 2, 8
- Module 12 (stateful) - needs Module 1, 2, 4, 7

---

## Practical Work Index

Each module includes hands-on practical work:

1. **Module 1:** Autopsy of a "successful" agent system
2. **Module 2:** Refactoring to failure-tolerant system
3. **Module 3:** Breaking and recovering from tool failures
4. **Module 4:** Building a replay harness
5. **Module 5:** Writing drift-detection evals
6. **Module 6:** Preventing agent conflicts and loops
7. **Module 7:** Safe rollback implementation
8. **Module 8:** Trace-based failure diagnosis
9. **Module 9:** Human intervention patterns
10. **Module 10:** Security hardening
11. **Module 11:** Cost optimization
12. **Module 12:** Resumable long-running tasks

---

## Additional Resources

- [README.md](README.md) - Course overview
- [_COURSE_OVERVIEW.md](_COURSE_OVERVIEW.md) - Quick start
- External resources linked in each module

---

**Ready to start?**

**[Begin with Module 1 →](Module_01_Why_Working_Agent_Systems_Fail_in_Production.md)**

---

**Version 1.0 | January 2025**
