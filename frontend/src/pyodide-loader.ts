// src/pyodide-loader.ts
// Utility to load Pyodide and run Python code in the browser

export async function loadPyodideAndRunPython(code: string): Promise<string> {
  // Dynamically import Pyodide from CDN
  // @ts-ignore
  if (!window.pyodide) {
    // Load Pyodide script
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
    // @ts-ignore
    window.pyodide = await window.loadPyodide();
  }
  // @ts-ignore
  const pyodide = window.pyodide;
  try {
    const result = await pyodide.runPythonAsync(code);
    return result?.toString() ?? '';
  } catch (err) {
    console.error('------',err);
    return `Error: ${err}`;
  }
}
