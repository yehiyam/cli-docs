const header = ['##', '###', '####', '#####'];
const getHeaderLevel = (level) => (level >= header.length ? header[-1] : header[level]);

const getOptions = (commands, rootOptions) => {
    const ret = [];
    if (!commands || !commands.options) {
        return ret;
    }
    const filteredCommands = commands.options.filter(o => !rootOptions || !rootOptions.find(ro => o.name.includes(ro.name)));
    if (!filteredCommands.length) {
        return ret;
    }
    ret.push('Options:  ');
    ret.push('\n');
    ret.push('|option|description|type|required|default|');
    ret.push('|---|---|---|---|---|');
    filteredCommands.forEach(o => {
        ret.push(`|${o.name}|${o.description}|${o.type || ''}|${o.required || ''}|${o.defaultValue || ''}|`);
    });
    return ret;
};

const generate = (commands, prevCommand = '', level = 0, rootOptions = null) => {
    if (!commands) {
        return [];
    }
    const args = commands.args.map(a => `${a.optional ? '<' : '['} ${a.name} ${a.optional ? '>' : ']'}`).join(' ');
    const commandLine = prevCommand ? `${prevCommand} ${commands.name}` : `${commands.name}`;
    let command = [`${getHeaderLevel(level)} ${commands.name}`, level < 2 ? '---' : '', `${commandLine} `.concat(args)];
    command.push(`${commands.description}  `);
    command = command.concat(getOptions(commands, rootOptions));
    commands.subCommands.forEach(c => {
        const sub = generate(c, commandLine, level + 1, rootOptions || commands.options);
        command = command.concat(sub);
    });
    return command;
};

module.exports = generate;
