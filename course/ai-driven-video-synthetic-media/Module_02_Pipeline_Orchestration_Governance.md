---
title: "Module 2: Pipeline Orchestration & Governance"
description: "Design a headless production factory that treats video as code"
module: "2"
order: 2
---

# Module 2: Pipeline Orchestration & Governance

**Duration:** Week 2  
**Tool Focus:** RenderOps  
**Learning Objectives:**
- **deterministic video production Development**: Design deterministic video production pipelines
- **governance-as-code principles Implementation**: Implement governance-as-code principles
- **centralized orchestrator for content routing Development**: Build centralized orchestrator for content routing
- **pipelines Integration**: Connect pipelines to source truth systems (PIM, legal databases)

---

## 2.1 Deterministic Assembly: Pre-Approved Envelopes

### The Philosophy: Video as Code

Traditional video production is artistic and non-deterministic. Synthetic media production must be **deterministic**—identical inputs produce identical outputs, enabling governance, reproducibility, and compliance.

**Key Principles:**
- **Humans Define Truth:** Content creators specify what should be said/shown
- **Automation Executes:** Systems render within pre-approved parameters
- **Deterministic Outputs:** Same inputs = same outputs (no randomness)
- **Governance Enforced:** All content must pass through approval gates

### Pre-Approved Envelopes

**Definition:** A set of pre-approved parameters within which automated systems can operate without additional human approval.

**Components of an Envelope:**
- Script templates (pre-approved language)
- Visual parameters (camera angles, lighting)
- Persona selection (approved personas only)
- Duration limits
- Content restrictions
- Compliance rules

**Implementation:**

```python
class ApprovalEnvelope:
    """
    Defines pre-approved parameters for automated production
    """
    def __init__(self, envelope_id, config):
        self.envelope_id = envelope_id
        self.config = {
            'script_templates': config.get('script_templates', []),
            'approved_personas': config.get('approved_personas', []),
            'visual_parameters': config.get('visual_parameters', {}),
            'duration_limits': config.get('duration_limits', {}),
            'content_restrictions': config.get('content_restrictions', []),
            'compliance_rules': config.get('compliance_rules', [])
        }
    
    def validate_request(self, production_request):
        """
        Check if request fits within envelope
        """
        violations = []
        
        # Check script template
        if not self._script_matches_template(
            production_request['script'],
            self.config['script_templates']
        ):
            violations.append('script_not_pre_approved')
        
        # Check persona
        if production_request['persona_id'] not in self.config['approved_personas']:
            violations.append('persona_not_approved')
        
        # Check visual parameters
        if not self._visual_params_within_bounds(
            production_request['visual_params'],
            self.config['visual_parameters']
        ):
            violations.append('visual_params_out_of_bounds')
        
        # Check duration
        if production_request['duration'] > self.config['duration_limits'].get('max', 300):
            violations.append('duration_exceeds_limit')
        
        # Check content restrictions
        if self._violates_content_restrictions(
            production_request['script'],
            self.config['content_restrictions']
        ):
            violations.append('content_restriction_violation')
        
        return {
            'approved': len(violations) == 0,
            'violations': violations,
            'envelope_id': self.envelope_id
        }
    
    def _script_matches_template(self, script, templates):
        """
        Check if script matches any pre-approved template
        """
        for template in templates:
            if self._matches_template_pattern(script, template):
                return True
        return False
```

### Deterministic Workflow Design

**Core Concept:** Every production request follows the same deterministic path.

