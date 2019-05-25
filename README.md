<p align="center">
    <img src="https://github.com/ZyrkProject/zyrk-gui/blob/master/images/header.png">
</p>

<a href="https://discord.gg/QHRk9NF"><img src="https://discordapp.com/api/guilds/569285452213911552/embed.png" alt="Discord Server" /></a> <a href="https://twitter.com/intent/follow?screen_name=ProjectZyrk"><img src="https://img.shields.io/twitter/follow/ProjectZyrk.svg?style=social&logo=twitter" alt="Follow on Twitter"></a> [![HitCount](http://hits.dwyl.io/zyrkproject/zyrk-gui.svg)](http://hits.dwyl.io/zyrkproject/zyrk-gui)

# Zyrk GUI+
***

## Development

### Boostrapping:

* Download + Install [Node.js](https://nodejs.org/) 6.4—7.10
* Download + Install [git](https://git-scm.com/)
* Download + Install [yarn](https://yarnpkg.com/)

```bash
git clone https://github.com/zyrkproject/zyrk-gui
cd zyrk-gui
yarn global add windows-build-tools
yarn install
```

### Start Electron

* `yarn run start:electron`

### Package Electron

* `yarn run package:win` – Windows
* `yarn run package:mac` – OSX
* `yarn run package:linux` – Linux

