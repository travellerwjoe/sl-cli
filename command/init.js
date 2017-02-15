const child_process = require('child_process');
const process = require('process');
const co = require('co');
const prompt = require('co-prompt');
const password = prompt.password;
const config = require('../package');
const fs = require('fs');
const path = require('path');

module.exports = (ep, opt, val) => {
    co(function * () {
        !opt && (opt = "idups");
        config.publish = config.publish || {};

        if (opt.indexOf('i') >= 0) {
            let ip;
            while (!ip) {
                ip = val
                    ? val
                    : yield prompt('Please set the service ip :');
                config.publish.ip = ip;
            }
        }

        if (opt.indexOf('d') >= 0) {
            let dir;
            while (!dir) {
                dir = val
                    ? val
                    : yield prompt('Please set the publish direcoty path:');
                config.publish.dir = dir
            }
        }

        if (opt.indexOf('u') >= 0) {
            let user;
            while (!user) {
                user = val
                    ? val
                    : yield prompt('Please set the user account for login:');
                config.publish.user = user
            }
        }

        if (opt.indexOf('p') >= 0) {
            let pass;
            while (!pass) {
                pass = val
                    ? val
                    : yield password('Please set the password for login:');
                config.publish.pass = pass
            }
        }

        if (opt.indexOf('s') >= 0) {
            let src;
            while (!src) {
                src = val
                    ? val
                    : yield prompt('Please set file or direcoty that need to be published (separated by semicolon ";"):');
                config.publish.src = src.split(';');
            }
        }

        config.publish.publishedPaths = config.publish.publishedPaths || [];

        yield Promise.resolve(fs.writeFile(path.join(__dirname, '../', 'package.json'), JSON.stringify(config, null, 4), 'utf8', (err, res) => {
            err && (console.log(err.message) || process.exit());
            console.log('Done!');
            ep.emit('inited');
            // process.exit();
        }))
    })
}