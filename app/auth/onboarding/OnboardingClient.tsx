'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Role = 'student' | 'instructor' | 'recruiter';

export default function OnboardingClient() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('You must be logged in to complete onboarding');
        setLoading(false);
        return;
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role, onboarding_completed')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        if (existingProfile.onboarding_completed) {
          // Already completed, redirect
          router.push('/app');
          return;
        }
        if (existingProfile.role) {
          // Role already set, cannot change
          setError('Your role has already been set. Contact an administrator if you need to change it.');
          setLoading(false);
          return;
        }
      }

      // Create or update profile with role and mark onboarding as completed
      const profileData = {
        user_id: user.id,
        role: selectedRole,
        onboarding_completed: true,
      };

      let error;
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);
        error = insertError;
      }

      if (error) {
        setError(error.message || 'Failed to complete onboarding');
        setLoading(false);
        return;
      }

      // Apply referral attribution from cookies (if present)
      try {
        await fetch('/api/profile/attribution', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        // Attribution is applied silently - don't fail onboarding if it fails
      } catch (attributionError) {
        console.warn('Failed to apply referral attribution:', attributionError);
        // Continue with onboarding even if attribution fails
      }

      // Create role-specific profile if needed
      if (selectedRole === 'student') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          // Check if student_profile already exists
          const { data: existingStudentProfile } = await supabase
            .from('student_profiles')
            .select('id')
            .eq('profile_id', profile.id)
            .single();

          if (!existingStudentProfile) {
            await supabase.from('student_profiles').insert({
              profile_id: profile.id,
              visibility: 'private',
            });
          }
        }
      } else if (selectedRole === 'recruiter') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          // Check if recruiter_profile already exists
          const { data: existingRecruiterProfile } = await supabase
            .from('recruiter_profiles')
            .select('id')
            .eq('profile_id', profile.id)
            .single();

          if (!existingRecruiterProfile) {
            await supabase.from('recruiter_profiles').insert({
              profile_id: profile.id,
            });
          }
        }
      }

      // Redirect to appropriate dashboard
      if (selectedRole === 'student') {
        router.push('/student/dashboard');
      } else if (selectedRole === 'instructor') {
        router.push('/tutor/dashboard');
      } else if (selectedRole === 'recruiter') {
        router.push('/recruiter/directory');
      } else {
        router.push('/app');
      }
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Welcome to AI Growth Hub</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Please select your role to complete onboarding. This cannot be changed later.
      </p>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            marginBottom: '1rem',
            color: '#c33',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '2rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '1rem',
              fontWeight: '500',
              fontSize: '1.1rem',
            }}
          >
            Select Your Role
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: selectedRole === 'student' ? '2px solid #0070f3' : '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedRole === 'student' ? '#f0f7ff' : 'white',
              }}
            >
              <input
                type="radio"
                name="role"
                value="student"
                checked={selectedRole === 'student'}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                style={{ marginRight: '0.75rem', width: '20px', height: '20px' }}
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Student</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Learn, build projects, create portfolio, ask questions
                </div>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: selectedRole === 'instructor' ? '2px solid #0070f3' : '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedRole === 'instructor' ? '#f0f7ff' : 'white',
              }}
            >
              <input
                type="radio"
                name="role"
                value="instructor"
                checked={selectedRole === 'instructor'}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                style={{ marginRight: '0.75rem', width: '20px', height: '20px' }}
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Instructor</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Answer student questions, host office hours, mark accepted answers
                </div>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: selectedRole === 'recruiter' ? '2px solid #0070f3' : '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedRole === 'recruiter' ? '#f0f7ff' : 'white',
              }}
            >
              <input
                type="radio"
                name="role"
                value="recruiter"
                checked={selectedRole === 'recruiter'}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                style={{ marginRight: '0.75rem', width: '20px', height: '20px' }}
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Recruiter</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Discover talent, request contact with students, attend demo days
                </div>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedRole}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading || !selectedRole ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading || !selectedRole ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Completing onboarding...' : 'Complete Onboarding'}
        </button>
      </form>
    </main>
  );
}

