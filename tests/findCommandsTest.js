const { expect } = require('chai');
const fs = require('fs');
const { parseCommands, parseDescription, parseArgs, parseOptions } = require('../lib/yargs/findCommands');
const createCommand = require('../lib/yargs/command');
describe('find tests', () => {
    describe('regex tests', () => {
        it('empty string', () => {
            const helpString = '';
            const res = parseCommands('hkubectl', helpString);
            expect(res).to.have.lengthOf(0);
        });
        it('one line', () => {
            const helpString = 'hkubectl [command]\nhkubectl exec <command>';
            const res = parseCommands('hkubectl', helpString);
            expect(res).to.have.lengthOf(1);
            expect(res[0]).to.eql('exec');
        });
        it('two line', () => {
            const helpString = 'hkubectl [command]\nhkubectl exec <command>\nhkubectl algorithm <command>';
            const res = parseCommands('hkubectl', helpString);
            expect(res).to.have.lengthOf(2);
            expect(res[0]).to.eql('exec');
            expect(res[1]).to.eql('algorithm');
        });
        it('multi line', () => {
            const helpString = fs.readFileSync(`${__dirname}/mocks/text1`, 'utf-8');
            const res = parseCommands('hkubectl', helpString);
            expect(res).to.have.lengthOf(7);
            expect(res[0]).to.eql('exec');
            expect(res[1]).to.eql('algorithm');
        });
        it('no command', () => {
            const helpString = fs.readFileSync(`${__dirname}/mocks/textNoCommand`, 'utf-8');
            const res = parseCommands('hkubectl', helpString);
            expect(res).to.have.lengthOf(0);
        });
        it('no match', () => {
            const helpString = 'foo exec <command>';
            const res = parseCommands('hkubectl', helpString);
            expect(res).to.have.lengthOf(0);
        });
    });
    describe('description', () => {
        it('parse empty', () => {
            const helpString = fs.readFileSync(`${__dirname}/mocks/text1`, 'utf-8');
            const res = parseDescription(helpString);
            expect(res).to.eql('');
        });
        it('parse description', () => {
            const helpString = fs.readFileSync(`${__dirname}/mocks/textCommand`, 'utf-8');
            const res = parseDescription(helpString);
            expect(res).to.eql('Execution pipelines as raw or stored');
        });
        it('parse description no command', () => {
            const helpString = fs.readFileSync(`${__dirname}/mocks/textNoCommand`, 'utf-8');
            const res = parseDescription(helpString);
            expect(res).to.eql('Lists all registered algorithms');
        });
    });
    describe('args', () => {
        it('parse one arg', () => {
            const helpString = fs.readFileSync(`${__dirname}/mocks/textNoCommandArg`, 'utf-8');
            const res = parseArgs('hkubectl', helpString, 'exec get');
            expect(res).to.have.lengthOf(1);
            expect(res[0].name).to.eql('name');
            expect(res[0].optional).to.eql(false);
        });
        it('parse one optional arg', () => {
            const helpString = fs.readFileSync(`${__dirname}/mocks/textNoCommandArgOptional`, 'utf-8');
            const res = parseArgs('hkubectl', helpString, 'exec get');
            expect(res).to.have.lengthOf(1);
            expect(res[0].name).to.eql('name');
            expect(res[0].optional).to.eql(true);
        });
        it('parse no arg', () => {
            const helpString = fs.readFileSync(`${__dirname}/mocks/textNoCommand`, 'utf-8');
            const res = parseArgs('hkubectl', helpString, 'exec get');
            expect(res).to.have.lengthOf(0);
        });
    });
    describe('options', () => {
        it('get options', () => {
            const helpString = fs.readFileSync(`${__dirname}/mocks/textWithOptions`, 'utf-8');
            const options = parseOptions(helpString);
            expect(options).to.exist;
            expect(options).to.have.lengthOf(14);
        });
        it('get options split line', () => {
            const helpString = fs.readFileSync(`${__dirname}/mocks/textWithOptions2`, 'utf-8');
            const options = parseOptions(helpString);
            expect(options).to.exist;
            expect(options).to.have.lengthOf(9);
        });
        it('get options with positional', () => {
            const helpString = fs.readFileSync(`${__dirname}/mocks/textWithPositional`, 'utf-8');
            const options = parseOptions(helpString);
            expect(options).to.exist;
            expect(options).to.have.lengthOf(7);
        });
    });
    describe('recursive tests', () => {
        it('class', async () => {
            const command = await createCommand('root', 'hkubectl', `${__dirname}/mocks/hkubectl`);
            expect(command).to.exist;
        }).timeout(15000);
    });
});
