---
title: "Module 1: Claude Code as a Systems Designer (Foundations)"
description: "Mental shift from coding to work design. Understanding Claude Code capabilities and code blocks as execution layer"
module: "1"
order: 1
---

# Module 1: Claude Code as a Systems Designer (Foundations)

**Duration:** Week 1  
**Learning Objectives:**
- Understand the fundamental mental shift from coding to work design
- Recognize when Claude Code should design vs. when you should code
- Master Claude Code's capabilities and limitations
- Learn to treat code blocks as cheap, deterministic execution units

---

## 1.1 Mental Shift: From Coding → Work Design

### Why Claude Code is not "just an LLM with coding skills"

Claude Code represents a paradigm shift in how we approach software development. It's not merely a tool that writes code faster—it's a systems designer that reasons about architecture, structure, and execution.

**Key Distinction:**
- **Traditional Coding:** You write code to solve problems
- **Work Design with Claude Code:** You design how work should be executed, and agents handle the implementation

### The difference between:

#### Writing Code
- Focus on syntax, logic, and implementation details
- Manual debugging and iteration
- Direct control over every line
- Time-intensive and error-prone

#### Designing Executable Work
- Focus on outcomes, workflows, and system behavior
- Define contracts and interfaces
- Specify what should happen, not how
- Leverage agents for implementation

### When not to write code yourself

**Use Claude Code when:**
- The problem requires architectural reasoning
- You need to explore multiple solution approaches
- The system involves complex interdependencies
- You want to design for future extensibility
- The work can be decomposed into clear, executable units

**Write code yourself when:**
- The solution is trivial (one-off scripts)
- You need domain-specific optimizations
- Real-time performance is critical
- The logic is already well-understood and stable

---

## 1.2 Claude Code Capabilities Deep Dive

### How Claude reasons about systems, files, and structure

Claude Code excels at:
- **System-level thinking:** Understanding how components interact
- **Pattern recognition:** Identifying architectural patterns and anti-patterns
- **Dependency analysis:** Mapping relationships between modules
- **Refactoring reasoning:** Understanding impact of changes across codebases

### What Claude Code is good at:

#### Planning
- Breaking down complex problems into manageable tasks
- Identifying dependencies and execution order
- Designing workflows and data flows
- Creating system architectures

#### Refactoring
- Understanding existing code structure
- Identifying improvement opportunities
- Maintaining consistency across changes
- Preserving functionality while improving design

#### Architectural reasoning
- Evaluating trade-offs between approaches
- Designing for scalability and maintainability
- Creating extensible interfaces
- Balancing complexity vs. simplicity

### What it is bad at (and how to compensate)

**Limitations:**
- **Real-time constraints:** Claude Code doesn't execute in real-time
- **State management:** Can't maintain persistent state across sessions
- **External integrations:** Limited direct access to APIs and services
- **Performance optimization:** May not optimize for specific runtime environments

**Compensation strategies:**
- Use code blocks for execution and state management
- Design clear interfaces for external integrations
- Separate planning (Claude) from execution (code blocks)
- Build evaluation loops to measure and improve performance

---

## 1.3 Code Blocks as the Execution Layer

### Why code blocks beat:

#### Custom tools
- **Simplicity:** No need to define tool schemas or handle tool registration
- **Flexibility:** Can execute any code, not limited to predefined tools
- **Cost:** Lower token overhead than tool-calling patterns
- **Determinism:** Predictable execution without LLM interpretation

#### Overbuilt automations
- **Lightweight:** Minimal infrastructure required
- **Direct:** No abstraction layers between design and execution
- **Debuggable:** Standard code execution with clear error messages
- **Replaceable:** Easy to swap implementations

#### Token-heavy agent loops
- **Efficiency:** Execute logic directly without LLM reasoning
- **Speed:** Faster than multi-turn agent conversations
- **Cost:** Significantly cheaper than repeated LLM calls
- **Reliability:** Deterministic execution reduces variability

### Treating code blocks as:

#### Cheap execution units
- Design many small, focused code blocks
- Don't optimize prematurely—replace if needed
- Treat execution as a commodity resource
- Measure cost in compute, not tokens

#### Deterministic interfaces
- Code blocks have predictable inputs and outputs
- No ambiguity in execution behavior
- Easy to test and validate
- Clear contracts between components

#### Replaceable components
- Design for swappability from the start
- Use standard interfaces (functions, APIs)
- Keep code blocks focused and single-purpose
- Enable A/B testing of different implementations

---

## 1.4 Workshop

### Ask Claude Code to design (not write) a system

**Exercise:** Design a document processing pipeline

**Steps:**
1. **Define the problem:** Process incoming documents, extract key information, and route to appropriate handlers
2. **Ask Claude Code to design:** Request a system architecture, not implementation
3. **Review the design:** Evaluate the proposed structure, interfaces, and flow
4. **Iterate on design:** Refine based on requirements and constraints

**Claude Code Output Should Include:**
- System architecture diagram (textual)
- Component responsibilities
- Data flow between components
- Interface definitions
- Error handling strategy

### Convert its plan into executable code blocks without touching logic

**Steps:**
1. **Identify execution points:** Where does actual work happen?
2. **Create code blocks:** One block per execution unit
3. **Define interfaces:** Input/output contracts for each block
4. **Wire together:** Connect blocks according to Claude's design
5. **Validate:** Ensure the system matches the design

**Key Principle:** The logic comes from Claude's design. Your job is to implement the execution layer faithfully.

---

## 1.5 Deliverable

### A Claude-generated system plan with zero manual coding

**Requirements:**
- Complete system architecture designed by Claude Code
- Clear component boundaries and responsibilities
- Defined interfaces between components
- Execution plan with code block specifications
- No manual coding required—only design and planning

**Evaluation Criteria:**
- Design completeness (all components specified)
- Interface clarity (inputs/outputs defined)
- Execution feasibility (can be implemented as code blocks)
- System coherence (components work together logically)

---

## Key Takeaways

1. **Claude Code is a systems designer, not just a code writer**
2. **Design work for execution, don't just write code**
3. **Code blocks are cheap, deterministic execution units**
4. **Separate planning (Claude) from execution (code blocks)**
5. **Design for replaceability and simplicity**

---

## Next Steps

In Module 2, you'll learn how to design work specifically for agents—mapping workflows, defining agent roles, and creating contracts that agents can't violate.
