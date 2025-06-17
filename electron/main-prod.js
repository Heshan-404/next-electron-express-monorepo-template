// main-prod.js
const {app, BrowserWindow, ipcMain, protocol} = require("electron");
const path = require("node:path");
const {spawn} = require("node:child_process");
const fs = require("node:fs");
const waitOn = require("wait-on");
const dotenv = require("dotenv"); // <-- ADD THIS LINE

let backendProcess = null;
let loadingWindow = null;
let mainWindow = null;

const BACKEND_PORT = 5002;
const UI_LOADING_DELAY_MS = 5000; // Delay for UI to show before backend starts (gives loading screen time)

// --- Logging Setup ---
let logFilePath;

/**
 * Initializes the logger, determining the log file path and ensuring its directory exists.
 */
function setupLogger() {
    const appDataPath = app.getPath('userData');
    logFilePath = path.join(appDataPath, 'logs', 'electron-app.log');

    try {
        fs.mkdirSync(path.dirname(logFilePath), {recursive: true});
    } catch (e) {
        console.error(`ERROR: Failed to create log directory at ${path.dirname(logFilePath)}: ${e.message}`);
    }

    console.log(`Application logs will be written to: ${logFilePath}`);
    logMessage(`--- Application Started ---`);
    logMessage(`Electron version: ${process.versions.electron}`);
    logMessage(`Node.js version: ${process.versions.node}`);
    logMessage(`Chrome version: ${process.versions.chrome}`);
    logMessage(`App is packaged: ${app.isPackaged}`);
    logMessage(`User Data Path: ${appDataPath}`);
    logMessage(`Current Electron Architecture: ${process.arch}`);
}

/**
 * Logs a message to both the console and the application log file.
 * @param {string} message - The message to log.
 * @param {'INFO' | 'WARN' | 'ERROR'} level - The log level.
 */
function logMessage(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;

    if (level === 'ERROR') {
        console.error(logEntry.trim());
    } else {
        console.log(logEntry.trim());
    }

    if (logFilePath) {
        try {
            fs.appendFileSync(logFilePath, logEntry);
        } catch (e) {
            console.error(`CRITICAL ERROR: Failed to write to log file ${logFilePath}: ${e.message}`);
        }
    }
}

// --- End Logging Setup ---


// Register custom protocol 'app://' for loading frontend assets
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'app',
        privileges: {standard: true, secure: true, bypassCSP: true, supportFetchAPI: true, corsEnabled: true}
    }
]);

function createLoadingWindow() {
    logMessage("Attempting to create loading window.");
    loadingWindow = new BrowserWindow({
        width: 500,
        height: 500,
        frame: false,
        transparent: true,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    const loadingHtmlPath = path.join(__dirname, "loading.html");
    loadingWindow.loadFile(loadingHtmlPath);
    logMessage(`Loading window trying to load: ${loadingHtmlPath}`);

    loadingWindow.on("closed", () => {
        logMessage("Loading window closed.");
        loadingWindow = null;
    });

    loadingWindow.on("unresponsive", () => {
        logMessage("Loading window became unresponsive.", 'WARN');
    });
    loadingWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        logMessage(`Loading window failed to load URL: ${validatedURL}, Error: ${errorCode} - ${errorDescription}`, 'ERROR');
    });
}

