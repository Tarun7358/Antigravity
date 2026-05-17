const { app, BrowserWindow, shell, ipcMain, Menu, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { autoUpdater } = require('electron-updater');

// Register 'app' as a privileged scheme to fully support fetch, CORS, and ES modules
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      allowServiceWorkers: true,
    },
  },
]);

// Configure autoUpdater
autoUpdater.logger = console;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow;
let updateChannel = 'latest'; // Stable channel by default

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Anti Gravity OS',
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // Determine whether running in development mode (Vite dev server) or production (packaged files)
  const isDev = Boolean(process.env.ELECTRON_START_URL);
  const startUrl = process.env.ELECTRON_START_URL || 'app://frontend-dist/index.html';
  
  console.log(`[Anti Gravity OS] Loading URL: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    // Check for updates automatically on startup in production
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify().catch(err => console.error('[AutoUpdater]', err));
    }
  });

  // Intercept external links and open them in the user's default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
      // If it's an external link (not localhost dev server or local file), open externally
      if (!url.includes('localhost:5173') && !url.includes('localhost:5000')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
    }
    return { action: 'allow' };
  });

  // Handle navigation to external links within the same window
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (!url.includes('localhost:5173') && !url.includes('localhost:5000')) {
        event.preventDefault();
        shell.openExternal(url);
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createApplicationMenu();
}

function createApplicationMenu() {
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/Tarun7358/Antigravity');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers for desktop integration
ipcMain.on('app-get-version', (event) => {
  event.returnValue = app.getVersion();
});

ipcMain.on('app-get-platform', (event) => {
  event.returnValue = process.platform;
});

// IPC Handlers for Auto Updater & Channel Switching
ipcMain.on('update-check', () => {
  const isDev = Boolean(process.env.ELECTRON_START_URL);
  if (isDev) {
    console.log('[AutoUpdater] Simulating update check in dev mode...');
    mainWindow?.webContents.send('update-checking');
    setTimeout(() => {
      mainWindow?.webContents.send('update-available', {
        version: '2.1.0',
        releaseNotes: '• Improved Developer Hub modules\n• AI optimization upgrades\n• Enhanced voice performance\n• New collaborative coding features',
        releaseDate: new Date().toISOString()
      });
      
      // Simulate download progress
      let prog = 0;
      const interval = setInterval(() => {
        prog += 15;
        if (prog > 100) prog = 100;
        mainWindow?.webContents.send('update-download-progress', { 
          percent: prog, 
          bytesPerSecond: 1258291, 
          total: 62914560, 
          transferred: (prog / 100) * 62914560 
        });
        if (prog >= 100) {
          clearInterval(interval);
          mainWindow?.webContents.send('update-downloaded', { version: '2.1.0' });
        }
      }, 400);
    }, 1500);
    return;
  }
  autoUpdater.checkForUpdates().catch(err => {
    mainWindow?.webContents.send('update-error', err.message);
  });
});

ipcMain.on('update-channel-switch', (event, channel) => {
  // channel can be 'latest' (Stable), 'beta', 'alpha' (Dev Preview)
  autoUpdater.channel = channel;
  updateChannel = channel;
  event.returnValue = channel;
  console.log(`[AutoUpdater] Switched release channel to: ${channel}`);
  
  const isDev = Boolean(process.env.ELECTRON_START_URL);
  if (!isDev) {
    autoUpdater.checkForUpdates().catch(err => console.error(err));
  }
});

ipcMain.on('update-install', () => {
  const isDev = Boolean(process.env.ELECTRON_START_URL);
  if (isDev) {
    console.log('[AutoUpdater] Simulated quitAndInstall triggered. Restarting app...');
    return;
  }
  autoUpdater.quitAndInstall(true, true);
});

// autoUpdater event listeners
autoUpdater.on('checking-for-update', () => {
  mainWindow?.webContents.send('update-checking');
});

autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
  mainWindow?.webContents.send('update-not-available', info);
});

autoUpdater.on('error', (err) => {
  mainWindow?.webContents.send('update-error', err.message);
});

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow?.webContents.send('update-download-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow?.webContents.send('update-downloaded', info);
});

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const filePath = request.url.slice('app://'.length);
    const decodedPath = decodeURIComponent(filePath);
    const absolutePath = path.join(__dirname, decodedPath);
    return net.fetch(url.pathToFileURL(absolutePath).toString());
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
