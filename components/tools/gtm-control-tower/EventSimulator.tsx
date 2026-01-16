'use client';

import { useReducer, useCallback } from 'react';
import type { GTMEventType } from '@/lib/tools/gtm-control-tower';

/**
 * Simplified event entry for the simulator
 */
export interface SimulatedEvent {
  id: string;
  type: GTMEventType;
  timestamp: Date;
  label: string;
}

/**
 * Event labels for display
 */
const EVENT_LABELS: Record<GTMEventType, string> = {
  new_inbound_lead: 'New Inbound Lead',
  funding_event: 'Funding Event',
  intent_spike: 'Intent Spike',
  lead_reassigned: 'Lead Reassigned',
  duplicate_created: 'Duplicate Created',
  field_update_delayed: 'Field Update Delayed',
};

/**
 * Action types for the event reducer
 */
type EventAction =
  | { type: 'ADD_EVENT'; payload: SimulatedEvent }
  | { type: 'CLEAR_EVENTS' };

/**
 * State for the event simulator
 */
interface EventSimulatorState {
  events: SimulatedEvent[];
}

/**
 * Reducer for managing event simulator state
 */
function eventReducer(
  state: EventSimulatorState,
  action: EventAction
): EventSimulatorState {
  switch (action.type) {
    case 'ADD_EVENT': {
      return {
        events: [...state.events, action.payload],
      };
    }
    case 'CLEAR_EVENTS': {
      return {
        events: [],
      };
    }
    default:
      return state;
  }
}

interface EventSimulatorProps {
  onEventAdded?: (event: SimulatedEvent) => void;
}

/**
 * Event Simulator Component
 * Allows users to simulate GTM events and view event history
 */
export function EventSimulator({ onEventAdded }: EventSimulatorProps) {
  const [state, dispatch] = useReducer(eventReducer, { events: [] });

  const handleAddEvent = useCallback(
    (type: GTMEventType) => {
      const newEvent: SimulatedEvent = {
        id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type,
        timestamp: new Date(),
        label: EVENT_LABELS[type],
      };
      dispatch({ type: 'ADD_EVENT', payload: newEvent });
      // Notify parent if callback provided
      if (onEventAdded) {
        onEventAdded(newEvent);
      }
    },
    [onEventAdded]
  );

  const handleReplayLast = useCallback(() => {
    if (state.events.length === 0) {
      return;
    }
    const lastEvent = state.events[state.events.length - 1];
    // Create the replayed event once
    const replayedEvent: SimulatedEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: lastEvent.type,
      timestamp: new Date(),
      label: lastEvent.label,
    };
    // Use ADD_EVENT to ensure consistency
    dispatch({ type: 'ADD_EVENT', payload: replayedEvent });
    // Notify parent if callback provided
    if (onEventAdded) {
      onEventAdded(replayedEvent);
    }
  }, [state.events, onEventAdded]);

  const handleClearEvents = useCallback(() => {
    dispatch({ type: 'CLEAR_EVENTS' });
  }, []);

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    }).format(date);
  };

  const eventTypes: GTMEventType[] = [
    'new_inbound_lead',
    'funding_event',
    'intent_spike',
    'lead_reassigned',
    'duplicate_created',
    'field_update_delayed',
  ];

  return (
    <div className="space-y-4">
      {/* Event Buttons */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Trigger Events</h3>
        <div className="grid grid-cols-2 gap-2">
          {eventTypes.map((eventType) => (
            <button
              key={eventType}
              onClick={() => handleAddEvent(eventType)}
              className="px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors text-left"
            >
              {EVENT_LABELS[eventType]}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={handleReplayLast}
          disabled={state.events.length === 0}
          className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Replay Last Event
        </button>
        {state.events.length > 0 && (
          <button
            onClick={handleClearEvents}
            className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Event History */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Event History ({state.events.length})
          </h3>
        </div>
        {state.events.length === 0 ? (
          <p className="text-sm text-gray-500 italic py-4 text-center">
            No events yet. Trigger an event to see it here.
          </p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto border border-gray-200 rounded p-2">
            {state.events
              .slice()
              .reverse()
              .map((event) => (
                <div
                  key={event.id}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{event.label}</span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {event.type}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
