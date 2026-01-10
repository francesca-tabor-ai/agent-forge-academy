---
title: "Module 5: Agentic DevOps & Operations"
description: "Deploy tireless teammates that handle operational tasks autonomously"
module: "5"
order: 5
---

# Module 5: Agentic DevOps & Operations

**Duration:** Week 5  
**Learning Objectives:**
- Deploy SRE agents for autonomous operations
- Integrate AI into CI/CD pipelines for semantic code review
- Automate application modernization using 12-factor principles
- Implement autonomous bug detection and system recovery
- Build self-healing infrastructure systems

---

## 5.1 SRE Agents: Autonomous Operations

### What are SRE Agents?

SRE (Site Reliability Engineering) Agents are autonomous AI agents that handle operational tasks traditionally performed by human engineers. They act as "tireless teammates" that work 24/7 to maintain system health.

**Traditional SRE Tasks:**
- Monitoring system health
- Detecting anomalies
- Performing root-cause analysis
- Triggering auto-scaling
- Handling incidents
- Capacity planning

**SRE Agent Capabilities:**
- Continuous monitoring
- Autonomous detection
- Automated remediation
- Predictive analysis
- Self-healing systems

### Autonomous Detection

**Example: Misconfiguration Detection Agent**
```typescript
class MisconfigurationDetectionAgent {
  async monitorConfiguration() {
    while (true) {
      // Check for misconfigurations
      const issues = await this.detectMisconfigurations();
      
      for (const issue of issues) {
        await this.handleMisconfiguration(issue);
      }
      
      await this.sleep(60000); // Check every minute
    }
  }

  private async detectMisconfigurations() {
    const issues = [];
    
    // Check database connections
    const dbConfig = await this.getDatabaseConfig();
    if (dbConfig.maxConnections > 100) {
      issues.push({
        type: 'database_config',
        severity: 'high',
        message: 'Database max connections too high, may cause resource exhaustion',
        recommendation: 'Reduce to 50'
      });
    }
    
    // Check security settings
    const securityConfig = await this.getSecurityConfig();
    if (!securityConfig.httpsOnly) {
      issues.push({
        type: 'security_config',
        severity: 'critical',
        message: 'HTTPS not enforced',
        recommendation: 'Enable HTTPS-only mode'
      });
    }
    
    // Check resource limits
    const resourceLimits = await this.getResourceLimits();
    if (resourceLimits.memory < 512) {
      issues.push({
        type: 'resource_config',
        severity: 'medium',
        message: 'Memory limit too low for workload',
        recommendation: 'Increase to at least 1GB'
      });
    }
    
    return issues;
  }

  private async handleMisconfiguration(issue: MisconfigurationIssue) {
    console.log(`[SRE Agent] Detected: ${issue.message}`);
    
    // Auto-fix if safe
    if (issue.severity === 'low' && this.isSafeToAutoFix(issue)) {
      await this.autoFix(issue);
      console.log(`[SRE Agent] Auto-fixed: ${issue.type}`);
    } else {
      // Alert human team
      await this.alertTeam(issue);
      console.log(`[SRE Agent] Alerted team about: ${issue.type}`);
    }
  }
}
```

### Root-Cause Analysis

**Autonomous RCA Agent:**
```typescript
class RootCauseAnalysisAgent {
  async analyzeIncident(incident: Incident) {
    // Gather data
    const logs = await this.getLogs(incident.timeRange);
    const metrics = await this.getMetrics(incident.timeRange);
    const events = await this.getEvents(incident.timeRange);
    
    // Analyze with AI
    const analysis = await this.ai.analyze({
      prompt: `
Analyze this incident and identify root cause:

Incident: ${incident.description}
Time: ${incident.startTime} to ${incident.endTime}

Logs:
${logs.slice(0, 100).join('\n')}

Metrics:
${JSON.stringify(metrics, null, 2)}

Events:
${JSON.stringify(events, null, 2)}

