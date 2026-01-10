---
title: "The Prompting Mindset and Basic Frameworks"
module: "Module 2"
week: 2
order: 2
description: "Transitioning from search engine to reasoning engine mindset, and learning core prompting architectures (ROSES, CO-STAR, CREATE) and learning paradigms"
---

# Module 2: The Prompting Mindset and Basic Frameworks

## Introduction

Effective prompt engineering requires a fundamental shift in how we think about interacting with AI systems. This module teaches you to move from a search engine mindset to a reasoning engine approach, and introduces structured frameworks that ensure consistent, high-quality outputs.

## Learning Objectives

- Understand the engineering shift from search to reasoning
- Master the ROSES prompting framework
- Apply the CO-STAR framework for content creation
- Use the CREATE framework for structured outputs
- Differentiate between zero-shot, one-shot, and few-shot prompting

---

## The Engineering Shift: From Search Engine to Reasoning Engine

### The Search Engine Mindset (What to Avoid)

Traditional search engines work with:
- **Brevity**: Short queries are preferred
- **Keywords**: Focus on matching terms
- **Results**: Return existing information
- **Speed**: Quick, simple interactions

**Example of search engine thinking:**
```
"AI benefits"
```

### The Reasoning Engine Mindset (What to Embrace)

LLMs work best with:
- **Clarity**: Detailed, explicit instructions
- **Context**: Rich background information
- **Reasoning**: Step-by-step thinking processes
- **Specificity**: Clear objectives and constraints

**Example of reasoning engine thinking:**
```
"You are an AI consultant. Your objective is to explain the benefits of artificial intelligence for small businesses. Consider the following scenario: A small retail business owner with limited technical knowledge wants to understand how AI could help their operations. Provide a clear, practical explanation that covers: 1) Cost reduction opportunities, 2) Customer experience improvements, 3) Operational efficiency gains. Structure your response with specific examples relevant to retail businesses."
```

### Key Differences

| Search Engine | Reasoning Engine |
|--------------|------------------|
| Short queries | Detailed prompts |
| Keyword matching | Context understanding |
| Existing information | Generated reasoning |
| Quick answers | Thoughtful responses |
| "What exists?" | "What should be created?" |

### Practical Transformation

**Before (Search Engine):**
```
"Marketing tips"
```

**After (Reasoning Engine):**
```
"Act as a marketing expert. Analyze the current digital marketing landscape for B2B SaaS companies. Provide actionable strategies that focus on: 1) Content marketing approaches that drive qualified leads, 2) Social media tactics for professional audiences, 3) Email marketing sequences that convert. Include specific examples and metrics where relevant."
```

### Why Clarity Over Brevity?

1. **Reduces Ambiguity**: Clear instructions prevent misinterpretation
2. **Activates Relevant Knowledge**: Detailed context helps the model access the right information
3. **Improves Consistency**: Explicit requirements lead to more predictable outputs
4. **Enables Complex Tasks**: Reasoning engines can handle multi-step processes

---

## Core Prompting Architectures

### ROSES Framework

**ROSES** stands for: **Role, Objective, Scenario, Expected Solution, Steps**

This framework is ideal for problem-solving and task-oriented prompts.

#### Components

1. **Role**: Define who the AI is acting as
2. **Objective**: What needs to be accomplished
3. **Scenario**: The context and situation
4. **Expected Solution**: What the output should look like
5. **Steps**: The process to follow

#### ROSES Template

```
Role: [Who is the AI acting as?]
Objective: [What is the goal?]
Scenario: [What is the context?]
Expected Solution: [What should the output contain?]
Steps: [How should the task be approached?]
```

#### ROSES Example: Business Problem Solving

```
Role: You are a business strategy consultant with 15 years of experience in retail operations.

Objective: Develop a strategy to increase online sales by 30% over the next quarter.

Scenario: A mid-sized clothing retailer has seen steady in-store sales but online sales have plateaued. They have a basic e-commerce website, active social media presence, but limited digital marketing expertise. Their target audience is millennials and Gen Z interested in sustainable fashion.

Expected Solution: Provide a comprehensive strategy document that includes:
- Specific marketing tactics with timelines
- Budget allocation recommendations
- Key performance indicators (KPIs) to track
- Risk mitigation strategies
- Implementation roadmap

Steps:
1. Analyze current online presence and identify gaps
2. Research competitor strategies in sustainable fashion
3. Develop multi-channel marketing approach
4. Create content strategy aligned with target audience
5. Outline technology and tool recommendations
6. Provide measurement framework
```

