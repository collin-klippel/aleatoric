import { useId, useState } from 'react';
import { highlightCode } from '../lib/code';
import CopyButton from './CopyButton';

interface CodeExampleProps {
  code: string;
}

export default function CodeExample({ code }: CodeExampleProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <>
      <button
        type="button"
        className="code-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {open ? '▲ Hide code' : '▼ View code'}
      </button>
      <div
        id={panelId}
        className={`code-block ${open ? 'open' : ''}`}
        hidden={!open}
      >
        <div className="code-block-header">
          <CopyButton text={code} label="Copy code" />
        </div>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static highlighter output */}
        <pre dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
      </div>
    </>
  );
}