```python
class DeterministicPipeline:
    """
    Deterministic video production pipeline
    """
    def __init__(self):
        self.envelope_manager = EnvelopeManager()
        self.render_engine = RenderEngine()
        self.validator = ContentValidator()
    
    def process(self, production_request):
        """
        Process production request deterministically
        """
        # Step 1: Validate against envelope
        envelope_check = self.envelope_manager.validate(
            production_request
        )
        
        if not envelope_check['approved']:
            return {
                'status': 'rejected',
                'reason': 'outside_envelope',
                'violations': envelope_check['violations']
            }
        
        # Step 2: Generate deterministic script hash
        script_hash = self._hash_script(production_request['script'])
        
        # Step 3: Check cache (deterministic = cacheable)
        cached_result = self._check_cache(script_hash, production_request)
        if cached_result:
            return {
                'status': 'cached',
                'asset_id': cached_result['asset_id']
            }
        
        # Step 4: Render with fixed parameters
        render_params = self._extract_render_params(
            production_request,
            envelope_check['envelope']
        )
        
        # Step 5: Execute render (deterministic)
        render_result = self.render_engine.render(
            script=production_request['script'],
            persona_id=production_request['persona_id'],
            params=render_params,
            deterministic=True  # No randomness
        )
        
        # Step 6: Validate output
        validation = self.validator.validate(render_result)
        
        if not validation['passed']:
            return {
                'status': 'failed_validation',
                'errors': validation['errors']
            }
        
        # Step 7: Store with hash for future cache lookups
        asset_id = self._store_asset(
            render_result,
            script_hash,
            production_request
        )
        
        return {
            'status': 'success',
            'asset_id': asset_id,
            'script_hash': script_hash
        }
    
    def _hash_script(self, script):
        """
        Create deterministic hash of script
        """
        import hashlib
        normalized = script.lower().strip()
        return hashlib.sha256(normalized.encode()).hexdigest()
```

### Governance-as-Code

**Definition:** Governance rules expressed as code, version-controlled and automatically enforced.

**Implementation:**

```python
class GovernanceRules:
    """
    Governance rules as code
    """
    RULES = {
        'max_duration': {
            'class_a': 300,  # 5 minutes
            'class_b': 600,  # 10 minutes
            'class_c': 900   # 15 minutes
        },
        'required_approvers': {
            'class_a': 3,
            'class_b': 1,
            'class_c': 0
        },
        'content_restrictions': {
            'prohibited_words': ['guarantee', 'promise', 'cure'],
            'required_disclaimers': ['ai_generated', 'synthetic_media']
        },
        'compliance_checks': [
            'eu_ai_act',
            'it_rules_india',
            'gdpr'
        ]
    }
    
    def validate(self, production_request, persona_class):
        """
        Apply governance rules
        """
        violations = []
        
        # Check duration
        max_duration = self.RULES['max_duration'][persona_class]
        if production_request['duration'] > max_duration:
            violations.append({
                'rule': 'max_duration',
                'limit': max_duration,
                'actual': production_request['duration']
            })
        
        # Check prohibited words
        script_lower = production_request['script'].lower()
        for word in self.RULES['content_restrictions']['prohibited_words']:
            if word in script_lower:
                violations.append({
                    'rule': 'prohibited_word',
                    'word': word
                })
        
        # Check required disclaimers
        for disclaimer in self.RULES['content_restrictions']['required_disclaimers']:
            if disclaimer not in script_lower:
                violations.append({
                    'rule': 'missing_disclaimer',
                    'disclaimer': disclaimer
                })
        
        return {
            'passed': len(violations) == 0,
            'violations': violations
        }
```

---

## 2.2 The Orchestrator Role: Central Control Plane

### Architecture: Centralized Orchestration

The orchestrator routes content through appropriate pipelines based on risk level, content type, and compliance requirements.

**Orchestrator Responsibilities:**
- Route requests to appropriate pipeline
- Enforce governance rules
- Manage approval workflows
- Monitor pipeline health
- Handle errors and escalations

**Implementation:**

