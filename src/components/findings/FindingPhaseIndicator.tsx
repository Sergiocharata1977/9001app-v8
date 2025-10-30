'use client';

import type { Finding } from '@/types/findings';

interface FindingPhaseIndicatorProps {
  phase: Finding['currentPhase'];
}

const phaseConfig = {
  detection: { label: 'Fase 1: Detección', color: 'bg-blue-100 text-blue-800' },
  treatment: {
    label: 'Fase 2: Tratamiento',
    color: 'bg-orange-100 text-orange-800',
  },
  control: { label: 'Fase 3: Control', color: 'bg-green-100 text-green-800' },
};

export function FindingPhaseIndicator({ phase }: FindingPhaseIndicatorProps) {
  const config = phaseConfig[phase];
  return (
    <div className="flex items-center gap-2">
      <div className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </div>
    </div>
  );
}
