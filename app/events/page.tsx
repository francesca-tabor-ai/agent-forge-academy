import { createUserSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function EventsPage() {
  const supabase = await createUserSupabaseClient();

  // Get all events (public read access)
  const { data: events, error } = await supabase
    .from('events')
    .select('id, title, description, start_time, end_time, location, event_type')
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
  }

  return (
    <div className="events-page">
      <h1>Events</h1>
      <p>Upcoming and past events at AgentForge Academy</p>

      {events && events.length > 0 ? (
        <div className="events-list">
          {events.map((event) => {
            const startTime = new Date(event.start_time);
            const endTime = event.end_time ? new Date(event.end_time) : null;

            return (
              <div key={event.id} className="event-card">
                <div className="event-card-header">
                  <h2>
                    <Link href={`/events/${event.id}`}>{event.title}</Link>
                  </h2>
                  <span className="event-type-badge">{event.event_type}</span>
                </div>
                
                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}
                
                <div className="event-details">
                  <div className="event-detail">
                    <strong>Date:</strong>
                    <span>{startTime.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="event-detail">
                    <strong>Time:</strong>
                    <span>
                      {startTime.toLocaleTimeString()}
                      {endTime && ` - ${endTime.toLocaleTimeString()}`}
                    </span>
                  </div>
                  
                  {event.location && (
                    <div className="event-detail">
                      <strong>Location:</strong>
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
                
                <Link href={`/events/${event.id}`} className="btn-primary">
                  View Event
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No events scheduled at this time.</p>
      )}
    </div>
  );
}

