
### 项目介绍
  使用Electron Forge分发打包工具搭建一个简易项目，可实现用update-electron-app简单更新

### 问题解决：
  - pnpm publish时遇到“Error: Failed to locate module "debug" from "/Users/.../electron-forge-template/node_modules/electron-squirrel-startup"
      .npmrc文件里添加以下代码
      ```
        node-linker=hoisted
        public-hoist-pattern=*
      ```
    相关issues：https://github.com/electron/forge/issues/2633#issuecomment-1174790013
  - 本地打包控制台有乱码问题
      需在package.json里加上 chcp 65001，如：
      ```
        "start": "chcp 65001 && electron-forge start",
      ```
  - 安装完@electron-forge/maker-squirrel，在执行pnpm publish会出现报错问题
      需手动安装下electron-winstaller

  - 使用update-electron-app无法监听到更新
      - 开发环境下无法监听，需在打包后的环境（否则会报“Can not find Squirrel”）
      - maker需为Squirrel.Windows格式，并禁用ZIP格式，因为Squirrel格式里不支持zip格式的更新（否则会报"Invalid release entry"）
      - update-electron-app依赖于app.isPackaged，但官方app.isPackaged判断不准确，需自己写一个判断是否为打包环境，可看下main.js的realProduction
      
### 知识点记录
  - tag与release分支的区别
    https://babyking.github.io/wiki/%E5%8D%9A%E5%AE%A2%E5%A4%87%E4%BB%BD/2019-12-25-git-zhong-tag-yu-release-de-chuang-jian-yi-ji-liang-zhe-de-qu-bie/
  - 什么是release分支
    https://wenxinhe.gitbooks.io/knowledge-base/content/how-to-release.html#what-is-release-branch