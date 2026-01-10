---
title: "Module 7: Compliance, Audit, & Defense"
description: "Create an immutable traceability layer for regulatory compliance"
module: "7"
order: 7
---

# Module 7: Compliance, Audit, & Defense

**Duration:** Week 7  
**Tool Focus:** CertifAI  
**Learning Objectives:**
- Generate immutable audit logs for every asset
- Implement forensic provenance with cryptographic methods
- Automate defensive disclosure with persistent labels
- Ensure compliance with EU AI Act and IT Rules

---

## 7.1 The Synthetic Media Audit Log: Permanent Records

### The Requirement: Immutable Traceability

Every synthetic media asset must have a permanent, immutable record that includes:
- Source Truth IDs
- Script hashes
- Timestamped approver identities
- Model versions used
- Processing steps

### Audit Log Architecture

**Implementation:**

```python
class SyntheticMediaAuditLog:
    """
    Immutable audit log for synthetic media assets
    """
    def __init__(self):
        self.blockchain = BlockchainStorage()  # Immutable storage
        self.hasher = CryptographicHasher()
    
    def create_audit_record(self, asset_id, production_data):
        """
        Create immutable audit record
        """
        # Generate audit record
        audit_record = {
            'asset_id': asset_id,
            'timestamp': datetime.now().isoformat(),
            'source_truth_ids': production_data['source_truth_ids'],
            'script_hash': self.hasher.hash(production_data['script']),
            'approvers': production_data['approvers'],
            'model_version': production_data['model_version'],
            'pipeline_version': production_data['pipeline_version'],
            'processing_steps': production_data['processing_steps'],
            'persona_id': production_data['persona_id'],
            'consent_id': production_data['consent_id'],
            'governance_rules_applied': production_data['governance_rules'],
            'compliance_checks': production_data['compliance_checks']
        }
        
        # Create cryptographic hash of record
        record_hash = self.hasher.hash(json.dumps(audit_record, sort_keys=True))
        audit_record['record_hash'] = record_hash
        
        # Store in immutable storage
        block_id = self.blockchain.append(audit_record)
        
        return {
            'audit_record_id': block_id,
            'record_hash': record_hash,
            'timestamp': audit_record['timestamp']
        }
    
    def retrieve_audit_record(self, asset_id):
        """
        Retrieve audit record for asset
        """
        # Query blockchain
        records = self.blockchain.query({'asset_id': asset_id})
        
        if not records:
            return None
        
        # Verify integrity
        for record in records:
            # Recalculate hash
            record_copy = record.copy()
            record_copy.pop('record_hash', None)
            calculated_hash = self.hasher.hash(
                json.dumps(record_copy, sort_keys=True)
            )
            
            # Verify
            if calculated_hash != record['record_hash']:
                raise IntegrityError("Audit record has been tampered with")
        
        return records
```

### Timestamped Approver Identities

**Implementation:**

```python
class ApproverTracking:
    """
    Track approver identities with timestamps
    """
    def record_approval(self, asset_id, approver_id, approval_data):
        """
        Record approval with cryptographic signature
        """
        approval_record = {
            'asset_id': asset_id,
            'approver_id': approver_id,
            'approver_name': self._get_approver_name(approver_id),
            'approver_role': self._get_approver_role(approver_id),
            'timestamp': datetime.now().isoformat(),
            'approval_type': approval_data['type'],
            'approval_decision': approval_data['decision'],
            'comments': approval_data.get('comments', ''),
            'ip_address': approval_data.get('ip_address'),
            'user_agent': approval_data.get('user_agent')
        }
        
        # Cryptographic signature
        signature = self._sign_record(approval_record, approver_id)
        approval_record['signature'] = signature
        
        # Store in audit log
        self.audit_log.append_approval(approval_record)
        
        return {
            'approval_id': approval_record['id'],
            'timestamp': approval_record['timestamp'],
            'signature': signature
        }
    
    def _sign_record(self, record, approver_id):
        """
        Create cryptographic signature
        """
        # Get approver's private key
        private_key = self._get_approver_key(approver_id)
        
        # Sign record
        record_json = json.dumps(record, sort_keys=True)
        signature = self._cryptographic_sign(record_json, private_key)
        
        return signature
```

