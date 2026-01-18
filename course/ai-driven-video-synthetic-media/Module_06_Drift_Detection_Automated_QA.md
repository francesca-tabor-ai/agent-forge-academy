---
title: "Module 6: Drift Detection & Automated QA"
description: "Implement machine-enforced compliance checks to detect slow decay or hallucinations"
module: "6"
order: 6
---

# Module 6: Drift Detection & Automated QA

**Duration:** Week 6  
**Tool Focus:** DriftGuard  
**Learning Objectives:**
- **automated checks for visual and auditory alignment Development**: Build automated checks for visual and auditory alignment
- **Detect Model**: Detect model version drift that alters persona appearance
- **fail-closed Implementation**: Implement fail-closed systems that halt on violations
- **Monitor For**: Monitor for "slow decay" in high-volume production

---

## 6.1 Visual and Auditory Alignment: 100% Precision Checks

### The Problem: Misalignment Creates Distrust

When spoken audio doesn't match on-screen text, or numeric data is incorrect, viewers lose trust. Automated alignment checks ensure 100% precision.

### Audio-Text Alignment

**Implementation:**

```python
class AudioTextAlignment:
    """
    Ensure spoken audio matches on-screen text with 100% precision
    """
    def __init__(self):
        self.speech_recognizer = SpeechRecognizer()
        self.text_extractor = TextExtractor()
        self.alignment_checker = AlignmentChecker()
    
    def validate_alignment(self, video_asset):
        """
        Validate audio-text alignment
        """
        # Extract audio
        audio = self._extract_audio(video_asset)
        
        # Extract on-screen text
        on_screen_text = self._extract_on_screen_text(video_asset)
        
        # Transcribe audio
        audio_transcript = self.speech_recognizer.transcribe(audio)
        
        # Align transcripts
        alignment = self.alignment_checker.align(
            audio_transcript,
            on_screen_text
        )
        
        # Check for mismatches
        mismatches = self._find_mismatches(alignment)
        
        return {
            'aligned': len(mismatches) == 0,
            'alignment_score': alignment['score'],
            'mismatches': mismatches,
            'precision': self._calculate_precision(alignment)
        }
    
    def _extract_on_screen_text(self, video_asset):
        """
        Extract text overlays from video frames
        """
        text_segments = []
        
        for frame in video_asset['frames']:
            # OCR to extract text
            frame_text = self.text_extractor.extract(frame)
            
            if frame_text:
                text_segments.append({
                    'text': frame_text,
                    'timestamp': frame['timestamp'],
                    'bbox': frame_text['bbox']
                })
        
        return text_segments
    
    def _align(self, audio_transcript, on_screen_text):
        """
        Align audio transcript with on-screen text
        """
        # Use dynamic time warping or similar algorithm
        alignment = self._dynamic_time_warping(
            audio_transcript,
            on_screen_text
        )
        
        return alignment
```

### Numeric Data Precision

**Implementation:**

