# pythonIDE 网页端运行环境
该MVP项目基于vite+react+ts开发，结合WebAssembly沙箱环境，IndexedDB前端内存实现python项目管理，为了进一步实现多个python项目同时运行，引入webworker实现多线程优化。

## 技术点
- python IDE web
- WebAssembly（Pyodide）+IndexedDB
- webworker

## 让我们开始体验吧
1. 安装依赖:
   ```bash
   npm install
   ```
2. 项目运行:
   ```bash
   npm run dev
   ```

## 项目时间轴
- 多项目同时运行
- UI优化
- 项目架构优化
- 引入代码实现到执行Agent，结合图文prompt

# pythonIDE Python Web App

This project is a Vite-based TypeScript web application that allows users to run Python code in the browser using a WebAssembly Python runtime (such as Pyodide). It uses IndexedDB for persistent storage of code snippets and results, and simulates a Python execution container in pythonIDE.

## Features
- Run Python code in the browser (pythonIDE)
- Store code and results in IndexedDB
- Modern UI for code editing and output display

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser at the provided local address.

## Next Steps
- Integrate Pyodide or pythonIDE CPython
- Implement IndexedDB storage
- Build code editor and output components

## remember
- cd backend 
- python3 -m venv venv 
- source venv/bin/activate 