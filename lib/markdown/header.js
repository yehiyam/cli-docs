const generate = ({ name, description }) => {
    return [
        `# ${name}`,
        description,
        '## install',
        'foo bar'

    ];
};

module.exports = generate;
