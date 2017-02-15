const child_process = require('child_process');
const process = require('process');
const config = require('../package');

module.exports = () => {
    const lastPath = config.publish.lastPath;
    const rmCmd = `RMDIR ${lastPath} /S /Q`;

    child_process.exec(rmCmd,(err,stdout,stderr)=>{
        err && (console.log(err.message) || process.exit());
        console.log('Cancel publish completed!');
    })
}