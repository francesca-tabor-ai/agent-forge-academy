---
title: "Module 3: Designing for Machine-First Interoperability"
description: "Build the technical Reasoning Surface required for machines to act on your behalf"
module: "3"
order: 3
---

# Module 3: Designing for Machine-First Interoperability

**Duration:** Week 3  
**Learning Objectives:**
- Design intent-driven APIs that expose goals and constraints
- Implement explicit uncertainty encoding in all claims
- Create machine-legible content that can be verified and compared
- Understand the technical requirements for AI agent interaction

---

## 3.1 Intent-Driven APIs

### Moving Beyond CRUD to Goal-Oriented Interfaces

Traditional APIs follow CRUD patterns (Create, Read, Update, Delete). But AI agents need to understand **intent**—what goals can be achieved, what constraints exist, and what actions are valid.

### The Problem with CRUD APIs

**Traditional CRUD API:**
```
GET /products/{id}
POST /orders
PUT /orders/{id}
DELETE /orders/{id}
```

**Limitations for AI:**
- Doesn't express goals or intentions
- Doesn't show constraints or requirements
- Doesn't indicate valid next actions
- Doesn't explain why actions might fail
- Doesn't provide reasoning context

### Intent-Driven API Design

An **Intent-Driven API** exposes:
1. **Goals** - What can be achieved
2. **Constraints** - What limits exist
3. **Valid Actions** - What's possible next
4. **Requirements** - What's needed to proceed
5. **Outcomes** - What happens when actions succeed

### Designing Intent-Driven APIs

#### Pattern 1: Goal Discovery

Allow agents to discover what goals can be achieved.

**Example: Service Booking API**
```json
{
  "endpoint": "/api/intents",
  "method": "GET",
  "response": {
    "availableGoals": [
      {
        "id": "book-service",
        "name": "Book a Service",
        "description": "Schedule a service appointment",
        "constraints": {
          "requires": ["serviceType", "location", "preferredDate"],
          "optional": ["timePreference", "specialRequirements"]
        },
        "validActions": [
          {
            "action": "check-availability",
            "endpoint": "/api/availability",
            "method": "POST",
            "requires": ["serviceType", "location", "date"]
          },
          {
            "action": "book-appointment",
            "endpoint": "/api/appointments",
            "method": "POST",
            "requires": ["serviceType", "location", "date", "time", "customerInfo"]
          }
        ]
      },
      {
        "id": "cancel-booking",
        "name": "Cancel Booking",
        "description": "Cancel an existing appointment",
        "constraints": {
          "requires": ["appointmentId"],
          "rules": [
            "Can only cancel if more than 24 hours in advance",
            "Cancellation fee may apply"
          ]
        },
        "validActions": [
          {
            "action": "check-cancellation-policy",
            "endpoint": "/api/appointments/{id}/cancellation-policy",
            "method": "GET"
          },
          {
            "action": "cancel",
            "endpoint": "/api/appointments/{id}",
            "method": "DELETE"
          }
        ]
      }
    ]
  }
}
```

#### Pattern 2: Constraint Expression

Explicitly state what's required and what's not allowed.

**Example: Product Purchase API**
```json
{
  "endpoint": "/api/products/{id}/purchase-intent",
  "method": "GET",
  "response": {
    "goal": "purchase-product",
    "constraints": {
      "productAvailability": {
        "status": "in-stock",
        "quantity": 15,
        "message": "Product is available"
      },
      "purchaseRequirements": {
        "required": [
          "customerAccount",
          "paymentMethod",
          "shippingAddress"
        ],
        "optional": [
          "giftMessage",
          "specialInstructions"
        ]
      },
      "purchaseLimits": {
        "maxQuantity": 10,
        "minQuantity": 1,
        "reason": "Inventory management"
      },
      "validPaymentMethods": [
        "credit-card",
        "paypal",
        "apple-pay"
      ],
      "shippingConstraints": {
        "availableRegions": ["US", "CA", "MX"],
        "restrictedRegions": [],
        "estimatedDelivery": {
          "min": "2 days",
          "max": "5 days"
        }
      }
    },
    "validActions": [
      {
        "action": "add-to-cart",
        "endpoint": "/api/cart",
        "method": "POST",
        "requires": ["productId", "quantity"],
        "outcome": "Product added to cart"
      },
      {
        "action": "checkout",
        "endpoint": "/api/checkout",
        "method": "POST",
        "requires": ["cartId", "paymentMethod", "shippingAddress"],
        "outcome": "Order created, payment processed"
      }
    ]
  }
}
```

