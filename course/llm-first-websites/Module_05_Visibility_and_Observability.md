---
title: "Module 5: Visibility & Observability (The New Funnel)"
description: "Measure Participation in Judgment - the new metrics for AI-first world"
module: "5"
order: 5
---

# Module 5: Visibility & Observability (The New Funnel)

**Duration:** Week 5  
**Learning Objectives:**
- Measure presence, citation, and influence in AI responses
- Track evidence telemetry to see what data sources are retrieved
- Create traceability and defensibility systems
- Understand new metrics that matter in an AI-intermediated world

---

## 5.1 Presence, Citation, and Influence

### Measuring Participation in Judgment

Traditional metrics (page views, clicks, engagement) are irrelevant when AI intermediaries become the primary interface. New metrics measure **participation in AI judgment processes**.

### The Three Dimensions

#### 1. Presence

**Question:** Is your brand retrieved by AI systems?

**Measurement:**
- Retrieval frequency
- Retrieval contexts
- Retrieval sources
- Retrieval success rate

**Example: Presence Tracking**
```json
{
  "presence": {
    "metric": "retrieval-rate",
    "period": "2025-01",
    "value": 0.65,
    "meaning": "65% of relevant queries retrieve our content",
    "breakdown": {
      "bySource": {
        "chatgpt": 0.70,
        "perplexity": 0.60,
        "amazon-rufus": 0.65
      },
      "byContext": {
        "product-queries": 0.80,
        "comparison-queries": 0.50,
        "information-queries": 0.60
      }
    }
  }
}
```

#### 2. Citation

**Question:** How is your brand cited—as authority (evidence) or example (context)?

**Measurement:**
- Citation frequency
- Citation type (authority vs. example)
- Citation position in response
- Citation accuracy

**Example: Citation Tracking**
```json
{
  "citation": {
    "metric": "citation-rate",
    "period": "2025-01",
    "totalCitations": 1250,
    "breakdown": {
      "asAuthority": {
        "count": 800,
        "percentage": 64,
        "examples": [
          "According to [Brand], the best approach is...",
          "[Brand] research shows that...",
          "Based on [Brand] specifications..."
        ]
      },
      "asExample": {
        "count": 450,
        "percentage": 36,
        "examples": [
          "Examples include [Brand] and [Competitor]",
          "Brands like [Brand] offer this feature",
          "[Brand] is one option to consider"
        ]
      }
    },
    "accuracy": {
      "correctRepresentation": 0.92,
      "misrepresentation": 0.08,
      "commonErrors": [
        "Outdated pricing",
        "Missing features",
        "Incorrect specifications"
      ]
    }
  }
}
```

#### 3. Influence

**Question:** Does your information shape the final outcome?

**Measurement:**
- Influence on recommendations
- Influence on decisions
- Influence on user actions
- Outcome attribution

**Example: Influence Tracking**
```json
{
  "influence": {
    "metric": "outcome-influence",
    "period": "2025-01",
    "influencedOutcomes": 450,
    "breakdown": {
      "recommendations": {
        "count": 300,
        "percentage": 67,
        "types": [
          "direct-recommendation",
          "top-option",
          "featured-alternative"
        ]
      },
      "decisions": {
        "count": 100,
        "percentage": 22,
        "types": [
          "user-selected",
          "ai-selected",
          "comparison-winner"
        ]
      },
      "actions": {
        "count": 50,
        "percentage": 11,
        "types": [
          "purchase",
          "booking",
          "signup"
        ]
      }
    },
    "attribution": {
      "direct": 0.60,
      "indirect": 0.30,
      "unknown": 0.10
    }
  }
}
```

### Implementing Presence, Citation, and Influence Tracking

#### API Endpoint for Tracking

```json
{
  "endpoint": "/api/visibility/track",
  "method": "POST",
  "request": {
    "query": "best running shoes for flat feet",
    "aiSystem": "chatgpt",
    "retrieval": {
      "retrieved": true,
      "timestamp": "2025-01-15T10:30:00Z",
      "sources": ["/products/prod-123", "/specs/prod-123"]
    },
    "citation": {
      "cited": true,
      "type": "authority",
      "position": 2,
      "text": "According to [Brand], ProRunner X1 is designed for flat feet",
      "accuracy": 0.95
    },
    "influence": {
      "recommended": true,
      "position": 1,
      "userAction": "viewed-product",
      "outcome": "positive"
    }
  }
}
```

#### Dashboard Metrics

