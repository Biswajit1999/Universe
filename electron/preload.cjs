const { contextBridge, ipcRenderer } = require("electron");

// Deliberately tiny bridge. File, shell and automation permissions will be
// added as individually validated commands; the renderer never receives Node.
contextBridge.exposeInMainWorld("universeDesktop", Object.freeze({
  isDesktop: true,
  getInfo: () => ipcRenderer.invoke("universe:desktop-info"),
  secrets: Object.freeze({
    list: () => ipcRenderer.invoke("universe:secret-list"),
    set: (name, value) => ipcRenderer.invoke("universe:secret-set", { name, value }),
    remove: (name) => ipcRenderer.invoke("universe:secret-remove", name),
  }),
  diagnostics: Object.freeze({
    recent: () => ipcRenderer.invoke("universe:diagnostics-recent"),
  }),
}));