#### Pattern 3: Action Validation

Provide endpoints that validate actions before execution.

**Example: Action Validation**
```json
{
  "endpoint": "/api/actions/validate",
  "method": "POST",
  "request": {
    "action": "book-appointment",
    "parameters": {
      "serviceType": "plumbing",
      "location": "Seattle, WA",
      "date": "2025-02-15",
      "time": "14:00"
    }
  },
  "response": {
    "valid": true,
    "constraints": {
      "serviceAvailable": true,
      "timeSlotAvailable": true,
      "locationInServiceArea": true,
      "qualificationsMet": true
    },
    "warnings": [],
    "errors": [],
    "nextActions": [
      {
        "action": "confirm-booking",
        "endpoint": "/api/appointments",
        "method": "POST"
      }
    ]
  }
}
```

#### Pattern 4: Outcome Explanation

Explain what will happen when actions are taken.

**Example: Outcome Explanation**
```json
{
  "endpoint": "/api/actions/{actionId}/outcomes",
  "method": "GET",
  "response": {
    "action": "cancel-appointment",
    "outcomes": {
      "immediate": [
        "Appointment slot becomes available",
        "Confirmation email sent to customer"
      ],
      "conditional": [
        {
          "condition": "Cancelled more than 24 hours in advance",
          "outcome": "Full refund processed within 3-5 business days"
        },
        {
          "condition": "Cancelled less than 24 hours in advance",
          "outcome": "50% refund processed, cancellation fee applies"
        }
      ],
      "sideEffects": [
        "Service provider notified",
        "Calendar updated",
        "Customer account updated"
      ]
    },
    "reversibility": {
      "reversible": false,
      "reason": "Appointment slot may be booked by another customer",
      "alternative": "Book new appointment if slot available"
    }
  }
}
```

### Implementing Intent-Driven APIs

#### OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: Intent-Driven Service API
  version: 1.0.0

paths:
  /api/intents:
    get:
      summary: Discover available goals
      responses:
        '200':
          description: List of available goals
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/IntentList'
  
  /api/actions/validate:
    post:
      summary: Validate an action before execution
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ActionValidationRequest'
      responses:
        '200':
          description: Validation result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ActionValidationResponse'

components:
  schemas:
    Intent:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        constraints:
          type: object
        validActions:
          type: array
          items:
            $ref: '#/components/schemas/ValidAction'
