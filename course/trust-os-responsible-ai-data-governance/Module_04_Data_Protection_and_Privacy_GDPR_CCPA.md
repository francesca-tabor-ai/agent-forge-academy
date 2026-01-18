---
title: "Module 4: Data Protection & Privacy (GDPR / CCPA)"
description: "Compliance as an engineering requirement"
module: "4"
order: 4
email_takeaway: "Data protection regulations like GDPR and CCPA aren't just legal requirements—they're engineering requirements that must be built into systems from the start."
email_action: "Map personal data flows for one system in your organization. Identify where compliance gaps exist."
---

# Module 4: Data Protection & Privacy (GDPR / CCPA)

**Duration:** Week 4  
**Theme:** *Compliance as an engineering requirement*

**Learning Objectives:**
- **core principles of GDPR and CCPA Understanding**: Understand core principles of GDPR and CCPA
- **lawful basis for data processing Understanding**: Learn lawful basis for data processing
- **consent, purpose limitation, and data minimization Understanding**: Master consent, purpose limitation, and data minimization
- **Operationalize Data**: Operationalize data subject rights
- **privacy-by-design and privacy-by-default Implementation**: Implement privacy-by-design and privacy-by-default

---

## 4.1 Core Principles of GDPR and CCPA

### GDPR Overview

**Full Name:** General Data Protection Regulation

**Scope:**
- Applies to processing of personal data of EU residents
- Applies regardless of where organization is located
- Extraterritorial application
- Applies to both controllers and processors

**Key Dates:**
- Enacted: May 25, 2018
- Enforcement: Ongoing
- Fines: Up to €20M or 4% of global annual revenue (whichever is higher)

### CCPA Overview

**Full Name:** California Consumer Privacy Act

**Scope:**
- Applies to businesses that meet certain thresholds
- Applies to personal information of California residents
- Broader definition of personal information than GDPR
- Applies to for-profit businesses

**Key Dates:**
- Enacted: January 1, 2020
- Enforcement: Ongoing
- Fines: $2,500-$7,500 per violation
- Private right of action for data breaches

### Core Principles

#### 1. Lawfulness, Fairness, and Transparency

**GDPR Article 5(1)(a):**
- Processing must be lawful
- Processing must be fair
- Processing must be transparent

**CCPA:**
- Transparency about data collection and use
- Clear privacy notices
- No deceptive practices

**Implementation:**
- Identify lawful basis for processing
- Provide clear privacy notices
- Be transparent about data use
- Avoid deceptive practices

#### 2. Purpose Limitation

**GDPR Article 5(1)(b):**
- Data collected for specified, explicit, legitimate purposes
- Not processed in manner incompatible with those purposes

**CCPA:**
- Disclose purposes of collection
- Limit use to disclosed purposes
- Obtain consent for new purposes

**Implementation:**
- Define clear purposes for data collection
- Limit processing to those purposes
- Obtain consent for new purposes
- Document purposes clearly

#### 3. Data Minimization

**GDPR Article 5(1)(c):**
- Data must be adequate, relevant, and limited to what is necessary

**CCPA:**
- Collect only necessary information
- Limit retention to necessary period

**Implementation:**
- Collect only what is needed
- Regularly review data collection
- Delete unnecessary data
- Minimize data processing

#### 4. Accuracy

**GDPR Article 5(1)(d):**
- Data must be accurate and kept up to date
- Inaccurate data must be erased or rectified

**CCPA:**
- Provide mechanisms to correct data
- Maintain data accuracy

**Implementation:**
- Validate data accuracy
- Update data regularly
- Provide correction mechanisms
- Delete inaccurate data

#### 5. Storage Limitation

**GDPR Article 5(1)(e):**
- Data kept in identifiable form only as long as necessary

**CCPA:**
- Limit retention periods
- Delete data when no longer needed

**Implementation:**
- Define retention periods
- Automate data deletion
- Regular data purging
- Document retention policies

#### 6. Integrity and Confidentiality

**GDPR Article 5(1)(f):**
- Data must be processed securely
- Protection against unauthorized access, loss, or destruction

**CCPA:**
- Implement reasonable security measures
- Protect against breaches

**Implementation:**
- Encryption at rest and in transit
- Access controls
- Security monitoring
- Incident response

#### 7. Accountability

**GDPR Article 5(2):**
- Controller responsible for demonstrating compliance

**CCPA:**
- Maintain records of data processing
- Respond to consumer requests

**Implementation:**
- Document processing activities
- Maintain compliance records
- Conduct regular audits
- Demonstrate compliance

