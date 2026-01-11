# Proposal: Voice AI Advisor + Jobs Matching Enhancement

## Overview
This proposal outlines minimal changes to add **voice AI advisor** capabilities and **dynamic jobs matching** without refactoring existing learning flows.

---

## Part 1: Voice AI Advisor

### Current State
- ✅ Text-based AI advisor chat interface
- ✅ Context-aware conversations
- ✅ Conversation history storage
- ✅ Quick actions
- ❌ No voice input/output

### Proposed Changes

#### 1.1 Frontend: Voice Controls Component
**New File**: `components/ai-advisor/VoiceControls.tsx`

**Features**:
- Microphone button for voice input
- Speaker button for voice output toggle
- Visual feedback (recording indicator, waveform)
- Auto-stop after silence detection
- Fallback to text if voice fails

**Integration**:
- Add to existing `AIAdvisor.tsx` component
- Position: Above or below text input
- Minimal UI changes to existing chat interface

**Dependencies**:
- Web Speech API (`SpeechRecognition`, `speechSynthesis`)
- Optional: `@speechly/react-client` for better accuracy (if needed)

#### 1.2 API Enhancement: Voice Endpoint
**New Route**: `/api/ai-advisor/voice`

**Purpose**: Handle voice input/output processing

**Flow**:
1. Receive audio blob from client
2. Convert audio to text (using Web Speech API or cloud service)
3. Process text through existing `/api/ai-advisor/chat` logic
4. Return text response + optional audio blob (TTS)

**Alternative**: Reuse existing `/api/ai-advisor/chat` endpoint
- Client converts speech-to-text before sending
- Client converts text-to-speech after receiving
- No backend changes needed (minimal approach)

**Recommendation**: Use client-side STT/TTS (minimal backend changes)

#### 1.3 Database Changes
**None Required**
- Existing `advisor_conversations` table already stores text
- Voice metadata can be stored in `metadata` JSONB field if needed

#### 1.4 Implementation Steps

**Step 1**: Create `VoiceControls.tsx` component
```typescript
// Minimal voice controls with Web Speech API
- Record button → SpeechRecognition
- Play button → speechSynthesis
- Visual feedback (recording indicator)
```

**Step 2**: Integrate into `AIAdvisor.tsx`
```typescript
// Add voice controls above text input
<VoiceControls 
  onTranscript={(text) => handleSendMessage(text)}
  onVoiceOutput={speakResponse}
  disabled={isLoading}
/>
```

**Step 3**: Add voice output to chat responses
```typescript
// After receiving AI response, optionally speak it
if (voiceOutputEnabled) {
  const utterance = new SpeechSynthesisUtterance(response);
  speechSynthesis.speak(utterance);
}
```

**Step 4**: Store voice preference (optional)
```typescript
// Add to user preferences or localStorage
localStorage.setItem('voiceEnabled', 'true');
```

#### 1.5 Files to Modify
1. `components/ai-advisor/AIAdvisor.tsx` - Add voice controls
2. `components/ai-advisor/VoiceControls.tsx` - **NEW** component
3. No changes to learning flows, course pages, or lesson rendering

#### 1.6 Testing Strategy
- Test voice input in different browsers (Chrome, Safari, Firefox)
- Test voice output with different voices
- Test fallback to text if voice fails
- Test with existing context (course/project/job)

---

## Part 2: Dynamic Jobs Matching

### Current State
- ✅ Jobs table with `matching_score` field
- ✅ Jobs display with matching scores
- ✅ Skills arrays (`skills[]`, `skills_missing[]`)
- ❌ Matching scores are static (seeded data)
- ❌ No real-time matching algorithm

### Proposed Changes

#### 2.1 Matching Algorithm
**New File**: `lib/jobs/matching.ts`

**Matching Factors**:
1. **Skills Match** (40% weight)
   - Compare `jobs.skills[]` with `student_profiles.skills[]` (from portfolio)
   - Calculate overlap percentage

