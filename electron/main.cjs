const { app, BrowserWindow, ipcMain, shell } = require("electron");
const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const HOST = "127.0.0.1";
const PORT = 3199;
const APP_URL = app.isPackaged ? `http://${HOST}:${PORT}` : (process.env.UNIVERSE_DEV_URL || "http://127.0.0.1:3000");
let serverProcess = null;
let mainWindow = null;

function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });
      request.on("error", () => {
        if (Date.now() - started > timeoutMs) reject(new Error("UNIVERSE local server did not start in time."));
        else setTimeout(check, 250);
      });
      request.setTimeout(1000, () => request.destroy());
    };
    check();
  });
}

async function startLocalServer() {
  if (!app.isPackaged) return;
  const serverRoot = path.join(process.resourcesPath, "universe-server");
  const serverEntry = path.join(serverRoot, "server.js");
  serverProcess = spawn(process.execPath, [serverEntry], {
    cwd: serverRoot,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      HOSTNAME: HOST,
      PORT: String(PORT),
      NODE_ENV: "production",
    },
    stdio: "ignore",
    windowsHide: true,
  });
  await waitForServer(APP_URL);
}

function isTrustedNavigation(target) {
  try {
    const url = new URL(target);
    return url.origin === new URL(APP_URL).origin;
  } catch {
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1560,
    height: 980,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: "#03050c",
    title: "UNIVERSE · Personal Intelligence System",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isTrustedNavigation(url)) event.preventDefault();
  });
  mainWindow.once("ready-to-show", () => mainWindow?.show());
  void mainWindow.loadURL(APP_URL);
}

ipcMain.handle("universe:desktop-info", () => ({
  platform: process.platform,
  version: app.getVersion(),
  packaged: app.isPackaged,
}));

const hasLock = app.requestSingleInstanceLock();
if (!hasLock) app.quit();
else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    await startLocalServer();
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  }).catch((error) => {
    console.error(error);
    app.quit();
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (serverProcess && !serverProcess.killed) serverProcess.kill();
});
