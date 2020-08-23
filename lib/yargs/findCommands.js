const path = require('path');
const { exec } = require('./exec');
const { isIgnored } = require('./ignore');
const { keywords, lineNumbers } = require('./consts');
const parseCommands = (exeName, helpOutput, command = '') => {
    if (!helpOutput) {
        return [];
    }
    const regex = command ? new RegExp(`${exeName} ${command}\\s(\\w*)\\s`, 'g') : new RegExp(`${exeName}\\s(\\w*)\\s`, 'g');
    const matches = helpOutput.split('\n').slice(lineNumbers.skip).join('\n').matchAll(regex);
    return [...matches].map(x => x[1]);
};

const parseDescription = (helpOutput) => {
    if (!helpOutput) {
        return '';
    }
    const splits = helpOutput.split('\n');
    const commandsIndex = splits.findIndex(l => l.startsWith(keywords.commands) || l.startsWith(keywords.options));
    if (commandsIndex === -1) {
        return '';
    }
    const description = splits.slice(lineNumbers.skip, commandsIndex).filter(l => l);
    return description.join('\n');
};

const parseArgs = (exeName, helpOutput, command = '') => {
    if (!helpOutput) {
        return [];
    }
    const regex = command ? new RegExp(`${exeName} ${command}\\s([<\\[]\\w*[>\\]])\\s([<\\[]w*[>\\]])?\\s([<\\[]\\w*[>\\]])?`, 'g')
        : new RegExp(`${exeName}\\s([<\\[]\\w*[>\\]])\\s([<\\[]\\w*[>\\]])?\\s([<\\[]\\w*[>\\]])?`, 'g');
    const matches = helpOutput.matchAll(regex);
    return [...matches].map(m => ({
        name: m[1].replace(/[<>[\]]/g, ''),
        optional: m[1].startsWith('<')
    }));
};

const parseOptions = (helpOutput) => {
    if (!helpOutput) {
        return '';
    }
    const splits = helpOutput.split('\n');
    const commandsIndex = splits.findIndex(l => l.startsWith(keywords.options) || l.startsWith(keywords.positional));
    if (commandsIndex === -1) {
        return '';
    }
    const optionsLines = splits.slice(commandsIndex + 1, -1);
    const optionsLinesCombined = [];
    let tmpLine = '';
    for (const l of optionsLines) {
        tmpLine += `${l.trim()} `;
        if (l.endsWith(']')) {
            optionsLinesCombined.push(tmpLine);
            tmpLine = '';
        }
    }
    const optionsLinesCombinedSplit = optionsLinesCombined.map(s => s.trim().split(/\s{2,}/));
    const options = optionsLinesCombinedSplit
        .map(s => ({ name: s[0], description: s[1], type: s[2] }))
        .map(s => {
            const val = s;
            if (val.description && val.description.includes('[required]')) {
                val.required = true;
            }
            if (val.type && val.type.includes('[required]')) {
                val.required = true;
                val.type = val.type.replace('[required]', '');
            }
            return val;
        }).map(s => {
            const val = s;
            if (val.description) {
                const defaultValue = val.description.match(/\[default: "?([^"]*)"?\]/);
                if (defaultValue && defaultValue[1]) {
                    [, val.defaultValue] = defaultValue;
                    val.description = val.description.replace(defaultValue[0], '');
                }
            }
            if (val.type) {
                const defaultValue = val.type.match(/\[default: "?([^"]*)"?\]/);
                if (defaultValue && defaultValue[1]) {
                    [, val.defaultValue] = defaultValue;
                    val.type = val.type.replace(defaultValue[0], '');
                }
            }
            return val;
        }).map(s => {
            const val = s;
            if (val.description) {
                const defaultValue = val.description.match(/\[(\w*)\]/);
                if (defaultValue && defaultValue[1]) {
                    [, val.type] = defaultValue;
                    val.description = val.description.replace(defaultValue[0], '');
                }
            }
            if (val.type) {
                const defaultValue = val.type.match(/\[(\w*)\]/);
                if (defaultValue && defaultValue[1]) {
                    [, val.type] = defaultValue;
                }
            }
            return val;
        });

    return options;
};

const runCliHelp = async (args, exePath) => {
    const trimmedArgs = args.trim();
    const cmd = `${path.resolve(exePath)} ${trimmedArgs} --help`;
    const execResults = await exec(cmd);
    const helpOutput = execResults.stdout;
    return helpOutput;
};

const findCommandsRecursive = async (exeName, exePath, args = '') => {
    const commands = {};
    const trimmedArgs = args.trim();
    const helpOutput = await runCliHelp(args, exePath);
    const commandThisLevel = parseCommands(exeName, helpOutput, trimmedArgs).filter(c => !isIgnored(c));
    for (const command of commandThisLevel) {
        if (!commands[command]) {
            commands[command] = {
                command,
                sub: await findCommandsRecursive(exeName, exePath, `${trimmedArgs} ${command}`)
            };
        }
    }
    return commands;
};

module.exports = {
    parseCommands,
    findCommandsRecursive,
    runCliHelp,
    parseDescription,
    parseArgs,
    parseOptions
};
