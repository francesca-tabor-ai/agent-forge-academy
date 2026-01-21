---
title: "Module 6: Governance, Security & Access Control"
description: "Scaling safely"
module: "6"
order: 6
email_takeaway: "Governance enables scale. Good governance balances control with developer velocity—too little is chaos, too much is paralysis."
email_action: "Map your data access patterns: who needs what data? What's your current access control model? Where are the gaps?"
---

# Module 6: Governance, Security & Access Control

**Duration:** Week 6  
**Theme:** *Scaling safely*

**Learning Objectives:**
- **data ownership and stewardship models Understanding**: Understand data ownership and stewardship models
- **identity and access management patterns Understanding**: Learn identity and access management patterns
- **privacy, compliance, and regulatory requirements Understanding**: Master privacy, compliance, and regulatory requirements
- **lineage, auditability, and discoverability Implementation**: Implement lineage, auditability, and discoverability
- **Balance Governance**: Balance governance with developer velocity

---

## 6.1 Data Ownership and Stewardship Models

### What is Data Ownership?

**Definition:** Clear assignment of responsibility for data assets, including quality, access, lifecycle, and compliance.

### Ownership Models

#### Centralized Ownership

**Pattern:** Single team or function owns all data

**Characteristics:**
- Central data team owns everything
- Consistent standards
- Clear accountability

**Advantages:**
- Consistent governance
- Easier to maintain standards
- Clear accountability

**Disadvantages:**
- Bottleneck at scale
- May lack domain expertise
- Slower to adapt

**When to Use:**
- Small organizations
- Homogeneous data
- Strong central leadership

#### Distributed Ownership

**Pattern:** Domain teams own their data

**Characteristics:**
- Business units own their data
- Domain expertise in ownership
- Scales with organization

**Advantages:**
- Scales with organization
- Domain expertise
- Faster innovation

**Disadvantages:**
- Risk of inconsistency
- Coordination overhead
- Governance complexity

**When to Use:**
- Large organizations
- Diverse data domains
- Strong domain teams

#### Hybrid Ownership

**Pattern:** Platform team owns infrastructure, domain teams own data

**Characteristics:**
- Platform team: Infrastructure, standards, tooling
- Domain teams: Data assets, quality, access

**Advantages:**
- Best of both worlds
- Scales well
- Domain expertise + platform consistency

**Disadvantages:**
- Requires coordination
- Need clear boundaries
- More complex

**When to Use:**
- Most organizations at scale
- Mature data organizations
- Strong platform and domain teams

### Data Stewardship

**Definition:** Operational responsibility for data quality, documentation, and compliance.

#### Steward Responsibilities

**1. Data Quality**
- Monitor data quality metrics
- Resolve quality issues
- Maintain quality standards

**2. Documentation**
- Document data assets
- Maintain data dictionaries
- Update metadata

**3. Access Management**
- Review access requests
- Approve data access
- Monitor usage

**4. Compliance**
- Ensure regulatory compliance
- Handle data subject requests
- Maintain audit trails

**5. Lifecycle Management**
- Plan data retention
- Execute data archival
- Handle data deletion

### Ownership Assignment

#### Ownership Criteria

