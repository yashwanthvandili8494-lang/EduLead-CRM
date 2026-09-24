import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================================');
console.log('🚀 Starting EduLead Admission CRM (FastAPI + SQL + React)');
console.log('========================================================\n');

// Detect Python binary in venv or fallback
const venvPythonWin = path.join(__dirname, 'server_python', '.venv', 'Scripts', 'python.exe');
const venvPythonUnix = path.join(__dirname, 'server_python', '.venv', 'bin', 'python');
let pythonCmd = 'python';

if (fs.existsSync(venvPythonWin)) {
  pythonCmd = venvPythonWin;
} else if (fs.existsSync(venvPythonUnix)) {
  pythonCmd = venvPythonUnix;
}

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log(`[Backend] Using Python: ${pythonCmd}`);
const server = spawn(pythonCmd, ['run.py'], {
  cwd: path.join(__dirname, 'server_python'),
  stdio: 'inherit',
  shell: true,
});

console.log(`[Frontend] Launching Vite client...`);
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit();
});