2. **Course Enrollment** (30% weight)
   - Check if student enrolled in `jobs.recommended_for_courses[]`
   - Higher weight for completed courses

3. **Portfolio Projects** (20% weight)
   - Match job skills with project `tech_stack[]`
   - Count relevant projects

4. **Experience Level** (10% weight)
   - Compare job `experience_level` with student profile level
   - Penalize if too advanced

**Formula**:
```typescript
matchingScore = 
  (skillsMatch * 0.4) +
  (courseMatch * 0.3) +
  (portfolioMatch * 0.2) +
  (experienceMatch * 0.1)
```

#### 2.2 API Enhancement: Dynamic Matching
**Modify**: `/api/jobs/route.ts`

**Changes**:
1. Fetch student profile (skills, enrolled courses, portfolio projects)
2. For each job, calculate matching score using algorithm
3. Update `matching_score` in response (don't update DB, calculate on-the-fly)
4. Sort by matching score

**Alternative**: Background job to update scores
- Run matching algorithm periodically
- Update `jobs.matching_score` in database
- Simpler API (just return jobs), but less real-time

**Recommendation**: Calculate on-the-fly (more accurate, no DB writes)

#### 2.3 Database Schema Changes
**None Required**
- `jobs.matching_score` already exists (can be nullable or ignored)
- Student skills can be derived from `portfolio_projects.tech_stack[]`
- Course enrollments already in `course_enrollments`

**Optional Enhancement**: Add `student_profiles.skills[]` field
- Extract skills from portfolio projects
- Store as denormalized array for faster matching
- Update via trigger or background job

#### 2.4 Implementation Steps

**Step 1**: Create matching algorithm
```typescript
// lib/jobs/matching.ts
export function calculateJobMatch(
  job: Job,
  studentProfile: StudentProfile,
  enrolledCourses: Course[],
  portfolioProjects: Project[]
): number {
  // Calculate matching score
}
```

**Step 2**: Modify `/api/jobs` endpoint
```typescript
// Fetch student data
const studentProfile = await getStudentProfile(userId);
const enrolledCourses = await getEnrolledCourses(studentProfileId);
const portfolioProjects = await getPortfolioProjects(studentProfileId);

// Calculate matches
const jobsWithScores = jobs.map(job => ({
  ...job,
  matchingScore: calculateJobMatch(job, studentProfile, enrolledCourses, portfolioProjects)
}));

// Sort by score
jobsWithScores.sort((a, b) => b.matchingScore - a.matchingScore);
```

**Step 3**: Update job status based on score
```typescript
// Determine status from score
if (matchingScore >= 80) status = 'recommended';
else if (matchingScore >= 60) status = 'unlocked';
else if (matchingScore >= 40) status = 'locked';
else status = 'stretch';
```

**Step 4**: Add missing skills calculation
```typescript
// Calculate skills_missing
const missingSkills = job.skills.filter(
  skill => !studentSkills.includes(skill)
);
```

#### 2.5 Files to Modify
1. `lib/jobs/matching.ts` - **NEW** matching algorithm
2. `app/api/jobs/route.ts` - Add dynamic matching
3. `app/api/jobs/[id]/route.ts` - Add dynamic matching for single job
4. No changes to learning flows, course pages, or lesson rendering

#### 2.6 Testing Strategy
- Test matching with various skill combinations
- Test with students enrolled in different courses
- Test with students with/without portfolio projects
- Test edge cases (no skills, all skills, no courses)

---

## Part 3: Integration Points

### 3.1 Voice AI + Jobs Matching
**Use Case**: Student asks "What jobs match my skills?" via voice

**Flow**:
1. Voice input → "What jobs match my skills?"
2. Text sent to `/api/ai-advisor/chat` with job context
3. AI advisor queries `/api/jobs` (with dynamic matching)
4. AI advisor responds with top matching jobs
5. Voice output reads response

**No Changes Needed**: Existing context system already supports job context

### 3.2 Jobs Matching + Learning Flows
**Integration**: Jobs can recommend courses
- Job detail page shows: "Take these courses to unlock this job"
- Links to `/student/courses/[courseSlug]`
- No changes to course/lesson pages needed

---

## Part 4: Minimal Change Summary

### Voice AI Advisor
**New Files**:
- `components/ai-advisor/VoiceControls.tsx`

**Modified Files**:
- `components/ai-advisor/AIAdvisor.tsx` (add voice controls)

**No Changes To**:
- Course pages
- Lesson pages
- Learning flows
- Database schema (optional metadata only)

### Jobs Matching
**New Files**:
- `lib/jobs/matching.ts`

**Modified Files**:
- `app/api/jobs/route.ts` (add dynamic matching)
- `app/api/jobs/[id]/route.ts` (add dynamic matching)

**No Changes To**:
- Course pages
- Lesson pages
- Learning flows
- Database schema (use existing fields)

---

## Part 5: Implementation Priority

### Phase 1: Voice AI Advisor (Client-Side)
**Effort**: Low (2-3 days)
**Risk**: Low (Web Speech API is well-supported)
**Impact**: High (accessibility, UX improvement)

**Steps**:
1. Create `VoiceControls.tsx`
2. Integrate into `AIAdvisor.tsx`
3. Add voice output toggle
4. Test in major browsers

### Phase 2: Dynamic Jobs Matching
**Effort**: Medium (3-5 days)
**Risk**: Medium (algorithm tuning required)
**Impact**: High (better job recommendations)

**Steps**:
1. Create matching algorithm
2. Modify `/api/jobs` endpoint
3. Test with various student profiles
4. Tune weights based on feedback

### Phase 3: Integration & Polish
**Effort**: Low (1-2 days)
**Risk**: Low
**Impact**: Medium (better UX)

**Steps**:
1. Test voice + jobs integration
2. Add loading states
3. Add error handling
4. Performance optimization

---

## Part 6: Technical Considerations

### Voice AI
**Browser Support**:
- Chrome/Edge: Full support
- Safari: Partial support (may need polyfill)
- Firefox: Limited support (may need fallback)

**Fallback Strategy**:
- If voice not supported → show text input only
- If voice fails → fallback to text
- Always allow text input as backup

**Privacy**:
- Voice data processed client-side (no server storage)
- Only text sent to API (same as current flow)

### Jobs Matching
**Performance**:
- Matching calculation is O(n) where n = number of jobs
- Cache student profile data for request duration
- Consider pagination if job count grows

**Accuracy**:
- Start with simple algorithm
- Tune weights based on user feedback
- Consider ML model in future (out of scope)

**Real-time Updates**:
- Recalculate on each request (most accurate)
- Or cache for 5-10 minutes (better performance)
- Trade-off: accuracy vs performance

---

## Part 7: Success Metrics

### Voice AI
- **Adoption**: % of users enabling voice
- **Usage**: % of messages sent via voice
- **Satisfaction**: User feedback on voice quality
- **Accessibility**: Usage by users with disabilities

### Jobs Matching
- **Accuracy**: % of "recommended" jobs that users apply to
- **Engagement**: Click-through rate on job recommendations
- **Conversion**: % of recommended jobs leading to applications
- **Skills Gap**: Reduction in "locked" jobs over time

---

## Part 8: Future Enhancements (Out of Scope)

### Voice AI
- Multi-language support
- Voice cloning for personalized TTS
- Offline voice processing
- Voice commands (e.g., "Show me jobs")

### Jobs Matching
- ML-based matching model
- Real-time skill gap analysis
- Personalized course recommendations based on job goals
- Application tracking and success metrics

---

## Conclusion

Both features can be added with **minimal changes** to existing codebase:

1. **Voice AI**: Add client-side component, reuse existing chat API
2. **Jobs Matching**: Add matching algorithm, modify existing jobs API

**No refactoring** of learning flows, course pages, or lesson rendering required.

**Estimated Total Effort**: 6-10 days
**Risk Level**: Low-Medium
**Impact**: High (better UX, better job matching)
