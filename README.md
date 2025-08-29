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

发布：
1. release分支
2. https://babyking.github.io/wiki/%E5%8D%9A%E5%AE%A2%E5%A4%87%E4%BB%BD/2019-12-25-git-zhong-tag-yu-release-de-chuang-jian-yi-ji-liang-zhe-de-qu-bie/
3. https://wenxinhe.gitbooks.io/knowledge-base/content/how-to-release.html#what-is-release-branch