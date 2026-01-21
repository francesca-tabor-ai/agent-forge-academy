---
title: "Module 2: Designing Work for Agents (Before You Build Anything)"
description: "Map work architecture before agent architecture. Define agent roles, responsibilities, and communication interfaces"
module: "2"
order: 2
---

# Module 2: Designing Work for Agents (Before You Build Anything)

**Duration:** Week 2  
**Learning Objectives:**
- Understand why work architecture comes before agent architecture
- Learn to identify decision, execution, and evaluation points in workflows
- Design clear agent roles and responsibilities
- Create interfaces and contracts that agents can't violate

---

## 2.1 Work Architecture > Agent Architecture

### Mapping work before mapping agents

**Critical Principle:** The work itself determines the agent architecture, not the other way around.

**Common Mistake:** Starting with agents ("I need a planner agent, an executor agent...") before understanding what work needs to be done.

**Correct Approach:**
1. Map the complete workflow
2. Identify where decisions are made
3. Identify where execution happens
4. Identify where evaluation occurs
5. Then assign agents to these points

### Identifying:

#### Decision points
**What they are:** Moments where the system must choose between options or paths

**Characteristics:**
- Require reasoning or evaluation
- Have multiple possible outcomes
- Need context to make the right choice
- Often benefit from Claude Code's reasoning

**Examples:**
- Should this document be routed to legal or finance?
- Is this code change safe to deploy?
- Which data source is most reliable?
- Does this output meet quality thresholds?

**Agent Assignment:** Planner agents or decision-making agents (often Claude Code)

#### Execution points
**What they are:** Moments where actual work gets done

**Characteristics:**
- Deterministic operations
- Clear inputs and outputs
- No ambiguity in what should happen
- Can be validated against specifications

**Examples:**
- Transform data from format A to format B
- Execute a database query
- Call an external API
- Generate a report from templates

**Agent Assignment:** Executor agents (often code blocks)

#### Evaluation points
**What they are:** Moments where outputs are checked against criteria

**Characteristics:**
- Compare actual vs. expected
- Apply quality thresholds
- Detect errors or anomalies
- Decide if work should proceed or retry

**Examples:**
- Does this output match the specification?
- Is the data quality acceptable?
- Are there any errors in the result?
- Should this trigger a human review?

**Agent Assignment:** Validator agents or QA agents

---

## 2.2 Agent Roles & Responsibilities

### Planner agents vs executor agents

**Fundamental Split:** Thinking vs. Doing

#### Planner Agents
**Responsibilities:**
- Analyze requirements and constraints
- Break down work into tasks
- Determine execution order
- Handle exceptions and edge cases
- Make strategic decisions

**Characteristics:**
- Use Claude Code for reasoning
- Output structured plans
- Handle ambiguity and uncertainty
- Adapt to changing conditions

**When to use:**
- Complex, multi-step workflows
- Situations requiring judgment
- Work that needs to adapt dynamically
- Initial planning and design phases

#### Executor Agents
**Responsibilities:**
- Execute specific, well-defined tasks
- Transform inputs to outputs
- Follow clear instructions
- Report results and errors
- Maintain state if needed

**Characteristics:**
- Primarily use code blocks
- Deterministic behavior
- Fast and reliable
- Easy to test and validate

**When to use:**
- Repetitive, well-understood tasks
- Data transformation
- API calls and integrations
- Calculations and computations

### Why most systems fail by overloading one agent

**Common Anti-Pattern:** One agent that plans, executes, and evaluates everything

**Problems:**
- **Cognitive overload:** Agent tries to do too much
- **Inefficiency:** Expensive reasoning for simple tasks
- **Unreliability:** More complexity = more failure points
- **Poor scalability:** Can't parallelize or optimize effectively

**Solution:** Split responsibilities across specialized agents

### Splitting "thinking" from "doing"

**Clear Separation:**
- **Thinking (Planner):** "What should be done?"
- **Doing (Executor):** "How to do it?"

**Benefits:**
- Planner can focus on strategy
- Executor can focus on efficiency
- Each can be optimized independently
- Easier to debug and improve

**Interface:** Planner outputs structured plans; Executor consumes and executes them

---

## 2.3 Interface Design for Agents

### How agents communicate via:

#### Structured outputs
**Definition:** Well-defined data formats that agents produce and consume

**Benefits:**
- Clear contracts between agents
- Easy to validate and parse
- Enables type checking
- Reduces ambiguity

**Examples:**
- JSON schemas
- TypeScript interfaces
- Protocol buffers
- Custom structured formats

**Best Practices:**
- Use schemas for validation
- Version your interfaces
- Document all fields
- Handle missing or invalid data gracefully

#### Code block inputs
**Definition:** Parameters passed to code blocks for execution

