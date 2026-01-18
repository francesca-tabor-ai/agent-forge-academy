---
title: "Course Overview & Getting Started"
description: "Master problem-shooting change, drift, and failure in multi-agent systems"
order: 0
---

# Problem-Shooting Change, Drift, and Failure in Multi-Agent Systems

## Course Overview

**Duration:** 12 modules  
**Level:** Advanced  
**Time Commitment:** 6-8 hours per week  
**Prerequisites:** Python, multi-agent systems basics, LLM knowledge

---

## What You'll Master

By completing this course, you will be able to:

- **systems that expect to fail and recover gracefully Development**: Design systems that expect to fail and recover gracefully
- **Detect Degradation**: Detect degradation before it becomes catastrophic
- **Diagnose Root**: Diagnose root causes in non-deterministic systems
- **Recover Safely**: Recover safely without losing in-flight work
- **Roll Back**: Roll back intelligently while preserving state
- **Adapt Without**: Adapt without escalating cost or risk

---

## Course Philosophy

This course treats **change as the default operating condition, not an edge case**.

Students are not rewarded for building agents that work once. They are evaluated on their ability to:

- **Detect degradation** - Identify problems before users notice
- **Diagnose root causes** - Understand why systems fail
- **Recover safely** - Restore functionality without data loss
- **Roll back intelligently** - Undo changes while preserving work
- **Adapt without escalating cost or risk** - Evolve systems economically

**Failure is intentional, instrumented, and graded.**

---

## Course Modules

### [Module 1: Why "Working" Agent Systems Fail in Production](Module_01_Why_Working_Agent_Systems_Fail_in_Production.md)
- Mental models and failure taxonomy
- Why agent failures differ from microservice failures
- Non-determinism as a production liability
- Silent degradation vs hard failure
- **Practical Work:** Autopsy of a "successful" agent system

### [Module 2: System Architecture for Failure-First Agents](Module_02_System_Architecture_for_Failure_First_Agents.md)
- Designing systems that expect to be wrong
- Agents as control systems, not LLM wrappers
- Explicit state, implicit state, and where bugs hide
- Multi-agent topologies and their failure signatures
- **Practical Work:** Refactoring a happy-path agent into a failure-tolerant system

### [Module 3: Tool Contracts, Capability Drift, and Defensive Execution](Module_03_Tool_Contracts_Capability_Drift_Defensive_Execution.md)
- Tools as unstable dependencies
- Schemas, invariants, and execution budgets
- Capability probing vs optimistic calls
- Graceful degradation strategies
- **Practical Work:** Breaking a tool interface mid-execution

### [Module 4: Determinism, Replay, and Rerunnable Agent Evals](Module_04_Determinism_Replay_Rerunnable_Agent_Evals.md)
- Capturing full agent trajectories
- Replaying decisions with partial determinism
- Golden traces vs golden answers
- What "reproducible" means for agents
- **Practical Work:** Building a replay harness that reproduces a real production failure

### [Module 5: Evaluation That Detects Drift, Not Just Accuracy](Module_05_Evaluation_That_Detects_Drift_Not_Just_Accuracy.md)
- Outcome vs process vs trajectory evaluation
- Partial credit and degradation curves
- Regression testing for planning quality
- Eval sets that evolve with the system
- **Practical Work:** Writing evals that catch subtle reasoning regressions

### [Module 6: Multi-Agent Coordination Under Conflict and Uncertainty](Module_06_Multi_Agent_Coordination_Under_Conflict_Uncertainty.md)
- When agents disagree, stall, or hallucinate consensus
- Communication protocols and shared state
- Deadlocks, livelocks, and runaway collaboration
- Arbitration, voting, and escalation policies
- **Practical Work:** Inducing agent disagreement and preventing infinite loops

### [Module 7: Rollbacks, Versioning, and Safe Change Management](Module_07_Rollbacks_Versioning_Safe_Change_Management.md)
- Versioning prompts, agents, tools, and policies
- Canarying behavioral changes
- Backward compatibility for agent reasoning
- Rolling back without losing in-flight work
- **Practical Work:** Recovering from a bad deployment without restarting the system

