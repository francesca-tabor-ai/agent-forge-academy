---
title: "Agentic Systems and Tool Integration"
module: "Module 4"
week: 4
order: 4
description: "Build agentic systems with ReAct framework, external tool integration, prompt chaining, and multi-model architectures"
---

# Module 4: Agentic Systems and Tool Integration

## Introduction

Modern AI applications go beyond simple question-answering. This module teaches you to build agentic systems where LLMs reason about tasks, take actions through external tools, chain multiple prompts together, and integrate multiple models for robust solutions.

## Learning Objectives

- Implement the ReAct (Reason and Act) framework
- Design function calling schemas for external tool integration
- Build prompt chains and workflows for complex tasks
- Architect multi-model systems for improved reliability

---

## ReAct (Reason and Act)

### What is ReAct?

**ReAct** is a framework where the LLM generates **reasoning traces** (thoughts about what to do) and **task-specific actions** (calls to tools or APIs) in an interleaved manner. The model alternates between thinking and acting.

### ReAct Pattern

```
Thought: [Reasoning about the current situation]
Action: [Tool call with parameters]
Observation: [Result from tool]
Thought: [Reasoning about the observation]
Action: [Next tool call]
...
Final Answer: [Solution based on all observations]
```

### ReAct Example: Information Gathering

```
"Use the ReAct framework to find information about climate change impacts:

Thought: I need to find current information about climate change impacts. I should search for recent data.
Action: search_web(query="climate change impacts 2024")
Observation: Found articles about rising sea levels, extreme weather events, and biodiversity loss.

Thought: I need more specific data about economic impacts. Let me search for that.
Action: search_web(query="economic costs of climate change")
Observation: Found data showing trillions in potential economic losses.

Thought: Now I have enough information. Let me synthesize the findings.
Action: synthesize_information(topic="climate change impacts")
Observation: Created comprehensive summary covering environmental, economic, and social impacts.

Final Answer: Climate change impacts include [synthesized information]"
```

### ReAct Example: Data Analysis

```
"Analyze sales data using ReAct:

Thought: I need to understand the sales data structure first.
Action: read_file(file="sales_data.csv")
Observation: CSV file with columns: date, product, quantity, revenue, region

Thought: I should calculate total revenue by region to identify top performers.
Action: calculate_aggregate(data="sales_data.csv", group_by="region", metric="revenue", operation="sum")
Observation: Region A: $2.5M, Region B: $1.8M, Region C: $3.2M

Thought: Region C has the highest revenue. Let me analyze trends over time for this region.
Action: calculate_trends(data="sales_data.csv", filter="region='C'", metric="revenue", period="monthly")
Observation: Region C shows 15% growth month-over-month for the last 3 months.

Thought: I have enough information to provide insights.
Final Answer: Region C is the top performer with $3.2M in revenue and strong growth trends (15% MoM)."
```

### Implementing ReAct

#### Basic ReAct Template

```
"You are an AI agent that can reason and take actions. Use this format:

Thought: [Your reasoning about what to do next]
Action: [Tool name](parameters)
Observation: [Result from tool]

Repeat Thought-Action-Observation cycles until you have enough information, then provide:

Final Answer: [Your solution]"
```

#### ReAct with Tool Definitions

```
"You are an AI agent with access to these tools:

1. search_web(query): Search the internet for information
2. calculate(data, operation): Perform calculations
3. read_file(filename): Read file contents
4. send_email(to, subject, body): Send an email

Use the ReAct framework:
- Think about what you need to do
- Take actions using available tools
- Observe results
- Continue until task is complete

Task: [Your task]"
```

### ReAct Best Practices

1. **Explicit Reasoning**: Make thoughts clear and specific
2. **Actionable Actions**: Use concrete tool calls with parameters
3. **Observe Carefully**: Pay attention to tool outputs
4. **Iterate**: Continue until sufficient information gathered
5. **Error Handling**: Handle tool failures gracefully

### When to Use ReAct

- **Multi-step tasks**: Requiring multiple actions
- **Information gathering**: Need to search, query, or retrieve
- **Tool integration**: Working with external APIs or functions
- **Complex workflows**: Tasks that require reasoning between actions

---

## External Tool Usage

### Function Calling (JSON Schemas)

Modern LLMs support **function calling** where you define tools as JSON schemas, and the model can request to call these functions with appropriate parameters.

### Function Schema Structure

```json
{
  "name": "function_name",
  "description": "What the function does",
  "parameters": {
    "type": "object",
    "properties": {
      "param1": {
        "type": "string",
        "description": "Parameter description"
      },
      "param2": {
        "type": "number",
        "description": "Another parameter"
      }
    },
    "required": ["param1"]
  }
}
```

### Example: Web Search Function

```json
{
  "name": "search_web",
  "description": "Search the internet for current information on any topic",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The search query to look up"
      },
      "max_results": {
        "type": "integer",
        "description": "Maximum number of results to return (default: 5)",
        "default": 5
      }
    },
    "required": ["query"]
  }
}
```

### Example: Database Query Function