```python
class RenderOpsOrchestrator:
    """
    Central control plane for video production
    """
    def __init__(self):
        self.pipelines = {
            'class_a': ClassAPipeline(),
            'class_b': ClassBPipeline(),
            'class_c': ClassCPipeline(),
            'blender': BlenderPipeline(),  # High-stakes, rigid pipeline
            'batch': BatchPipeline()       # Low-risk, automated
        }
        self.governance = GovernanceRules()
        self.approval_workflow = ApprovalWorkflow()
    
    def route_request(self, production_request):
        """
        Route production request to appropriate pipeline
        """
        # Step 1: Classify persona
        persona_class = self._classify_persona(
            production_request['persona_id']
        )
        
        # Step 2: Determine pipeline
        pipeline_type = self._select_pipeline(
            persona_class,
            production_request
        )
        
        # Step 3: Apply governance
        governance_check = self.governance.validate(
            production_request,
            persona_class
        )
        
        if not governance_check['passed']:
            return {
                'status': 'governance_violation',
                'violations': governance_check['violations']
            }
        
        # Step 4: Check approval requirements
        approval_required = self._requires_approval(
            persona_class,
            production_request
        )
        
        if approval_required:
            # Route through approval workflow
            approval_result = self.approval_workflow.initiate(
                production_request,
                persona_class
            )
            
            if not approval_result['approved']:
                return {
                    'status': 'approval_required',
                    'workflow_id': approval_result['workflow_id']
                }
        
        # Step 5: Route to pipeline
        pipeline = self.pipelines[pipeline_type]
        result = pipeline.process(production_request)
        
        return result
    
    def _select_pipeline(self, persona_class, request):
        """
        Select appropriate pipeline based on risk and requirements
        """
        # Class A: Always use rigid Blender pipeline
        if persona_class == 'Class A':
            return 'blender'
        
        # High-stakes content: Use Blender
        if request.get('high_stakes', False):
            return 'blender'
        
        # Batch/low-risk: Use automated batch pipeline
        if request.get('batch_mode', False) and persona_class in ['Class B', 'Class C']:
            return 'batch'
        
        # Default: Use class-specific pipeline
        return f'class_{persona_class[-1].lower()}'
```

### Blender-Based Pipeline (High-Stakes)

**Purpose:** Rigid, deterministic pipeline for Class A content and high-stakes scenarios.

**Characteristics:**
- Pre-defined 3D scenes
- Fixed camera angles
- Controlled lighting
- Deterministic rendering
- Enhanced validation

**Implementation:**

```python
class BlenderPipeline:
    """
    Rigid Blender-based pipeline for high-stakes content
    """
    def __init__(self):
        self.blender_engine = BlenderEngine()
        self.scene_templates = SceneTemplateManager()
    
    def process(self, production_request):
        """
        Process through rigid Blender pipeline
        """
        # Step 1: Load pre-approved scene template
        scene_template = self.scene_templates.get_template(
            production_request['scene_type']
        )
        
        # Step 2: Apply script to scene
        scene = self._apply_script_to_scene(
            scene_template,
            production_request['script']
        )
        
        # Step 3: Render with fixed parameters
        render_params = {
            'resolution': (1920, 1080),
            'fps': 30,
            'camera_angle': scene_template['camera_angle'],
            'lighting': scene_template['lighting'],
            'deterministic': True
        }
        
        # Step 4: Execute Blender render
        video_asset = self.blender_engine.render(
            scene,
            render_params
        )
        
        # Step 5: Enhanced validation
        validation = self._enhanced_validation(video_asset)
        
        if not validation['passed']:
            return {
                'status': 'validation_failed',
                'errors': validation['errors']
            }
        
        return {
            'status': 'success',
            'asset_id': video_asset['id'],
            'pipeline': 'blender'
        }
```

### Batch Pipeline (Low-Risk Automation)

**Purpose:** Automated pipeline for high-volume, low-risk content generation.

**Characteristics:**
- Automated processing
- Template-based generation
- Minimal human intervention
- High throughput

**Implementation:**

```python
class BatchPipeline:
    """
    Automated batch pipeline for low-risk content
    """
    def __init__(self):
        self.template_engine = TemplateEngine()
        self.render_service = RenderService()
    
    def process_batch(self, production_requests):
        """
        Process multiple requests in batch
        """
        results = []
        
        for request in production_requests:
            # Quick validation
            if not self._quick_validate(request):
                results.append({
                    'request_id': request['id'],
                    'status': 'validation_failed'
                })
                continue
            
            # Generate from template
            video_asset = self.template_engine.generate(
                request['template_id'],
                request['variables']
            )
            
            results.append({
                'request_id': request['id'],
                'status': 'success',
                'asset_id': video_asset['id']
            })
        
        return {
            'batch_id': self._generate_batch_id(),
            'results': results,
            'total': len(production_requests),
            'successful': sum(1 for r in results if r['status'] == 'success')
        }
```

---

## 2.3 Source Truth Ingestion: PIM and Legal Database Integration

