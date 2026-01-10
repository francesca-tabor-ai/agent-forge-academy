---
title: "Module 3: Technical Protocols & Infrastructure"
description: "The emerging Grammar of online transactions"
module: "3"
order: 3
---

# Module 3: Technical Protocols & Infrastructure

**Duration:** Week 3  
**Learning Objectives:**
- Understand the Agentic Commerce Protocol (ACP)
- Implement Decentralized Identifiers (DIDs) and Verifiable Credentials
- Compare secure payment rails (SPT vs. AP2)
- Build secure agent-mediated transaction infrastructure

---

## 3.1 The Agentic Commerce Protocol (ACP)

### Introduction

The **Agentic Commerce Protocol (ACP)** is an open standard co-developed by OpenAI and Stripe for secure, tokenized transactions in agent-mediated commerce. It provides the foundational "grammar" for how AI agents interact with commerce systems.

### Why ACP Exists

**Challenges ACP Solves:**
- Secure agent authentication
- Tokenized payment processing
- Standardized transaction format
- Cross-platform interoperability
- Trust and verification

### ACP Architecture

```
User Intent
    ↓
AI Agent (ACP Client)
    ↓
ACP Gateway
    ↓
Merchant System (ACP Server)
    ↓
Payment Processor
    ↓
Fulfillment
```

### Core Components

#### 1. Agent Identity
- **Agent ID:** Unique identifier for each agent
- **Verification:** Cryptographic proof of agent identity
- **Credentials:** Verifiable credentials for agent capabilities

#### 2. Transaction Tokens
- **Intent Token:** Represents user purchase intent
- **Authorization Token:** Grants agent permission to transact
- **Payment Token:** Secure payment information

#### 3. Transaction Flow
- **Discovery:** Agent discovers products/services
- **Evaluation:** Agent evaluates options
- **Authorization:** User authorizes transaction
- **Execution:** Agent executes transaction
- **Confirmation:** Transaction confirmed

### ACP Transaction Lifecycle

#### Phase 1: Discovery
```
Agent → ACP Gateway → Merchant Catalog
    ← Product Data ←
```

#### Phase 2: Evaluation
```
Agent → ACP Gateway → Merchant API
    ← Pricing, Availability, Terms ←
```

#### Phase 3: Authorization
```
Agent → User → Authorization Request
    ← Authorization Token ←
```

#### Phase 4: Execution
```
Agent → ACP Gateway → Payment Processor
    ← Transaction Confirmation ←
```

#### Phase 5: Fulfillment
```
Agent → ACP Gateway → Merchant System
    ← Fulfillment Status ←
```

### Security Features

#### 1. Cryptographic Authentication
- Public-key cryptography for agent identity
- Digital signatures for transaction integrity
- Non-repudiation guarantees

#### 2. Token-Based Authorization
- Time-limited authorization tokens
- Scope-limited permissions
- Revocable authorizations

#### 3. Encrypted Communication
- End-to-end encryption
- Secure channel establishment
- Data privacy protection

#### 4. Audit Trails
- Immutable transaction logs
- Complete auditability
- Compliance support

### Implementation Example

```javascript
// ACP Client Implementation
class ACPClient {
  constructor(agentId, credentials) {
    this.agentId = agentId;
    this.credentials = credentials;
    this.gateway = new ACPGateway();
  }

  async discoverProducts(query) {
    const request = {
      agentId: this.agentId,
      query: query,
      signature: this.signRequest(query)
    };
    return await this.gateway.discover(request);
  }

  async executeTransaction(intentToken, authorizationToken) {
    const transaction = {
      agentId: this.agentId,
      intentToken: intentToken,
      authorizationToken: authorizationToken,
      signature: this.signTransaction(intentToken, authorizationToken)
    };
    return await this.gateway.execute(transaction);
  }
}
```

### ACP Benefits

**For Agents:**
- Standardized interface
- Secure authentication
- Interoperability
- Trust framework

**For Merchants:**
- Secure transactions
- Agent verification
- Standardized integration
- Reduced fraud

**For Users:**
- Secure transactions
- Agent accountability
- Transaction transparency
- Privacy protection

---

## 3.2 Identity & Decentralized Identifiers (DIDs)

### Introduction

**Decentralized Identifiers (DIDs)** enable agents to prove ownership and establish trust relationships across organizational boundaries using **Verifiable Credentials (VCs)**. This is essential for agent-mediated commerce where trust must be established without central authorities.

### The Identity Challenge

**Traditional Identity:**
- Centralized authorities (governments, companies)
- Single point of failure
- Privacy concerns
- Limited interoperability

**Agent Identity Needs:**
- Decentralized verification
- Cross-platform trust
- Privacy-preserving
- Self-sovereign identity

### What are DIDs?

**DID Definition:**
A DID is a unique identifier that:
- Is globally unique
- Resolves to a DID document
- Is cryptographically verifiable
- Is independent of centralized registries

**DID Format:**
```
did:method:identifier
```

**Example:**
```
did:agent:commerce:abc123xyz789
```

### DID Documents

