const { exec } = require('child_process');
const { promisify } = require('util');
const execSync = promisify(exec);

module.exports = {
    exec: execSync
};
