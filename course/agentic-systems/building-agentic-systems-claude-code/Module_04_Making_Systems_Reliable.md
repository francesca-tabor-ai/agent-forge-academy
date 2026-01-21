---
title: "Module 4: Making Systems Reliable (Evals, Constraints & Guardrails)"
description: "Build evaluation systems, design constraints, and create improvement loops. Move from 'looks good once' to 'works every time'"
module: "4"
order: 4
---

# Module 4: Making Systems Reliable (Evals, Constraints & Guardrails)

**Duration:** Week 4  
**Learning Objectives:**
- Understand the difference between demos and production systems
- Design constraints that bound autonomy without killing usefulness
- Build evaluation systems that define "good enough" explicitly
- Create improvement loops that diagnose and fix issues automatically

---

## 4.1 Why Demos Lie

### The difference between:

#### "Looks good once"
**Characteristics:**
- Works in ideal conditions
- Handles happy path only
- No edge case testing
- Assumes perfect inputs
- Single successful run

**Why it's misleading:**
- Real systems face varied inputs
- Edge cases are common, not rare
- Errors compound over time
- Performance degrades under load
- One success doesn't predict future success

**Example:**
- Content generator produces great output for one topic
- Fails on technical topics, non-English input, or edge cases
- No way to detect or prevent failures

#### "Works every time"
**Characteristics:**
- Handles diverse inputs
- Graceful error handling
- Validates outputs
- Monitors performance
- Improves over time

**What it requires:**
- Explicit evaluation criteria
- Automated testing
- Constraint enforcement
- Failure detection
- Improvement mechanisms

**Example:**
- Content generator with quality thresholds
- Validation checks for all outputs
- Automatic retry for failures
- Performance monitoring
- Continuous improvement loop

---

## 4.2 Designing Constraints

### What agents should never do

**Critical Principle:** Define boundaries explicitly, not implicitly

**Categories of Constraints:**

#### Safety Constraints
**Purpose:** Prevent harmful or dangerous actions

**Examples:**
- Never modify production data without approval
- Never execute code from untrusted sources
- Never share sensitive information
- Never make irreversible changes without confirmation

**Implementation:**
- Pre-execution checks
- Permission validation
- Environment restrictions
- Audit logging

#### Quality Constraints
**Purpose:** Ensure outputs meet minimum standards

**Examples:**
- Output must match specified schema
- Quality score must exceed threshold
- Response time must be under limit
- Error rate must be below threshold

**Implementation:**
- Schema validation
- Quality scoring
- Performance monitoring
- Error tracking

#### Resource Constraints
**Purpose:** Prevent resource exhaustion

**Examples:**
- Maximum execution time
- Maximum memory usage
- Maximum API calls per hour
- Maximum output size

**Implementation:**
- Timeouts
- Resource limits
- Rate limiting
- Size checks

#### Business Logic Constraints
**Purpose:** Enforce domain-specific rules

**Examples:**
- Financial calculations must be within acceptable range
- Content must comply with guidelines
- Data must pass compliance checks
- Workflows must follow approval processes

**Implementation:**
- Rule engines
- Validation functions
- Compliance checks
- Approval workflows

### Bounding autonomy without killing usefulness

**Challenge:** Too many constraints make the system useless; too few make it dangerous

**Principles:**

#### Constraint Hierarchy
1. **Hard Constraints:** Never violate (safety, security)
2. **Soft Constraints:** Prefer not to violate (quality, performance)
3. **Guidelines:** Best practices (style, format)

#### Fail-Safe Defaults
- When uncertain, choose safer option
- Require explicit approval for risky actions
- Provide escape hatches for legitimate cases

#### Progressive Constraints
- Start with fewer constraints
- Add constraints as issues are discovered
- Remove constraints that prove unnecessary

#### Constraint Transparency
- Agents should know what constraints exist
- Clear error messages when constraints are hit
- Log constraint violations for analysis

