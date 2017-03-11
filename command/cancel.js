const process = require('process');
const config = require('../package');
const path = require('path');
const co = require('co');
const confirm = require('co-prompt').confirm;
const func = require('../utils/func');

module.exports = () => {
    co(function* () {
        const isOk = yield confirm('Are you sure(y/n)?');
        if (!isOk) {
            process.exit()
        }

        const lastPath = config.publish.publishedPaths[config.publish.publishedPaths.length - 1];
        const rmCmd = `RMDIR ${lastPath} /S /Q`;

        //执行RMDIR命令删除目标路径并删除对应配置中的目标路径
        func.exec(rmCmd).then(() => {
            console.log(`Cancel publish ${lastPath}`);
            config.publish.publishedPaths.pop();

            const filename = path.join(__dirname, '..', 'package.json');
            const content = JSON.stringify(config, null, 4);

            func.writeFile(filename, content)
        })
    })
}