```python
class NumericDataValidator:
    """
    Validate numeric data with 100% precision
    """
    def validate_numeric_data(self, video_asset, source_truth):
        """
        Ensure all numeric data matches source truth exactly
        """
        # Extract numeric data from video
        video_numbers = self._extract_numeric_data(video_asset)
        
        # Compare with source truth
        mismatches = []
        
        for video_num in video_numbers:
            # Find corresponding source truth value
            source_value = self._find_source_value(
                source_truth,
                video_num['context']
            )
            
            if source_value is None:
                mismatches.append({
                    'type': 'missing_source',
                    'video_value': video_num['value'],
                    'context': video_num['context']
                })
                continue
            
            # Compare values (exact match required)
            if not self._values_match(video_num['value'], source_value):
                mismatches.append({
                    'type': 'value_mismatch',
                    'video_value': video_num['value'],
                    'source_value': source_value,
                    'context': video_num['context']
                })
        
        return {
            'valid': len(mismatches) == 0,
            'mismatches': mismatches,
            'total_numbers': len(video_numbers),
            'precision': 1.0 - (len(mismatches) / len(video_numbers)) if video_numbers else 1.0
        }
    
    def _extract_numeric_data(self, video_asset):
        """
        Extract numeric data from video (OCR + audio)
        """
        numbers = []
        
        # Extract from on-screen text
        for frame in video_asset['frames']:
            text = self._extract_text_from_frame(frame)
            frame_numbers = self._extract_numbers_from_text(text)
            
            for num in frame_numbers:
                numbers.append({
                    'value': num['value'],
                    'context': num['context'],
                    'timestamp': frame['timestamp'],
                    'source': 'visual'
                })
        
        # Extract from audio transcript
        audio_transcript = self._transcribe_audio(video_asset)
        audio_numbers = self._extract_numbers_from_text(audio_transcript)
        
        for num in audio_numbers:
            numbers.append({
                'value': num['value'],
                'context': num['context'],
                'timestamp': num['timestamp'],
                'source': 'audio'
            })
        
        return numbers
    
    def _values_match(self, value1, value2):
        """
        Check if two numeric values match exactly
        """
        # Normalize values (remove formatting, etc.)
        norm1 = self._normalize_number(value1)
        norm2 = self._normalize_number(value2)
        
        # Exact match required
        return abs(norm1 - norm2) < 0.001  # Floating point tolerance
```

### Source Truth Alignment

**Implementation:**

```python
class SourceTruthAlignment:
    """
    Align video content with source truth data
    """
    def validate_against_source_truth(self, video_asset, source_truth_id):
        """
        Validate all claims in video against source truth
        """
        # Load source truth
        source_truth = self._load_source_truth(source_truth_id)
        
        # Extract claims from video
        video_claims = self._extract_claims(video_asset)
        
        # Validate each claim
        validation_results = []
        
        for claim in video_claims:
            # Find corresponding source truth
            source_data = self._find_source_data(
                source_truth,
                claim['type'],
                claim['context']
            )
            
            if source_data is None:
                validation_results.append({
                    'claim': claim,
                    'valid': False,
                    'reason': 'no_source_data'
                })
                continue
            
            # Validate claim
            is_valid = self._validate_claim(claim, source_data)
            
            validation_results.append({
                'claim': claim,
                'valid': is_valid,
                'source_data': source_data
            })
        
        # Calculate precision
        valid_claims = sum(1 for r in validation_results if r['valid'])
        total_claims = len(validation_results)
        precision = valid_claims / total_claims if total_claims > 0 else 1.0
        
        return {
            'valid': precision == 1.0,  # 100% required
            'precision': precision,
            'results': validation_results,
            'violations': [r for r in validation_results if not r['valid']]
        }
```

---

## 6.2 Model Version Monitoring: Detecting Drift

### The Problem: Model Updates Change Personas

When video generation models update (e.g., HeyGen 4.0 → 5.0), personas may change appearance or behavior without authorization. Drift detection identifies these changes.

### Persona Drift Detection

**Implementation:**

