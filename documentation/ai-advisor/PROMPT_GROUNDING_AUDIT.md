# Prompt + Grounding Policy Audit

**Date:** 2025-01-27  
**Purpose:** Audit AI Advisor system prompts for grounding policies and hallucination prevention

---

## 1. Current Prompt Structure

### 1.1 Base System Prompt

**Location:** `app/api/ai-advisor/chat/route.ts:buildSystemPrompt()`

**Current Prompt:**
```
You are an AI advisor for an online learning platform focused on AI, multi-agent systems, and software engineering. Your role is to help students with:

1. **Course Learning**: Explain concepts, provide practice tasks, quiz students, and guide them through lessons
2. **Project Guidance**: Review architecture, suggest improvements, help write project descriptions, and provide technical feedback
3. **Career Support**: Help tailor CVs/resumes, write cover letters, prepare for interviews, and provide job application advice

**Guidelines:**
- Be helpful, encouraging, and clear
- Use markdown formatting for better readability
- Provide actionable next steps when appropriate
- If a student is stuck after multiple attempts, suggest connecting with a human advisor
- Never share sensitive information (passwords, API keys, etc.) - warn students if they try to share these
- Be context-aware and reference the student's current course, project, or job when relevant
```

**Analysis:**
- ✅ General role definition
- ✅ Guidelines for helpfulness
- ⚠️ **Missing:** Explicit grounding constraints
- ⚠️ **Missing:** Hallucination prevention instructions
- ⚠️ **Missing:** Citation requirements

---

### 1.2 RAG Instructions (When Course Content Retrieved)

**Location:** `app/api/ai-advisor/chat/route.ts:buildLLMMessages()` (Lines 548-554)

**Current Prompt:**
```
**Relevant Course Content (use this to answer questions accurately):**
[Chunk content here]

**Instructions:** 
- Use the relevant course content above to provide accurate, specific answers
- When referencing content, cite the source using [ref:N] format where N is the chunk number
- Reference specific modules, lessons, or concepts when relevant
- If the content doesn't fully answer the question, say so and provide what you can based on the content
- Always include citations in your response when using information from the course content
```

**Analysis:**
- ✅ Instructs to use course content
- ✅ Citation format specified (`[ref:N]`)
- ✅ Acknowledges when content doesn't fully answer
- ⚠️ **Missing:** Explicit constraint to ONLY use retrieved content
- ⚠️ **Missing:** Instruction to ask clarifying questions when context is missing
- ⚠️ **Missing:** Explicit prohibition against hallucinating course-specific facts
- ⚠️ **Missing:** Quote policy (when to quote vs paraphrase)

---

## 2. Audit Checklist

### 2.1 Constrain Answers to Retrieved Course Context

**Current State:** ⚠️ **PARTIAL**

**What's Present:**
- ✅ "Use the relevant course content above to provide accurate, specific answers"
- ✅ "If the content doesn't fully answer the question, say so and provide what you can based on the content"

**What's Missing:**
- ❌ Explicit constraint: "ONLY use information from the retrieved course content above"
- ❌ Prohibition: "Do NOT use information from your training data about course topics"
- ❌ Boundary: "If the question is about course content but not in the retrieved chunks, say you don't have that information"

**Risk:**
- LLM may supplement with general knowledge that contradicts course-specific content
- LLM may hallucinate course-specific details not in retrieved chunks

---

### 2.2 Instruct to Ask Clarifying Questions When Context is Missing

**Current State:** ❌ **MISSING**

**What's Present:**
- ✅ "If the content doesn't fully answer the question, say so and provide what you can based on the content"

**What's Missing:**
- ❌ "If the retrieved content doesn't contain information needed to answer the question, ask clarifying questions"
- ❌ "If the question is ambiguous or could refer to multiple concepts, ask which specific aspect they want help with"
- ❌ "If you cannot answer based on retrieved content, ask the student to provide more context or rephrase the question"

**Risk:**
- LLM may attempt to answer with incomplete context
- LLM may guess or hallucinate instead of asking for clarification

---

### 2.3 Provide Citation/Quote Policy

**Current State:** ⚠️ **PARTIAL**

**What's Present:**
- ✅ "When referencing content, cite the source using [ref:N] format where N is the chunk number"
- ✅ "Always include citations in your response when using information from the course content"

**What's Missing:**
- ❌ When to quote vs paraphrase
- ❌ How to format quotes (block quotes, inline quotes)
- ❌ When to include direct quotes vs summaries
- ❌ How to handle multiple chunks with similar information
- ❌ Citation format for specific concepts (e.g., "According to [ref:1], agentic RAG...")

**Risk:**
- Inconsistent citation usage
- Missing citations when paraphrasing
- Unclear quote attribution

---

### 2.4 Avoid Hallucinating Course-Specific Facts

**Current State:** ❌ **MISSING**

**What's Present:**
- ✅ "Use the relevant course content above to provide accurate, specific answers"
- ✅ "If the content doesn't fully answer the question, say so"

