---
title: "Module 5: Model Audits, Reviews & Approvals"
description: "Governing models across their lifecycle"
module: "5"
order: 5
email_takeaway: "Model governance requires systematic review, approval, and audit processes—not ad-hoc approvals or post-deployment fixes."
email_action: "Design a model approval workflow for one type of model in your organization. Define who reviews, what they review, and when."
---

# Module 5: Model Audits, Reviews & Approvals

**Duration:** Week 5  
**Theme:** *Governing models across their lifecycle*

**Learning Objectives:**
- Understand model documentation standards
- Design pre-deployment approval processes
- Learn periodic audit and re-certification procedures
- Master post-deployment compliance monitoring
- Handle third-party and vendor models

---

## 5.1 Model Documentation Standards

### Why Documentation Matters

**Purpose:**
- Enable review and approval
- Support audits and compliance
- Facilitate maintenance and updates
- Enable knowledge transfer
- Demonstrate due diligence

**Benefits:**
- Faster reviews
- Better decisions
- Compliance evidence
- Reduced risk
- Improved trust

### Documentation Components

#### 1. Model Overview

**Content:**
- Model name and version
- Purpose and use case
- Business context
- Stakeholders
- Timeline

**Details:**
- What problem does it solve?
- Who benefits from it?
- What are the success criteria?
- What are the constraints?

#### 2. Model Architecture

**Content:**
- Model type and algorithm
- Architecture details
- Input and output specifications
- Dependencies and requirements
- Technical specifications

**Details:**
- What type of model?
- What is the architecture?
- What are inputs and outputs?
- What are dependencies?
- What are technical requirements?

#### 3. Data Documentation

**Content:**
- Training data sources
- Data collection methods
- Data preprocessing steps
- Data quality assessments
- Data lineage

**Details:**
- Where did data come from?
- How was it collected?
- How was it processed?
- What is data quality?
- What is data lineage?

#### 4. Training Documentation

**Content:**
- Training methodology
- Hyperparameters
- Training process
- Validation approach
- Performance metrics

**Details:**
- How was model trained?
- What were hyperparameters?
- What was training process?
- How was it validated?
- What are performance metrics?

#### 5. Performance Documentation

**Content:**
- Performance metrics
- Evaluation results
- Benchmark comparisons
- Limitations and assumptions
- Failure modes

**Details:**
- What are performance metrics?
- What are evaluation results?
- How does it compare to benchmarks?
- What are limitations?
- What are failure modes?

#### 6. Fairness Documentation

**Content:**
- Protected attributes
- Fairness metrics
- Subgroup analysis
- Bias assessment
- Mitigation measures

**Details:**
- What protected attributes were analyzed?
- What are fairness metrics?
- How does it perform by subgroup?
- What bias was identified?
- What mitigation was applied?

#### 7. Privacy and Security Documentation

**Content:**
- Data protection measures
- Privacy impact assessment
- Security measures
- Access controls
- Compliance status

**Details:**
- What data protection measures?
- What is privacy impact?
- What are security measures?
- What are access controls?
- What is compliance status?

#### 8. Risk Documentation

**Content:**
- Risk assessment
- Identified risks
- Mitigation strategies
- Residual risks
- Risk owners

**Details:**
- What risks were identified?
- What is risk assessment?
- What are mitigation strategies?
- What are residual risks?
- Who owns risks?

#### 9. Deployment Documentation

**Content:**
- Deployment architecture
- Infrastructure requirements
- Monitoring setup
- Rollback procedures
- Incident response

**Details:**
- How is it deployed?
- What infrastructure is needed?
- How is it monitored?
- How to rollback?
- How to respond to incidents?

#### 10. Maintenance Documentation

**Content:**
- Maintenance schedule
- Update procedures
- Retraining requirements
- Deprecation plan
- Support contacts

**Details:**
- When is maintenance needed?
- How to update?
- When to retrain?
- How to deprecate?
- Who to contact?

### Documentation Standards

#### Minimum Documentation Requirements

**For All Models:**
- Model overview
- Architecture
- Performance metrics
- Risk assessment
- Deployment information

**For High-Risk Models:**
- All minimum requirements
- Detailed fairness assessment
- Comprehensive risk assessment
- Privacy impact assessment
- Security assessment

#### Documentation Quality Criteria

