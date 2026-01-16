'use client';

import { useState } from 'react';
import type { WorkflowState, Role, AuditEvent } from '@/lib/tools/content-systems-studio/types';
import type { UseContentSystemsStudioReturn } from '@/lib/tools/content-systems-studio/useContentSystemsStudio';
import { RulesPanel } from './RulesPanel';

interface WorkflowPanelProps {
  studio: UseContentSystemsStudioReturn;
  currentRole: Role;
  onRoleChange?: (role: Role) => void;
  showRoleSelector?: boolean;
}

/**
 * Get the workflow state progression order
 */
const WORKFLOW_STATES: WorkflowState[] = ['draft', 'review', 'approved', 'localised'];

/**
 * Get the next state in the workflow
 */
function getNextState(currentState: WorkflowState): WorkflowState | null {
  const currentIndex = WORKFLOW_STATES.indexOf(currentState);
  if (currentIndex === -1 || currentIndex >= WORKFLOW_STATES.length - 1) {
    return null;
  }
  return WORKFLOW_STATES[currentIndex + 1];
}

/**
 * Get the previous state in the workflow
 */
function getPreviousState(currentState: WorkflowState): WorkflowState | null {
  const currentIndex = WORKFLOW_STATES.indexOf(currentState);
  if (currentIndex <= 0) {
    return null;
  }
  return WORKFLOW_STATES[currentIndex - 1];
}

/**
 * Check if a role can perform a state transition
 */
function canTransition(
  fromState: WorkflowState,
  toState: WorkflowState,
  role: Role
): boolean {
  // Admin can do any transition
  if (role === 'admin') {
    return true;
  }

  // Student can only move Draft → Review
  if (role === 'student') {
    return fromState === 'draft' && toState === 'review';
  }

  // Instructor can move Review → Approved
  if (role === 'instructor') {
    return fromState === 'review' && toState === 'approved';
  }

  return false;
}

/**
 * Check if a role can revert to a previous state
 */
function canRevert(fromState: WorkflowState, toState: WorkflowState, role: Role): boolean {
  // Admin can revert to any previous state
  if (role === 'admin') {
    const fromIndex = WORKFLOW_STATES.indexOf(fromState);
    const toIndex = WORKFLOW_STATES.indexOf(toState);
    return toIndex < fromIndex;
  }

  // Instructor can revert Review → Draft
  if (role === 'instructor') {
    return fromState === 'review' && toState === 'draft';
  }

  // Student cannot revert
  return false;
}

/**
 * Get state display label
 */
function getStateLabel(state: WorkflowState): string {
  const labels: Record<WorkflowState, string> = {
    draft: 'Draft',
    review: 'In Review',
    approved: 'Approved',
    localised: 'Localised',
  };
  return labels[state];
}

/**
 * Get state color classes
 */
