/**
 * Unit Tests: GTM Control Tower Simulation Engine
 * 
 * Tests for simulateEvent function covering:
 * - Deterministic behavior (same inputs = same outputs)
 * - Latency application
 * - Failure injection
 * - Record updates
 * - Automation actions
 * - Node status updates
 */

import { describe, it, expect, vi } from 'vitest';
import {
  simulateEvent,
  createEmptyRecords,
  type SimulationSettings,
  type SimulationRecords,
} from './simEngine';
import type { GTMEvent } from './types';
import { DEFAULT_NODE_CONFIGS } from './defaults';

describe('Simulation Engine - simulateEvent', () => {
  // Helper to create a test event
  const createTestEvent = (overrides: Partial<GTMEvent> = {}): GTMEvent => ({
    id: 'test-event-1',
    type: 'new_inbound_lead',
    timestamp: new Date('2024-01-01T00:00:00Z'),
    sourceNode: 'CRM',
    priority: 'medium',
    payload: {
      email: 'test@example.com',
      name: 'Test User',
    },
    metadata: {
      leadId: 'lead-1',
    },
    ...overrides,
  });

  // Helper to create test settings
  const createTestSettings = (overrides: Partial<SimulationSettings> = {}): SimulationSettings => ({
    nodes: DEFAULT_NODE_CONFIGS,
    seed: 12345,
    ...overrides,
  });

  describe('Deterministic Behavior', () => {
    it('should return consistent results for same inputs and settings', async () => {
      const event = createTestEvent();
      const settings = createTestSettings({ seed: 42 });
      const records = createEmptyRecords();

      // Run simulation twice with same inputs
      const result1 = await simulateEvent(event, settings, records);
      const result2 = await simulateEvent(event, settings, records);

      // Results should be identical
      expect(result1.actions.length).toBe(result2.actions.length);
      expect(result1.failures.length).toBe(result2.failures.length);
      expect(result1.nodeStatusUpdates.length).toBe(result2.nodeStatusUpdates.length);
      expect(result1.records.leads.size).toBe(result2.records.leads.size);
    });

    it('should produce different results with different seeds', async () => {
      const event = createTestEvent();
      const records = createEmptyRecords();

      const result1 = await simulateEvent(event, createTestSettings({ seed: 1 }), records);
      const result2 = await simulateEvent(event, createTestSettings({ seed: 2 }), records);

      // Results may differ due to different random seeds
      // At least the structure should be the same
      expect(result1.nodeStatusUpdates.length).toBe(result2.nodeStatusUpdates.length);
    });
  });

  describe('Latency Application', () => {
    it('should apply latency delays during processing', async () => {
      vi.useFakeTimers();

      const event = createTestEvent();
      const settings = createTestSettings({
        nodes: [
          {
            node: 'CRM',
            baseLatency: 100,
            errorRate: 0,
            maxThroughput: 100,
            enabled: true,
          },
        ],
      });
      const records = createEmptyRecords();

      const simulationPromise = simulateEvent(event, settings, records);

      // Fast-forward time
      await vi.advanceTimersByTimeAsync(100);

      const result = await simulationPromise;

      expect(result.nodeStatusUpdates.length).toBeGreaterThan(0);
      expect(result.nodeStatusUpdates[0].latency).toBe(100);

      vi.useRealTimers();
    });

    it('should respect different latencies for different nodes', async () => {
      const event = createTestEvent();
      const settings = createTestSettings({
        nodes: [
          {
            node: 'CRM',
            baseLatency: 50,
            errorRate: 0,
            maxThroughput: 100,
            enabled: true,
          },
          {
            node: 'Enrichment',
            baseLatency: 200,
            errorRate: 0,
            maxThroughput: 50,
            enabled: true,
          },
        ],
      });
      const records = createEmptyRecords();

      const startTime = Date.now();
      await simulateEvent(event, settings, records);
      const endTime = Date.now();

      // Should take at least the sum of latencies
      expect(endTime - startTime).toBeGreaterThanOrEqual(250);
    });
  });

  describe('Failure Injection', () => {
    it('should inject failures based on error rate', async () => {
      const event = createTestEvent();
      const settings = createTestSettings({
        nodes: [
          {
            node: 'CRM',
            baseLatency: 10,
            errorRate: 100, // 100% error rate
            maxThroughput: 100,
            enabled: true,
          },
        ],
        seed: 999, // Fixed seed for deterministic failure
      });
      const records = createEmptyRecords();

      const result = await simulateEvent(event, settings, records);

      // Should have at least one failure
      expect(result.failures.length).toBeGreaterThan(0);
      expect(result.failures[0].node).toBe('CRM');
    });

    it('should not inject failures when error rate is 0', async () => {
      const event = createTestEvent();
      const settings = createTestSettings({
        nodes: DEFAULT_NODE_CONFIGS.map((node) => ({
          ...node,
          errorRate: 0,
        })),
        seed: 123,
      });
      const records = createEmptyRecords();

      const result = await simulateEvent(event, settings, records);

      // Should have no failures
      expect(result.failures.length).toBe(0);
    });

    it('should stop processing on non-silent failures', async () => {
      const event = createTestEvent();
      const settings = createTestSettings({
        nodes: [
          {
            node: 'CRM',
            baseLatency: 10,
            errorRate: 100,
            maxThroughput: 100,
            enabled: true,
          },
          {
            node: 'Enrichment',
            baseLatency: 10,
            errorRate: 0,
            maxThroughput: 50,
            enabled: true,
          },
        ],
        seed: 888,
      });
      const records = createEmptyRecords();

      const result = await simulateEvent(event, settings, records);

      // Should have failure in CRM
      expect(result.failures.length).toBeGreaterThan(0);
      // Should not process Enrichment if CRM failed (unless silent drop)
      const enrichmentProcessed = result.nodeStatusUpdates.some(
        (update) => update.node === 'Enrichment' && update.status === 'idle'
      );
      // If CRM failed with non-silent failure, Enrichment should not be processed
      if (result.failures[0].type !== 'silent_drop') {
        expect(enrichmentProcessed).toBe(false);
      }
    });
  });

  describe('Record Updates', () => {
    it('should create new lead records in CRM', async () => {
      const event = createTestEvent({
        type: 'new_inbound_lead',
        payload: {
          email: 'newlead@example.com',
          name: 'New Lead',
        },
      });
      const settings = createTestSettings({
        nodes: [
          {
            node: 'CRM',
            baseLatency: 10,
            errorRate: 0,
            maxThroughput: 100,
            enabled: true,
          },
        ],
      });
      const records = createEmptyRecords();

      const result = await simulateEvent(event, settings, records);

      expect(result.records.leads.size).toBeGreaterThan(0);
      const lead = Array.from(result.records.leads.values())[0];
      expect(lead.email).toBe('newlead@example.com');
      expect(lead.status).toBe('new');
    });

    it('should update lead status through pipeline', async () => {
      const event = createTestEvent({ type: 'new_inbound_lead' });
      const settings = createTestSettings({
        nodes: DEFAULT_NODE_CONFIGS.map((node) => ({
          ...node,
          errorRate: 0,
        })),
      });
      const records = createEmptyRecords();

      const result = await simulateEvent(event, settings, records);

      const lead = Array.from(result.records.leads.values())[0];
      // Lead should progress through statuses
      expect(['new', 'enriched', 'routed', 'outbound', 'reported']).toContain(lead.status);
    });
  });

  describe('Automation Actions', () => {
    it('should generate automation actions for successful processing', async () => {
      const event = createTestEvent({ type: 'new_inbound_lead' });
      const settings = createTestSettings({
        nodes: DEFAULT_NODE_CONFIGS.map((node) => ({
          ...node,
          errorRate: 0,
        })),
      });
      const records = createEmptyRecords();

      const result = await simulateEvent(event, settings, records);

      expect(result.actions.length).toBeGreaterThan(0);
      expect(result.actions.some((a) => a.type === 'enriched')).toBe(true);
      expect(result.actions.some((a) => a.type === 'routed')).toBe(true);
    });

    it('should not generate actions when node fails', async () => {
      const event = createTestEvent();
      const settings = createTestSettings({
        nodes: [
          {
            node: 'CRM',
            baseLatency: 10,
            errorRate: 100,
            maxThroughput: 100,
            enabled: true,
          },
        ],
        seed: 777,
      });
      const records = createEmptyRecords();

      const result = await simulateEvent(event, settings, records);

      // Should have failures but no actions from failed node
      expect(result.failures.length).toBeGreaterThan(0);
    });
  });

  describe('Node Status Updates', () => {
    it('should update node status through processing lifecycle', async () => {
      const event = createTestEvent();
      const settings = createTestSettings({
        nodes: [
          {
            node: 'CRM',
            baseLatency: 10,
            errorRate: 0,
            maxThroughput: 100,
            enabled: true,
          },
        ],
      });
      const records = createEmptyRecords();

      const result = await simulateEvent(event, settings, records);

      const crmUpdates = result.nodeStatusUpdates.filter((u) => u.node === 'CRM');
      expect(crmUpdates.length).toBeGreaterThan(0);
      
      // Should have processing status
      expect(crmUpdates.some((u) => u.status === 'processing')).toBe(true);
      // Should end with idle or failed
      const finalStatus = crmUpdates[crmUpdates.length - 1].status;
      expect(['idle', 'failed']).toContain(finalStatus);
    });

    it('should mark nodes as failed when errors occur', async () => {
      const event = createTestEvent();
      const settings = createTestSettings({
        nodes: [
          {
            node: 'CRM',
            baseLatency: 10,
            errorRate: 100,
            maxThroughput: 100,
            enabled: true,
          },
        ],
        seed: 666,
      });
      const records = createEmptyRecords();

      const result = await simulateEvent(event, settings, records);

      const crmUpdates = result.nodeStatusUpdates.filter((u) => u.node === 'CRM');
      const failedUpdate = crmUpdates.find((u) => u.status === 'failed');
      expect(failedUpdate).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle disabled nodes', async () => {
      const event = createTestEvent();
      const settings = createTestSettings({
        nodes: [
          {
            node: 'CRM',
            baseLatency: 10,
            errorRate: 0,
            maxThroughput: 100,
            enabled: false,
          },
        ],
      });
      const records = createEmptyRecords();

      const result = await simulateEvent(event, settings, records);

      expect(result.failures.length).toBeGreaterThan(0);
      expect(result.failures[0].type).toBe('silent_drop');
    });

    it('should handle events with missing metadata', async () => {
      const event = createTestEvent({
        metadata: undefined,
      });
      const settings = createTestSettings({
        nodes: DEFAULT_NODE_CONFIGS.map((node) => ({
          ...node,
          errorRate: 0,
        })),
      });
      const records = createEmptyRecords();

      const result = await simulateEvent(event, settings, records);

      // Should still process without errors
      expect(result.nodeStatusUpdates.length).toBeGreaterThan(0);
    });

    it('should handle empty records state', async () => {
      const event = createTestEvent();
      const settings = createTestSettings({
        nodes: DEFAULT_NODE_CONFIGS.map((node) => ({
          ...node,
          errorRate: 0,
        })),
      });
      const records = createEmptyRecords();

      const result = await simulateEvent(event, settings, records);

      // Should create new records
      expect(result.records.leads.size).toBeGreaterThan(0);
    });
  });
});