### The Problem: Unverified Claims

Synthetic media must only make claims that can be verified against authoritative sources. Connecting directly to Product Information Management (PIM) systems and legal databases ensures content accuracy.

### Source Truth Architecture

**Components:**
- PIM Integration (product data)
- Legal Database (approved claims)
- Content Verification Service
- Source Attribution System

**Implementation:**

```python
class SourceTruthIngestion:
    """
    Connect pipeline to source truth systems
    """
    def __init__(self):
        self.pim_client = PIMClient()
        self.legal_db = LegalDatabase()
        self.verifier = ContentVerifier()
    
    def verify_script(self, script, content_type):
        """
        Verify script against source truth
        """
        # Extract claims from script
        claims = self._extract_claims(script)
        
        verification_results = []
        
        for claim in claims:
            # Check against PIM (product data)
            if claim['type'] == 'product_claim':
                pim_verification = self.pim_client.verify(
                    claim['product_id'],
                    claim['attribute'],
                    claim['value']
                )
                verification_results.append({
                    'claim': claim,
                    'source': 'pim',
                    'verified': pim_verification['verified'],
                    'source_data': pim_verification['data']
                })
            
            # Check against legal database (approved claims)
            elif claim['type'] == 'legal_claim':
                legal_verification = self.legal_db.verify(
                    claim['claim_text']
                )
                verification_results.append({
                    'claim': claim,
                    'source': 'legal_db',
                    'verified': legal_verification['approved'],
                    'approval_id': legal_verification.get('approval_id')
                })
        
        # Determine overall verification status
        all_verified = all(r['verified'] for r in verification_results)
        
        return {
            'verified': all_verified,
            'results': verification_results,
            'rejected_claims': [
                r['claim'] for r in verification_results 
                if not r['verified']
            ]
        }
    
    def _extract_claims(self, script):
        """
        Extract verifiable claims from script
        """
        # Use NLP to identify claims
        claims = []
        
        # Product claims (e.g., "This product weighs 2kg")
        product_patterns = [
            r'this product (?:is|has|weighs|contains) (.+)',
            r'product (?:features|includes) (.+)'
        ]
        
        # Legal claims (e.g., "FDA approved")
        legal_patterns = [
            r'(?:approved|certified|compliant) by (.+)',
            r'meets (.+) standards'
        ]
        
        # Extract matches
        for pattern in product_patterns:
            matches = re.findall(pattern, script, re.IGNORECASE)
            for match in matches:
                claims.append({
                    'type': 'product_claim',
                    'text': match,
                    'attribute': self._extract_attribute(match),
                    'value': self._extract_value(match)
                })
        
        for pattern in legal_patterns:
            matches = re.findall(pattern, script, re.IGNORECASE)
            for match in matches:
                claims.append({
                    'type': 'legal_claim',
                    'text': match,
                    'claim_text': match
                })
        
        return claims
```

### PIM Integration

**Product Information Management (PIM) Systems:**
- Centralized product data
- Authoritative source of truth
- Real-time updates
- Multi-channel support

**Integration Example:**

```python
class PIMClient:
    """
    Client for Product Information Management system
    """
    def verify(self, product_id, attribute, claimed_value):
        """
        Verify product claim against PIM
        """
        # Fetch product data from PIM
        product_data = self._fetch_product(product_id)
        
        if not product_data:
            return {
                'verified': False,
                'reason': 'product_not_found'
            }
        
        # Check attribute value
        actual_value = product_data.get(attribute)
        
        if actual_value is None:
            return {
                'verified': False,
                'reason': 'attribute_not_found'
            }
        
        # Compare values
        verified = str(actual_value).lower() == str(claimed_value).lower()
        
        return {
            'verified': verified,
            'data': {
                'product_id': product_id,
                'attribute': attribute,
                'claimed_value': claimed_value,
                'actual_value': actual_value,
                'source': 'pim',
                'last_updated': product_data.get('last_updated')
            }
        }
    
    def _fetch_product(self, product_id):
        """
        Fetch product data from PIM API
        """
        response = requests.get(
            f'{self.pim_base_url}/products/{product_id}',
            headers={'Authorization': f'Bearer {self.api_key}'}
        )
        
        if response.status_code == 200:
            return response.json()
        return None
```