**Completeness:**
- All required sections present
- All questions answered
- No missing information
- References provided

**Accuracy:**
- Information is correct
- Metrics are accurate
- Claims are supported
- Evidence provided

**Clarity:**
- Clear language
- Well-organized
- Easy to understand
- Appropriate detail level

**Currency:**
- Up-to-date information
- Recent assessments
- Current status
- Regular updates

### Documentation Templates

**Standard Template:**
- Consistent structure
- Required sections
- Guidance and examples
- Quality checklist

**Customization:**
- Adapt to model type
- Adapt to risk level
- Adapt to organization
- Maintain consistency

---

## 5.2 Pre-Deployment Approval Processes

### Approval Framework

#### Approval Levels

**Level 1: Technical Review**
- Model performance
- Technical quality
- Code review
- Testing validation

**Level 2: Risk Review**
- Risk assessment
- Fairness assessment
- Privacy assessment
- Security assessment

**Level 3: Business Review**
- Business value
- Use case validation
- Stakeholder alignment
- Resource requirements

**Level 4: Governance Review**
- Compliance check
- Policy adherence
- Governance approval
- Final authorization

### Approval Process

#### 1. Submission

**Requirements:**
- Complete documentation
- All assessments done
- Stakeholder sign-offs
- Evidence provided

**Submission Package:**
- Model documentation
- Assessment reports
- Test results
- Stakeholder approvals
- Deployment plan

#### 2. Review

**Reviewers:**
- Technical experts
- Risk assessors
- Business stakeholders
- Governance team

**Review Criteria:**
- Documentation completeness
- Performance adequacy
- Risk acceptability
- Compliance status
- Business alignment

**Review Process:**
- Assign reviewers
- Review documentation
- Assess against criteria
- Identify issues
- Document findings

#### 3. Decision

**Decision Options:**
- Approve
- Approve with conditions
- Request changes
- Reject

**Decision Factors:**
- Review findings
- Risk assessment
- Business value
- Compliance status
- Resource availability

**Decision Documentation:**
- Decision rationale
- Conditions (if any)
- Next steps
- Timeline
- Owners

#### 4. Conditions and Follow-up

**Conditions:**
- Specific requirements
- Timeline
- Owners
- Verification

**Follow-up:**
- Track conditions
- Verify completion
- Update status
- Close out

### Approval Criteria

#### Performance Criteria

**Requirements:**
- Meets performance thresholds
- Validated on test data
- Benchmark comparisons
- Real-world validation

**Thresholds:**
- Minimum accuracy
- Maximum error rate
- Fairness requirements
- Latency requirements

#### Risk Criteria

**Requirements:**
- Risks identified and assessed
- Mitigations in place
- Residual risks acceptable
- Risk owners assigned

**Thresholds:**
- Maximum risk score
- Required mitigations
- Acceptable residual risk
- Risk tolerance

#### Compliance Criteria

**Requirements:**
- Legal compliance
- Regulatory compliance
- Policy compliance
- Standard compliance

**Checks:**
- GDPR/CCPA compliance
- Industry regulations
- Internal policies
- Industry standards

#### Business Criteria

**Requirements:**
- Business value demonstrated
- Use case validated
- Stakeholder alignment
- Resource availability

**Validation:**
- Business case
- Use case validation
- Stakeholder sign-offs
- Resource confirmation

### Approval Workflow

**Process:**
1. Submit for approval
2. Technical review
3. Risk review
4. Business review
5. Governance review
6. Decision
7. Conditions (if any)
8. Approval
9. Deployment authorization

**Timeline:**
- Standard: 2-4 weeks
- Expedited: 1 week (for low-risk)
- Extended: 6+ weeks (for high-risk)

**Escalation:**
- Review delays
- Disagreements
- High-risk decisions
- Executive decisions

---

## 5.3 Periodic Audits and Re-Certification

### Audit Framework

#### Audit Types

**1. Compliance Audits**

**Purpose:** Verify compliance with regulations and policies.

**Scope:**
- Legal compliance
- Regulatory compliance
- Policy compliance
- Standard compliance

**Frequency:**
- Annual for high-risk
- Bi-annual for medium-risk
- As needed for low-risk

**2. Performance Audits**

**Purpose:** Verify model performance and effectiveness.

