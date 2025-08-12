import React, { useState, useEffect } from 'react';
import { loadPyodideAndRunPython } from './pyodide-loader';
import { saveProjectSnippet, getProjectSnippets, getAllProjects } from './db';
import ReactDOM from 'react-dom/client';
import {askQuestion} from '../api/askllm';
import './style.css';

function App() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [project, setProject] = useState('默认项目');
  const [projects, setProjects] = useState<string[]>([]);
  const [history, setHistory] = useState<Array<{id:number, code:string, result:string, date:Date}>>([]);

  useEffect(() => {
    getAllProjects().then(setProjects);
    getProjectSnippets(project).then(snippets => setHistory(snippets.map(s => ({id: s.id, code: s.code, result: s.result, date: new Date(s.date)}))));
  }, [project]);

  const runPython = async () => {
    const result = await loadPyodideAndRunPython(code);
    setOutput(result);
    await saveProjectSnippet(project, code, result);
    getProjectSnippets(project).then(snippets => setHistory(snippets.map(s => ({id: s.id, code: s.code, result: s.result, date: new Date(s.date)}))));
  };

  const handleNewProject = () => {
    const name = prompt('请输入新项目名称');
    if (name && !projects.includes(name)) {
      setProjects([...projects, name]);
      setProject(name);
    }
  };

  const handleDeleteProject = () => {
    if (window.confirm(`确定要删除项目 ${project} 吗？`)) {
      setProjects(projects.filter(p => p !== project));
      setProject(projects[0] || '默认项目');
    }
  };

  const ask=()=>{
    // 用法示例
    askQuestion('中国的首都是哪里？', '中国的首都是北京。')
      .then(res => console.log(res))
      .catch(err => console.error(err));
  }

  return (
    <div className="container">
      <h1 onClick={ask}>WASM Python 项目管理</h1>
      <div style={{ marginBottom: 16 }}>
        <select value={project} onChange={e => setProject(e.target.value)}>
          {projects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={handleNewProject}>新建项目</button>
        <button onClick={handleDeleteProject}>删除项目</button>
      </div>
      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        rows={8}
        cols={60}
        placeholder="编写 Python 代码..."
      />
      <br />
      <button type="button" onClick={runPython}>运行 Python</button>
      <h2>输出结果</h2>
      <pre>{output}</pre>
      <h2>运行历史</h2>
      <ul>
        {history.map(item => (
          <li key={item.id}>
            <div><b>代码：</b>{item.code}</div>
            <div><b>结果：</b>{item.result}</div>
            <div><b>时间：</b>{item.date.toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app')!);
root.render(<App />);
