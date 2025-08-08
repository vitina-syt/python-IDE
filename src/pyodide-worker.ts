// src/pyodide-worker.ts
// WebWorker for running Python code in Pyodide

const ctx: DedicatedWorkerGlobalScope = self as any;

let pyodide: any = null;
let pyodideLoadingPromise: Promise<void> | null = null;

async function initializePyodide() {
  if (pyodide) return pyodide;
  
  if (pyodideLoadingPromise) {
    await pyodideLoadingPromise;
    return pyodide;
  }
  
  pyodideLoadingPromise = (async () => {
    try {
      // 动态导入 Pyodide
      const pyodide_pkg = await import(
        // @ts-ignore
        'https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.mjs'
      );
      
      pyodide = await pyodide_pkg.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/",
      });
    } catch (error) {
      console.error('Failed to initialize Pyodide:', error);
      throw error;
    }
  })();
  
  await pyodideLoadingPromise;
  return pyodide;
}

ctx.onmessage = async function(e) {
  const { code } = e.data;
  
  try {
    const pyodideInstance = await initializePyodide();
    const result = await pyodideInstance.runPythonAsync(code);
    ctx.postMessage({ result: result?.toString() ?? '' });
  } catch (err) {
    ctx.postMessage({ result: `Error: ${err}` });
  }
};