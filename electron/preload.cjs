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
  operator: Object.freeze({
    status: () => ipcRenderer.invoke("universe:operator-status"),
    setEnabled: (enabled) => ipcRenderer.invoke("universe:operator-enable", enabled),
    pickTextFile: () => ipcRenderer.invoke("universe:operator-pick-text"),
    readTextFile: (token) => ipcRenderer.invoke("universe:operator-read-text", token),
    writeTextFile: (token, content) => ipcRenderer.invoke("universe:operator-write-text", { token, content }),
    applications: () => ipcRenderer.invoke("universe:operator-apps"),
    launchApplication: (id) => ipcRenderer.invoke("universe:operator-launch", id),
  }),
}));
