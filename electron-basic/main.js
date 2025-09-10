// const { app, BrowserWindow } = require('electron')
const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')
const createWindow = () => {
// BrowserWindows can only be created after the app module's ready event is fired
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}
// On Windows and Linux, closing all windows will generally quit an application entirely. To implement this pattern in your Electron app, listen for the app module's window-all-closed event, and call app.quit() to exit your app if the user is not on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
// macOS apps generally continue running even without any windows open
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
// Electron exposes app.whenReady() as a helper specifically for the ready event to avoid subtle pitfalls with directly listening to that event in particular. 
// Checking against Node's process.platform variable can help you to run code conditionally on certain platforms. Note that there are only three possible platforms that Electron can run in: win32 (Windows), linux (Linux), and darwin (macOS).


// To bridge Electron's different process types together, we will need to use a special script called a preload.

// A BrowserWindow's preload script runs in a context that has access to both the HTML DOM and a limited subset of Node.js and Electron APIs.