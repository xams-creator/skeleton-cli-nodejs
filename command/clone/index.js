const chalk = require('chalk');
const clone = require('git-clone');
const loading = require('loading-indicator');
const shell = require('shelljs');
const path = require('path');

function execute(repository, project, options) {
    const downloadDir = path.resolve(project);
    // if (fs.existsSync(downloadDir)) {
    //     console.error(chalk.default.redBright('目录已存在!'));
    //     return;
    //     // throw new Error(chalk.default.redBright('目录已存在!'));
    // }
    const dotGitDir = path.join(downloadDir, '.git');
    const timer = loading.start('Loading...');
    console.log(`正在拉取模板代码，下载位置：${downloadDir} ...`);
    console.log(options);
    clone(repository, downloadDir, Object.assign({}, options), (res) => {
        console.log(res);
        if (options.remove) {
            shell.rm('-rf', dotGitDir);
        }
        loading.stop(timer);
        console.log(chalk.default.greenBright('拉取模板结束'));
    });
}

module.exports = async (...args) => {
    return await execute(...args);
};