```python
class PersonaDriftDetector:
    """
    Detect when model updates alter persona appearance/behavior
    """
    def __init__(self):
        self.persona_baseline = PersonaBaseline()
        self.comparison_engine = ComparisonEngine()
    
    def detect_drift(self, persona_id, new_video_asset, model_version):
        """
        Detect if persona has drifted from baseline
        """
        # Load baseline persona
        baseline = self.persona_baseline.load(persona_id)
        
        # Extract features from new video
        new_features = self._extract_persona_features(new_video_asset)
        
        # Compare with baseline
        comparison = self.comparison_engine.compare(
            baseline['features'],
            new_features
        )
        
        # Check if drift exceeds threshold
        drift_detected = comparison['similarity'] < baseline['drift_threshold']
        
        return {
            'drift_detected': drift_detected,
            'similarity': comparison['similarity'],
            'threshold': baseline['drift_threshold'],
            'model_version': model_version,
            'changes': comparison['differences']
        }
    
    def _extract_persona_features(self, video_asset):
        """
        Extract persona features for comparison
        """
        return {
            'appearance': {
                'face_features': self._extract_face_features(video_asset),
                'hair': self._extract_hair_features(video_asset),
                'clothing': self._extract_clothing_features(video_asset)
            },
            'behavior': {
                'gestures': self._extract_gesture_patterns(video_asset),
                'speaking_style': self._extract_speaking_style(video_asset),
                'movements': self._extract_movement_patterns(video_asset)
            },
            'voice': {
                'pitch': self._extract_pitch(video_asset),
                'cadence': self._extract_cadence(video_asset),
                'accent': self._extract_accent(video_asset)
            }
        }
```

### Model Version Tracking

**Implementation:**

```python
class ModelVersionTracker:
    """
    Track model versions and detect unauthorized changes
    """
    def __init__(self):
        self.version_registry = VersionRegistry()
        self.drift_detector = PersonaDriftDetector()
    
    def register_model_update(self, model_name, old_version, new_version):
        """
        Register a model version update
        """
        # Check if update is authorized
        authorized = self._check_authorization(model_name, new_version)
        
        if not authorized:
            return {
                'registered': False,
                'reason': 'unauthorized_update'
            }
        
        # Register update
        update_record = {
            'model_name': model_name,
            'old_version': old_version,
            'new_version': new_version,
            'timestamp': datetime.now(),
            'authorized': True
        }
        
        self.version_registry.create(update_record)
        
        # Trigger drift detection for all personas using this model
        self._trigger_drift_detection(model_name, new_version)
        
        return {
            'registered': True,
            'update_id': update_record['id']
        }
    
    def _trigger_drift_detection(self, model_name, new_version):
        """
        Trigger drift detection for all affected personas
        """
        # Find all personas using this model
        affected_personas = self._find_personas_using_model(model_name)
        
        for persona_id in affected_personas:
            # Generate test video with new model
            test_video = self._generate_test_video(persona_id, new_version)
            
            # Detect drift
            drift_result = self.drift_detector.detect_drift(
                persona_id,
                test_video,
                new_version
            )
            
            if drift_result['drift_detected']:
                # Alert and potentially halt production
                self._handle_drift_detection(persona_id, drift_result)
```

### Behavioral Drift Detection

**Implementation:**

```python
class BehavioralDriftDetector:
    """
    Detect changes in persona behavior
    """
    def detect_behavioral_drift(self, persona_id, new_video_asset):
        """
        Detect behavioral changes
        """
        baseline_behavior = self._load_baseline_behavior(persona_id)
        
        new_behavior = self._extract_behavior(new_video_asset)
        
        # Compare behaviors
        differences = []
        
        # Check gesture patterns
        gesture_similarity = self._compare_gesture_patterns(
            baseline_behavior['gestures'],
            new_behavior['gestures']
        )
        if gesture_similarity < 0.8:
            differences.append({
                'type': 'gesture_pattern',
                'similarity': gesture_similarity
            })
        
        # Check speaking style
        speaking_similarity = self._compare_speaking_styles(
            baseline_behavior['speaking_style'],
            new_behavior['speaking_style']
        )
        if speaking_similarity < 0.8:
            differences.append({
                'type': 'speaking_style',
                'similarity': speaking_similarity
            })
        
        # Check movement patterns
        movement_similarity = self._compare_movements(
            baseline_behavior['movements'],
            new_behavior['movements']
        )
        if movement_similarity < 0.8:
            differences.append({
                'type': 'movement_pattern',
                'similarity': movement_similarity
            })
        
        return {
            'drift_detected': len(differences) > 0,
            'differences': differences
        }
```

---

## 6.3 Fail-Closed Systems: Automatic Halt on Violations

