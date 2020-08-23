const header = require('./header');
const generateForCommands = require('./generateForCommands');
const generate = (commands) => {
    const ret = []
        .concat(header(commands))
        .concat('## Usage')
        .concat(generateForCommands(commands));

    return ret.join('  \n');
};

module.exports = {
    generate
};