Identify:
1. Root cause
2. Contributing factors
3. Timeline of events
4. Recommended fixes
5. Prevention strategies
`
    });
    
    // Generate report
    const report = {
      incident: incident.id,
      rootCause: analysis.rootCause,
      contributingFactors: analysis.contributingFactors,
      timeline: analysis.timeline,
      recommendations: analysis.recommendations,
      prevention: analysis.prevention
    };
    
    // Store for learning
    await this.storeAnalysis(report);
    
    return report;
  }

  async learnFromIncidents() {
    // Analyze historical incidents
    const incidents = await this.getHistoricalIncidents();
    
    // Identify patterns
    const patterns = await this.identifyPatterns(incidents);
    
    // Update detection rules
    await this.updateDetectionRules(patterns);
    
    // Improve prevention
    await this.improvePrevention(patterns);
  }
}
```

### Auto-Scaling Triggers

**Intelligent Auto-Scaling Agent:**
```typescript
class AutoScalingAgent {
  async monitorAndScale() {
    while (true) {
      const metrics = await this.getCurrentMetrics();
      const predictions = await this.predictLoad();
      
      // Decide on scaling action
      const action = await this.decideScalingAction(metrics, predictions);
      
      if (action.type !== 'no_action') {
        await this.executeScaling(action);
      }
      
      await this.sleep(30000); // Check every 30 seconds
    }
  }

  private async decideScalingAction(
    metrics: Metrics,
    predictions: LoadPredictions
  ): Promise<ScalingAction> {
    // Current load analysis
    const cpuUsage = metrics.cpu;
    const memoryUsage = metrics.memory;
    const requestRate = metrics.requestsPerSecond;
    
    // Predictive analysis
    const predictedLoad = predictions.next5Minutes;
    
    // Decision logic
    if (cpuUsage > 80 || memoryUsage > 85) {
      // Scale up immediately
      return {
        type: 'scale_up',
        reason: 'High resource usage',
        targetInstances: this.calculateTargetInstances(metrics, 'up')
      };
    }
    
    if (predictedLoad > metrics.currentCapacity * 1.5) {
      // Proactive scale up
      return {
        type: 'scale_up',
        reason: 'Predicted load increase',
        targetInstances: this.calculateTargetInstances(predictions, 'up')
      };
    }
    
    if (cpuUsage < 30 && memoryUsage < 40 && requestRate < 10) {
      // Scale down if sustained
      const sustained = await this.checkSustainedLowLoad(300); // 5 minutes
      if (sustained) {
        return {
          type: 'scale_down',
          reason: 'Sustained low load',
          targetInstances: this.calculateTargetInstances(metrics, 'down')
        };
      }
    }
    
    return { type: 'no_action' };
  }

  private async executeScaling(action: ScalingAction) {
    console.log(`[Auto-Scaling Agent] ${action.type}: ${action.reason}`);
    
    if (action.type === 'scale_up') {
      await this.scaleUp(action.targetInstances);
    } else if (action.type === 'scale_down') {
      await this.scaleDown(action.targetInstances);
    }
    
    // Verify scaling
    await this.verifyScaling(action);
  }
}
```

---

## 5.2 AI-Enhanced CI/CD

### Semantic Code Review

Traditional CI/CD pipelines run automated tests, but AI-enhanced pipelines can perform semantic analysis of code changes.

**AI Code Review Agent:**
```typescript
class AICodeReviewAgent {
  async reviewPullRequest(pr: PullRequest) {
    const changes = await this.getChanges(pr);
    
    const review = {
      overall: 'pending',
      comments: [],
      suggestions: [],
      securityIssues: [],
      performanceIssues: []
    };
    
    // Semantic analysis
    for (const file of changes.files) {
      const fileReview = await this.reviewFile(file);
      review.comments.push(...fileReview.comments);
      review.suggestions.push(...fileReview.suggestions);
    }
    
    // Security analysis
    review.securityIssues = await this.analyzeSecurity(changes);
    
    // Performance analysis
    review.performanceIssues = await this.analyzePerformance(changes);
    
    // Architecture analysis
    const architectureReview = await this.analyzeArchitecture(changes);
    review.comments.push(...architectureReview.comments);
    
    // Determine overall status
    review.overall = this.determineStatus(review);
    
    return review;
  }

  private async reviewFile(file: FileChange) {
    const analysis = await this.ai.analyze({
      prompt: `