function createMainWindow() {
    logMessage("Attempting to create main window.");
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadURL('app://./');
    logMessage("Main window attempting to load URL: app://./");

    mainWindow.once("ready-to-show", () => {
        logMessage("Main window is ready to show.");
        if (loadingWindow && !loadingWindow.isDestroyed()) {
            logMessage("Fading out loading window.");
            let opacity = 1;
            const fadeInterval = setInterval(() => {
                if (loadingWindow && !loadingWindow.isDestroyed()) {
                    opacity -= 0.05;
                    if (opacity <= 0) {
                        clearInterval(fadeInterval);
                        loadingWindow.close();
                        logMessage("Loading window faded out and closed.");
                    } else {
                        loadingWindow.setOpacity(opacity);
                    }
                } else {
                    clearInterval(fadeInterval);
                    logMessage("Loading window already destroyed during fade, clearing interval.", 'WARN');
                }
            }, 50);
        } else {
            logMessage("No loading window to fade out, or it was already destroyed.", 'INFO');
        }
        mainWindow.show();
        logMessage("Main window displayed.");
    });

    mainWindow.on("closed", () => {
        logMessage("Main window closed.");
        mainWindow = null;
    });

    mainWindow.on("unresponsive", () => {
        logMessage("Main window became unresponsive.", 'WARN');
    });
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        logMessage(`Main window failed to load URL: ${validatedURL}, Error: ${errorCode} - ${errorDescription}`, 'ERROR');
    });
}

function startBackendAndLoadFrontend() {
    // Determine the backend executable name based on the current Electron app's architecture
    // This assumes you have built index-x64.exe and index-ia32.exe for their respective architectures
    let backendExecutableName = `index-${process.arch}.exe`;
    let backendPath;
    let backendBaseDir;

    if (app.isPackaged) {
        backendBaseDir = path.join(process.resourcesPath, "app.asar.unpacked", "backend", "bin");
    } else {
        backendBaseDir = path.join(__dirname, "..", "backend", "bin");
    }

    backendPath = path.join(backendBaseDir, backendExecutableName);
    logMessage(`Attempting to find backend executable at: ${backendPath}`);

    // Fallback if the architecture-specific executable isn't found
    if (!fs.existsSync(backendPath)) {
        logMessage(`Backend executable for ${process.arch} not found at ${backendPath}.`, 'WARN');
        // Fallback to x64 if it's the most common build or if ia32 isn't explicitly built.
        // Adjust this fallback logic based on what executables you reliably build.
        const fallbackExecutableName = `index-x64.exe`; // Assuming x64 is the primary build target
        const fallbackPath = path.join(backendBaseDir, fallbackExecutableName);

        if (fs.existsSync(fallbackPath)) {
            backendPath = fallbackPath;
            logMessage(`Falling back to ${fallbackExecutableName} at: ${backendPath}`);
        } else {
            const errorMsg = `ERROR: Backend executable for ${process.arch} or fallback (${fallbackExecutableName}) not found at: ${backendBaseDir}`;
            logMessage(errorMsg, 'ERROR');
            if (loadingWindow && !loadingWindow.isDestroyed()) {
                loadingWindow.webContents.send("loading-error", errorMsg);
            }
            app.quit(); // Critical error: cannot proceed without backend
            return;
        }
    }

    logMessage(`Spawning backend process: ${backendPath}`);

    // --- IMPORTANT: Define environment variables for the backend process ---
    const backendEnv = {
        // Only pass necessary environment variables.
        // DATABASE_URL is loaded by dotenv in the main process.
        DATABASE_URL: process.env.DATABASE_URL,
        PORT: BACKEND_PORT, // Ensure backend starts on the correct port
        // Add any other specific environment variables your backend needs
        // e.g., API_KEY: process.env.API_KEY,
    };

    // Ensure DATABASE_URL is present before spawning
    if (!backendEnv.DATABASE_URL) {
        const errorMsg = "ERROR: DATABASE_URL is not set. Cannot start backend.";
        logMessage(errorMsg, 'ERROR');
        if (loadingWindow && !loadingWindow.isDestroyed()) {
            loadingWindow.webContents.send("loading-error", errorMsg);
        }
        app.quit();
        return;
    }
    logMessage(`DATABASE_URL is set (value hidden for security).`);

    backendProcess = spawn(backendPath, [], {
        stdio: "pipe", // Keep stdio as pipe to capture output
        env: backendEnv, // <-- Pass the environment variables
    });

    backendProcess.stdout.on("data", (data) => {
        const message = data.toString().trim();
        logMessage(`Backend stdout: ${message}`);
        if (loadingWindow && !loadingWindow.isDestroyed()) {
            loadingWindow.webContents.send("loading-message", `Backend: ${message}`);
        } else if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
            mainWindow.webContents.send("backend-message", message);
        }
    });

    backendProcess.stderr.on("data", (data) => {
        const errorMessage = data.toString().trim();
        logMessage(`Backend stderr: ${errorMessage}`, 'ERROR');
        if (loadingWindow && !loadingWindow.isDestroyed()) {
            loadingWindow.webContents.send("loading-error", `Backend ERROR: ${errorMessage}`);
        } else if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
            mainWindow.webContents.send("backend-error", errorMessage);
        }
    });

    backendProcess.on("close", (code) => {
        logMessage(`Backend process exited with code ${code}`);
        backendProcess = null;
        if (loadingWindow && !loadingWindow.isDestroyed()) {
            loadingWindow.webContents.send("loading-error", `Backend exited unexpectedly with code: ${code}`);
        } else if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
            mainWindow.webContents.send("backend-status", `Backend exited with code: ${code}`);
        }
        if (code !== 0) {
            logMessage("Backend process exited with an error!", 'ERROR');
        }
    });

    backendProcess.on("error", (err) => {
        logMessage(`Failed to start backend process: ${err.message}`, 'ERROR');
        backendProcess = null;
        if (loadingWindow && !loadingWindow.isDestroyed()) {
            loadingWindow.webContents.send("loading-error", `Failed to start backend: ${err.message}`);
        } else if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
            mainWindow.webContents.send("backend-status", `Failed to start backend: ${err.message}`);
        }
    });

    logMessage(`Waiting for backend to be ready on tcp:127.0.0.1:${BACKEND_PORT}`);
    waitOn({resources: [`tcp:127.0.0.1:${BACKEND_PORT}`], timeout: 60000})
        .then(() => {
            logMessage(`Backend is ready on port ${BACKEND_PORT}. Proceeding to create main window...`);
            createMainWindow();
        })
        .catch((err) => {
            logMessage(`Error waiting for backend to become ready: ${err.message}`, 'ERROR');
            const errorMsg = `Backend did not become ready within timeout. Please check backend logs or console. Error: ${err.message}`;
            if (loadingWindow && !loadingWindow.isDestroyed()) {
                loadingWindow.webContents.send("loading-error", errorMsg);
            }
            logMessage("Quitting application due to backend not becoming ready.", 'ERROR');
            app.quit();
        });
}

