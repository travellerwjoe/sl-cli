const child_process = require('child_process');
const process = require('process');
const config = require('../package');
const path = require('path');
const fs = require('fs');

module.exports = () => {
    const lastPath = config.publish.publishedPaths[config.publish.publishedPaths.length - 1];
    const rmCmd = `RMDIR ${lastPath} /S /Q`;

    child_process.exec(rmCmd, (err, stdout, stderr) => {
        err && (console.log(err.message) || process.exit());
        console.log(`Cancel publish ${lastPath}`);

        config.publish.publishedPaths.pop();
        fs.writeFile(path.join(__dirname, '..', 'package.json'), JSON.stringify(config, null, 4), (err, res) => {
            err && (console.log(err.message) || process.exit());
        })
    })
}