**Scope:**
- Performance metrics
- Accuracy validation
- Real-world performance
- Business impact

**Frequency:**
- Quarterly for high-impact
- Semi-annually for medium-impact
- Annually for low-impact

**3. Fairness Audits**

**Purpose:** Verify fairness and identify bias.

**Scope:**
- Fairness metrics
- Subgroup performance
- Bias detection
- Mitigation effectiveness

**Frequency:**
- Quarterly for high-risk
- Semi-annually for medium-risk
- Annually for low-risk

**4. Security Audits**

**Purpose:** Verify security measures and identify vulnerabilities.

**Scope:**
- Security controls
- Access management
- Data protection
- Vulnerability assessment

**Frequency:**
- Quarterly for high-risk
- Semi-annually for medium-risk
- Annually for low-risk

**5. Comprehensive Audits**

**Purpose:** Comprehensive review of all aspects.

**Scope:**
- All audit types
- End-to-end review
- Holistic assessment

**Frequency:**
- Annually for high-risk
- Bi-annually for medium-risk
- As needed for low-risk

### Audit Process

#### 1. Planning

**Activities:**
- Define audit scope
- Identify audit team
- Schedule audit
- Prepare audit plan

**Deliverables:**
- Audit plan
- Scope definition
- Team assignment
- Schedule

#### 2. Execution

**Activities:**
- Review documentation
- Conduct assessments
- Interview stakeholders
- Test controls
- Gather evidence

**Deliverables:**
- Audit findings
- Evidence collection
- Assessment results
- Interview notes

#### 3. Reporting

**Activities:**
- Analyze findings
- Document issues
- Assess severity
- Recommend actions
- Prepare report

**Deliverables:**
- Audit report
- Findings documentation
- Recommendations
- Action items

#### 4. Follow-up

**Activities:**
- Track remediation
- Verify fixes
- Close findings
- Update status
- Report progress

**Deliverables:**
- Remediation tracking
- Verification results
- Status updates
- Progress reports

### Re-Certification

#### Re-Certification Triggers

**Scheduled:**
- Annual re-certification
- Periodic reviews
- Calendar-based

**Event-Based:**
- Significant changes
- Performance degradation
- Incident occurrence
- Regulatory changes
- Policy updates

#### Re-Certification Process

**1. Assessment**

**Activities:**
- Review current status
- Assess changes
- Evaluate performance
- Check compliance
- Identify issues

**2. Decision**

**Options:**
- Re-certify
- Re-certify with conditions
- Require updates
- Revoke certification

**3. Documentation**

**Content:**
- Assessment results
- Decision rationale
- Conditions (if any)
- Next steps
- Timeline

#### Re-Certification Criteria

**Performance:**
- Meets performance requirements
- No significant degradation
- Validated effectiveness

**Compliance:**
- Remains compliant
- No violations
- Policies followed

**Risk:**
- Risks managed
- No new high risks
- Mitigations effective

**Business:**
- Still provides value
- Use case valid
- Stakeholder support

---

## 5.4 Monitoring Compliance Post-Deployment

### Compliance Monitoring

#### What to Monitor

**1. Performance Monitoring**

**Metrics:**
- Accuracy
- Error rates
- Latency
- Throughput
- Business metrics

**Frequency:**
- Real-time for critical
- Daily for high-impact
- Weekly for standard
- Monthly for low-impact

**2. Fairness Monitoring**

**Metrics:**
- Fairness metrics
- Subgroup performance
- Bias indicators
- Disparate impact

**Frequency:**
- Real-time for high-risk
- Daily for medium-risk
- Weekly for low-risk

**3. Privacy Monitoring**

**Metrics:**
- Data access
- Consent status
- Rights requests
- Breach indicators

**Frequency:**
- Real-time for sensitive
- Daily for personal data
- Weekly for standard

**4. Security Monitoring**

**Metrics:**
- Access patterns
- Authentication failures
- Anomaly detection
- Threat indicators

**Frequency:**
- Real-time for critical
- Daily for high-risk
- Weekly for standard

**5. Compliance Monitoring**

**Metrics:**
- Policy adherence
- Regulatory compliance
- Audit findings
- Incident rates

**Frequency:**
- Continuous
- Daily reviews
- Weekly reports
- Monthly assessments

### Monitoring Dashboard

