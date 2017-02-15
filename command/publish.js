const child_process = require('child_process');
const process = require('process');
const moment = require('moment');
const co = require('co');
const config = require('../package');
const fs = require('fs');
const path = require('path');

module.exports = () => {
    co(function * () {
        const cwd = process.cwd();

        const ip = config.publish.ip;
        const dir = config.publish.dir;
        const user = config.publish.user;
        const pass = config.publish.pass;
        let src = config.publish.src;

        const now = moment().format('YYYYMMDDHHmmss');
        const netCmd = `net use \\\\${ip} ${pass} /user:${user}`;
        const targetPath = '\\\\' + path.join(ip, dir, now);
        const clipCmd = `echo ${targetPath}|clip`;

        if (src.indexOf('*') >= 0) {
            src = fs
                .readdirSync(cwd)
                .filter((item, index) => !item.startsWith('.') && !item.startsWith('node_modules'))
                .map((item, index) => {
                    const stat = fs.statSync(path.resolve(cwd, item));
                    if (stat.isDirectory()) {
                        return item + '/';
                    } else {
                        return item;
                    }
                });

        }

        const xCopyCmd = src.map((item, index) => {
            item = item.trim();
            item = item.endsWith('/')
                ? item.replace('/', '')
                : item;
            const thisPath = path.resolve(cwd, item);
            const isExist = fs.existsSync(thisPath);
            if (!isExist) {
                console.log(`${thisPath} is not be found.`);
                process.exit();
            }
            const stat = fs.statSync(thisPath);
            const isDir = stat.isDirectory();


            const symbol = isDir
                ? 'd'
                : 'f';
            const finalPath = path.join(targetPath, item);

            return `echo ${symbol} | xcopy ${item} ${finalPath} /Y ${isDir
                    ? '/E'
                    : ''}`
        }).join(' & ');

        // } else { } return; xCopyCmd = `echo d | xcopy dist ${targetPath}\\dist\\ /Y
        // /E & echo f | xcopy index_prod.html ${targetPath}\\index_prod.html /Y`;

        yield Promise.resolve(child_process.exec(netCmd, (err, stdout, stderr) => {
            err && (console.log(err.message) || process.exit());
        }))

        yield Promise.resolve(child_process.exec(xCopyCmd, (err, stdout, stderr) => {
            err && (console.log(err.message) || process.exit());
            console.log('Publish completed.');
            console.log(`The published path is '${targetPath}'.`)

            config
                .publish
                .publishedPaths
                .push(targetPath);
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