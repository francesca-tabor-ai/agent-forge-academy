---
title: "Module 4: Benchmarking World Knowledge"
description: "Evaluate AI-generated video against real-world laws of physics"
module: "4"
order: 4
---

# Module 4: Benchmarking World Knowledge

**Duration:** Week 4  
**Tool Focus:** PhysicsValidator  
**Learning Objectives:**
- **the T2VWorldBench framework for evaluating video models Understanding**: Understand the T2VWorldBench framework for evaluating video models
- **causality verification Implementation**: Implement causality verification systems
- **physical plausibility scoring mechanisms Development**: Build physical plausibility scoring mechanisms
- **Detect Failures**: Detect failures in AI world knowledge

---

## 4.1 The T2VWorldBench Framework: Six-Domain Assessment

### The Problem: AI Lacks World Knowledge

AI video generation models often produce physically impossible or causally incorrect content. The T2VWorldBench framework systematically evaluates models across six critical domains.

### The Six Domains

**1. Physics Domain**
- Gravity, momentum, collisions
- Object interactions
- Material properties

**2. Nature Domain**
- Animal behavior
- Plant growth
- Weather patterns
- Natural phenomena

**3. Activity Domain**
- Human actions
- Tool usage
- Sequential tasks

**4. Culture Domain**
- Social norms
- Cultural practices
- Contextual appropriateness

**5. Causality Domain**
- Cause-and-effect relationships
- Temporal logic
- Consequence prediction

**6. Object Domain**
- Object consistency
- Texture coherence
- Shape stability

### Framework Implementation

```python
class T2VWorldBench:
    """
    Comprehensive framework for evaluating video world knowledge
    """
    def __init__(self):
        self.domains = {
            'physics': PhysicsDomain(),
            'nature': NatureDomain(),
            'activity': ActivityDomain(),
            'culture': CultureDomain(),
            'causality': CausalityDomain(),
            'object': ObjectDomain()
        }
    
    def evaluate_video(self, video_asset):
        """
        Evaluate video across all six domains
        """
        results = {}
        
        for domain_name, domain_evaluator in self.domains.items():
            domain_result = domain_evaluator.evaluate(video_asset)
            results[domain_name] = domain_result
        
        # Calculate overall score
        overall_score = self._calculate_overall_score(results)
        
        return {
            'overall_score': overall_score,
            'domain_scores': results,
            'failures': self._identify_failures(results),
            'recommendations': self._generate_recommendations(results)
        }
    
    def _calculate_overall_score(self, domain_results):
        """
        Calculate weighted overall score
        """
        weights = {
            'physics': 0.25,
            'causality': 0.25,
            'object': 0.20,
            'activity': 0.15,
            'nature': 0.10,
            'culture': 0.05
        }
        
        weighted_sum = sum(
            domain_results[domain]['score'] * weights[domain]
            for domain in weights.keys()
        )
        
        return weighted_sum
```

### Physics Domain Evaluation

**Focus:** Physical laws and object interactions.

```python
class PhysicsDomain:
    """
    Evaluate physics plausibility
    """
    def evaluate(self, video_asset):
        """
        Evaluate physics in video
        """
        checks = {
            'gravity': self._check_gravity(video_asset),
            'momentum': self._check_momentum(video_asset),
            'collisions': self._check_collisions(video_asset),
            'material_properties': self._check_materials(video_asset)
        }
        
        score = sum(checks.values()) / len(checks)
        
        return {
            'score': score,
            'checks': checks,
            'failures': [k for k, v in checks.items() if v < 0.7]
        }
    
    def _check_gravity(self, video_asset):
        """
        Check if objects follow gravity correctly
        """
        # Extract object trajectories
        trajectories = self._extract_trajectories(video_asset)
        
        gravity_violations = 0
        total_objects = 0
        
        for obj_id, trajectory in trajectories.items():
            total_objects += 1
            
            # Check if object is falling
            if self._is_falling(trajectory):
                # Calculate expected acceleration (9.8 m/s²)
                expected_acceleration = 9.8
                actual_acceleration = self._calculate_acceleration(trajectory)
                
                # Allow 20% tolerance
                if abs(actual_acceleration - expected_acceleration) > 2.0:
                    gravity_violations += 1
        
        if total_objects == 0:
            return 1.0  # No objects to check
        
        return 1.0 - (gravity_violations / total_objects)
    
    def _check_collisions(self, video_asset):
        """
        Check if collisions are physically plausible
        """
        collisions = self._detect_collisions(video_asset)
        
        plausible_collisions = 0
        total_collisions = len(collisions)
        
        for collision in collisions:
            # Check momentum conservation
            momentum_before = self._calculate_momentum_before(collision)
            momentum_after = self._calculate_momentum_after(collision)
            
            # Allow 10% tolerance
            momentum_conserved = abs(
                momentum_before - momentum_after
            ) < 0.1 * momentum_before
            
            if momentum_conserved:
                plausible_collisions += 1
        
        if total_collisions == 0:
            return 1.0  # No collisions to check
        
        return plausible_collisions / total_collisions
```

