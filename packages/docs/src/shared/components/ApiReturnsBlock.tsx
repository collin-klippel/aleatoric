import type { ApiReturns } from '../lib/docs-api-reference-types';

interface ApiReturnsBlockProps {
  returns?: ApiReturns;
}

export default function ApiReturnsBlock({ returns }: ApiReturnsBlockProps) {
  if (!returns) return null;

  return (
    <div className="api-returns-section">
      <h4 className="api-section-title">Returns</h4>
      <div className="api-returns-content">
        <div className="api-returns-type">
          <code className="type-annotation">{returns.type}</code>
        </div>
        <div className="api-returns-description">{returns.description}</div>
      </div>
    </div>
  );
}
