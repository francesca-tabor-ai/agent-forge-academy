/**
 * Clinical AI Sandbox - Mode-Specific Copy
 * 
 * Provides copy and emphasis based on viewing mode.
 * Core behavior remains unchanged - only presentation differs.
 */

import type { ViewingMode } from './types';

export interface ModeCopy {
  header: {
    title: string;
    subtitle: string;
  };
  emphasis: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  description: string;
}

export const MODE_COPY: Record<ViewingMode, ModeCopy> = {
  regulator: {
    header: {
      title: 'Clinical AI Sandbox',
      subtitle: 'Demonstrating boundaries, sources, and auditability',
    },
    emphasis: {
      primary: 'Boundaries & Safety',
      secondary: 'Source Attribution',
      tertiary: 'Audit Trail',
    },
    description: 'This tool demonstrates how clinical AI systems can be designed with explicit boundaries, transparent source attribution, and comprehensive audit trails. All decisions are deterministic, traceable, and conservative by default.',
  },
  'hiring-panel': {
    header: {
      title: 'Clinical AI Sandbox',
      subtitle: 'Product judgment, trade-offs, and architecture thinking',
    },
    emphasis: {
      primary: 'Product Judgment',
      secondary: 'Technical Trade-offs',
      tertiary: 'Architecture Decisions',
    },
    description: 'This tool demonstrates product thinking in clinical AI: how to balance safety with usability, make technical trade-offs explicit, and design systems that are both safe and practical. All decisions are deterministic, traceable, and conservative by default.',
  },
};

export function getModeCopy(mode: ViewingMode): ModeCopy {
  return MODE_COPY[mode];
}
