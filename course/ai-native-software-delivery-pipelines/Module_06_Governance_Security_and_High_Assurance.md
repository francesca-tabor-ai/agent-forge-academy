---
title: "Module 6: Governance, Security & High-Assurance"
description: "Enforce deterministic safety on non-deterministic model outputs"
module: "6"
order: 6
---

# Module 6: Governance, Security & High-Assurance

**Duration:** Week 6  
**Learning Objectives:**
- Implement network sandboxing with policy engines (Cedar, Warden)
- Run AI evaluations (evals) for statistical population tests
- Use invariant verification to catch architectural bugs
- Prevent destructive actions through policy enforcement
- Measure abstraction adherence and detect logic drift

---

## 6.1 Network Sandboxing: Policy Engines

### The Challenge

AI agents can make requests that might be destructive:
- Deleting databases
- Modifying production configurations
- Accessing sensitive data
- Performing unauthorized operations

**Solution:** Network sandboxing with policy engines that intercept and validate agent requests before execution.

### Cedar Policy Engine

Cedar is an open-source policy engine that allows you to define fine-grained authorization policies.

**Example Policy:**
```cedar
// Policy: Prevent database deletions
permit(
  principal,
  action == Action::"DeleteDatabase",
  resource
) when {
  principal.role == "agent" &&
  resource.environment == "production"
};
```

**Implementation:**
```typescript
import { Authorizer, Policy } from '@cedar-policy/authorizer';

class SandboxedAgent {
  private authorizer: Authorizer;
  private policies: Policy[];

  constructor() {
    this.authorizer = new Authorizer();
    this.loadPolicies();
  }

  private loadPolicies() {
    this.policies = [
      // Prevent database deletions
      Policy.parse(`
        permit(
          principal,
          action == Action::"DeleteDatabase",
          resource
        ) when {
          principal.role == "agent" &&
          resource.environment == "production"
        };
      `),
      
      // Prevent production config changes
      Policy.parse(`
        permit(
          principal,
          action == Action::"ModifyConfig",
          resource
        ) when {
          principal.role == "agent" &&
          resource.environment == "production" &&
          principal.hasApproval == true
        };
      `),
      
      // Limit file system access
      Policy.parse(`
        permit(
          principal,
          action == Action::"WriteFile",
          resource
        ) when {
          principal.role == "agent" &&
          resource.path.startsWith("/tmp/") == true
        };
      `)
    ];
  }

  async executeRequest(request: AgentRequest): Promise<Response> {
    // Check policy before executing
    const decision = await this.authorizer.isAuthorized({
      principal: request.principal,
      action: request.action,
      resource: request.resource,
      policies: this.policies
    });
    
    if (decision === 'Deny') {
      throw new PolicyViolationError(
        `Action ${request.action} denied by policy`
      );
    }
    
    // Execute request
    return await this.execute(request);
  }
}
```

### Warden Network Sandboxing

Warden provides network-level sandboxing for agent requests.

**Implementation:**
```typescript
import { Warden } from '@warden/sandbox';

class NetworkSandbox {
  private warden: Warden;

  constructor() {
    this.warden = new Warden({
      rules: [
        {
          // Block destructive database operations
          match: {
            method: ['DELETE', 'DROP', 'TRUNCATE'],
            path: /^\/api\/database/
          },
          action: 'block',
          reason: 'Destructive database operations not allowed'
        },
        {
          // Require approval for production changes
          match: {
            path: /^\/api\/production/
          },
          action: 'require_approval',
          approvers: ['admin', 'lead-engineer']
        },
        {
          // Allow read-only operations
          match: {
            method: ['GET', 'HEAD'],
            path: /^\/api\//
          },
          action: 'allow'
        }
      ]
    });
  }

  async interceptRequest(request: Request): Promise<Response> {
    const decision = await this.warden.evaluate(request);
    
    if (decision.action === 'block') {
      return {
        status: 403,
        body: { error: decision.reason }
      };
    }
    
    if (decision.action === 'require_approval') {
      const approval = await this.requestApproval(request, decision.approvers);
      if (!approval.approved) {
        return {
          status: 403,
          body: { error: 'Approval required but not granted' }
        };
      }
    }
    
    // Allow request
    return await this.forwardRequest(request);
  }
}
```

### Policy Enforcement Points

