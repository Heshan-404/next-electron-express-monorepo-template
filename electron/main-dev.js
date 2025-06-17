const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("node:path");

let mainWindow = null;
let loadingWindow = null;

const UI_LOADING_DELAY_MS = 2000;

function createLoadingWindow() {
    loadingWindow = new BrowserWindow({
        width: 500, height: 500, frame: false, transparent: true, hasShadow: true, webPreferences: {
            nodeIntegration: true, contextIsolation: false, webSecurity: false,
        },
    });

    loadingWindow.loadFile(path.join(__dirname, "loading.html")).catch((err) => {
        console.error("Failed to load loading screen:", err);
        loadingWindow = null;
    });

    loadingWindow.on("closed", () => {
        loadingWindow = null;
    });
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1366, height: 768, show: false, // Hide until ready
        webPreferences: {
            nodeIntegration: false, contextIsolation: true,
        },
    });

    const loadPromise = mainWindow.loadURL("http://localhost:3000");

    loadPromise.catch((err) => {
        if (loadingWindow && !loadingWindow.isDestroyed()) {
            loadingWindow.webContents.send("loading-error", `Failed to load app: ${err.message}`);
        }
        app.quit();
    });

    mainWindow.once("ready-to-show", () => {
        if (loadingWindow && !loadingWindow.isDestroyed()) {
            let opacity = 1;
            const fadeInterval = setInterval(() => {
                if (loadingWindow && !loadingWindow.isDestroyed()) {
                    opacity -= 0.05;
                    if (opacity <= 0) {
                        clearInterval(fadeInterval);
                        loadingWindow.close();
                    } else {
                        loadingWindow.setOpacity(opacity);
                    }
                } else {
                    clearInterval(fadeInterval);
                }
            }, 50);
        }
        mainWindow.show();
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    mainWindow.webContents.openDevTools();
}


app.whenReady().then(() => {
    createLoadingWindow();

    setTimeout(() => {
        createMainWindow();
    }, UI_LOADING_DELAY_MS);
});


app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

ipcMain.on("loading-message", (event, message) => {
    if (loadingWindow && !loadingWindow.isDestroyed()) {
        loadingWindow.webContents.send("loading-message", message);
    }
});

ipcMain.on("loading-error", (event, error) => {
    if (loadingWindow && !loadingWindow.isDestroyed()) {
        loadingWindow.webContents.send("loading-error", error);
    }
});