### Causality Domain Evaluation

**Focus:** Cause-and-effect relationships and temporal logic.

```python
class CausalityDomain:
    """
    Evaluate causality and temporal logic
    """
    def evaluate(self, video_asset):
        """
        Evaluate causality in video
        """
        checks = {
            'temporal_consistency': self._check_temporal_consistency(video_asset),
            'cause_effect': self._check_cause_effect(video_asset),
            'consequence_prediction': self._check_consequences(video_asset)
        }
        
        score = sum(checks.values()) / len(checks)
        
        return {
            'score': score,
            'checks': checks,
            'failures': [k for k, v in checks.items() if v < 0.7]
        }
    
    def _check_cause_effect(self, video_asset):
        """
        Check if cause-effect relationships are correct
        """
        # Define expected cause-effect pairs
        expected_causality = [
            {
                'cause': 'ice_cube_in_warm_room',
                'effect': 'ice_cube_melts',
                'time_window': (5, 30)  # seconds
            },
            {
                'cause': 'ball_dropped',
                'effect': 'ball_bounces',
                'time_window': (0.1, 2.0)
            },
            {
                'cause': 'water_boiled',
                'effect': 'steam_visible',
                'time_window': (1, 5)
            }
        ]
        
        correct_causality = 0
        total_checks = len(expected_causality)
        
        for causality_pair in expected_causality:
            cause_detected = self._detect_event(
                video_asset,
                causality_pair['cause']
            )
            effect_detected = self._detect_event(
                video_asset,
                causality_pair['effect']
            )
            
            if cause_detected and effect_detected:
                # Check timing
                cause_time = cause_detected['timestamp']
                effect_time = effect_detected['timestamp']
                time_diff = effect_time - cause_time
                
                time_window = causality_pair['time_window']
                if time_window[0] <= time_diff <= time_window[1]:
                    correct_causality += 1
        
        return correct_causality / total_checks if total_checks > 0 else 1.0
```

---

## 4.2 Causality Verification: Simulating Consequences

### The Ice Cube Test

**Classic Example:** An ice cube placed in a warm room should melt over time. AI models often fail this test by:
- Showing ice cube that never melts
- Melting too quickly or too slowly
- Incorrect melting behavior (e.g., shrinking instead of melting)

**Implementation:**

