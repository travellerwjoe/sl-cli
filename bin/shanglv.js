#!/usr/bin/env node

const program = require('commander');
const process = require('process');
const config = require('../package');
const eventproxy = require('eventproxy');

const ep = new eventproxy();
// process.env.NODE_PATH = __dirname + '/../node_modules/'

program.version(config.version);

program
    .command('init')
    .description('Set conifg info before publish')
    .alias('i')
    .action(() => {
        if(program.ip || program.dir || program.user || program.pass) return;
        require('../command/init')(ep);
    })

program
    .command('publish')
    .description('Publish file to server')
    .alias('p')
    .action(() => {
        process.env.OS.indexOf('Windows') < 0 && (console.log('Please ensure that you are using Windows system.') || process.exit());

        ep.on('inited', () => {
            require('../command/publish')()
        })

        if (!config.publish || (!config.publish.ip || !config.publish.dir || !config.publish.user || !config.publish.pass)) {
            require('../command/init')(ep);
            return;
        }
        
        if(program.ip || program.dir || program.user || program.pass) return;
        
        ep.emit('inited');
        
    })

program
    .command('cancel')
    .description('Cancel previous publish')
    .alias('c')
    .action(() => {
        process.env.OS.indexOf('Windows') < 0 && (console.log('Please ensure that you are using Windows system.') || process.exit());

        if(!config.publish||!config.publish.lastPath){
            console.log('You don\'t have any publication');
            return;
        }

        require('../command/cancel')();
    })

program
    .command('config')
    .description('Show config info')
    .action(()=>{
        require('../command/config')();
    })

program
    .option('-i, --ip <ip>', 'set service ip',(ip) => {
        require('../command/init')(ep, 'i', ip);
    })
    .option('-d, --dir <dir>', 'set publish directory',(dir) => {
        require('../command/init')(ep, 'd', dir);
    })
    .option('-u, --user <user>', 'set service login user',(user) => {
        require('../command/init')(ep, 'u', user);
    })
    .option('-p, --pass <pass>', 'set service login password',(pass) => {
        require('../command/init')(ep, 'p', pass);
    })

program
    .on('--help', function() {
        console.log('  Examples:');
        console.log();
        console.log('    $ shanglv init');
        console.log('    $ shanglv publish');
        console.log('    $ shanglv -i 172.17.1.242');
        console.log('    $ shanglv publish -d \\部署文件\\V0050大客户\\CRM');        
        console.log();
    });

if (!process.argv.slice(2).length) {
    program.outputHelp()
}

program.parse(process.argv);