**DID Document Structure:**
```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:agent:commerce:abc123",
  "verificationMethod": [{
    "id": "did:agent:commerce:abc123#keys-1",
    "type": "Ed25519VerificationKey2020",
    "publicKeyMultibase": "z6Mk..."
  }],
  "service": [{
    "id": "did:agent:commerce:abc123#agent-service",
    "type": "AgentService",
    "serviceEndpoint": "https://agent.example.com"
  }]
}
```

### Verifiable Credentials (VCs)

**VC Definition:**
A Verifiable Credential is a tamper-evident credential that:
- Has cryptographic proof
- Contains claims about an agent
- Can be verified independently
- Is privacy-preserving

**VC Structure:**
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "id": "https://example.com/credentials/3732",
  "type": ["VerifiableCredential", "AgentCredential"],
  "issuer": "did:example:issuer",
  "issuanceDate": "2025-01-15T10:00:00Z",
  "credentialSubject": {
    "id": "did:agent:commerce:abc123",
    "capabilities": ["product-discovery", "price-comparison"],
    "trustScore": 0.95
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-01-15T10:00:00Z",
    "verificationMethod": "did:example:issuer#keys-1",
    "proofValue": "z5Y..."
  }
}
```

### Trust Relationships

**Establishing Trust:**
1. **Agent Registration:** Agent creates DID
2. **Credential Issuance:** Trusted issuer provides VC
3. **Credential Presentation:** Agent presents VC to merchant
4. **Verification:** Merchant verifies VC
5. **Trust Establishment:** Trust relationship established

### Use Cases in Agentic Commerce

#### 1. Agent Authentication
- Agent presents DID and VC
- Merchant verifies credentials
- Trust relationship established

#### 2. Capability Verification
- VC contains agent capabilities
- Merchant checks capabilities
- Appropriate access granted

#### 3. Reputation Building
- VCs accumulate over time
- Trust score increases
- Better access and terms

#### 4. Cross-Platform Trust
- DID works across platforms
- VCs are portable
- Trust is transferable

### Implementation Example

```javascript
// DID and VC Implementation
class AgentIdentity {
  constructor() {
    this.did = this.generateDID();
    this.keyPair = this.generateKeyPair();
  }

  async requestCredential(issuer, capabilities) {
    const request = {
      did: this.did,
      capabilities: capabilities,
      publicKey: this.keyPair.publicKey
    };
    return await issuer.issueCredential(request);
  }

  async presentCredential(merchant, credential) {
    const presentation = {
      did: this.did,
      credential: credential,
      proof: this.signPresentation(credential)
    };
    return await merchant.verifyCredential(presentation);
  }
}
```

### Benefits of DIDs and VCs

**For Agents:**
- Self-sovereign identity
- Privacy-preserving
- Cross-platform portability
- Trust accumulation

**For Merchants:**
- Verifiable agent identity
- Capability verification
- Reduced fraud
- Trust framework

**For Users:**
- Agent accountability
- Privacy protection
- Trust transparency
- Security assurance

---

## 3.3 Secure Payment Rails

### Introduction

Secure payment rails are critical for agent-mediated commerce. Two major protocols have emerged: **Stripe's Shared Payment Token (SPT)** and **Google's Agent Payments Protocol (AP2)**. Understanding both is essential for implementing secure agent transactions.

### The Payment Challenge

**Traditional Payments:**
- User enters payment information
- Direct merchant relationship
- Single transaction context
- Human oversight

**Agent Payments:**
- Agent initiates payment
- Indirect user relationship
- Multiple transaction contexts
- Autonomous execution

### Stripe's Shared Payment Token (SPT)

#### Overview
SPT is Stripe's solution for secure, tokenized payments in agent-mediated commerce. It allows agents to make payments on behalf of users without exposing sensitive payment information.

#### Architecture
```
User → Stripe → SPT Token
    ↓
Agent → Merchant → SPT Token → Stripe → Payment
```

#### Key Features

**1. Token-Based Payments**
- User authorizes payment token
- Agent uses token for transactions
- Token is scope-limited
- Token is time-limited

**2. Multi-Merchant Support**
- Single token works across merchants
- Merchant-agnostic
- Reduced friction
- Better user experience

**3. Fraud Prevention**
- Token-based security
- Transaction monitoring
- Risk assessment
- Fraud detection

**4. User Control**
- User sets spending limits
- User can revoke tokens
- User receives notifications
- User maintains control

#### SPT Token Structure
```json
{
  "tokenId": "spt_abc123xyz789",
  "userId": "user_123",
  "agentId": "agent_456",
  "scope": ["product-purchase", "subscription"],
  "limits": {
    "amount": 1000.00,
    "currency": "USD",
    "timeframe": "monthly"
  },
  "expiresAt": "2025-02-15T00:00:00Z",
  "status": "active"
}
```

#### Implementation Example
```javascript
// SPT Implementation
class SPTClient {
  async createToken(userId, agentId, limits) {
    const token = await stripe.spt.create({
      userId: userId,
      agentId: agentId,
      scope: ['product-purchase'],
      limits: limits
    });
    return token;
  }