```python
class CausalityVerifier:
    """
    Verify causal relationships in video
    """
    def verify_ice_cube_melting(self, video_asset):
        """
        Verify ice cube melting causality
        """
        # Detect ice cube
        ice_cube = self._detect_object(video_asset, 'ice_cube')
        
        if not ice_cube:
            return {
                'verified': False,
                'reason': 'ice_cube_not_detected'
            }
        
        # Track ice cube over time
        size_over_time = []
        position_over_time = []
        
        for frame in video_asset['frames']:
            ice_cube_in_frame = self._locate_ice_cube(frame, ice_cube)
            
            if ice_cube_in_frame:
                size_over_time.append(ice_cube_in_frame['size'])
                position_over_time.append(ice_cube_in_frame['position'])
            else:
                # Ice cube should have melted by now
                size_over_time.append(0)
        
        # Check if size decreases over time (melting)
        size_decreasing = self._is_monotonically_decreasing(
            size_over_time,
            tolerance=0.1
        )
        
        # Check if final size is near zero (fully melted)
        final_size = size_over_time[-1] if size_over_time else 1.0
        fully_melted = final_size < 0.1 * size_over_time[0]
        
        # Check timing (should take 5-30 seconds in warm room)
        melting_duration = len(size_over_time) / video_asset['fps']
        timing_correct = 5 <= melting_duration <= 30
        
        return {
            'verified': size_decreasing and fully_melted and timing_correct,
            'size_decreasing': size_decreasing,
            'fully_melted': fully_melted,
            'timing_correct': timing_correct,
            'melting_duration': melting_duration
        }
    
    def verify_ball_bouncing(self, video_asset):
        """
        Verify ball bouncing on hard floor
        """
        # Detect ball
        ball = self._detect_object(video_asset, 'ball')
        floor = self._detect_object(video_asset, 'floor')
        
        if not ball or not floor:
            return {
                'verified': False,
                'reason': 'ball_or_floor_not_detected'
            }
        
        # Track ball trajectory
        trajectory = self._track_trajectory(ball, video_asset)
        
        # Find collision points with floor
        collisions = self._find_collisions(trajectory, floor)
        
        if len(collisions) < 2:
            return {
                'verified': False,
                'reason': 'insufficient_bounces'
            }
        
        # Check bounce physics
        bounces_correct = True
        
        for i in range(len(collisions) - 1):
            collision1 = collisions[i]
            collision2 = collisions[i + 1]
            
            # Check if bounce height decreases (energy loss)
            height1 = collision1['height']
            height2 = collision2['height']
            
            if height2 > height1 * 1.1:  # Allow 10% tolerance
                bounces_correct = False
                break
            
            # Check if bounce is upward (not rolling)
            velocity_after = collision1['velocity_after']
            if velocity_after['y'] <= 0:
                bounces_correct = False
                break
        
        return {
            'verified': bounces_correct,
            'bounces_detected': len(collisions),
            'bounces_correct': bounces_correct
        }
```

### Temporal Logic Verification

**Implementation:**

```python
class TemporalLogicVerifier:
    """
    Verify temporal consistency and logic
    """
    def verify_temporal_consistency(self, video_asset):
        """
        Check if events occur in logical temporal order
        """
        events = self._extract_events(video_asset)
        
        # Define temporal constraints
        constraints = [
            {
                'before': 'water_boiled',
                'after': 'steam_visible',
                'max_delay': 5.0  # seconds
            },
            {
                'before': 'button_pressed',
                'after': 'light_turned_on',
                'max_delay': 0.5
            }
        ]
        
        violations = 0
        
        for constraint in constraints:
            before_event = self._find_event(events, constraint['before'])
            after_event = self._find_event(events, constraint['after'])
            
            if before_event and after_event:
                time_diff = after_event['timestamp'] - before_event['timestamp']
                
                # Check if order is correct
                if time_diff < 0:
                    violations += 1  # Wrong order
                
                # Check if delay is reasonable
                if time_diff > constraint['max_delay']:
                    violations += 1  # Too slow
        
        total_constraints = len(constraints)
        return {
            'score': 1.0 - (violations / total_constraints) if total_constraints > 0 else 1.0,
            'violations': violations,
            'total_constraints': total_constraints
        }
```

---

## 4.3 Physical Plausibility Scores: Automated Scoring

### Object Consistency Scoring

**Focus:** Objects should maintain consistent appearance, texture, and shape throughout the video.

