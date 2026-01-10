---
title: "Module 4: Systems That Can Act Safely"
description: "Safety engineering for AI-operated products that act in the world"
module: "4"
order: 4
---

# Module 4: Systems That Can Act Safely

**Duration:** Week 4  
**Learning Objectives:**
- Understand why chat is the wrong abstraction for decisions
- Design state machines to gate actions and prevent skipped safeguards
- Implement action boundaries and refusal patterns
- Create outcome loops that close policy-to-reality gaps

---

## 4.1 State Machines vs. Chat

### Why "Chat" is the Wrong Abstraction for Decisions

Chat interfaces are great for conversation, but terrible for making decisions that have real-world consequences. When AI systems act in the world (purchasing, booking, canceling, etc.), you need **discrete states** that enforce safeguards.

### The Problem with Chat-Based Actions

**Chat Flow:**
```
User: "Book me an appointment"
AI: "Sure! When would you like?"
User: "Tomorrow at 2pm"
AI: "Great! Booked."
```

**Problems:**
- No explicit confirmation step
- Safeguards can be skipped
- State is unclear
- Irreversible actions happen too easily
- No audit trail of decision points

### State Machines for Safe Actions

A **state machine** defines:
- **States** - Where the system can be
- **Transitions** - How to move between states
- **Guards** - Conditions that must be met
- **Actions** - What happens during transitions
- **Final States** - Terminal states (success, failure, cancelled)

### Designing State Machines

#### Example: Appointment Booking State Machine

```
States:
- INITIAL (no booking started)
- COLLECTING_INFO (gathering requirements)
- VALIDATING (checking availability/constraints)
- CONFIRMING (awaiting user confirmation)
- BOOKED (appointment confirmed)
- CANCELLED (user cancelled)
- FAILED (booking failed)

Transitions:
INITIAL → COLLECTING_INFO
  Trigger: User requests booking
  Guard: None

COLLECTING_INFO → VALIDATING
  Trigger: All required info collected
  Guard: serviceType, location, date, time all provided

VALIDATING → CONFIRMING
  Trigger: Validation successful
  Guard: slot available, constraints met, qualifications valid

VALIDATING → FAILED
  Trigger: Validation failed
  Guard: slot unavailable OR constraints not met

CONFIRMING → BOOKED
  Trigger: User confirms
  Guard: confirmation received, still within validity window

CONFIRMING → CANCELLED
  Trigger: User cancels OR timeout
  Guard: user cancels OR 5 minutes elapsed

BOOKED → (terminal state)
CANCELLED → (terminal state)
FAILED → (terminal state)
```

#### Implementation Example

```json
{
  "stateMachine": {
    "id": "appointment-booking",
    "states": [
      {
        "id": "initial",
        "name": "Initial",
        "type": "start"
      },
      {
        "id": "collecting-info",
        "name": "Collecting Information",
        "type": "intermediate",
        "requiredFields": ["serviceType", "location", "date", "time"]
      },
      {
        "id": "validating",
        "name": "Validating",
        "type": "intermediate",
        "validations": [
          "check-availability",
          "verify-constraints",
          "validate-qualifications"
        ]
      },
      {
        "id": "confirming",
        "name": "Awaiting Confirmation",
        "type": "intermediate",
        "timeout": 300,
        "requiresExplicitConfirmation": true
      },
      {
        "id": "booked",
        "name": "Booked",
        "type": "final",
        "terminal": true
      },
      {
        "id": "cancelled",
        "name": "Cancelled",
        "type": "final",
        "terminal": true
      },
      {
        "id": "failed",
        "name": "Failed",
        "type": "final",
        "terminal": true
      }
    ],
    "transitions": [
      {
        "from": "initial",
        "to": "collecting-info",
        "trigger": "user-request",
        "guards": []
      },
      {
        "from": "collecting-info",
        "to": "validating",
        "trigger": "all-fields-collected",
        "guards": [
          "has-service-type",
          "has-location",
          "has-date",
          "has-time"
        ]
      },
      {
        "from": "validating",
        "to": "confirming",
        "trigger": "validation-success",
        "guards": [
          "slot-available",
          "constraints-met",
          "qualifications-valid"
        ]
      },
      {
        "from": "validating",
        "to": "failed",
        "trigger": "validation-failure",
        "guards": [
          "NOT slot-available OR NOT constraints-met"
        ]
      },
      {
        "from": "confirming",
        "to": "booked",
        "trigger": "user-confirms",
        "guards": [
          "confirmation-received",
          "within-validity-window"
        ],
        "action": "create-appointment"
      },
      {
        "from": "confirming",
        "to": "cancelled",
        "trigger": "user-cancels OR timeout",
        "guards": [
          "user-cancels OR 5-minutes-elapsed"
        ]
      }
    ]
  }
}
```

