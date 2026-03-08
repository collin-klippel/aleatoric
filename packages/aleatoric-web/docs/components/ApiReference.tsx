import { useCallback, useState } from 'react';
import {
  API_CATEGORIES,
  type ApiCategory,
  type ApiEntry,
} from '../lib/api-reference';

interface ApiReferenceProps {
  onLoadExample: (code: string) => void;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function ApiEntryRow({
  entry,
  onLoadExample,
}: {
  entry: ApiEntry;
  onLoadExample: (code: string) => void;
}) {
  const onCopy = useCallback(() => {
    void copyToClipboard(entry.example).then((ok) => {
      if (!ok) console.warn('Copy to clipboard failed');
    });
  }, [entry.example]);

  return (
    <li className="api-entry">
      <div className="api-entry-main">
        <code className="api-entry-name">{entry.name}</code>
        {entry.signature && (
          <code className="api-entry-sig">{entry.signature}</code>
        )}
        <span className="api-entry-desc">{entry.description}</span>
        {entry.useCase && (
          <span className="api-entry-use">{entry.useCase}</span>
        )}
      </div>
      <div className="api-entry-actions">
        <button
          type="button"
          className="api-entry-btn"
          onClick={() => onLoadExample(entry.example)}
          title="Load snippet into the editor"
          aria-label={`Load example for ${entry.name} into the editor`}
        >
          Load
        </button>
        <button
          type="button"
          className="api-entry-btn"
          onClick={onCopy}
          title="Copy snippet to clipboard"
          aria-label={`Copy example for ${entry.name}`}
        >
          Copy
        </button>
      </div>
    </li>
  );
}

function CategorySection({
  category,
  onLoadExample,
}: {
  category: ApiCategory;
  onLoadExample: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `api-category-${category.id}`;

  return (
    <div className="api-category">
      <button
        type="button"
        className="api-category-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="api-category-arrow">{open ? '▾' : '▸'}</span>
        <span className="api-category-label">{category.label}</span>
      </button>
      <div className="api-category-body" id={panelId} hidden={!open}>
        <p className="api-category-desc">{category.description}</p>
        <ul className="api-entries">
          {category.entries.map((entry) => (
            <ApiEntryRow
              key={entry.id}
              entry={entry}
              onLoadExample={onLoadExample}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ApiReference({ onLoadExample }: ApiReferenceProps) {
  return (
    <aside
      className="api-sidebar"
      aria-label="API reference and examples"
    >
      <div className="api-sidebar-header">
        <div className="logo">aleatoric</div>
        <div className="tagline">Music through chance</div>
      </div>
      <div className="api-sidebar-content">
        <div className="api-group-label">Playground</div>
        {API_CATEGORIES.filter((c) => c.id === 'playground').map((c) => (
          <CategorySection
            key={c.id}
            category={c}
            onLoadExample={onLoadExample}
          />
        ))}

        <div className="api-group-label">Core</div>
        {API_CATEGORIES.filter((c) => c.id.startsWith('core')).map((c) => (
          <CategorySection
            key={c.id}
            category={c}
            onLoadExample={onLoadExample}
          />
        ))}

        <div className="api-group-label">Random</div>
        {API_CATEGORIES.filter((c) => c.id.startsWith('random')).map((c) => (
          <CategorySection
            key={c.id}
            category={c}
            onLoadExample={onLoadExample}
          />
        ))}

        <div className="api-group-label">Generators</div>
        {API_CATEGORIES.filter((c) => c.id.startsWith('gen')).map((c) => (
          <CategorySection
            key={c.id}
            category={c}
            onLoadExample={onLoadExample}
          />
        ))}

        <div className="api-group-label">Audio</div>
        {API_CATEGORIES.filter((c) => c.id.startsWith('audio')).map((c) => (
          <CategorySection
            key={c.id}
            category={c}
            onLoadExample={onLoadExample}
          />
        ))}

        <div className="api-group-label">Scheduling & Composition</div>
        {API_CATEGORIES.filter(
          (c) => c.id === 'scheduler' || c.id === 'composition',
        ).map((c) => (
          <CategorySection
            key={c.id}
            category={c}
            onLoadExample={onLoadExample}
          />
        ))}
      </div>
    </aside>
  );
}
