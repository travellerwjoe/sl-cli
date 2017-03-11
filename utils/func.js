const child_process = require('child_process');
const fs = require('fs');

function exec(cmd) {
    return new Promise((resolve, reject) => {
        child_process.exec(cmd, (err, stdout, stderr) => {
            err && (console.log(err.message) || process.exit());
            resolve()
        })
    })
}

function writeFile(filename, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, content, 'utf8', (err, res) => {
            err && (console.log(err.message) || process.exit());
            resolve();
        })
    })
}


module.exports = {
    exec,
    writeFile
}