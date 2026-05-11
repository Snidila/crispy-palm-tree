import { useState, useRef } from 'react';
import { ProjectFile } from '../types';
import { readFileContent, getFileType } from '../utils/compiler';

interface AddFileModalProps {
  isOpen: boolean;
  category: 'includes' | 'filterscripts' | 'gamemodes';
  onClose: () => void;
  onAdd: (files: ProjectFile[], category: 'includes' | 'filterscripts' | 'gamemodes') => void;
}

export default function AddFileModal({ isOpen, category, onClose, onAdd }: AddFileModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categoryInfo = {
    includes: { label: 'Includes', icon: '📎', color: 'from-yellow-900/60 to-amber-900/60', border: 'border-yellow-700', accept: '.inc,.pwn' },
    filterscripts: { label: 'Filterscripts', icon: '🔌', color: 'from-purple-900/60 to-violet-900/60', border: 'border-purple-700', accept: '.pwn,.inc' },
    gamemodes: { label: 'Gamemodes', icon: '🎮', color: 'from-green-900/60 to-emerald-900/60', border: 'border-green-700', accept: '.pwn,.inc' },
  };

  const info = categoryInfo[category];

  const processFiles = async (files: File[]) => {
    const projectFiles: ProjectFile[] = [];
    for (const file of files) {
      try {
        const content = await readFileContent(file);
        projectFiles.push({
          name: file.name,
          content,
          type: getFileType(file.name),
          path: file.name,
        });
      } catch (err) {
        console.error('Error reading file:', file.name);
      }
    }
    if (projectFiles.length > 0) {
      onAdd(projectFiles, category);
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className={`bg-gradient-to-r ${info.color} px-6 py-4 border-b border-gray-700 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{info.icon}</span>
            <div>
              <h2 className="text-white font-bold text-lg">إضافة ملفات {info.label}</h2>
              <p className="text-gray-400 text-sm">يمكنك إضافة ملفات متعددة في وقت واحد</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${dragOver ? `border-blue-400 bg-blue-900/20` : `${info.border} hover:bg-gray-800/50`}`}
          >
            <div className="text-4xl mb-3">{dragOver ? '📥' : info.icon}</div>
            <p className="text-white font-semibold mb-1">
              {dragOver ? 'اسقط الملفات هنا' : 'انقر لاختيار الملفات'}
            </p>
            <p className="text-gray-400 text-sm">أو اسحب وأسقط الملفات هنا</p>
            <p className="text-gray-500 text-xs mt-2">يقبل: {info.accept}</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={info.accept}
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-xl py-3 font-medium transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
