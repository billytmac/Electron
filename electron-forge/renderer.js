// 类型声明
if (typeof window.versions === 'undefined') {
  window.versions = {
    node: () => 'unknown',
    chrome: () => 'unknown', 
    electron: () => 'unknown'
  }
}

if (typeof window.electronAPI === 'undefined') {
  window.electronAPI = {
    testUpdateCheck: () => Promise.resolve({ success: false, message: 'API not available' }),
    getLogPath: () => Promise.resolve('API not available'),
    onUpdateAvailable: () => {},
    onUpdateNotAvailable: () => {},
    onUpdateError: () => {},
    onDownloadProgress: () => {},
    onUpdateDownloaded: () => {},
    removeAllListeners: () => {}
  }
}

const information = document.getElementById('info')
if (information) {
  information.innerText = `This app is using Chrome (v${window.versions.chrome()}), Node.js (v${window.versions.node()}), and Electron (v${window.versions.electron()})`
}

// 添加状态显示元素
const statusDiv = document.createElement('div')
statusDiv.id = 'update-status'
statusDiv.style.marginTop = '20px'
statusDiv.style.padding = '10px'
statusDiv.style.border = '1px solid #ccc'
statusDiv.style.borderRadius = '5px'
statusDiv.innerHTML = '<h3>更新状态</h3><p>等待检查更新...</p>'
document.body.appendChild(statusDiv)

async function testUpdateCheck() {
  try {
    const result = await window.electronAPI.testUpdateCheck()
    console.log(result)
    updateStatus('手动检查更新: ' + (result.success ? '成功' : '失败 - ' + result.message))
  } catch (error) {
    console.error('测试失败:', error)
    updateStatus('手动检查更新失败: ' + error.message)
  }
}

function updateStatus(message) {
  const statusDiv = document.getElementById('update-status')
  if (statusDiv) {
    const statusP = statusDiv.querySelector('p')
    if (statusP) {
      statusP.textContent = message
    }
  }
  console.log('更新状态:', message)
}

// 添加按钮事件监听器
document.addEventListener('DOMContentLoaded', () => {
  const testBtn = document.getElementById('test-update-btn')
  if (testBtn) {
    testBtn.addEventListener('click', testUpdateCheck)
  }
  
  const logBtn = document.getElementById('show-log-btn')
  if (logBtn) {
    logBtn.addEventListener('click', showLogPath)
  }
})

// 显示日志文件路径
async function showLogPath() {
  try {
    const logPath = await window.electronAPI.getLogPath()
    updateStatus(`日志文件路径: ${logPath}`)
    console.log('📁 日志文件路径:', logPath)
    
    // 复制到剪贴板（如果支持）
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(logPath)
      updateStatus(`日志路径已复制到剪贴板: ${logPath}`)
    }
  } catch (error) {
    console.error('获取日志路径失败:', error)
    updateStatus('获取日志路径失败: ' + error.message)
  }
}

// 监听更新事件
window.electronAPI.onUpdateAvailable((event, info) => {
  updateStatus(`发现新版本: ${info.version}`)
})

window.electronAPI.onUpdateNotAvailable((event, info) => {
  updateStatus('当前已是最新版本')
})

window.electronAPI.onUpdateError((event, error) => {
  updateStatus(`更新检查出错: ${error}`)
})

window.electronAPI.onDownloadProgress((event, progressObj) => {
  updateStatus(`下载进度: ${Math.round(progressObj.percent)}%`)
})

window.electronAPI.onUpdateDownloaded((event, info) => {
  updateStatus('更新已下载完成，重启应用后将应用更新')
})