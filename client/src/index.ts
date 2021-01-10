import { app, BrowserWindow, ipcMain } from 'electron';
import * as WebSocketManager from './websocket';
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

ipcMain.on('loginWebSocket', (event, { userName, accessToken }) => {
  WebSocketManager.login(userName, accessToken);

  const connection = WebSocketManager.getConnection();
  connection.on('open', () => {
    event.sender.send('loginWebSocketSuccess');
  });

  connection.on('error', () => {
    event.sender.send('loginWebSocketFailed');
  });

  connection.on('message', (data) => {
    event.sender.send('onMessage', data);
  })

  connection.on('close', () => {
    event.sender.send('connectionDisconnected');
  });
});

ipcMain.on('sendMessage', (event, { fromUser, toUser, payload }) => {
  WebSocketManager.sendMessage(fromUser, toUser, payload);
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  let mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on('close', () => {
    WebSocketManager.closeConnection();
    mainWindow = null;

    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
