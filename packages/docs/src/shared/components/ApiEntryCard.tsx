import { useId, useState } from 'react';
import { highlightCode } from '../lib/code';
import type { ApiEntry } from '../lib/docs-api-reference-types';
import ApiEnumTable from './ApiEnumTable';
import ApiKindBadge from './ApiKindBadge';
import ApiParametersTable from './ApiParametersTable';
import ApiReturnsBlock from './ApiReturnsBlock';
import CopyButton from './CopyButton';
import DocsLinkedText from './DocsLinkedText';

interface ApiEntryCardProps {
  entry: ApiEntry;
}

export default function ApiEntryCard({ entry }: ApiEntryCardProps) {
  const [codeOpen, setCodeOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="api-entry-card">
      <div className="api-entry-header">
        <div className="api-entry-title-group">
          <ApiKindBadge kind={entry.kind} />
          <code className="api-entry-name">{entry.name}</code>
        </div>
      </div>

      {entry.signature && (
        <div className="api-entry-signature">
          <code>{entry.signature}</code>
        </div>
      )}

      <div className="api-entry-description">
        <DocsLinkedText text={entry.description} />
      </div>

      {entry.useCase && (
        <div className="api-entry-use-case">
          <strong>Use case:</strong> <DocsLinkedText text={entry.useCase} />
        </div>
      )}

      <ApiEnumTable values={entry.enumValues} />
      <ApiParametersTable parameters={entry.parameters} />
      <ApiReturnsBlock returns={entry.returns} />

      {entry.relatedApis && entry.relatedApis.length > 0 && (
        <div className="api-entry-related">
          <h4 className="api-section-title">Related APIs</h4>
          <div className="api-related-links">
            {entry.relatedApis.map((apiId) => (
              <a
                key={apiId}
                href={`#${apiId}`}
                className="api-related-link"
                title={`Related: ${apiId}`}
              >
                {apiId.split('/').pop()}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="api-entry-example">
        <button
          type="button"
          className="code-toggle"
          onClick={() => setCodeOpen((o) => !o)}
          aria-expanded={codeOpen}
          aria-controls={panelId}
        >
          {codeOpen ? '▲ Hide code' : '▼ View code'}
        </button>
        <div
          id={panelId}
          className={`code-block ${codeOpen ? 'open' : ''}`}
          hidden={!codeOpen}
        >
          <div className="code-block-header">
            <CopyButton text={entry.example} label="Copy code" />
          </div>
          <pre
            // biome-ignore lint/security/noDangerouslySetInnerHtml suppressions/unused: output is from controlled syntax highlighter
            dangerouslySetInnerHTML={{ __html: highlightCode(entry.example) }}
          />
        </div>
      </div>
    </div>
  );
}
