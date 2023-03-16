const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI',{
  sendMessage: (message) => ipcRenderer.invoke('message', message),
  handlePlay: (callback) => ipcRenderer.on('play', callback),
  handlePause: (callback) => ipcRenderer.on('pause', callback),
  handleRewind: (callback) => ipcRenderer.on('rewind', callback),
});