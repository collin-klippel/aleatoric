import { javascript } from '@codemirror/lang-javascript';
import { Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { useCallback } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onToggleLoop: () => void;
}

const editorTheme = EditorView.theme({
  '&': {
    fontSize: '13.5px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  '.cm-content': {
    padding: '16px 0',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: '1px solid var(--border-light)',
    color: 'var(--text-dim)',
    fontSize: '12px',
    minWidth: '40px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--accent-glow)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--accent-glow)',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'var(--accent)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  '&.cm-focused': {
    outline: '2px solid var(--accent)',
    outlineOffset: '2px',
  },
});

export default function Editor({
  value,
  onChange,
  onRun,
  onToggleLoop,
}: EditorProps) {
  const playgroundKeymap = useCallback(
    () =>
      Prec.high(
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              onRun();
              return true;
            },
          },
          {
            key: 'Mod-l',
            run: () => {
              onToggleLoop();
              return true;
            },
          },
        ]),
      ),
    [onRun, onToggleLoop],
  );

  return (
    <div className="editor-wrapper">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[javascript(), editorTheme, playgroundKeymap()]}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          foldGutter: false,
        }}
        height="100%"
        style={{ height: '100%' }}
      />
    </div>
  );
}