**Intercepting Agent Actions:**
```typescript
class PolicyEnforcementPoint {
  async intercept(action: AgentAction): Promise<AgentAction> {
    // Check policy before allowing action
    const allowed = await this.checkPolicy(action);
    
    if (!allowed) {
      // Log violation
      await this.logViolation(action);
      
      // Block action
      throw new PolicyViolationError('Action blocked by policy');
    }
    
    // Log allowed action
    await this.logAction(action);
    
    return action;
  }

  private async checkPolicy(action: AgentAction): Promise<boolean> {
    // Check against all policies
    for (const policy of this.policies) {
      const result = await policy.evaluate(action);
      if (result === 'deny') {
        return false;
      }
    }
    
    return true;
  }
}
```

---

## 6.2 AI Evaluations (Evals)

### What are Evals?

AI Evaluations (Evals) are statistical population tests that measure:
- Abstraction adherence (does AI follow specifications?)
- Logic drift (does AI behavior change over time?)
- Quality metrics (accuracy, completeness, correctness)

### Statistical Population Testing

**Example: Specification Adherence Eval**
```typescript
class SpecificationAdherenceEval {
  async runEval(specification: OpenSpec, implementations: Implementation[]) {
    const results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      adherenceRate: 0,
      issues: []
    };
    
    // Generate test cases from specification
    const testCases = await this.generateTestCases(specification);
    results.totalTests = testCases.length;
    
    // Test each implementation
    for (const implementation of implementations) {
      for (const testCase of testCases) {
        const result = await this.runTestCase(implementation, testCase);
        
        if (result.passed) {
          results.passed++;
        } else {
          results.failed++;
          results.issues.push({
            implementation: implementation.id,
            testCase: testCase.id,
            issue: result.issue
          });
        }
      }
    }
    
    // Calculate adherence rate
    results.adherenceRate = results.passed / results.totalTests;
    
    return results;
  }

  private async generateTestCases(specification: OpenSpec) {
    const testCases = [];
    
    // Generate from Given/When/Then scenarios
    for (const requirement of specification.requirements) {
      for (const scenario of requirement.scenarios) {
        testCases.push({
          id: `TC-${requirement.id}-${scenario.id}`,
          requirement: requirement.id,
          scenario: scenario.id,
          given: scenario.given,
          when: scenario.when,
          then: scenario.then
        });
      }
    }
    
    // Generate edge cases
    const edgeCases = await this.generateEdgeCases(specification);
    testCases.push(...edgeCases);
    
    return testCases;
  }
}
```

### Measuring Abstraction Adherence

**Abstraction Adherence Eval:**
```typescript
class AbstractionAdherenceEval {
  async measureAdherence(
    specification: Specification,
    agentOutputs: AgentOutput[]
  ): Promise<AdherenceMetrics> {
    const metrics = {
      exactMatch: 0,
      semanticMatch: 0,
      partialMatch: 0,
      noMatch: 0,
      adherenceScore: 0
    };
    
    for (const output of agentOutputs) {
      const adherence = await this.measureOutputAdherence(
        specification,
        output
      );
      
      switch (adherence.level) {
        case 'exact':
          metrics.exactMatch++;
          break;
        case 'semantic':
          metrics.semanticMatch++;
          break;
        case 'partial':
          metrics.partialMatch++;
          break;
        case 'none':
          metrics.noMatch++;
          break;
      }
    }
    
    // Calculate overall score
    const total = agentOutputs.length;
    metrics.adherenceScore = (
      metrics.exactMatch * 1.0 +
      metrics.semanticMatch * 0.8 +
      metrics.partialMatch * 0.5
    ) / total;
    
    return metrics;
  }

  private async measureOutputAdherence(
    spec: Specification,
    output: AgentOutput
  ): Promise<AdherenceLevel> {
    // Compare output to specification
    const comparison = await this.ai.compare({
      specification: spec,
      output: output,
      task: 'Measure how well the output adheres to the specification'
    });
    
    return comparison.adherenceLevel;
  }
}
```

### Detecting Logic Drift

**Logic Drift Detection:**
```typescript
class LogicDriftDetection {
  async detectDrift(
    baseline: AgentBehavior,
    current: AgentBehavior
  ): Promise<DriftReport> {
    const drift = {
      detected: false,
      severity: 'none',
      changes: [],
      recommendations: []
    };
    
    // Compare behaviors
    const comparison = await this.compareBehaviors(baseline, current);
    
    if (comparison.difference > 0.1) {
      drift.detected = true;
      drift.severity = this.calculateSeverity(comparison.difference);
      drift.changes = comparison.changes;
      
      // Generate recommendations
      drift.recommendations = await this.generateRecommendations(drift);
    }
    
    return drift;
  }

  private async compareBehaviors(
    baseline: AgentBehavior,
    current: AgentBehavior
  ): Promise<BehaviorComparison> {
    // Test both behaviors on same inputs
    const testInputs = await this.generateTestInputs();
    
    const baselineResults = [];
    const currentResults = [];
    
    for (const input of testInputs) {
      baselineResults.push(await baseline.execute(input));
      currentResults.push(await current.execute(input));
    }
    
    // Compare results
    const differences = baselineResults.map((baseline, i) => 
      this.compareResults(baseline, currentResults[i])
    );
    
    return {
      difference: this.calculateAverageDifference(differences),
      changes: this.identifyChanges(differences)
    };
  }
}
```