```json
{
  "dashboard": {
    "presence": {
      "retrievalRate": "65%",
      "trend": "+5% vs last month",
      "topQueries": [
        "best running shoes",
        "shoes for flat feet",
        "comfortable running shoes"
      ]
    },
    "citation": {
      "totalCitations": "1,250",
      "asAuthority": "64%",
      "asExample": "36%",
      "accuracy": "92%",
      "trend": "+10% vs last month"
    },
    "influence": {
      "influencedOutcomes": "450",
      "recommendations": "67%",
      "decisions": "22%",
      "actions": "11%",
      "trend": "+15% vs last month"
    }
  }
}
```

---

## 5.2 Evidence Telemetry

### Replacing Sentiment Analysis with Source Tracking

Instead of analyzing sentiment (which doesn't help with machines), track **which data sources are retrieved** and **where they are overridden** in AI reasoning.

### What to Track

#### 1. Data Source Retrieval

Track what sources AI systems retrieve from you.

**Example: Retrieval Tracking**
```json
{
  "retrievalTelemetry": {
    "timestamp": "2025-01-15T10:30:00Z",
    "query": "best running shoes for flat feet",
    "aiSystem": "chatgpt",
    "sourcesRetrieved": [
      {
        "source": "/api/products/prod-123",
        "type": "product-specification",
        "fieldsRetrieved": [
          "name",
          "specifications.heelDrop",
          "specifications.pronation",
          "targetAudience.footType"
        ],
        "responseTime": 120,
        "cacheHit": false
      },
      {
        "source": "/api/reviews/prod-123",
        "type": "customer-reviews",
        "fieldsRetrieved": [
          "aggregateRating",
          "reviewCount",
          "topReviews"
        ],
        "responseTime": 80,
        "cacheHit": true
      }
    ],
    "totalRetrievalTime": 200
  }
}
```

#### 2. Override Detection

Track when AI systems override your information with other sources.

**Example: Override Tracking**
```json
{
  "overrideTelemetry": {
    "timestamp": "2025-01-15T10:30:00Z",
    "query": "best running shoes for flat feet",
    "ourClaim": {
      "field": "price",
      "value": 129.99,
      "source": "/api/products/prod-123"
    },
    "override": {
      "detected": true,
      "reason": "competitor-lower-price",
      "usedValue": 119.99,
      "usedSource": "competitor-website",
      "position": "mentioned-first"
    },
    "impact": "negative",
    "severity": "medium"
  }
}
```

#### 3. Source Priority

Track which sources AI systems prioritize.

**Example: Priority Tracking**
```json
{
  "priorityTelemetry": {
    "timestamp": "2025-01-15T10:30:00Z",
    "query": "best running shoes for flat feet",
    "sourcesUsed": [
      {
        "source": "competitor-a",
        "priority": 1,
        "reason": "lower-price",
        "fieldsUsed": ["price", "availability"]
      },
      {
        "source": "our-brand",
        "priority": 2,
        "reason": "better-specifications",
        "fieldsUsed": ["specifications", "certifications"]
      },
      {
        "source": "review-site",
        "priority": 3,
        "reason": "aggregate-ratings",
        "fieldsUsed": ["ratings", "reviews"]
      }
    ],
    "ourPosition": 2,
    "trend": "improving"
  }
}
```

### Implementing Evidence Telemetry

#### Telemetry Collection Endpoint

```json
{
  "endpoint": "/api/telemetry/evidence",
  "method": "POST",
  "request": {
    "event": "ai-retrieval",
    "data": {
      "query": "best running shoes for flat feet",
      "aiSystem": "chatgpt",
      "sources": [
        {
          "url": "/api/products/prod-123",
          "retrieved": true,
          "fields": ["name", "specifications"],
          "responseTime": 120
        }
      ],
      "overrides": [],
      "priority": 1
    }
  }
}
```

#### Telemetry Analysis

```json
{
  "telemetryAnalysis": {
    "period": "2025-01",
    "retrievals": {
      "total": 5000,
      "bySource": {
        "/api/products": 3000,
        "/api/specifications": 2500,
        "/api/reviews": 2000
      },
      "byField": {
        "name": 3000,
        "price": 2500,
        "specifications": 2000,
        "reviews": 1500
      }
    },
    "overrides": {
      "total": 500,
      "byReason": {
        "lower-price": 200,
        "better-availability": 150,
        "higher-rating": 100,
        "other": 50
      },
      "impact": {
        "negative": 400,
        "neutral": 80,
        "positive": 20
      }
    },
    "priority": {
      "averagePosition": 2.3,
      "topPosition": 0.30,
      "secondPosition": 0.40,
      "thirdOrLower": 0.30
    }
  }
}
```

---

## 5.3 Traceability & Defensibility

### Creating Records of Reasoning Steps

When AI systems make mistakes, you need **traceability** to understand what happened and **defensibility** to show you did everything right.

### Traceability Components

#### 1. Reasoning Step Records

Track every step in AI reasoning that involves your information.

**Example: Reasoning Step Record**
```json
{
  "reasoningStep": {
    "id": "step-12345",
    "timestamp": "2025-01-15T10:30:00Z",
    "query": "best running shoes for flat feet",
    "aiSystem": "chatgpt",
    "steps": [
      {
        "step": 1,
        "action": "retrieve-products",
        "sources": ["/api/products?footType=flat"],
        "result": "retrieved 5 products",
        "timestamp": "2025-01-15T10:30:01Z"
      },
      {
        "step": 2,
        "action": "filter-by-specifications",
        "criteria": "heelDrop > 6mm, pronation = neutral",
        "result": "3 products match",
        "timestamp": "2025-01-15T10:30:02Z"
      },
      {
        "step": 3,
        "action": "retrieve-reviews",
        "sources": ["/api/reviews/prod-123"],
        "result": "retrieved 500 reviews, avg 4.5",
        "timestamp": "2025-01-15T10:30:03Z"
      },
      {
        "step": 4,
        "action": "synthesize-recommendation",
        "input": "products + reviews + specifications",
        "result": "Recommended ProRunner X1",
        "timestamp": "2025-01-15T10:30:04Z"
      }
    ],
    "finalOutput": "ProRunner X1 is recommended for flat feet",
    "dataVersions": {
      "/api/products/prod-123": "v1.2.3",
      "/api/reviews/prod-123": "v2.1.0"
    }
  }
}
```

#### 2. Data Version Tracking

Track which version of your data was used.

**Example: Data Version Record**
```json
{
  "dataVersion": {
    "source": "/api/products/prod-123",
    "version": "v1.2.3",
    "timestamp": "2025-01-15T10:30:00Z",
    "fields": {
      "name": "v1.2.3",
      "price": "v1.2.2",
      "specifications": "v1.2.3"
    },
    "changes": [
      {
        "field": "price",
        "oldValue": 139.99,
        "newValue": 129.99,
        "changedAt": "2025-01-10T00:00:00Z"
      }
    ]
  }
}
```

#### 3. Decision Audit Trail

Record all decisions made using your information.

**Example: Decision Audit Trail**
```json
{
  "auditTrail": {
    "decisionId": "dec-12345",
    "timestamp": "2025-01-15T10:30:00Z",
    "query": "best running shoes for flat feet",
    "decision": "recommended ProRunner X1",
    "reasoning": [
      "Retrieved product specifications",
      "Matched foot type requirements",
      "Checked customer reviews (4.5/5)",
      "Verified availability",
      "Compared with alternatives"
    ],
    "dataUsed": [
      {
        "source": "/api/products/prod-123",
        "version": "v1.2.3",
        "fields": ["name", "specifications", "price"]
      },
      {
        "source": "/api/reviews/prod-123",
        "version": "v2.1.0",
        "fields": ["aggregateRating", "reviewCount"]
      }
    ],
    "confidence": 0.85,
    "outcome": "user-viewed-product"
  }
}
```

### Defensibility Components

#### 1. Compliance Records

Show you followed best practices.

**Example: Compliance Record**
```json
{
  "compliance": {
    "dataQuality": {
      "completeness": 0.95,
      "accuracy": 0.98,
      "recency": "2025-01-15",
      "verified": true
    },
    "uncertaintyEncoding": {
      "confidenceLevels": "included",
      "validityWindows": "specified",
      "jurisdictionLimits": "defined"
    },
    "safetyMeasures": {
      "stateMachine": "implemented",
      "confirmationGates": "enabled",
      "refusalPatterns": "active"
    },
    "traceability": {
      "reasoningSteps": "logged",
      "dataVersions": "tracked",
      "auditTrail": "maintained"
    }
  }
}
```

#### 2. Error Attribution

When errors occur, show what went wrong and where.

**Example: Error Attribution**
```json
{
  "errorAttribution": {
    "errorId": "err-12345",
    "timestamp": "2025-01-15T10:30:00Z",
    "error": "Incorrect price displayed",
    "attribution": {
      "ourData": {
        "source": "/api/products/prod-123",
        "version": "v1.2.3",
        "value": 129.99,
        "correct": true,
        "lastUpdated": "2025-01-10"
      },
      "aiSystem": {
        "system": "chatgpt",
        "usedValue": 139.99,
        "usedSource": "cached-data",
        "cacheAge": "7 days",
        "error": "Used outdated cached data"
      },
      "responsibility": "ai-system-cache",
      "ourFault": false,
      "evidence": "Our API returned correct value, AI used stale cache"
    }
  }
}
```

### Implementing Traceability

#### Traceability API

```json
{
  "endpoint": "/api/traceability/log",
  "method": "POST",
  "request": {
    "event": "ai-reasoning-step",
    "data": {
      "step": 1,
      "action": "retrieve-products",
      "sources": ["/api/products"],
      "result": "retrieved 5 products",
      "dataVersions": {
        "/api/products": "v1.2.3"
      }
    }
  }
}
```

#### Traceability Query

```json
{
  "endpoint": "/api/traceability/query",
  "method": "GET",
  "query": {
    "query": "best running shoes for flat feet",
    "timestamp": "2025-01-15T10:30:00Z",
    "aiSystem": "chatgpt"
  },
  "response": {
    "reasoningSteps": [
      {
        "step": 1,
        "action": "retrieve-products",
        "sources": ["/api/products"],
        "dataVersions": {"/api/products": "v1.2.3"}
      }
    ],
    "finalOutput": "ProRunner X1 recommended",
    "dataVersions": {
      "/api/products/prod-123": "v1.2.3",
      "/api/reviews/prod-123": "v2.1.0"
    }
  }
}
```

---

## Exercises

### Exercise 5.1: Implement Presence Tracking

**Objective:** Build a system to track when your brand is retrieved by AI systems.

**Steps:**
1. Design presence tracking:
   - What to track (retrieval, contexts, sources)
   - How to collect data
   - Where to store it
2. Implement tracking endpoints:
   - Retrieval event endpoint
   - Query endpoint
   - Analytics endpoint
3. Create dashboard:
   - Retrieval rate
   - Trends over time
   - Breakdown by source/context
4. Test with AI systems

**Deliverable:** Presence tracking system with dashboard.

**Evaluation Criteria:**
- Comprehensive tracking
- Effective data collection
- Useful analytics
- Clear dashboard

---

### Exercise 5.2: Build Evidence Telemetry System

**Objective:** Track which data sources are retrieved and where they're overridden.

**Steps:**
1. Design telemetry system:
   - What sources to track
   - What overrides to detect
   - How to measure priority
2. Implement telemetry collection:
   - Retrieval tracking
   - Override detection
   - Priority measurement
3. Create analysis:
   - Retrieval patterns
   - Override reasons
   - Priority trends
4. Build alerts:
   - High override rates
   - Low priority positions
   - Data quality issues

**Deliverable:** Evidence telemetry system with analysis and alerts.

**Evaluation Criteria:**
- Comprehensive tracking
- Effective override detection
- Useful analysis
- Actionable alerts

---

### Exercise 5.3: Create Traceability System

**Objective:** Build records of reasoning steps and data versions for accountability.

**Steps:**
1. Design traceability system:
   - What reasoning steps to record
   - How to track data versions
   - What audit trail to maintain
2. Implement logging:
   - Reasoning step records
   - Data version tracking
   - Decision audit trails
3. Create query system:
   - Query by query text
   - Query by timestamp
   - Query by AI system
4. Build defensibility reports:
   - Compliance records
   - Error attribution
   - Evidence of best practices

**Deliverable:** Traceability system with query and reporting capabilities.

**Evaluation Criteria:**
- Complete reasoning records
- Accurate version tracking
- Effective query system
- Useful defensibility reports

---

## Key Takeaways

1. **Presence measures retrieval** - Track when AI systems retrieve your content
2. **Citation measures authority** - Monitor how you're cited (authority vs. example)
3. **Influence measures impact** - See if your information shapes outcomes
4. **Evidence telemetry tracks sources** - Know what data is retrieved and overridden
5. **Traceability enables accountability** - Record reasoning steps and data versions
6. **Defensibility shows compliance** - Demonstrate you followed best practices
7. **New metrics replace old ones** - Presence, citation, influence replace page views and clicks

---

## Additional Resources

### Reading
- "AI Visibility Metrics" - Measuring presence and influence
- "Evidence Telemetry" - Tracking data source usage
- "Traceability in AI Systems" - Accountability and defensibility

### Tools
- Analytics Platforms
- Telemetry Systems
- Audit Trail Systems
- Dashboard Tools

### Standards
- OpenTelemetry
- Audit Logging Standards
- Data Versioning

---

## Next Steps

**After completing this module:**
1. Review your visibility metrics
2. Analyze telemetry data
3. Improve traceability
4. Move to [Module 6: Governance, Drift, and Power](Module_06_Governance_Drift_and_Power.md)

---

**Module 5 Complete**   
**Ready for Module 6?** → [Governance, Drift, and Power](Module_06_Governance_Drift_and_Power.md)
