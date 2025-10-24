import React, { useEffect, useRef } from 'react';
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

interface CodeHighlighterProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

const CodeHighlighter: React.FC<CodeHighlighterProps> = ({
  code,
  language,
  showLineNumbers = false
}) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      try {
        Prism.highlightElement(codeRef.current);
      } catch (e) {
        // 发生错误时降级到纯文本，避免页面崩溃
        codeRef.current.className = 'language-plaintext';
        try { Prism.highlightElement(codeRef.current); } catch {}
      }
    }
  }, [code, language]);

  // 获取对应的Prism语言
  const getPrismLanguage = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
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

  return (
    <div className="prism-theme" style={{ position: 'relative' }}>
      <pre className={showLineNumbers ? 'line-numbers' : ''}>
        <code 
          ref={codeRef} 
          className={`language-${prismLanguage}`}
          style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: 14 }}
        >
          {code}
        </code>
      </pre>
      
      <style>{`
        .prism-theme {
          background: #f8f8f8;
          border-radius: 4px;
          padding: 16px;
          overflow: auto;
          max-height: 600px;
        }
        
        /* 跟随应用主题，而不是系统偏好 */
        :root[data-theme='dark'] .prism-theme {
          background: #1f1f1f;
          color: #f8f8f2;
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
      `}</style>
    </div>
  );
};

export default CodeHighlighter;