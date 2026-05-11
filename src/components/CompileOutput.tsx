import { CompileResult } from '../types';
import { downloadAMX } from '../utils/compiler';

interface CompileOutputProps {
  result: CompileResult | null;
  isCompiling: boolean;
  mainFileName: string;
}

export default function CompileOutput({ result, isCompiling, mainFileName }: CompileOutputProps) {
  const handleDownload = () => {
    if (result?.amxContent) {
      downloadAMX(mainFileName, result.amxContent);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm">🖥️</span>
          <span className="text-gray-300 text-sm font-semibold">نتائج الترجمة</span>
          {result && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              result.success
                ? 'bg-green-900/50 text-green-400 border border-green-700'
                : 'bg-red-900/50 text-red-400 border border-red-700'
            }`}>
              {result.success ? '✓ نجاح' : '✗ فشل'}
            </span>
          )}
        </div>

        {result?.success && result?.amxContent && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <span>⬇️</span>
            تحميل {mainFileName.replace('.pwn', '.amx')}
          </button>
        )}
      </div>

      {/* Output */}
      <div className="flex-1 overflow-auto bg-gray-950 p-4">
        {isCompiling ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg">⚙️</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">جاري الترجمة...</p>
              <p className="text-gray-400 text-sm mt-1">يرجى الانتظار</p>
            </div>
          </div>
        ) : result ? (
          <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
            {result.output.split('\n').map((line, idx) => {
              let className = 'text-gray-300';
              if (line.includes('[✓]') || line.includes('SUCCESSFUL') || line.includes('✓')) {
                className = 'text-green-400 font-semibold';
              } else if (line.includes('[✗]') || line.includes('FAILED') || line.includes('ERROR')) {
                className = 'text-red-400 font-semibold';
              } else if (line.includes('WARNING')) {
                className = 'text-yellow-400';
              } else if (line.includes('[*]')) {
                className = 'text-blue-400';
              } else if (line.includes('[!]')) {
                className = 'text-orange-400';
              } else if (line.includes('━')) {
                className = 'text-gray-600';
              } else if (line.includes('Copyright') || line.includes('Snidila')) {
                className = 'text-purple-400';
              }

              return (
                <span key={idx} className={`block ${className}`}>
                  {line}
                </span>
              );
            })}
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <span className="text-5xl opacity-30">🔧</span>
            <p className="text-gray-500 text-sm">اضغط على "ترجمة" لتحويل PWN إلى AMX</p>
            <p className="text-gray-600 text-xs">ستظهر نتائج الترجمة هنا</p>
          </div>
        )}
      </div>
    </div>
  );
}