```

#### Function Calling Format

For LLM function calling (OpenAI, Anthropic):

```json
{
  "name": "book_service_appointment",
  "description": "Book a service appointment. Returns available time slots and allows booking.",
  "parameters": {
    "type": "object",
    "properties": {
      "serviceType": {
        "type": "string",
        "enum": ["plumbing", "electrical", "hvac"],
        "description": "Type of service needed"
      },
      "location": {
        "type": "string",
        "description": "Service location address or city"
      },
      "preferredDate": {
        "type": "string",
        "format": "date",
        "description": "Preferred appointment date (YYYY-MM-DD)"
      },
      "timePreference": {
        "type": "string",
        "enum": ["morning", "afternoon", "evening"],
        "description": "Preferred time of day"
      }
    },
    "required": ["serviceType", "location", "preferredDate"]
  },
  "returns": {
    "type": "object",
    "properties": {
      "availableSlots": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "date": {"type": "string"},
            "time": {"type": "string"},
            "provider": {"type": "string"}
          }
        }
      },
      "constraints": {
        "type": "object",
        "properties": {
          "minAdvanceNotice": {"type": "string"},
          "maxAdvanceBooking": {"type": "string"},
          "cancellationPolicy": {"type": "string"}
        }
      }
    }
  }
}
```

---

## 3.2 Explicit Uncertainty Encoding

### Why Admitting Limits Increases Trust

Machines need to know when information is uncertain, outdated, or limited. **Explicit uncertainty encoding** builds trust by being honest about what you know and don't know.

### The Problem of Hidden Uncertainty

**Without uncertainty encoding:**
- AI assumes all information is certain
- Outdated information appears current
- Limited data seems comprehensive
- Confidence levels are unknown
- Trust breaks when errors occur

**With explicit uncertainty:**
- AI knows confidence levels
- Validity windows are clear
- Limitations are acknowledged
- Trust is maintained through honesty
- Better decisions are made

### Encoding Uncertainty

#### Confidence Levels

Express how certain you are about each claim.

**Example: Product Rating**
```json
{
  "rating": {
    "value": 4.5,
    "scale": "1-5",
    "confidence": {
      "level": "high",
      "score": 0.92,
      "explanation": "Based on 500+ reviews with statistical significance"
    },
    "uncertainty": {
      "marginOfError": 0.1,
      "confidenceInterval": [4.4, 4.6]
    }
  }
}
```

#### Validity Windows

Specify when information is valid and when it expires.

**Example: Pricing Information**
```json
{
  "price": {
    "value": 129.99,
    "currency": "USD",
    "validity": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-12-31T23:59:59Z",
      "timezone": "UTC"
    },
    "certainty": {
      "level": "fact",
      "source": "pricing-database",
      "lastVerified": "2025-01-15T10:30:00Z"
    },
    "warnings": [
      "Price subject to change",
      "Regional variations may apply"
    ]
  }
}
```

#### Jurisdiction Limits

Define where information applies and where it doesn't.

**Example: Service Availability**
```json
{
  "service": {
    "name": "Emergency Plumbing",
    "availability": {
      "regions": {
        "available": [
          {
            "type": "country",
            "code": "US",
            "states": ["WA", "OR", "CA"]
          }
        ],
        "unavailable": [
          {
            "type": "country",
            "code": "US",
            "states": ["AK", "HI"],
            "reason": "Service area limitation"
          }
        ]
      },
      "jurisdiction": {
        "legal": "United States",
        "regulatory": "State-level licensing required",
        "limitations": "Service providers licensed per state"
      }
    }
  }
}
```

#### Data Quality Indicators

Show the quality and completeness of data.

**Example: Product Information**
```json
{
  "product": {
    "id": "PROD-123",
    "informationQuality": {
      "completeness": {
        "score": 0.85,
        "missing": ["warranty-details", "return-policy"],
        "explanation": "Core information complete, some details pending"
      },
      "accuracy": {
        "score": 0.95,
        "lastVerified": "2025-01-15",
        "verificationMethod": "automated-cross-check"
      },
      "recency": {
        "lastUpdated": "2025-01-15",
        "updateFrequency": "daily",
        "staleness": "fresh"
      },
      "sources": [
        {
          "type": "authoritative",
          "name": "Manufacturer Specs",
          "reliability": "high"
        },
        {
          "type": "observed",
          "name": "Customer Reviews",
          "reliability": "medium",
          "sampleSize": 500
        }
      ]
    }
  }
}
```

### Uncertainty Patterns

#### Pattern 1: Temporal Uncertainty

Information that changes over time.

```json
{
  "temporalUncertainty": {
    "value": "Current inventory: 15 units",
    "validity": {
      "start": "2025-01-15T10:00:00Z",
      "end": "2025-01-15T11:00:00Z",
      "reason": "Real-time inventory changes frequently"
    },
    "staleness": {
      "threshold": "5 minutes",
      "currentAge": "2 minutes",
      "status": "fresh"
    }
  }
}
```

#### Pattern 2: Statistical Uncertainty

Patterns derived from data analysis.

```json
{
  "statisticalUncertainty": {
    "claim": "Average delivery time: 2.3 days",
    "evidence": {
      "sampleSize": 1000,
      "timeframe": "2024-01-01 to 2024-12-31",
      "confidence": 0.95
    },
    "uncertainty": {
      "marginOfError": 0.2,
      "confidenceInterval": [2.1, 2.5],
      "distribution": "normal"
    },
    "limitations": [
      "Based on historical data",
      "May vary by region",
      "Holiday periods excluded"
    ]
  }
}
```

#### Pattern 3: Source Uncertainty

Information from less authoritative sources.

```json
{
  "sourceUncertainty": {
    "claim": "Product is popular among runners",
    "sources": [
      {
        "type": "reported-experience",
        "reliability": "medium",
        "evidence": "Customer reviews mention running"
      }
    ],
    "certainty": {
      "level": "anecdotal",
      "explanation": "Based on customer testimonials, not verified data"
    },
    "warnings": [
      "Not a verified claim",
      "Based on limited sample",
      "Individual experiences vary"
    ]
  }
}
```

### Implementing Uncertainty Encoding

#### Schema.org with Uncertainty Extensions

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "ProRunner X1",
  "offers": {
    "@type": "Offer",
    "price": "129.99",
    "priceCurrency": "USD",
    "validity": {
      "start": "2025-01-01",
      "end": "2025-12-31"
    },
    "uncertainty": {
      "confidence": 0.95,
      "lastVerified": "2025-01-15"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "500",
    "uncertainty": {
      "marginOfError": 0.1,
      "confidenceInterval": [4.4, 4.6],
      "confidence": 0.95
    }
  }
}
```

