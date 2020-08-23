const { parseCommands, parseDescription, parseArgs, runCliHelp, parseOptions } = require('./findCommands');
const { isIgnored } = require('./ignore');

class Command {
    constructor(name, exeName, exePath) {
        this.name = name;
        this.exeName = exeName;
        this.exePath = exePath;

        this.description = '';
        this.subCommands = [];
        this.args = [];
        this.options = [];
    }

    async generateCommands(args) {
        const trimmedArgs = args.trim();
        const helpOutput = await runCliHelp(args, this.exePath);
        this.description = parseDescription(this.exeName, helpOutput, trimmedArgs);
        this.options = parseOptions(helpOutput);
        this.args = parseArgs(this.exeName, helpOutput, trimmedArgs);
        const commandThisLevel = parseCommands(this.exeName, helpOutput, trimmedArgs).filter(c => !isIgnored(c));
        this.subCommands = await Promise.all(commandThisLevel.map(command => Command.create(command, this.exeName, this.exePath, `${trimmedArgs} ${command}`)));

        for (const command of this.subCommands) {
            this[command.name] = command;
        }
    }

    static async create(name, exeName, exePath, args = '') {
        const command = new Command(name, exeName, exePath);
        await command.generateCommands(args);
        return command;
    }
}

module.exports = Command.create;