```python
class PhysicalPlausibilityScorer:
    """
    Score physical plausibility of video content
    """
    def score_object_consistency(self, video_asset):
        """
        Score object consistency across frames
        """
        objects = self._detect_all_objects(video_asset)
        
        consistency_scores = {}
        
        for obj_id, obj_tracks in objects.items():
            # Extract features for each frame
            features_over_time = []
            
            for track in obj_tracks:
                frame_features = {
                    'texture': self._extract_texture(track['frame'], track['bbox']),
                    'color': self._extract_color(track['frame'], track['bbox']),
                    'shape': self._extract_shape(track['frame'], track['bbox'])
                }
                features_over_time.append(frame_features)
            
            # Calculate consistency
            texture_consistency = self._calculate_feature_consistency(
                [f['texture'] for f in features_over_time]
            )
            color_consistency = self._calculate_feature_consistency(
                [f['color'] for f in features_over_time]
            )
            shape_consistency = self._calculate_feature_consistency(
                [f['shape'] for f in features_over_time]
            )
            
            # Average consistency
            avg_consistency = (
                texture_consistency + 
                color_consistency + 
                shape_consistency
            ) / 3.0
            
            consistency_scores[obj_id] = avg_consistency
        
        # Overall consistency score
        if consistency_scores:
            overall_score = sum(consistency_scores.values()) / len(consistency_scores)
        else:
            overall_score = 1.0  # No objects to check
        
        return {
            'overall_score': overall_score,
            'object_scores': consistency_scores
        }
    
    def _calculate_feature_consistency(self, features):
        """
        Calculate consistency of features over time
        """
        if len(features) < 2:
            return 1.0
        
        # Calculate pairwise similarity
        similarities = []
        
        for i in range(len(features) - 1):
            similarity = self._feature_similarity(
                features[i],
                features[i + 1]
            )
            similarities.append(similarity)
        
        # Average similarity (higher = more consistent)
        return sum(similarities) / len(similarities) if similarities else 1.0
```

### Lighting and Shadow Consistency

**Implementation:**

```python
class LightingConsistencyScorer:
    """
    Score lighting and shadow consistency
    """
    def score_lighting_consistency(self, video_asset):
        """
        Check if lighting and shadows are consistent
        """
        # Extract lighting information from frames
        lighting_over_time = []
        shadow_over_time = []
        
        for frame in video_asset['frames']:
            lighting = self._extract_lighting(frame)
            shadows = self._detect_shadows(frame)
            
            lighting_over_time.append(lighting)
            shadow_over_time.append(shadows)
        
        # Check lighting stability
        lighting_stability = self._calculate_stability(lighting_over_time)
        
        # Check shadow consistency (shadows should follow objects)
        shadow_consistency = self._check_shadow_consistency(
            shadow_over_time,
            video_asset
        )
        
        # Combined score
        score = (lighting_stability + shadow_consistency) / 2.0
        
        return {
            'score': score,
            'lighting_stability': lighting_stability,
            'shadow_consistency': shadow_consistency
        }
    
    def _check_shadow_consistency(self, shadows, video_asset):
        """
        Check if shadows are consistent with object positions
        """
        objects = self._detect_all_objects(video_asset)
        
        correct_shadows = 0
        total_checks = 0
        
        for obj_id, obj_tracks in objects.items():
            for track in obj_tracks:
                total_checks += 1
                
                # Find shadow for this object
                shadow = self._find_shadow_for_object(
                    shadows[track['frame_idx']],
                    obj_id
                )
                
                if shadow:
                    # Check if shadow position is correct
                    # Shadow should be below object, offset by light direction
                    expected_shadow_pos = self._calculate_expected_shadow(
                        track['position'],
                        video_asset['lighting_direction']
                    )
                    
                    actual_shadow_pos = shadow['position']
                    
                    # Check if positions match (within tolerance)
                    distance = self._euclidean_distance(
                        expected_shadow_pos,
                        actual_shadow_pos
                    )
                    
                    if distance < 10:  # 10 pixel tolerance
                        correct_shadows += 1
        
        return correct_shadows / total_checks if total_checks > 0 else 1.0
```

### Texture Coherence Scoring

**Implementation:**

```python
class TextureCoherenceScorer:
    """
    Score texture coherence across frames
    """
    def score_texture_coherence(self, video_asset):
        """
        Check if textures remain coherent
        """
        objects = self._detect_all_objects(video_asset)
        
        coherence_scores = {}
        
        for obj_id, obj_tracks in objects.items():
            # Extract texture patches
            texture_patches = []
            
            for track in obj_tracks:
                patch = self._extract_texture_patch(
                    track['frame'],
                    track['bbox']
                )
                texture_patches.append(patch)
            
            # Calculate coherence
            coherence = self._calculate_texture_coherence(texture_patches)
            coherence_scores[obj_id] = coherence
        
        # Overall coherence
        if coherence_scores:
            overall_coherence = sum(coherence_scores.values()) / len(coherence_scores)
        else:
            overall_coherence = 1.0
        
        return {
            'overall_coherence': overall_coherence,
            'object_coherence': coherence_scores
        }
    
    def _calculate_texture_coherence(self, patches):
        """
        Calculate how coherent textures are across patches
        """
        if len(patches) < 2:
            return 1.0
        
        # Calculate texture similarity between consecutive patches
        similarities = []
        
        for i in range(len(patches) - 1):
            similarity = self._texture_similarity(patches[i], patches[i + 1])
            similarities.append(similarity)
        
        # Average similarity
        return sum(similarities) / len(similarities) if similarities else 1.0
```