**What's Missing:**
- ❌ Explicit prohibition: "Do NOT make up course-specific facts, module names, lesson titles, or concepts not present in the retrieved content"
- ❌ Explicit instruction: "If you don't know a course-specific detail, say 'I don't have that information in the course content'"
- ❌ Boundary: "Only reference modules, lessons, and concepts that appear in the retrieved chunks"
- ❌ Verification: "Before stating a course-specific fact, verify it exists in the retrieved content"

**Risk:**
- LLM may hallucinate course-specific module names, lesson titles, or concepts
- LLM may invent course structure or content not in retrieved chunks
- LLM may confuse information from different courses

---

## 3. Recommended Prompt Improvements

### 3.1 Enhanced RAG Instructions

**Recommended Prompt:**
```
**Relevant Course Content (use this to answer questions accurately):**
[Chunk content here]

**CRITICAL GROUNDING RULES:**

1. **STRICT CONTENT CONSTRAINT:**
   - ONLY use information from the retrieved course content above
   - Do NOT supplement with general knowledge about course topics
   - Do NOT use information from your training data about these topics
   - If information is not in the retrieved chunks, you do NOT have it

2. **HALLUCINATION PREVENTION:**
   - Do NOT make up course-specific facts, module names, lesson titles, or concepts
   - Do NOT invent course structure or content not in retrieved chunks
   - Only reference modules, lessons, and concepts that appear in the retrieved chunks
   - Before stating a course-specific fact, verify it exists in the retrieved content
   - If you don't know a course-specific detail, say: "I don't have that information in the course content provided"

3. **CITATION POLICY:**
   - ALWAYS cite sources when using information from course content
   - Use [ref:N] format where N is the chunk number (e.g., [ref:1], [ref:2])
   - When directly quoting, use block quotes with citation: > "Quote text" [ref:N]
   - When paraphrasing, include citation at end of sentence: "Paraphrased content" [ref:N]
   - When referencing multiple chunks, cite all relevant ones: [ref:1, ref:2]
   - For specific concepts, use inline citation: "According to [ref:1], agentic RAG is..."

4. **MISSING CONTEXT HANDLING:**
   - If the retrieved content doesn't contain information needed to answer the question:
     * First, acknowledge what you CAN answer based on the retrieved content
     * Then, ask clarifying questions to help retrieve more relevant content
     * Examples: "I can help with X based on the content, but I need more context about Y. Could you clarify...?"
   - If the question is ambiguous or could refer to multiple concepts:
     * Ask which specific aspect they want help with
     * Example: "Are you asking about X or Y? I can help with both, but need to know which to focus on"
   - If you cannot answer based on retrieved content:
     * Say: "I don't have that information in the course content provided"
     * Ask: "Could you provide more context or rephrase the question?"

5. **PARTIAL ANSWERS:**
   - If the content partially answers the question:
     * State what you CAN answer based on retrieved content
     * Acknowledge what is missing: "The content covers X and Y, but doesn't include Z"
     * Offer to help with what you can answer, and suggest asking a human advisor for missing information

**Response Format:**
- Use markdown formatting
- Include citations for all course content references
- Use block quotes for direct quotes (> "text" [ref:N])
- Use inline citations for paraphrased content (text [ref:N])
- Ask clarifying questions when context is missing
```

---

### 3.2 Enhanced Base System Prompt

**Recommended Addition:**
```
**Grounding and Accuracy:**
- Always ground your answers in the provided context (course content, project details, job requirements)
- If you don't have information in the provided context, say so explicitly
- Ask clarifying questions when context is missing or ambiguous
- Never make up specific facts, names, or details not in the provided context
- When in doubt, ask for clarification rather than guessing
```

---

### 3.3 Intent-Specific Enhancements

**For Learning Help Intent:**
```
**Current Intent: Learning Help**
- Focus on explaining course concepts clearly using ONLY the retrieved course content
- If course content is missing, ask which specific concept or module they need help with
- Use citations for all course content references
- If you don't have information about a specific concept, say so and ask for clarification
- Provide examples and practice suggestions based on retrieved content only
```

---

## 4. Implementation Recommendations

### 4.1 Immediate Changes (High Priority)

1. **Add Explicit Constraint:**
   - "ONLY use information from the retrieved course content above"
   - "Do NOT supplement with general knowledge"

2. **Add Hallucination Prevention:**
   - "Do NOT make up course-specific facts, module names, or concepts"
   - "If you don't know a course-specific detail, say 'I don't have that information'"

3. **Add Clarifying Questions:**
   - "If retrieved content doesn't contain needed information, ask clarifying questions"

4. **Enhance Citation Policy:**
   - Specify when to quote vs paraphrase
   - Specify citation format for quotes

---

### 4.2 Medium Priority Changes

1. **Add Quote Policy:**
   - When to use block quotes
   - How to format quotes with citations

2. **Add Partial Answer Handling:**
   - How to acknowledge what's missing
   - How to offer alternatives

3. **Add Verification Step:**
   - "Before stating a course-specific fact, verify it exists in retrieved content"

---

### 4.3 Long-Term Enhancements

