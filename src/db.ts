// src/db.ts
// IndexedDB utility for storing code snippets and results

const DB_NAME = 'wasm-python-db-2';
const STORE_NAME = 'projects';

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    console.log('111')
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 添加一个安全的事务创建函数
async function createTransaction(mode: IDBTransactionMode = 'readonly') {
  try {
    const db = await openDB();
    // 检查对象存储是否存在
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      throw new Error(`Object store '${STORE_NAME}' not found`);
    }
    return db.transaction(STORE_NAME, mode);
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

export async function saveProjectSnippet(project: string, code: string, result: string) {
  try {
    const tx = await createTransaction('readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.add({ project, code, result, date: new Date() });
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Error saving project snippet:', error);
    throw error;
  }
}

export async function getProjectSnippets(project: string): Promise<Array<{id: number, project: string, code: string, result: string, date: Date}>> {
  try {
    const tx = await createTransaction('readonly');
    return new Promise((resolve) => {
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const all = request.result.filter((item: any) => item.project === project);
        resolve(all);
      };
      request.onerror = () => {
        console.error('Error getting project snippets:', request.error);
        resolve([]);
      };
    });
  } catch (error) {
    console.error('Error getting project snippets:', error);
    return [];
  }
}

export async function getAllProjects(): Promise<string[]> {
  try {
    const tx = await createTransaction('readonly');
    return new Promise((resolve) => {
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const projects = Array.from(new Set(request.result.map((item: any) => item.project)));
        resolve(projects);
      };
      request.onerror = () => {
        console.error('Error getting all projects:', request.error);
        resolve([]);
      };
    });
  } catch (error) {
    console.error('Error getting all projects:', error);
    return [];
  }
}