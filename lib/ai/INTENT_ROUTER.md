# Intent Router System

The intent router classifies user messages into specific intents and routes them to appropriate tools and context.

## Intents

The system supports 5 main intents:

1. **`learning_help`** - Course/lesson questions, explanations, quizzes, practice tasks
2. **`project_review`** - Portfolio project feedback, architecture reviews, improvements
3. **`job_matching`** - Job recommendations, finding suitable roles, matching skills
4. **`application_help`** - CV/resume help, cover letters, interview preparation
5. **`general_career`** - General career advice, path guidance, skill development
6. **`general`** - Fallback for unclear or general queries

## Classification Strategy

### Two-Tier Approach

1. **Rule-Based Classification** (Fast, Deterministic)
   - Keyword matching
   - Context-based routing (course/project/job context)
   - Confidence scoring based on keyword density
   - Used first for speed

2. **LLM-Based Classification** (Accurate, Slower)
   - Used when rule-based confidence < 0.7
   - Uses LLM to classify ambiguous queries
   - Provides reasoning for classification

### Classification Flow

```
User Message
    ↓
Rule-Based Classification
    ↓
Confidence >= 0.7?
    ├─ Yes → Use Rule-Based Result
    └─ No → LLM-Based Classification
```

## Tool Selection

Based on inferred intent, the system automatically selects tools:

| Intent | RAG | Jobs Matching | Portfolio Fetch | Course Context |
|--------|-----|---------------|-----------------|----------------|
| `learning_help` | ✅ | ❌ | ❌ | ✅ |
| `project_review` | ❌ | ❌ | ✅ | ❌ |
| `job_matching` | ❌ | ✅ | ✅ | ❌ |
| `application_help` | ❌ | ❌ | ✅ | ❌ |
| `general_career` | ❌ | ✅ | ✅ | ❌ |
| `general` | ❌ | ❌ | ❌ | ❌ |

## Usage

### Automatic Classification

Intent is automatically classified when not provided:

```typescript
// In chat route
const intentClassification = await classifyIntent(message, intentContext);
const inferredIntent = intentClassification.intent;
const tools = getToolsForIntent(inferredIntent);
```

### Manual Classification

```typescript
import { classifyIntent, getToolsForIntent } from '@/lib/ai/intent';

// Classify intent
const result = await classifyIntent('How does collaborative filtering work?', {
  course: { id: '...', slug: 'ai-recommender-systems', title: '...' }
});

console.log(result.intent); // 'learning_help'
console.log(result.confidence); // 0.9

// Get tools for intent
const tools = getToolsForIntent(result.intent);
// { useRAG: true, useJobsMatching: false, ... }
```

### Force LLM Classification

```typescript
const result = await classifyIntent(message, context, {
  useLLM: true, // Force LLM classification
  minConfidence: 0.8 // Higher threshold
});
```

## Metadata Storage

Intent classification results are stored in `advisor_conversations.metadata`:

```json
{
  "intent": "learning_help",
  "intentConfidence": 0.9,
  "intentReasoning": "Query asks about course concept",
  "tools": {
    "useRAG": true,
    "useJobsMatching": false,
    "usePortfolioFetch": false,
    "useCourseContext": true
  }
}
```

## Examples

### Learning Help
**Query:** "Explain collaborative filtering"
**Intent:** `learning_help`
**Tools:** RAG enabled, course context
**Result:** Retrieves relevant lesson chunks, provides explanation with citations

### Project Review
**Query:** "Review my project architecture"
**Intent:** `project_review`
**Tools:** Portfolio fetch enabled
**Result:** Fetches portfolio projects, provides architecture feedback

### Job Matching
**Query:** "What jobs match my skills?"
**Intent:** `job_matching`
**Tools:** Jobs matching + portfolio fetch
**Result:** Calculates job matches, provides top recommendations

### Application Help
**Query:** "Help me tailor my CV for this job"
**Intent:** `application_help`
**Tools:** Portfolio fetch enabled
**Result:** Fetches portfolio, provides CV tailoring advice

## Performance

- **Rule-Based:** ~1-5ms (keyword matching)
- **LLM-Based:** ~200-500ms (LLM API call)
- **Overall:** Most queries use rule-based (fast), LLM only for ambiguous cases

## Configuration

Intent classification can be configured via environment variables:

```env
# Force LLM classification (default: false, uses rules first)
INTENT_USE_LLM=false

# Minimum confidence for rule-based (default: 0.7)
INTENT_MIN_CONFIDENCE=0.7
```

## Future Enhancements

- [ ] Intent history tracking (learn from past classifications)
- [ ] Multi-intent support (e.g., learning + project review)
- [ ] Custom intent training
- [ ] Intent-based response templates
- [ ] A/B testing for classification accuracy
