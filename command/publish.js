const process = require('process');
const moment = require('moment');
const co = require('co');
const config = require('../package');
const fs = require('fs');
const path = require('path');
const func = require('../utils/func');

module.exports = (cmd) => {
    co(function* () {
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

        //执行net命令联通目标计算机
        yield func.exec(netCmd)

        //执行xCopy命令复制文件并将复制目标路径保存至配置中
        yield func.exec(xCopyCmd).then(() => {
            console.log('Publish completed.');
            console.log(`The published path is '${targetPath}'.`)

            config
                .publish
                .publishedPaths
                .push(targetPath);

            const filename = path.join(__dirname, '..', 'package.json');
            const content = JSON.stringify(config, null, 4);

            func.writeFile(filename, content);
        })

        //将目标路径加入剪贴板
        yield func.exec(clipCmd).then(()=>{
            console.log('Path has been clipped.');
        })
    }).catch((err) => {
        err && console.log(err.stack);
    })
}

