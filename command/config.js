const config = require('../package');

module.exports = () => {
    const publishConfig = config.publish;

    publishConfig
        ? console.log(JSON.stringify(publishConfig, null, 4))
        : console.log('Config info is empty.');
}