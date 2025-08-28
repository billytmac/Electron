注意点：
1. 安装electron失败
- 用cnpm源下载electron不容易失败
- 需在.npmrc指定ELECTRON_MIRROR
- 用pnpm启动会报错，要用npm
2.  Electron exposes app.whenReady() as a helper specifically for the ready event to avoid subtle pitfalls with directly listening to that event in particular. See electron/electron#21972 for details.
Quit the app when all windows are closed (Windows & Linux)
Open a window if none are open (macOS)
3. If you are on a Windows machine, please do not use Windows Subsystem for Linux (WSL)


.gitignore
GitHub's Node.js gitignore template 