---

## 6.3 Invariant Verification

### What are Invariants?

Invariants are properties that must always be true in your system, regardless of state changes. They catch bugs that functional tests might miss.

**Example Invariants:**
- "Total account balance never goes negative"
- "User session count never exceeds max capacity"
- "Database connection pool always has available connections"
- "API response time never exceeds 1 second"

### Property-Based Testing

**Invariant Verification System:**
```typescript
class InvariantVerification {
  async verifyInvariants(
    invariants: Invariant[],
    system: System
  ): Promise<VerificationReport> {
    const report = {
      passed: [],
      failed: [],
      warnings: []
    };
    
    for (const invariant of invariants) {
      const result = await this.verifyInvariant(invariant, system);
      
      if (result.status === 'passed') {
        report.passed.push(invariant);
      } else if (result.status === 'failed') {
        report.failed.push({
          invariant,
          violation: result.violation
        });
      } else {
        report.warnings.push({
          invariant,
          warning: result.warning
        });
      }
    }
    
    return report;
  }

  private async verifyInvariant(
    invariant: Invariant,
    system: System
  ): Promise<VerificationResult> {
    // Generate test scenarios
    const scenarios = await this.generateScenarios(invariant);
    
    // Test invariant under various conditions
    for (const scenario of scenarios) {
      const state = await system.simulate(scenario);
      const holds = await this.checkInvariant(invariant, state);
      
      if (!holds) {
        return {
          status: 'failed',
          violation: {
            scenario,
            state,
            expected: invariant.property,
            actual: this.getActualValue(state, invariant)
          }
        };
      }
    }
    
    return { status: 'passed' };
  }
}
```

### Architectural Bug Detection

**Example: Concurrency Bug Detection**
```typescript
class ConcurrencyBugDetection {
  async detectConcurrencyIssues(code: Code): Promise<ConcurrencyReport> {
    const issues = [];
    
    // Check for race conditions
    const raceConditions = await this.detectRaceConditions(code);
    issues.push(...raceConditions);
    
    // Check for deadlocks
    const deadlocks = await this.detectDeadlocks(code);
    issues.push(...deadlocks);
    
    // Check for data races
    const dataRaces = await this.detectDataRaces(code);
    issues.push(...dataRaces);
    
    return {
      issues,
      severity: this.calculateSeverity(issues)
    };
  }

  private async detectRaceConditions(code: Code): Promise<Issue[]> {
    // Analyze code for shared resource access
    const sharedResources = await this.identifySharedResources(code);
    
    const raceConditions = [];
    
    for (const resource of sharedResources) {
      // Check if resource is accessed without proper locking
      const accesses = await this.findResourceAccesses(code, resource);
      
      if (accesses.length > 1 && !this.hasProperLocking(accesses)) {
        raceConditions.push({
          type: 'race_condition',
          resource: resource.name,
          locations: accesses.map(a => a.location),
          severity: 'high'
        });
      }
    }
    
    return raceConditions;
  }
}
```

### Invariant Examples

**Database Invariants:**
```typescript
const databaseInvariants = [
  {
    id: 'INV-001',
    name: 'Connection Pool Availability',
    property: 'availableConnections >= 0',
    description: 'Connection pool should never have negative available connections'
  },
  {
    id: 'INV-002',
    name: 'Transaction Consistency',
    property: 'allTransactionsAreCommittedOrRolledBack',
    description: 'All transactions must be either committed or rolled back'
  },
  {
    id: 'INV-003',
    name: 'Data Integrity',
    property: 'foreignKeyConstraintsAreMaintained',
    description: 'Foreign key constraints must always be maintained'
  }
];
```

**Application Invariants:**
```typescript
const applicationInvariants = [
  {
    id: 'INV-004',
    name: 'Account Balance',
    property: 'accountBalance >= 0',
    description: 'Account balance should never be negative'
  },
  {
    id: 'INV-005',
    name: 'Session Count',
    property: 'activeSessions <= maxSessions',
    description: 'Active sessions should never exceed maximum'
  },
  {
    id: 'INV-006',
    name: 'Response Time',
    property: 'apiResponseTime < 1000ms',
    description: 'API response time should never exceed 1 second'
  }
];
```

