import express from 'express';
import { runInSandbox, SupportedLanguage, ensureDockerAvailable } from '../services/sandboxRunner';

const router = express.Router();

router.post('/run', async (req, res) => {
  try {
    const { language, code } = req.body as { language: SupportedLanguage; code: string };
    if (!language || !code) {
      return res.status(400).json({ error: 'language 与 code 为必填' });
    }
    const supported: SupportedLanguage[] = ['javascript', 'python', 'php', 'ruby', 'go', 'java', 'cpp', 'csharp', 'swift', 'typescript'];
    if (!supported.includes(language)) {
      return res.status(400).json({ error: '不支持的语言' });
    }

    const result = await runInSandbox({ language, code });
    return res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
      timedOut: result.timedOut
    });
  } catch (error: any) {
    console.error('沙盒运行错误:', error);
    if (String(error?.message || '').startsWith('DockerUnavailable')) {
      return res.status(503).json({ error: '沙盒不可用：Docker 未安装或未启动，请先启动 Docker Desktop' });
    }
    return res.status(500).json({ error: error?.message || '沙盒运行失败' });
  }
});

router.post('/warmup', async (req, res) => {
  try {
    await ensureDockerAvailable();
    // 可选 languages 指定，否则预热所有可执行语言镜像
    const requestLangs = (req.body?.languages ?? []) as SupportedLanguage[];
    const entries = Object.entries(require('../services/sandboxRunner').languageConfig || {});
    // 由于直接 require(ts)不可用，这里简单写死需要预热的镜像集合
    const images: string[] = [
      'node:18-alpine',
      'python:3.11-alpine',
      'php:8.2-cli-alpine',
      'alpine:3.19',
      'ruby:3.3-alpine',
      'golang:1.22-alpine',
      'eclipse-temurin:17-jdk-alpine',
      'gcc:13.2.0',
      'mono:6.12',
      'swift:5.9'
    ];
    const pulls = images.map(img => new Promise<void>((resolve) => {
      const p = require('child_process').spawn('docker', ['pull', img], { stdio: ['ignore','pipe','pipe'] });
      p.on('close', () => resolve());
      p.on('error', () => resolve());
    }));
    await Promise.all(pulls);
    return res.json({ ok: true });
  } catch (error: any) {
    if (String(error?.message || '').startsWith('DockerUnavailable')) {
      return res.status(503).json({ error: '沙盒不可用：Docker 未安装或未启动，请先启动 Docker Desktop' });
    }
    return res.status(500).json({ error: '预热失败' });
  }
});

export default router;