### State Machine Patterns

#### Pattern 1: Confirmation Gates

Require explicit confirmation before irreversible actions.

```json
{
  "pattern": "confirmation-gate",
  "description": "Require explicit user confirmation before irreversible actions",
  "states": ["ready", "confirming", "executed", "cancelled"],
  "transitions": [
    {
      "from": "ready",
      "to": "confirming",
      "requires": "action-requested"
    },
    {
      "from": "confirming",
      "to": "executed",
      "requires": "explicit-confirmation",
      "action": "irreversible-action"
    },
    {
      "from": "confirming",
      "to": "cancelled",
      "requires": "user-cancels OR timeout"
    }
  ]
}
```

#### Pattern 2: Validation Checkpoints

Validate at each state transition.

```json
{
  "pattern": "validation-checkpoint",
  "description": "Validate constraints before each state transition",
  "checkpoints": [
    {
      "state": "collecting-info",
      "validation": "required-fields-present"
    },
    {
      "state": "validating",
      "validation": "business-rules-satisfied"
    },
    {
      "state": "confirming",
      "validation": "still-valid"
    }
  ]
}
```

#### Pattern 3: Timeout Protection

Automatically cancel if user doesn't respond.

```json
{
  "pattern": "timeout-protection",
  "description": "Cancel action if user doesn't respond within time limit",
  "timeouts": [
    {
      "state": "confirming",
      "duration": 300,
      "action": "cancel",
      "reason": "User did not confirm within 5 minutes"
    }
  ]
}
```

### Benefits of State Machines

1. **Explicit Safeguards** - Guards prevent skipping safety checks
2. **Clear State** - Always know where you are in the process
3. **Audit Trail** - Every transition is logged
4. **Reversibility** - Can cancel before final state
5. **Testing** - Easy to test all state transitions
6. **Documentation** - State machine is self-documenting

---

## 4.2 Action Boundaries & Refusal

### Implementing Explicit Confirmation

For irreversible or high-stakes actions, require **explicit confirmation** and give the system the **right to refuse**.

### Action Boundaries

Define clear boundaries for what actions are allowed, require confirmation, or are forbidden.

#### Action Classification

```json
{
  "actionBoundaries": {
    "safe": [
      {
        "action": "view-product",
        "confirmation": "none",
        "reversible": true,
        "risk": "none"
      },
      {
        "action": "add-to-cart",
        "confirmation": "none",
        "reversible": true,
        "risk": "low"
      }
    ],
    "requiresConfirmation": [
      {
        "action": "purchase",
        "confirmation": "explicit",
        "reversible": false,
        "risk": "high",
        "confirmationMessage": "This will charge your payment method. Confirm?",
        "timeout": 300
      },
      {
        "action": "cancel-subscription",
        "confirmation": "explicit",
        "reversible": false,
        "risk": "high",
        "confirmationMessage": "This will cancel your subscription immediately. Confirm?",
        "timeout": 300
      }
    ],
    "forbidden": [
      {
        "action": "delete-account",
        "reason": "Must be done through account settings",
        "alternative": "redirect-to-account-settings"
      }
    ]
  }
}
```