Review this code change for:
1. Code quality and best practices
2. Potential bugs
3. Maintainability
4. Test coverage
5. Documentation

Code:
${file.diff}

Provide specific, actionable feedback.
`
    });
    
    return {
      comments: analysis.issues.map(issue => ({
        line: issue.line,
        type: issue.type,
        message: issue.message,
        suggestion: issue.suggestion
      })),
      suggestions: analysis.improvements
    };
  }

  private async analyzeSecurity(changes: FileChange[]) {
    const securityAnalysis = await this.ai.analyze({
      prompt: `
Analyze these code changes for security vulnerabilities:

${changes.map(c => c.diff).join('\n\n')}

Look for:
- SQL injection risks
- XSS vulnerabilities
- Authentication/authorization issues
- Sensitive data exposure
- Insecure dependencies
`
    });
    
    return securityAnalysis.vulnerabilities;
  }
}
```

### Risk Analysis

**Risk Assessment Agent:**
```typescript
class RiskAnalysisAgent {
  async assessRisk(change: CodeChange): Promise<RiskAssessment> {
    const factors = await this.analyzeRiskFactors(change);
    
    const riskScore = this.calculateRiskScore(factors);
    
    const assessment = {
      overallRisk: riskScore,
      factors,
      recommendations: [],
      requiresApproval: riskScore > 0.7
    };
    
    // Generate recommendations
    if (factors.affectsAuthentication) {
      assessment.recommendations.push({
        type: 'security_review',
        priority: 'high',
        message: 'Changes affect authentication - requires security review'
      });
    }
    
    if (factors.affectsDatabase) {
      assessment.recommendations.push({
        type: 'database_review',
        priority: 'medium',
        message: 'Database changes detected - verify migrations'
      });
    }
    
    if (factors.largeChange) {
      assessment.recommendations.push({
        type: 'staged_rollout',
        priority: 'medium',
        message: 'Large change - consider staged rollout'
      });
    }
    
    return assessment;
  }

  private async analyzeRiskFactors(change: CodeChange) {
    return {
      linesChanged: change.linesChanged,
      filesAffected: change.filesAffected,
      affectsAuthentication: await this.affectsAuthentication(change),
      affectsDatabase: await this.affectsDatabase(change),
      affectsPayment: await this.affectsPayment(change),
      testCoverage: await this.getTestCoverage(change),
      breakingChanges: await this.detectBreakingChanges(change),
      dependenciesChanged: await this.dependenciesChanged(change)
    };
  }
}
```

### CI/CD Integration

**GitHub Actions Example:**
```yaml
name: AI-Enhanced CI/CD

on:
  pull_request:
    branches: [main]

jobs:
  ai-code-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: AI Code Review
        uses: ai-code-review-action@v1
        with:
          api-key: ${{ secrets.AI_API_KEY }}
          model: gpt-4
          review-type: semantic
      
      - name: Security Analysis
        uses: ai-security-analysis@v1
        with:
          api-key: ${{ secrets.AI_API_KEY }}
      
      - name: Risk Assessment
        uses: ai-risk-assessment@v1
        with:
          api-key: ${{ secrets.AI_API_KEY }}
          approval-threshold: 0.7
      
      - name: Post Review Comments
        uses: github-comment-action@v1
        with:
          comments: ${{ steps.ai-code-review.outputs.comments }}
```

---

## 5.3 Application Modernization

### Automated Refactoring

