// const { app, BrowserWindow } = require('electron')
const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')
const { updateElectronApp } = require('update-electron-app')
const log = require('electron-log')
// 添加 IPC 处理程序用于手动测试
const { ipcMain, autoUpdater } = require('electron')

log.info('应用启动')

// 检测是否为真正的生产环境（专门处理 quitAndInstall 重启情况）
const isRealProduction = () => {
  const fs = require('fs')
  const path = require('path')
  
  // 方法1: 检查应用路径特征
  const isInAppData = __dirname.includes('AppData')
  const hasAsar = __dirname.includes('app.asar')
  const isInProgramFiles = __dirname.includes('Program Files')
  
  // 方法2: 检查可执行文件路径
  const execPath = process.execPath
  const isExecutableInAppData = execPath.includes('AppData')
  const isExecutableInProgramFiles = execPath.includes('Program Files')
  
  // 方法3: 检查 Squirrel 相关环境（可能在重启后丢失）
  const hasSquirrelExecutable = !!process.env.SQUIRREL_EXECUTABLE
  const hasSquirrelArgs = process.argv.some(arg => arg.startsWith('--squirrel'))
  
  // 方法4: 检查典型生产环境文件结构
  let hasAsarFile = false
  let hasSquirrelStructure = false
  let hasSavedProductionFlag = false
  try {
    // 检查 app.asar 文件
    const asarPath = path.join(__dirname, 'app.asar')
    const resourcesAsarPath = path.join(__dirname, '..', 'app.asar')
    hasAsarFile = fs.existsSync(asarPath) || fs.existsSync(resourcesAsarPath)
    
    // 检查 Squirrel 目录结构
    const possibleSquirrelPaths = [
      path.join(execPath, '..', 'Update.exe'),           // Squirrel 更新器
      path.join(execPath, '..', '..', 'Update.exe'),     // 可能在上级目录
      path.join(__dirname, '..', '..', 'Update.exe'),    // 相对于 resources
    ]
    hasSquirrelStructure = possibleSquirrelPaths.some(p => fs.existsSync(p))
    
    // 🎯 检查更新重启前保存的生产环境标记
    const flagFile = path.join(__dirname, '.production-env')
    if (fs.existsSync(flagFile)) {
      const flagContent = fs.readFileSync(flagFile, 'utf8')
      const flagData = JSON.parse(flagContent)
      // 检查标记是否有效（24小时内）
      const isRecentFlag = (Date.now() - flagData.timestamp) < (24 * 60 * 60 * 1000)
      hasSavedProductionFlag = flagData.isProduction && isRecentFlag
      log.info('🏷️ 发现生产环境标记:', {
        isProduction: flagData.isProduction,
        isRecent: isRecentFlag,
        version: flagData.version,
        reason: flagData.reason
      })
    }
  } catch (error) {
    // 忽略文件系统错误
    log.debug('文件系统检查出错:', error.message)
  }
  
  // 方法5: 检查是否为打包应用的关键指标
  const isPackagedApp = hasAsar || hasAsarFile
  const isInSystemDirectory = isInAppData || isInProgramFiles || isExecutableInAppData || isExecutableInProgramFiles
  
  // 🎯 优化后的判断逻辑：适应 quitAndInstall 重启场景
  const productionConditions = [
    // 核心条件：打包应用且在系统目录
    isPackagedApp && isInSystemDirectory,
    
    // Squirrel 环境存在（首次安装或正常启动）
    hasSquirrelExecutable || hasSquirrelArgs,
    
    // 检测到 Squirrel 目录结构（即使环境变量丢失）
    hasSquirrelStructure && isInSystemDirectory,
    
    // 强制条件：在 AppData 且有 asar 文件（最可靠的生产环境标志）
    isInAppData && (hasAsar || hasAsarFile),
    
    // 🎯 新增：检查更新重启前保存的生产环境标记
    hasSavedProductionFlag && isInSystemDirectory,
  ]
  
  const isProduction = productionConditions.some(condition => condition)
  
  // 详细记录判断依据
  log.info('🔍 生产环境检测详情:')
  log.info('  - 打包应用 (hasAsar/hasAsarFile):', isPackagedApp)
  log.info('  - 系统目录 (AppData/ProgramFiles):', isInSystemDirectory)
  log.info('  - Squirrel环境 (env/args):', hasSquirrelExecutable || hasSquirrelArgs)
  log.info('  - Squirrel结构 (Update.exe):', hasSquirrelStructure)
  log.info('  - 保存的生产环境标记:', hasSavedProductionFlag)
  log.info('  - 最终判断结果:', isProduction)
  
  // 记录触发的具体条件
  const triggeredConditions = productionConditions.map((condition, index) => {
    const conditionNames = [
      '打包应用且在系统目录',
      'Squirrel环境存在',
      'Squirrel结构且在系统目录',
      'AppData且有asar文件',
      '保存的生产环境标记且在系统目录'
    ]
    return condition ? conditionNames[index] : null
  }).filter(Boolean)
  
  if (triggeredConditions.length > 0) {
    log.info('✅ 触发的生产环境条件:', triggeredConditions.join(', '))
  } else {
    log.info('❌ 未满足任何生产环境条件')
  }
  
  return isProduction
}

const realProduction = isRealProduction()

// 详细的环境检测调试信息
log.info('🔍 详细环境检测信息:')
log.info('  - __dirname:', __dirname)
log.info('  - process.execPath:', process.execPath)
log.info('  - process.argv:', process.argv)
log.info('  - process.env.SQUIRREL_EXECUTABLE:', process.env.SQUIRREL_EXECUTABLE)
log.info('  - 路径包含 AppData:', __dirname.includes('AppData'))
log.info('  - 路径包含 app.asar:', __dirname.includes('app.asar'))
log.info('  - 路径包含 Program Files:', __dirname.includes('Program Files'))
log.info('  - 可执行文件在 AppData:', process.execPath.includes('AppData'))
log.info('  - 可执行文件在 Program Files:', process.execPath.includes('Program Files'))

