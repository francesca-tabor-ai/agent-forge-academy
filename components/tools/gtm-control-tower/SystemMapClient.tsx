'use client';

import { SystemMap } from './SystemMap';
import type { GTMFailureType } from '@/lib/tools/gtm-control-tower';

interface SystemMapClientProps {
  activeFailureModes?: Set<GTMFailureType>;
}

/**
 * Client wrapper for SystemMap component
 * This allows the SystemMap to be used in server components
 */
export function SystemMapClient({ activeFailureModes }: SystemMapClientProps) {
  return <SystemMap activeFailureModes={activeFailureModes} />;
}
