const child_process = require('child_process');
const process = require('process');
const moment = require('moment');
const co = require('co');
const config = require('../package');
const fs = require('fs');
const path = require('path');

module.exports = () => {
    co(function * () {
        const ip = config.publish.ip;
        const dir = config.publish.dir;
        const user = config.publish.user;
        const pass = config.publish.pass;

        const now = moment().format('YYYYMMDDHHmmss');
        const netCmd = `net use \\\\${ip} ${pass} /user:${user}`;
        const targetPath = '\\\\' + path.join(ip, dir, now);
        const xCopyCmd = `echo d | xcopy dist ${targetPath}\\dist\\ /Y /E & echo f | xcopy index_prod.html ${targetPath}\\index_prod.html /Y`;
        const clipCmd = `echo ${targetPath}|clip`;

        yield Promise.resolve(child_process.exec(netCmd, (err, stdout, stderr) => {
            err && (console.log(err.message) || process.exit());
        }))
        yield Promise.resolve(child_process.exec(xCopyCmd, (err, stdout, stderr) => {
            err && (console.log(err.message) || process.exit());
            console.log('Publish completed.');
            console.log(`The published path is '${targetPath}'.`)

            config.publish.lastPath = targetPath;
            fs.writeFile(path.join(__dirname, '..', 'package.json'), JSON.stringify(config, null, 4), 'utf8', (err, res) => {
                err && (console.log(err.message) || process.exit());
            })
        }))
        yield Promise.resolve(child_process.exec(clipCmd, (err, stdout, stderr) => {
            err && (console.log(err.message) || process.exit());
            console.log('Path has been clipped.');
        }))
    }).catch((err) => {
        err && console.log(err.stack);
    })
}