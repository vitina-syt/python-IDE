import './style.css'
import { saveProjectSnippet, getProjectSnippets, getAllProjects } from './db';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <h1>WASM Python 项目管理</h1>
    <div style="margin-bottom:16px;">
      <select id="project-select"></select>
      <button id="new-project">新建项目</button>
      <button id="delete-project">删除项目</button>
    </div>
    <textarea id="code" rows="8" cols="60" placeholder="编写 Python 代码..."></textarea>
    <br />
    <button id="run" type="button">运行 Python</button>
    <h2>输出结果</h2>
    <pre id="output"></pre>
    <h2>运行历史</h2>
    <ul id="history"></ul>
  </div>
`;


const codeInput = document.getElementById('code') as HTMLTextAreaElement;
const runBtn = document.getElementById('run') as HTMLButtonElement;
const output = document.getElementById('output') as HTMLPreElement;
const historyList = document.getElementById('history') as HTMLUListElement;
const projectSelect = document.getElementById('project-select') as HTMLSelectElement;
const newProjectBtn = document.getElementById('new-project') as HTMLButtonElement;
const deleteProjectBtn = document.getElementById('delete-project') as HTMLButtonElement;

let currentProject = '';

async function refreshProjects() {
  const projects = await getAllProjects();
  projectSelect.innerHTML = '';
  projects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    projectSelect.appendChild(opt);
  });
  if (projects.length > 0) {
    currentProject = projectSelect.value = projects[0];
    await refreshHistory();
  } else {
    currentProject = '';
    historyList.innerHTML = '';
  }
}

projectSelect.onchange = async () => {
  currentProject = projectSelect.value;
  await refreshHistory();
};

newProjectBtn.onclick = async () => {
  const name = prompt('请输入新项目名称');
  if (name) {
    currentProject = name;
    await saveProjectSnippet(name, '', ''); // 占位，便于项目列表管理
    await refreshProjects();
    projectSelect.value = name;
    await refreshHistory();
  }
};

deleteProjectBtn.onclick = async () => {
  if (!currentProject) return;
  // 删除项目所有记录
  const db = await import('./db');
  const openDB = db.openDB;
  const STORE_NAME = 'projects';
  const idb = await openDB();
  const tx = idb.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  req.onsuccess = () => {
    req.result.forEach((item: any) => {
      if (item.project === currentProject) store.delete(item.id);
    });
    tx.oncomplete = async () => {
      await refreshProjects();
    };
  };
};

async function refreshHistory() {
  if (!currentProject) {
    historyList.innerHTML = '';
    return;
  }
  const snippets = await getProjectSnippets(currentProject);
  historyList.innerHTML = '';
  snippets.filter(s => s.code).reverse().forEach(snippet => {
    const li = document.createElement('li');
    li.textContent = `${snippet.date}: ${snippet.code} => ${snippet.result}`;
    historyList.appendChild(li);
  });
}

runBtn.onclick = async () => {
  if (!currentProject) {
    alert('请先选择或新建一个项目');
    return;
  }
  const code = codeInput.value;
  output.textContent = '运行中...';
  // 使用 WebWorker 运行 Python
  const worker = new Worker(new URL('./pyodide-worker.ts', import.meta.url), { type: 'module' });
  worker.postMessage({ code });
  worker.onmessage = async (e) => {
    output.textContent = e.data.result;
    await saveProjectSnippet(currentProject, code, e.data.result);
    await refreshHistory();
    worker.terminate();
  };
};

refreshProjects();
