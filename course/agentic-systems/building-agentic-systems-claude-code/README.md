---
title: "Course Overview & Getting Started"
description: "Design, deploy, and evaluate multi-agent systems where Claude Code plans, code blocks execute, and agents coordinate autonomously"
order: 0
---

# Building Agentic Systems with Claude Code & Code Blocks

## Course Overview

**Duration:** 5 weeks  
**Level:** Intermediate  
**Time Commitment:** 6-8 hours per week  
**Prerequisites:** Basic programming, understanding of LLMs, familiarity with Claude Code

---

## What You'll Master

By completing this course, you will be able to:

- Design work for agents instead of just writing code
- Build multi-agent systems where Claude Code plans and code blocks execute
- Create reliable systems with evaluation, constraints, and guardrails
- Deploy production-ready agentic systems that work every time
- Stop asking "How do I code this?" and start asking "How should this work be designed?"

---

## Course Outcome

**By the end of this course, students can design, deploy, and evaluate multi-agent systems where Claude Code plans, code blocks execute, and agents coordinate without human micromanagement.**

**This course is not about writing code faster. It is about designing work so code executes itself.**

---

## Course Modules

### [Module 1: Claude Code as a Systems Designer (Foundations)](Module_01_Claude_Code_as_a_Systems_Designer.md)
- Mental shift from coding to work design
- Understanding Claude Code capabilities and limitations
- Code blocks as the execution layer
- **Workshop:** Ask Claude Code to design a system with zero manual coding

### [Module 2: Designing Work for Agents (Before You Build Anything)](Module_02_Designing_Work_for_Agents.md)
- Work architecture before agent architecture
- Identifying decision, execution, and evaluation points
- Agent roles and responsibilities (Planner vs. Executor)
- Interface design for agents
- **Workshop:** Decompose workflows and define agent contracts

### [Module 3: Multi-Agent Systems with Claude Code](Module_03_Multi_Agent_Systems_with_Claude_Code.md)
- When one agent isn't enough
- Core agent types: Planner, Executor, Research, QA/Validator
- Orchestration patterns: Sequential, Conditional, Parallel, Human-in-the-loop
- **Workshop:** Build a working multi-agent workflow with at least 3 agents

### [Module 4: Making Systems Reliable (Evals, Constraints & Guardrails)](Module_04_Making_Systems_Reliable.md)
- Why demos lie: "Looks good once" vs. "Works every time"
- Designing constraints that bound autonomy safely
- Evaluation systems: Automated checks vs. heuristic checks
- Improvement loops: Evaluate → Diagnose → Modify → Repeat
- **Workshop:** Build an eval agent and run improvement loops

### [Module 5: Production Systems & Real-World Deployment](Module_05_Production_Systems_and_Real_World_Deployment.md)
- Cost, tokens, and performance optimization
- System hardening: Preventing cascading failures, fallback strategies
- Human override design
- Documentation as executable infrastructure
- **Final Project:** Production-ready multi-agent system

---

## Core Principles

### The Mental Shift

**From:** "How do I code this?"  
**To:** "How should this work be designed so agents can execute it?"

### Key Concepts

1. **Claude Code is a systems designer, not just a code writer**
   - Use Claude Code for planning, reasoning, and architecture
   - Use code blocks for execution

2. **Work architecture > Agent architecture**
   - Map the work first, then assign agents
   - Identify decision, execution, and evaluation points

3. **Separate thinking from doing**
   - Planner agents use Claude Code for reasoning
   - Executor agents use code blocks for execution

4. **Design for reliability, not just functionality**
   - "Looks good once" ≠ "Works every time"
   - Build evaluation systems and improvement loops

5. **Code blocks are cheap execution units**
   - Orders of magnitude cheaper than agent loops
   - Use for deterministic, well-understood tasks

---

## Technology Stack

### Core Tools
- **Claude Code:** Systems design, planning, reasoning
- **Code Blocks:** Execution layer for deterministic tasks
- **Structured Outputs:** Agent communication (JSON, schemas)
- **File-based Handoffs:** Agent coordination

### Evaluation & Monitoring
- Automated validation (schema, format, performance)
- Heuristic evaluation (Claude Code for quality assessment)
- Logging and error tracking
- Performance monitoring

---

## Assessment Structure

- **Module Workshops (50%):** Hands-on exercises in each module
- **Final Project (40%):** Production-ready multi-agent system
- **Documentation (10%):** System architecture and agent specifications

**Passing:** Complete all workshops and final project with working system

---

## Career Outcomes

### Skills Acquired
- Agentic system architecture design
- Multi-agent orchestration patterns
- Evaluation and reliability engineering
- Production deployment of AI systems
- Cost and performance optimization

### Applications
- Automated content generation systems
- Document processing pipelines
- Research and analysis workflows
- Quality assurance automation
- Complex workflow automation

---

## Getting Started

### Prerequisites Checklist
- [ ] Access to Claude Code (Anthropic API or Cursor)
- [ ] Basic programming knowledge (Python recommended)
- [ ] Understanding of LLMs and their capabilities
- [ ] Familiarity with structured data (JSON, schemas)
- [ ] Code editor with good markdown support

### Week 1 Preparation
1. Review Claude Code documentation
2. Understand code blocks concept
3. Set up development environment
4. Review Module 1 materials
5. Prepare to think differently about coding

---

## Course Philosophy

### What This Course Actually Teaches

**You will stop asking:**
- "How do I code this?"
- "What's the best algorithm?"
- "How do I optimize this function?"

**And start asking:**
- "How should this work be designed so agents can execute it?"
- "What are the decision points in this workflow?"
- "How do I evaluate if this is working correctly?"

### The Real Promise

This course transforms you from:
- **Implementer** → **Architect**
- **Coder** → **Designer**
- **Debugger** → **Evaluator**
- **Optimizer** → **Orchestrator**

---

## Additional Resources

### Documentation
- [Claude Code Documentation](https://docs.anthropic.com/claude/docs)
- [Structured Outputs Guide](https://docs.anthropic.com/claude/docs/structured-outputs)
- [Code Blocks Best Practices](https://docs.anthropic.com/claude/docs/code-blocks)

### Concepts to Review
- System architecture patterns
- Workflow design
- Evaluation methodologies
- Error handling strategies

---

## Course Materials

Each module includes:
- Detailed lessons with examples
- Architecture diagrams and patterns
- Best practices and anti-patterns
- Hands-on workshops
- Deliverables and evaluation criteria

---

## Success Principles

1. **Design first, code second**
   - Always map the work before building agents
   - Define interfaces and contracts early

2. **Separate concerns**
   - Planning agents use Claude Code
   - Execution agents use code blocks
   - Evaluation agents check both

3. **Build for reliability**
   - Define "good enough" explicitly
   - Create evaluation systems
   - Build improvement loops

4. **Optimize costs**
   - Use code blocks for execution
   - Reserve Claude Code for reasoning
   - Monitor and measure

5. **Document as you build**
   - Make specs executable
   - Teach agents about the system
   - Enable future improvements

---

## Course Navigation

- [Start with Module 1 →](Module_01_Claude_Code_as_a_Systems_Designer.md)
- [View Course Metadata →](_COURSE_METADATA.md)

---

**Ready to transform from coder to systems designer? Let's begin!**
