// @ts-ignore
import * as Monaco from 'monaco-editor';

// 记录已注册过的语言，避免重复注册导致重复建议
const registeredLanguages = new Set<string>();

type SuggestionSpec = {
  label: string;
  insertText: string;
  detail?: string;
  documentation?: string;
};

const LANGUAGE_SNIPPETS: Record<string, SuggestionSpec[]> = {
  javascript: [
    { label: 'log', insertText: "console.log(${1:msg});", detail: 'console.log', documentation: '输出日志到控制台' },
    { label: 'func', insertText: "function ${1:name}(${2:args}) {\n  ${3:// TODO}\n}", detail: 'function 模板' },
    { label: 'async', insertText: "async function ${1:name}(${2:args}) {\n  try {\n    ${3:// await ...}\n  } catch (e) {\n    console.error(e);\n  }\n}", detail: 'async/await 模板' },
    { label: 'fetch', insertText: "fetch('${1:/api}', { method: '${2:GET}' })\n  .then(r => r.json())\n  .then(data => {\n    console.log(data);\n  });", detail: 'fetch 请求模板' },
  ],
  typescript: [
    { label: 'interface', insertText: "interface ${1:Name} {\n  ${2:key}: ${3:type};\n}", detail: '接口模板' },
    { label: 'type', insertText: "type ${1:Alias} = ${2:string | number};", detail: '类型别名模板' },
    { label: 'log', insertText: "console.log(${1:msg});", detail: 'console.log' },
  ],
  python: [
    { label: 'def', insertText: "def ${1:func}(${2:args}):\n    ${3:pass}", detail: '函数定义' },
    { label: 'ifmain', insertText: "if __name__ == '__main__':\n    ${1:main()}\n", detail: '入口判断' },
    { label: 'print', insertText: "print(${1:msg})", detail: '打印' },
    { label: 'try', insertText: "try:\n    ${1:# do something}\nexcept Exception as e:\n    print(e)", detail: '异常处理' },
  ],
  java: [
    { label: 'main', insertText: "public class ${1:Main} {\n  public static void main(String[] args) {\n    ${2:System.out.println(\"Hello\");}\n  }\n}", detail: '主函数' },
    { label: 'sout', insertText: "System.out.println(${1:msg});", detail: '打印输出' },
  ],
  go: [
    { label: 'main', insertText: "package main\n\nimport \"fmt\"\n\nfunc main() {\n  fmt.Println(${1:\"Hello\"})\n}", detail: '主函数' },
    { label: 'func', insertText: "func ${1:name}(${2:args}) ${3:returnType} {\n  ${4:// TODO}\n}", detail: '函数模板' },
  ],
  cpp: [
    { label: 'main', insertText: "#include <iostream>\nusing namespace std;\nint main() {\n  cout << ${1:\"Hello\"} << endl;\n  return 0;\n}", detail: '主函数' },
  ],
  csharp: [
    { label: 'main', insertText: "using System;\nclass Program {\n  static void Main(string[] args) {\n    Console.WriteLine(${1:\"Hello\"});\n  }\n}", detail: '主函数' },
  ],
  php: [
    { label: 'echo', insertText: "<?php echo ${1:'Hello'}; ?>", detail: '输出' },
  ],
  ruby: [
    { label: 'puts', insertText: "puts ${1:'Hello'}", detail: '输出' },
    { label: 'def', insertText: "def ${1:method}(${2:args})\n  ${3:# TODO}\nend", detail: '方法定义' },
  ],
  swift: [
    { label: 'print', insertText: "print(${1:msg})", detail: '打印' },
    { label: 'func', insertText: "func ${1:name}(${2:args}) -> ${3:Return} {\n  ${4:// TODO}\n}", detail: '函数定义' },
  ],
  html: [
    { label: 'html5', insertText: "<!doctype html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>${1:Title}</title>\n</head>\n<body>\n  ${2:Hello}\n</body>\n</html>", detail: 'HTML5 模板' },
    { label: 'div', insertText: "<div class=\"${1:class}\">${2:content}</div>", detail: 'div 标签' },
  ],
  css: [
    { label: 'rule', insertText: "${1:selector} {\n  ${2:property}: ${3:value};\n}", detail: '样式规则' },
  ],
  sql: [
    { label: 'select', insertText: "SELECT ${1:*} FROM ${2:table} WHERE ${3:condition};", detail: '查询' },
  ],
  json: [
    { label: 'obj', insertText: "{\n  \"key\": \"value\"\n}", detail: '对象模板' },
  ],
  markdown: [
    { label: 'h1', insertText: "# ${1:标题}", detail: '一级标题' },
    { label: 'code', insertText: "```lang\n${1:code}\n```", detail: '代码块' },
  ],
  plaintext: [
    { label: 'todo', insertText: "TODO: ${1:item}", detail: '待办事项' },
  ],
};

export function initializeMonaco(monaco: typeof Monaco, languages: string[] = []) {
  const targets = languages.length ? languages : Object.keys(LANGUAGE_SNIPPETS);
  targets.forEach((lang) => {
    if (registeredLanguages.has(lang)) return;
    registeredLanguages.add(lang);

    const snippets = LANGUAGE_SNIPPETS[lang] || [];

    monaco.languages.registerCompletionItemProvider(lang, {
      provideCompletionItems: (model: Monaco.editor.ITextModel, position: Monaco.Position) => {
        const suggestions: Monaco.languages.CompletionItem[] = snippets.map((s) => ({
          label: s.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: s.insertText,
          detail: s.detail,
          documentation: s.documentation,
          range: undefined,
        }));
        return { suggestions };
      },
      triggerCharacters: ['.', ':', '(', '<', '"', '\'', ' '],
    });
  });
}