---

## 4.2 Lawful Basis for Data Processing

### GDPR Lawful Bases

**Article 6(1) GDPR:** Processing is lawful only if it has a lawful basis.

#### 1. Consent

**Definition:** Freely given, specific, informed, and unambiguous agreement.

**Requirements:**
- Must be opt-in (not pre-checked)
- Must be specific to purpose
- Must be informed (clear what consent is for)
- Must be unambiguous (clear affirmative action)
- Must be easy to withdraw

**When to Use:**
- No other lawful basis available
- Marketing communications
- Sensitive data processing (with additional consent)
- Cookies and tracking

**Implementation:**
- Clear consent mechanisms
- Granular consent options
- Easy withdrawal process
- Record consent and withdrawals
- Regular consent refresh

#### 2. Contract

**Definition:** Processing necessary for performance of contract.

**Requirements:**
- Processing must be necessary
- Must be for contract performance
- Must be reasonable and expected

**When to Use:**
- Processing necessary for service delivery
- Payment processing
- Order fulfillment
- Account management

**Implementation:**
- Document contract necessity
- Limit to necessary processing
- Review regularly
- Update contracts as needed

#### 3. Legal Obligation

**Definition:** Processing necessary for compliance with legal obligation.

**Requirements:**
- Legal obligation must exist
- Processing must be necessary
- Must be EU or member state law

**When to Use:**
- Tax reporting
- Regulatory compliance
- Legal requirements
- Court orders

**Implementation:**
- Identify legal obligations
- Document legal basis
- Limit to necessary processing
- Regular review

#### 4. Vital Interests

**Definition:** Processing necessary to protect vital interests of data subject or another person.

**Requirements:**
- Must be life-threatening situation
- Must be necessary
- Must be in best interests

**When to Use:**
- Medical emergencies
- Life-threatening situations
- Emergency services

**Implementation:**
- Rarely used
- Document carefully
- Limit to emergency situations
- Review after emergency

#### 5. Public Task

**Definition:** Processing necessary for performance of task in public interest or exercise of official authority.

**Requirements:**
- Must be public authority
- Must be public interest task
- Must be necessary

**When to Use:**
- Government functions
- Public services
- Regulatory functions

**Implementation:**
- Typically for public authorities
- Document public interest
- Limit to necessary processing

#### 6. Legitimate Interests

**Definition:** Processing necessary for legitimate interests, unless overridden by data subject interests.

**Requirements:**
- Must have legitimate interest
- Must be necessary
- Must balance with data subject interests
- Must not override fundamental rights

**When to Use:**
- Business operations
- Fraud prevention
- Network security
- Direct marketing (with opt-out)

**Implementation:**
- Conduct legitimate interest assessment
- Document balancing test
- Provide opt-out mechanisms
- Regular review

### CCPA Requirements

**CCPA does not require lawful basis like GDPR, but:**
- Requires disclosure of data collection
- Requires opt-out for sale of personal information
- Requires consent for certain sensitive data
- Requires honoring consumer rights

**Key Differences:**
- CCPA focuses on consumer rights
- GDPR focuses on lawful processing
- CCPA has opt-out model
- GDPR has opt-in model (for consent)

### Choosing Lawful Basis

**Decision Framework:**
1. Identify processing purpose
2. Review available lawful bases
3. Assess which basis applies
4. Document basis and rationale
5. Implement accordingly
6. Review regularly

**Best Practices:**
- Document lawful basis clearly
- Review regularly
- Update as needed
- Train staff
- Maintain records

---

## 4.3 Consent, Purpose Limitation, and Data Minimization

### Consent Management

#### Consent Requirements

**GDPR Requirements:**
- Freely given
- Specific
- Informed
- Unambiguous
- Easy to withdraw

**CCPA Requirements:**
- Clear disclosure
- Opt-out for sale
- Consent for sensitive data
- No discrimination for exercising rights

#### Consent Implementation

**1. Consent Mechanisms**

**Design:**
- Clear and prominent
- Not pre-checked
- Specific to purpose
- Granular options
- Easy to understand

**Examples:**
- Checkboxes (not pre-checked)
- Toggle switches
- Button clicks
- Separate consent for each purpose

**2. Consent Information**

**Content:**
- What data is collected
- Why it's collected
- How it's used
- Who it's shared with
- How long it's kept
- Rights available

**Format:**
- Clear language
- Layered approach
- Visual aids
- Accessible format

**3. Consent Records**