### The Right to Refuse

AI systems should be able to **refuse** actions when:
- Confidence is too low
- Constraints aren't met
- Safety checks fail
- Information is insufficient
- Action seems inappropriate

#### Refusal Patterns

**Pattern 1: Low Confidence Refusal**
```json
{
  "refusal": {
    "trigger": "confidence-too-low",
    "threshold": 0.7,
    "currentConfidence": 0.6,
    "message": "I'm not confident enough to proceed. I need more information.",
    "suggestions": [
      "Please provide more details about your requirements",
      "Would you like to speak with a human agent?"
    ]
  }
}
```

**Pattern 2: Constraint Violation Refusal**
```json
{
  "refusal": {
    "trigger": "constraint-violation",
    "violatedConstraint": "cancellation-policy",
    "message": "I cannot cancel this appointment because it's less than 24 hours away.",
    "explanation": "Our cancellation policy requires 24 hours notice.",
    "alternatives": [
      "Reschedule to a different time",
      "Contact customer service for exceptions"
    ]
  }
}
```

**Pattern 3: Safety Check Failure Refusal**
```json
{
  "refusal": {
    "trigger": "safety-check-failed",
    "failedCheck": "payment-verification",
    "message": "I cannot process this payment. Please verify your payment method.",
    "reason": "Payment method verification failed",
    "nextSteps": [
      "Update payment method",
      "Try a different payment method",
      "Contact support"
    ]
  }
}
```

**Pattern 4: Insufficient Information Refusal**
```json
{
  "refusal": {
    "trigger": "insufficient-information",
    "missingFields": ["serviceType", "location"],
    "message": "I need more information to proceed.",
    "required": [
      "What type of service do you need?",
      "Where is the service location?"
    ]
  }
}
```

### Implementing Refusal

#### API Response Format

```json
{
  "action": "book-appointment",
  "status": "refused",
  "reason": {
    "code": "CONSTRAINT_VIOLATION",
    "message": "Cannot book appointment: service not available in requested location",
    "details": {
      "violatedConstraint": "service-area",
      "requestedLocation": "Alaska",
      "availableLocations": ["Washington", "Oregon", "California"]
    }
  },
  "alternatives": [
    {
      "action": "find-alternative-provider",
      "description": "Find a provider in your area"
    },
    {
      "action": "reschedule",
      "description": "Choose a different date when service is available"
    }
  ],
  "confidence": 0.95
}
```

#### State Machine with Refusal

```json
{
  "stateMachine": {
    "states": [
      {
        "id": "validating",
        "refusalConditions": [
          {
            "condition": "confidence < 0.7",
            "refusal": "low-confidence"
          },
          {
            "condition": "constraints-not-met",
            "refusal": "constraint-violation"
          },
          {
            "condition": "safety-check-failed",
            "refusal": "safety-failure"
          }
        ]
      }
    ],
    "refusalStates": [
      {
        "id": "refused",
        "type": "final",
        "terminal": true,
        "requiresExplanation": true,
        "requiresAlternatives": true
      }
    ]
  }
}
```

---

## 4.3 Outcome Loops

### Closing the Gap Between Policy and Reality

**Policy** (what we think should happen) often differs from **Reality** (what actually happens). **Outcome loops** feed real-world results back into decision logic to close this gap.

### The Policy-Reality Gap

**Example: Delivery Time Policy**
- **Policy:** "We deliver in 2-3 days"
- **Reality:** Actual delivery times vary by region, season, carrier

**Without outcome loops:**
- Policy stays static
- Reality drifts
- Gap widens
- Trust decreases

**With outcome loops:**
- Real outcomes are measured
- Policy is updated
- Gap closes
- Trust increases

### Designing Outcome Loops

#### Step 1: Define Measurable Outcomes

Identify what outcomes matter and how to measure them.

