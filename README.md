# instparser

#### Install: npm i

------------

# CONFIG

- **outputPath** - This path will be created and each downloaded profile will be in own folder, like ./out/tab_mk `(default: './out/')`
- **logger.enabled** - You can turn off/on debug `(default: true)`
- **logger.noColors** - Turn off colors for debug `(default: false)`
- **logger.data** - Some data for debug. You can change it whatever you like
- **pageLimit** - Defines how many pages will be requested. Can be also string 'ALL' to fetch all content. `(default: 1)`
- **postsLimit** -  Defines how many content will be requested per page. Max. - 20, less = more requests, that's why bigger values are recommended `(default: 20)`
- **saveData** - Option for saving main info about user to the file *data.json*  `(default: false)`
- **photoQuality** - You can choose quality which you want to download: *src, low, high*. If you need best - set 'src', because high is compressed. `(default: 'src')`
- **cookie** - You instagram sessionid cookie. Sign in and than take it in your browser settings ([chrome://settings/cookies/detail?site=instagram.com](chrome://settings/cookies/detail?site=instagram.com "chrome://settings/cookies/detail?site=instagram.com") for google chrome)
# START
Simple run command `node index nickname` and it will download content with params in config. You can also pass params through command line as below.
### Arguments:
- nickname - instagram user nickname (only this argument is required)
- posts limit - postsLimit, number 1-20 (look above)
- pages limit - number or 'ALL'
- save data - boolean (true/false)
- debug - boolean
- nocolor - boolean

##### examples:
1. `node index tab_mk 20 ALL true false`
2. `node index tab_mk 7 5 false true false`

# TODO List
- Full support for GraphSidecar
- Video content support
- Download data for each post

Open [new issue](https://github.com/TABmk/instparser/issues/new "new issue") if you want request new features
