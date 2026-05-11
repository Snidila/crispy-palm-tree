import { useState } from 'react';

interface ProjectNameModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function ProjectNameModal({ isOpen, currentName, onClose, onSave }: ProjectNameModalProps) {
  const [name, setName] = useState(currentName);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim().endsWith('.pwn') ? name.trim() : name.trim() + '.pwn');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-900/60 to-amber-900/60 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✏️</span>
            <div>
              <h2 className="text-white font-bold text-lg">تغيير اسم الملف</h2>
              <p className="text-gray-400 text-sm">تغيير اسم ملف PWN الرئيسي</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">اسم الملف</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name.replace('.pwn', '')}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="flex-1 bg-gray-800 border border-gray-600 focus:border-blue-500 text-white rounded-xl px-4 py-3 outline-none font-mono text-sm transition-colors"
                placeholder="nuclear"
                autoFocus
              />
              <span className="text-gray-500 font-mono text-sm bg-gray-800 px-3 py-3 rounded-xl border border-gray-600">.pwn</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              سيتم حفظ الملف بالاسم: <span className="text-blue-400 font-mono">{name.replace('.pwn', '') || 'nuclear'}.pwn</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-xl py-3 font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl py-3 font-bold transition-all"
            >
              💾 حفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
