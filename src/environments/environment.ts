declare const require: any;

export const environment = {
  production: false,
  envName: 'dev',
  version: require('../../package.json').version,
  zyrkHost: '127.0.0.1',
  releasesUrl: 'https://api.github.com/repos/ZyrkProject/zyrk-gui/releases/latest',
  zyrk_MainNet_Port :19656,
  zyrkPort: 19656,
  rpcUserName :'test',
  rpcPassword :'12345678',
};
