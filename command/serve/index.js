function execute(options) {
    console.log(options);
}

module.exports = async (...args) => {
    return await execute(...args);
};


