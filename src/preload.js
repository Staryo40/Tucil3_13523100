const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  pickInputFile: () => ipcRenderer.invoke('open-input'),
  runSolver: (config) => ipcRenderer.invoke('run-solver', config),
  exportOutput: () => ipcRenderer.invoke('export-output'),
});