---

## 6.4 High-Assurance Practices

### Deterministic Safety on Non-Deterministic Outputs

**Challenge:** AI models are non-deterministic, but we need deterministic safety.

**Solution:** Multiple layers of verification and validation.

**Multi-Layer Verification:**
```typescript
class HighAssuranceSystem {
  async verifyWithLayers(output: AIOutput): Promise<VerificationResult> {
    // Layer 1: Policy check
    const policyCheck = await this.checkPolicy(output);
    if (!policyCheck.passed) {
      return { verified: false, reason: 'Policy violation' };
    }
    
    // Layer 2: Specification adherence
    const specCheck = await this.checkSpecification(output);
    if (!specCheck.passed) {
      return { verified: false, reason: 'Specification violation' };
    }
    
    // Layer 3: Invariant verification
    const invariantCheck = await this.checkInvariants(output);
    if (!invariantCheck.passed) {
      return { verified: false, reason: 'Invariant violation' };
    }
    
    // Layer 4: Statistical evaluation
    const evalCheck = await this.runEvaluation(output);
    if (evalCheck.score < 0.9) {
      return { verified: false, reason: 'Low evaluation score' };
    }
    
    return { verified: true };
  }
}
```

### Continuous Monitoring

**Monitoring System:**
```typescript
class GovernanceMonitoring {
  async monitorSystem() {
    while (true) {
      // Check policy violations
      const violations = await this.checkPolicyViolations();
      if (violations.length > 0) {
        await this.alertOnViolations(violations);
      }
      
      // Run evaluations
      const evalResults = await this.runPeriodicEvals();
      if (evalResults.showDrift) {
        await this.alertOnDrift(evalResults);
      }
      
      // Check invariants
      const invariantViolations = await this.checkInvariants();
      if (invariantViolations.length > 0) {
        await this.alertOnInvariantViolations(invariantViolations);
      }
      
      await this.sleep(60000); // Check every minute
    }
  }
}
```

---

## 6.5 Key Takeaways

**Network Sandboxing:**
- Policy engines (Cedar, Warden) intercept agent requests
- Prevent destructive actions
- Require approvals for sensitive operations
- Log all actions for audit

**AI Evaluations:**
- Statistical population tests
- Measure abstraction adherence
- Detect logic drift over time
- Quality metrics and benchmarks

**Invariant Verification:**
- Properties that must always be true
- Catch architectural bugs
- Detect concurrency issues
- Property-based testing

**High-Assurance Practices:**
- Multiple layers of verification
- Deterministic safety on non-deterministic outputs
- Continuous monitoring
- Automated alerting

---

## Lab 6: Implement Governance Framework

**Objective:** Build a complete governance framework with sandboxing, evals, and invariant verification

**Requirements:**
1. Implement network sandboxing:
   - Use Cedar or Warden policy engine
   - Define policies for destructive operations
   - Intercept and validate agent requests
   - Log all policy decisions
2. Create AI evaluation system:
   - Generate test cases from specifications
   - Measure abstraction adherence
   - Detect logic drift
   - Generate evaluation reports
3. Implement invariant verification:
   - Define system invariants
   - Create property-based tests
   - Detect architectural bugs
   - Verify invariants continuously
4. Build monitoring dashboard:
   - Policy violations
   - Evaluation results
   - Invariant violations
   - System health
5. Test with sample scenarios

**Deliverables:**
- Policy engine implementation
- Evaluation system code
- Invariant verification system
- Monitoring dashboard
- Test results
- Documentation (500 words)

**Evaluation Criteria:**
- Policy engine functionality (30%)
- Evaluation system quality (25%)
- Invariant verification (25%)
- Monitoring dashboard (15%)
- Documentation quality (5%)

**Time Estimate:** 4-5 hours

---

## Additional Resources

**Readings:**
- "Cedar Policy Language" - Official documentation
- "AI Safety and Governance" - Best practices
- "Property-Based Testing" - Technical guide

**Videos:**
- "Network Sandboxing with Policy Engines" (40 min)
- "AI Evaluations and Testing" (35 min)
- "Invariant Verification" (30 min)

**Tools:**
- [Cedar Policy Engine](https://www.cedar-policy.org/)
- Warden documentation
- Property-based testing frameworks
- Evaluation frameworks

**Next Module Preview:**
Module 7 will teach you about the evolving role of the human engineer, from developer to AI System Architect and Strategic Supervisor.

---

**Module 6 Complete** ✓  
**Next:** Module 7 - The Evolving Role of the Human Engineer
