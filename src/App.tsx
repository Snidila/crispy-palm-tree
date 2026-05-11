import { useState, useRef, useCallback } from 'react';
import { ProjectFile, CompileResult } from './types';
import { compilePWN, readFileContent } from './utils/compiler';
import CodeEditor from './components/CodeEditor';
import FileTree from './components/FileTree';
import ImportFolderModal from './components/ImportFolderModal';
import CompileOutput from './components/CompileOutput';
import ProjectNameModal from './components/ProjectNameModal';
import AddFileModal from './components/AddFileModal';

const DEFAULT_PWN = `// ============================================
//   Gamemode: nuclear
//   Author: Snidila Dev
//   Description: SA:MP Gamemode
// ============================================

#include <a_samp>

// ============================================
//   OnGameModeInit
// ============================================
public OnGameModeInit()
{
    print(" ============================== ");
    print("  Gamemode: nuclear by Snidila Dev");
    print(" ============================== ");

    SetGameModeText("Nuclear RP");
    AddPlayerClass(0, 1958.3783, 1343.1572, 15.3746, 269.1425, 0, 0, 0, 0, 0, 0);

    return 1;
}

// ============================================
//   OnPlayerConnect
// ============================================
public OnPlayerConnect(playerid)
{
    SendClientMessage(playerid, 0xFFFFFFFF, "مرحباً بك في الخادم!");
    return 1;
}

// ============================================
//   OnPlayerSpawn
// ============================================
public OnPlayerSpawn(playerid)
{
    SetPlayerPos(playerid, 1958.3783, 1343.1572, 15.3746);
    return 1;
}

// ============================================
//   OnGameModeExit
// ============================================
public OnGameModeExit()
{
    return 1;
}
`;

type ActiveTab = 'editor' | 'output';
type AddFileCategory = 'includes' | 'filterscripts' | 'gamemodes';

