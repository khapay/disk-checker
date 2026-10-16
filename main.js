const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 340,              // 👈 470 -> 340으로 대폭 축소!
    height: 68,              // 👈 높이도 68로 불필요한 위아래 여백 제거
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

// 닫기(X) 버튼 IPC 핸들러
ipcMain.on('close-app', () => {
  app.quit();
});

function formatBytes(bytes) {
  if (bytes === 0) return '0 GB';
  const gb = bytes / (1024 ** 3);
  if (gb >= 1000) {
    return (gb / 1024).toFixed(1) + ' TB';
  }
  return gb.toFixed(1) + ' GB';
}

function getDiskFromPowerShell() {
  return new Promise((resolve, reject) => {
    const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_LogicalDisk -Filter \\"DeviceID='C:'\\" | Select-Object Size,FreeSpace | ConvertTo-Json"`;
    exec(cmd, (err, stdout) => {
      if (err) return reject(err);
      try {
        const data = JSON.parse(stdout);
        const total = Number(data.Size);
        const free = Number(data.FreeSpace);
        const used = total - free;
        resolve({ total, free, used });
      } catch (e) {
        reject(e);
      }
    });
  });
}

ipcMain.handle('get-c-drive-space', async () => {
  try {
    let total = 0, free = 0, used = 0;
    try {
      const stats = await fs.statfs('C:\\');
      total = stats.bsize * stats.blocks;
      free = stats.bsize * stats.bfree;
      used = total - free;
    } catch {
      const psResult = await getDiskFromPowerShell();
      total = psResult.total;
      free = psResult.free;
      used = psResult.used;
    }

    return {
      success: true,
      totalFormatted: formatBytes(total),
      usedFormatted: formatBytes(used),
      freeFormatted: formatBytes(free)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});