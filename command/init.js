const process = require('process');
const co = require('co');
const prompt = require('co-prompt');
const password = prompt.password;
const config = require('../package');
const fs = require('fs');
const path = require('path');
const func = require('../utils/func');

module.exports = (ep, opt, val, cmd) => {
    co(function* () {
        !opt && (opt = "idups");
        config.publish = config.publish || {};

        opt === "idups" && console.log('Please input the following config info.');
        if (opt.indexOf('i') >= 0) {
            let ip;
            while (!ip) {
                ip = val
                    ? val
                    : yield prompt('Remote service ip :');
                config.publish.ip = ip;
            }
        }

        if (opt.indexOf('d') >= 0) {
            let dir;
            while (!dir) {
                dir = val
                    ? val
                    : yield prompt('Publish direcoty path:');
                config.publish.dir = dir
            }
        }

        if (opt.indexOf('u') >= 0) {
            let user;
            while (!user) {
                user = val
                    ? val
                    : yield prompt('User account for login:');
                config.publish.user = user
            }
        }

        if (opt.indexOf('p') >= 0) {
            let pass;
            while (!pass) {
                pass = val
                    ? val
                    : yield password('User password for login:');
                config.publish.pass = pass
            }
        }

        if (opt.indexOf('s') >= 0) {
            let src;
            while (!src) {
                src = val
                    ? val
                    : yield prompt('File or direcoty that need to be published (separated by semicolon ";"):');
                config.publish.src = src
                    .split(';')
                    .filter((item, index) => !!item);
            }
        }

        config.publish.publishedPaths = config.publish.publishedPaths || [];

        const filename=path.join(__dirname, '../', 'package.json');
        const content=JSON.stringify(config, null, 4);

        //写入配置到package.json
        yield func.writeFile(filename,content).then(()=>{
            console.log('Done!');
        })

        cmd === "init"
            ? process.exit()
            : ep.emit('inited');
    })
}