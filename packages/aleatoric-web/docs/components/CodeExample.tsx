import { useId, useState } from 'react';
import { highlightCode } from '../lib/code';

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
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static highlighter output */}
        <pre dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
      </div>
    </>
  );
}
