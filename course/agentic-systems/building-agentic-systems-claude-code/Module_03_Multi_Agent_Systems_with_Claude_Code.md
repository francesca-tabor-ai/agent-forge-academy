---
title: "Module 3: Multi-Agent Systems with Claude Code"
description: "Build systems where multiple specialized agents coordinate. Learn orchestration patterns and when to use multi-agent architectures"
module: "3"
order: 3
---

# Module 3: Multi-Agent Systems with Claude Code

**Duration:** Week 3  
**Learning Objectives:**
- Recognize when single-agent systems fail and multi-agent systems are needed
- Understand core agent types and their specializations
- Master orchestration patterns for agent coordination
- Build working multi-agent workflows with Claude Code and code blocks

---

## 3.1 When One Agent Isn't Enough

### Failure modes of single-agent systems

**Single-agent systems work well for:**
- Simple, linear tasks
- Well-defined problems with clear solutions
- Tasks that don't require specialized knowledge
- Workflows with minimal decision points

**They fail when:**

#### Cognitive Overload
- **Problem:** Agent tries to handle too many different types of reasoning
- **Symptom:** Inconsistent quality, missed edge cases
- **Example:** An agent that classifies emails, extracts data, generates responses, and validates outputs

#### Conflicting Objectives
- **Problem:** Different parts of the task have competing goals
- **Symptom:** Suboptimal solutions, trade-off failures
- **Example:** An agent that must both maximize speed and ensure accuracy

#### Specialization Requirements
- **Problem:** Task requires deep expertise in multiple domains
- **Symptom:** Poor performance in specialized areas
- **Example:** An agent that handles legal analysis, financial calculations, and technical documentation

#### Scalability Limits
- **Problem:** Single agent becomes a bottleneck
- **Symptom:** Slow execution, can't parallelize
- **Example:** Processing thousands of documents sequentially

### Signals that require agent specialization

**Indicators you need multiple agents:**

1. **Different reasoning patterns required**
   - Some tasks need creative thinking, others need strict logic
   - Example: Content generation vs. data validation

2. **Different execution characteristics**
   - Some tasks are fast and deterministic, others are slow and exploratory
   - Example: Database queries vs. research tasks

3. **Different failure modes**
   - Some tasks fail gracefully, others need careful error handling
   - Example: API calls vs. critical calculations

4. **Different optimization goals**
   - Some tasks prioritize speed, others prioritize accuracy
   - Example: Real-time processing vs. batch analysis

5. **Independent work streams**
   - Tasks can be done in parallel without coordination
   - Example: Processing multiple documents simultaneously

---

## 3.2 Core Agent Types

### Planner Agent

**Role:** Uses Claude Code for system reasoning and strategic planning

**Responsibilities:**
- Analyze requirements and constraints
- Break down complex problems into tasks
- Determine execution order and dependencies
- Handle exceptions and edge cases
- Make high-level decisions

**Characteristics:**
- Primary tool: Claude Code
- Output: Structured plans and decisions
- Handles ambiguity and uncertainty
- Adapts to changing conditions

**When to use:**
- Initial planning phases
- Complex decision-making
- Workflow orchestration
- Exception handling

**Example:**
```python
# Planner Agent Output
{
  "plan": {
    "tasks": [
      {"id": "1", "type": "research", "topic": "market analysis"},
      {"id": "2", "type": "analyze", "depends_on": ["1"]},
      {"id": "3", "type": "generate", "depends_on": ["2"]}
    ],
    "execution_order": ["1", "2", "3"],
    "parallel_tasks": []
  }
}
```

### Executor Agents

**Role:** Operate primarily via code blocks to execute specific tasks

**Responsibilities:**
- Execute well-defined tasks
- Transform inputs to outputs
- Follow clear instructions
- Report results and errors
- Maintain execution state

**Characteristics:**
- Primary tool: Code blocks
- Deterministic behavior
- Fast and reliable
- Easy to test

**Types:**
- **Data Transformers:** Convert data formats, clean data
- **API Integrators:** Call external services, handle responses
- **Computational Agents:** Perform calculations, run algorithms
- **File Processors:** Read, write, manipulate files

