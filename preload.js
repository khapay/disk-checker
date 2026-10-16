const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('diskAPI', {
  getDiskSpace: () => ipcRenderer.invoke('get-c-drive-space'),
  closeApp: () => ipcRenderer.send('close-app')
});