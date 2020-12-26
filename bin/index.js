#!/usr/bin/env node

const chalk = require('chalk');
const semver = require('semver');
const figlet = require('figlet');

const config = require('../package.json');
const requiredVersion = config.engines.node;

const packageDir = require('pkg-dir');
const updateNotifier = require('update-notifier');
const path = require('path');

// 1.检查node版本
const checkNodeVersion = (wanted, id) => {
    if (!semver.satisfies(process.version, wanted)) {
        console.log(chalk.red(
            'You are using Node ' + process.version + ', but this version of ' + id +
            ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
        ));
        process.exit(1);
    }
};
checkNodeVersion(requiredVersion, config.name);

// 2.构建cli
const program = require('commander');

program
    .version(config.version, '-v,--version')
    .description(config.description)
    .usage('<command> [options]');

program
    .command('serve')
    .description('start current project')
    .option('-p, --port <value>', 'set default port')
    .option('-o, --open', 'open browser ? ')
    .action((cmd) => {
        require('../command/serve')(cleanArgs(cmd));
    });

program
    .command('clone <repository> <path>')
    .option('-c, --checkout <branch>', 'download by checkout branch ')
    .option('-r, --remove', 'remove the .git dir ? ')
    .description('generate a project from a remote template =>  ')
    .action((repository, path, cmd) => {
        require('../command/clone')(repository, path, cleanArgs(cmd));
    });

program
    .command('info')
    .description('print debugging information about your environment')
    .action(() => {
        console.log(chalk.bold('Environment Info:'));
        require('envinfo').run(
            {
                System: ['OS', 'CPU', 'Memory', 'Shell'],
                Binaries: ['Node', 'Yarn', 'npm'],
                Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
                Managers: ['Gradle'],
                Utilities: ['Git'],
                Languages: ['Java', 'Groovy']
            },
            {
                showNotFound: true,
                duplicates: true,
                fullTree: true
            }
        ).then(console.log);
    });

// 当执行位置命令时触发
program
    .arguments('<command>')
    .action((cmd) => {
        program.outputHelp();
        console.log('  ' + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
        console.log();
    });

// 当执行 --help 时触发
program.on('--help', () => {
    console.log();
    console.log(`  Run ${chalk.cyan('xams <command> --help')} for detailed usage of given command.`);
    console.log();
});

program.commands.forEach(c => c.on('--help', () => console.log()));

program.parse(process.argv);

// 3.输出art和输出帮助选项
const outputArt = () => {
    const art = figlet.textSync(config.name);
    console.log(chalk.blue(art));
};

if (!process.argv.slice(2).length) {
    outputArt();
    program.outputHelp();
}

// 4.检查package包版本号
const packagePath = packageDir.sync(__dirname);
const packageJsonFilePath = path.join(packagePath, 'package.json');
const packageJson = require(packageJsonFilePath);
updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 0
}).notify();


// 5.打印未捕获异常
process.on('uncaughtException', (err, origin) => {
    console.error(err);
    require('fs').writeSync(
        process.stderr.fd,
        `
    Exception: [${err}],
    Source: [${origin}]
        `,
        0,
        'utf8'
    );
});

// ========== 帮助方法 ======== //

function camelize(str) {
    return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '');
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd) {
    const args = {};
    cmd.options.forEach(o => {
        const key = camelize(o.long.replace(/^--/, ''));
        // if an option is not present and Command has a method with the same name
        // it should not be copied
        if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
            args[key] = cmd[key];
        }
    });
    return args;
}

// console.log(process.env)