**Example:**
```python
class ConstraintChecker:
    def __init__(self):
        self.hard_constraints = [
            self.check_safety,
            self.check_permissions
        ]
        self.soft_constraints = [
            self.check_quality,
            self.check_performance
        ]
    
    def validate(self, action, context):
        # Hard constraints must pass
        for constraint in self.hard_constraints:
            result = constraint(action, context)
            if not result.passed:
                return ValidationResult(
                    passed=False,
                    reason=result.reason,
                    can_override=False
                )
        
        # Soft constraints are warnings
        warnings = []
        for constraint in self.soft_constraints:
            result = constraint(action, context)
            if not result.passed:
                warnings.append(result.reason)
        
        return ValidationResult(
            passed=True,
            warnings=warnings,
            can_override=len(warnings) > 0
        )
```

---

## 4.3 Evaluation Systems

### Defining "good enough" explicitly

**Principle:** If you can't measure it, you can't improve it

**Components of Evaluation Systems:**

#### Evaluation Criteria
**What to evaluate:**
- **Correctness:** Does output match requirements?
- **Quality:** Is output high quality?
- **Completeness:** Is all required information present?
- **Format:** Does output match specified format?
- **Performance:** Was it fast enough?
- **Cost:** Was it within budget?

**How to define:**
- Use specific, measurable criteria
- Set thresholds (minimum acceptable)
- Define scoring functions
- Create test cases

**Example:**
```python
class ContentEvaluation:
    def __init__(self):
        self.criteria = {
            "length": {"min": 500, "max": 2000, "weight": 0.2},
            "readability": {"min": 60, "weight": 0.3},
            "topic_relevance": {"min": 0.8, "weight": 0.3},
            "grammar": {"min": 0.9, "weight": 0.2}
        }
    
    def evaluate(self, content, topic):
        scores = {}
        total_score = 0
        
        # Length check
        length = len(content.split())
        length_score = 1.0 if self.criteria["length"]["min"] <= length <= self.criteria["length"]["max"] else 0.0
        scores["length"] = length_score
        total_score += length_score * self.criteria["length"]["weight"]
        
        # Readability check
        readability = calculate_readability(content)
        readability_score = min(1.0, readability / self.criteria["readability"]["min"])
        scores["readability"] = readability_score
        total_score += readability_score * self.criteria["readability"]["weight"]
        
        # Topic relevance
        relevance = calculate_relevance(content, topic)
        relevance_score = min(1.0, relevance / self.criteria["topic_relevance"]["min"])
        scores["topic_relevance"] = relevance_score
        total_score += relevance_score * self.criteria["topic_relevance"]["weight"]
        
        # Grammar check
        grammar_score = check_grammar(content)
        scores["grammar"] = grammar_score
        total_score += grammar_score * self.criteria["grammar"]["weight"]
        
        return EvaluationResult(
            total_score=total_score,
            passed=total_score >= 0.7,
            scores=scores,
            feedback=self.generate_feedback(scores)
        )
```

### Automated checks vs heuristic checks

#### Automated Checks
**Characteristics:**
- Deterministic
- Fast
- Consistent
- Easy to test

**Use for:**
- Schema validation
- Format checking
- Performance metrics
- Resource usage
- Basic quality metrics

**Example:**
```python
def automated_check(output, spec):
    checks = {
        "schema_valid": validate_schema(output, spec.schema),
        "within_time_limit": output.execution_time < spec.max_time,
        "within_size_limit": len(output.data) < spec.max_size,
        "no_errors": len(output.errors) == 0
    }
    return all(checks.values())
```

#### Heuristic Checks
**Characteristics:**
- Use reasoning or approximation
- May have false positives/negatives
- Can handle ambiguity
- More expensive

**Use for:**
- Quality assessment
- Relevance checking
- Semantic validation
- Complex business rules