**Assign Ownership Based On:**
- Data source (who creates the data?)
- Business domain (who uses the data?)
- Technical expertise (who understands the data?)
- Compliance requirements (who's responsible for compliance?)

#### Ownership Documentation

**Document:**
- Owner name and contact
- Steward name and contact
- Ownership rationale
- Responsibilities
- Review frequency

**Example:**
```yaml
data_asset:
  name: customer_orders
  owner:
    team: ecommerce-team
    contact: ecommerce-team@company.com
  steward:
    name: Jane Doe
    contact: jane@company.com
  responsibilities:
    - Data quality monitoring
    - Access approvals
    - Documentation
  review_frequency: quarterly
```

---

## 6.2 Identity and Access Management

### Identity Management

**Definition:** Managing user identities and authentication.

#### Identity Providers

**Options:**
- **Corporate Directory:** Active Directory, LDAP
- **Cloud Identity:** AWS IAM, Azure AD, GCP IAM
- **SSO Providers:** Okta, Auth0, OneLogin
- **Custom:** Application-managed identities

#### Identity Models

**1. User-Based Access**
- Each user has individual access
- Granular control
- More management overhead

**2. Role-Based Access Control (RBAC)**
- Users assigned to roles
- Roles have permissions
- Easier management

**3. Attribute-Based Access Control (ABAC)**
- Access based on user attributes
- More flexible
- More complex

### Access Management

**Definition:** Controlling who can access what data and how.

#### Access Control Models

**1. Discretionary Access Control (DAC)**
- Data owners control access
- Flexible but less secure
- Hard to audit

**2. Mandatory Access Control (MAC)**
- System-enforced access
- More secure
- Less flexible

**3. Role-Based Access Control (RBAC)**
- Access via roles
- Common in enterprises
- Balance of security and flexibility

#### Access Levels

**Read-Only:**
- Can query data
- Cannot modify
- Most common access level

**Read-Write:**
- Can query and modify
- For data producers
- More restricted

**Admin:**
- Full control
- For platform team
- Very restricted

#### Access Patterns

**1. Direct Access**
- Users query data directly
- SQL, APIs, notebooks
- Requires access control at storage layer

**2. Proxy Access**
- Access through platform layer
- Platform enforces access control
- Centralized management

**3. Federated Access**
- Access through multiple systems
- Consistent access control
- More complex

### Access Control Implementation

#### Storage-Level Access Control

**Data Warehouse:**
```sql
-- Grant read access to role
GRANT SELECT ON TABLE orders TO ROLE analysts;

-- Grant write access to role
GRANT INSERT, UPDATE ON TABLE orders TO ROLE data_engineers;
```

**Data Lake:**
```python
# S3 bucket policy
{
    "Effect": "Allow",
    "Principal": {
        "AWS": "arn:aws:iam::account:role/analysts"
    },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::data-lake/analytics/*"
}
```

#### Application-Level Access Control

**API Gateway:**
```python
@require_role('analyst')
def get_orders():
    # Check user role
    # Return data
    pass
```

**Query Engine:**
```python
def execute_query(user, query):
    # Check user permissions
    if not has_access(user, query.tables):
        raise PermissionError()
    # Execute query
    return engine.execute(query)
```

### Access Request Workflow

**1. Request**
- User requests access
- Specifies data and use case
- Submits through system

**2. Approval**
- Owner/steward reviews
- Approves or denies
- May request additional info

**3. Provisioning**
- Access granted automatically
- Or manual provisioning
- Access logged

**4. Review**
- Periodic access reviews
- Remove unused access
- Maintain least privilege

---

## 6.3 Privacy, Compliance, and Regulatory Requirements

### Privacy Regulations

#### GDPR (General Data Protection Regulation)

**Key Requirements:**
- **Right to Access:** Users can request their data
- **Right to Erasure:** Users can request data deletion
- **Data Minimization:** Collect only necessary data
- **Purpose Limitation:** Use data only for stated purposes
- **Consent:** Obtain consent for data processing

**Implementation:**
- Data subject request handling
- Data deletion capabilities
- Consent tracking
- Privacy by design

#### CCPA (California Consumer Privacy Act)

**Key Requirements:**
- **Right to Know:** Users can request data disclosure
- **Right to Delete:** Users can request data deletion
- **Right to Opt-Out:** Users can opt out of data sale
- **Non-Discrimination:** Cannot discriminate for exercising rights

**Implementation:**
- Data subject request handling
- Opt-out mechanisms
- Privacy notices

#### HIPAA (Health Insurance Portability and Accountability Act)

**Key Requirements:**
- **Protected Health Information (PHI):** Strict controls
- **Access Controls:** Role-based access
- **Audit Logs:** Comprehensive logging
- **Encryption:** Data at rest and in transit

**Implementation:**
- PHI identification and classification
- Strict access controls
- Comprehensive audit logging
- Encryption requirements

### Compliance Framework

#### Data Classification

**Classification Levels:**
- **Public:** No restrictions
- **Internal:** Company use only
- **Confidential:** Restricted access
- **Restricted:** Highly sensitive (PII, PHI, financial)

**Implementation:**
```python
class DataClassification(Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"

def classify_data(data):
    if contains_pii(data):
        return DataClassification.RESTRICTED
    elif contains_internal_info(data):
        return DataClassification.CONFIDENTIAL
    else:
        return DataClassification.INTERNAL
```

#### Data Handling Policies

**By Classification:**
- **Public:** No restrictions
- **Internal:** Company access, standard encryption
- **Confidential:** Restricted access, encryption required
- **Restricted:** Highly restricted, encryption + audit required

#### Retention Policies

**Requirements:**
- Define retention periods by data type
- Implement automated archival
- Implement automated deletion
- Document retention rationale

**Implementation:**
```python
retention_policies = {
    'transactional_data': timedelta(days=365),
    'analytical_data': timedelta(days=2555),  # 7 years
    'log_data': timedelta(days=90),
    'backup_data': timedelta(days=30)
}

def apply_retention_policy(data_type, data):
    retention = retention_policies[data_type]
    if data.age > retention:
        archive_or_delete(data)
```

### Compliance Monitoring

**Requirements:**
- Monitor access to sensitive data
- Track data processing activities
- Audit data changes
- Report compliance metrics

**Implementation:**
- Access logs
- Data processing logs
- Change audit logs
- Compliance dashboards

---

## 6.4 Lineage, Auditability, and Discoverability

### Data Lineage

**Definition:** Tracking data flow from source to consumption.

#### Lineage Components

**1. Source Lineage**
- Where data comes from
- Source systems
- Extraction methods

**2. Transformation Lineage**
- How data is transformed
- Transformation logic
- Dependencies

**3. Consumption Lineage**
- Where data is used
- Downstream systems
- Users and applications

#### Lineage Implementation

**Automatic Lineage:**
- Parse SQL queries
- Track data pipeline execution
- Monitor data access

**Manual Lineage:**
- Document in metadata
- Maintain in catalog
- Update as systems change

**Example:**
```python
lineage = {
    'table': 'customer_analytics',
    'sources': [
        {'table': 'customers', 'type': 'direct'},
        {'table': 'orders', 'type': 'join'}
    ],
    'transformations': [
        {'type': 'aggregation', 'logic': 'SUM(order_total)'},
        {'type': 'filter', 'logic': 'WHERE status = "completed"'}
    ],
    'consumers': [
        {'system': 'dashboard', 'usage': 'read'},
        {'system': 'ml_model', 'usage': 'read'}
    ]
}
```

### Auditability

**Definition:** Ability to track and review data access and changes.

#### Audit Requirements

**1. Access Auditing**
- Who accessed what data
- When accessed
- How accessed (query, API, etc.)
- Purpose of access

**2. Change Auditing**
- What data changed
- Who made the change
- When changed
- Why changed

**3. Configuration Auditing**
- Schema changes
- Access control changes
- Policy changes
- System configuration changes

#### Audit Implementation

**Access Logs:**
```python
def log_access(user, resource, action, result):
    audit_log = {
        'timestamp': datetime.now(),
        'user': user.id,
        'resource': resource,
        'action': action,
        'result': result,
        'ip_address': request.remote_addr
    }
    audit_system.log(audit_log)
```

**Change Logs:**
```python
def log_change(table, old_value, new_value, user):
    change_log = {
        'timestamp': datetime.now(),
        'table': table,
        'old_value': old_value,
        'new_value': new_value,
        'user': user.id
    }
    audit_system.log(change_log)
```

**Audit Retention:**
- Retain audit logs per regulatory requirements
- Typically 7 years for financial data
- Encrypt audit logs
- Protect from tampering

### Discoverability

**Definition:** Ability to find and understand data assets.

#### Discovery Components

**1. Data Catalog**
- Centralized metadata
- Search and browse
- Data dictionary
- Usage examples

**2. Metadata Management**
- Schema information
- Data quality metrics
- Ownership information
- Usage statistics

**3. Documentation**
- Data descriptions
- Business context
- Usage guidelines
- Examples

#### Discovery Implementation

**Search:**
```python
def search_catalog(query):
    results = catalog.search(
        query=query,
        filters={
            'classification': 'internal',
            'quality_score': '>0.9'
        }
    )
    return results
```

**Metadata:**
```python
metadata = {
    'table': 'customer_orders',
    'description': 'Customer order transactions',
    'owner': 'ecommerce-team',
    'classification': 'internal',
    'schema': {...},
    'quality_metrics': {
        'completeness': 0.99,
        'freshness': '1 hour'
    },
    'usage': {
        'queries_per_day': 1000,
        'users': 50
    }
}
```

---

## 6.5 Balancing Governance with Developer Velocity

### The Governance Trade-off

**Too Little Governance:**
- Data chaos
- Security risks
- Compliance violations
- Poor data quality

**Too Much Governance:**
- Slow development
- Reduced innovation
- Developer frustration
- Bureaucracy

**Goal:** Balance that enables scale without sacrificing velocity

### Principles for Balanced Governance

#### 1. Self-Service with Guardrails

**Pattern:** Enable self-service with automated checks

**Implementation:**
- Self-service data access (with approval workflow)
- Automated quality checks
- Automated compliance checks
- Clear guidelines and documentation

**Benefits:**
- Faster access
- Consistent standards
- Reduced manual overhead

#### 2. Progressive Disclosure

**Pattern:** More governance for sensitive data, less for internal data

**Implementation:**
- Public data: Minimal governance
- Internal data: Standard governance
- Confidential data: Enhanced governance
- Restricted data: Strict governance

**Benefits:**
- Appropriate level of control
- Faster for low-risk data
- Protection for high-risk data

#### 3. Automated Compliance

**Pattern:** Automate compliance checks where possible

**Implementation:**
- Automated PII detection
- Automated access reviews
- Automated retention policies
- Automated audit logging

**Benefits:**
- Consistent compliance
- Reduced manual work
- Faster processes

#### 4. Developer-Friendly Tools

**Pattern:** Make governance easy for developers

**Implementation:**
- Simple access request UI
- Clear documentation
- Code templates
- Automated testing

**Benefits:**
- Easier compliance
- Faster development
- Better adoption

#### 5. Education and Enablement

**Pattern:** Educate developers on governance

**Implementation:**
- Training programs
- Best practices guides
- Office hours
- Community support

**Benefits:**
- Better understanding
- Fewer mistakes
- Self-service capability

### Governance Metrics

**Track:**
- Time to access data
- Compliance violation rate
- Developer satisfaction
- Data quality metrics
- Security incident rate

**Goal:** Improve metrics over time while maintaining velocity

---

## Hands-On Exercise: Design a Governance Model

### Objective

Design a governance and access-control strategy that enables scale without chaos.

### Scenario

You're designing governance for a data platform with:
- 500 employees
- 10 data domains (sales, marketing, product, etc.)
- Mix of public, internal, confidential, and restricted data
- Need to comply with GDPR and industry regulations
- Need to enable fast development

### Exercise Steps

1. **Design Ownership Model**
   - Choose ownership approach
   - Assign ownership for each domain
   - Define steward responsibilities

2. **Design Access Control**
   - Choose access control model
   - Define roles and permissions
   - Design access request workflow

3. **Design Compliance Framework**
   - Classify data assets
   - Define retention policies
   - Plan for GDPR/regulatory compliance

4. **Design Lineage and Auditing**
   - Plan lineage tracking
   - Design audit logging
   - Plan discoverability

5. **Balance Governance and Velocity**
   - Design self-service capabilities
   - Plan automated compliance
   - Design developer-friendly tools

### Deliverable

A governance model that includes:
- Ownership and stewardship model
- Access control architecture
- Compliance framework
- Lineage and auditing strategy
- Developer enablement plan
- Metrics and success criteria

---

## Module Summary

### Key Takeaways

- **Data ownership**: Must be clearly defined and documented
- **Access management**: Requires identity, roles, and policies
- **Compliance**: Requires classification, policies, and monitoring
- **Lineage, auditing, and discoverability**: Enable trust and efficiency
- **Balanced governance**: Enables scale without sacrificing velocity

### Next Steps

In Module 7, we'll learn how to manage costs and make scalability trade-offs that ensure platforms are financially sustainable.

---

## Additional Resources

- "Data Governance" by John Ladley
- "The Data Catalog" by Alation
- GDPR compliance guides
- "Building Secure and Reliable Systems" by Google
