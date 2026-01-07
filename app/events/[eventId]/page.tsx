import { createUserSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface DemoDayPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function DemoDayPage({ params }: DemoDayPageProps) {
  const { eventId } = await params;
  const supabase = await createUserSupabaseClient();

  // Get event (public read access)
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, title, description, start_time, end_time, location, recording_url, event_type')
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // Get presentations for this event
  const { data: presentations, error: presentationsError } = await supabase
    .from('event_presentations')
    .select(
      `
      id,
      presentation_title,
      presentation_order,
      student_profiles!inner (
        id,
        profiles!inner (
          id
        )
      ),
      portfolio_projects (
        id,
        title
      )
    `
    )
    .eq('event_id', eventId)
    .order('presentation_order', { ascending: true, nullsFirst: false });

  if (presentationsError) {
    console.error('Error fetching presentations:', presentationsError);
  }

  // Format event time
  const startTime = new Date(event.start_time);
  const endTime = event.end_time ? new Date(event.end_time) : null;

  return (
    <div className="demo-day-page">
      <div className="event-header">
        <h1>{event.title}</h1>
        {event.description && <p className="event-description">{event.description}</p>}
        
        <div className="event-details">
          <div className="event-detail">
            <strong>Date & Time:</strong>
            <span>
              {startTime.toLocaleDateString()} {startTime.toLocaleTimeString()}
              {endTime && ` - ${endTime.toLocaleTimeString()}`}
            </span>
          </div>
          
          {event.location && (
            <div className="event-detail">
              <strong>Location:</strong>
              <span>{event.location}</span>
            </div>
          )}
          
          {event.recording_url && (
            <div className="event-detail">
              <strong>Recording:</strong>
              <a href={event.recording_url} target="_blank" rel="noopener noreferrer">
                Watch Recording
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="presentations-section">
        <h2>Student Presentations</h2>
        
        {presentations && presentations.length > 0 ? (
          <div className="presentations-list">
            {presentations.map((presentation) => {
              const studentProfileId = presentation.student_profiles?.[0]?.id;
              const project = Array.isArray(presentation.portfolio_projects) 
                ? presentation.portfolio_projects[0] 
                : presentation.portfolio_projects;
              
              return (
                <div key={presentation.id} className="presentation-card">
                  <div className="presentation-header">
                    {presentation.presentation_order && (
                      <span className="presentation-order">
                        #{presentation.presentation_order}
                      </span>
                    )}
                    <h3>
                      {presentation.presentation_title || 
                       (project && typeof project === 'object' && 'title' in project 
                         ? project.title 
                         : 'Untitled Presentation')}
                    </h3>
                  </div>
                  
                  {studentProfileId && (
                    <div className="presentation-actions">
                      <Link
                        href={`/portfolio/${studentProfileId}`}
                        className="btn-primary"
                      >
                        View Portfolio
                      </Link>
                      {project && typeof project === 'object' && 'id' in project && (
                        <Link
                          href={`/portfolio/${studentProfileId}?project=${project.id}`}
                          className="btn-secondary"
                        >
                          View Project
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p>No presentations scheduled for this event.</p>
        )}
      </div>

      {event.event_type === 'demo_day' && (
        <div className="event-schedule">
          <h2>Event Schedule</h2>
          <p>
            Presentations will be shown in the order listed above. 
            Each student will present their project and answer questions.
          </p>
        </div>
      )}
    </div>
  );
}