**Example: Appointment Booking Outcomes**
```json
{
  "outcomes": {
    "bookingSuccess": {
      "metric": "booking-completion-rate",
      "measurement": "percentage of initiated bookings that complete",
      "target": 0.85,
      "current": 0.78
    },
    "customerSatisfaction": {
      "metric": "post-appointment-rating",
      "measurement": "average rating 1-5",
      "target": 4.5,
      "current": 4.2
    },
    "noShowRate": {
      "metric": "appointment-no-shows",
      "measurement": "percentage of appointments where customer doesn't show",
      "target": 0.05,
      "current": 0.12
    }
  }
}
```

#### Step 2: Collect Outcome Data

Track what actually happens.

**Example: Outcome Tracking**
```json
{
  "outcomeTracking": {
    "appointmentId": "APT-12345",
    "predictedOutcome": {
      "serviceProvider": "Provider A",
      "estimatedDuration": "2 hours",
      "expectedSatisfaction": 4.5
    },
    "actualOutcome": {
      "serviceProvider": "Provider A",
      "actualDuration": "2.5 hours",
      "actualSatisfaction": 4.0,
      "noShow": false,
      "completed": true,
      "issues": ["arrived 15 minutes late"]
    },
    "gap": {
      "durationGap": 0.5,
      "satisfactionGap": -0.5
    }
  }
}
```

#### Step 3: Analyze Patterns

Identify where policy and reality diverge.

**Example: Pattern Analysis**
```json
{
  "patternAnalysis": {
    "finding": "Delivery times longer than policy in rural areas",
    "evidence": {
      "policy": "2-3 days",
      "ruralAverage": "4.2 days",
      "urbanAverage": "2.1 days",
      "sampleSize": 1000
    },
    "recommendation": "Update policy to reflect regional differences"
  }
}
```

#### Step 4: Update Decision Logic

Feed outcomes back into the system.

**Example: Updated Policy**
```json
{
  "updatedPolicy": {
    "deliveryTime": {
      "urban": {
        "estimated": "2-3 days",
        "confidence": 0.95,
        "basedOn": "1000+ deliveries"
      },
      "rural": {
        "estimated": "4-5 days",
        "confidence": 0.90,
        "basedOn": "500+ deliveries",
        "updated": "2025-01-15",
        "reason": "Outcome analysis showed rural deliveries take longer"
      }
    }
  }
}
```

### Outcome Loop Implementation

#### Feedback Collection

```json
{
  "feedbackCollection": {
    "endpoint": "/api/outcomes/feedback",
    "method": "POST",
    "request": {
      "actionId": "APT-12345",
      "outcomes": {
        "satisfaction": 4.0,
        "duration": 2.5,
        "issues": ["late-arrival"],
        "completed": true
      },
      "timestamp": "2025-01-15T14:30:00Z"
    },
    "response": {
      "status": "recorded",
      "willUpdatePolicy": true,
      "estimatedUpdateTime": "24 hours"
    }
  }
}
```

#### Policy Update Mechanism

```json
{
  "policyUpdate": {
    "mechanism": "automated-review",
    "frequency": "weekly",
    "thresholds": {
      "updateIfGap": "> 10%",
      "updateIfConfidence": "< 0.8",
      "updateIfSampleSize": "> 100"
    },
    "process": [
      "Collect outcomes",
      "Analyze gaps",
      "Identify patterns",
      "Update policy",
      "Notify stakeholders",
      "Monitor new outcomes"
    ]
  }
}
```

### Outcome Loop Patterns

#### Pattern 1: Continuous Monitoring

Constantly measure and update.

```json
{
  "pattern": "continuous-monitoring",
  "description": "Continuously measure outcomes and update policy",
  "frequency": "real-time",
  "updateTrigger": "significant-gap-detected"
}
```

#### Pattern 2: Scheduled Review

Periodic analysis and updates.

