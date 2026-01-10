---
title: "Module 4: Amazon Integration and Operations"
description: "Integrate 3D assets with Amazon's ecosystem and optimize operations"
module: "4"
order: 4
---

# Module 4: Amazon Integration and Operations

**Duration:** Week 4  
**Learning Objectives:**
- Integrate with Amazon Selling Partner API for 3D asset management
- Automate ASIN mapping and catalog synchronization
- Utilize Amazon Seller app for mobile 3D scanning
- Build 3D Readiness Index to identify high-ROI SKUs
- Implement automated workflows for catalog management

---

## 4.1 The Amazon Selling Partner API

### Overview

**What is SP-API?**
- RESTful API for Amazon seller operations
- Programmatic access to catalog, orders, inventory
- Replaces older MWS (Marketplace Web Service)
- OAuth 2.0 authentication
- Rate-limited (throttling)

**Key Capabilities:**
- Product catalog management
- Inventory updates
- Order processing
- Reports and analytics
- 3D asset uploads (new feature)

### Authentication Setup

**OAuth 2.0 Flow:**
```javascript
const axios = require('axios');

// Step 1: Get authorization URL
function getAuthorizationUrl() {
  const params = new URLSearchParams({
    client_id: process.env.AMAZON_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.AMAZON_REDIRECT_URI,
    scope: 'sellingpartnerapi::migration'
  });
  
  return `https://sellercentral.amazon.com/apps/authorize/consent?${params}`;
}

// Step 2: Exchange code for tokens
async function getAccessToken(authorizationCode) {
  const response = await axios.post('https://api.amazon.com/auth/o2/token', {
    grant_type: 'authorization_code',
    code: authorizationCode,
    client_id: process.env.AMAZON_CLIENT_ID,
    client_secret: process.env.AMAZON_CLIENT_SECRET,
    redirect_uri: process.env.AMAZON_REDIRECT_URI
  });
  
  return {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
    expiresIn: response.data.expires_in
  };
}

// Step 3: Refresh token
async function refreshAccessToken(refreshToken) {
  const response = await axios.post('https://api.amazon.com/auth/o2/token', {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.AMAZON_CLIENT_ID,
    client_secret: process.env.AMAZON_CLIENT_SECRET
  });
  
  return response.data.access_token;
}
```

### API Client Setup

**SP-API Client:**
```javascript
const axios = require('axios');
const crypto = require('crypto');

class AmazonSPAPI {
  constructor(credentials) {
    this.accessToken = credentials.accessToken;
    this.refreshToken = credentials.refreshToken;
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
    this.region = credentials.region || 'us-east-1';
    this.endpoint = `https://sellingpartnerapi-${this.region}.amazon.com`;
  }
  
  async request(method, path, params = {}) {
    const url = `${this.endpoint}${path}`;
    const timestamp = new Date().toISOString();
    
    // Sign request (simplified - actual implementation more complex)
    const signature = this.signRequest(method, path, timestamp);
    
    const response = await axios({
      method,
      url,
      headers: {
        'x-amz-access-token': this.accessToken,
        'x-amz-date': timestamp,
        'Authorization': `AWS4-HMAC-SHA256 ${signature}`
      },
      params
    });
    
    return response.data;
  }
  
  signRequest(method, path, timestamp) {
    // AWS Signature Version 4 signing
    // Implementation details...
    return signature;
  }
}
```

---

## 4.2 3D Asset Sync to Amazon Catalog

### Catalog Item Management

**Get Product Information:**
```javascript
async function getCatalogItem(asin) {
  const api = new AmazonSPAPI(credentials);
  
  const response = await api.request(
    'GET',
    `/catalog/v0/items/${asin}`
  );
  
  return response;
}
```

**Update Product with 3D Asset:**
```javascript
async function updateProductWith3D(asin, glbUrl, usdzUrl) {
  const api = new AmazonSPAPI(credentials);
  
  // Upload 3D asset to Amazon's CDN first
  const assetUrl = await uploadToAmazonCDN(glbUrl);
  
  // Update catalog item
  const response = await api.request(
    'PATCH',
    `/catalog/v0/items/${asin}`,
    {
      attributes: {
        '3d_model': {
          glb_url: assetUrl,
          usdz_url: usdzUrl,
          thumbnail_url: thumbnailUrl
        }
      }
    }
  );
  
  return response;
}
```

### ASIN Mapping

**Store ASIN Mappings:**
```javascript
// MongoDB schema
{
  _id: ObjectId,
  productId: String, // Internal product ID
  asin: String, // Amazon ASIN
  marketplace: String, // 'US' | 'UK' | 'DE' | etc.
  syncStatus: String, // 'pending' | 'synced' | 'error'
  lastSync: Date,
  syncErrors: [String],
  metadata: {
    title: String,
    category: String,
    price: Number
  }
}
```

**Sync Function:**
```javascript
async function syncProductToAmazon(productId) {
  const product = await Product.findById(productId);
  const asinMapping = await ASINMapping.findOne({ productId });
  
  if (!asinMapping) {
    throw new Error('ASIN mapping not found');
  }
  
  try {
    // Upload 3D assets
    const glbUrl = await uploadToAmazonCDN(product.model3d.glb);
    const usdzUrl = await uploadToAmazonCDN(product.model3d.usdz);
    
    // Update catalog
    await updateProductWith3D(
      asinMapping.asin,
      glbUrl,
      usdzUrl
    );
    
    // Update sync status
    asinMapping.syncStatus = 'synced';
    asinMapping.lastSync = new Date();
    await asinMapping.save();
    
  } catch (error) {
    asinMapping.syncStatus = 'error';
    asinMapping.syncErrors.push(error.message);
    await asinMapping.save();
    throw error;
  }
}
```

### Batch Synchronization

**Process Queue:**
```javascript
const Bull = require('bull');
const syncQueue = new Bull('amazon-sync', {
  redis: { host: 'localhost', port: 6379 }
});

