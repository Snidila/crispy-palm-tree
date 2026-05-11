import { CompileResult, CompileError, CompileWarning, ProjectFile } from '../types';

// Simulated PAWN compiler logic
export function compilePWN(
  mainFile: ProjectFile,
  includes: ProjectFile[],
  filterscripts: ProjectFile[],
  gamemodes: ProjectFile[]
): CompileResult {
  const errors: CompileError[] = [];
  const warnings: CompileWarning[] = [];
  let outputLog = '';

  outputLog += `Snidila Dev - PWN to AMX Compiler v3.10.11\n`;
  outputLog += `Copyright (c) 2024 Snidila Dev. All rights reserved.\n`;
  outputLog += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  outputLog += `[*] Starting compilation process...\n`;
  outputLog += `[*] Main file: ${mainFile.name}\n`;

  if (includes.length > 0) {
    outputLog += `[*] Loaded includes (${includes.length}):\n`;
    includes.forEach(inc => {
      outputLog += `    ✓ ${inc.name}\n`;
    });
  }

  if (filterscripts.length > 0) {
    outputLog += `[*] Loaded filterscripts (${filterscripts.length}):\n`;
    filterscripts.forEach(fs => {
      outputLog += `    ✓ ${fs.name}\n`;
    });
  }

  if (gamemodes.length > 0) {
    outputLog += `[*] Loaded gamemodes (${gamemodes.length}):\n`;
    gamemodes.forEach(gm => {
      outputLog += `    ✓ ${gm.name}\n`;
    });
  }

  outputLog += `\n[*] Parsing source code...\n`;

  // Basic syntax validation
  const content = mainFile.content;
  const lines = content.split('\n');

  let braceCount = 0;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Count braces
    for (const char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }

    // Check for common errors
    if (trimmed.endsWith(',') && !trimmed.includes('//')) {
      // trailing comma warning
    }

    // Missing semicolons in certain patterns
    if (
      trimmed.length > 0 &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('{') &&
      !trimmed.startsWith('}') &&
      !trimmed.endsWith('{') &&
      !trimmed.endsWith('}') &&
      !trimmed.endsWith(';') &&
      !trimmed.endsWith(',') &&
      !trimmed.endsWith('\\') &&
      trimmed.includes('=') &&
      !trimmed.startsWith('if') &&
      !trimmed.startsWith('else') &&
      !trimmed.startsWith('while') &&
      !trimmed.startsWith('for') &&
      !trimmed.startsWith('return') &&
      !trimmed.startsWith('new ') &&
      index < lines.length - 1
    ) {
      // Possible missing semicolon (just a warning simulation)
    }
  });

  if (braceCount !== 0) {
    errors.push({
      line: lines.length,
      message: `Mismatched braces: ${braceCount > 0 ? 'unclosed' : 'extra'} brace(s) detected`,
      file: mainFile.name
    });
  }

  outputLog += `[*] Resolving symbols and includes...\n`;
  outputLog += `[*] Generating p-code...\n`;

  const hasErrors = errors.length > 0;

  if (hasErrors) {
    outputLog += `\n[✗] Compilation FAILED!\n`;
    outputLog += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    errors.forEach(err => {
      outputLog += `  ERROR (${err.file || mainFile.name}:${err.line}): ${err.message}\n`;
    });
    outputLog += `\n[!] ${errors.length} error(s), ${warnings.length} warning(s).\n`;
  } else {
    const outputName = mainFile.name.replace('.pwn', '.amx');
    outputLog += `[*] Optimizing bytecode...\n`;
    outputLog += `[*] Writing output file: ${outputName}\n\n`;
    outputLog += `[✓] Compilation SUCCESSFUL!\n`;
    outputLog += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    outputLog += `  Code size    : ${Math.floor(Math.random() * 50000 + 10000)} bytes\n`;
    outputLog += `  Data size    : ${Math.floor(Math.random() * 20000 + 5000)} bytes\n`;
    outputLog += `  Stack/heap   : ${Math.floor(Math.random() * 5000 + 1000)} bytes\n`;
    outputLog += `  Total memory : ${Math.floor(Math.random() * 80000 + 20000)} bytes\n\n`;
    if (warnings.length > 0) {
      warnings.forEach(w => {
        outputLog += `  WARNING (${w.file || mainFile.name}:${w.line}): ${w.message}\n`;
      });
    }
    outputLog += `\n[!] ${errors.length} error(s), ${warnings.length} warning(s).\n`;
    outputLog += `[✓] Output: ${outputName}\n`;
  }

  // Generate simulated AMX content (binary-like representation)
  const amxContent = hasErrors ? undefined : generateSimulatedAMX(mainFile.name, content);

  return {
    success: !hasErrors,
    output: outputLog,
    errors,
    warnings,
    amxContent
  };
}

function generateSimulatedAMX(filename: string, sourceContent: string): string {
  // Create a realistic-looking AMX binary header simulation
  const magic = 'AMX\x00';
  const timestamp = new Date().toISOString();
  const sourceLines = sourceContent.split('\n').length;
  const codeSize = sourceContent.length * 2 + Math.floor(Math.random() * 1000);

  return `${magic}${filename}|${timestamp}|${codeSize}|${sourceLines}|COMPILED_BY_SNIDILA_DEV`;
}

export function downloadAMX(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace('.pwn', '.amx');
  a.click();
  URL.revokeObjectURL(url);
}

export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function getFileType(filename: string): 'pwn' | 'inc' | 'amx' | 'other' {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pwn') return 'pwn';
  if (ext === 'inc') return 'inc';
  if (ext === 'amx') return 'amx';
  return 'other';
}
