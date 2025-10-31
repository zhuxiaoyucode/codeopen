import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
function generateId(length: number = 12): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = Array.from({ length }, () => Math.floor(Math.random() * characters.length));
  return bytes.map(i => characters[i]).join('');
}

export type SupportedLanguage =
  | 'javascript'
  | 'python'
  | 'php'
  | 'bash'
  | 'java'
  | 'go'
  | 'ruby'
  | 'typescript'
  | 'cpp'
  | 'csharp'
  | 'swift'
  | 'html'
  | 'css'
  | 'sql'
  | 'json'
  | 'markdown'
  | 'plaintext';

export interface SandboxRunRequest {
  language: SupportedLanguage;
  code: string;
}

export interface SandboxRunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  timedOut: boolean;
}

const languageConfig: Record<SupportedLanguage, { image: string; fileName: string; runCmd: string[] } | null> = {
  javascript: { image: 'node:18-alpine', fileName: 'main.js', runCmd: ['node', '/work/main.js'] },
  python: { image: 'python:3.11-alpine', fileName: 'main.py', runCmd: ['python', '/work/main.py'] },
  php: { image: 'php:8.2-cli-alpine', fileName: 'main.php', runCmd: ['php', '/work/main.php'] },
  bash: { image: 'alpine:3.19', fileName: 'main.sh', runCmd: ['sh', '/work/main.sh'] },
  ruby: { image: 'ruby:3.3-alpine', fileName: 'main.rb', runCmd: ['ruby', '/work/main.rb'] },
    go: { image: 'golang:1.22-alpine', fileName: 'main.go', runCmd: ['sh', '-lc', 'GOCACHE=/tmp/gocache /usr/local/go/bin/go run /work/main.go'] },
  java: { image: 'eclipse-temurin:17-jdk-alpine', fileName: 'Main.java', runCmd: ['sh', '-lc', '/opt/java/openjdk/bin/javac /work/Main.java && /opt/java/openjdk/bin/java -cp /work Main'] },
  cpp: { image: 'gcc:13.2.0', fileName: 'main.cpp', runCmd: ['sh', '-lc', '/usr/local/bin/g++ -O2 -std=c++17 /work/main.cpp -o /work/a.out && /work/a.out'] },
  csharp: { image: 'mono:6.12', fileName: 'main.cs', runCmd: ['sh', '-lc', '/usr/bin/mcs /work/main.cs -out:/work/a.exe && /usr/bin/mono /work/a.exe'] },
  swift: { image: 'swift:5.9', fileName: 'main.swift', runCmd: ['bash', '-lc', 'swiftc /work/main.swift -o /work/a.out && /work/a.out'] },
  // 下列语言为非可执行或暂不支持编译执行，采用回显模式
  typescript: { image: 'typescript-sandbox', fileName: 'main.ts', runCmd: ['sh', '-c', 'esbuild /work/main.ts --bundle --platform=node --outfile=/work/main.js && node /work/main.js'] },
  html: null,
  css: null,
  sql: null,
  json: null,
  markdown: null,
  plaintext: null,
};

export async function ensureDockerAvailable(): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn('docker', ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let errOut = '';
    p.stderr.on('data', (c) => { errOut += c.toString(); });
    p.on('error', (err) => reject(new Error(`DockerUnavailable: ${err.message}`)));
    p.on('close', (code) => {
      if (code === 0) resolve(); else reject(new Error(`DockerUnavailable: code=${code} stderr=${errOut}`));
    });
  });
}

export async function runInSandbox(req: SandboxRunRequest): Promise<SandboxRunResult> {
  const cfg = languageConfig[req.language];

  // 非可执行语言：直接回显并说明
  if (cfg === null) {
    const start = Date.now();
    const end = Date.now();
    return {
      stdout: req.code,
      stderr: `该语言为非可执行或暂不支持直接运行：${req.language}`,
      exitCode: 0,
      durationMs: end - start,
      timedOut: false,
    };
  }

  // 检查 Docker 可用性
  await ensureDockerAvailable();

  // 优先使用外部指定的宿主可见目录（通过 SANDBOX_HOST_ROOT 环境变量），否则回退到项目内目录
  const hostRootEnv = process.env.SANDBOX_HOST_ROOT;
  const projectWorkRoot = hostRootEnv ? hostRootEnv : path.join(process.cwd(), 'sandbox_work');
  try { fs.mkdirSync(projectWorkRoot, { recursive: true }); } catch {}
  const instanceId = generateId(12);
  const workDir = path.join(projectWorkRoot, instanceId);
  fs.mkdirSync(workDir, { recursive: true });
  const filePath = path.join(workDir, cfg.fileName);
  fs.writeFileSync(filePath, req.code, { encoding: 'utf8' });

  // docker run 要求宿主路径，若我们使用了容器内的 SANDBOX_HOST_ROOT (/host_work)，
  // 需要把它映射回宿主真实路径。支持通过 SANDBOX_HOST_ABS 环境变量传入宿主的绝对根路径。
  const hostAbsRoot = process.env.SANDBOX_HOST_ABS;
  let hostPathForMount = workDir;
  if (hostAbsRoot && projectWorkRoot.startsWith('/host_work')) {
    // workDir like /host_work/sandbox_work/<id> -> replace prefix with hostAbsRoot
    hostPathForMount = path.join(hostAbsRoot, path.relative('/host_work', workDir));
  }

  const dockerArgs = [
    'run', '--rm',
    '--network', 'none',
    '--cpus', '1.0',
    '--memory', '256m',
    '--pids-limit', '1024',
    '--read-only',
    '--tmpfs', '/tmp:exec',
    '--tmpfs', '/root/.cache',
    '--security-opt', 'no-new-privileges',
    '-v', `${hostPathForMount}:/work:rw`,
    cfg.image,
    ...cfg.runCmd
  ];

  const start = Date.now();
  const child = spawn('docker', dockerArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

  let stdout = '';
  let stderr = '';
  let finished = false;

  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  const KILL_TIMEOUT_MS = 30000; // 30 seconds limit

  const timeout = setTimeout(() => {
    if (!finished) {
      // Kill container by killing docker process; docker --rm will clean up
      try { child.kill('SIGKILL'); } catch {}
    }
  }, KILL_TIMEOUT_MS);

  return new Promise<SandboxRunResult>((resolve) => {
    child.on('close', (code) => {
      finished = true;
      clearTimeout(timeout);
      // cleanup temp dir
      try { fs.rmSync(workDir, { recursive: true, force: true }); } catch {}
      const end = Date.now();
      const result: SandboxRunResult = {
        stdout,
        stderr,
        exitCode: code,
        durationMs: end - start,
        timedOut: (end - start) >= KILL_TIMEOUT_MS && code === null
      };
      resolve(result);
    });
    child.on('error', (err) => {
      finished = true;
      clearTimeout(timeout);
      try { fs.rmSync(workDir, { recursive: true, force: true }); } catch {}
      const end = Date.now();
      resolve({
        stdout,
        stderr: stderr + `\nProcess error: ${err.message}`,
        exitCode: null,
        durationMs: end - start,
        timedOut: false
      });
    });
  });
}