**Example:**
```python
def heuristic_check(output, context):
    # Use Claude Code to evaluate
    evaluation_prompt = f"""
    Evaluate this output:
    {output}
    
    Context: {context}
    
    Check:
    1. Is the content relevant?
    2. Is the quality acceptable?
    3. Are there any issues?
    
    Return: {{"relevant": bool, "quality": float, "issues": [str]}}
    """
    return claude_code.evaluate(evaluation_prompt)
```

**Best Practice:** Combine both
- Use automated checks for fast, deterministic validation
- Use heuristic checks for complex, nuanced evaluation
- Layer them: automated first, heuristic for edge cases

### Using agents to evaluate other agents

**Pattern:** Create specialized evaluation agents

**Benefits:**
- Separation of concerns
- Can use Claude Code for complex evaluation
- Can improve evaluation over time
- Enables evaluation of evaluation

**Types of Evaluation Agents:**

#### Quality Evaluator
- Assesses output quality
- Uses Claude Code for nuanced judgment
- Provides detailed feedback

#### Correctness Validator
- Checks against specifications
- Uses code blocks for deterministic checks
- Fast and reliable

#### Performance Monitor
- Tracks execution metrics
- Identifies bottlenecks
- Suggests optimizations

**Example:**
```python
class EvaluationAgent:
    def __init__(self):
        self.quality_evaluator = QualityEvaluator()  # Uses Claude Code
        self.correctness_validator = CorrectnessValidator()  # Uses code blocks
        self.performance_monitor = PerformanceMonitor()  # Uses code blocks
    
    def evaluate(self, agent_output, spec):
        results = {
            "correctness": self.correctness_validator.validate(agent_output, spec),
            "quality": self.quality_evaluator.assess(agent_output, spec),
            "performance": self.performance_monitor.check(agent_output)
        }
        
        return EvaluationResult(
            passed=all(r.passed for r in results.values()),
            details=results,
            recommendations=self.generate_recommendations(results)
        )
```

---

## 4.4 Improvement Loops

### Evaluate → Diagnose → Modify → Repeat

**Principle:** Systems should get better over time, not just maintain status quo

#### Evaluate
**What to measure:**
- Success rate
- Quality scores
- Error types and frequencies
- Performance metrics
- Cost per execution

**How:**
- Run evaluations on all outputs
- Log results systematically
- Track trends over time
- Identify patterns

#### Diagnose
**What to analyze:**
- Why did failures occur?
- What patterns lead to success?
- Where are the bottlenecks?
- What constraints are too tight/loose?

**How:**
- Analyze failure logs
- Identify root causes
- Find common patterns
- Use Claude Code for complex diagnosis

**Example:**
```python
def diagnose_failures(failure_logs):
    analysis_prompt = f"""
    Analyze these failures:
    {failure_logs}
    
    Identify:
    1. Common failure patterns
    2. Root causes
    3. Suggested fixes
    """
    return claude_code.analyze(analysis_prompt)
```

#### Modify
**What to change:**
- Agent prompts
- Code block logic
- Constraints
- Evaluation criteria
- Orchestration patterns

**How:**
- Make targeted changes based on diagnosis
- Test changes before deploying
- Version control all modifications
- A/B test when possible

#### Repeat
**Continuous improvement:**
- Never stop evaluating
- Regular diagnosis cycles
- Incremental improvements
- Measure impact of changes

### Logging failures without human babysitting

**Principle:** System should log intelligently, not just verbosely

**What to log:**

#### Execution Logs
- What agents executed
- Inputs and outputs
- Execution time
- Resource usage

#### Error Logs
- Error type and message
- Context when error occurred
- Stack traces
- Recovery attempts

#### Evaluation Logs
- Evaluation results
- Scores and metrics
- Failure reasons
- Recommendations

#### Performance Logs
- Execution times
- Resource usage
- Bottlenecks
- Optimization opportunities

**Logging Best Practices:**

1. **Structured Logging:**
   ```python
   logger.info("agent_execution", {
       "agent": "content_generator",
       "input": input_data,
       "output": output_data,
       "duration_ms": 1234,
       "success": True
   })
   ```