---

## 3.3 Legibility Over Persuasion

### Designing Content for Machine Verification

Machines don't respond to emotional appeals or persuasive copy. They need **legible** content that can be verified, compared, and reasoned about.

### The Problem with Persuasive Content

**Persuasive (Human-Focused) Content:**
```
"Amazing! Revolutionary! The best product you'll ever own!
Limited time offer - don't miss out! Buy now!"
```

**Problems for Machines:**
- No verifiable claims
- No comparable data
- Emotional language doesn't help reasoning
- No evidence provided
- Can't be fact-checked

### Legible Content Design

#### Principle 1: Verifiable Claims

Every claim should be verifiable.

**Example: Product Claims**
```json
{
  "claims": [
    {
      "claim": "Product weighs 280g",
      "type": "fact",
      "verifiable": true,
      "verification": {
        "method": "measurement",
        "source": "manufacturer-specs",
        "link": "https://example.com/specs/certified"
      }
    },
    {
      "claim": "4.5/5 average rating",
      "type": "statistical",
      "verifiable": true,
      "verification": {
        "method": "review-aggregation",
        "sampleSize": 500,
        "source": "customer-reviews",
        "link": "https://example.com/reviews"
      }
    },
    {
      "claim": "APMA approved",
      "type": "certification",
      "verifiable": true,
      "verification": {
        "method": "certification-lookup",
        "authority": "APMA",
        "certificateNumber": "APMA-2024-12345",
        "link": "https://apma.org/verify/12345"
      }
    }
  ]
}
```

#### Principle 2: Comparable Data

Enable machines to compare your offering with others.

**Example: Service Comparison**
```json
{
  "service": {
    "name": "Emergency Plumbing",
    "comparisonData": {
      "responseTime": {
        "value": "2 hours",
        "unit": "average",
        "comparison": {
          "industryAverage": "4 hours",
          "percentile": "top 10%"
        }
      },
      "pricing": {
        "baseRate": 150,
        "currency": "USD",
        "comparison": {
          "marketRange": [100, 300],
          "position": "mid-range"
        }
      },
      "availability": {
        "value": "24/7",
        "comparison": {
          "industryStandard": "business-hours",
          "advantage": "always available"
        }
      }
    }
  }
}
```

#### Principle 3: Structured Evidence

Provide evidence in structured format.

**Example: Evidence Structure**
```json
{
  "evidence": {
    "authoritative": [
      {
        "type": "certification",
        "name": "Master Plumber License",
        "issuer": "Washington State",
        "number": "WA-LIC-12345",
        "validUntil": "2026-12-31",
        "verification": "https://wa.gov/verify/12345"
      }
    ],
    "observed": [
      {
        "type": "statistical",
        "name": "Customer Satisfaction",
        "value": 4.8,
        "scale": "1-5",
        "sampleSize": 250,
        "timeframe": "2024",
        "source": "post-service-surveys"
      }
    ],
    "reported": [
      {
        "type": "testimonial",
        "content": "Fast response, professional service",
        "author": "Customer123",
        "date": "2024-12-15",
        "context": "Emergency call, resolved in 2 hours"
      }
    ]
  }
}
```

#### Principle 4: Machine-Readable Specifications

Use structured formats for all specifications.

**Example: Product Specifications**
```json
{
  "specifications": {
    "physical": {
      "weight": {
        "value": 280,
        "unit": "grams",
        "measurement": "exact"
      },
      "dimensions": {
        "length": {"value": 28, "unit": "cm"},
        "width": {"value": 10, "unit": "cm"},
        "height": {"value": 12, "unit": "cm"}
      }
    },
    "functional": {
      "heelDrop": {
        "value": 8,
        "unit": "mm",
        "measurement": "exact"
      },
      "cushioning": {
        "value": "maximum",
        "scale": ["minimal", "moderate", "maximum"]
      },
      "pronation": {
        "value": "neutral",
        "options": ["neutral", "overpronation", "underpronation"]
      }
    },
    "targetAudience": {
      "footType": ["flat", "normal"],
      "activity": ["running", "walking"],
      "terrain": ["road", "track"]
    }
  }
}
```