### Source Truth Tracking

**Implementation:**

```python
class SourceTruthTracker:
    """
    Track source truth IDs for every claim
    """
    def track_source_truth(self, asset_id, claims):
        """
        Track source truth for all claims in asset
        """
        source_truth_records = []
        
        for claim in claims:
            source_truth_id = claim.get('source_truth_id')
            
            if not source_truth_id:
                # Claim without source truth - flag for review
                source_truth_records.append({
                    'claim': claim,
                    'source_truth_id': None,
                    'status': 'missing',
                    'requires_review': True
                })
                continue
            
            # Load source truth data
            source_data = self._load_source_truth(source_truth_id)
            
            source_truth_records.append({
                'claim': claim,
                'source_truth_id': source_truth_id,
                'source_data': source_data,
                'verified': source_data is not None,
                'timestamp': datetime.now().isoformat()
            })
        
        # Store in audit log
        self.audit_log.append_source_truth(asset_id, source_truth_records)
        
        return source_truth_records
```

---

## 7.2 Forensic Provenance: Cryptographic Methods

### The Requirement: Prove AI Involvement

Regulations (EU AI Act, IT Rules) require that AI-generated content be identifiable. Cryptographic provenance provides machine-readable proof.

### Cryptographic Watermarking

**Implementation:**

```python
class CryptographicWatermark:
    """
    Embed cryptographic watermark in video
    """
    def embed_watermark(self, video_asset, metadata):
        """
        Embed invisible cryptographic watermark
        """
        # Generate watermark data
        watermark_data = {
            'asset_id': video_asset['id'],
            'synthetic': True,
            'model_version': metadata['model_version'],
            'generation_date': datetime.now().isoformat(),
            'persona_id': metadata['persona_id'],
            'consent_id': metadata['consent_id']
        }
        
        # Create cryptographic hash
        watermark_hash = self.hasher.hash(json.dumps(watermark_data))
        
        # Embed in video (invisible)
        watermarked_video = self._embed_in_video(
            video_asset['video'],
            watermark_hash,
            method='dct'  # Discrete Cosine Transform
        )
        
        return {
            'watermarked_video': watermarked_video,
            'watermark_hash': watermark_hash,
            'watermark_data': watermark_data
        }
    
    def verify_watermark(self, video_file):
        """
        Verify and extract watermark
        """
        # Extract watermark from video
        extracted_hash = self._extract_from_video(video_file, method='dct')
        
        # Verify against audit log
        verification = self._verify_against_audit_log(extracted_hash)
        
        return {
            'watermark_detected': extracted_hash is not None,
            'verified': verification['verified'],
            'asset_id': verification.get('asset_id'),
            'synthetic': verification.get('synthetic', False)
        }
```

### Metadata Tagging

**Implementation:**

```python
class MetadataTagger:
    """
    Add machine-readable metadata tags
    """
    def add_metadata_tags(self, video_asset, metadata):
        """
        Add metadata tags to video file
        """
        # C2PA (Coalition for Content Provenance and Authenticity) format
        c2pa_manifest = {
            'claim_generator': 'SyntheticMediaSystem',
            'claim_generator_info': [
                {
                    'name': 'Synthetic Media Platform',
                    'version': '1.0'
                }
            ],
            'assertions': [
                {
                    'label': 'c2pa.synthetic',
                    'data': {
                        'synthetic': True,
                        'model': metadata['model_version'],
                        'persona': metadata['persona_id'],
                        'generation_date': datetime.now().isoformat()
                    }
                },
                {
                    'label': 'c2pa.actions',
                    'data': {
                        'actions': [
                            {
                                'action': 'generated',
                                'softwareAgent': 'SyntheticMediaSystem',
                                'when': datetime.now().isoformat()
                            }
                        ]
                    }
                }
            ]
        }
        
        # Embed in video file
        tagged_video = self._embed_c2pa_manifest(
            video_asset['video'],
            c2pa_manifest
        )
        
        return {
            'tagged_video': tagged_video,
            'manifest': c2pa_manifest
        }
```