  async processPayment(tokenId, amount, merchantId) {
    const payment = await stripe.spt.charge({
      tokenId: tokenId,
      amount: amount,
      merchantId: merchantId
    });
    return payment;
  }
}
```

### Google's Agent Payments Protocol (AP2)

#### Overview
AP2 is Google's protocol for agent-mediated payments, designed for integration with Google's ecosystem and services.

#### Architecture
```
User → Google Pay → AP2 Authorization
    ↓
Agent → Merchant → AP2 Gateway → Google Pay → Payment
```

#### Key Features

**1. Google Pay Integration**
- Seamless Google Pay integration
- Existing user base
- Familiar user experience
- Trust in Google brand

**2. Context-Aware Payments**
- Payment context awareness
- Smart payment suggestions
- Optimized payment timing
- Reduced friction

**3. Multi-Platform Support**
- Works across Google services
- Cross-platform consistency
- Unified payment experience
- Ecosystem integration

**4. Advanced Security**
- Google's security infrastructure
- Multi-factor authentication
- Fraud detection
- Privacy protection

#### AP2 Authorization Structure
```json
{
  "authorizationId": "ap2_auth_xyz789",
  "userId": "user_123",
  "agentId": "agent_456",
  "merchantId": "merchant_789",
  "context": {
    "intent": "product-purchase",
    "amount": 99.99,
    "currency": "USD"
  },
  "permissions": ["purchase", "refund"],
  "expiresAt": "2025-02-15T00:00:00Z"
}
```

#### Implementation Example
```javascript
// AP2 Implementation
class AP2Client {
  async requestAuthorization(userId, agentId, context) {
    const auth = await googlePay.ap2.request({
      userId: userId,
      agentId: agentId,
      context: context
    });
    return auth;
  }

  async executePayment(authorizationId, merchantId) {
    const payment = await googlePay.ap2.execute({
      authorizationId: authorizationId,
      merchantId: merchantId
    });
    return payment;
  }
}
```

### Comparison: SPT vs. AP2

| Feature | SPT | AP2 |
|---------|-----|-----|
| **Provider** | Stripe | Google |
| **Token Model** | Shared payment token | Authorization-based |
| **Multi-Merchant** | Yes | Limited |
| **Google Integration** | No | Yes |
| **User Base** | Stripe users | Google Pay users |
| **Fraud Prevention** | Advanced | Advanced |
| **Privacy** | High | High |
| **Ecosystem** | Payment-focused | Google ecosystem |

### Choosing the Right Protocol

**Choose SPT When:**
- Multi-merchant support needed
- Payment-focused use case
- Stripe ecosystem integration
- Flexibility required

**Choose AP2 When:**
- Google ecosystem integration
- Google Pay user base
- Context-aware payments
- Google services integration

**Use Both When:**
- Maximum coverage needed
- Multiple payment options
- User choice important
- Platform-agnostic approach

### Best Practices

1. **Security First:** Always prioritize security
2. **User Control:** Maintain user control over payments
3. **Transparency:** Clear payment information
4. **Fraud Prevention:** Implement robust fraud detection
5. **Privacy:** Protect user payment data
6. **Compliance:** Ensure regulatory compliance

---

## Lab 3: Implement a Basic ACP Integration

### Objective

Implement a basic Agentic Commerce Protocol (ACP) integration for agent-mediated transactions.

### Tasks

1. **ACP Setup (2 hours)**
   - Set up ACP development environment
   - Configure ACP gateway
   - Create agent identity

2. **Discovery Implementation (2 hours)**
   - Implement product discovery
   - Test discovery API
   - Verify responses

3. **Transaction Implementation (3 hours)**
   - Implement transaction flow
   - Add authorization
   - Test transaction execution

4. **Security Implementation (1 hour)**
   - Add authentication
   - Implement encryption
   - Test security features

### Deliverables

- Working ACP integration
- Code repository with documentation
- Test results and verification
- Implementation report (5 pages)

### Evaluation Criteria

- **Functionality (30%):** Working implementation
- **Security (25%):** Proper security implementation
- **Code Quality (25%):** Clean, well-documented code
- **Testing (20%):** Comprehensive testing

---

## Key Takeaways

1. **ACP:** Open standard for agent-mediated transactions
2. **DIDs:** Decentralized identity for agents
3. **VCs:** Verifiable credentials for trust
4. **SPT:** Stripe's payment token solution
5. **AP2:** Google's agent payment protocol
6. **Security:** Critical for agent-mediated commerce

---

## Additional Resources

### Reading
- "Agentic Commerce Protocol Specification" (Technical Documentation)
- "Decentralized Identifiers (DIDs) Guide" (W3C Specification)
- "Verifiable Credentials Data Model" (W3C Specification)
- "Secure Payment Rails for Agents" (White Paper)

### Tools
- ACP SDK and Documentation
- DID/VC Libraries
- Payment Protocol Testing Tools

### Next Steps
- Complete Lab 3
- Review Module 4: Marketing Strategy – Winning the "Evaluation Game"
- Join course discussion forum

---

**Module 3 Complete. Ready for Module 4? →**