### Legal Database Integration

**Legal Database:**
- Pre-approved claims and statements
- Regulatory compliance data
- Disclaimers and required language
- Approval workflows

**Integration Example:**

```python
class LegalDatabase:
    """
    Client for legal claims database
    """
    def verify(self, claim_text):
        """
        Verify claim against legal database
        """
        # Search for approved claim
        approved_claim = self._search_approved_claims(claim_text)
        
        if approved_claim:
            return {
                'approved': True,
                'approval_id': approved_claim['id'],
                'approved_text': approved_claim['text'],
                'approved_by': approved_claim['approved_by'],
                'approved_at': approved_claim['approved_at']
            }
        
        # Check if similar claim exists (fuzzy match)
        similar_claims = self._find_similar_claims(claim_text)
        
        if similar_claims:
            return {
                'approved': False,
                'reason': 'similar_claim_exists_but_not_exact',
                'similar_claims': similar_claims,
                'requires_approval': True
            }
        
        # Claim not found - requires approval
        return {
            'approved': False,
            'reason': 'claim_not_in_database',
            'requires_approval': True
        }
```

### Rejection Workflow

**When Script Contains Unverified Claims:**

```python
class ScriptRejectionHandler:
    """
    Handle scripts with unverified claims
    """
    def handle_rejection(self, script, verification_results):
        """
        Process rejected script
        """
        rejected_claims = verification_results['rejected_claims']
        
        # Create rejection record
        rejection_record = {
            'script_id': script['id'],
            'rejected_at': datetime.now(),
            'rejected_claims': rejected_claims,
            'reason': 'unverified_claims',
            'requires_review': True
        }
        
        # Notify content creator
        self._notify_creator(script['creator_id'], rejection_record)
        
        # Route to approval workflow if needed
        if any(c.get('requires_approval') for c in rejected_claims):
            self._route_to_approval(script, rejected_claims)
        
        return rejection_record
```

---

## Key Takeaways

**Deterministic Assembly:**
- **Pre-Approved Envelopes**: Pre-approved envelopes enable automated production
- **Deterministic Outputs**: Deterministic outputs ensure reproducibility
- **Governance-As-Code Enforces**: Governance-as-code enforces rules automatically
- **Humans Define**: Humans define truth, automation executes

**Orchestrator Role:**
- **Central Control**: Central control plane routes content appropriately
- **Class A**: Class A content uses rigid Blender pipelines
- **Batch Processing**: Batch processing automates low-risk content
- **Risk-Based Routing**: Risk-based routing optimizes resources

**Source Truth Ingestion:**
- **Pim Integration**: PIM integration verifies product claims
- **Legal Database**: Legal database ensures approved language
- **Unverified Claims**: Unverified claims trigger rejection
- **Source Attribution**: Source attribution provides traceability

---

## Lab 2: Build a Governance-as-Code Pipeline Orchestrator

**Objective:** Create a complete pipeline orchestrator with governance rules and source truth integration.

**Requirements:**
1. Implement deterministic pipeline with pre-approved envelopes
2. Build orchestrator that routes by persona class
3. Create governance-as-code rules engine
4. Integrate with mock PIM and legal database
5. Implement approval workflows

**Deliverables:**
- Working Python implementation
- Governance rules configuration
- API endpoints for pipeline orchestration
- Integration tests
- Documentation (500 words)

**Evaluation Criteria:**
- Deterministic pipeline implementation (25%)
- Orchestrator routing logic (25%)
- Governance rules enforcement (25%)
- Code quality and testing (25%)

**Time Estimate:** 6-7 hours

---

## Additional Resources

**Readings:**
- "Deterministic Systems in Production" - Engineering practices
- "Governance-as-Code Patterns" - Best practices
- "PIM Integration Strategies" - Technical guides

**Tools to Explore:**
- RenderOps documentation
- Blender Python API
- PIM system APIs
- Workflow orchestration frameworks

**Next Module Preview:**
Module 3 will cover engineering cinematic realism through technical camera control and optical parameters.

---

**Module 2 Complete**   
**Next:** Module 3 - Engineering Cinematic Realism