#### When to Use ROSES

- Problem-solving tasks
- Strategic planning
- Analysis and recommendations
- Multi-step processes
- Business applications

---

### CO-STAR Framework

**CO-STAR** stands for: **Context, Objective, Style, Tone, Audience, Response**

This framework excels at content creation and communication tasks.

#### Components

1. **Context**: Background information and situation
2. **Objective**: What the content should achieve
3. **Style**: Writing style and format
4. **Tone**: Emotional quality and voice
5. **Audience**: Who will read/consume this
6. **Response**: Specific requirements for the output

#### CO-STAR Template

```
Context: [Background information]
Objective: [What should this achieve?]
Style: [Writing style/format]
Tone: [Emotional quality]
Audience: [Target readers]
Response: [Output requirements]
```

#### CO-STAR Example: Blog Post Creation

```
Context: A technology company is launching a new AI-powered customer service tool. The industry is competitive, and they need to differentiate themselves while educating potential customers about AI capabilities.

Objective: Create a blog post that educates readers about AI in customer service, positions the company as a thought leader, and generates interest in the product without being overly salesy.

Style: Long-form article (1,200-1,500 words) with:
- Engaging introduction with a real-world scenario
- Data-driven arguments with statistics
- Practical examples and case studies
- Clear section headers
- Actionable takeaways

Tone: Professional yet approachable, confident but not arrogant, informative without being condescending.

Audience: Mid-level managers in customer service departments at medium-to-large companies. They have some technical knowledge but aren't AI experts. They're looking for practical solutions to improve their operations.

Response: The blog post should:
- Start with a relatable customer service challenge
- Explain AI capabilities in accessible language
- Include 2-3 concrete examples of AI improving customer service
- Address common concerns (job displacement, cost, implementation)
- End with clear next steps for readers interested in exploring AI solutions
```

#### When to Use CO-STAR

- Content creation (blogs, articles, emails)
- Marketing materials
- Communication tasks
- Creative writing
- Educational content

---

### CREATE Framework

**CREATE** stands for: **Character, Request, Examples, Additions, Type of output, Extras**

This framework is excellent for structured, example-driven outputs.

#### Components

1. **Character**: The persona or role
2. **Request**: The main task
3. **Examples**: Sample outputs to guide style
4. **Additions**: Additional requirements or constraints
5. **Type of output**: Format specification
6. **Extras**: Bonus features or considerations

#### CREATE Template

```
Character: [Who is the AI?]
Request: [What is needed?]
Examples: [Sample outputs]
Additions: [Extra requirements]
Type of output: [Format]
Extras: [Additional features]
```

#### CREATE Example: Code Documentation

```
Character: You are a senior software engineer specializing in API documentation. You write clear, concise documentation that helps developers quickly understand and implement APIs.

Request: Generate comprehensive documentation for a REST API endpoint that handles user authentication.

Examples:
- See the Stripe API documentation style: clear endpoint descriptions, request/response examples, error codes
- Follow the GitHub API documentation pattern: include curl examples, response schemas, rate limiting information

Additions:
- Include security considerations
- Provide code examples in Python, JavaScript, and cURL
- Document all possible error responses
- Include rate limiting information
- Add troubleshooting section

Type of output: Markdown-formatted API documentation with:
- Endpoint description
- Authentication requirements
- Request parameters (with types and descriptions)
- Response format (with example JSON)
- Error codes and meanings
- Code examples
- Security notes

Extras:
- Include a "Quick Start" section for developers new to the API
- Add a "Common Use Cases" section with real-world scenarios
- Provide a testing checklist
```

#### When to Use CREATE

- When you have good examples to reference
- Structured output requirements
- Style consistency is critical
- Code and technical documentation
- Format-specific tasks

---

## Learning Paradigms

### Zero-Shot Prompting

**Definition**: Providing a task description without any examples.

The model relies entirely on its training data to understand the task.

#### Zero-Shot Example

```
"Classify the following email as spam or not spam:

Email: 'Congratulations! You've won $1,000,000. Click here to claim your prize.'

Classification:"
```

#### When to Use Zero-Shot

- Simple, well-defined tasks
- The model has strong training data for the task
- You want quick, straightforward responses
- The task is common in training data

#### Advantages

- Fast and simple
- No example preparation needed
- Works well for common tasks

#### Limitations

- May not work for novel or complex tasks
- Less control over output format
- Can be inconsistent for edge cases

---

### One-Shot Prompting

**Definition**: Providing a single example before the actual task.

