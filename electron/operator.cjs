const { randomUUID } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const MAX_TEXT_BYTES = 1024 * 1024;
const TOKEN_TTL_MS = 30 * 60 * 1000;
const TEXT_EXTENSIONS = new Set([".txt", ".md", ".json", ".csv", ".tsv", ".log", ".yaml", ".yml", ".js", ".ts", ".tsx", ".jsx", ".css", ".html", ".py"]);

function createOperator({ stateFile, backupDirectory, dialog, shell, diagnostics, getWindow }) {
  const selections = new Map();

  function readState() {
    try {
      return JSON.parse(fs.readFileSync(stateFile, "utf8"));
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      return { enabled: false, updatedAt: 0 };
    }
  }

  function writeState(state) {
    fs.mkdirSync(path.dirname(stateFile), { recursive: true });
    const temporary = `${stateFile}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(state, null, 2), { encoding: "utf8", mode: 0o600 });
    fs.renameSync(temporary, stateFile);
  }

  function assertEnabled() {
    if (!readState().enabled) throw new Error("ATLAS_DISABLED");
  }

  function selection(token) {
    const selected = selections.get(token);
    if (!selected || Date.now() - selected.selectedAt > TOKEN_TTL_MS) {
      selections.delete(token);
      throw new Error("FILE_SELECTION_EXPIRED");
    }
    return selected;
  }

  async function setEnabled(enabled) {
    if (enabled) {
      const result = await dialog.showMessageBox(getWindow(), {
        type: "warning",
        buttons: ["Enable Atlas", "Cancel"],
        defaultId: 1,
        cancelId: 1,
        noLink: true,
        title: "Enable local operator",
        message: "Enable Atlas desktop tools?",
        detail: "Atlas will still require native approval for file writes and application launches. It cannot run arbitrary commands or browse your filesystem.",
      });
      if (result.response !== 0) return { enabled: false, changed: false };
    }
    const state = { enabled, updatedAt: Date.now() };
    writeState(state);
    diagnostics.write("operator.state", state);
    return { ...state, changed: true };
  }

  async function pickTextFile() {
    assertEnabled();
    const result = await dialog.showOpenDialog(getWindow(), {
      title: "Select a text file for Atlas",
      properties: ["openFile"],
      filters: [
        { name: "Text and source files", extensions: [...TEXT_EXTENSIONS].map((extension) => extension.slice(1)) },
        { name: "All files", extensions: ["*"] },
      ],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const filePath = path.resolve(result.filePaths[0]);
    const extension = path.extname(filePath).toLowerCase();
    if (!TEXT_EXTENSIONS.has(extension)) throw new Error("UNSUPPORTED_FILE_TYPE");
    const stats = fs.statSync(filePath);
    if (!stats.isFile() || stats.size > MAX_TEXT_BYTES) throw new Error("FILE_TOO_LARGE");
    const token = randomUUID();
    selections.set(token, { filePath, selectedAt: Date.now() });
    diagnostics.write("operator.file-selected", { name: path.basename(filePath), bytes: stats.size });
    return { token, name: path.basename(filePath), extension, bytes: stats.size, modifiedAt: stats.mtimeMs };
  }

  function readSelectedFile(token) {
    assertEnabled();
    const { filePath } = selection(token);
    const stats = fs.statSync(filePath);
    if (stats.size > MAX_TEXT_BYTES) throw new Error("FILE_TOO_LARGE");
    const content = fs.readFileSync(filePath, "utf8");
    diagnostics.write("operator.file-read", { name: path.basename(filePath), bytes: stats.size });
    return { content, bytes: Buffer.byteLength(content, "utf8"), modifiedAt: stats.mtimeMs };
  }

  async function writeSelectedFile(token, content) {
    assertEnabled();
    const selected = selection(token);
    const normalized = String(content ?? "");
    const bytes = Buffer.byteLength(normalized, "utf8");
    if (bytes > MAX_TEXT_BYTES) throw new Error("FILE_TOO_LARGE");
    const result = await dialog.showMessageBox(getWindow(), {
      type: "warning",
      buttons: ["Write file", "Cancel"],
      defaultId: 1,
      cancelId: 1,
      noLink: true,
      title: "Approve file write",
      message: `Allow Atlas to replace ${path.basename(selected.filePath)}?`,
      detail: `${bytes.toLocaleString()} bytes will be written. The previous version will be copied to UNIVERSE's private backup folder.`,
    });
    if (result.response !== 0) return { written: false, cancelled: true };

    fs.mkdirSync(backupDirectory, { recursive: true });
    const backupName = `${Date.now()}-${path.basename(selected.filePath)}`;
    fs.copyFileSync(selected.filePath, path.join(backupDirectory, backupName));
    const temporary = `${selected.filePath}.universe-tmp`;
    fs.writeFileSync(temporary, normalized, { encoding: "utf8" });
    fs.renameSync(temporary, selected.filePath);
    diagnostics.write("operator.file-written", { name: path.basename(selected.filePath), bytes, backupName });
    return { written: true, cancelled: false, bytes, backupName };
  }

  const applications = [
    { id: "notepad", name: "Notepad", requiresConfirmation: true },
    { id: "calculator", name: "Calculator", requiresConfirmation: true },
    { id: "spotify", name: "Spotify", requiresConfirmation: false },
    { id: "youtube-music", name: "YouTube Music", requiresConfirmation: false },
  ];

  async function launchApplication(id) {
    assertEnabled();
    const application = applications.find((candidate) => candidate.id === id);
    if (!application) throw new Error("APPLICATION_NOT_ALLOWED");
    if (application.requiresConfirmation) {
      const result = await dialog.showMessageBox(getWindow(), {
        type: "question",
        buttons: ["Launch", "Cancel"],
        defaultId: 1,
        cancelId: 1,
        noLink: true,
        title: "Approve application launch",
        message: `Allow Atlas to launch ${application.name}?`,
        detail: "Only applications on your UNIVERSE allow-list can be opened.",
      });
      if (result.response !== 0) return { launched: false, cancelled: true };
    }
    let error = "";
    if (id === "calculator") error = await shell.openExternal("calculator:").then(() => "").catch((reason) => String(reason));
    else if (id === "notepad") error = await shell.openPath(path.join(process.env.SystemRoot || "C:\\Windows", "System32", "notepad.exe"));
    else if (id === "youtube-music") error = await shell.openExternal("https://music.youtube.com").then(() => "").catch((reason) => String(reason));
    else {
      error = await shell.openExternal("spotify:").then(() => "").catch((reason) => String(reason));
      if (error) error = await shell.openExternal("https://open.spotify.com").then(() => "").catch((reason) => String(reason));
    }
    if (error) throw new Error("APPLICATION_LAUNCH_FAILED");
    diagnostics.write("operator.application-launched", { id });
    return { launched: true, cancelled: false };
  }

  return Object.freeze({
    status: () => readState(),
    setEnabled,
    pickTextFile,
    readSelectedFile,
    writeSelectedFile,
    listApplications: () => applications.map(({ id, name }) => ({ id, name })),
    launchApplication,
  });
}

module.exports = { createOperator, MAX_TEXT_BYTES };