// Electron app lifecycle events
app.whenReady().then(() => {
    setupLogger();
    logMessage("App is ready. Registering custom protocol handler.");

    // --- IMPORTANT: Load .env file here ---
    // This will load the .env file copied to the app root by electron-builder.
    const result = dotenv.config({ path: path.join(app.getAppPath(), '.env') });
    if (result.error) {
        logMessage(`ERROR: Failed to load .env file: ${result.error.message}`, 'ERROR');
    } else {
        logMessage(`.env file loaded successfully. Keys loaded: ${Object.keys(result.parsed || {}).join(', ')}`);
    }
    // --- End .env loading ---

    protocol.handle('app', (request) => {
        let requestedUrl = request.url;
        let filePathname = requestedUrl.substring('app://./'.length);
        filePathname = filePathname.replace(/\\/g, '/');

        logMessage(`--- Protocol Handler Request ---`);
        logMessage(`Requested URL: ${requestedUrl}`);
        logMessage(`Cleaned Pathname: ${filePathname}`);

        let basePath;
        if (app.isPackaged) {
            basePath = path.join(app.getAppPath(), 'frontend', 'out');
        } else {
            basePath = path.join(__dirname, '..', 'frontend', 'out');
        }
        logMessage(`Base Path (derived): ${basePath}`);

        let resolvedPath = path.join(basePath, filePathname);

        let isDirectory;
        try {
            isDirectory = fs.existsSync(resolvedPath) && fs.lstatSync(resolvedPath).isDirectory();
        } catch (e) {
            logMessage(`Error checking if path is a directory for ${resolvedPath}: ${e.message}`, 'ERROR');
            isDirectory = false;
        }

        if (isDirectory) {
            resolvedPath = path.join(resolvedPath, 'index.html');
            logMessage(`Resolved as directory, trying index.html: ${resolvedPath}`);
        }

        logMessage(`Final File Path Candidate: ${resolvedPath}`);

        if (!fs.existsSync(resolvedPath)) {
            const notFoundMsg = `!!!! ERROR: File DOES NOT EXIST for app:// asset: ${request.url} -> Target: ${resolvedPath}`;
            logMessage(notFoundMsg, 'ERROR');
            return new Response('404 Not Found (Electron Handler)', {
                status: 404,
                headers: {'Content-Type': 'text/plain'}
            });
        }

        const fileStream = fs.createReadStream(resolvedPath);
        fileStream.on('error', (err) => {
            logMessage(`Error reading file stream for ${resolvedPath}: ${err.message}`, 'ERROR');
        });

        const ext = path.extname(resolvedPath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.html') contentType = 'text/html';
        else if (ext === '.css') contentType = 'text/css';
        else if (ext === '.js') contentType = 'application/javascript';
        else if (ext === '.json') contentType = 'application/json';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.svg') contentType = 'image/svg+xml';
        else if (ext === '.ico') contentType = 'image/x-icon';
        else if (ext === '.woff' || ext === '.woff2') contentType = 'font/woff';
        else if (ext === '.ttf') contentType = 'font/ttf';
        else if (ext === '.otf') contentType = 'font/otf';
        else if (ext === '.map') contentType = 'application/json';

        logMessage(`Serving file '${resolvedPath}' as: ${contentType}`);
        return new Response(fileStream, {headers: {'Content-Type': contentType}});
    });

    createLoadingWindow();
    logMessage(`Starting backend and frontend after ${UI_LOADING_DELAY_MS}ms delay to show loading screen.`);
    setTimeout(() => {
        startBackendAndLoadFrontend();
    }, UI_LOADING_DELAY_MS);
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        logMessage("App activated, no windows open. Recreating loading window and restarting backend process.");
        createLoadingWindow();
        setTimeout(() => {
            startBackendAndLoadFrontend();
        }, UI_LOADING_DELAY_MS);
    } else {
        logMessage("App activated, but windows are already open.");
    }
});

app.on("window-all-closed", () => {
    logMessage("All windows closed. Checking if backend needs termination.");
    if (backendProcess) {
        logMessage("Terminating backend process due to all windows closed...");
        backendProcess.kill();
        backendProcess = null;
        logMessage("Backend process terminated.");
    }
    if (process.platform !== "darwin") {
        logMessage("Quitting application (not macOS).");
        app.quit();
    }
});

app.on("before-quit", (event) => {
    logMessage("Application is about to quit. Ensuring backend process is killed.");
    if (backendProcess) {
        logMessage("Backend process still running during before-quit, attempting to kill forcefully.");
        backendProcess.kill();
        backendProcess = null;
    }
});

app.on("quit", (event, exitCode) => {
    logMessage(`Application quit with exit code: ${exitCode}`);
    logMessage("--- Application Ended ---");
});

ipcMain.handle('get-backend-address', async (event) => {
    logMessage(`IPC Main: Frontend requested backend address. Returning http://localhost:${BACKEND_PORT}`);
    return `http://localhost:${BACKEND_PORT}`;
});

ipcMain.handle('get-log-file-path', async () => {
    logMessage(`IPC Main: Frontend requested log file path. Returning ${logFilePath}`);
    return logFilePath;
});