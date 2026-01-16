'use client';

import { getProficiencyLabel, getProficiencyColor, getProficiencyIcon, type ProficiencyLevel } from '@/lib/utils/tool-proficiency';

interface ToolProficiencyBadgeProps {
  toolName: string;
  level: ProficiencyLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ToolProficiencyBadge({
  toolName,
  level,
  showIcon = true,
  size = 'md',
  className = '',
}: ToolProficiencyBadgeProps) {
  const label = getProficiencyLabel(level);
  const colorClass = getProficiencyColor(level);
  const icon = getProficiencyIcon(level);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colorClass} ${sizeClasses[size]} ${className}`}
      title={`${toolName} — ${label}`}
    >
      {showIcon && <span>{icon}</span>}
      <span className="font-semibold">{toolName}</span>
      <span className="text-xs opacity-75">—</span>
      <span>{label}</span>
    </span>
  );
}
