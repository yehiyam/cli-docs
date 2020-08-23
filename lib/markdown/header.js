const yargs = require('yargs');
const generate = ({ name, description }) => {
    const installScript = yargs.argv.installTemplate || `npm i -g ${name}`;
    return [
        `# ${name}`,
        description,
        '## install',
        '```shell',
        `${installScript}`,
        '```',
    ];
};

module.exports = generate;
