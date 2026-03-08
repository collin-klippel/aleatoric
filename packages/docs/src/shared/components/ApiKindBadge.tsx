import type { ApiKind } from '../lib/docs-api-reference-types';

interface ApiKindBadgeProps {
  kind?: ApiKind;
}

const BADGE_CONFIG: Record<ApiKind, { label: string; icon: string }> = {
  function: { label: 'Function', icon: 'ƒ' },
  class: { label: 'Class', icon: 'C' },
  interface: { label: 'Interface', icon: 'I' },
  constant: { label: 'Constant', icon: '=' },
  enum: { label: 'Enum', icon: 'E' },
};

export default function ApiKindBadge({ kind }: ApiKindBadgeProps) {
  if (!kind) return null;

  const config = BADGE_CONFIG[kind];

  return (
    <span className={`api-kind-badge api-kind-${kind}`} title={config.label}>
      <span className="api-kind-icon">{config.icon}</span>
      <span className="api-kind-label">{config.label}</span>
    </span>
  );
}