**Example:**
```python
# Executor Agent: Data Transformer
def transform_data(input_data: dict, transformation_rules: dict) -> dict:
    """Transform input data according to rules."""
    result = {}
    for key, rule in transformation_rules.items():
        if rule["type"] == "extract":
            result[key] = extract_field(input_data, rule["path"])
        elif rule["type"] == "calculate":
            result[key] = calculate(input_data, rule["formula"])
    return result
```

### Research Agent

**Role:** External info gathering and knowledge synthesis

**Responsibilities:**
- Search external sources
- Gather relevant information
- Synthesize findings
- Validate information quality
- Present findings in structured format

**Characteristics:**
- Uses Claude Code for reasoning about what to search
- Uses code blocks for API calls and data retrieval
- Handles uncertainty in information quality
- Filters and ranks results

**When to use:**
- Need current information not in training data
- Require multiple sources for validation
- Need to gather domain-specific knowledge
- Research-intensive tasks

**Example Workflow:**
1. Claude Code determines search strategy
2. Code block executes searches (web, APIs, databases)
3. Claude Code synthesizes and validates results
4. Output structured research findings

### QA / Validator Agent

**Role:** Checks outputs against specs and quality criteria

**Responsibilities:**
- Validate outputs meet specifications
- Check quality thresholds
- Detect errors and anomalies
- Decide if work should proceed or retry
- Provide feedback for improvement

**Characteristics:**
- Uses Claude Code for complex validation logic
- Uses code blocks for deterministic checks
- Applies multiple validation criteria
- Provides actionable feedback

**Validation Types:**
- **Schema Validation:** Structure and types
- **Quality Validation:** Accuracy, completeness
- **Business Rule Validation:** Domain-specific rules
- **Performance Validation:** Speed, resource usage

**Example:**
```python
# Validator Agent
def validate_output(output: dict, spec: dict) -> ValidationResult:
    """Validate output against specification."""
    results = {
        "schema_valid": check_schema(output, spec["schema"]),
        "quality_score": calculate_quality(output, spec["quality_criteria"]),
        "business_rules_valid": check_business_rules(output, spec["rules"]),
        "errors": []
    }
    
    if not results["schema_valid"]:
        results["errors"].append("Schema validation failed")
    if results["quality_score"] < spec["min_quality"]:
        results["errors"].append(f"Quality score {results['quality_score']} below threshold")
    
    results["is_valid"] = len(results["errors"]) == 0
    return results
```

---

## 3.3 Orchestration Patterns

### Sequential pipelines

**Pattern:** Agents execute one after another in a fixed order

**Use when:**
- Tasks have strict dependencies
- Output of one agent is input to next
- Order matters for correctness

**Example:**
```
Planner → Research → Analyzer → Generator → Validator
```

**Implementation:**
- Each agent waits for previous to complete
- Pass outputs as inputs to next agent
- Handle errors at each stage

**Pros:**
- Simple to understand and debug
- Clear data flow
- Easy to add logging

**Cons:**
- Can't parallelize
- Slow if any step is slow
- No flexibility in execution order

### Conditional branching

**Pattern:** Different agents execute based on conditions

**Use when:**
- Different paths for different inputs
- Conditional logic determines workflow
- Need to handle multiple scenarios

**Example:**
```
Input → Classifier
  ├─ Type A → Agent A → Validator
  ├─ Type B → Agent B → Validator
  └─ Type C → Agent C → Validator
```

**Implementation:**
- Planner or Classifier determines path
- Route to appropriate executor
- Rejoin at common points

**Pros:**
- Handles diverse scenarios
- Optimizes for each case
- Flexible workflow

**Cons:**
- More complex to manage
- Need to handle all branches
- Testing becomes more complex

### Parallel execution

**Pattern:** Multiple agents execute simultaneously

**Use when:**
- Tasks are independent
- Can improve performance
- No shared state conflicts

**Example:**
```
Planner → Split
  ├─ Agent 1 (parallel)
  ├─ Agent 2 (parallel)
  └─ Agent 3 (parallel)
→ Merge → Validator
```