**Components:**
- Performance metrics
- Fairness metrics
- Privacy metrics
- Security metrics
- Compliance status
- Alerts and issues

**Visualizations:**
- Time series charts
- Distribution plots
- Comparison charts
- Status indicators
- Alert summaries

### Alerting and Escalation

#### Alert Thresholds

**Critical:**
- Performance degradation >20%
- Fairness violation
- Security breach
- Compliance violation

**High:**
- Performance degradation 10-20%
- Fairness concern
- Security anomaly
- Compliance gap

**Medium:**
- Performance degradation 5-10%
- Fairness trend
- Security warning
- Compliance issue

**Low:**
- Performance degradation <5%
- Fairness monitoring
- Security info
- Compliance note

#### Escalation Process

**Level 1: Automated Alert**
- System-generated alert
- Notification to team
- Initial investigation

**Level 2: Team Response**
- Team assessment
- Initial remediation
- Escalation if needed

**Level 3: Management Escalation**
- Management notification
- Resource allocation
- Strategic decisions

**Level 4: Executive Escalation**
- Executive notification
- Crisis management
- External communication

### Compliance Reporting

#### Reporting Frequency

**Real-time:**
- Critical alerts
- Security incidents
- Compliance violations

**Daily:**
- Performance summary
- Fairness status
- Security summary

**Weekly:**
- Comprehensive report
- Trend analysis
- Issue tracking

**Monthly:**
- Executive summary
- Compliance status
- Audit findings

#### Report Content

**Performance:**
- Metrics summary
- Trends and patterns
- Issues and actions
- Forecasts

**Fairness:**
- Fairness metrics
- Subgroup analysis
- Bias detection
- Mitigation status

**Privacy:**
- Data processing summary
- Rights requests
- Consent status
- Breach status

**Security:**
- Security events
- Access patterns
- Threat assessment
- Vulnerability status

**Compliance:**
- Compliance status
- Policy adherence
- Audit findings
- Remediation status

---

## 5.5 Handling Third-Party and Vendor Models

### Third-Party Model Risks

**Unique Risks:**
- Limited visibility into model internals
- Unknown training data
- Unclear fairness assessment
- Limited documentation
- Vendor dependency
- Update and maintenance control

**Challenges:**
- Less control over model
- Limited customization
- Vendor lock-in
- Compliance uncertainty
- Security concerns

### Vendor Assessment

#### 1. Vendor Evaluation

**Criteria:**
- Model performance
- Fairness assessment
- Documentation quality
- Security measures
- Compliance status
- Support and maintenance
- Cost and licensing

**Process:**
- Define requirements
- Evaluate vendors
- Compare options
- Select vendor
- Negotiate terms

#### 2. Due Diligence

**Activities:**
- Review vendor documentation
- Assess vendor capabilities
- Check vendor compliance
- Evaluate vendor security
- Review vendor references
- Legal and contract review

**Deliverables:**
- Vendor assessment report
- Risk assessment
- Recommendation
- Contract terms

#### 3. Contract Requirements

**Requirements:**
- Model documentation
- Fairness assessments
- Security measures
- Compliance guarantees
- Support and maintenance
- Update and upgrade terms
- Liability and indemnification
- Audit rights

**Contract Terms:**
- Service level agreements
- Performance guarantees
- Compliance requirements
- Security requirements
- Data protection terms
- Termination clauses

### Third-Party Model Governance

#### 1. Pre-Deployment Review

**Requirements:**
- Vendor assessment
- Model documentation review
- Fairness assessment
- Risk assessment
- Compliance check
- Security assessment

**Process:**
- Request documentation
- Review and assess
- Identify gaps
- Require remediation
- Approve or reject

#### 2. Documentation Requirements

**Required Documentation:**
- Model overview
- Architecture (to extent possible)
- Performance metrics
- Fairness assessment
- Training data information
- Security measures
- Compliance status

**Gap Management:**
- Identify missing documentation
- Request from vendor
- Accept or reject based on availability
- Document limitations

#### 3. Fairness Assessment

**Challenges:**
- Limited model visibility
- Unknown training data
- Vendor may not provide assessment

**Approach:**
- Request fairness assessment from vendor
- Conduct independent assessment if possible
- Test on own data
- Monitor post-deployment
- Require vendor to address issues

#### 4. Risk Assessment