**Legacy Code Modernization Agent:**
```typescript
class ModernizationAgent {
  async modernizeApplication(codebase: Codebase) {
    // Analyze codebase
    const analysis = await this.analyzeCodebase(codebase);
    
    // Create modernization plan
    const plan = await this.createModernizationPlan(analysis);
    
    // Execute modernization
    const results = [];
    for (const task of plan.tasks) {
      const result = await this.executeModernizationTask(task);
      results.push(result);
    }
    
    // Verify modernization
    const verification = await this.verifyModernization(results);
    
    return {
      plan,
      results,
      verification
    };
  }

  private async createModernizationPlan(analysis: CodebaseAnalysis) {
    const tasks = [];
    
    // Convert to 12-factor principles
    if (!analysis.follows12Factor) {
      tasks.push({
        type: 'refactor_to_12_factor',
        description: 'Refactor to follow 12-factor app principles',
        steps: [
          'Extract configuration to environment variables',
          'Separate build and run stages',
          'Implement stateless processes',
          'Add proper logging',
          'Implement graceful shutdown'
        ]
      });
    }
    
    // Modernize dependencies
    if (analysis.hasOutdatedDependencies) {
      tasks.push({
        type: 'update_dependencies',
        description: 'Update to latest stable versions',
        dependencies: analysis.outdatedDependencies
      });
    }
    
    // Refactor architecture
    if (analysis.hasMonolithicStructure) {
      tasks.push({
        type: 'refactor_to_microservices',
        description: 'Break down monolith into microservices',
        services: this.identifyServiceBoundaries(analysis)
      });
    }
    
    // Improve test coverage
    if (analysis.testCoverage < 80) {
      tasks.push({
        type: 'improve_test_coverage',
        description: 'Increase test coverage to 80%',
        targetCoverage: 80
      });
    }
    
    return { tasks };
  }

  private async executeModernizationTask(task: ModernizationTask) {
    switch (task.type) {
      case 'refactor_to_12_factor':
        return await this.refactorTo12Factor(task);
      
      case 'update_dependencies':
        return await this.updateDependencies(task);
      
      case 'refactor_to_microservices':
        return await this.refactorToMicroservices(task);
      
      case 'improve_test_coverage':
        return await this.improveTestCoverage(task);
    }
  }

  private async refactorTo12Factor(task: ModernizationTask) {
    const refactorings = [];
    
    // Extract configuration
    const configRefactoring = await this.extractConfiguration();
    refactorings.push(configRefactoring);
    
    // Separate build/run
    const buildRefactoring = await this.separateBuildAndRun();
    refactorings.push(buildRefactoring);
    
    // Implement stateless processes
    const statelessRefactoring = await this.makeStateless();
    refactorings.push(statelessRefactoring);
    
    // Add logging
    const loggingRefactoring = await this.addStructuredLogging();
    refactorings.push(loggingRefactoring);
    
    return {
      task: task.type,
      refactorings,
      status: 'completed'
    };
  }
}
```

### 12-Factor Principles

**Automated 12-Factor Compliance:**
```typescript
class TwelveFactorAgent {
  async ensureCompliance(codebase: Codebase) {
    const compliance = {
      I_Codebase: await this.checkCodebase(codebase),
      II_Dependencies: await this.checkDependencies(codebase),
      III_Config: await this.checkConfig(codebase),
      IV_BackingServices: await this.checkBackingServices(codebase),
      V_BuildReleaseRun: await this.checkBuildReleaseRun(codebase),
      VI_Processes: await this.checkProcesses(codebase),
      VII_PortBinding: await this.checkPortBinding(codebase),
      VIII_Concurrency: await this.checkConcurrency(codebase),
      IX_Disposability: await this.checkDisposability(codebase),
      X_DevProdParity: await this.checkDevProdParity(codebase),
      XI_Logs: await this.checkLogs(codebase),
      XII_AdminProcesses: await this.checkAdminProcesses(codebase)
    };
    
    const violations = Object.entries(compliance)
      .filter(([_, compliant]) => !compliant)
      .map(([factor, _]) => factor);
    
    if (violations.length > 0) {
      await this.fixViolations(violations, codebase);
    }
    
    return compliance;
  }

  private async checkConfig(codebase: Codebase) {
    // Check if configuration is in environment variables
    const hasHardcodedConfig = await this.detectHardcodedConfig(codebase);
    return !hasHardcodedConfig;
  }

  private async checkLogs(codebase: Codebase) {
    // Check if logs are written to stdout/stderr
    const logAnalysis = await this.analyzeLogging(codebase);
    return logAnalysis.writesToStdout;
  }
}
```

---

## 5.4 Self-Healing Systems

### Autonomous Recovery

