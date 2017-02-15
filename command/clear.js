const child_process = require('child_process');
const process = require('process');
const config = require('../package');
const path = require('path');
const fs = require('fs');

module.exports = (ep) => {
    const publishedPaths = config.publish.publishedPaths;

    ep.after('cleared', publishedPaths.length, () => {
        console.log('Clear all publish completed!');
        config.publish.publishedPaths = [];
        fs.writeFile(path.join(__dirname, '..', 'package.json'), JSON.stringify(config, null, 4), 'utf8', (err, res) => {
            err && (console.log(err.message) || process.exit());
        })
    })

    for (let i = 0; i < publishedPaths.length; i++) {
        const thisPath = publishedPaths[i];
        const rmCmd = `RMDIR ${thisPath} /S /Q`;

        child_process.exec(rmCmd, (err, stdout, stderr) => {
            err && (console.log(err.message) || process.exit());
            console.log(`Clear publish ${thisPath}`);
            ep.emit('cleared');
        })
    }

}