### Legibility Checklist

For every piece of content, ask:

- [ ] Can this claim be verified?
- [ ] Is there evidence provided?
- [ ] Can this be compared with alternatives?
- [ ] Is the data structured and machine-readable?
- [ ] Are specifications precise and measurable?
- [ ] Is uncertainty acknowledged where appropriate?
- [ ] Are sources cited and linkable?
- [ ] Is emotional language replaced with factual language?

---

## Exercises

### Exercise 3.1: Design Intent-Driven API

**Objective:** Create an API that exposes goals, constraints, and valid actions.

**Steps:**
1. Choose a domain (booking, purchasing, information retrieval)
2. Identify 3-5 key goals users/AI might have
3. For each goal:
   - Define constraints
   - List valid actions
   - Specify requirements
   - Describe outcomes
4. Design API endpoints:
   - Goal discovery endpoint
   - Action validation endpoint
   - Action execution endpoint
5. Create OpenAPI specification

**Deliverable:** Complete intent-driven API design with OpenAPI spec.

**Evaluation Criteria:**
- Clear goal definitions
- Explicit constraints
- Well-defined actions
- Proper API structure
- Complete OpenAPI spec

---

### Exercise 3.2: Implement Uncertainty Encoding

**Objective:** Add uncertainty encoding to your information.

**Steps:**
1. Choose 10 pieces of information from your domain
2. For each piece:
   - Determine confidence level
   - Define validity window
   - Specify jurisdiction limits (if applicable)
   - Add data quality indicators
3. Implement uncertainty encoding:
   - Add to JSON-LD/Schema.org
   - Create validation rules
   - Document uncertainty patterns
4. Test with AI systems to see how they handle uncertainty

**Deliverable:** Uncertainty-encoded information with documentation.

**Evaluation Criteria:**
- Appropriate confidence levels
- Clear validity windows
- Proper jurisdiction limits
- Data quality indicators
- Effective implementation

---

### Exercise 3.3: Create Machine-Legible Content

**Objective:** Transform persuasive content into legible, verifiable content.

**Steps:**
1. Take 5 pieces of existing content (product descriptions, service pages, etc.)
2. For each piece:
   - Identify unverifiable claims
   - Find missing evidence
   - Locate emotional language
   - Note missing comparisons
3. Rewrite each piece to be:
   - Verifiable
   - Evidence-based
   - Comparable
   - Structured
   - Machine-readable
4. Create both:
   - Human-readable version
   - Machine-readable version (JSON-LD)
5. Compare how AI systems interpret both versions

**Deliverable:** Legible content versions with machine-readable formats.

**Evaluation Criteria:**
- All claims verifiable
- Evidence provided
- Comparable data included
- Proper structure
- Effective machine-readable format

---

## Key Takeaways

1. **Intent-driven APIs expose goals** - Not just CRUD operations, but what can be achieved
2. **Constraints must be explicit** - AI needs to know limits and requirements
3. **Uncertainty encoding builds trust** - Honest about confidence, validity, and limitations
4. **Legibility enables verification** - Machines can check facts, compare options, reason about content
5. **Structure supports reasoning** - Machine-readable formats enable AI comprehension
6. **Evidence matters** - Verifiable claims with sources increase authority
7. **Comparability helps decisions** - Enable AI to compare your offering with alternatives

---

## Additional Resources

### Reading
- "Intent-Driven API Design" - Goal-oriented interfaces
- "Uncertainty in AI Systems" - Confidence and validity
- "Machine-Legible Content" - Verification and comparison

### Tools
- OpenAPI Generator
- JSON-LD Playground
- Schema.org Validator
- API Testing Tools

### Standards
- OpenAPI Specification
- JSON-LD
- Schema.org
- Function Calling (OpenAI, Anthropic)

---

## Next Steps

**After completing this module:**
1. Review your API designs and content
2. Test with actual AI systems
3. Refine based on AI behavior
4. Move to [Module 4: Systems That Can Act Safely](Module_04_Systems_That_Can_Act_Safely.md)

---

**Module 3 Complete**   
**Ready for Module 4?** → [Systems That Can Act Safely](Module_04_Systems_That_Can_Act_Safely.md)
