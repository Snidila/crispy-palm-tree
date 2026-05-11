import { ProjectFile } from '../types';

interface FileTreeProps {
  includes: ProjectFile[];
  filterscripts: ProjectFile[];
  gamemodes: ProjectFile[];
  activeFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  onRemoveFile: (file: ProjectFile, category: 'includes' | 'filterscripts' | 'gamemodes') => void;
}

const fileIcon = (type: string) => {
  if (type === 'pwn') return '🔧';
  if (type === 'inc') return '📎';
  if (type === 'amx') return '⚙️';
  return '📄';
};

interface FileSectionProps {
  title: string;
  icon: string;
  color: string;
  files: ProjectFile[];
  category: 'includes' | 'filterscripts' | 'gamemodes';
  activeFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  onRemoveFile: (file: ProjectFile, category: 'includes' | 'filterscripts' | 'gamemodes') => void;
}

function FileSection({ title, icon, color, files, category, activeFile, onSelectFile, onRemoveFile }: FileSectionProps) {
  return (
    <div className="mb-4">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-md mb-1 ${color}`}>
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        <span className="ml-auto text-xs bg-black/20 px-2 py-0.5 rounded-full">{files.length}</span>
      </div>
      {files.length === 0 ? (
        <div className="px-4 py-2 text-gray-500 text-xs italic">لا يوجد ملفات...</div>
      ) : (
        <div className="space-y-0.5">
          {files.map((file, idx) => (
            <div
              key={idx}
              onClick={() => onSelectFile(file)}
              className={`group flex items-center gap-2 px-4 py-1.5 cursor-pointer rounded-md text-xs transition-all
                ${activeFile?.name === file.name && activeFile?.content === file.content
                  ? 'bg-blue-600/30 text-blue-300 border-l-2 border-blue-400'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`}
            >
              <span>{fileIcon(file.type)}</span>
              <span className="flex-1 truncate font-mono">{file.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveFile(file, category); }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity text-xs px-1"
                title="حذف"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ includes, filterscripts, gamemodes, activeFile, onSelectFile, onRemoveFile }: FileTreeProps) {
  return (
    <div className="h-full overflow-y-auto py-2">
      <div className="px-3 py-2 mb-3 border-b border-gray-700">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">📁 مستكشف الملفات</h3>
      </div>

      <FileSection
        title="Gamemodes"
        icon="🎮"
        color="text-green-400 bg-green-900/20"
        files={gamemodes}
        category="gamemodes"
        activeFile={activeFile}
        onSelectFile={onSelectFile}
        onRemoveFile={onRemoveFile}
      />

      <FileSection
        title="Includes"
        icon="📎"
        color="text-yellow-400 bg-yellow-900/20"
        files={includes}
        category="includes"
        activeFile={activeFile}
        onSelectFile={onSelectFile}
        onRemoveFile={onRemoveFile}
      />

      <FileSection
        title="Filterscripts"
        icon="🔌"
        color="text-purple-400 bg-purple-900/20"
        files={filterscripts}
        category="filterscripts"
        activeFile={activeFile}
        onSelectFile={onSelectFile}
        onRemoveFile={onRemoveFile}
      />
    </div>
  );
}