```json
{
  "name": "query_database",
  "description": "Execute a SQL query on the customer database",
  "parameters": {
    "type": "object",
    "properties": {
      "sql": {
        "type": "string",
        "description": "The SQL query to execute. Must be a SELECT statement only."
      }
    },
    "required": ["sql"]
  }
}
```

### Example: Email Function

```json
{
  "name": "send_email",
  "description": "Send an email to a recipient",
  "parameters": {
    "type": "object",
    "properties": {
      "to": {
        "type": "string",
        "description": "Recipient email address"
      },
      "subject": {
        "type": "string",
        "description": "Email subject line"
      },
      "body": {
        "type": "string",
        "description": "Email body content"
      },
      "priority": {
        "type": "string",
        "enum": ["low", "normal", "high"],
        "description": "Email priority level"
      }
    },
    "required": ["to", "subject", "body"]
  }
}
```

### Complete Tool Integration Example

```
"You are an AI assistant with access to these tools:

Tools:
1. search_web(query, max_results) - Search the internet
2. get_weather(location, date) - Get weather forecast
3. send_email(to, subject, body) - Send emails
4. calculate(expression) - Perform calculations

When you need to use a tool, request it in this format:
{
  "tool": "tool_name",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}

Task: Plan a weekend trip to Paris. Find current weather, search for activities, and send a summary email to user@example.com"
```

### Tool Execution Flow

1. **Define Tools**: Provide function schemas to the LLM
2. **LLM Reasoning**: Model decides when to use tools
3. **Function Call Request**: Model requests tool execution
4. **Execute Tool**: Your system executes the function
5. **Return Results**: Pass results back to the model
6. **Continue**: Model uses results for next steps

### Best Practices for Tool Design

1. **Clear Descriptions**: Explain what each tool does clearly
2. **Parameter Documentation**: Describe each parameter thoroughly
3. **Type Safety**: Use appropriate types (string, number, boolean, object)
4. **Required Fields**: Mark essential parameters as required
5. **Enums for Choices**: Use enums for limited options
6. **Error Handling**: Design tools to return clear error messages

### Common Tool Categories

#### Information Retrieval
- Web search
- Database queries
- File reading
- API calls

#### Computation
- Calculator functions
- Data analysis
- Statistical operations
- Format conversions

#### Communication
- Email sending
- SMS/notifications
- API webhooks
- Chat integrations

#### System Operations
- File operations
- Process management
- Configuration updates
- Logging

---

## Prompt Chaining and Workflows

### What is Prompt Chaining?

**Prompt Chaining** is a strategy where outputs from one prompt serve as inputs for the next prompt, creating a workflow that handles complex knowledge work through modular, specialized prompts.

### Why Use Prompt Chaining?

1. **Modularity**: Break complex tasks into manageable pieces
2. **Specialization**: Each prompt can focus on one aspect
3. **Quality**: Smaller, focused prompts often perform better
4. **Debugging**: Easier to identify issues in specific steps
5. **Reusability**: Chain components can be reused

### Simple Chain Example

```
Chain: Research → Analyze → Summarize

Step 1 (Research):
"Research the topic: [Topic]
Output: List of key facts and sources"

Step 2 (Analyze):
"Analyze these research findings: [Output from Step 1]
Output: Identify trends, patterns, and insights"

Step 3 (Summarize):
"Summarize this analysis: [Output from Step 2]
Output: Executive summary for non-technical audience"
```

### Complex Workflow Example

```
Workflow: Content Creation Pipeline

Step 1: Topic Research
Input: "Create content about [topic]"
Output: Research findings, key points, target audience insights

Step 2: Outline Generation
Input: Research findings from Step 1
Output: Detailed content outline with sections

Step 3: Content Writing
Input: Outline from Step 2
Output: First draft of content

Step 4: Fact-Checking
Input: Draft from Step 3, Research from Step 1
Output: Verified facts, flagged claims needing sources

Step 5: Editing
Input: Draft from Step 3, Fact-check results from Step 4
Output: Edited, fact-checked content

Step 6: SEO Optimization
Input: Edited content from Step 5
Output: SEO-optimized final content
```

### Prompt Chain Patterns

#### 1. Sequential Chain

```
A → B → C → D
```

Each step depends on the previous one.

#### 2. Parallel Chain

```
     → B
A → → C
     → D
```

Multiple steps run in parallel, then combine.

#### 3. Conditional Chain

```
A → [Condition] → B (if true) or C (if false) → D
```

Flow changes based on intermediate results.

#### 4. Iterative Chain

```
A → B → [Check] → (if not done) → B → [Check] → ...
```

Loop until condition is met.

### Implementing Prompt Chains

#### Manual Chaining

```
# Step 1
prompt1 = "Research: [topic]"
result1 = llm.generate(prompt1)

# Step 2
prompt2 = f"Analyze: {result1}"
result2 = llm.generate(prompt2)

# Step 3
prompt3 = f"Summarize: {result2}"
result3 = llm.generate(prompt3)
```

#### Workflow Framework