2. **Log Levels:**
   - DEBUG: Detailed execution info
   - INFO: Normal operations
   - WARNING: Potential issues
   - ERROR: Failures that were handled
   - CRITICAL: System failures

3. **Log Aggregation:**
   - Centralized logging
   - Searchable and filterable
   - Retention policies
   - Alerting on critical errors

4. **Privacy and Security:**
   - Don't log sensitive data
   - Anonymize when needed
   - Secure log storage
   - Access controls

---

## 4.5 Workshop

### Build an eval agent that scores outputs

**Exercise:** Create an evaluation agent for content generation

**Requirements:**
1. Evaluate content quality
2. Check against specifications
3. Provide actionable feedback
4. Score outputs consistently

**Implementation Steps:**

1. **Define Evaluation Criteria:**
   ```python
   criteria = {
       "length": (500, 2000),
       "readability": 60,
       "topic_relevance": 0.8,
       "grammar": 0.9,
       "structure": True
   }
   ```

2. **Create Automated Checks:**
   ```python
   def automated_checks(content, spec):
       return {
           "length_ok": check_length(content, spec["length"]),
           "structure_ok": check_structure(content),
           "grammar_ok": check_grammar(content, spec["grammar"])
       }
   ```

3. **Create Heuristic Checks (Claude Code):**
   ```python
   def heuristic_checks(content, topic):
       prompt = f"""
       Evaluate this content for topic '{topic}':
       {content}
       
       Score:
       - Relevance (0-1)
       - Quality (0-1)
       - Provide feedback
       """
       return claude_code.evaluate(prompt)
   ```

4. **Combine Results:**
   ```python
   def evaluate(content, topic, spec):
       auto = automated_checks(content, spec)
       heuristic = heuristic_checks(content, topic)
       
       score = calculate_score(auto, heuristic)
       feedback = generate_feedback(auto, heuristic)
       
       return EvaluationResult(score, feedback, passed=score >= 0.7)
   ```

### Run an improvement loop on your system

**Exercise:** Improve a multi-agent system through evaluation

**Steps:**

1. **Baseline Evaluation:**
   - Run system on test cases
   - Collect evaluation results
   - Identify failure patterns

2. **Diagnose Issues:**
   - Analyze failure logs
   - Identify root causes
   - Prioritize fixes

3. **Make Improvements:**
   - Update agent prompts
   - Fix code block bugs
   - Adjust constraints
   - Refine evaluation criteria

4. **Re-evaluate:**
   - Run same test cases
   - Compare results
   - Measure improvement

5. **Iterate:**
   - Repeat until acceptable performance
   - Document what worked
   - Continue monitoring

---

## 4.6 Deliverable

### Evaluation criteria + automated checks

**Requirements:**

1. **Evaluation Framework:**
   - Defined criteria for "good enough"
   - Scoring methodology
   - Thresholds and pass/fail rules

2. **Automated Checks:**
   - Code-based validation
   - Fast and deterministic
   - Covers critical requirements

3. **Heuristic Checks (Optional):**
   - Claude Code-based evaluation
   - Handles complex cases
   - Provides detailed feedback

4. **Improvement Loop:**
   - Evaluation system
   - Diagnosis process
   - Modification workflow
   - Measurement of improvement

5. **Documentation:**
   - How to add new criteria
   - How to interpret scores
   - How to use feedback

**Evaluation Criteria:**
- Completeness of evaluation framework
- Quality of automated checks
- Effectiveness of improvement loop
- Documentation clarity

---

## Key Takeaways

1. **"Looks good once" ≠ "Works every time"**
2. **Design constraints explicitly to bound autonomy safely**
3. **Define "good enough" with measurable criteria**
4. **Combine automated and heuristic checks**
5. **Build improvement loops: Evaluate → Diagnose → Modify → Repeat**

---

## Next Steps

In Module 5, you'll learn how to deploy these systems to production, manage costs and performance, and harden them for real-world use.
