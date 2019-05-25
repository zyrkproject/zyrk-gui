declare const require: any;

export const environment = {
  production: true,
  version: require('../../package.json').version,
  envName: 'prod',
  zyrkHost: 'zyrk.io',
  releasesUrl: 'https://api.github.com/repos/zyrkproject/zyrk-gui/releases/latest',
  zyrk_MainNet_Port :19656,
  zyrkPort: 19656,
  rpcUserName :'test',
  rpcPassword :'test',
};