**Self-Healing Agent:**
```typescript
class SelfHealingAgent {
  async monitorAndHeal() {
    while (true) {
      const health = await this.checkSystemHealth();
      
      if (health.status !== 'healthy') {
        await this.attemptHealing(health);
      }
      
      await this.sleep(10000); // Check every 10 seconds
    }
  }

  private async attemptHealing(health: SystemHealth) {
    console.log(`[Self-Healing Agent] Detected issue: ${health.issue}`);
    
    // Try automated fixes
    const fixes = await this.identifyFixes(health);
    
    for (const fix of fixes) {
      try {
        await this.applyFix(fix);
        
        // Verify fix worked
        const verification = await this.verifyFix(fix);
        if (verification.success) {
          console.log(`[Self-Healing Agent] Fixed: ${fix.type}`);
          return;
        }
      } catch (error) {
        console.error(`[Self-Healing Agent] Fix failed: ${fix.type}`, error);
      }
    }
    
    // If all fixes fail, escalate
    await this.escalateToHuman(health);
  }

  private async identifyFixes(health: SystemHealth) {
    const fixes = [];
    
    if (health.issue === 'service_down') {
      fixes.push({
        type: 'restart_service',
        service: health.affectedService,
        priority: 1
      });
    }
    
    if (health.issue === 'high_memory') {
      fixes.push({
        type: 'restart_service',
        service: health.affectedService,
        priority: 2
      });
      fixes.push({
        type: 'scale_up',
        service: health.affectedService,
        priority: 3
      });
    }
    
    if (health.issue === 'database_connection_pool_exhausted') {
      fixes.push({
        type: 'restart_database_connections',
        priority: 1
      });
      fixes.push({
        type: 'increase_connection_pool',
        priority: 2
      });
    }
    
    return fixes.sort((a, b) => a.priority - b.priority);
  }
}
```

---

## 5.5 Key Takeaways

**SRE Agents:**
- Autonomous detection of misconfigurations
- Root-cause analysis for incidents
- Intelligent auto-scaling based on predictions
- 24/7 monitoring and response

**AI-Enhanced CI/CD:**
- Semantic code review in pipelines
- Risk analysis before deployment
- Automated security scanning
- Quality gates with AI insights

**Application Modernization:**
- Automated refactoring to 12-factor principles
- Legacy code modernization
- Dependency updates
- Architecture improvements

**Self-Healing Systems:**
- Autonomous recovery from failures
- Automated fix attempts
- Escalation to humans when needed
- Continuous health monitoring

---

## Lab 5: Deploy Agentic DevOps Automation

**Objective:** Build a complete agentic DevOps system with SRE agents and AI-enhanced CI/CD

**Requirements:**
1. Create an SRE agent that:
   - Monitors system health
   - Detects misconfigurations
   - Performs root-cause analysis
   - Triggers auto-scaling
2. Integrate AI code review into CI/CD:
   - Semantic code analysis
   - Security vulnerability detection
   - Risk assessment
   - Automated comments on PRs
3. Implement a modernization agent:
   - Analyzes codebase for 12-factor compliance
   - Suggests refactoring opportunities
   - Automates simple refactorings
4. Add self-healing capabilities:
   - Detect common failures
   - Attempt automated recovery
   - Escalate when needed
5. Create monitoring dashboard
6. Test with sample scenarios

**Deliverables:**
- SRE agent implementation
- AI-enhanced CI/CD pipeline
- Modernization agent code
- Self-healing system
- Monitoring dashboard
- Test results and documentation (500 words)

**Evaluation Criteria:**
- SRE agent functionality (25%)
- CI/CD integration quality (25%)
- Modernization capabilities (20%)
- Self-healing implementation (20%)
- Documentation quality (10%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Site Reliability Engineering" - Google SRE Book
- "AI-Enhanced DevOps" - Best practices
- "12-Factor App Methodology" - Official guide

**Videos:**
- "Building SRE Agents" (45 min)
- "AI in CI/CD Pipelines" (40 min)
- "Application Modernization" (35 min)

**Tools:**
- Kubernetes for orchestration
- Prometheus for monitoring
- GitHub Actions / GitLab CI
- AI code review tools

**Next Module Preview:**
Module 6 will teach you how to enforce governance, security, and high-assurance practices on AI-driven development systems.

---

**Module 5 Complete**   
**Next:** Module 6 - Governance, Security & High-Assurance
