const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'TuneTastic Premium',
    icon: path.join(__dirname, 'dist', 'logo.png'),
    autoHideMenuBar: true, // Hides the default Windows menu bar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the compiled React app
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