### The Philosophy: Safety First

Fail-closed systems automatically halt production when violations are detected, preventing bad content from being published.

### Violation Detection and Halt

**Implementation:**

```python
class FailClosedSystem:
    """
    Fail-closed system that halts on violations
    """
    def __init__(self):
        self.validators = [
            PersonaLockValidator(),
            ClaimBoundaryValidator(),
            AlignmentValidator(),
            DriftValidator()
        ]
        self.production_controller = ProductionController()
    
    def validate_and_proceed(self, video_asset):
        """
        Validate asset and halt if violations detected
        """
        violations = []
        
        for validator in self.validators:
            result = validator.validate(video_asset)
            
            if not result['passed']:
                violations.extend(result['violations'])
        
        if violations:
            # Fail-closed: Halt production
            self._halt_production(video_asset, violations)
            
            return {
                'approved': False,
                'halted': True,
                'violations': violations
            }
        
        # All checks passed
        return {
            'approved': True,
            'halted': False
        }
    
    def _halt_production(self, video_asset, violations):
        """
        Halt production and log violations
        """
        # Stop production pipeline
        self.production_controller.halt(video_asset['id'])
        
        # Log violations
        self._log_violations(video_asset['id'], violations)
        
        # Alert administrators
        self._alert_administrators(video_asset, violations)
        
        # Prevent asset from being published
        self._mark_asset_blocked(video_asset['id'])
```

### Persona Lock Violation Detection

**Implementation:**

```python
class PersonaLockValidator:
    """
    Validate persona lock compliance
    """
    def validate(self, video_asset):
        """
        Check if persona lock is maintained
        """
        persona_id = video_asset['persona_id']
        
        # Load persona lock requirements
        persona_lock = self._load_persona_lock(persona_id)
        
        # Extract persona from video
        video_persona = self._extract_persona(video_asset)
        
        # Check lock compliance
        violations = []
        
        # Check appearance lock
        if persona_lock.get('appearance_locked'):
            appearance_match = self._compare_appearance(
                persona_lock['baseline_appearance'],
                video_persona['appearance']
            )
            if appearance_match['similarity'] < 0.9:
                violations.append({
                    'type': 'appearance_lock_violation',
                    'similarity': appearance_match['similarity'],
                    'threshold': 0.9
                })
        
        # Check voice lock
        if persona_lock.get('voice_locked'):
            voice_match = self._compare_voice(
                persona_lock['baseline_voice'],
                video_persona['voice']
            )
            if voice_match['similarity'] < 0.9:
                violations.append({
                    'type': 'voice_lock_violation',
                    'similarity': voice_match['similarity'],
                    'threshold': 0.9
                })
        
        return {
            'passed': len(violations) == 0,
            'violations': violations
        }
```

### Claim Boundary Violation Detection

**Implementation:**

```python
class ClaimBoundaryValidator:
    """
    Validate that claims stay within approved boundaries
    """
    def validate(self, video_asset):
        """
        Check if claims are within boundaries
        """
        # Extract claims from video
        claims = self._extract_claims(video_asset)
        
        # Load approved claim boundaries
        boundaries = self._load_claim_boundaries(video_asset['persona_id'])
        
        violations = []
        
        for claim in claims:
            # Check if claim is within boundaries
            within_boundary = self._check_boundary(claim, boundaries)
            
            if not within_boundary:
                violations.append({
                    'type': 'claim_boundary_violation',
                    'claim': claim,
                    'boundary': boundaries.get(claim['type'])
                })
        
        return {
            'passed': len(violations) == 0,
            'violations': violations
        }
    
    def _check_boundary(self, claim, boundaries):
        """
        Check if claim is within approved boundary
        """
        claim_type = claim['type']
        boundary = boundaries.get(claim_type)
        
        if not boundary:
            # No boundary defined - reject for safety
            return False
        
        # Check if claim value is within boundary
        if 'min' in boundary and claim['value'] < boundary['min']:
            return False
        
        if 'max' in boundary and claim['value'] > boundary['max']:
            return False
        
        if 'allowed_values' in boundary:
            if claim['value'] not in boundary['allowed_values']:
                return False
        
        return True
```