```json
{
  "pattern": "scheduled-review",
  "description": "Review outcomes on schedule and update policy",
  "frequency": "weekly",
  "process": "batch-analysis-and-update"
}
```

#### Pattern 3: Threshold-Based Updates

Update when gaps exceed thresholds.

```json
{
  "pattern": "threshold-based",
  "description": "Update policy when gap exceeds threshold",
  "thresholds": {
    "satisfactionGap": 0.5,
    "durationGap": 1.0,
    "successRateGap": 0.1
  }
}
```

---

## Exercises

### Exercise 4.1: Design State Machine

**Objective:** Create a state machine for a high-stakes action.

**Steps:**
1. Choose an action (booking, purchase, cancellation, etc.)
2. Design state machine:
   - Define all states
   - Map all transitions
   - Add guards/constraints
   - Include confirmation gates
   - Add timeout protection
3. Document:
   - State diagram
   - Transition rules
   - Guard conditions
   - Safety mechanisms
4. Implement in JSON format

**Deliverable:** Complete state machine design with documentation and implementation.

**Evaluation Criteria:**
- Clear state definitions
- Complete transition mapping
- Appropriate guards
- Safety mechanisms
- Proper implementation

---

### Exercise 4.2: Implement Action Boundaries

**Objective:** Define boundaries and refusal patterns for actions.

**Steps:**
1. Identify 10 actions in your domain
2. Classify each:
   - Safe (no confirmation)
   - Requires confirmation
   - Forbidden
3. For actions requiring confirmation:
   - Define confirmation message
   - Set timeout
   - Specify refusal conditions
4. For refusal patterns:
   - Define refusal triggers
   - Create refusal messages
   - Provide alternatives
5. Implement in API format

**Deliverable:** Action boundaries and refusal patterns with implementation.

**Evaluation Criteria:**
- Appropriate classification
- Clear confirmation requirements
- Well-defined refusal patterns
- Helpful alternatives
- Proper implementation

---

### Exercise 4.3: Create Outcome Feedback Loop

**Objective:** Design a system that learns from real outcomes.

**Steps:**
1. Choose a policy/claim in your domain
2. Define measurable outcomes
3. Design outcome tracking:
   - What to measure
   - How to collect data
   - When to analyze
4. Create feedback mechanism:
   - How outcomes update policy
   - When updates happen
   - How to validate updates
5. Implement outcome loop system

**Deliverable:** Outcome loop design with implementation.

**Evaluation Criteria:**
- Clear outcome definitions
- Effective tracking mechanism
- Proper feedback process
- Policy update logic
- Complete implementation

---

## Key Takeaways

1. **State machines enforce safety** - Discrete states prevent skipped safeguards
2. **Confirmation gates protect users** - Explicit confirmation for irreversible actions
3. **Systems can refuse** - Right to refuse when confidence is low or constraints aren't met
4. **Outcome loops close gaps** - Real results feed back into policy
5. **Guards prevent errors** - Conditions must be met before transitions
6. **Timeouts prevent hanging** - Automatic cancellation if user doesn't respond
7. **Audit trails enable accountability** - Every state transition is logged

---

## Additional Resources

### Reading
- "State Machine Design Patterns" - Safe action patterns
- "AI Safety Engineering" - Refusal and boundaries
- "Outcome-Based Learning" - Closing policy-reality gaps

### Tools
- State Machine Libraries (XState, etc.)
- API Testing Tools
- Outcome Tracking Systems
- Policy Management Platforms

### Standards
- State Chart XML (SCXML)
- Workflow Patterns
- Safety Standards

---

## Next Steps

**After completing this module:**
1. Review your state machines and boundaries
2. Test with real scenarios
3. Monitor outcomes
4. Move to [Module 5: Visibility & Observability](Module_05_Visibility_and_Observability.md)

---

**Module 4 Complete** ✅  
**Ready for Module 5?** → [Visibility & Observability](Module_05_Visibility_and_Observability.md)
