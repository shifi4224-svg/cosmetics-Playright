module.exports = {

    capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
            binary: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        }
    },

    suites: [
        {
            name: 'test',
            cases: [
                { path: './Tests/Yazam/Open New Request.js' },
               // { path: './Tests/Yazam/Viewing permissions.js' },
                { path: './Tests/Office process.js' },
            ]
        }
    ],


    modules: ['web', 'log', 'assert']


    
}