**What to Record:**
- When consent given
- What consent covers
- How consent obtained
- Consent version
- Withdrawal records

**Storage:**
- Secure storage
- Audit trail
- Version control
- Retention management

**4. Consent Withdrawal**

**Process:**
- Easy withdrawal mechanism
- Immediate effect
- Clear confirmation
- No negative consequences
- Record withdrawal

**Implementation:**
- Withdrawal button/link
- Confirmation message
- Immediate processing
- No discrimination
- Update records

### Purpose Limitation

#### Defining Purposes

**Requirements:**
- Specific and explicit
- Legitimate
- Documented
- Communicated

**Examples:**
- "Process payment for order"
- "Send marketing emails"
- "Improve product recommendations"
- "Prevent fraud"

**Best Practices:**
- Be specific
- Avoid vague purposes
- Document clearly
- Review regularly

#### Limiting Processing

**Requirements:**
- Process only for specified purposes
- Not incompatible with original purposes
- Obtain consent for new purposes

**Implementation:**
- Purpose-based access controls
- Purpose-based processing limits
- Regular purpose review
- New purpose approval process

**Challenges:**
- Balancing flexibility with compliance
- Managing multiple purposes
- Handling purpose changes
- Legacy systems

### Data Minimization

#### Collection Minimization

**Principles:**
- Collect only what is necessary
- Review collection regularly
- Remove unnecessary collection
- Justify all collection

**Implementation:**
- Data collection inventory
- Necessity assessment
- Regular review
- Removal of unnecessary fields

#### Processing Minimization

**Principles:**
- Process only necessary data
- Limit processing scope
- Use pseudonymization/anonymization
- Aggregate when possible

**Implementation:**
- Processing inventory
- Scope limitations
- Pseudonymization
- Aggregation strategies

#### Retention Minimization

**Principles:**
- Retain only as long as necessary
- Define retention periods
- Automate deletion
- Regular purging

**Implementation:**
- Retention policies
- Automated deletion
- Regular purging
- Exception handling

---

## 4.4 Data Subject Rights and Operationalization

### GDPR Data Subject Rights

#### 1. Right of Access (Article 15)

**Definition:** Right to obtain confirmation of processing and access to personal data.

**Requirements:**
- Confirm whether data is processed
- Provide access to data
- Provide processing information
- Provide copy of data
- Respond within one month

**Implementation:**
- Data access request process
- Data retrieval system
- Response template
- Verification process
- Timeline tracking

#### 2. Right to Rectification (Article 16)

**Definition:** Right to have inaccurate data corrected.

**Requirements:**
- Correct inaccurate data
- Complete incomplete data
- Respond within one month
- Notify third parties if applicable

**Implementation:**
- Correction request process
- Data update system
- Verification process
- Third-party notification
- Timeline tracking

#### 3. Right to Erasure (Article 17 - "Right to be Forgotten")

**Definition:** Right to have personal data erased in certain circumstances.

**Requirements:**
- Erase data when requested
- Respond within one month
- Notify third parties if applicable
- Exceptions apply

**Grounds:**
- Data no longer necessary
- Consent withdrawn
- Objection to processing
- Unlawful processing
- Legal obligation fulfilled

**Implementation:**
- Erasure request process
- Data deletion system
- Verification process
- Third-party notification
- Exception handling
- Timeline tracking

#### 4. Right to Restrict Processing (Article 18)

**Definition:** Right to restrict processing in certain circumstances.

**Requirements:**
- Restrict processing when requested
- Respond within one month
- Store but not process
- Exceptions apply

**Grounds:**
- Accuracy contested
- Processing unlawful
- Data no longer needed
- Objection pending

**Implementation:**
- Restriction request process
- Processing restriction system
- Verification process
- Exception handling
- Timeline tracking

#### 5. Right to Data Portability (Article 20)

**Definition:** Right to receive data in structured, machine-readable format.

**Requirements:**
- Provide data in structured format
- Provide commonly used format
- Transmit directly if requested
- Respond within one month

**Scope:**
- Data provided by data subject
- Processing based on consent or contract
- Automated processing

**Implementation:**
- Portability request process
- Data export system
- Format standardization
- Direct transmission capability
- Timeline tracking

#### 6. Right to Object (Article 21)

**Definition:** Right to object to processing based on legitimate interests or public task.

**Requirements:**
- Stop processing when objected
- Respond within one month
- Demonstrate compelling legitimate interests if continuing

**Implementation:**
- Objection request process
- Processing stop system
- Legitimate interest assessment
- Timeline tracking