### Overall Plausibility Score

**Implementation:**

```python
class PhysicsValidator:
    """
    Complete physics validation system
    """
    def __init__(self):
        self.t2v_bench = T2VWorldBench()
        self.causality_verifier = CausalityVerifier()
        self.plausibility_scorer = PhysicalPlausibilityScorer()
    
    def validate(self, video_asset):
        """
        Complete validation of video asset
        """
        # T2VWorldBench evaluation
        bench_results = self.t2v_bench.evaluate_video(video_asset)
        
        # Causality verification
        causality_results = self.causality_verifier.verify_all(video_asset)
        
        # Plausibility scoring
        plausibility_results = self.plausibility_scorer.score_all(video_asset)
        
        # Combine results
        overall_score = (
            bench_results['overall_score'] * 0.4 +
            causality_results['score'] * 0.3 +
            plausibility_results['score'] * 0.3
        )
        
        return {
            'overall_score': overall_score,
            'bench_results': bench_results,
            'causality_results': causality_results,
            'plausibility_results': plausibility_results,
            'passed': overall_score >= 0.7,  # 70% threshold
            'recommendations': self._generate_recommendations(
                bench_results,
                causality_results,
                plausibility_results
            )
        }
```

---

## Key Takeaways

**T2VWorldBench Framework:**
- **Six Domains:**: Six domains: Physics, Nature, Activity, Culture, Causality, Object
- **Systematic Evaluation**: Systematic evaluation identifies world knowledge failures
- **Weighted Scoring**: Weighted scoring provides overall assessment
- **Domain-Specific Checks**: Domain-specific checks catch different failure modes

**Causality Verification:**
- **Ice Cube**: Ice cube melting test reveals temporal understanding
- **Ball Bouncing**: Ball bouncing test checks physics simulation
- **Temporal Logic**: Temporal logic ensures events occur in correct order
- **Cause-Effect Relationships**: Cause-effect relationships must be physically plausible

**Physical Plausibility:**
- **Object Consistency**: Object consistency ensures stable appearance
- **Lighting And**: Lighting and shadows must be coherent
- **Texture Coherence**: Texture coherence prevents flickering
- **Automated Scoring**: Automated scoring enables batch validation

---

## Lab 4: Build a Physics Validation System for Synthetic Video

**Objective:** Create a comprehensive physics validation system using the T2VWorldBench framework.

**Requirements:**
1. Implement T2VWorldBench with all six domains
2. Build causality verification (ice cube, ball bouncing)
3. Create physical plausibility scoring
4. Test on sample videos (real and synthetic)
5. Generate validation reports

**Deliverables:**
- Working Python implementation
- T2VWorldBench evaluator
- Causality verifier
- Plausibility scorer
- Test results and analysis
- Documentation (500 words)

**Evaluation Criteria:**
- T2VWorldBench implementation (30%)
- Causality verification (25%)
- Plausibility scoring (25%)
- Code quality and testing (20%)

**Time Estimate:** 6-7 hours

---

## Additional Resources

**Readings:**
- "T2VWorldBench: Evaluating World Knowledge in Text-to-Video Models" - Research paper
- "Causality in AI Systems" - Theoretical foundations
- "Physical Plausibility in Synthetic Media" - Best practices

**Tools to Explore:**
- PhysicsValidator documentation
- Computer vision libraries (OpenCV, etc.)
- Video analysis frameworks
- Physics simulation libraries

**Next Module Preview:**
Module 5 will cover scaling video content to 140+ languages while maintaining cultural appropriateness.

---

**Module 4 Complete**   
**Next:** Module 5 - Cultural & Global Localization