// Add jobs
async function queueProductSync(productIds) {
  for (const productId of productIds) {
    await syncQueue.add('sync-product', { productId });
  }
}

// Process jobs
syncQueue.process('sync-product', async (job) => {
  const { productId } = job.data;
  await syncProductToAmazon(productId);
});

// Handle rate limiting
syncQueue.on('completed', (job) => {
  console.log(`Synced product ${job.data.productId}`);
});

syncQueue.on('failed', (job, err) => {
  console.error(`Failed to sync ${job.data.productId}:`, err);
  // Retry logic
});
```

---

## 4.3 Self-Service Modeling: Amazon Seller App

### Mobile 3D Scanning

**Amazon Seller App Features:**
- Built-in 3D scanning capability
- Photogrammetry-based reconstruction
- Automatic model generation
- Free for Amazon sellers
- Direct upload to catalog

### Integration Workflow

**1. Initiate Scan:**
```javascript
// Deep link to Amazon Seller app
const deepLink = `amazonseller://scan3d?productId=${productId}&callback=${callbackUrl}`;

// Or use web API
async function initiateScan(productId) {
  const response = await fetch('https://api.amazon.com/seller/v1/3d-scan', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      product_id: productId,
      callback_url: `${process.env.API_URL}/webhooks/amazon-scan-complete`
    })
  });
  
  return response.json();
}
```

**2. Handle Scan Completion:**
```javascript
// Webhook handler
app.post('/webhooks/amazon-scan-complete', async (req, res) => {
  const { productId, scanId, modelUrl } = req.body;
  
  // Download model from Amazon
  const modelData = await downloadFromAmazon(modelUrl);
  
  // Process and optimize
  const optimizedModel = await optimizeModel(modelData);
  
  // Store in our system
  await updateProductModel(productId, optimizedModel);
  
  // Sync back to Amazon
  await syncProductToAmazon(productId);
  
  res.json({ success: true });
});
```

### Quality Control

**Validate Scanned Models:**
```javascript
async function validateScannedModel(modelUrl) {
  // Download and inspect
  const model = await loadModel(modelUrl);
  
  const checks = {
    hasGeometry: model.meshes.length > 0,
    hasMaterials: model.materials.length > 0,
    polygonCount: model.polygonCount < 100000, // Reasonable limit
    fileSize: model.fileSize < 10 * 1024 * 1024, // 10MB limit
    isValidGLB: await validateGLB(model)
  };
  
  const isValid = Object.values(checks).every(check => check === true);
  
  return { isValid, checks };
}
```

---

## 4.4 The 3D Readiness Index

### What is the 3D Readiness Index?

**Purpose:**
- Identify SKUs with highest ROI for 3D implementation
- Prioritize catalog conversion
- Estimate business impact
- Optimize resource allocation

### Scoring Factors

**1. Sales Volume (40% weight)**
```javascript
function calculateSalesScore(product) {
  const monthlyRevenue = product.monthlyRevenue;
  const maxRevenue = 100000; // Top product revenue
  
  return Math.min(monthlyRevenue / maxRevenue, 1) * 0.4;
}
```

**2. Conversion Rate (30% weight)**
```javascript
function calculateConversionScore(product) {
  const currentConversion = product.conversionRate;
  const baselineConversion = 0.02; // 2% baseline
  
  // Products with lower conversion benefit more from 3D
  const improvementPotential = Math.max(0, (baselineConversion - currentConversion) / baselineConversion);
  
  return improvementPotential * 0.3;
}
```

**3. Product Complexity (20% weight)**
```javascript
function calculateComplexityScore(product) {
  // Complex products benefit more from 3D visualization
  const factors = {
    hasMultipleVariants: product.variants.length > 1 ? 0.1 : 0,
    hasDimensions: product.dimensions ? 0.05 : 0,
    isFurniture: product.category === 'Furniture' ? 0.05 : 0,
    isElectronics: product.category === 'Electronics' ? 0.05 : 0
  };
  
  return Object.values(factors).reduce((a, b) => a + b, 0) * 0.2;
}
```

**4. Competition (10% weight)**
```javascript
function calculateCompetitionScore(product) {
  // If competitors have 3D, we need it too
  const competitorsWith3D = product.competitors.filter(c => c.has3D).length;
  const totalCompetitors = product.competitors.length;
  
  if (totalCompetitors === 0) return 0;
  
  const competitivePressure = competitorsWith3D / totalCompetitors;
  return competitivePressure * 0.1;
}
```

### Complete Readiness Score

```javascript
function calculate3DReadinessIndex(product) {
  const scores = {
    sales: calculateSalesScore(product),
    conversion: calculateConversionScore(product),
    complexity: calculateComplexityScore(product),
    competition: calculateCompetitionScore(product)
  };
  
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  
  return {
    totalScore,
    breakdown: scores,
    recommendation: totalScore > 0.6 ? 'high' : totalScore > 0.3 ? 'medium' : 'low'
  };
}
```

### Catalog Audit

**Batch Analysis:**
```javascript
async function auditCatalog() {
  const products = await Product.find({});
  const results = [];
  
  for (const product of products) {
    const readiness = calculate3DReadinessIndex(product);
    
    results.push({
      productId: product._id,
      asin: product.asin,
      title: product.title,
      readinessScore: readiness.totalScore,
      recommendation: readiness.recommendation,
      estimatedROI: calculateEstimatedROI(product, readiness),
      priority: readiness.totalScore > 0.6 ? 'high' : readiness.totalScore > 0.3 ? 'medium' : 'low'
    });
  }
  
  // Sort by priority
  results.sort((a, b) => b.readinessScore - a.readinessScore);
  
  return results;
}
```

### ROI Estimation

```javascript
function calculateEstimatedROI(product, readiness) {
  const currentRevenue = product.monthlyRevenue * 12;
  const conversionLift = 0.09; // 9% average sales lift
  const conversionMultiplier = 2.0; // 2x conversion improvement
  
  const revenueIncrease = currentRevenue * conversionLift;
  const conversionIncrease = currentRevenue * (conversionMultiplier - 1) * 0.5; // Conservative
  
  const totalRevenueIncrease = revenueIncrease + conversionIncrease;
  const implementationCost = 200; // $200 per product average
  
  const roi = ((totalRevenueIncrease - implementationCost) / implementationCost) * 100;
  const paybackMonths = implementationCost / (totalRevenueIncrease / 12);
  
  return {
    revenueIncrease,
    implementationCost,
    roi,
    paybackMonths
  };
}
```

---

## Lab 4: Integrate with Amazon Selling Partner API

### Objective
Build integration with Amazon SP-API to sync 3D assets to product catalog.

### Tasks

1. **API Setup (2 hours)**
   - Create Amazon Developer account
   - Register application
   - Set up OAuth 2.0 authentication
   - Test API connection

2. **Catalog Integration (2 hours)**
   - Implement product lookup by ASIN
   - Create ASIN mapping system
   - Build sync function
   - Handle errors and retries

3. **3D Asset Upload (1 hour)**
   - Upload GLB to Amazon CDN
   - Update catalog with 3D asset URLs
   - Verify sync status

4. **Readiness Index (1 hour)**
   - Implement scoring algorithm
   - Build catalog audit function
   - Generate priority report

### Deliverables

1. **API Integration**
   - Working SP-API client
   - Authentication flow
   - Product sync functionality
   - Error handling

2. **3D Readiness Dashboard**
   - Catalog audit results
   - Priority rankings
   - ROI estimates
   - Implementation recommendations

3. **Documentation**
   - API setup guide
   - Integration documentation
   - Troubleshooting guide

### Evaluation Criteria

- **API Integration (40%):** Successfully sync products
- **Readiness Index (30%):** Accurate scoring and prioritization
- **Error Handling (20%):** Robust error handling and retries
- **Documentation (10%):** Clear setup and usage docs

### Resources

- [Amazon Selling Partner API Docs](https://developer-docs.amazon.com/sp-api/)
- [SP-API Postman Collection](https://github.com/amzn/selling-partner-api-models)
- [OAuth 2.0 Guide](https://developer-docs.amazon.com/sp-api/docs/registering-your-application)

---

## Key Takeaways

✅ **Amazon SP-API enables programmatic catalog management**  
✅ **Automated sync workflows scale to thousands of products**  
✅ **Mobile 3D scanning provides free entry point for sellers**  
✅ **3D Readiness Index prioritizes high-ROI SKUs**  
✅ **Proper prioritization maximizes business impact**

---

## Next Steps

- Complete Lab 4: Amazon Integration
- Review Module 5: Advanced Monetization
- Explore video shopping opportunities
- Prepare for advanced features

---

**Ready for advanced features? Let's move to [Module 5: Advanced Monetization: Cinematic Capitalism →](Module_05_Advanced_Monetization_Cinematic_Capitalism.md)**