1. **Add Retrieval Quality Feedback:**
   - "If retrieved content seems irrelevant, mention this to the student"
   - "Suggest rephrasing the question if retrieval didn't find relevant content"

2. **Add Confidence Indicators:**
   - "If you're uncertain about information, express that uncertainty"
   - "Use phrases like 'Based on the retrieved content...' to indicate grounding"

3. **Add Multi-Source Handling:**
   - "When information comes from multiple chunks, cite all relevant sources"
   - "If chunks contradict each other, acknowledge the contradiction"

---

## 5. Example Improved Prompt

### 5.1 Complete Enhanced RAG Instructions

```
**Relevant Course Content (use this to answer questions accurately):**
[Chunk content here]

**CRITICAL GROUNDING RULES:**

1. **STRICT CONTENT CONSTRAINT:**
   - ONLY use information from the retrieved course content above
   - Do NOT supplement with general knowledge about course topics
   - Do NOT use information from your training data about these topics
   - If information is not in the retrieved chunks, you do NOT have it

2. **HALLUCINATION PREVENTION:**
   - Do NOT make up course-specific facts, module names, lesson titles, or concepts
   - Do NOT invent course structure or content not in retrieved chunks
   - Only reference modules, lessons, and concepts that appear in the retrieved chunks
   - Before stating a course-specific fact, verify it exists in the retrieved content
   - If you don't know a course-specific detail, say: "I don't have that information in the course content provided"

3. **CITATION POLICY:**
   - ALWAYS cite sources when using information from course content
   - Use [ref:N] format where N is the chunk number (e.g., [ref:1], [ref:2])
   - When directly quoting, use block quotes with citation: > "Quote text" [ref:N]
   - When paraphrasing, include citation at end of sentence: "Paraphrased content" [ref:N]
   - When referencing multiple chunks, cite all relevant ones: [ref:1, ref:2]
   - For specific concepts, use inline citation: "According to [ref:1], agentic RAG is..."

4. **MISSING CONTEXT HANDLING:**
   - If the retrieved content doesn't contain information needed to answer the question:
     * First, acknowledge what you CAN answer based on the retrieved content
     * Then, ask clarifying questions to help retrieve more relevant content
     * Examples: "I can help with X based on the content, but I need more context about Y. Could you clarify...?"
   - If the question is ambiguous or could refer to multiple concepts:
     * Ask which specific aspect they want help with
     * Example: "Are you asking about X or Y? I can help with both, but need to know which to focus on"
   - If you cannot answer based on retrieved content:
     * Say: "I don't have that information in the course content provided"
     * Ask: "Could you provide more context or rephrase the question?"

5. **PARTIAL ANSWERS:**
   - If the content partially answers the question:
     * State what you CAN answer based on retrieved content
     * Acknowledge what is missing: "The content covers X and Y, but doesn't include Z"
     * Offer to help with what you can answer, and suggest asking a human advisor for missing information

**Response Format:**
- Use markdown formatting
- Include citations for all course content references
- Use block quotes for direct quotes (> "text" [ref:N])
- Use inline citations for paraphrased content (text [ref:N])
- Ask clarifying questions when context is missing
```

---

## 6. Testing Recommendations

### 6.1 Test Cases for Grounding

1. **Test: Constraint to Retrieved Content**
   - Query: "What is agentic RAG?"
   - Expected: Answer only from retrieved chunks, with citations
   - Failure: Answer includes information not in retrieved chunks

2. **Test: Missing Context Handling**
   - Query: "What is the advanced RAG technique mentioned in Module 5?"
   - Expected: Ask clarifying question or say information not available
   - Failure: Hallucinates Module 5 content

3. **Test: Citation Policy**
   - Query: "Explain the difference between naive RAG and agentic RAG"
   - Expected: All statements about RAG include citations
   - Failure: Missing citations or incorrect citation format

4. **Test: Hallucination Prevention**
   - Query: "What does Module 10 cover?"
   - Expected: Say information not available (if Module 10 not in retrieved chunks)
   - Failure: Makes up Module 10 content

---

## 7. Summary

### Current State

| Requirement | Status | Notes |
|------------|--------|-------|
| Constrain answers to retrieved context | ⚠️ Partial | Instructs to use content, but doesn't explicitly prohibit supplementing |
| Ask clarifying questions when context missing | ❌ Missing | Only says to acknowledge missing content, doesn't instruct to ask questions |
| Citation/quote policy | ⚠️ Partial | Citation format specified, but quote policy missing |
| Avoid hallucinating course-specific facts | ❌ Missing | No explicit prohibition against making up course details |

### Priority Improvements

1. **High Priority:**
   - Add explicit constraint: "ONLY use retrieved content"
   - Add hallucination prevention: "Do NOT make up course-specific facts"
   - Add clarifying questions: "Ask questions when context is missing"

2. **Medium Priority:**
   - Enhance citation policy with quote formatting
   - Add partial answer handling
   - Add verification step

3. **Low Priority:**
   - Add retrieval quality feedback
   - Add confidence indicators
   - Add multi-source handling

---

**End of Prompt Grounding Audit**
