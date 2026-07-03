const { app, BrowserWindow, ipcMain, safeStorage, shell } = require("electron");
const { randomBytes } = require("node:crypto");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { createSecureStore } = require("./secure-store.cjs");
const { createDiagnostics } = require("./diagnostics.cjs");

const HOST = "127.0.0.1";
const PORT = 3199;
const APP_URL = app.isPackaged ? `http://${HOST}:${PORT}` : (process.env.UNIVERSE_DEV_URL || "http://127.0.0.1:3000");
let serverProcess = null;
let mainWindow = null;
let secureStore = null;
let diagnostics = null;
let dataDirectory = null;

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

function initialisePrivateRuntime() {
  const userData = app.getPath("userData");
  dataDirectory = path.join(userData, "data");
  fs.mkdirSync(dataDirectory, { recursive: true });
  diagnostics = createDiagnostics(path.join(userData, "logs"));
  secureStore = createSecureStore({ filePath: path.join(userData, "credentials.json"), safeStorage });
  secureStore.ensureInternal("UNIVERSE_VAULT_KEY", () => randomBytes(32).toString("base64"));
  diagnostics.write("runtime.initialised", { packaged: app.isPackaged, platform: process.platform });
}

async function startLocalServer() {
  if (!app.isPackaged) return;
  const serverRoot = path.join(process.resourcesPath, "universe-server");
  const serverEntry = path.join(serverRoot, "server.js");
  const secretEnvironment = secureStore.environment();
  serverProcess = spawn(process.execPath, [serverEntry], {
    cwd: serverRoot,
    env: {
      ...process.env,
      ...secretEnvironment,
      ELECTRON_RUN_AS_NODE: "1",
      HOSTNAME: HOST,
      PORT: String(PORT),
      NODE_ENV: "production",
      UNIVERSE_DATA_DIR: dataDirectory,
    },
    stdio: "ignore",
    windowsHide: true,
  });
  serverProcess.once("exit", (code, signal) => diagnostics?.write("server.exit", { code, signal }));
  await waitForServer(APP_URL);
  diagnostics.write("server.ready", { host: HOST, port: PORT });
}

function isTrustedNavigation(target) {
  try {
    return new URL(target).origin === new URL(APP_URL).origin;
  } catch {
    return false;
  }
}

function assertTrustedSender(event) {
  const source = event.senderFrame?.url || event.sender?.getURL();
  if (!source || !isTrustedNavigation(source)) throw new Error("Untrusted desktop request.");
}

function registerPrivateIpc() {
  ipcMain.handle("universe:desktop-info", (event) => {
    assertTrustedSender(event);
    return {
      platform: process.platform,
      version: app.getVersion(),
      packaged: app.isPackaged,
      dataDirectory,
    };
  });
  ipcMain.handle("universe:secret-list", (event) => {
    assertTrustedSender(event);
    return secureStore.list();
  });
  ipcMain.handle("universe:secret-set", (event, input) => {
    assertTrustedSender(event);
    secureStore.set(input?.name, input?.value);
    diagnostics.write("credential.updated", { credential: input?.name });
    return { ok: true, restartRequired: true };
  });
  ipcMain.handle("universe:secret-remove", (event, name) => {
    assertTrustedSender(event);
    secureStore.remove(name);
    diagnostics.write("credential.removed", { credential: name });
    return { ok: true, restartRequired: true };
  });
  ipcMain.handle("universe:diagnostics-recent", (event) => {
    assertTrustedSender(event);
    return diagnostics.recent(50);
  });
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
  mainWindow.webContents.on("render-process-gone", (_event, detail) => diagnostics?.write("renderer.gone", detail));
  mainWindow.once("ready-to-show", () => mainWindow?.show());
  void mainWindow.loadURL(APP_URL);
}

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
    initialisePrivateRuntime();
    registerPrivateIpc();
    await startLocalServer();
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  }).catch((error) => {
    diagnostics?.write("runtime.fatal", { error });
    app.quit();
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  diagnostics?.write("runtime.stopping");
  if (serverProcess && !serverProcess.killed) serverProcess.kill();
});
