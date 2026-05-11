export interface ProjectFile {
  name: string;
  content: string;
  type: 'pwn' | 'inc' | 'amx' | 'other';
  path?: string;
}

export interface ProjectFolder {
  name: string;
  files: ProjectFile[];
  subFolders?: SubFolder[];
}

export interface SubFolder {
  name: string;
  label: string;
  files: ProjectFile[];
}

export interface CompileResult {
  success: boolean;
  output: string;
  errors: CompileError[];
  warnings: CompileWarning[];
  amxContent?: string;
}

export interface CompileError {
  line: number;
  column?: number;
  message: string;
  file?: string;
}

export interface CompileWarning {
  line: number;
  column?: number;
  message: string;
  file?: string;
}

export interface ProjectStructure {
  name: string;
  gamemodes: ProjectFile[];
  includes: ProjectFile[];
  filterscripts: ProjectFile[];
}