The example demonstrates the desired format and approach.

#### One-Shot Example

```
"Classify emails as spam or not spam.

Example:
Email: 'Meeting reminder: Team standup at 3 PM today in Conference Room A.'
Classification: Not spam

Now classify this email:
Email: 'URGENT! Your account will be closed. Verify your information immediately.'
Classification:"
```

#### When to Use One-Shot

- You need to establish a specific format
- The task is somewhat novel
- You want to guide the model's approach
- Format consistency is important

#### Advantages

- Establishes clear format expectations
- Better than zero-shot for format-specific tasks
- Still relatively simple

#### Limitations

- May overfit to the single example
- Limited guidance for complex tasks

---

### Few-Shot Prompting

**Definition**: Providing multiple examples (typically 3-10) before the actual task.

This is the most powerful learning paradigm for steering model behavior.

#### Few-Shot Example

```
"Classify customer feedback as positive, neutral, or negative.

Examples:
1. Email: 'The product arrived quickly and works perfectly. Very satisfied!'
   Classification: Positive

2. Email: 'The delivery was delayed by two days, but the product quality is good.'
   Classification: Neutral

3. Email: 'Terrible experience. Product broke after one day. Requesting refund immediately.'
   Classification: Negative

4. Email: 'Love the new features! This is exactly what I needed for my workflow.'
   Classification: Positive

5. Email: 'The interface is confusing and the support team was unhelpful.'
   Classification: Negative

Now classify this email:
Email: 'The product is okay, nothing special but it does the job.'
Classification:"
```

#### When to Use Few-Shot

- Complex or nuanced tasks
- You need high consistency
- The task requires specific reasoning patterns
- Output format is critical
- You have good examples available

#### Advantages

- Strong pattern establishment
- High consistency
- Can handle complex tasks
- Flexible format control

#### Limitations

- Consumes more tokens
- Requires good example selection
- Examples must be representative

#### Best Practices for Few-Shot

1. **Diversity**: Include varied examples covering different cases
2. **Quality**: Use high-quality, clear examples
3. **Representativeness**: Examples should match real-world distribution
4. **Quantity**: 3-5 examples often sufficient; more for complex tasks
5. **Ordering**: Place clearest examples first

---

## Choosing the Right Framework and Paradigm

### Decision Matrix

| Task Type | Recommended Framework | Recommended Paradigm |
|-----------|----------------------|---------------------|
| Problem-solving | ROSES | Few-shot |
| Content creation | CO-STAR | One-shot or Few-shot |
| Structured output | CREATE | Few-shot |
| Simple classification | Any | Zero-shot or One-shot |
| Code generation | CREATE | Few-shot |
| Analysis | ROSES | Few-shot |
| Creative writing | CO-STAR | One-shot |

### Combining Approaches

You can combine frameworks and paradigms:

**Example: ROSES + Few-Shot**
```
Role: Data analyst
Objective: Identify trends in sales data
Scenario: [context]
Expected Solution: [requirements]
Steps: [process]

Examples of good analysis:
[Example 1]
[Example 2]
[Example 3]

Now analyze: [new data]
```

---

## Module Summary

### Key Takeaways

1. **Mindset Shift**: Move from search engine (brevity) to reasoning engine (clarity)
2. **ROSES Framework**: Use for problem-solving and strategic tasks
3. **CO-STAR Framework**: Use for content creation and communication
4. **CREATE Framework**: Use for structured, example-driven outputs
5. **Learning Paradigms**: Zero-shot (simple), One-shot (format), Few-shot (complex)

### Framework Selection Guide

- **Need to solve a problem?** → ROSES
- **Creating content?** → CO-STAR
- **Need structured output with examples?** → CREATE
- **Simple task?** → Zero-shot
- **Need format consistency?** → One-shot
- **Complex or nuanced task?** → Few-shot

### Next Steps

- Practice rewriting prompts using each framework
- Experiment with different learning paradigms
- Move to Module 3 to learn advanced reasoning techniques

---

## Exercises

1. **Mindset Transformation**: Convert 5 search-engine-style queries into reasoning-engine prompts
2. **ROSES Practice**: Create a ROSES prompt for a business problem of your choice
3. **CO-STAR Practice**: Write a CO-STAR prompt for a blog post about a topic you know
4. **CREATE Practice**: Design a CREATE prompt for generating API documentation
5. **Paradigm Comparison**: Generate the same task using zero-shot, one-shot, and few-shot, then compare results
6. **Framework Combination**: Create a prompt that combines ROSES structure with few-shot examples