#### 7. Rights Related to Automated Decision-Making (Article 22)

**Definition:** Right not to be subject to automated decision-making with legal or significant effect.

**Requirements:**
- Not use automated decision-making
- Provide human intervention
- Express views and contest
- Exceptions apply

**Implementation:**
- Human review process
- Decision explanation
- Contestation mechanism
- Exception handling

### CCPA Consumer Rights

#### 1. Right to Know

**Definition:** Right to know what personal information is collected, used, shared, or sold.

**Requirements:**
- Disclose categories collected
- Disclose sources
- Disclose purposes
- Disclose third parties
- Provide specific information on request

**Implementation:**
- Privacy notice
- Data inventory
- Request process
- Response system

#### 2. Right to Delete

**Definition:** Right to request deletion of personal information.

**Requirements:**
- Delete personal information on request
- Respond within 45 days
- Exceptions apply

**Implementation:**
- Deletion request process
- Data deletion system
- Verification process
- Exception handling

#### 3. Right to Opt-Out

**Definition:** Right to opt-out of sale of personal information.

**Requirements:**
- Provide opt-out mechanism
- Honor opt-out requests
- No discrimination for opting out
- "Do Not Sell My Personal Information" link

**Implementation:**
- Opt-out mechanism
- Opt-out tracking
- Processing restrictions
- No discrimination policy

#### 4. Right to Non-Discrimination

**Definition:** Right not to be discriminated against for exercising rights.

**Requirements:**
- No discrimination
- No denial of goods/services
- No different prices
- No different quality

**Implementation:**
- Non-discrimination policy
- Training
- Monitoring
- Complaint handling

### Operationalizing Rights

#### 1. Request Management

**Process:**
- Receive request
- Verify identity
- Process request
- Respond within timeline
- Document process

**Systems:**
- Request intake system
- Identity verification
- Request tracking
- Response generation
- Documentation

#### 2. Identity Verification

**Methods:**
- Account verification
- ID verification
- Knowledge-based authentication
- Multi-factor authentication

**Requirements:**
- Sufficient verification
- Not excessive
- Secure
- Documented

#### 3. Response Generation

**Content:**
- Requested information
- Processing information
- Rights information
- Contact information

**Format:**
- Clear and understandable
- Structured format
- Machine-readable (for portability)
- Secure delivery

#### 4. Timeline Management

**GDPR:** One month (extendable to two months)

**CCPA:** 45 days (extendable to 90 days)

**Implementation:**
- Automated tracking
- Alerts and reminders
- Extension management
- Documentation

#### 5. Exception Handling

**GDPR Exceptions:**
- Manifestly unfounded requests
- Excessive requests
- Legal obligations
- Legitimate interests

**CCPA Exceptions:**
- Legal obligations
- Business purposes
- Security
- Other exceptions

**Implementation:**
- Exception identification
- Assessment process
- Documentation
- Communication

---

## 4.5 Privacy-by-Design and Privacy-by-Default

### Privacy-by-Design

**Definition:** Integrating privacy considerations into system design from the start.

**Principles:**
1. Proactive not reactive
2. Privacy as default
3. Full functionality
4. End-to-end security
5. Visibility and transparency
6. Respect for user privacy
7. User-centric

**Implementation:**

#### 1. Design Phase

**Activities:**
- Privacy impact assessment
- Privacy requirements definition
- Privacy architecture design
- Privacy controls design

**Deliverables:**
- Privacy impact assessment
- Privacy requirements
- Privacy architecture
- Privacy controls

#### 2. Development Phase

**Activities:**
- Privacy controls implementation
- Privacy testing
- Privacy documentation
- Privacy training

**Deliverables:**
- Privacy controls
- Test results
- Documentation
- Training materials

#### 3. Deployment Phase

**Activities:**
- Privacy configuration
- Privacy monitoring setup
- Privacy documentation
- Privacy training

**Deliverables:**
- Configuration
- Monitoring
- Documentation
- Training

#### 4. Operations Phase

**Activities:**
- Privacy monitoring
- Privacy audits
- Privacy updates
- Privacy improvements

**Deliverables:**
- Monitoring reports
- Audit findings
- Updates
- Improvements

### Privacy-by-Default

**Definition:** Privacy settings that provide maximum privacy protection by default.

**Requirements:**
- Maximum privacy settings by default
- Minimal data collection by default
- Limited data sharing by default
- Strong security by default

**Implementation:**

#### 1. Default Settings

