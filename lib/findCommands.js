const path = require('path');
const { exec } = require('./exec');
const { isIgnored } = require('./ignore');
const { keywords, lineNumbers } = require('./consts');
const parseCommands = (exeName, helpOutput, command = '') => {
    if (!helpOutput) {
        return [];
    }
    const regex = command ? new RegExp(`${exeName} ${command}\\s(\\w*)\\s`, 'g') : new RegExp(`${exeName}\\s(\\w*)\\s`, 'g')
    const matches = helpOutput.split("\n").slice(lineNumbers.skip).join("\n").matchAll(regex);
    return [...matches].map(x => x[1])
}

const parseDescription = (exeName, helpOutput, command = '') => {
    if (!helpOutput) {
        return '';
    }
    const splits = helpOutput.split("\n");
    const commandsIndex = splits.findIndex(l => l.startsWith(keywords.commands) || l.startsWith(keywords.options));
    if (commandsIndex === -1) {
        return '';
    }
    const description = splits.slice(lineNumbers.skip, commandsIndex).filter(l => l);
    return description.join('\n');
}

const parseArgs = (exeName, helpOutput, command = '') => {
    if (!helpOutput) {
        return [];
    }
    // ([<\[]\w*[>\]]) ([<\[]\w*[>\]])? ([<\[]\w*[>\]])?
    const regex = command ? new RegExp(`${exeName} ${command}\\s([<\\[]\\w*[>\\]])\\s([<\\[]\w*[>\\]])?\\s([<\\[]\\w*[>\\]])?`, 'g') 
            : new RegExp(`${exeName}\\s([<\\[]\\w*[>\\]])\\s([<\\[]\\w*[>\\]])?\\s([<\\[]\\w*[>\\]])?`, 'g')
    const matches = helpOutput.matchAll(regex);
    return [...matches].map(m=>({
        name: m[1].replace(/[<>\[\]]/g,''),
        optional: m[1].startsWith('<')
    }))

}
const runCliHelp = async (args, exePath) => {
    const trimmedArgs = args.trim()
    console.log(`handling ${trimmedArgs}`);
    const cmd = `${path.resolve(exePath)} ${trimmedArgs} --help`;
    const execResults = await exec(cmd);
    const helpOutput = execResults.stdout;
    return helpOutput;
}

const findCommandsRecursive = async (exeName, exePath, args = '') => {
    const commands = {};
    const trimmedArgs = args.trim()
    const helpOutput = await runCliHelp(args, exePath);
    const commandThisLevel = parseCommands(exeName, helpOutput, trimmedArgs).filter(c => !isIgnored(c));
    for (let command of commandThisLevel) {
        if (commands[command]) {
            continue;
        }
        commands[command] = {
            command,
            sub: await findCommandsRecursive(exeName, exePath, `${trimmedArgs} ${command}`)
        }
    }
    return commands;

}

module.exports = {
    parseCommands,
    findCommandsRecursive,
    runCliHelp,
    parseDescription,
    parseArgs
}


