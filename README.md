### 知识点记录：
  - Electron exposes app.whenReady() as a helper specifically for the ready event to avoid subtle pitfalls with directly listening to that event in particular. See electron/electron#21972 for details.
  - Quit the app when all windows are closed (Windows & Linux)
  - Open a window if none are open (macOS)
  - If you are on a Windows machine, please do not use Windows Subsystem for Linux (WSL)
  - .gitignore GitHub's Node.js gitignore template
  
### 遇到问题：
1. 安装 electron 依赖包失败问题：
  - 创建.npmrc文件并写入ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" (推荐)
  - 用 cnpm 源下载  

2. 用 npm 启动成功，用 pnpm 启动会报错问题：
  以下操作都在 A 路径下操作：node_modules/.pnpm/electron@37.4.0/node_modules/electron
    - 自动安装：node install.js
    - 如自动安装失败，可尝试手动安装：
      - 可在https://github.com/electron/electron/releases/tag/v37.4.0 下选择对应 electron-xxxx-xxx.zip 格式版本进行下载，如 electron-v37.4.0-win32-arm64.zip，将下载的 zip 文件放在 A 路径下
      - 进入 A 路径下的 install.js 代码里，添加 extractFile('./electron-v37.4.0-win32-x64.zip')该代码，并注释掉 downloads if not cached下的一部分代码
        ```
          extractFile('./electron-v37.4.0-win32-x64.zip')
            // downloads if not cached
            // downloadArtifact({
            // version,
            // artifactName: 'electron',
            // force: process.env.force_no_cache === 'true',
            // cacheRoot: process.env.electron_config_cache,
            // checksums: process.env.electron_use_remote_checksums ?? process.env.npm_config_electron_use_remote_checksums ? undefined : require('./checksums.json'),
            // platform,
            // arch
            // }).then(extractFile).catch(err => {
            // console.error(err.stack);
            // process.exit(1);
            // });
          ```