log.info('🔍 环境检测结果:')
log.info('  - 真正的生产环境:', realProduction)
log.info('  - 原始 app.isPackaged:', app.isPackaged)

// 🎭 只有在需要时才强制设置 app.isPackaged
if (!realProduction) {
  // 在开发环境中，我们可能想要模拟打包环境但不启用更新
  log.info('🎭 在开发环境中，保持原始 app.isPackaged 值')
} else {
  // 在真正的生产环境中，确保 app.isPackaged 为 true
  if (!app.isPackaged) {
    Object.defineProperty(app, 'isPackaged', {
      value: true,
      writable: false,
      configurable: false
    })
    log.info('🎭 已在生产环境中强制设置 app.isPackaged 为:', app.isPackaged)
  }
}

// 只在真正的生产环境中启用自动更新
if (realProduction) {
  log.info('🚀 启用自动更新（检测到 Squirrel 环境）')
  try {
    // 使用标准的 update-electron-app 配置
    updateElectronApp({
      updateInterval: '5 minutes',
      logger: log,
      repo: 'billytmac/Electron',
      notifyUser: true
    })
    
    log.info('✅ update-electron-app 配置成功')
  } catch (updateError) {
    log.error('❌ 启用自动更新失败:', updateError.message)
    log.info('💡 尝试手动设置 autoUpdater...')
    
    // 方案B：手动设置 autoUpdater（备选方案）
    try {
      const server = 'https://update.electronjs.org'
      const feed = `${server}/billytmac/Electron/${process.platform}/${process.arch}/${app.getVersion()}`
      
      autoUpdater.setFeedURL({
        url: feed,
        headers: {
          'User-Agent': 'Electron'
        }
      })
      
      log.info('✅ 手动设置更新 URL 成功:', feed)
    } catch (manualError) {
      log.error('❌ 手动设置更新 URL 也失败:', manualError.message)
    }
  }
} else {
  log.info('⏸️ 跳过自动更新（开发环境或无 Squirrel 支持）')
}

log.info('🔧 应用信息:')
log.info('  - 平台:', process.platform)
log.info('  - 架构:', process.arch)
log.info('  - 当前版本:', app.getVersion())

// 添加获取日志路径的 IPC 处理程序
ipcMain.handle('get-log-path', async () => {
  try {
    const logPath = log.transports.file.getFile().path
    log.info('获取日志路径成功:', logPath)
    return logPath
  } catch (error) {
    log.error('获取日志路径失败:', error)
    return '获取日志路径失败: ' + error.message
  }
})

// 添加 IPC 处理程序用于手动测试
ipcMain.handle('test-update-check', async () => {
  try {
    log.info('Manual update check triggered...')
    
    // 检查是否在支持更新的环境中
    if (!realProduction) {
      const message = '当前在开发环境中，无法使用 Squirrel 更新。请在打包后的应用中测试更新功能。'
      log.info(message)
      return { success: false, message }
    }
    
    // 在生产环境中尝试检查更新
    await autoUpdater.checkForUpdates()
    return { success: true, message: 'Update check triggered in production environment' }
  } catch (error) {
    log.error('Manual update check failed:', error)
    
    // 提供更详细的错误信息
    let errorMessage = error.message
    if (error.message.includes('Can not find Squirrel')) {
      errorMessage = '无法找到 Squirrel 更新框架。请确保应用是通过 Squirrel 安装的。'
    }
    
    return { success: false, message: errorMessage }
  }
})

// 监听更新事件
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for updates...')
  log.info('🔍 正在检查更新...')
})

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info)
  log.info('✅ 发现新版本:', info)
  // 通知渲染进程
  const win = BrowserWindow.getAllWindows()[0]
  if (win) {
    win.webContents.send('update-available', info)
  }
})

autoUpdater.on('update-not-available', (info) => {
  log.info('No update available:', info)
  log.info('ℹ️ 当前已是最新版本:', info)
  // 通知渲染进程
  const win = BrowserWindow.getAllWindows()[0]
  if (win) {
    win.webContents.send('update-not-available', info)
  }
})

autoUpdater.on('error', (err) => {
  log.error('Update check error:', err)
  console.error('❌ 更新检查出错:', err)
  // 通知渲染进程
  const win = BrowserWindow.getAllWindows()[0]
  if (win) {
    win.webContents.send('update-error', err.message)
  }
})

autoUpdater.on('download-progress', (progressObj) => {
  log.info('Download progress:', progressObj)
  log.info('📥 下载进度:', Math.round(progressObj.percent) + '%')
  // 通知渲染进程
  const win = BrowserWindow.getAllWindows()[0]
  if (win) {
    win.webContents.send('download-progress', progressObj)
  }
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info)
  log.info('✅ 更新下载完成:', info)
  
  // 🎯 重要：在更新重启前保存生产环境标记
  const fs = require('fs')
  const path = require('path')
  try {
    const flagFile = path.join(__dirname, '.production-env')
    fs.writeFileSync(flagFile, JSON.stringify({
      isProduction: true,
      timestamp: Date.now(),
      version: app.getVersion(),
      reason: 'pre-update-restart'
    }))
    log.info('✅ 已保存生产环境标记，准备更新重启')
  } catch (error) {
    log.error('❌ 保存生产环境标记失败:', error.message)
  }
  
  // 通知渲染进程
  const win = BrowserWindow.getAllWindows()[0]
  if (win) {
    win.webContents.send('update-downloaded', info)
  }
})

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