import React, { useRef, useEffect } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
}

export default function CodeEditor({ value, onChange, readOnly = false, height = '400px' }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = value.split('\n');
  const lineCount = lines.length;

  const syncScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 4;
          textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  useEffect(() => {
    syncScroll();
  }, [value]);



  return (
    <div className="relative flex rounded-lg overflow-hidden border border-gray-700 bg-gray-950" style={{ height }}>
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="select-none bg-gray-900 text-gray-500 text-xs font-mono px-3 py-4 overflow-hidden text-right border-r border-gray-700"
        style={{ minWidth: '52px', lineHeight: '1.6rem' }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} className="leading-relaxed">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        spellCheck={false}
        className="flex-1 bg-gray-950 text-gray-100 font-mono text-sm resize-none outline-none p-4 leading-relaxed overflow-auto"
        style={{
          lineHeight: '1.6rem',
          caretColor: '#60a5fa',
          tabSize: 4,
        }}
        placeholder={readOnly ? '' : '// اكتب كود PAWN هنا...\n#include <a_samp>\n\npublic OnGameModeInit()\n{\n    // كودك هنا\n    return 1;\n}'}
      />
    </div>
  );
}