### [Module 8: Observability for Agent Reasoning and Decisions](Module_08_Observability_for_Agent_Reasoning_Decisions.md)
- Decision traces vs logs
- Causal chains in multi-agent failures
- Cost attribution per decision
- Detecting behavioral drift early
- **Practical Work:** Diagnosing a failure using traces only

### [Module 9: Humans in the Loop Without Destroying Autonomy](Module_09_Humans_in_the_Loop_Without_Destroying_Autonomy.md)
- Humans as circuit breakers, not babysitters
- Confidence-based escalation
- Interrupt vs override vs approve
- Learning from corrections without overfitting
- **Practical Work:** Adding human intervention that improves reliability without doubling cost

### [Module 10: Security, Safety, and Containment Boundaries](Module_10_Security_Safety_Containment_Boundaries.md)
- Agents as potential attack surfaces
- Tool and prompt injection at the system level
- Least-privilege agents
- Auditability and post-incident forensics
- **Practical Work:** Exploiting the system, then hardening it

### [Module 11: Cost Failures and Economic Drift](Module_11_Cost_Failures_Economic_Drift.md)
- Preventing financial incidents
- Cost per decision, not per request
- Adaptive reasoning depth
- Speculative execution and early stopping
- **Practical Work:** Reducing cost dramatically without harming eval performance

### [Module 12: Long-Running, Stateful, and Resumable Agents](Module_12_Long_Running_Stateful_Resumable_Agents.md)
- Systems that survive time
- Durable vs ephemeral memory
- State corruption and recovery
- Checkpointing and resumability
- **Practical Work:** Resuming a partially completed long-running task after failure

---

## Learning Approach

### Production-First Mindset
Every module focuses on real-world production scenarios. You'll learn to:
- Build systems that fail gracefully
- Monitor what actually matters
- Recover from failures quickly
- Prevent future failures

### Hands-On Practical Work
Each module includes practical exercises that:
- Test your understanding
- Build real systems
- Expose failure modes
- Develop debugging skills

### Failure as a Feature
Unlike traditional courses, this course:
- Intentionally breaks systems
- Tests recovery mechanisms
- Grades on resilience, not just correctness
- Rewards failure detection and recovery

---

## Prerequisites

**Required Knowledge:**
- Python programming (intermediate level)
- Understanding of multi-agent systems
- Basic knowledge of LLMs and agents
- Git/GitHub familiarity

**Helpful Experience:**
- Production systems operations
- Observability and monitoring
- Cost management
- Incident response

**Technical Setup:**
- Python 3.11+
- Code editor (VSCode/PyCharm)
- Access to LLM APIs (OpenAI, Anthropic, etc.)
- Monitoring tools (optional, covered in course)

---

## Assessment

**Total Points:** 100

- **Practical Work (60 pts):** 12 modules × 5 points each
- **Capstone Project (30 pts):** Build a production failure-tolerant system
- **Participation (10 pts):** Discussions and peer review

**Passing Grade:** 70+ points

---

## Time Commitment

- **Per Module:** 6-8 hours
  - Reading: 1-2 hours
  - Practical Work: 3-4 hours
  - Review: 1-2 hours
- **Total Course:** 72-96 hours over 12 weeks

---

## Career Impact

### Skills You'll Gain
- Production reliability engineering
- Failure-tolerant system design
- Cost-aware agent development
- Observability and debugging
- Incident response and recovery

### Market Demand
- High demand for reliability expertise
- Growing need for production-ready agent systems
- Critical shortage of failure-tolerant design skills

---

## Getting Started

1. **Review Prerequisites** - Ensure you have the required knowledge
2. **Set Up Environment** - Install Python, editor, and API access
3. **Read Module 1** - Start with the foundations
4. **Complete Practical Work** - Build real systems from day one

---

## Additional Resources

- [INDEX.md](INDEX.md) - Complete navigation guide
- [_COURSE_OVERVIEW.md](_COURSE_OVERVIEW.md) - Quick start guide
- External resources linked in each module

---

## Support

**Have Questions?**
- Check module discussions
- Review INDEX.md for navigation
- Consult external resources
- Engage with the community

---

**Ready to build resilient agent systems?**

**[Start with Module 1 →](Module_01_Why_Working_Agent_Systems_Fail_in_Production.md)**

---

**Version 1.0 | January 2025**  
*Production-ready. Failure-tolerant. Career-changing.*
