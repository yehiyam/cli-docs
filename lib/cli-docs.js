const yargs = require('yargs');
const path = require('path');
const fs = require('fs/promises');
const createCommand = require('./yargs/command');
const markdown = require('./markdown');
const { argv } = yargs.options('path', {
    demandOption: 'Please specify the path to the cli --path',
    describe: 'path to the cli executable',
    type: 'string'
}).options('name', {
    describe: 'real name of the cli. If omitted, the name of the executable is used',
    type: 'string',
}).options('output', {
    describe: 'the output file.',
    type: 'string',
    alias: ['o'],
    default: './Readme.md'
}).help();

const main = async () => {
    try {
        const name = argv.name || path.basename(argv.path);
        const command = await createCommand(name, name, path.resolve(argv.path));
        const out = markdown.generate(command);
        await fs.writeFile(argv.output, out, 'utf-8');
    }
    catch (error) {
        console.log(error.message);
    }
};

module.exports = main;