**Design Principles:**
- **Explicit:** All inputs clearly defined
- **Typed:** Use types to prevent errors
- **Validated:** Check inputs before execution
- **Documented:** Clear descriptions of what each input does

**Example:**
```python
def process_document(
    document_path: str,
    output_format: Literal["json", "xml", "csv"],
    include_metadata: bool = True
) -> dict:
    """Process a document and return structured data."""
    # Implementation
```

#### File-based handoffs
**Definition:** Agents communicate by reading/writing files

**When to use:**
- Large data transfers
- Persistent state
- Asynchronous workflows
- Cross-process communication

**Benefits:**
- Simple and reliable
- Easy to debug (inspect files)
- Enables resumability
- Works across different environments

**Best Practices:**
- Use clear naming conventions
- Include metadata files
- Clean up temporary files
- Version or timestamp outputs

### Designing contracts agents can't violate

**Principle:** Make it impossible (or very difficult) for agents to break the contract

**Techniques:**

1. **Type Safety**
   - Use strong typing
   - Validate at boundaries
   - Reject invalid inputs immediately

2. **Schema Validation**
   - JSON Schema for structured data
   - Validate before processing
   - Clear error messages for violations

3. **Immutability**
   - Don't modify inputs
   - Create new outputs
   - Preserve original data

4. **Bounded Execution**
   - Time limits
   - Resource limits
   - Output size limits

5. **Explicit Error Handling**
   - Define all possible errors
   - Handle gracefully
   - Never fail silently

**Example Contract:**
```typescript
interface TaskPlan {
  task_id: string;
  task_type: "transform" | "validate" | "route";
  inputs: Record<string, unknown>;
  expected_output: {
    format: string;
    schema: JSONSchema;
  };
  constraints: {
    max_execution_time_ms: number;
    max_output_size_bytes: number;
  };
}
```

---

## 2.4 Workshop

### Decompose a real workflow into agent-safe tasks

**Exercise:** Design an email processing system

**Workflow:**
1. Receive email
2. Classify email type
3. Extract key information
4. Route to appropriate handler
5. Generate response
6. Send response
7. Log interaction

**Decomposition Steps:**

1. **Identify Decision Points:**
   - Classify email type (spam, support, sales, etc.)
   - Determine routing destination
   - Decide if response is needed

2. **Identify Execution Points:**
   - Extract information from email
   - Generate response content
   - Send email
   - Log to database

3. **Identify Evaluation Points:**
   - Validate extracted information
   - Check response quality
   - Verify email was sent

4. **Assign Agents:**
   - **Classifier Agent (Planner):** Uses Claude Code to classify emails
   - **Extractor Agent (Executor):** Code block to extract structured data
   - **Router Agent (Planner):** Uses Claude Code to determine routing
   - **Response Generator (Planner):** Uses Claude Code to generate responses
   - **Email Sender (Executor):** Code block to send emails
   - **Validator Agent (QA):** Checks outputs against criteria

### Define agent contracts without writing any prompts yet

**Exercise:** Create contracts for each agent in the email system

**Contract Template:**
```typescript
// Classifier Agent Contract
interface ClassifierInput {
  email_content: string;
  email_metadata: {
    from: string;
    subject: string;
    received_at: string;
  };
}

interface ClassifierOutput {
  email_type: "spam" | "support" | "sales" | "other";
  confidence: number; // 0-1
  reasoning: string;
}

// Extractor Agent Contract
interface ExtractorInput {
  email_content: string;
  email_type: string;
  extraction_schema: JSONSchema;
}

interface ExtractorOutput {
  extracted_data: Record<string, unknown>;
  extraction_confidence: number;
  missing_fields: string[];
}
```

**Key Requirements:**
- All inputs and outputs defined
- Types specified
- Validation rules clear
- Error cases handled

---

## 2.5 Deliverable

### Agent role map + task boundaries

**Requirements:**

1. **Workflow Map:**
   - Complete workflow diagram
   - All decision, execution, and evaluation points marked
   - Data flow between steps

2. **Agent Role Definitions:**
   - List of all agents
   - Responsibilities for each
   - Type (Planner, Executor, Validator)

3. **Task Boundaries:**
   - Clear boundaries between agent responsibilities
   - No overlap or gaps
   - Handoff points defined

4. **Agent Contracts:**
   - Input/output schemas for each agent
   - Validation rules
   - Error handling specifications

**Evaluation Criteria:**
- Workflow completeness
- Clear agent separation
- Well-defined contracts
- Feasible implementation

---

## Key Takeaways

1. **Map work before mapping agents**
2. **Identify decision, execution, and evaluation points**
3. **Split thinking (Planner) from doing (Executor)**
4. **Design contracts that agents can't violate**
5. **Use structured outputs, code block inputs, and file-based handoffs**

---

## Next Steps

In Module 3, you'll learn how to build multi-agent systems where multiple specialized agents coordinate to accomplish complex tasks.
