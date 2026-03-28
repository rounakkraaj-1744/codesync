'use client';

import React, { useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface MonacoEditorProps {
  code: string;
  language: string;
  onChange: (value: string | undefined) => void;
  onCursorChange?: (position: { line: number; column: number }) => void;
  readOnly?: boolean;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  code,
  language,
  onChange,
  onCursorChange,
  readOnly = false,
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Configure editor theme
    monaco.editor.defineTheme('codesync-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0A0A0A',
        'editor.lineHighlightBackground': '#1A1A1A',
      },
    });

    monaco.editor.setTheme('codesync-dark');
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-white/10 shadow-2xl">
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={code}
        theme="codesync-dark"
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          readOnly,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          fontLigatures: true,
        }}
      />
    </div>
  );
};

export default MonacoEditor;