export default function App() {
  const [mainFile, setMainFile] = useState<ProjectFile>({
    name: 'nuclear.pwn',
    content: DEFAULT_PWN,
    type: 'pwn',
  });

  const [includes, setIncludes] = useState<ProjectFile[]>([]);
  const [filterscripts, setFilterscripts] = useState<ProjectFile[]>([]);
  const [gamemodes, setGamemodes] = useState<ProjectFile[]>([]);

  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');

  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalCategory, setAddModalCategory] = useState<AddFileCategory>('includes');

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const pwnFileInputRef = useRef<HTMLInputElement>(null);

  const showNotif = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Get the current editor content
  const currentContent = activeFile ? activeFile.content : mainFile.content;

  const handleEditorChange = (value: string) => {
    if (activeFile) {
      // Update in the correct list
      const updateList = (list: ProjectFile[], setter: (v: ProjectFile[]) => void) => {
        const idx = list.findIndex(f => f.name === activeFile.name && f.path === activeFile.path);
        if (idx !== -1) {
          const updated = [...list];
          updated[idx] = { ...updated[idx], content: value };
          setter(updated);
          setActiveFile({ ...activeFile, content: value });
        }
      };
      updateList(includes, setIncludes);
      updateList(filterscripts, setFilterscripts);
      updateList(gamemodes, setGamemodes);
    } else {
      setMainFile(prev => ({ ...prev, content: value }));
    }
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setActiveTab('output');
    setCompileResult(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = compilePWN(mainFile, includes, filterscripts, gamemodes);
    setCompileResult(result);
    setIsCompiling(false);

    if (result.success) {
      showNotif('✅ تمت الترجمة بنجاح! AMX جاهز للتحميل', 'success');
    } else {
      showNotif(`❌ فشلت الترجمة: ${result.errors.length} خطأ`, 'error');
    }
  };

  const handleImportFolder = (files: {
    gamemodes: ProjectFile[];
    includes: ProjectFile[];
    filterscripts: ProjectFile[];
    pwn: ProjectFile[];
  }) => {
    if (files.gamemodes.length > 0 || files.pwn.length > 0) {
      const pwn = files.pwn.find(f => f.type === 'pwn') || files.gamemodes.find(f => f.type === 'pwn');
      if (pwn) {
        setMainFile(pwn);
        setActiveFile(null);
      }
    }

    if (files.includes.length > 0) {
      setIncludes(prev => {
        const existing = new Set(prev.map(f => f.name));
        const newFiles = files.includes.filter(f => !existing.has(f.name));
        return [...prev, ...newFiles];
      });
    }

    if (files.filterscripts.length > 0) {
      setFilterscripts(prev => {
        const existing = new Set(prev.map(f => f.name));
        const newFiles = files.filterscripts.filter(f => !existing.has(f.name));
        return [...prev, ...newFiles];
      });
    }

    const gmOnly = files.gamemodes.filter(f => f.type === 'inc');
    if (gmOnly.length > 0) {
      setGamemodes(prev => {
        const existing = new Set(prev.map(f => f.name));
        const newFiles = gmOnly.filter(f => !existing.has(f.name));
        return [...prev, ...newFiles];
      });
    }

    const totalImported =
      files.includes.length +
      files.filterscripts.length +
      files.gamemodes.length +
      files.pwn.length;

    showNotif(`✅ تم استيراد ${totalImported} ملف بنجاح`, 'success');
  };

  const handleAddFiles = (files: ProjectFile[], category: AddFileCategory) => {
    if (category === 'includes') {
      setIncludes(prev => {
        const existing = new Set(prev.map(f => f.name));
        return [...prev, ...files.filter(f => !existing.has(f.name))];
      });
    } else if (category === 'filterscripts') {
      setFilterscripts(prev => {
        const existing = new Set(prev.map(f => f.name));
        return [...prev, ...files.filter(f => !existing.has(f.name))];
      });
    } else if (category === 'gamemodes') {
      setGamemodes(prev => {
        const existing = new Set(prev.map(f => f.name));
        return [...prev, ...files.filter(f => !existing.has(f.name))];
      });
    }
    showNotif(`✅ تمت إضافة ${files.length} ملف`, 'success');
  };

  const handleRemoveFile = (file: ProjectFile, category: 'includes' | 'filterscripts' | 'gamemodes') => {
    if (category === 'includes') setIncludes(prev => prev.filter(f => f.name !== file.name));
    if (category === 'filterscripts') setFilterscripts(prev => prev.filter(f => f.name !== file.name));
    if (category === 'gamemodes') setGamemodes(prev => prev.filter(f => f.name !== file.name));
    if (activeFile?.name === file.name) setActiveFile(null);
    showNotif(`🗑️ تم حذف ${file.name}`, 'info');
  };

  const handlePWNFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await readFileContent(file);
      setMainFile({ name: file.name, content, type: 'pwn' });
      setActiveFile(null);
      showNotif(`✅ تم فتح ${file.name}`, 'success');
    } catch {
      showNotif('❌ خطأ في قراءة الملف', 'error');
    }
  }, []);

  const handleSelectFile = (file: ProjectFile) => {
    setActiveFile(file);
    setActiveTab('editor');
  };

  const handleMainFileClick = () => {
    setActiveFile(null);
    setActiveTab('editor');
  };

  const openAddModal = (category: AddFileCategory) => {
    setAddModalCategory(category);
    setShowAddModal(true);
  };

  const totalFiles = includes.length + filterscripts.length + gamemodes.length;

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden" dir="rtl">
      {/* ===== TOP BAR ===== */}
      <header className="flex-shrink-0 bg-gray-900 border-b border-gray-700 shadow-lg">
        {/* Title Row */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 px-3 py-1.5 rounded-lg shadow-md">
              <span className="text-lg">⚙️</span>
              <span className="font-black text-sm tracking-wide">PWN → AMX</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-gray-400 text-xs">Snidila Dev Compiler</span>
            </div>
          </div>

          {/* Current File Name */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNameModal(true)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-all group"
              title="تغيير اسم الملف"
            >
              <span className="text-green-400 text-sm">🎮</span>
              <span className="font-mono text-sm text-gray-200">{mainFile.name}</span>
              <span className="text-gray-500 group-hover:text-gray-300 text-xs transition-colors">✏️</span>
            </button>
          </div>

          {/* Version */}
          <div className="text-gray-600 text-xs hidden md:block">v3.10.11</div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
          {/* Import Folder */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-blue-900/40 whitespace-nowrap"
          >
            <span>📂</span> استيراد مجلد
          </button>

          {/* Open PWN */}
          <button
            onClick={() => pwnFileInputRef.current?.click()}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
          >
            <span>📄</span> فتح PWN
          </button>

          <div className="w-px h-6 bg-gray-700 mx-1 flex-shrink-0" />

          {/* Add Includes */}
          <button
            onClick={() => openAddModal('includes')}
            className="flex items-center gap-2 bg-yellow-700/60 hover:bg-yellow-700 border border-yellow-700/50 text-yellow-300 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
          >
            <span>📎</span> + Include
          </button>

          {/* Add Filterscripts */}
          <button
            onClick={() => openAddModal('filterscripts')}
            className="flex items-center gap-2 bg-purple-700/60 hover:bg-purple-700 border border-purple-700/50 text-purple-300 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
          >
            <span>🔌</span> + Filterscript
          </button>

          {/* Add Gamemodes */}
          <button
            onClick={() => openAddModal('gamemodes')}
            className="flex items-center gap-2 bg-green-700/60 hover:bg-green-700 border border-green-700/50 text-green-300 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
          >
            <span>🎮</span> + Gamemode
          </button>

          <div className="flex-1" />

          {/* Stats */}
          {totalFiles > 0 && (
            <div className="hidden md:flex items-center gap-3 text-xs text-gray-500 mr-2">
              {includes.length > 0 && <span className="text-yellow-500">📎 {includes.length}</span>}
              {filterscripts.length > 0 && <span className="text-purple-500">🔌 {filterscripts.length}</span>}
              {gamemodes.length > 0 && <span className="text-green-500">🎮 {gamemodes.length}</span>}
            </div>
          )}

          {/* Compile Button */}
          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-green-900/50 whitespace-nowrap"
          >
            {isCompiling ? (
              <>
                <span className="animate-spin">⚙️</span> جاري...
              </>
            ) : (
              <>
                <span>▶</span> ترجمة PWN → AMX
              </>
            )}
          </button>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - File Tree */}
        <aside className="w-56 flex-shrink-0 bg-gray-900 border-l border-gray-700 flex flex-col overflow-hidden">
          {/* Main PWN file */}
          <div className="px-3 py-2 border-b border-gray-700">
            <div
              onClick={handleMainFileClick}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm
                ${!activeFile
                  ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
            >
              <span>🔧</span>
              <span className="font-mono truncate flex-1">{mainFile.name}</span>
              <span className="text-xs bg-blue-900/50 text-blue-400 px-1.5 py-0.5 rounded-full">main</span>
            </div>
          </div>

          {/* File tree */}
          <div className="flex-1 overflow-hidden">
            <FileTree
              includes={includes}
              filterscripts={filterscripts}
              gamemodes={gamemodes}
              activeFile={activeFile}
              onSelectFile={handleSelectFile}
              onRemoveFile={handleRemoveFile}
            />
          </div>
        </aside>

        {/* Editor + Output Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center bg-gray-900 border-b border-gray-700 px-2 pt-1 gap-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all border-b-2 ${
                activeTab === 'editor'
                  ? 'bg-gray-950 border-blue-500 text-blue-300'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              📝 {activeFile ? activeFile.name : mainFile.name}
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'output'
                  ? 'bg-gray-950 border-green-500 text-green-300'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              🖥️ المخرجات
              {compileResult && (
                <span className={`w-2 h-2 rounded-full ${compileResult.success ? 'bg-green-500' : 'bg-red-500'}`} />
              )}
            </button>

            {/* File info */}
            <div className="ml-auto mr-2 text-xs text-gray-600 hidden lg:block">
              {(activeFile || mainFile).name} •{' '}
              {(activeFile ? activeFile.content : mainFile.content).split('\n').length} سطر
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'editor' ? (
              <CodeEditor
                value={currentContent}
                onChange={handleEditorChange}
                height="100%"
              />
            ) : (
              <CompileOutput
                result={compileResult}
                isCompiling={isCompiling}
                mainFileName={mainFile.name}
              />
            )}
          </div>
        </main>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="flex-shrink-0 bg-gray-900 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-gray-500">
            <span>
              {!activeFile ? (
                <span className="text-blue-400">● {mainFile.name}</span>
              ) : (
                <span className="text-yellow-400">● {activeFile.name}</span>
              )}
            </span>
            <span className="text-gray-600">
              الأسطر: {(activeFile ? activeFile.content : mainFile.content).split('\n').length}
            </span>
            {compileResult && (
              <span className={compileResult.success ? 'text-green-400' : 'text-red-400'}>
                {compileResult.success ? '✓ تمت الترجمة' : '✗ فشلت الترجمة'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <span>©</span>
            <span>2024</span>
            <span className="text-purple-400 font-semibold">Snidila Dev</span>
            <span>•</span>
            <span>PWN to AMX Compiler</span>
            <span>•</span>
            <span>جميع الحقوق محفوظة</span>
          </div>
        </div>
      </footer>

      {/* ===== HIDDEN INPUTS ===== */}
      <input
        ref={pwnFileInputRef}
        type="file"
        accept=".pwn"
        className="hidden"
        onChange={handlePWNFileSelect}
      />

      {/* ===== MODALS ===== */}
      <ImportFolderModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportFolder}
      />

      <ProjectNameModal
        isOpen={showNameModal}
        currentName={mainFile.name}
        onClose={() => setShowNameModal(false)}
        onSave={(name) => {
          setMainFile(prev => ({ ...prev, name }));
          showNotif(`✅ تم تغيير الاسم إلى ${name}`, 'success');
        }}
      />

      <AddFileModal
        isOpen={showAddModal}
        category={addModalCategory}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddFiles}
      />

      {/* ===== NOTIFICATION ===== */}
      {notification && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all flex items-center gap-2 backdrop-blur-sm border
          ${notification.type === 'success' ? 'bg-green-900/90 border-green-600 text-green-200' : ''}
          ${notification.type === 'error' ? 'bg-red-900/90 border-red-600 text-red-200' : ''}
          ${notification.type === 'info' ? 'bg-gray-800/90 border-gray-600 text-gray-200' : ''}
        `}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