### Slow Decay Detection

**Implementation:**

```python
class SlowDecayDetector:
    """
    Detect gradual quality degradation over time
    """
    def __init__(self):
        self.quality_history = QualityHistory()
    
    def detect_decay(self, video_asset, persona_id):
        """
        Detect if quality is decaying over time
        """
        # Get quality history
        history = self.quality_history.get(persona_id, days=30)
        
        if len(history) < 10:
            # Not enough data
            return {
                'decay_detected': False,
                'reason': 'insufficient_data'
            }
        
        # Calculate current quality
        current_quality = self._calculate_quality(video_asset)
        
        # Calculate trend
        trend = self._calculate_trend(history)
        
        # Check if decaying
        if trend['slope'] < -0.01:  # 1% per day decay
            decay_detected = True
        else:
            decay_detected = False
        
        return {
            'decay_detected': decay_detected,
            'current_quality': current_quality,
            'trend': trend,
            'history': history[-10:]  # Last 10 data points
        }
    
    def _calculate_trend(self, history):
        """
        Calculate quality trend using linear regression
        """
        if len(history) < 2:
            return {'slope': 0, 'r_squared': 0}
        
        # Simple linear regression
        x = np.array([i for i in range(len(history))])
        y = np.array([h['quality'] for h in history])
        
        slope, intercept = np.polyfit(x, y, 1)
        r_squared = np.corrcoef(x, y)[0, 1] ** 2
        
        return {
            'slope': slope,
            'intercept': intercept,
            'r_squared': r_squared
        }
```

---

## Key Takeaways

**Visual and Auditory Alignment:**
- **Audio-Text Alignment**: Audio-text alignment ensures 100% precision
- **Numeric Data**: Numeric data must match source truth exactly
- **Automated Checks**: Automated checks prevent misalignment
- **Source Truth**: Source truth validation ensures accuracy

**Model Version Monitoring:**
- **Model Updates**: Model updates can alter persona appearance/behavior
- **Drift Detection**: Drift detection identifies unauthorized changes
- **Behavioral Drift**: Behavioral drift also monitored
- **Version Tracking**: Version tracking enables audit trail

**Fail-Closed Systems:**
- **Automatic Halt**: Automatic halt on violations prevents bad content
- **Persona Lock**: Persona lock violations trigger halt
- **Claim Boundary**: Claim boundary violations trigger halt
- **Slow Decay**: Slow decay detection identifies gradual issues

---

## Lab 6: Create an Automated QA and Drift Detection System

**Objective:** Build a complete QA system with alignment checks, drift detection, and fail-closed mechanisms.

**Requirements:**
1. Implement audio-text alignment validation
2. Build numeric data precision checks
3. Create persona drift detection
4. Implement fail-closed system
5. Add slow decay monitoring

**Deliverables:**
- Working Python implementation
- Alignment validators
- Drift detection system
- Fail-closed controller
- Test cases and results
- Documentation (500 words)

**Evaluation Criteria:**
- Alignment validation (30%)
- Drift detection (25%)
- Fail-closed system (25%)
- Code quality and testing (20%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Automated Quality Assurance in Video Production" - Best practices
- "Drift Detection in Machine Learning Systems" - Technical guides
- "Fail-Closed System Design" - Safety engineering

**Tools to Explore:**
- DriftGuard documentation
- Speech recognition APIs
- OCR libraries
- Statistical analysis tools

**Next Module Preview:**
Module 7 will cover compliance, audit, and defense systems to ensure regulatory compliance.

---

**Module 6 Complete**   
**Next:** Module 7 - Compliance, Audit, & Defense
