import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-markup'; // 包含HTML
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
const CodeHighlighter = ({ code, language, showLineNumbers = false }) => {
    const codeRef = useRef(null);
    useEffect(() => {
        if (codeRef.current) {
            try {
                Prism.highlightElement(codeRef.current);
            }
            catch (e) {
                // 发生错误时降级到纯文本，避免页面崩溃
                codeRef.current.className = 'language-plaintext';
                try {
                    Prism.highlightElement(codeRef.current);
                }
                catch { }
            }
        }
    }, [code, language]);
    // 获取对应的Prism语言
    const getPrismLanguage = (lang) => {
        const languageMap = {
            javascript: 'javascript',
            typescript: 'typescript',
            python: 'python',
            java: 'java',
            go: 'go',
            cpp: 'cpp',
            csharp: 'csharp',
            php: 'php',
            ruby: 'ruby',
            swift: 'swift',
            html: 'html',
            css: 'css',
            sql: 'sql',
            json: 'json',
            markdown: 'markdown',
            plaintext: 'plaintext'
        };
        return languageMap[lang] || 'plaintext';
    };
    const resolvedLang = getPrismLanguage(language);
    const prismLanguage = Prism.languages[resolvedLang] ? resolvedLang : 'plaintext';
    return (_jsxs("div", { className: "prism-theme", style: { position: 'relative' }, children: [_jsx("pre", { className: showLineNumbers ? 'line-numbers' : '', children: _jsx("code", { ref: codeRef, className: `language-${prismLanguage}`, style: { fontFamily: 'Monaco, Consolas, monospace', fontSize: 14 }, children: code }) }), _jsx("style", { children: `
        .prism-theme {
          background: #f8f8f8;
          border-radius: 4px;
          padding: 16px;
          overflow: auto;
          max-height: 600px;
        }
        
        @media (prefers-color-scheme: dark) {
          .prism-theme {
            background: #2d2d2d;
            color: #f8f8f2;
          }
        }
        
        pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .line-numbers .line-numbers-rows {
          position: absolute;
          pointer-events: none;
          top: 0;
          font-size: 100%;
          left: -3.8em;
          width: 3em;
          letter-spacing: -1px;
          border-right: 1px solid #999;
          user-select: none;
        }
      ` })] }));
};
export default CodeHighlighter;
