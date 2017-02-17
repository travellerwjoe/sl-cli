const child_process = require('child_process');
const process = require('process');
const config = require('../package');
const path = require('path');
const fs = require('fs');

module.exports = () => {
    const src = config.publish.src;
    console.log('Watch the file or directory changes...');
    for (let thisSrc of src) {
        fs.watch(thisSrc, {
            recursive: true
        }, (eventType, filename) => {
            if (eventType === "change") {
                console.log();
                console.log(`${filename} has changed.`);
                require('../command/publish')();
            }
        })
    }
}