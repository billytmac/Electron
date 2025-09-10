const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'billy',
        description: 'test electron',
        // 确保生成正确的 Squirrel 文件
        name: 'electron',
        setupExe: 'electron-setup.exe',
        setupMsi: 'electron-setup.msi'
      },
    },
    // 暂时禁用 ZIP maker，因为 Squirrel 不支持 .zip 文件更新
    // {
    //   name: '@electron-forge/maker-zip',
    //   platforms: ['win32'],
    //   config: {
    //     authors: 'billy',
    //     description: 'test electron',
    //   },
    // },
    // {
    //   name: '@electron-forge/maker-deb',
    //   config: {},
    // },
    // {
    //   name: '@electron-forge/maker-rpm',
    //   config: {},
    // },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'billytmac',
          name: 'Electron'
        },
        prerelease: false,
        draft: false,
        // 需先设置export GITHUB_TOKEN=""
        authToken: process.env.GITHUB_TOKEN
      },
    }
  ]
};