function getStateColorClasses(state: WorkflowState): string {
  const colors: Record<WorkflowState, string> = {
    draft: 'bg-gray-100 text-gray-800 border-gray-300',
    review: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    localised: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  return colors[state];
}

export function WorkflowPanel({
  studio,
  currentRole,
  onRoleChange,
  showRoleSelector = false,
}: WorkflowPanelProps) {
  const [commentText, setCommentText] = useState('');
  const [localRole, setLocalRole] = useState<Role>(currentRole);

  const { state, selectedItem, transitionState, addComment } = studio;

  const activeRole = showRoleSelector ? localRole : currentRole;

  if (!selectedItem) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">Select a content item to view its workflow.</p>
      </div>
    );
  }

  const currentState = selectedItem.status;
  const nextState = getNextState(currentState);
  const previousState = getPreviousState(currentState);

  // Get audit events for this item
  const itemAuditEvents = state.auditLog.filter(
    (event) => event.metadata?.itemId === selectedItem.id
  );

  // Get comments (audit events with action 'add_comment')
  const comments = itemAuditEvents.filter((event) => event.action === 'add_comment');

  // Get state transitions
  const transitions = itemAuditEvents.filter(
    (event) => event.action === 'transition_state'
  );

  const handleTransition = (toState: WorkflowState) => {
    if (!canTransition(currentState, toState, activeRole)) {
      return;
    }

    transitionState(selectedItem.id, currentState, toState, activeRole);
  };

  const handleRevert = (toState: WorkflowState) => {
    if (!canRevert(currentState, toState, activeRole)) {
      return;
    }

    transitionState(selectedItem.id, currentState, toState, activeRole, 'Reverted to previous state');
  };

  const handleAddComment = () => {
    if (!commentText.trim()) {
      return;
    }

    addComment(selectedItem.id, commentText.trim(), activeRole);
    setCommentText('');
  };

  const handleRoleChange = (newRole: Role) => {
    setLocalRole(newRole);
    if (onRoleChange) {
      onRoleChange(newRole);
    }
  };

  // Check if there are blocking rules
  const blockingRules = state.ruleResults.filter((r) => r.status === 'block');
  const warnings = state.ruleResults.filter((r) => r.status === 'warn');
  const hasBlockingRules = blockingRules.length > 0;

  return (
    <div className="space-y-6">
      {/* No Black-Box Behavior Statement */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">No black-box behavior:</span> All workflow transitions are explicit, 
              permission-based, and fully audited. Every state change is traceable with complete context.
            </p>
          </div>
        </div>
      </div>

      {/* Role Selector (for demo) */}
      {showRoleSelector && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Role (Demo)
          </label>
          <select
            value={activeRole}
            onChange={(e) => handleRoleChange(e.target.value as Role)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
          <p className="mt-2 text-xs text-gray-500">
            Permissions: Student (Draft→Review), Instructor (Review→Approved), Admin (All)
          </p>
        </div>
      )}

      {/* Current State Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Workflow State</h2>
            <p className="text-sm text-gray-500 mt-1">Current status of this content item</p>
          </div>
          <div
            className={`px-4 py-2 rounded-lg border-2 font-semibold ${getStateColorClasses(
              currentState
            )}`}
          >
            {getStateLabel(currentState)}
          </div>
        </div>

        {/* State Progression Visualization */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            {WORKFLOW_STATES.map((state, index) => {
              const isActive = state === currentState;
              const isPast = WORKFLOW_STATES.indexOf(currentState) > index;
              const isFuture = WORKFLOW_STATES.indexOf(currentState) < index;

              return (
                <div key={state} className="flex items-center flex-1">
                  <div className="flex items-center flex-1">
                    <div
                      className={`flex-1 h-2 rounded ${
                        isPast
                          ? 'bg-green-500'
                          : isActive
                          ? 'bg-blue-500'
                          : 'bg-gray-200'
                      }`}
                    />
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm border-2 ${
                        isActive
                          ? 'bg-blue-500 text-white border-blue-600'
                          : isPast
                          ? 'bg-green-500 text-white border-green-600'
                          : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div
                      className={`flex-1 h-2 rounded ${
                        isPast
                          ? 'bg-green-500'
                          : isActive
                          ? 'bg-blue-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  </div>
                  {index < WORKFLOW_STATES.length - 1 && (
                    <div className="w-4 h-0.5 bg-gray-300" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {WORKFLOW_STATES.map((state) => (
              <span key={state} className="capitalize">
                {state}
              </span>
            ))}
          </div>
        </div>

        {/* Transition Buttons */}
        <div className="space-y-3">
          {nextState && (
            <button
              onClick={() => handleTransition(nextState)}
              disabled={
                !canTransition(currentState, nextState, activeRole) || hasBlockingRules
              }
              className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                canTransition(currentState, nextState, activeRole) && !hasBlockingRules
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Advance to {getStateLabel(nextState)}
              {hasBlockingRules && ' (Blocked by rules)'}
            </button>
          )}

          {previousState && (
            <button
              onClick={() => handleRevert(previousState)}
              disabled={!canRevert(currentState, previousState, activeRole)}
              className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                canRevert(currentState, previousState, activeRole)
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Revert to {getStateLabel(previousState)}
            </button>
          )}

          {!nextState && (
            <div className="text-center text-sm text-gray-500 py-2">
              Content is in the final state
            </div>
          )}
        </div>
      </div>

      {/* Rules Integration */}
      {state.ruleResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rule Results</h3>
          <RulesPanel
            studio={studio}
            ruleResults={state.ruleResults}
            onAcknowledgeWarnings={(codes) => {
              studio.ackWarnings(selectedItem.id, codes);
            }}
            showAcknowledgeCheckbox={true}
          />
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>

        {/* Add Comment */}
        <div className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Comment
          </button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet.</p>
          ) : (
            comments.map((comment, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.actorRole}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {comment.metadata?.comment as string}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Audit Trail */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Trail</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transitions.length === 0 && comments.length === 0 ? (
            <p className="text-sm text-gray-500">No audit events yet.</p>
          ) : (
            [...transitions, ...comments]
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((event, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md p-3 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {event.action === 'transition_state'
                        ? `${event.fromState} → ${event.toState}`
                        : 'Comment added'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Actor:</span> {event.actorRole}
                    {event.metadata?.comment && (
                      <>
                        <br />
                        <span className="font-medium">Comment:</span>{' '}
                        {event.metadata.comment as string}
                      </>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