**Process:**
- Assess vendor risks
- Assess model risks
- Assess integration risks
- Assess operational risks
- Document and mitigate

**Mitigation:**
- Vendor selection
- Contract terms
- Monitoring and oversight
- Exit strategy
- Backup plans

#### 5. Ongoing Monitoring

**Requirements:**
- Performance monitoring
- Fairness monitoring
- Security monitoring
- Compliance monitoring
- Vendor relationship management

**Process:**
- Monitor continuously
- Review regularly
- Escalate issues
- Require vendor response
- Update assessments

### Vendor Management

#### 1. Relationship Management

**Activities:**
- Regular communication
- Performance reviews
- Issue escalation
- Contract management
- Relationship building

**Frequency:**
- Weekly for critical vendors
- Monthly for standard vendors
- Quarterly for low-priority vendors

#### 2. Performance Management

**Metrics:**
- Model performance
- Service quality
- Support responsiveness
- Issue resolution
- Compliance status

**Management:**
- Track metrics
- Review performance
- Address issues
- Escalate problems
- Reward good performance

#### 3. Exit Strategy

**Planning:**
- Identify alternatives
- Plan migration
- Document dependencies
- Prepare transition
- Maintain flexibility

**Execution:**
- Execute exit if needed
- Migrate to alternative
- Minimize disruption
- Learn from experience

---

## Hands-On Exercise: Design a Model Approval and Audit Workflow

### Objective

Design a comprehensive model approval and audit workflow that can be applied to models in your organization.

### Instructions

1. **Define Workflow Scope:**
   - Identify model types
   - Define risk levels
   - Determine approval levels
   - Set timelines

2. **Design Approval Process:**
   - Define approval stages
   - Identify reviewers
   - Set approval criteria
   - Design decision process

3. **Design Audit Process:**
   - Define audit types
   - Set audit frequency
   - Identify auditors
   - Design audit process

4. **Design Documentation Requirements:**
   - Define required documentation
   - Create templates
   - Set quality standards
   - Design review process

5. **Design Monitoring:**
   - Define monitoring requirements
   - Set alert thresholds
   - Design escalation process
   - Create reporting structure

### Deliverable

A comprehensive model governance and audit framework that includes:
- Approval workflow
- Audit procedures
- Documentation standards
- Monitoring requirements
- Roles and responsibilities
- Templates and checklists

### Example Framework Structure

# Model Governance and Audit Framework

## Overview
[Purpose, scope, principles]

## Model Classification
[Model types, risk levels, approval requirements]

## Approval Workflow

### Stage 1: Technical Review
- Reviewers: [Roles]
- Criteria: [Criteria]
- Timeline: [Timeline]
- Decision: [Options]

[Repeat for each stage]

## Audit Framework

### Audit Types
- Compliance Audit: [Description, frequency, process]
- Performance Audit: [Description, frequency, process]
- Fairness Audit: [Description, frequency, process]
- [Other audit types]

### Audit Process
[Step-by-step process]

## Documentation Standards
[Required documentation, templates, quality criteria]

## Monitoring Requirements
[What to monitor, frequency, alerting, escalation]

## Roles and Responsibilities
[Who does what, RACI matrix]

## Templates and Checklists
[Links to templates and checklists]

---

## Key Takeaways

1. **Documentation is foundational:** Comprehensive documentation enables effective review, approval, and audit.

2. **Approval processes must be systematic:** Structured approval processes ensure consistent, thorough review and reduce risk.

3. **Audits are essential:** Regular audits verify compliance, performance, and fairness throughout model lifecycle.

4. **Monitoring is continuous:** Post-deployment monitoring detects issues early and enables rapid response.

5. **Third-party models require special attention:** Vendor models need additional assessment and ongoing oversight.

6. **Governance must be repeatable:** Standardized processes, templates, and workflows enable scalable governance.

---

## Additional Resources

- **Framework:** Model Risk Management (MRM) Framework
- **Standard:** ISO/IEC 23053:2022 (AI Framework)
- **Guide:** Model Documentation Best Practices
- **Tool:** Model Governance Platforms
- **Research:** Model Audit and Review Methodologies

---

## Next Module Preview

In Module 6, we'll explore Organizational Governance Models—learning how to design governance structures that scale with your organization and balance innovation with control.