```python
# Pseudocode for workflow system
class PromptChain:
    def __init__(self):
        self.steps = []
        self.results = {}
    
    def add_step(self, name, prompt_template, dependencies):
        self.steps.append({
            'name': name,
            'prompt': prompt_template,
            'deps': dependencies
        })
    
    def execute(self, initial_input):
        for step in self.steps:
            # Build prompt from template and dependencies
            prompt = self.build_prompt(step, self.results)
            result = llm.generate(prompt)
            self.results[step['name']] = result
        return self.results
```

### Chain Design Best Practices

1. **Clear Inputs/Outputs**: Define what each step expects and produces
2. **Single Responsibility**: Each prompt should do one thing well
3. **Error Handling**: Design chains to handle failures gracefully
4. **Validation**: Check outputs before passing to next step
5. **Logging**: Track intermediate results for debugging

---

## Multi-Model Integration

### Why Multiple Models?

Different models have different strengths:
- **GPT-4**: Strong reasoning, code generation
- **Claude**: Long context, careful analysis
- **Gemini**: Multimodal capabilities
- **Specialized models**: Domain-specific expertise

### Multi-Model Strategies

#### 1. Model Selection

Choose the best model for each task:

```
Task: Code generation → Use GPT-4
Task: Long document analysis → Use Claude
Task: Image understanding → Use Gemini
Task: Fast responses → Use GPT-3.5
```

#### 2. Parallel Generation

Generate with multiple models, then combine:

```
Task: "Write a blog post about AI"

Model 1 (GPT-4): Generates outline
Model 2 (Claude): Generates content
Model 3 (GPT-3.5): Generates SEO keywords

Combine: Merge outputs into final post
```

#### 3. Voting/Consensus

Multiple models vote on the answer:

```
Question: "What is the best approach to X?"

Model 1: Approach A
Model 2: Approach A
Model 3: Approach B

Result: Approach A (majority vote)
```

#### 4. Weighted Ensemble

Weight outputs based on model strengths:

```
Code task:
- GPT-4: 70% weight (strong at code)
- Claude: 20% weight (good reasoning)
- GPT-3.5: 10% weight (fast, cheap)

Final output = weighted combination
```

#### 5. Sequential Specialization

Use different models for different steps:

```
Step 1 (Research): Claude (long context)
Step 2 (Analysis): GPT-4 (strong reasoning)
Step 3 (Writing): GPT-3.5 (fast generation)
Step 4 (Review): Claude (careful analysis)
```

### Multi-Model Architecture Example

```
System Architecture:

Input → Router → {
    Simple Q&A → GPT-3.5 (fast)
    Complex reasoning → GPT-4 (accurate)
    Long documents → Claude (context)
    Code tasks → GPT-4 (code)
    Multimodal → Gemini (vision)
} → Combiner → Output
```

### Implementation Pattern

```python
# Pseudocode for multi-model system
class MultiModelSystem:
    def __init__(self):
        self.models = {
            'gpt4': GPT4Model(),
            'claude': ClaudeModel(),
            'gemini': GeminiModel()
        }
    
    def route_task(self, task):
        # Determine best model(s) for task
        if task.type == 'code':
            return ['gpt4']
        elif task.type == 'long_context':
            return ['claude']
        elif task.requires_consensus:
            return ['gpt4', 'claude']  # Multiple models
    
    def execute(self, task):
        models = self.route_task(task)
        results = []
        
        for model_name in models:
            result = self.models[model_name].generate(task)
            results.append(result)
        
        # Combine results
        if len(results) == 1:
            return results[0]
        else:
            return self.combine_results(results, strategy='voting')
```

### When to Use Multi-Model

- **High-stakes decisions**: Need consensus or validation
- **Diverse requirements**: Different tasks need different strengths
- **Reliability**: Redundancy improves system robustness
- **Cost optimization**: Use cheaper models when appropriate
- **Quality assurance**: Multiple perspectives improve output

---

## Module Summary

### Key Takeaways

1. **ReAct Framework**: Interleave reasoning and actions for agentic behavior
2. **Function Calling**: Define tools as JSON schemas for external integration
3. **Prompt Chaining**: Break complex tasks into modular workflows
4. **Multi-Model Integration**: Leverage different models for different strengths

### Architecture Patterns

- **Simple Agent**: ReAct + Tools
- **Workflow System**: Prompt Chains
- **Enterprise System**: Multi-Model + Chains + Tools
- **Specialized Agent**: Domain-specific tools + ReAct

### Next Steps

- Build a ReAct agent with custom tools
- Design a prompt chain for a complex workflow
- Implement multi-model selection logic
- Move to Module 5 for industry-specific applications

---

## Exercises

1. **ReAct Implementation**: Build a ReAct agent that can search the web and send emails
2. **Tool Design**: Create JSON schemas for 5 different tools (database, API, file system, etc.)
3. **Prompt Chain**: Design a 5-step chain for content creation (research → outline → write → edit → optimize)
4. **Multi-Model System**: Design a system that routes tasks to appropriate models
5. **Complete Agent**: Combine ReAct, tools, chains, and multi-model selection into one system
6. **Error Handling**: Design error recovery strategies for tool failures and model inconsistencies