### Machine-Readable Marks

**Implementation:**

```python
class MachineReadableMarks:
    """
    Add machine-readable marks for AI identification
    """
    def add_marks(self, video_asset):
        """
        Add visible and machine-readable marks
        """
        marks = {
            'visible_label': {
                'text': 'AI-Generated Content',
                'position': 'bottom_right',
                'persistent': True,
                'unskippable': True
            },
            'qr_code': {
                'data': {
                    'asset_id': video_asset['id'],
                    'verification_url': f'https://verify.example.com/{video_asset["id"]}',
                    'synthetic': True
                },
                'position': 'bottom_left',
                'size': 'small'
            },
            'invisible_watermark': {
                'hash': self._generate_watermark_hash(video_asset),
                'method': 'steganography'
            }
        }
        
        # Apply marks to video
        marked_video = self._apply_marks(video_asset['video'], marks)
        
        return {
            'marked_video': marked_video,
            'marks': marks
        }
```

---

## 7.3 Defensive Disclosure: Persistent Labels

### The Requirement: Unskippable Identification

EU AI Act and IT Rules require that AI-generated content be clearly identified. Defensive disclosure ensures persistent, unskippable labels.

### Persistent Label System

**Implementation:**

```python
class DefensiveDisclosure:
    """
    Automatically apply persistent labels identifying AI content
    """
    def apply_label(self, video_asset, label_config):
        """
        Apply persistent label to video
        """
        label = {
            'text': label_config.get('text', 'AI-Generated Content'),
            'position': label_config.get('position', 'bottom_right'),
            'style': {
                'font_size': label_config.get('font_size', 14),
                'font_color': label_config.get('font_color', '#FFFFFF'),
                'background_color': label_config.get('background_color', '#000000'),
                'opacity': label_config.get('opacity', 0.8),
                'padding': label_config.get('padding', 5)
            },
            'persistent': True,  # Cannot be removed
            'unskippable': True,  # Must be visible
            'duration': 'entire_video'  # Entire duration
        }
        
        # Apply label to all frames
        labeled_video = self._apply_to_all_frames(
            video_asset['video'],
            label
        )
        
        return {
            'labeled_video': labeled_video,
            'label': label
        }
    
    def _apply_to_all_frames(self, video, label):
        """
        Apply label to every frame
        """
        labeled_frames = []
        
        for frame in video['frames']:
            # Render label on frame
            labeled_frame = self._render_label_on_frame(frame, label)
            labeled_frames.append(labeled_frame)
        
        return {
            'frames': labeled_frames,
            'fps': video['fps'],
            'duration': video['duration']
        }
```

### Unskippable Label Enforcement

**Implementation:**

```python
class UnskippableLabelEnforcer:
    """
    Ensure labels cannot be skipped or removed
    """
    def enforce_unskippable(self, video_asset, label):
        """
        Make label unskippable
        """
        # Embed label in video stream (not as overlay)
        embedded_video = self._embed_in_stream(video_asset['video'], label)
        
        # Add verification checksum
        checksum = self._calculate_checksum(embedded_video)
        
        # Store checksum in audit log
        self.audit_log.record_label_checksum(
            video_asset['id'],
            checksum
        )
        
        return {
            'embedded_video': embedded_video,
            'checksum': checksum,
            'verification': self._create_verification_url(video_asset['id'])
        }
    
    def verify_label_presence(self, video_file):
        """
        Verify that label is still present
        """
        # Extract label from video
        extracted_label = self._extract_label(video_file)
        
        # Verify checksum
        calculated_checksum = self._calculate_checksum(video_file)
        stored_checksum = self.audit_log.get_label_checksum(video_file['asset_id'])
        
        label_present = extracted_label is not None
        checksum_valid = calculated_checksum == stored_checksum
        
        return {
            'label_present': label_present,
            'checksum_valid': checksum_valid,
            'verified': label_present and checksum_valid
        }
```