**Implementation:**
- Split work into independent chunks
- Execute agents in parallel
- Merge results when complete
- Handle partial failures

**Pros:**
- Much faster for independent work
- Better resource utilization
- Scales well

**Cons:**
- Need synchronization
- More complex error handling
- Resource management

### Human-in-the-loop checkpoints (when necessary)

**Pattern:** System pauses for human review or approval

**Use when:**
- High-stakes decisions
- Legal or compliance requirements
- Quality gates
- Exception handling

**Example:**
```
Planner → Executor → Validator
  ├─ Pass → Continue
  └─ Fail → Human Review → Decision
```

**Implementation:**
- Define checkpoint criteria
- Pause execution
- Present information to human
- Resume based on human decision

**Best Practices:**
- Minimize checkpoints (they slow the system)
- Make checkpoints actionable
- Provide clear context
- Enable quick decisions

---

## 3.4 Workshop

### Claude Code designs a multi-agent workflow

**Exercise:** Design a content generation system

**Requirements:**
- Research topic
- Generate multiple content variations
- Validate quality
- Select best version
- Format for publication

**Claude Code Design Process:**

1. **Analyze Requirements:**
   - What work needs to be done?
   - What are the dependencies?
   - What can be parallelized?

2. **Design Agent Architecture:**
   - Planner Agent: Overall orchestration
   - Research Agent: Gather information
   - Generator Agents: Create content (parallel)
   - Validator Agent: Check quality
   - Selector Agent: Choose best version
   - Formatter Agent: Prepare for publication

3. **Define Orchestration:**
   ```
   Planner → Research
     ↓
   Generator 1 (parallel)
   Generator 2 (parallel)
   Generator 3 (parallel)
     ↓
   Validator → Selector → Formatter
   ```

4. **Specify Interfaces:**
   - Input/output for each agent
   - Data formats
   - Error handling

### You implement it using only:

#### Claude prompts
- Define agent roles and responsibilities
- Specify decision-making logic
- Create validation criteria

#### Code blocks
- Research execution (API calls)
- Content generation (templates, transformations)
- Validation checks (schema, quality)
- Formatting (markdown, HTML, etc.)

#### Simple handoffs
- File-based: Agents read/write files
- Structured data: JSON between agents
- Status flags: Simple state management

**Implementation Steps:**

1. **Create Planner Agent Prompt:**
   ```
   You are a content generation planner. Given a topic:
   1. Determine research needs
   2. Plan content generation strategy
   3. Define quality criteria
   4. Create execution plan
   ```

2. **Implement Code Blocks:**
   - Research code block (web search, API calls)
   - Generator code blocks (content creation)
   - Validator code block (quality checks)
   - Formatter code block (output formatting)

3. **Wire Together:**
   - Planner outputs plan
   - Research executes and saves results
   - Generators read research and create content
   - Validator checks all versions
   - Selector chooses best
   - Formatter prepares final output

---

## 3.5 Deliverable

### Working multi-agent workflow with at least 3 agents

**Requirements:**

1. **System Design:**
   - At least 3 different agent types
   - Clear orchestration pattern
   - Defined interfaces

2. **Implementation:**
   - Claude prompts for planning/decision agents
   - Code blocks for execution agents
   - Working handoffs between agents

3. **Documentation:**
   - Agent roles and responsibilities
   - Data flow diagram
   - Interface specifications

4. **Demonstration:**
   - System executes end-to-end
   - All agents coordinate correctly
   - Handles at least one error case

**Evaluation Criteria:**
- System completeness
- Agent coordination
- Code quality
- Error handling
- Documentation clarity

---

## Key Takeaways

1. **Multi-agent systems are needed when single agents fail**
2. **Specialize agents by role: Planner, Executor, Research, Validator**
3. **Use orchestration patterns: Sequential, Conditional, Parallel**
4. **Minimize human checkpoints, but use when necessary**
5. **Design with Claude Code, execute with code blocks**

---

## Next Steps

In Module 4, you'll learn how to make these systems reliable through evaluation, constraints, and guardrails.