**Principles:**
- Most restrictive privacy settings
- Minimal data collection
- Limited data sharing
- Strong security

**Examples:**
- Opt-in for marketing (not opt-out)
- Minimal data collection
- No data sharing by default
- Encryption enabled by default

#### 2. User Control

**Principles:**
- Easy to adjust settings
- Clear options
- Granular control
- Easy to understand

**Examples:**
- Privacy dashboard
- Granular controls
- Clear explanations
- Easy to change

#### 3. Transparency

**Principles:**
- Clear about defaults
- Explain implications
- Show current settings
- Provide information

**Examples:**
- Privacy notices
- Setting explanations
- Current status display
- Information resources

### Privacy Impact Assessments (PIAs)

**Definition:** Systematic assessment of privacy risks and mitigation measures.

**When Required:**
- High-risk processing
- Systematic monitoring
- Large-scale processing
- Special category data
- Automated decision-making

**Process:**
1. Describe processing
2. Identify risks
3. Assess risks
4. Identify mitigations
5. Document assessment
6. Review regularly

**Content:**
- Processing description
- Risk identification
- Risk assessment
- Mitigation measures
- Residual risks
- Review schedule

---

## Hands-On Exercise: Map Personal Data Flows and Identify Compliance Gaps

### Objective

Map personal data flows for a data or AI product and create a privacy impact assessment identifying compliance gaps.

### Instructions

1. **Select a System:**
   - Choose a system that processes personal data
   - Gather system documentation
   - Understand data processing activities

2. **Map Data Flows:**
   - Identify data collection points
   - Map data processing steps
   - Identify data storage locations
   - Map data sharing
   - Identify data deletion

3. **Assess Compliance:**
   - Review against GDPR principles
   - Review against CCPA requirements
   - Identify lawful basis
   - Assess data subject rights
   - Evaluate privacy-by-design

4. **Identify Gaps:**
   - Document compliance gaps
   - Assess risk severity
   - Prioritize gaps
   - Propose remediation

5. **Create PIA:**
   - Document processing
   - Identify risks
   - Assess risks
   - Propose mitigations

### Deliverable

A comprehensive privacy impact assessment that includes:
- System overview
- Data flow mapping
- Compliance assessment
- Gap identification
- Risk assessment
- Mitigation recommendations

### Example PIA Structure

> **Template: Privacy Impact Assessment**

# Privacy Impact Assessment: [System Name]

## Executive Summary
[Key findings, risks, recommendations]

## System Overview
[Description, purpose, scope]

## Data Flow Mapping

### Data Collection
[What data is collected, from where, how]

### Data Processing
[How data is processed, by whom, for what]

### Data Storage
[Where data is stored, for how long, how secured]

### Data Sharing
[Who data is shared with, for what purpose, how]

### Data Deletion
[When data is deleted, how, verification]

## Compliance Assessment

### GDPR Compliance
- Lawful basis: [Basis and rationale]
- Principles: [Compliance with each principle]
- Rights: [How rights are honored]
- Security: [Security measures]

### CCPA Compliance
- Disclosures: [What is disclosed]
- Consumer rights: [How rights are honored]
- Opt-out: [Opt-out mechanism]
- Non-discrimination: [Policy and implementation]

## Gap Identification
[List of compliance gaps with severity]

## Risk Assessment
[Risks identified, likelihood, impact, severity]

## Mitigation Recommendations
[Specific actions to address gaps and risks]

## Review Schedule
[When PIA will be reviewed and updated]

---

## Key Takeaways

- **GDPR and CCPA have different requirements:**: Understand both regulations and their specific requirements for your organization

- **Lawful basis is fundamental:**: Every processing activity must have a lawful basis under GDPR—choose and document carefully

- **Data subject rights are operational requirements:**: Rights must be operationalized with processes, systems, and timelines

- **Privacy-by-design is essential:**: Build privacy into systems from the start, not as an afterthought

- **Privacy-by-default protects users:**: Default settings should provide maximum privacy protection

- **Compliance is continuous:**: Regular reviews, updates, and monitoring are required to maintain compliance

---

## Additional Resources

- **Regulation:** GDPR Full Text
- **Regulation:** CCPA Full Text
- **Guide:** ICO Guide to GDPR
- **Guide:** California Attorney General CCPA Guide
- **Framework:** Privacy-by-Design Framework
- **Tool:** PIA Templates

---

## Next Module Preview

In Module 5, we'll explore Model Audits, Reviews & Approvals—learning how to design governance processes that ensure models are reviewed, approved, and audited throughout their lifecycle.
