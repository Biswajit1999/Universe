const { contextBridge, ipcRenderer } = require("electron");

// Deliberately tiny bridge. File, shell and automation permissions will be
// added as individually validated commands; the renderer never receives Node.
contextBridge.exposeInMainWorld("universeDesktop", Object.freeze({
  isDesktop: true,
  getInfo: () => ipcRenderer.invoke("universe:desktop-info"),
}));
