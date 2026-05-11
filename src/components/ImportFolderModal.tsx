import { useState, useRef } from 'react';
import { ProjectFile } from '../types';
import { readFileContent, getFileType } from '../utils/compiler';

interface ImportFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (files: {
    gamemodes: ProjectFile[];
    includes: ProjectFile[];
    filterscripts: ProjectFile[];
    pwn: ProjectFile[];
  }) => void;
}

interface DetectedFolder {
  name: string;
  path: string;
  files: File[];
  category: 'gamemodes' | 'includes' | 'filterscripts' | 'other';
}

export default function ImportFolderModal({ isOpen, onClose, onImport }: ImportFolderModalProps) {
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [detectedFolders, setDetectedFolders] = useState<DetectedFolder[]>([]);
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [folderName, setFolderName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Record<string, 'gamemodes' | 'includes' | 'filterscripts' | 'other'>>({});
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const detectCategory = (folderPath: string): 'gamemodes' | 'includes' | 'filterscripts' | 'other' => {
    const lowerPath = folderPath.toLowerCase();
    if (lowerPath.includes('gamemode') || lowerPath.includes('gamemodes')) return 'gamemodes';
    if (lowerPath.includes('include') || lowerPath.includes('includes')) return 'includes';
    if (lowerPath.includes('filterscript') || lowerPath.includes('filterscripts')) return 'filterscripts';
    return 'other';
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setAllFiles(files);

    // Detect folder name from first file path
    const firstFilePath = files[0].webkitRelativePath || '';
    const rootFolder = firstFilePath.split('/')[0];
    setFolderName(rootFolder);

    // Group files by subfolder
    const folderMap = new Map<string, { files: File[]; path: string }>();

    files.forEach(file => {
      const relativePath = file.webkitRelativePath || file.name;
      const parts = relativePath.split('/');

      if (parts.length >= 2) {
        // Has subfolder
        const subfolderName = parts.length >= 3 ? parts[1] : 'root';
        const subfolderPath = parts.slice(0, parts.length - 1).join('/');
        const key = subfolderName;

        if (!folderMap.has(key)) {
          folderMap.set(key, { files: [], path: subfolderPath });
        }
        folderMap.get(key)!.files.push(file);
      } else {
        // Root level files
        const key = 'root';
        if (!folderMap.has(key)) {
          folderMap.set(key, { files: [], path: '' });
        }
        folderMap.get(key)!.files.push(file);
      }
    });

    const folders: DetectedFolder[] = [];
    const categories: Record<string, 'gamemodes' | 'includes' | 'filterscripts' | 'other'> = {};

    folderMap.forEach((data, name) => {
      const category = detectCategory(name);
      folders.push({ name, path: data.path, files: data.files, category });
      categories[name] = category;
    });

    setDetectedFolders(folders);
    setSelectedCategories(categories);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    const result = {
      gamemodes: [] as ProjectFile[],
      includes: [] as ProjectFile[],
      filterscripts: [] as ProjectFile[],
      pwn: [] as ProjectFile[],
    };

    for (const folder of detectedFolders) {
      const assignedCategory = selectedCategories[folder.name];
      for (const file of folder.files) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'pwn' && ext !== 'inc') continue;

        try {
          const content = await readFileContent(file);
          const projectFile: ProjectFile = {
            name: file.name,
            content,
            type: getFileType(file.name),
            path: file.webkitRelativePath || file.name,
          };

          if (ext === 'pwn') {
            result.pwn.push(projectFile);
            if (assignedCategory === 'gamemodes') result.gamemodes.push(projectFile);
            if (assignedCategory === 'filterscripts') result.filterscripts.push(projectFile);
          } else if (ext === 'inc') {
            if (assignedCategory === 'includes' || assignedCategory === 'other') {
              result.includes.push(projectFile);
            } else if (assignedCategory === 'gamemodes') {
              result.gamemodes.push(projectFile);
            } else if (assignedCategory === 'filterscripts') {
              result.filterscripts.push(projectFile);
            } else {
              result.includes.push(projectFile);
            }
          }
        } catch (err) {
          console.error('Error reading file:', file.name, err);
        }
      }
    }

    onImport(result);
    handleClose();
  };

  const handleClose = () => {
    setStep('select');
    setDetectedFolders([]);
    setAllFiles([]);
    setFolderName('');
    setSelectedCategories({});
    onClose();
  };

  const getCategoryColor = (cat: string) => {
    if (cat === 'gamemodes') return 'bg-green-900/40 text-green-300 border-green-700';
    if (cat === 'includes') return 'bg-yellow-900/40 text-yellow-300 border-yellow-700';
    if (cat === 'filterscripts') return 'bg-purple-900/40 text-purple-300 border-purple-700';
    return 'bg-gray-700/40 text-gray-300 border-gray-600';
  };

  const getCategoryIcon = (cat: string) => {
    if (cat === 'gamemodes') return '🎮';
    if (cat === 'includes') return '📎';
    if (cat === 'filterscripts') return '🔌';
    return '📁';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📂</span>
            <div>
              <h2 className="text-white font-bold text-lg">استيراد مجلد المشروع</h2>
              <p className="text-gray-400 text-sm">اختر مجلد المشروع وسيتم التعرف على الملفات تلقائياً</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors text-xl">✕</button>
        </div>

        <div className="p-6">
          {step === 'select' && (
            <div className="space-y-6">
              <div
                onClick={() => folderInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-10 text-center cursor-pointer transition-all group hover:bg-blue-900/10"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📁</div>
                <p className="text-white font-semibold text-lg mb-2">انقر لاختيار مجلد المشروع</p>
                <p className="text-gray-400 text-sm">سيتم رفع المجلد بالكامل مع جميع الملفات</p>
                <p className="text-gray-500 text-xs mt-3">يدعم: .pwn, .inc</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                  <span>📂</span> اختيار المجلد
                </div>
              </div>

              <input
                ref={folderInputRef}
                type="file"
                // @ts-ignore
                webkitdirectory=""
                multiple
                className="hidden"
                onChange={handleFolderSelect}
              />

              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="text-gray-300 font-semibold mb-3 text-sm">📋 كيفية الاستخدام:</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">1.</span>
                    <span>اختر مجلد مشروع SA:MP الخاص بك (مثل: nuclear)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">2.</span>
                    <span>سيتم التعرف تلقائياً على مجلدات gamemodes و includes و filterscripts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">3.</span>
                    <span>تحقق من التصنيف وعدّله إذا لزم الأمر</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">4.</span>
                    <span>اضغط "تأكيد الاستيراد" لاستيراد جميع الملفات</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
                <span className="text-2xl">📁</span>
                <div>
                  <p className="text-white font-bold">{folderName}</p>
                  <p className="text-gray-400 text-sm">{allFiles.length} ملف مكتشف</p>
                </div>
              </div>

              <p className="text-gray-300 font-semibold text-sm">تصنيف المجلدات المكتشفة:</p>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {detectedFolders.map((folder, idx) => (
                  <div key={idx} className={`border rounded-xl p-4 ${getCategoryColor(selectedCategories[folder.name])}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{getCategoryIcon(selectedCategories[folder.name])}</span>
                        <span className="font-mono font-bold">{folder.name}</span>
                        <span className="text-xs opacity-70">({folder.files.length} ملف)</span>
                      </div>
                      <select
                        value={selectedCategories[folder.name]}
                        onChange={(e) => setSelectedCategories(prev => ({
                          ...prev,
                          [folder.name]: e.target.value as any
                        }))}
                        className="bg-black/30 border border-white/20 text-white text-xs rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="gamemodes">🎮 Gamemodes</option>
                        <option value="includes">📎 Includes</option>
                        <option value="filterscripts">🔌 Filterscripts</option>
                        <option value="other">📁 أخرى</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {folder.files.slice(0, 6).map((f, fi) => (
                        <span key={fi} className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-mono">
                          {f.name}
                        </span>
                      ))}
                      {folder.files.length > 6 && (
                        <span className="text-xs opacity-60">+{folder.files.length - 6} المزيد...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-xl py-3 font-medium transition-colors"
                >
                  ← رجوع
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl py-3 font-bold transition-all shadow-lg"
                >
                  ✅ تأكيد الاستيراد
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