### Regulatory Compliance Automation

**Implementation:**

```python
class RegulatoryCompliance:
    """
    Automate compliance with EU AI Act and IT Rules
    """
    def check_compliance(self, video_asset):
        """
        Check compliance with all applicable regulations
        """
        compliance_results = {
            'eu_ai_act': self._check_eu_ai_act(video_asset),
            'it_rules_india': self._check_it_rules(video_asset),
            'gdpr': self._check_gdpr(video_asset)
        }
        
        all_compliant = all(
            result['compliant'] 
            for result in compliance_results.values()
        )
        
        return {
            'compliant': all_compliant,
            'results': compliance_results,
            'violations': [
                {'regulation': reg, 'violations': result['violations']}
                for reg, result in compliance_results.items()
                if not result['compliant']
            ]
        }
    
    def _check_eu_ai_act(self, video_asset):
        """
        Check EU AI Act compliance
        """
        violations = []
        
        # Check 1: AI content must be identified
        if not self._has_ai_identification(video_asset):
            violations.append('missing_ai_identification')
        
        # Check 2: Deepfake content must be clearly labeled
        if video_asset.get('is_deepfake') and not self._has_deepfake_label(video_asset):
            violations.append('missing_deepfake_label')
        
        # Check 3: Consent must be documented
        if not video_asset.get('consent_id'):
            violations.append('missing_consent_documentation')
        
        # Check 4: Audit trail must exist
        if not self.audit_log.has_record(video_asset['id']):
            violations.append('missing_audit_trail')
        
        return {
            'compliant': len(violations) == 0,
            'violations': violations
        }
    
    def _check_it_rules(self, video_asset):
        """
        Check IT Rules (India) compliance
        """
        violations = []
        
        # Check 1: Must identify as AI-generated
        if not self._has_ai_identification(video_asset):
            violations.append('missing_ai_identification')
        
        # Check 2: Must have metadata
        if not self._has_metadata(video_asset):
            violations.append('missing_metadata')
        
        # Check 3: Must be traceable
        if not self._is_traceable(video_asset):
            violations.append('not_traceable')
        
        return {
            'compliant': len(violations) == 0,
            'violations': violations
        }
```

---

## Key Takeaways

**Synthetic Media Audit Log:**
- Immutable records for every asset
- Source truth IDs tracked
- Script hashes for verification
- Timestamped approver identities
- Blockchain storage for immutability

**Forensic Provenance:**
- Cryptographic watermarks embedded
- C2PA metadata tags
- Machine-readable marks
- Verification systems

**Defensive Disclosure:**
- Persistent, unskippable labels
- Embedded in video stream
- Regulatory compliance automation
- EU AI Act and IT Rules support

---

## Lab 7: Build a Complete Compliance and Audit System

**Objective:** Create a comprehensive compliance system with audit logging, forensic provenance, and defensive disclosure.

**Requirements:**
1. Implement immutable audit log system
2. Create cryptographic watermarking
3. Build metadata tagging (C2PA)
4. Implement defensive disclosure labels
5. Add regulatory compliance checks

**Deliverables:**
- Working Python implementation
- Audit log system
- Watermarking system
- Label application system
- Compliance checker
- Test results
- Documentation (500 words)

**Evaluation Criteria:**
- Audit log implementation (30%)
- Forensic provenance (25%)
- Defensive disclosure (25%)
- Code quality and testing (20%)

**Time Estimate:** 6-7 hours

---

## Additional Resources

**Readings:**
- "EU AI Act: Requirements for Synthetic Media" - Regulatory guide
- "IT Rules (India): AI Content Identification" - Compliance guide
- "C2PA Specification" - Technical standard
- "Forensic Provenance in Digital Media" - Best practices

**Tools to Explore:**
- CertifAI documentation
- C2PA libraries
- Cryptographic watermarking tools
- Blockchain storage systems

**Course Complete!** 🎉

---

**Module 7 Complete** ✓  
**Course Complete** 🎓

**Congratulations on completing the Synthetic Media Systems Architecture course!**
